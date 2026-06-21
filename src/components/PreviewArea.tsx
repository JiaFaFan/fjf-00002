import React, { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, FileImage } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { loadImageFile, getImageDataFromImage } from '../utils/exportUtils';
import { useImageProcessor } from '../hooks/useImageProcessor';
import type { HistogramData } from '../types';

interface PreviewAreaProps {
  onHistogramUpdate: (data: HistogramData) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ onHistogramUpdate }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const originalImageData = useEditorStore((state) => state.originalImageData);
  const originalImage = useEditorStore((state) => state.originalImage);
  const params = useEditorStore((state) => state.params);
  const curves = useEditorStore((state) => state.curves);
  const showOriginal = useEditorStore((state) => state.showOriginal);
  const isDragging = useEditorStore((state) => state.isDragging);
  const fileInfo = useEditorStore((state) => state.fileInfo);
  const setImage = useEditorStore((state) => state.setImage);
  const pushHistory = useEditorStore((state) => state.pushHistory);

  const { outputCanvasRef } = useImageProcessor({
    originalImageData,
    params,
    curves,
    showOriginal,
    isDragging,
    onHistogramUpdate,
  });

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;

      try {
        const img = await loadImageFile(file);
        const imageData = getImageDataFromImage(img);
        setImage(img, imageData, { name: file.name, size: file.size });
        pushHistory();
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    },
    [setImage, pushHistory]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = '';
    },
    [handleFile]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getScale = (): number => {
    if (!containerRef.current || !originalImage) return 1;
    const container = containerRef.current;
    const padding = 40;
    const scaleX = (container.clientWidth - padding) / originalImage.naturalWidth;
    const scaleY = (container.clientHeight - padding - 40) / originalImage.naturalHeight;
    return Math.min(scaleX, scaleY, 1);
  };

  const scale = getScale();

  if (!originalImageData) {
    return (
      <div
        className={`flex-1 flex items-center justify-center transition-all duration-300 ${
          isDragOver ? 'bg-violet-500/10' : 'bg-zinc-950'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
        <div
          className={`text-center p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragOver
              ? 'border-violet-500 bg-violet-500/10 scale-105'
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragOver
                ? 'bg-violet-500/20 text-violet-400'
                : 'bg-zinc-800/50 text-zinc-500'
            }`}
          >
            <Upload size={40} className={isDragOver ? 'animate-bounce' : ''} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">拖入图片开始编辑</h3>
          <p className="text-zinc-500 mb-4">或点击此处选择文件</p>
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <FileImage size={12} />
              JPG, PNG, WebP
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage:
          'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      }}
    >
      <div
        className={`relative transition-all duration-200 ${
          showOriginal ? 'opacity-80 scale-[0.995]' : 'opacity-100'
        }`}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={outputCanvasRef}
          className="shadow-2xl rounded-lg"
        />
        {showOriginal && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
            原图
          </div>
        )}
      </div>

      {fileInfo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs text-zinc-400 border border-white/10 flex items-center gap-3">
          <ImageIcon size={12} className="text-violet-400" />
          <span className="font-mono">{fileInfo.name}</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono">
            {fileInfo.width} × {fileInfo.height}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono">{formatFileSize(fileInfo.size)}</span>
        </div>
      )}
    </div>
  );
};
