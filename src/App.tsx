import { useState, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { SliderPanel } from './components/SliderPanel';
import { PreviewArea } from './components/PreviewArea';
import { Histogram } from './components/Histogram';
import { CurveTool } from './components/CurveTool';
import { useEditorStore } from './store/useEditorStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { HistogramData } from './types';

function App() {
  const [histogramData, setHistogramData] = useState<HistogramData | null>(null);
  const originalImage = useEditorStore((state) => state.originalImage);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const setShowOriginal = useEditorStore((state) => state.setShowOriginal);

  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onShowOriginalStart: useCallback(() => setShowOriginal(true), [setShowOriginal]),
    onShowOriginalEnd: useCallback(() => setShowOriginal(false), [setShowOriginal]),
    enabled: !!originalImage,
  });

  const handleHistogramUpdate = useCallback((data: HistogramData) => {
    setHistogramData(data);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0f0f10] text-white overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <SliderPanel />
        <PreviewArea onHistogramUpdate={handleHistogramUpdate} />
        <div className="w-[320px] bg-zinc-900/60 backdrop-blur-xl border-l border-zinc-800 flex flex-col h-full">
          <Histogram data={histogramData} />
          <CurveTool />
        </div>
      </div>
    </div>
  );
}

export default App;
