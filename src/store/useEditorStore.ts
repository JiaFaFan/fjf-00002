import { create } from 'zustand';
import { produce } from 'immer';
import type {
  AdjustmentParams,
  CurvePoints,
  CurveChannel,
  Point,
} from '../types';
import { DEFAULT_PARAMS, DEFAULT_CURVES } from '../types';

const MAX_HISTORY = 20;

interface EditorStore {
  params: AdjustmentParams;
  curves: CurvePoints;
  activeChannel: CurveChannel;
  originalImage: HTMLImageElement | null;
  originalImageData: ImageData | null;
  fileInfo: { name: string; size: number; width: number; height: number } | null;
  showOriginal: boolean;
  past: Array<{ params: AdjustmentParams; curves: CurvePoints }>;
  future: Array<{ params: AdjustmentParams; curves: CurvePoints }>;
  isDragging: boolean;

  setParam: (key: keyof AdjustmentParams, value: number) => void;
  setCurve: (channel: CurveChannel, points: Point[]) => void;
  setActiveChannel: (channel: CurveChannel) => void;
  setImage: (img: HTMLImageElement, imageData: ImageData, fileInfo: { name: string; size: number }) => void;
  setShowOriginal: (show: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  applyPreset: (curves: CurvePoints) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  params: { ...DEFAULT_PARAMS },
  curves: JSON.parse(JSON.stringify(DEFAULT_CURVES)),
  activeChannel: 'rgb',
  originalImage: null,
  originalImageData: null,
  fileInfo: null,
  showOriginal: false,
  past: [],
  future: [],
  isDragging: false,

  setParam: (key, value) =>
    set(
      produce((state) => {
        state.params[key] = value;
      })
    ),

  setCurve: (channel, points) =>
    set(
      produce((state) => {
        state.curves[channel] = points;
      })
    ),

  setActiveChannel: (channel) =>
    set(
      produce((state) => {
        state.activeChannel = channel;
      })
    ),

  setImage: (img, imageData, info) =>
    set(
      produce((state) => {
        state.originalImage = img;
        state.originalImageData = imageData;
        state.fileInfo = {
          name: info.name,
          size: info.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        state.params = { ...DEFAULT_PARAMS };
        state.curves = JSON.parse(JSON.stringify(DEFAULT_CURVES));
        state.past = [];
        state.future = [];
      })
    ),

  setShowOriginal: (show) =>
    set(
      produce((state) => {
        state.showOriginal = show;
      })
    ),

  setIsDragging: (dragging) =>
    set(
      produce((state) => {
        state.isDragging = dragging;
      })
    ),

  pushHistory: () => {
    const { params, curves, past } = get();
    const snapshot = {
      params: { ...params },
      curves: JSON.parse(JSON.stringify(curves)),
    };

    set(
      produce((state) => {
        state.past = [...past, snapshot].slice(-MAX_HISTORY);
        state.future = [];
      })
    );
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const current = {
      params: { ...get().params },
      curves: JSON.parse(JSON.stringify(get().curves)),
    };

    set(
      produce((state) => {
        state.past = past.slice(0, -1);
        state.future = [current, ...future];
        state.params = previous.params;
        state.curves = previous.curves;
      })
    );
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const current = {
      params: { ...get().params },
      curves: JSON.parse(JSON.stringify(get().curves)),
    };

    set(
      produce((state) => {
        state.past = [...past, current];
        state.future = future.slice(1);
        state.params = next.params;
        state.curves = next.curves;
      })
    );
  },

  reset: () => {
    set(
      produce((state) => {
        state.params = { ...DEFAULT_PARAMS };
        state.curves = JSON.parse(JSON.stringify(DEFAULT_CURVES));
      })
    );
    get().pushHistory();
  },

  applyPreset: (presetCurves) => {
    set(
      produce((state) => {
        state.curves = JSON.parse(JSON.stringify(presetCurves));
      })
    );
    get().pushHistory();
  },
}));
