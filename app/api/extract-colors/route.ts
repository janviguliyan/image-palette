import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// --- K-Means Color Clustering ---

type Pixel = [number, number, number];

function colorDistance(a: Pixel, b: Pixel): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function initCentroids(pixels: Pixel[], k: number): Pixel[] {
  // Pick evenly-spaced pixels as initial centroids for reproducibility
  const step = Math.max(1, Math.floor(pixels.length / k));
  return Array.from({ length: k }, (_, i) => [...pixels[i * step]] as Pixel);
}

function kMeans(pixels: Pixel[], k: number, maxIter = 25): Pixel[] {
  let centroids = initCentroids(pixels, k);
  let assignments: number[] = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assignment step
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      let minDist = Infinity;
      let best = 0;
      for (let j = 0; j < k; j++) {
        const d = colorDistance(pixels[i], centroids[j]);
        if (d < minDist) {
          minDist = d;
          best = j;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }
    if (!changed) break;

    // Update step
    for (let j = 0; j < k; j++) {
      const cluster = pixels.filter((_, i) => assignments[i] === j);
      if (cluster.length > 0) {
        centroids[j] = [
          Math.round(cluster.reduce((s, p) => s + p[0], 0) / cluster.length),
          Math.round(cluster.reduce((s, p) => s + p[1], 0) / cluster.length),
          Math.round(cluster.reduce((s, p) => s + p[2], 0) / cluster.length),
        ];
      }
    }
  }

  // Sort by cluster size (most dominant first)
  const clusterSizes = centroids.map(
    (_, j) => assignments.filter((a) => a === j).length
  );
  const sorted = centroids
    .map((c, j) => ({ color: c, size: clusterSizes[j] }))
    .sort((a, b) => b.size - a.size)
    .map((x) => x.color);

  return sorted;
}

function toHex(pixel: Pixel): string {
  return (
    "#" + pixel.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")
  );
}

// --- Route Handler ---

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported format. Please use JPG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize to 120x120 for fast processing while preserving color distribution
    const { data, info } = await sharp(buffer)
      .resize(120, 120, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Build pixel array, skip near-white and near-black outliers for better palette
    const pixels: Pixel[] = [];
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Skip very dark / very light pixels to avoid boring blacks/whites dominating
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness > 15 && brightness < 240) {
        pixels.push([r, g, b]);
      }
    }

    // Fallback: if image is predominantly dark/light, include all pixels
    const allPixels: Pixel[] = [];
    if (pixels.length < 200) {
      for (let i = 0; i < data.length; i += info.channels) {
        allPixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }

    const source = pixels.length >= 200 ? pixels : allPixels;

    // Sample for performance (max 800 pixels for k-means)
    const sampleStep = Math.max(1, Math.floor(source.length / 800));
    const sample = source.filter((_, i) => i % sampleStep === 0);

    const dominantColors = kMeans(sample, 6, 30);
    const hexColors = dominantColors.map(toHex);

    return NextResponse.json({ colors: hexColors });
  } catch (err) {
    console.error("Color extraction error:", err);
    return NextResponse.json(
      { error: "Failed to process image. Please try another file." },
      { status: 500 }
    );
  }
}
