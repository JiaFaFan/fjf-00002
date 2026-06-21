import { create } from 'zustand';
import { produce } from 'immer';
import type {
  AdjustmentParams,
  CurvePoints,
  CurveChannel,
  Point,
  FilterPreset,
} from '../types';
import { DEFAULT_PARAMS, DEFAULT_CURVES, BUILTIN_FILTER_PRESETS } from '../types';

const MAX_HISTORY = 20;
const CUSTOM_PRESETS_KEY = 'photo-editor-custom-presets';

const loadCustomPresets = (): FilterPreset[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: FilterPreset) => ({ ...p, isCustom: true }));
    }
  } catch {
    // ignore
  }
  return [];
};

const saveCustomPresetsToStorage = (presets: FilterPreset[]) => {
  try {
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
};

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
  filterIntensity: number;
  customPresets: FilterPreset[];
  appliedFilterId: string | null;

  setParam: (key: keyof AdjustmentParams, value: number) => void;
  setCurve: (channel: CurveChannel, points: Point[]) => void;
  setActiveChannel: (channel: CurveChannel) => void;
  setImage: (img: HTMLImageElement, imageData: ImageData, fileInfo: { name: string; size: number }) => void;
  setShowOriginal: (show: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setFilterIntensity: (intensity: number) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  applyPreset: (curves: CurvePoints) => void;
  applyFilterPreset: (preset: FilterPreset) => void;
  saveCustomPreset: (name: string, icon?: string) => void;
  deleteCustomPreset: (id: string) => void;
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
  filterIntensity: 100,
  customPresets: loadCustomPresets(),
  appliedFilterId: null,

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
        state.filterIntensity = 100;
        state.appliedFilterId = null;
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

  setFilterIntensity: (intensity) =>
    set(
      produce((state) => {
        state.filterIntensity = Math.max(0, Math.min(100, intensity));
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
        state.appliedFilterId = null;
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
        state.appliedFilterId = null;
      })
    );
  },

  reset: () => {
    set(
      produce((state) => {
        state.params = { ...DEFAULT_PARAMS };
        state.curves = JSON.parse(JSON.stringify(DEFAULT_CURVES));
        state.appliedFilterId = null;
      })
    );
    get().pushHistory();
  },

  applyPreset: (presetCurves) => {
    set(
      produce((state) => {
        state.curves = JSON.parse(JSON.stringify(presetCurves));
        state.appliedFilterId = null;
      })
    );
    get().pushHistory();
  },

  applyFilterPreset: (preset) => {
    set(
      produce((state) => {
        state.params = { ...preset.params };
        state.curves = JSON.parse(JSON.stringify(preset.curves));
        state.appliedFilterId = preset.id;
      })
    );
    get().pushHistory();
  },

  saveCustomPreset: (name, icon = '🎯') => {
    const { params, curves, customPresets } = get();
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      description: '我的自定义预设',
      icon,
      params: { ...params },
      curves: JSON.parse(JSON.stringify(curves)),
      isCustom: true,
    };

    const updatedPresets = [...customPresets, newPreset];
    set(
      produce((state) => {
        state.customPresets = updatedPresets;
      })
    );
    saveCustomPresetsToStorage(updatedPresets);
  },

  deleteCustomPreset: (id) => {
    const { customPresets } = get();
    const updatedPresets = customPresets.filter((p) => p.id !== id);
    set(
      produce((state) => {
        state.customPresets = updatedPresets;
        state.appliedFilterId = state.appliedFilterId === id ? null : state.appliedFilterId;
      })
    );
    saveCustomPresetsToStorage(updatedPresets);
  },
}));

export { BUILTIN_FILTER_PRESETS };
