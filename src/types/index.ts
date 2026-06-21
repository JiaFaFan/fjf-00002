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

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  params: AdjustmentParams;
  curves: CurvePoints;
  isCustom?: boolean;
}

export const SLIDER_CONFIGS = [
  { key: 'brightness', label: '亮度', min: -100, max: 100, step: 1, icon: 'Sun' },
  { key: 'exposure', label: '曝光度', min: -100, max: 100, step: 1, icon: 'Aperture' },
  { key: 'contrast', label: '对比度', min: -100, max: 100, step: 1, icon: 'Contrast' },
  { key: 'temperature', label: '色温', min: -100, max: 100, step: 1, icon: 'Thermometer' },
  { key: 'vibrance', label: '自然饱和度', min: -100, max: 100, step: 1, icon: 'Droplets' },
  { key: 'saturation', label: '饱和度', min: -100, max: 100, step: 1, icon: 'Palette' },
] as const;

export type AdjustmentKey = (typeof SLIDER_CONFIGS)[number]['key'];

export const BUILTIN_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: '原图',
    description: '不做任何调整',
    icon: '⚪',
    params: { brightness: 0, exposure: 0, contrast: 0, temperature: 0, saturation: 0, vibrance: 0 },
    curves: JSON.parse(JSON.stringify(DEFAULT_CURVES)),
  },
  {
    id: 'bw',
    name: '经典黑白',
    description: '高对比黑白质感',
    icon: '⚫',
    params: { brightness: 0, exposure: 0, contrast: 25, temperature: 0, saturation: -100, vibrance: -100 },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 60, y: 40 }, { x: 128, y: 128 }, { x: 195, y: 215 }, { x: 255, y: 255 }],
      r: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      g: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      b: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    },
  },
  {
    id: 'vintage',
    name: '复古胶片',
    description: '褪色泛黄胶片感',
    icon: '🎞️',
    params: { brightness: -5, exposure: 0, contrast: -15, temperature: 20, saturation: -20, vibrance: -10 },
    curves: {
      rgb: [{ x: 0, y: 15 }, { x: 60, y: 70 }, { x: 128, y: 145 }, { x: 200, y: 210 }, { x: 255, y: 240 }],
      r: [{ x: 0, y: 10 }, { x: 128, y: 140 }, { x: 255, y: 245 }],
      g: [{ x: 0, y: 5 }, { x: 128, y: 130 }, { x: 255, y: 235 }],
      b: [{ x: 0, y: 0 }, { x: 128, y: 115 }, { x: 255, y: 220 }],
    },
  },
  {
    id: 'japanese',
    name: '日系清新',
    description: '淡雅低对比青色调',
    icon: '🌸',
    params: { brightness: 10, exposure: 8, contrast: -15, temperature: -8, saturation: -10, vibrance: 5 },
    curves: {
      rgb: [{ x: 0, y: 20 }, { x: 64, y: 75 }, { x: 128, y: 140 }, { x: 192, y: 205 }, { x: 255, y: 245 }],
      r: [{ x: 0, y: 15 }, { x: 128, y: 125 }, { x: 255, y: 240 }],
      g: [{ x: 0, y: 20 }, { x: 128, y: 138 }, { x: 255, y: 248 }],
      b: [{ x: 0, y: 25 }, { x: 128, y: 148 }, { x: 255, y: 252 }],
    },
  },
  {
    id: 'cinematic',
    name: '电影质感',
    description: '青橙色调高动态',
    icon: '🎬',
    params: { brightness: -5, exposure: 0, contrast: 15, temperature: 10, saturation: 10, vibrance: 15 },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 50, y: 30 }, { x: 128, y: 128 }, { x: 205, y: 225 }, { x: 255, y: 255 }],
      r: [{ x: 0, y: 0 }, { x: 100, y: 95 }, { x: 200, y: 215 }, { x: 255, y: 255 }],
      g: [{ x: 0, y: 0 }, { x: 128, y: 122 }, { x: 255, y: 248 }],
      b: [{ x: 0, y: 5 }, { x: 128, y: 138 }, { x: 255, y: 250 }],
    },
  },
  {
    id: 'lomo',
    name: 'Lomo暗角',
    description: '浓郁色彩暗角效果',
    icon: '📷',
    params: { brightness: -5, exposure: 5, contrast: 20, temperature: 15, saturation: 25, vibrance: 20 },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 45, y: 25 }, { x: 128, y: 135 }, { x: 210, y: 230 }, { x: 255, y: 255 }],
      r: [{ x: 0, y: 0 }, { x: 128, y: 142 }, { x: 255, y: 255 }],
      g: [{ x: 0, y: 0 }, { x: 128, y: 130 }, { x: 255, y: 250 }],
      b: [{ x: 0, y: 0 }, { x: 128, y: 120 }, { x: 255, y: 240 }],
    },
  },
  {
    id: 'vivid',
    name: '高对比鲜艳',
    description: '浓郁饱满色彩',
    icon: '🎨',
    params: { brightness: 5, exposure: 0, contrast: 30, temperature: 5, saturation: 40, vibrance: 30 },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 55, y: 35 }, { x: 128, y: 128 }, { x: 200, y: 220 }, { x: 255, y: 255 }],
      r: [{ x: 0, y: 0 }, { x: 128, y: 148 }, { x: 255, y: 255 }],
      g: [{ x: 0, y: 0 }, { x: 128, y: 142 }, { x: 255, y: 255 }],
      b: [{ x: 0, y: 0 }, { x: 128, y: 138 }, { x: 255, y: 255 }],
    },
  },
  {
    id: 'soft',
    name: '柔光人像',
    description: '柔美低对比暖调',
    icon: '✨',
    params: { brightness: 15, exposure: 10, contrast: -20, temperature: 12, saturation: -5, vibrance: 10 },
    curves: {
      rgb: [{ x: 0, y: 25 }, { x: 64, y: 85 }, { x: 128, y: 150 }, { x: 192, y: 210 }, { x: 255, y: 245 }],
      r: [{ x: 0, y: 30 }, { x: 128, y: 155 }, { x: 255, y: 250 }],
      g: [{ x: 0, y: 25 }, { x: 128, y: 148 }, { x: 255, y: 245 }],
      b: [{ x: 0, y: 20 }, { x: 128, y: 142 }, { x: 255, y: 240 }],
    },
  },
  {
    id: 'cold',
    name: '冷调蓝调',
    description: '清冷蓝调高级感',
    icon: '❄️',
    params: { brightness: 0, exposure: 5, contrast: 10, temperature: -25, saturation: -5, vibrance: 10 },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 64, y: 55 }, { x: 128, y: 128 }, { x: 192, y: 200 }, { x: 255, y: 255 }],
      r: [{ x: 0, y: 0 }, { x: 128, y: 115 }, { x: 255, y: 235 }],
      g: [{ x: 0, y: 0 }, { x: 128, y: 128 }, { x: 255, y: 248 }],
      b: [{ x: 0, y: 10 }, { x: 128, y: 148 }, { x: 255, y: 255 }],
    },
  },
  {
    id: 'noir',
    name: '暗色低光',
    description: '暗调低饱和质感',
    icon: '🌑',
    params: { brightness: -15, exposure: -10, contrast: 15, temperature: -5, saturation: -40, vibrance: -30 },
    curves: {
      rgb: [{ x: 0, y: 0 }, { x: 70, y: 30 }, { x: 128, y: 100 }, { x: 200, y: 180 }, { x: 255, y: 235 }],
      r: [{ x: 0, y: 0 }, { x: 128, y: 95 }, { x: 255, y: 230 }],
      g: [{ x: 0, y: 0 }, { x: 128, y: 102 }, { x: 255, y: 235 }],
      b: [{ x: 0, y: 0 }, { x: 128, y: 108 }, { x: 255, y: 238 }],
    },
  },
];
