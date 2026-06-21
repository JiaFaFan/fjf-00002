import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { HistogramData } from '../types';

interface HistogramProps {
  data: HistogramData | null;
}

export const Histogram: React.FC<HistogramProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showShadowWarning, setShowShadowWarning] = useState(false);
  const [showHighlightWarning, setShowHighlightWarning] = useState(false);

  useEffect(() => {
    if (!data) {
      setShowShadowWarning(false);
      setShowHighlightWarning(false);
      return;
    }

    setShowShadowWarning(data.shadowsClipping > 0.5);
    setShowHighlightWarning(data.highlightsClipping > 0.5);
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / 256;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let i = 0; i < 256; i++) {
      const rH = data.r[i] * height * 0.9;
      const gH = data.g[i] * height * 0.9;
      const bH = data.b[i] * height * 0.9;

      ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.fillRect(i * barWidth, height - rH, barWidth + 0.5, rH);

      ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.fillRect(i * barWidth, height - gH, barWidth + 0.5, gH);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.fillRect(i * barWidth, height - bH, barWidth + 0.5, bH);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px monospace';
    ctx.fillText('0', 4, height - 2);
    ctx.fillText('255', width - 24, height - 2);
  }, [data]);

  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">直方图</h3>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 transition-all duration-300 ${showShadowWarning ? 'opacity-100' : 'opacity-30'}`}>
            <AlertTriangle
              size={14}
              className={`text-red-500 ${showShadowWarning ? 'animate-pulse' : ''}`}
            />
            <span className="text-[10px] text-red-400">死黑</span>
          </div>
          <div className={`flex items-center gap-1 transition-all duration-300 ${showHighlightWarning ? 'opacity-100' : 'opacity-30'}`}>
            <AlertTriangle
              size={14}
              className={`text-red-500 ${showHighlightWarning ? 'animate-pulse' : ''}`}
            />
            <span className="text-[10px] text-red-400">死白</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className={`absolute left-0 top-0 w-3 h-full flex items-center justify-center transition-all duration-300 ${
            showShadowWarning ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`w-0 h-0 border-l-[6px] border-l-red-500 border-y-[5px] border-y-transparent animate-pulse`}
          />
        </div>
        <div
          className={`absolute right-0 top-0 w-3 h-full flex items-center justify-center transition-all duration-300 ${
            showHighlightWarning ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`w-0 h-0 border-r-[6px] border-r-red-500 border-y-[5px] border-y-transparent animate-pulse`}
          />
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[120px] bg-zinc-950/50 rounded-lg"
        />
      </div>
      <div className="flex justify-between mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="text-[10px] text-zinc-500">R</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <span className="text-[10px] text-zinc-500">G</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500/60" />
          <span className="text-[10px] text-zinc-500">B</span>
        </div>
      </div>
    </div>
  );
};
