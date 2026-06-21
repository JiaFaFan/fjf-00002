export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
};

export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const isSkinTone = (r: number, g: number, b: number): boolean => {
  return r > g && g > b && r > 95 && g > 40 && b > 20 && r - g > 15;
};

export const generateBrightnessLUT = (value: number): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256);
  const offset = Math.round(value * 2.55);
  for (let i = 0; i < 256; i++) {
    lut[i] = clamp(i + offset, 0, 255);
  }
  return lut;
};

export const generateExposureLUT = (value: number): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256);
  const factor = Math.pow(2, value / 50);
  for (let i = 0; i < 256; i++) {
    lut[i] = clamp(Math.round(i * factor), 0, 255);
  }
  return lut;
};

export const generateContrastLUT = (value: number): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256);
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  for (let i = 0; i < 256; i++) {
    lut[i] = clamp(Math.round(factor * (i - 128) + 128), 0, 255);
  }
  return lut;
};

export const generateTemperatureLUT = (
  value: number
): { r: Uint8ClampedArray; g: Uint8ClampedArray; b: Uint8ClampedArray } => {
  const rLut = new Uint8ClampedArray(256);
  const gLut = new Uint8ClampedArray(256);
  const bLut = new Uint8ClampedArray(256);

  const tempFactor = value / 100;
  const rOffset = Math.round(tempFactor * 40);
  const bOffset = Math.round(-tempFactor * 40);

  for (let i = 0; i < 256; i++) {
    rLut[i] = clamp(i + rOffset, 0, 255);
    gLut[i] = i;
    bLut[i] = clamp(i + bOffset, 0, 255);
  }

  return { r: rLut, g: gLut, b: bLut };
};
