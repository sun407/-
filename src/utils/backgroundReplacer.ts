import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';

export type StudioBackgroundType = 'white' | 'blue' | 'gray' | 'warm';

export interface BackgroundOption {
  id: StudioBackgroundType;
  label: string;
  description: string;
  previewColor: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'blue',
    label: '스튜디오 연파랑 (추천)',
    description: '취업 이력서 선호도 1위, 신뢰감을 주는 단정한 연파랑 그라데이션',
    previewColor: 'from-[#60a5fa] to-[#1d4ed8]',
  },
  {
    id: 'white',
    label: '깔끔한 순백색 (기본)',
    description: '공공기관 및 기업 표준, 군더더기 없는 화이트 스튜디오 배경',
    previewColor: 'bg-white border-slate-300',
  },
  {
    id: 'gray',
    label: '차분한 연회색',
    description: '부드럽고 안정감을 주는 세련된 모던 그레이 그라데이션',
    previewColor: 'from-[#f1f5f9] to-[#94a3b8]',
  },
  {
    id: 'warm',
    label: '따뜻한 아이보리',
    description: '온화하고 친근한 인상을 주는 자연스러운 베이지 톤',
    previewColor: 'from-[#fefcf8] to-[#e6dfd1]',
  },
];

let selfieSegmentationInstance: SelfieSegmentation | null = null;

function getSelfieSegmentation(): SelfieSegmentation {
  if (!selfieSegmentationInstance) {
    selfieSegmentationInstance = new SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    selfieSegmentationInstance.setOptions({
      modelSelection: 1, // 1: Higher accuracy for portrait / landscape
      selfieMode: false,
    });
  }
  return selfieSegmentationInstance;
}

/**
 * Draws the selected studio background onto a 2D canvas context.
 */
export function drawStudioBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgType: StudioBackgroundType
) {
  if (bgType === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'blue') {
    // Standard Korean resume photo studio blue gradient (central spotlight effect)
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.38,
      width * 0.1,
      width * 0.5,
      height * 0.42,
      width * 0.95
    );
    grad.addColorStop(0, '#6BA5F2');
    grad.addColorStop(0.35, '#4285E4');
    grad.addColorStop(0.75, '#2B68C4');
    grad.addColorStop(1, '#1B4D9B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'gray') {
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.38,
      width * 0.1,
      width * 0.5,
      height * 0.42,
      width * 0.9
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, '#E2E8F0');
    grad.addColorStop(0.8, '#CBD5E1');
    grad.addColorStop(1, '#94A3B8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'warm') {
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.38,
      width * 0.1,
      width * 0.5,
      height * 0.42,
      width * 0.9
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, '#FAF7F0');
    grad.addColorStop(0.8, '#ECE7DA');
    grad.addColorStop(1, '#D8D1BF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Replaces the photo background with a clean studio background.
 * Uses MediaPipe SelfieSegmentation with automatic fallback.
 */
export async function replacePhotoBackground(
  imageSource: string,
  bgType: StudioBackgroundType = 'blue'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSource;

    img.onerror = () => {
      reject(new Error('이미지를 불러오지 못했습니다.'));
    };

    img.onload = async () => {
      const targetWidth = img.naturalWidth || img.width || 480;
      const targetHeight = img.naturalHeight || img.height || 640;

      try {
        const segmenter = getSelfieSegmentation();

        let resolved = false;
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            // Fallback: studio oval vignette crop
            const fallbackResult = renderFallbackStudioPhoto(img, targetWidth, targetHeight, bgType);
            resolve(fallbackResult);
          }
        }, 5000);

        segmenter.onResults((results: Results) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);

          try {
            // Main canvas
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(imageSource);
              return;
            }

            // 1. Draw the clean studio background
            drawStudioBackground(ctx, targetWidth, targetHeight, bgType);

            // 2. Create offscreen canvas for the masked person
            const personCanvas = document.createElement('canvas');
            personCanvas.width = targetWidth;
            personCanvas.height = targetHeight;
            const personCtx = personCanvas.getContext('2d');
            if (!personCtx) {
              resolve(imageSource);
              return;
            }

            // Draw original person photo
            personCtx.drawImage(results.image, 0, 0, targetWidth, targetHeight);

            // Mask out background
            personCtx.globalCompositeOperation = 'destination-in';
            personCtx.drawImage(results.segmentationMask, 0, 0, targetWidth, targetHeight);

            // 3. Composite person on studio background
            ctx.drawImage(personCanvas, 0, 0);

            // Return high quality JPEG
            const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve(finalDataUrl);
          } catch (e) {
            console.warn('Canvas composition error, using fallback:', e);
            resolve(renderFallbackStudioPhoto(img, targetWidth, targetHeight, bgType));
          }
        });

        await segmenter.send({ image: img });
      } catch (err) {
        console.warn('SelfieSegmentation error, using studio vignette fallback:', err);
        resolve(renderFallbackStudioPhoto(img, targetWidth, targetHeight, bgType));
      }
    };
  });
}

/**
 * Fallback studio renderer in case WebAssembly/CDN network is blocked.
 * Creates a clean studio background with soft oval gradient focus on the person.
 */
function renderFallbackStudioPhoto(
  img: HTMLImageElement,
  width: number,
  height: number,
  bgType: StudioBackgroundType
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;

  // Background
  drawStudioBackground(ctx, width, height, bgType);

  // Soft oval person focus
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.5, width * 0.42, height * 0.46, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 0, 0, width, height);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}
