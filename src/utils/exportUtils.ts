export const exportAsJPG = (canvas: HTMLCanvasElement, quality = 0.92): void => {
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  downloadFile(dataUrl, generateFileName('jpg'));
};

export const exportAsPNG = (canvas: HTMLCanvasElement): void => {
  const dataUrl = canvas.toDataURL('image/png');
  downloadFile(dataUrl, generateFileName('png'));
};

const generateFileName = (format: 'jpg' | 'png'): string => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  return `LuminaLab_${timestamp}.${format}`;
};

const downloadFile = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const loadImageFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

export const getImageDataFromImage = (img: HTMLImageElement): ImageData => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};
