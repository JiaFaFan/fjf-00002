export interface Point {
  x: number;
  y: number;
}

export interface AdjustmentParams {
  brightness: number;
  exposure: number;
  contrast: number;
  temperature: number;
  saturation: number;
  vibrance: number;
}

export interface CurvePoints {
  rgb: Point[];
  r: Point[];
  g: Point[];
  b: Point[];
}

export type CurveChannel = 'rgb' | 'r' | 'g' | 'b';

export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  shadowsClipping: number;
  highlightsClipping: number;
}

export interface EditorState {
  params: AdjustmentParams;
  curves: CurvePoints;
  activeChannel: CurveChannel;
  imageLoaded: boolean;
  originalImage: HTMLImageElement | null;
  originalImageData: ImageData | null;
  fileInfo: { name: string; size: number; width: number; height: number } | null;
}

export interface HistoryState {
  past: Array<{ params: AdjustmentParams; curves: CurvePoints }>;
  future: Array<{ params: AdjustmentParams; curves: CurvePoints }>;
}

export const DEFAULT_PARAMS: AdjustmentParams = {
  brightness: 0,
  exposure: 0,
  contrast: 0,
  temperature: 0,
  saturation: 0,
  vibrance: 0,
};

export const DEFAULT_CURVES: CurvePoints = {
  rgb: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
  r: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
  g: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
  b: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
};

export const CURVE_PRESETS: Record<string, CurvePoints> = {
  neutral: DEFAULT_CURVES,
  sCurve: {
    rgb: [
      { x: 0, y: 0 },
      { x: 64, y: 50 },
      { x: 128, y: 128 },
      { x: 191, y: 205 },
      { x: 255, y: 255 },
    ],
    r: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
    g: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
    b: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
  },
  film: {
    rgb: [
      { x: 0, y: 20 },
      { x: 60, y: 80 },
      { x: 140, y: 160 },
      { x: 200, y: 220 },
      { x: 255, y: 245 },
    ],
    r: [
      { x: 0, y: 0 },
      { x: 128, y: 135 },
      { x: 255, y: 255 },
    ],
    g: [
      { x: 0, y: 0 },
      { x: 128, y: 130 },
      { x: 255, y: 250 },
    ],
    b: [
      { x: 0, y: 5 },
      { x: 128, y: 122 },
      { x: 255, y: 245 },
    ],
  },
};

export const SLIDER_CONFIGS = [
  { key: 'brightness', label: '亮度', min: -100, max: 100, step: 1, icon: 'Sun' },
  { key: 'exposure', label: '曝光度', min: -100, max: 100, step: 1, icon: 'Aperture' },
  { key: 'contrast', label: '对比度', min: -100, max: 100, step: 1, icon: 'Contrast' },
  { key: 'temperature', label: '色温', min: -100, max: 100, step: 1, icon: 'Thermometer' },
  { key: 'vibrance', label: '自然饱和度', min: -100, max: 100, step: 1, icon: 'Droplets' },
  { key: 'saturation', label: '饱和度', min: -100, max: 100, step: 1, icon: 'Palette' },
] as const;

export type AdjustmentKey = (typeof SLIDER_CONFIGS)[number]['key'];
