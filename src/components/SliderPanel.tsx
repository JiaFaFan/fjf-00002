import React from 'react';
import { AdjustmentSlider } from './AdjustmentSlider';
import { useEditorStore } from '../store/useEditorStore';
import { SLIDER_CONFIGS } from '../types';
import type { AdjustmentKey } from '../types';

export const SliderPanel: React.FC = () => {
  const params = useEditorStore((state) => state.params);
  const setParam = useEditorStore((state) => state.setParam);
  const pushHistory = useEditorStore((state) => state.pushHistory);
  const setIsDragging = useEditorStore((state) => state.setIsDragging);

  const handleChange = (key: AdjustmentKey, value: number) => {
    setParam(key, value);
  };

  const handleChangeStart = () => {
    setIsDragging(true);
  };

  const handleChangeEnd = () => {
    setIsDragging(false);
    pushHistory();
  };

  return (
    <div className="w-[280px] bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-800 flex flex-col h-full">
      <div className="p-5 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white tracking-tight">调色面板</h2>
        <p className="text-xs text-zinc-500 mt-1">双击滑块重置为 0</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {SLIDER_CONFIGS.map((config) => (
          <AdjustmentSlider
            key={config.key}
            paramKey={config.key}
            label={config.label}
            value={params[config.key]}
            min={config.min}
            max={config.max}
            step={config.step}
            icon={config.icon}
            onChange={handleChange}
            onChangeStart={handleChangeStart}
            onChangeEnd={handleChangeEnd}
          />
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500 space-y-1">
          <p className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">
              Shift
            </kbd>
            按住对比原图
          </p>
          <p className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">
              Ctrl Z
            </kbd>
            撤销 / 重做
          </p>
        </div>
      </div>
    </div>
  );
};
