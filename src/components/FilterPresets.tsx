import React, { useState } from 'react';
import { Sparkles, Save, Trash2, X, SlidersHorizontal } from 'lucide-react';
import { useEditorStore, BUILTIN_FILTER_PRESETS } from '../store/useEditorStore';
import type { FilterPreset } from '../types';

const intensityMarks = [0, 25, 50, 75, 100];

export const FilterPresets: React.FC = () => {
  const filterIntensity = useEditorStore((state) => state.filterIntensity);
  const setFilterIntensity = useEditorStore((state) => state.setFilterIntensity);
  const applyFilterPreset = useEditorStore((state) => state.applyFilterPreset);
  const saveCustomPreset = useEditorStore((state) => state.saveCustomPreset);
  const deleteCustomPreset = useEditorStore((state) => state.deleteCustomPreset);
  const customPresets = useEditorStore((state) => state.customPresets);
  const appliedFilterId = useEditorStore((state) => state.appliedFilterId);
  const pushHistory = useEditorStore((state) => state.pushHistory);
  const setIsDragging = useEditorStore((state) => state.setIsDragging);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const allPresets: FilterPreset[] = [...BUILTIN_FILTER_PRESETS, ...customPresets];

  const handlePresetClick = (preset: FilterPreset) => {
    applyFilterPreset(preset);
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterIntensity(Number(e.target.value));
  };

  const handleIntensityChangeStart = () => {
    setIsDragging(true);
  };

  const handleIntensityChangeEnd = () => {
    setIsDragging(false);
    pushHistory();
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    saveCustomPreset(presetName.trim());
    setPresetName('');
    setShowSaveModal(false);
  };

  const handleDeleteCustomPreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCustomPreset(id);
  };

  return (
    <div className="w-full bg-zinc-900/40 border-b border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <h3 className="text-sm font-medium text-zinc-200">滤镜预设</h3>
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-violet-600/30 hover:text-violet-300 rounded-lg transition-all duration-200 border border-zinc-700/50 hover:border-violet-500/30"
          >
            <Save size={12} />
            保存预设
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {allPresets.map((preset) => {
            const isActive = appliedFilterId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                  isActive
                    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-900 shadow-lg shadow-violet-500/20 scale-[1.02]'
                    : 'hover:ring-1 hover:ring-zinc-600 hover:scale-[1.02]'
                }`}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.08))'
                    : 'linear-gradient(135deg, #27272a, #18181b)',
                }}
                title={`${preset.name} - ${preset.description}`}
              >
                <span className="text-xl leading-none">{preset.icon}</span>
                <span
                  className={`text-[9px] font-medium leading-tight mt-0.5 px-1 truncate max-w-full ${
                    isActive ? 'text-violet-200' : 'text-zinc-400 group-hover:text-zinc-300'
                  }`}
                >
                  {preset.name}
                </span>

                {preset.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomPreset(e, preset.id)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500/80 text-white items-center justify-center hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500"
                  >
                    <Trash2 size={8} />
                  </button>
                )}

                {isActive && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-violet-400 shadow-sm animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">滤镜强度</span>
          </div>
          <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md min-w-[42px] text-center">
            {filterIntensity}%
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={filterIntensity}
            onChange={handleIntensityChange}
            onMouseDown={handleIntensityChangeStart}
            onMouseUp={handleIntensityChangeEnd}
            onTouchStart={handleIntensityChangeStart}
            onTouchEnd={handleIntensityChangeEnd}
            className="w-full h-1.5 appearance-none bg-transparent cursor-pointer relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-zinc-800"
            style={{
              background: `linear-gradient(to right, rgb(139 92 246) 0%, rgb(139 92 246) ${filterIntensity}%, rgb(39 39 42) ${filterIntensity}%, rgb(39 39 42) 100%)`,
              borderRadius: '9999px',
            }}
          />
          <div className="flex justify-between mt-1.5 px-0.5">
            {intensityMarks.map((mark) => (
              <span
                key={mark}
                className={`text-[9px] ${
                  Math.abs(filterIntensity - mark) < 5 ? 'text-violet-400' : 'text-zinc-600'
                }`}
              >
                {mark}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-[320px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">保存自定义预设</h4>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPresetName('');
                }}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-3">
              将当前的亮度、对比度、色温和曲线等参数保存为自定义风格预设
            </p>

            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePreset();
              }}
              placeholder="输入预设名称..."
              autoFocus
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPresetName('');
                }}
                className="flex-1 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-violet-600/20 disabled:shadow-none"
              >
                确定保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
