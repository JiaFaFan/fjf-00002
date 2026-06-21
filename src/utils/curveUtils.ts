import type { Point } from '../types';
import { clamp } from './colorMath';

export const generateCurveLUT = (points: Point[]): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256);
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  for (let x = 0; x < 256; x++) {
    if (sortedPoints.length === 0) {
      lut[x] = x;
      continue;
    }

    if (x <= sortedPoints[0].x) {
      lut[x] = sortedPoints[0].y;
      continue;
    }

    if (x >= sortedPoints[sortedPoints.length - 1].x) {
      lut[x] = sortedPoints[sortedPoints.length - 1].y;
      continue;
    }

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p1 = sortedPoints[i];
      const p2 = sortedPoints[i + 1];

      if (x >= p1.x && x <= p2.x) {
        const t = (x - p1.x) / (p2.x - p1.x);
        lut[x] = Math.round(p1.y + t * (p2.y - p1.y));
        break;
      }
    }
  }

  return lut;
};

export const combineLUTs = (
  luts: Uint8ClampedArray[],
  channelLuts: {
    r: Uint8ClampedArray;
    g: Uint8ClampedArray;
    b: Uint8ClampedArray;
  }
): { r: Uint8ClampedArray; g: Uint8ClampedArray; b: Uint8ClampedArray } => {
  const rLut = new Uint8ClampedArray(256);
  const gLut = new Uint8ClampedArray(256);
  const bLut = new Uint8ClampedArray(256);

  for (let i = 0; i < 256; i++) {
    let r = i;
    let g = i;
    let b = i;

    for (const lut of luts) {
      r = lut[r];
      g = lut[g];
      b = lut[b];
    }

    r = channelLuts.r[r];
    g = channelLuts.g[g];
    b = channelLuts.b[b];

    rLut[i] = clamp(r, 0, 255);
    gLut[i] = clamp(g, 0, 255);
    bLut[i] = clamp(b, 0, 255);
  }

  return { r: rLut, g: gLut, b: bLut };
};

export const addCurvePoint = (points: Point[], x: number, y: number): Point[] => {
  const newPoints = [...points, { x: clamp(x, 0, 255), y: clamp(y, 0, 255) }];
  return newPoints.sort((a, b) => a.x - b.x);
};

export const removeCurvePoint = (points: Point[], index: number): Point[] => {
  if (points.length <= 2) return points;
  return points.filter((_, i) => i !== index);
};

export const updateCurvePoint = (
  points: Point[],
  index: number,
  x: number,
  y: number
): Point[] => {
  const newPoints = [...points];
  newPoints[index] = {
    x: clamp(x, 0, 255),
    y: clamp(y, 0, 255),
  };
  return newPoints.sort((a, b) => a.x - b.x);
};

export const findNearestPointIndex = (
  points: Point[],
  x: number,
  y: number,
  threshold = 10
): number => {
  let nearestIndex = -1;
  let minDist = Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearestIndex = i;
    }
  }

  return nearestIndex;
};
