import React from 'react';
import { 
  FileText, 
  Sparkles, 
  RotateCcw, 
  Type, 
  Eye, 
  Volume2, 
  VolumeX, 
  Download,
  BookOpen,
  Printer,
  ShieldCheck,
  Send,
  Lock,
  QrCode
} from 'lucide-react';
import { AccessibilityLevel } from '../types';

interface HeaderProps {
  fontSize: AccessibilityLevel;
  setFontSize: (level: AccessibilityLevel) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  onFillSample: () => void;
  onReset: () => void;
  activeTab: 'wizard' | 'preview';
  setActiveTab: (tab: 'wizard' | 'preview') => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  adminEmail?: string | null;
  onSubmitResume: () => void;
  isSubmitting?: boolean;
  onOpenQR: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  isSpeaking,
  onStopSpeech,
  onFillSample,
  onReset,
  activeTab,
  setActiveTab,
  onExportPdf,
  isExportingPdf,
  onOpenAdmin,
  isAdmin,
  adminEmail,
  onSubmitResume,
  isSubmitting = false,
  onOpenQR,
}) => {
  return (
    <header className={`sticky top-0 z-30 transition-colors border-b ${
      highContrast 
        ? 'bg-black text-yellow-300 border-yellow-400' 
        : 'bg-white/95 backdrop-blur-md text-[#3d3d3d] border-[#e8e6df] shadow-xs'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl flex items-center justify-center font-bold text-xl ${
                highContrast ? 'bg-yellow-400 text-black' : 'bg-[#7a8d7c] text-white shadow-xs'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xs xs:text-sm sm:text-base md:text-lg font-bold tracking-tight flex items-center gap-1.5 whitespace-nowrap text-[#4a544b]">
                  <span className="whitespace-nowrap">수원시장애인종합복지관 이력서 작성 프로그램</span>
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    highContrast ? 'bg-yellow-300 text-black' : 'bg-[#f0f2f0] text-[#7a8d7c] border border-[#7a8d7c]/30'
                  }`}>
                    쉬운 이력서
                  </span>
                </h1>
                <p className={`text-xs sm:text-sm ${highContrast ? 'text-yellow-200' : 'text-[#8e8d88]'}`}>
                  간단한 질문에 답하고 정갈한 이력서를 완성해요
                </p>
              </div>
            </div>

            {/* Speaking Status indicator for mobile */}
            {isSpeaking && (
              <button 
                onClick={onStopSpeech}
                className="md:hidden flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold animate-pulse"
              >
                <VolumeX className="w-4 h-4" /> 음성 끄기
              </button>
            )}
          </div>

          {/* Controls & Actions */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#e8e6df]">
            
            {/* View Tab Switcher */}
            <div className={`p-1 rounded-xl flex items-center text-sm font-semibold ${
              highContrast ? 'bg-zinc-800' : 'bg-[#f8f7f2] border border-[#e8e6df]'
            }`}>
              <button
                onClick={() => setActiveTab('wizard')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'wizard'
                    ? highContrast 
                      ? 'bg-yellow-400 text-black font-bold' 
                      : 'bg-white text-[#7a8d7c] shadow-xs font-bold'
                    : highContrast ? 'text-yellow-200 hover:text-white' : 'text-[#6e6d67] hover:text-[#3d3d3d]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>1. 질문 작성</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? highContrast 
                      ? 'bg-yellow-400 text-black font-bold' 
                      : 'bg-white text-[#7a8d7c] shadow-xs font-bold'
                    : highContrast ? 'text-yellow-200 hover:text-white' : 'text-[#6e6d67] hover:text-[#3d3d3d]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>2. 이력서 보기</span>
              </button>
            </div>

            {/* Accessibility Options */}
            <div className="flex items-center gap-1 bg-[#f8f7f2] border border-[#e8e6df] p-1 rounded-xl">
              {/* Font Size Toggle */}
              <div className="flex items-center text-xs font-bold gap-0.5 px-1">
                <Type className="w-3.5 h-3.5 text-[#8e8d88] mr-1" />
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-[#7a8d7c] text-white' : 'text-[#6e6d67] hover:bg-[#e8e6df]'}`}
                  title="보통 글자"
                >
                  보통
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded text-sm ${fontSize === 'large' ? 'bg-[#7a8d7c] text-white' : 'text-[#6e6d67] hover:bg-[#e8e6df]'}`}
                  title="큰 글자"
                >
                  큰글자
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 rounded text-base ${fontSize === 'xlarge' ? 'bg-[#7a8d7c] text-white' : 'text-[#6e6d67] hover:bg-[#e8e6df]'}`}
                  title="아주 큰 글자"
                >
                  왕글자
                </button>
              </div>

              {/* High Contrast Toggle */}
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`p-1.5 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 ${
                  highContrast 
                    ? 'bg-yellow-400 text-black' 
                    : 'text-[#4a544b] hover:bg-[#e8e6df]'
                }`}
                title="고대비 색상 모드"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">고대비</span>
              </button>
            </div>

            {/* Quick Actions (Writing, Printing, PDF Export, and Welfare Submission) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={onFillSample}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#f8f7f2] text-[#7a8d7c] border border-[#7a8d7c] hover:bg-[#f0f2f0] transition flex items-center gap-1 shadow-xs"
                title="예시 작성본 자동으로 채우기"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7a8d7c]" />
                <span className="hidden sm:inline">예시 보기</span>
              </button>

              <button
                onClick={onReset}
                className="p-1.5 rounded-xl text-[#8e8d88] hover:text-[#3d3d3d] hover:bg-[#f8f7f2] border border-[#e8e6df] transition"
                title="처음부터 다시 쓰기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* General Print Button (출력) */}
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition flex items-center gap-1 shadow-2xs"
                title="작성된 이력서 인쇄하기"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>출력 (인쇄)</span>
              </button>

              {/* General PDF Export Button (PDF 저장) */}
              <button
                onClick={onExportPdf}
                disabled={isExportingPdf}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7a8d7c] hover:bg-[#647566] text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                title="작성된 이력서 PDF 파일로 저장"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'PDF 생성 중...' : 'PDF 저장'}</span>
              </button>

              {/* Submit to Welfare Center (복지관 제출 및 데이터 저장) */}
              <button
                onClick={onSubmitResume}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                title="작성한 이력서를 복지관에 온라인으로 제출 및 안전 저장"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '제출 중...' : '복지관 제출'}</span>
              </button>

              {/* QR Code Modal Button */}
              <button
                onClick={onOpenQR}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition flex items-center gap-1 shadow-2xs"
                title="스마트폰 접속용 QR코드 열기"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                <span>QR코드</span>
              </button>

              {/* Admin Mode Switcher Button */}
              <button
                onClick={onOpenAdmin}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shadow-xs ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="수원시장애인종합복지관 실무자 관리자 모드"
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>관리자 화면</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>관리자 모드</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
