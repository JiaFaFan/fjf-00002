import React, { useCallback, useRef, useState } from 'react';
import { Sun, Aperture, Contrast, Thermometer, Droplets, Palette } from 'lucide-react';
import type { AdjustmentKey } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Sun,
  Aperture,
  Contrast,
  Thermometer,
  Droplets,
  Palette,
};

interface AdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  icon: string;
  onChange: (key: AdjustmentKey, value: number) => void;
  onChangeStart: () => void;
  onChangeEnd: () => void;
  paramKey: AdjustmentKey;
}

export const AdjustmentSlider: React.FC<AdjustmentSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  icon,
  onChange,
  onChangeStart,
  onChangeEnd,
  paramKey,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const Icon = iconMap[icon] || Sun;
  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onChangeStart();

      const updateValue = (clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const newValue = min + (x / rect.width) * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        onChange(paramKey, Math.max(min, Math.min(max, steppedValue)));
      };

      updateValue(e.clientX);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        updateValue(moveEvent.clientX);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        onChangeEnd();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [min, max, step, onChange, onChangeStart, onChangeEnd, paramKey]
  );

  const handleDoubleClick = useCallback(() => {
    onChangeStart();
    onChange(paramKey, 0);
    onChangeEnd();
  }, [onChange, onChangeStart, onChangeEnd, paramKey]);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              isHovered || isDragging
                ? 'bg-violet-500/20 text-violet-400'
                : 'bg-zinc-800/50 text-zinc-400'
            }`}
          >
            <Icon size={16} />
          </div>
          <span className="text-sm font-medium text-zinc-300">{label}</span>
        </div>
        <span
          className={`text-sm font-mono tabular-nums transition-all duration-200 ${
            value !== 0 ? 'text-violet-400' : 'text-zinc-500'
          }`}
        >
          {value > 0 ? '+' : ''}
          {value}
        </span>
      </div>
      <div
        ref={sliderRef}
        className="relative h-1.5 bg-zinc-800 rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-75 ${
            isDragging || isHovered
              ? 'bg-white shadow-lg shadow-violet-500/50 scale-110'
              : 'bg-zinc-200 shadow-md'
          }`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};
