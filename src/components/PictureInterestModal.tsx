/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Client, PictureInterestPDF } from '../types';
import {
  FileText,
  UploadCloud,
  X,
  Trash2,
  Calendar,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  ArrowLeft
} from 'lucide-react';
import PDFViewer from './PDFViewer';

interface PictureInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  pdfList: PictureInterestPDF[];
  initialPdfId?: string | null;
  initialShowUpload?: boolean;
  onSavePdf: (newPdf: PictureInterestPDF) => void;
  onDeletePdf: (id: string) => void;
}

export default function PictureInterestModal({
  isOpen,
  onClose,
  client,
  pdfList,
  initialPdfId,
  initialShowUpload = false,
  onSavePdf,
  onDeletePdf,
}: PictureInterestModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for uploading
  const [testDate, setTestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [evaluatorName, setEvaluatorName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Viewing selected PDF state
  const [viewingPdf, setViewingPdf] = useState<PictureInterestPDF | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Filter PDFs for current client
  const clientPdfs = client ? pdfList.filter((p) => p.clientId === client.id) : [];

  // Synchronize viewing PDF and mode when modal opens or client changes
  useEffect(() => {
    if (!isOpen || !client) return;

    if (initialShowUpload) {
      setShowUploadForm(true);
    } else if (initialPdfId) {
      const match = clientPdfs.find((p) => p.id === initialPdfId);
      if (match) {
        setViewingPdf(match);
        setShowUploadForm(false);
      } else if (clientPdfs.length > 0) {
        setViewingPdf(clientPdfs[0]);
        setShowUploadForm(false);
      } else {
        setShowUploadForm(true);
      }
    } else if (clientPdfs.length > 0) {
      setViewingPdf(clientPdfs[0]);
      setShowUploadForm(false);
    } else {
      setShowUploadForm(true);
    }
  }, [isOpen, client?.id, initialPdfId, initialShowUpload, pdfList.length]);

  if (!isOpen || !client) return null;

  const handleFileChange = (file: File) => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImg = file.type.startsWith('image/');

    if (!isPdf && !isImg) {
      alert('PDF 문서 또는 이미지 파일(.pdf, .jpg, .png)만 업로드할 수 있습니다.');
      return;
    }

    setSelectedFile(file);

    // Calculate formatted file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 25) {
      alert('파일 용량이 25MB를 초과합니다. 25MB 이하의 파일을 선택해 주세요.');
      setSelectedFile(null);
      return;
    }

    const formattedSize =
      sizeInMB >= 1 ? `${sizeInMB.toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB`;
    setFileSizeStr(formattedSize);

    // Read as Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFileDataUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileDataUrl) {
      alert('업로드할 PDF 또는 이미지 파일을 선택해 주세요.');
      return;
    }

    setIsUploading(true);

    const newRecord: PictureInterestPDF = {
      id: `pipdf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      clientId: client.id,
      testDate: testDate || new Date().toISOString().split('T')[0],
      evaluatorName: evaluatorName.trim() || '담당 평가사',
      fileName: selectedFile.name,
      fileData: fileDataUrl,
      fileSize: fileSizeStr,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSavePdf(newRecord);
      setViewingPdf(newRecord);
      // Reset form
      setSelectedFile(null);
      setFileDataUrl('');
      setNotes('');
      setShowUploadForm(false);
      setIsUploading(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  그림직업흥미검사 결과지 관리
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-extrabold">
                  훈련생: {client.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                수검된 그림직업흥미검사 PDF 보고서를 개별 파일로 보관하고 상시 열람합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-900">
          {/* Left Sidebar: PDF Document List */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/60 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-400" />
                검사지 목록 ({clientPdfs.length}건)
              </span>
              <button
                onClick={() => {
                  setShowUploadForm(true);
                  setSelectedFile(null);
                  setFileDataUrl('');
                }}
                className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                신규 업로드
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {clientPdfs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 p-4">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                  <p className="text-xs font-bold text-slate-400">보관된 검사지가 없습니다</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    '신규 업로드' 버튼을 눌러 PDF 파일을 등록해주세요.
                  </p>
                </div>
              ) : (
                clientPdfs.map((pdf) => {
                  const isSelected = viewingPdf?.id === pdf.id && !showUploadForm;
                  return (
                    <div
                      key={pdf.id}
                      onClick={() => {
                        setViewingPdf(pdf);
                        setShowUploadForm(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-teal-950/60 border-teal-500 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          검사일: {pdf.testDate}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`'${pdf.fileName}' 결과지 파일을 삭제하시겠습니까?`)) {
                              onDeletePdf(pdf.id);
                              if (viewingPdf?.id === pdf.id) {
                                const remaining = clientPdfs.filter((p) => p.id !== pdf.id);
                                setViewingPdf(remaining.length > 0 ? remaining[0] : null);
                                if (remaining.length === 0) setShowUploadForm(true);
                              }
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 opacity-70 group-hover:opacity-100 transition-opacity"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 truncate" title={pdf.fileName}>
                        {pdf.fileName}
                      </h4>

                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>평가사: {pdf.evaluatorName}</span>
                        <span>{pdf.fileSize}</span>
                      </div>

                      {pdf.notes && (
                        <p className="text-[10px] text-slate-400/90 mt-1.5 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800 truncate">
                          {pdf.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Content Area: Viewer or Upload Form */}
          <div className="flex-1 overflow-hidden p-3 md:p-5 flex flex-col">
            {showUploadForm ? (
              /* Upload Form View */
              <div className="flex-1 overflow-y-auto bg-slate-950/60 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center max-w-2xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-teal-400" />
                      그림직업흥미검사 PDF 파일 업로드
                    </h4>
                    {clientPdfs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowUploadForm(false)}
                        className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        목록으로 돌아가기
                      </button>
                    )}
                  </div>

                  {/* Drag & Drop File Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-teal-400 bg-teal-950/40'
                        : selectedFile
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-slate-700 hover:border-teal-500 bg-slate-900/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                        <div className="font-extrabold text-sm text-white">{selectedFile.name}</div>
                        <span className="text-xs text-slate-400 block font-mono">{fileSizeStr}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setFileDataUrl('');
                          }}
                          className="text-xs font-bold text-rose-400 hover:underline mt-1 inline-block"
                        >
                          다른 파일 선택하기
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud className="w-12 h-12 text-teal-400 mx-auto" />
                        <div className="font-extrabold text-sm text-slate-200">
                          여기로 PDF 파일을 끌어다 놓거나 <span className="text-teal-400 underline">클릭하여 선택</span>하세요.
                        </div>
                        <p className="text-xs text-slate-400">
                          지원 포맷: PDF 파일 및 이미지 문서 (최대 25MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Inputs: Test Date & Evaluator Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        검사 일자 <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        담당 평가사 성명
                      </label>
                      <input
                        type="text"
                        value={evaluatorName}
                        onChange={(e) => setEvaluatorName(e.target.value)}
                        placeholder="예: 홍길동 평가사"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      검사 소견 및 주요 흥미 영역 (선택)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="예: 실무형/예술형 높은 흥미도 보임. 세부 작업 환경 선호..."
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (clientPdfs.length > 0) setShowUploadForm(false);
                        else onClose();
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-4 h-4" />
                      {isUploading ? '저장 및 렌더링 중...' : 'PDF 등록 및 보관'}
                    </button>
                  </div>
                </form>
              </div>
            ) : viewingPdf ? (
              /* Selected PDF Viewer View */
              <div className="flex-1 flex flex-col h-full space-y-2 overflow-hidden">
                {/* Info Bar */}
                <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <div>
                      <h4 className="text-xs font-black text-white">{viewingPdf.fileName}</h4>
                      <p className="text-[11px] text-slate-400">
                        검사일: <span className="text-teal-300 font-bold">{viewingPdf.testDate}</span> | 평가사: <span className="text-slate-200 font-bold">{viewingPdf.evaluatorName}</span> ({viewingPdf.fileSize})
                      </p>
                    </div>
                  </div>

                  {viewingPdf.notes && (
                    <div className="text-[11px] bg-teal-950/50 border border-teal-800/60 text-teal-200 px-3 py-1 rounded-xl max-w-md truncate">
                      <span className="font-bold text-teal-400 mr-1">소견:</span>
                      {viewingPdf.notes}
                    </div>
                  )}
                </div>

                {/* PDF Viewer Component */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <PDFViewer
                    dataUrl={viewingPdf.fileData}
                    fileName={viewingPdf.fileName}
                    title={`${client.name} - ${viewingPdf.testDate}`}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                <FileText className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-300">등록된 그림직업흥미검사 결과지가 없습니다.</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  새 PDF 파일 업로드하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
