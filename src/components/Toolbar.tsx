import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  Undo2,
  Redo2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { exportAsJPG, exportAsPNG, loadImageFile, getImageDataFromImage } from '../utils/exportUtils';

export const Toolbar: React.FC = () => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originalImage = useEditorStore((state) => state.originalImage);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const reset = useEditorStore((state) => state.reset);
  const setImage = useEditorStore((state) => state.setImage);
  const pushHistory = useEditorStore((state) => state.pushHistory);
  const past = useEditorStore((state) => state.past);
  const future = useEditorStore((state) => state.future);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const img = await loadImageFile(file);
      const imageData = getImageDataFromImage(img);
      setImage(img, imageData, { name: file.name, size: file.size });
      pushHistory();
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleExportJPG = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      exportAsJPG(canvas);
    }
    setShowExportMenu(false);
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      exportAsPNG(canvas);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="h-14 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">LuminaLab</h1>
            <p className="text-[10px] text-zinc-500 -mt-0.5">专业照片调色</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200"
        >
          <Upload size={16} />
          导入图片
        </button>

        <div className="w-px h-6 bg-zinc-800 mx-2" />

        <button
          onClick={undo}
          disabled={past.length === 0}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={redo}
          disabled={future.length === 0}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="重做 (Ctrl+Shift+Z)"
        >
          <Redo2 size={18} />
        </button>

        <button
          onClick={reset}
          disabled={!originalImage}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw size={16} />
          重置
        </button>

        <div className="w-px h-6 bg-zinc-800 mx-2" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={!originalImage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            <Download size={16} />
            导出
            <ChevronDown size={14} className={showExportMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={handleExportJPG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-150"
              >
                <ImageIcon size={16} className="text-orange-400" />
                <div className="text-left">
                  <div>导出为 JPG</div>
                  <div className="text-[10px] text-zinc-500">有损压缩，文件更小</div>
                </div>
              </button>
              <button
                onClick={handleExportPNG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-150 border-t border-zinc-800"
              >
                <ImageIcon size={16} className="text-blue-400" />
                <div className="text-left">
                  <div>导出为 PNG</div>
                  <div className="text-[10px] text-zinc-500">无损压缩，保留透明</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
