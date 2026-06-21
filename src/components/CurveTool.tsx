import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { CURVE_PRESETS } from '../types';
import type { CurveChannel, Point } from '../types';
import { addCurvePoint, removeCurvePoint, updateCurvePoint, findNearestPointIndex } from '../utils/curveUtils';

const channelColors: Record<CurveChannel, string> = {
  rgb: '#ffffff',
  r: '#ef4444',
  g: '#22c55e',
  b: '#3b82f6',
};

const channelLabels: Record<CurveChannel, string> = {
  rgb: 'RGB',
  r: '红',
  g: '绿',
  b: '蓝',
};

export const CurveTool: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);

  const curves = useEditorStore((state) => state.curves);
  const activeChannel = useEditorStore((state) => state.activeChannel);
  const setActiveChannel = useEditorStore((state) => state.setActiveChannel);
  const setCurve = useEditorStore((state) => state.setCurve);
  const pushHistory = useEditorStore((state) => state.pushHistory);
  const applyPreset = useEditorStore((state) => state.applyPreset);

  const currentPoints = curves[activeChannel];

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 20;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(padding, padding, graphWidth, graphHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (graphHeight / 4) * i;
      const x = padding + (graphWidth / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, padding);
    ctx.stroke();
    ctx.setLineDash([]);

    const allChannels: CurveChannel[] = ['rgb', 'r', 'g', 'b'];
    allChannels.forEach((channel) => {
      if (channel === activeChannel) return;
      const points = curves[channel];
      if (points.length < 2) return;

      ctx.strokeStyle = channelColors[channel] + '40';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      points.forEach((point, i) => {
        const x = padding + (point.x / 255) * graphWidth;
        const y = height - padding - (point.y / 255) * graphHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    const sortedPoints = [...currentPoints].sort((a, b) => a.x - b.x);
    ctx.strokeStyle = channelColors[activeChannel];
    ctx.lineWidth = 2;
    ctx.shadowColor = channelColors[activeChannel];
    ctx.shadowBlur = 8;
    ctx.beginPath();
    sortedPoints.forEach((point, i) => {
      const x = padding + (point.x / 255) * graphWidth;
      const y = height - padding - (point.y / 255) * graphHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    sortedPoints.forEach((point, i) => {
      const x = padding + (point.x / 255) * graphWidth;
      const y = height - padding - (point.y / 255) * graphHeight;

      ctx.fillStyle = '#0f0f10';
      ctx.strokeStyle = channelColors[activeChannel];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (i === 0 || i === sortedPoints.length - 1) {
        ctx.fillStyle = channelColors[activeChannel];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '9px monospace';
    ctx.fillText('0', padding - 2, height - padding + 12);
    ctx.fillText('255', width - padding - 16, height - padding + 12);
    ctx.fillText('255', padding - 16, padding + 4);
  }, [curves, activeChannel, currentPoints]);

  useEffect(() => {
    drawCurve();
    const handleResize = () => drawCurve();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCurve]);

  const getPointFromEvent = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return null;

      const rect = container.getBoundingClientRect();
      const padding = 20;
      const graphWidth = rect.width - padding * 2;
      const graphHeight = rect.height - padding * 2;

      const x = ((clientX - rect.left - padding) / graphWidth) * 255;
      const y = 255 - ((clientY - rect.top - padding) / graphHeight) * 255;

      if (x < 0 || x > 255 || y < 0 || y > 255) return null;
      return { x: Math.round(x), y: Math.round(y) };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getPointFromEvent(e.clientX, e.clientY);
      if (!point) return;

      const threshold = 15;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const padding = 20;
      const graphWidth = rect.width - padding * 2;
      const graphHeight = rect.height - padding * 2;

      const scaledPoints = currentPoints.map((p) => ({
        x: padding + (p.x / 255) * graphWidth,
        y: rect.height - padding - (p.y / 255) * graphHeight,
      }));

      const nearestIndex = findNearestPointIndex(
        scaledPoints,
        e.clientX - rect.left,
        e.clientY - rect.top,
        threshold
      );

      if (nearestIndex >= 0) {
        if (e.button === 2) {
          e.preventDefault();
          const newPoints = removeCurvePoint(currentPoints, nearestIndex);
          setCurve(activeChannel, newPoints);
          return;
        }
        setIsDragging(true);
        setDraggedPointIndex(nearestIndex);
      } else {
        const newPoints = addCurvePoint(currentPoints, point.x, point.y);
        setCurve(activeChannel, newPoints);
        setIsDragging(true);
        setDraggedPointIndex(newPoints.length - 1);
      }
    },
    [currentPoints, activeChannel, getPointFromEvent, setCurve]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || draggedPointIndex === null) return;

      const point = getPointFromEvent(e.clientX, e.clientY);
      if (!point) return;

      const newPoints = updateCurvePoint(currentPoints, draggedPointIndex, point.x, point.y);
      setCurve(activeChannel, newPoints);
    },
    [isDragging, draggedPointIndex, currentPoints, activeChannel, getPointFromEvent, setCurve]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedPointIndex(null);
      pushHistory();
    }
  }, [isDragging, pushHistory]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">曲线</h3>
        <div className="flex gap-1">
          {(['rgb', 'r', 'g', 'b'] as CurveChannel[]).map((channel) => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                activeChannel === channel
                  ? 'text-white shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
              style={
                activeChannel === channel
                  ? { backgroundColor: channelColors[channel] + '30', color: channelColors[channel] }
                  : {}
              }
            >
              {channelLabels[channel]}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative cursor-crosshair"
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-lg"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => applyPreset(CURVE_PRESETS.neutral)}
          className="flex-1 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:text-white"
        >
          重置曲线
        </button>
        <button
          onClick={() => applyPreset(CURVE_PRESETS.sCurve)}
          className="flex-1 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-violet-600/30 rounded-lg transition-all duration-200 hover:text-violet-300"
        >
          S型对比
        </button>
        <button
          onClick={() => applyPreset(CURVE_PRESETS.film)}
          className="flex-1 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-amber-600/30 rounded-lg transition-all duration-200 hover:text-amber-300"
        >
          胶片质感
        </button>
      </div>

      <p className="text-[10px] text-zinc-600 mt-2 text-center">
        点击曲线添加控制点 · 拖拽调整 · 右键删除
      </p>
    </div>
  );
};
