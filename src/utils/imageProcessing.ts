import type { AdjustmentParams, CurvePoints, HistogramData } from '../types';
import {
  generateBrightnessLUT,
  generateExposureLUT,
  generateContrastLUT,
  generateTemperatureLUT,
  rgbToHsl,
  hslToRgb,
  isSkinTone,
  clamp,
} from './colorMath';
import { generateCurveLUT, combineLUTs } from './curveUtils';

export const buildMasterLUT = (
  params: AdjustmentParams,
  curves: CurvePoints
): { r: Uint8ClampedArray; g: Uint8ClampedArray; b: Uint8ClampedArray } => {
  const brightnessLUT = generateBrightnessLUT(params.brightness);
  const exposureLUT = generateExposureLUT(params.exposure);
  const contrastLUT = generateContrastLUT(params.contrast);
  const temperatureLUTs = generateTemperatureLUT(params.temperature);

  const rgbCurveLUT = generateCurveLUT(curves.rgb);
  const rCurveLUT = generateCurveLUT(curves.r);
  const gCurveLUT = generateCurveLUT(curves.g);
  const bCurveLUT = generateCurveLUT(curves.b);

  const baseLUTs = combineLUTs(
    [brightnessLUT, exposureLUT, contrastLUT, rgbCurveLUT],
    temperatureLUTs
  );

  const finalR = new Uint8ClampedArray(256);
  const finalG = new Uint8ClampedArray(256);
  const finalB = new Uint8ClampedArray(256);

  for (let i = 0; i < 256; i++) {
    finalR[i] = rCurveLUT[baseLUTs.r[i]];
    finalG[i] = gCurveLUT[baseLUTs.g[i]];
    finalB[i] = bCurveLUT[baseLUTs.b[i]];
  }

  return { r: finalR, g: finalG, b: finalB };
};

export const applyAdjustments = (
  originalImageData: ImageData,
  lut: { r: Uint8ClampedArray; g: Uint8ClampedArray; b: Uint8ClampedArray },
  params: AdjustmentParams,
  filterIntensity: number = 100
): ImageData => {
  const data = new Uint8ClampedArray(originalImageData.data);
  const saturationFactor = 1 + params.saturation / 100;
  const vibranceAmount = params.vibrance / 100;
  const intensity = clamp(filterIntensity, 0, 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    const origR = originalImageData.data[i];
    const origG = originalImageData.data[i + 1];
    const origB = originalImageData.data[i + 2];

    let r = lut.r[origR];
    let g = lut.g[origG];
    let b = lut.b[origB];

    if (params.saturation !== 0) {
      const [h, s, l] = rgbToHsl(r, g, b);
      const newS = clamp(s * saturationFactor, 0, 100);
      [r, g, b] = hslToRgb(h, newS, l);
    }

    if (params.vibrance !== 0) {
      const [h, s, l] = rgbToHsl(r, g, b);
      const isSkin = isSkinTone(r, g, b);
      const sNorm = s / 100;
      const protectionFactor = isSkin ? 0.3 + sNorm * 0.7 : sNorm;
      const adjustment = vibranceAmount * (1 - protectionFactor);
      const newS = clamp(s + adjustment * 100, 0, 100);
      [r, g, b] = hslToRgb(h, newS, l);
    }

    if (intensity < 1) {
      r = Math.round(origR + (r - origR) * intensity);
      g = Math.round(origG + (g - origG) * intensity);
      b = Math.round(origB + (b - origB) * intensity);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  return new ImageData(data, originalImageData.width, originalImageData.height);
};

export const calculateHistogram = (imageData: ImageData): HistogramData => {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  let shadowsClipping = 0;
  let highlightsClipping = 0;

  const data = imageData.data;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const rv = data[i];
    const gv = data[i + 1];
    const bv = data[i + 2];

    r[rv]++;
    g[gv]++;
    b[bv]++;

    if (rv === 0 && gv === 0 && bv === 0) shadowsClipping++;
    if (rv === 255 && gv === 255 && bv === 255) highlightsClipping++;
  }

  const maxVal = Math.max(Math.max(...r), Math.max(...g), Math.max(...b));

  for (let i = 0; i < 256; i++) {
    r[i] = r[i] / maxVal;
    g[i] = g[i] / maxVal;
    b[i] = b[i] / maxVal;
  }

  return {
    r,
    g,
    b,
    shadowsClipping: (shadowsClipping / totalPixels) * 100,
    highlightsClipping: (highlightsClipping / totalPixels) * 100,
  };
};
