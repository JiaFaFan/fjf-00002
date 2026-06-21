import { useEffect, useRef, useCallback } from 'react';
import type { AdjustmentParams, CurvePoints } from '../types';
import { buildMasterLUT, applyAdjustments, calculateHistogram } from '../utils/imageProcessing';
import type { HistogramData } from '../types';

interface UseImageProcessorOptions {
  originalImageData: ImageData | null;
  params: AdjustmentParams;
  curves: CurvePoints;
  showOriginal: boolean;
  isDragging: boolean;
  filterIntensity: number;
  onHistogramUpdate?: (data: HistogramData) => void;
  onImageRender?: (imageData: ImageData) => void;
}

export const useImageProcessor = ({
  originalImageData,
  params,
  curves,
  showOriginal,
  isDragging,
  filterIntensity,
  onHistogramUpdate,
  onImageRender,
}: UseImageProcessorOptions) => {
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lutCacheRef = useRef<{
    params: AdjustmentParams | null;
    curves: CurvePoints | null;
    lut: { r: Uint8ClampedArray; g: Uint8ClampedArray; b: Uint8ClampedArray } | null;
  }>({ params: null, curves: null, lut: null });

  const renderFrame = useCallback(() => {
    if (!originalImageData || !outputCanvasRef.current) return;

    const canvas = outputCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (showOriginal) {
      ctx.putImageData(originalImageData, 0, 0);
      if (onHistogramUpdate) {
        onHistogramUpdate(calculateHistogram(originalImageData));
      }
      return;
    }

    const paramsChanged =
      !lutCacheRef.current.params ||
      JSON.stringify(lutCacheRef.current.params) !== JSON.stringify(params);
    const curvesChanged =
      !lutCacheRef.current.curves ||
      JSON.stringify(lutCacheRef.current.curves) !== JSON.stringify(curves);

    if (paramsChanged || curvesChanged || !lutCacheRef.current.lut) {
      lutCacheRef.current = {
        params: { ...params },
        curves: JSON.parse(JSON.stringify(curves)),
        lut: buildMasterLUT(params, curves),
      };
    }

    const processedData = applyAdjustments(
      originalImageData,
      lutCacheRef.current.lut!,
      params,
      filterIntensity
    );

    canvas.width = originalImageData.width;
    canvas.height = originalImageData.height;
    ctx.putImageData(processedData, 0, 0);

    if (onHistogramUpdate) {
      onHistogramUpdate(calculateHistogram(processedData));
    }

    if (onImageRender) {
      onImageRender(processedData);
    }
  }, [originalImageData, params, curves, showOriginal, filterIntensity, onHistogramUpdate, onImageRender]);

  useEffect(() => {
    if (!originalImageData) return;

    if (isDragging) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    } else {
      renderFrame();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [originalImageData, params, curves, showOriginal, isDragging, filterIntensity, renderFrame]);

  const getOutputCanvas = useCallback(() => outputCanvasRef.current, []);

  return {
    outputCanvasRef,
    getOutputCanvas,
    renderFrame,
  };
};
