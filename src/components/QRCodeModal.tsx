import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, X, Copy, Check, Download, Printer, ExternalLink, Smartphone, Share2 } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast?: boolean;
}

// Default to production shared app URL or current origin
const PREFERRED_APP_URL = 'https://ais-pre-w7r4kv7gbtmlhs7kagbvum-368891413016.asia-northeast1.run.app';

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  highContrast = false,
}) => {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Determine active URL
  const currentUrl = typeof window !== 'undefined' && window.location.href.startsWith('http')
    ? window.location.href
    : PREFERRED_APP_URL;

  // Use the clean shared URL if currently in preview iframe, or current URL
  const displayUrl = currentUrl.includes('run.app') ? currentUrl : PREFERRED_APP_URL;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = displayUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = '수원시장애인종합복지관_이력서_QR코드.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all border my-auto ${
        highContrast
          ? 'bg-zinc-950 text-yellow-300 border-yellow-400'
          : 'bg-white text-slate-800 border-slate-200'
      } print:border-none print:shadow-none print:max-w-none print:w-full print:p-8`}>
        
        {/* Header (Hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                스마트폰 접속 QR 코드
              </h3>
              <p className="text-xs text-slate-500">
                수원시장애인종합복지관 쉬운 이력서
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Poster Area */}
        <div className="flex flex-col items-center text-center space-y-4">
          
          <div className="print:block hidden mb-4">
            <span className="text-sm font-bold text-emerald-800">수원시장애인종합복지관</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">알기 쉬운 이력서 작성기</h1>
            <p className="text-sm text-slate-600 mt-1">
              스마트폰 카메라로 아래 QR 코드를 비추면 바로 이력서를 작성할 수 있습니다.
            </p>
          </div>

          {/* QR Code Container */}
          <div 
            ref={canvasRef}
            className="p-4 bg-white rounded-2xl border-2 border-emerald-600 shadow-md flex items-center justify-center inline-block"
          >
            <QRCodeCanvas
              value={displayUrl}
              size={220}
              level="H"
              marginSize={2}
              imageSettings={{
                src: '/icon-192.png',
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>스마트폰 기본 카메라로 비춰보세요!</span>
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              별도의 앱 설치 없이 카메라로 QR 코드를 스캔하면 간편하게 모바일 맞춤 화면으로 열립니다.
            </p>
          </div>

          {/* URL Box */}
          <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 print:hidden">
            <span className="truncate flex-1 text-left mr-2 font-mono text-[11px] text-slate-500">
              {displayUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold shrink-0 transition flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>복사</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons (Hidden in print) */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1 print:hidden">
            <button
              onClick={handleDownloadQR}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>QR 이미지 저장</span>
            </button>

            <button
              onClick={handlePrintPoster}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>안내문 인쇄 (출력)</span>
            </button>
          </div>

        </div>

        {/* Footer (Hidden in print) */}
        <div className="mt-5 pt-3 border-t border-slate-100 text-center print:hidden">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
