/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Download,
  Printer,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { dataURLtoBlob, dataURLtoUint8Array } from '../utils/pdfStorage';

// Setup pdf.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup warning:', e);
  }
}

interface PDFViewerProps {
  dataUrl: string;
  fileName?: string;
  title?: string;
}

export default function PDFViewer({ dataUrl, fileName = 'document.pdf', title }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string>('');

  // Check if data is image or PDF
  useEffect(() => {
    if (!dataUrl) {
      setError('표시할 파일 데이터가 없습니다.');
      setLoading(false);
      return;
    }

    // Check if image format
    if (dataUrl.startsWith('data:image/') || fileName.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
      setIsImage(true);
      setLoading(false);
      return;
    }

    setIsImage(false);
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const blob = dataURLtoBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      const uint8 = dataURLtoUint8Array(dataUrl);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
        cMapPacked: true,
      });

      loadingTask.promise
        .then((doc) => {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        })
        .catch((err) => {
          console.error('PDF.js loading error:', err);
          setError('PDF 문서를 파싱하는 중 오류가 발생했습니다. 브라우저 뷰어로 보시려면 새 창 열기를 이용해주세요.');
          setLoading(false);
        });

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err: any) {
      console.error('Data conversion error:', err);
      setError('PDF 데이터를 불러올 수 없습니다.');
      setLoading(false);
    }
  }, [dataUrl, fileName]);

  // Render current PDF page on canvas
  useEffect(() => {
    if (!pdfDoc || isImage || !canvasRef.current) return;

    let isCancelled = false;

    pdfDoc.getPage(currentPage).then((page) => {
      if (isCancelled || !canvasRef.current) return;

      const viewport = page.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      page.render(renderContext as any);
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, rotation, isImage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage((p) => p + 1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    try {
      const blob = dataURLtoBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.click();
    }
  };

  const handlePrint = () => {
    try {
      const blob = dataURLtoBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
    } catch {
      window.print();
    }
  };

  const handleOpenNewTab = () => {
    try {
      const blob = dataURLtoBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl select-none"
    >
      {/* Viewer Toolbar */}
      <div className="bg-slate-950/90 backdrop-blur text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 shrink-0">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
          {!isImage && numPages > 0 && (
            <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-slate-700 text-slate-300 disabled:text-slate-600 rounded-lg transition-colors"
                title="이전 페이지"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2.5 text-xs font-bold font-mono text-slate-200">
                <span>{currentPage}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span>{numPages}</span>
              </div>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-1.5 hover:bg-slate-700 text-slate-300 disabled:text-slate-600 rounded-lg transition-colors"
                title="다음 페이지"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {title && (
            <span className="text-xs font-extrabold text-teal-400 hidden sm:inline-block max-w-[200px] truncate">
              {title}
            </span>
          )}
        </div>

        {/* Center: Zoom & Rotation Controls */}
        <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-bold font-mono px-2 text-slate-300 min-w-[48px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors ml-1 border-l border-slate-700"
            title="90도 회전"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions (Download, Print, Open, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-slate-700"
            title="새 창에서 원본 열기"
          >
            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">새 창</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-slate-700"
            title="인쇄하기"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden md:inline">인쇄</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1"
            title="파일 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>다운로드</span>
          </button>
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="전체화면"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-auto bg-slate-900/90 flex items-center justify-center p-4 min-h-[450px]">
        {loading && (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-3 py-16">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-xs font-bold text-slate-300">PDF 문서를 렌더링하는 중입니다...</p>
          </div>
        )}

        {error && !loading && (
          <div className="max-w-md bg-slate-800/90 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-lg">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">인앱 뷰어 로드 알림</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                브라우저 기본 뷰어로 열기
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                다운로드
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="flex items-center justify-center min-w-full">
            {isImage ? (
              <img
                src={dataUrl}
                alt={fileName}
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl bg-white"
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="rounded-lg shadow-2xl bg-white border border-slate-800"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
