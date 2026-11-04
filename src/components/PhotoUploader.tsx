import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Trash2, User, RefreshCw, X, Check, Image as ImageIcon, Sparkles, Shirt, Sliders, AlertCircle, Clock } from 'lucide-react';

interface PhotoUploaderProps {
  photoUrl: string | null;
  photoUploadedAt?: string | null;
  onChangePhoto: (url: string | null) => void;
  highContrast?: boolean;
}

type OutfitStyle = 'white_shirt' | 'black_suit' | 'navy_suit';

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoUrl,
  photoUploadedAt,
  onChangePhoto,
  highContrast = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Outfit Edit Modal State
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [outfitSourceImage, setOutfitSourceImage] = useState<string | null>(null);
  const [previewEditedImage, setPreviewEditedImage] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Template Overlay State (Instant Canvas Editor)
  const [activeTab, setActiveTab] = useState<'ai' | 'template'>('ai');
  const [selectedTemplate, setSelectedTemplate] = useState<OutfitStyle>('white_shirt');
  const [overlayY, setOverlayY] = useState<number>(60); // 0 to 100 percentage from top
  const [overlayScale, setOverlayScale] = useState<number>(100); // 70 to 140 percent
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check 1-week photo expiration policy (7 days)
  useEffect(() => {
    if (photoUrl && photoUploadedAt) {
      const uploadTime = new Date(photoUploadedAt).getTime();
      if (!isNaN(uploadTime)) {
        const diffMs = Date.now() - uploadTime;
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        if (diffMs > sevenDaysMs) {
          onChangePhoto(null);
        }
      }
    }
  }, [photoUrl, photoUploadedAt, onChangePhoto]);

  // Start Live Camera
  const startCamera = async (mode: 'user' | 'environment') => {
    setCameraError(null);
    setCapturedImage(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        '카메라를 실행할 수 없습니다. 카메라 권한을 허용했는지 확인하거나 파일 업로드를 이용해 주세요.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleOpenCameraModal = () => {
    setIsCameraOpen(true);
    startCamera(facingMode);
  };

  const handleCloseCameraModal = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCapturedImage(null);
    setCameraError(null);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
  };

  const handleConfirmCaptured = () => {
    if (capturedImage) {
      onChangePhoto(capturedImage);
      handleCloseCameraModal();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('사진 크기는 5MB 이하의 이미지 파일만 등록할 수 있습니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChangePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChangePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Outfit Editor Modal
  const openOutfitModal = (targetImg: string) => {
    setOutfitSourceImage(targetImg);
    setPreviewEditedImage(targetImg);
    setIsOutfitModalOpen(true);
    setAiError(null);
    setIsAiProcessing(false);
  };

  // Trigger Gemini AI Outfit Edit Endpoint
  const handleAiEditOutfit = async (style: OutfitStyle) => {
    if (!outfitSourceImage) return;
    setIsAiProcessing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/edit-photo-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl: outfitSourceImage,
          outfitStyle: style,
        }),
      });

      const data = await res.json();
      if (res.ok && data.editedImageUrl) {
        setPreviewEditedImage(data.editedImageUrl);
      } else {
        throw new Error(data.error || 'AI 의상 변환에 실패했습니다. 정장 템플릿 모드를 이용해 보세요.');
      }
    } catch (err: any) {
      console.error('AI Outfit Edit Error:', err);
      setAiError(err.message || 'AI 변환 중 오류가 발생했습니다. 아래 템플릿 입히기를 사용해 보세요.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Draw Template Overlay onto Canvas
  const drawTemplateCanvas = () => {
    if (!outfitSourceImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = outfitSourceImage;
    img.onload = () => {
      canvas.width = img.width || 480;
      canvas.height = img.height || 640;

      // Draw base photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw formal collar/suit overlay
      const yPos = (canvas.height * overlayY) / 100;
      const scale = overlayScale / 100;
      const overlayWidth = canvas.width * 0.9 * scale;
      const overlayHeight = canvas.height * 0.45 * scale;
      const xPos = (canvas.width - overlayWidth) / 2;

      ctx.save();
      
      if (selectedTemplate === 'white_shirt') {
        // Draw White Shirt Collar & Upper Chest
        // Shirt body/shoulders
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(xPos, yPos + overlayHeight);
        ctx.lineTo(xPos + overlayWidth * 0.2, yPos + overlayHeight * 0.25);
        ctx.quadraticCurveTo(
          canvas.width / 2,
          yPos + overlayHeight * 0.1,
          xPos + overlayWidth * 0.8,
          yPos + overlayHeight * 0.25
        );
        ctx.lineTo(xPos + overlayWidth, yPos + overlayHeight);
        ctx.closePath();
        ctx.fill();

        // Collar Left
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - overlayWidth * 0.15, yPos + overlayHeight * 0.12);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.22, yPos + overlayHeight * 0.35);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.05, yPos + overlayHeight * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Collar Right
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + overlayWidth * 0.15, yPos + overlayHeight * 0.12);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.22, yPos + overlayHeight * 0.35);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.05, yPos + overlayHeight * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Buttons
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, yPos + overlayHeight * 0.45, 4, 0, Math.PI * 2);
        ctx.arc(canvas.width / 2, yPos + overlayHeight * 0.65, 4, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Suit Jacket (Black or Navy)
        const suitColor = selectedTemplate === 'black_suit' ? '#1E293B' : '#1E3A8A';
        const lapelColor = selectedTemplate === 'black_suit' ? '#0F172A' : '#172554';

        // Inner White Shirt
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - overlayWidth * 0.2, yPos + overlayHeight * 0.15);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.2, yPos + overlayHeight * 0.15);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.1, yPos + overlayHeight);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.1, yPos + overlayHeight);
        ctx.closePath();
        ctx.fill();

        // Tie for Black Suit
        if (selectedTemplate === 'black_suit') {
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 8, yPos + overlayHeight * 0.22);
          ctx.lineTo(canvas.width / 2 + 8, yPos + overlayHeight * 0.22);
          ctx.lineTo(canvas.width / 2 + 12, yPos + overlayHeight * 0.8);
          ctx.lineTo(canvas.width / 2, yPos + overlayHeight * 0.95);
          ctx.lineTo(canvas.width / 2 - 12, yPos + overlayHeight * 0.8);
          ctx.closePath();
          ctx.fill();
        }

        // Left Suit Shoulder & Lapel
        ctx.fillStyle = suitColor;
        ctx.beginPath();
        ctx.moveTo(xPos, yPos + overlayHeight);
        ctx.lineTo(xPos + overlayWidth * 0.18, yPos + overlayHeight * 0.2);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.12, yPos + overlayHeight * 0.25);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.05, yPos + overlayHeight);
        ctx.closePath();
        ctx.fill();

        // Right Suit Shoulder & Lapel
        ctx.beginPath();
        ctx.moveTo(xPos + overlayWidth, yPos + overlayHeight);
        ctx.lineTo(xPos + overlayWidth * 0.82, yPos + overlayHeight * 0.2);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.12, yPos + overlayHeight * 0.25);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.05, yPos + overlayHeight);
        ctx.closePath();
        ctx.fill();

        // Lapels
        ctx.fillStyle = lapelColor;
        ctx.beginPath();
        ctx.moveTo(xPos + overlayWidth * 0.18, yPos + overlayHeight * 0.2);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.12, yPos + overlayHeight * 0.25);
        ctx.lineTo(canvas.width / 2 - overlayWidth * 0.06, yPos + overlayHeight * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(xPos + overlayWidth * 0.82, yPos + overlayHeight * 0.2);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.12, yPos + overlayHeight * 0.25);
        ctx.lineTo(canvas.width / 2 + overlayWidth * 0.06, yPos + overlayHeight * 0.6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };
  };

  const handleApplyTemplateOverlay = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setPreviewEditedImage(finalDataUrl);
  };

  const handleSaveFinalOutfitImage = () => {
    if (previewEditedImage) {
      onChangePhoto(previewEditedImage);
      setIsOutfitModalOpen(false);
      if (isCameraOpen) {
        handleCloseCameraModal();
      }
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-3.5 w-full">
      {/* Photo Preview Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative w-36 h-48 rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden group shadow-sm ${
          highContrast
            ? 'border-yellow-400 bg-zinc-900 text-yellow-300'
            : photoUrl
            ? 'border-[#7a8d7c] bg-[#f8f7f2]'
            : 'border-[#e8e6df] bg-white hover:bg-[#f8f7f2] hover:border-[#7a8d7c]'
        }`}
      >
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt="증명사진"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1.5 p-2">
              <button
                type="button"
                onClick={() => openOutfitModal(photoUrl)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold shadow-xs"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>셔츠/정장 편집</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCameraModal}
                className="w-full py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold"
              >
                <Camera className="w-3 h-3" />
                <span>다시 촬영</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold"
              >
                <Upload className="w-3 h-3" />
                <span>앨범 선택</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-3 text-center flex flex-col items-center gap-2">
            <div className="p-3 bg-[#f0f2f0] text-[#7a8d7c] rounded-full">
              <User className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-[#4a544b]">증명사진 등록</p>
            <p className="text-[11px] text-[#8e8d88] leading-tight">
              카메라로 직접 찍거나<br />사진 파일 선택
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        {/* If Photo Exists: Prominent Outfit Edit Button */}
        {photoUrl && (
          <button
            type="button"
            onClick={() => openOutfitModal(photoUrl)}
            className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm border border-emerald-800"
          >
            <Shirt className="w-4 h-4 text-emerald-200" />
            <span>👔 옷을 하얀 셔츠/정장으로 바꾸기</span>
          </button>
        )}

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={handleOpenCameraModal}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs border ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'bg-[#7a8d7c] hover:bg-[#647566] text-white border-[#7a8d7c]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>카메라 촬영</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 border ${
              highContrast
                ? 'bg-zinc-800 text-yellow-300 border-yellow-400'
                : 'bg-white hover:bg-[#f8f7f2] text-[#4a544b] border-[#e8e6df]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#7a8d7c]" />
            <span>앨범/파일</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="user"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Delete Photo Button */}
      {photoUrl && (
        <button
          type="button"
          onClick={() => onChangePhoto(null)}
          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>등록된 사진 삭제</span>
        </button>
      )}

      {/* 1-Week Photo Auto-Removal Policy Notice */}
      <div className={`w-full max-w-[280px] p-2.5 rounded-xl text-[11px] space-y-1 border ${
        highContrast
          ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
          : 'bg-[#f0f4f1] border-[#c2d6c5] text-[#2d4b33]'
      }`}>
        <div className="flex items-center gap-1.5 font-bold">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>사진 1주일 자동 제거 안내</span>
        </div>
        <p className="text-[#4a544b] leading-tight">
          개인정보 보호와 데이터 관리를 위해 등록된 증명사진은 <strong>1주일(7일) 후 자동 삭제</strong>됩니다.
        </p>
        {photoUrl && photoUploadedAt && (
          <div className="pt-1 border-t border-[#c2d6c5]/60 flex items-center justify-between text-[10px] font-semibold text-emerald-800">
            <span>보관 만료까지:</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-[#c2d6c5]">
              {Math.max(1, 7 - Math.floor((Date.now() - new Date(photoUploadedAt).getTime()) / (24 * 3600 * 1000)))}일 남음
            </span>
          </div>
        )}
      </div>

      {/* LIVE CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col items-center relative border border-[#e8e6df]">
            
            <div className="w-full flex items-center justify-between border-b border-[#e8e6df] pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#4a544b]">
                <div className="p-2 bg-[#f0f2f0] text-[#7a8d7c] rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">증명사진 바로 촬영하기</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCameraModal}
                className="p-1.5 text-[#8e8d88] hover:text-[#3d3d3d] hover:bg-[#f8f7f2] rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {cameraError ? (
              <div className="text-center py-8 px-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 space-y-4">
                <p className="text-sm font-semibold">{cameraError}</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[#7a8d7c] text-white rounded-xl font-bold text-sm"
                  >
                    기기 기본 카메라 앱으로 촬영하기
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            ) : capturedImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-4 border-[#7a8d7c] shadow-lg bg-black">
                  <img
                    src={capturedImage}
                    alt="촬영된 사진"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-[11px] text-center py-1 rounded font-medium">
                    미리보기
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => openOutfitModal(capturedImage)}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Shirt className="w-4 h-4 text-emerald-200" />
                    <span>👔 촬영 후 바로 옷(셔츠/정장) 바꾸기</span>
                  </button>

                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 py-2.5 bg-[#f8f7f2] hover:bg-[#e8e6df] text-[#4a544b] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>다시 찍기</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCaptured}
                      className="flex-1 py-2.5 bg-[#7a8d7c] hover:bg-[#647566] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>이대로 등록</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-full aspect-[3/4] max-h-[360px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-[#e8e6df]">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`w-full h-full object-cover ${
                      facingMode === 'user' ? '-scale-x-100' : ''
                    }`}
                  />

                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    <div className="w-36 h-48 rounded-[50%] border-2 border-dashed border-[#7a8d7c]/80 bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full font-medium">
                        얼굴을 맞춰주세요
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                    title="전면/후면 카메라 전환"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSnap}
                  className="px-8 py-3.5 bg-[#7a8d7c] hover:bg-[#647566] text-white rounded-full font-bold text-base transition flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  <span>📸 사진 찍기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OUTFIT EDIT & SUIT TRANSFORMATION MODAL */}
      {isOutfitModalOpen && outfitSourceImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col relative my-auto border border-[#e8e6df]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e8e6df] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">이력서용 의상(셔츠/정장) 편집</h3>
                  <p className="text-xs text-slate-500">평복/사복 사진을 단정한 하얀 셔츠나 정장 차림으로 바꿉니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutfitModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex border-b border-slate-200 mb-4 bg-slate-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'ai'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>✨ AI 자동 옷 변환</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('template');
                  setTimeout(drawTemplateCanvas, 50);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'template'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>🎨 정장 템플릿 즉시 입히기</span>
              </button>
            </div>

            {/* MAIN CONTENT BASED ON TAB */}
            {activeTab === 'ai' ? (
              <div className="space-y-4">
                {/* AI Preview Area */}
                <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-4 min-h-[260px] relative overflow-hidden">
                  {isAiProcessing ? (
                    <div className="flex flex-col items-center gap-3 text-white text-center p-6">
                      <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
                      <p className="text-sm font-bold text-emerald-200">
                        AI가 사진을 단정한 하얀 셔츠/정장 차림으로 바꾸고 있습니다...
                      </p>
                      <p className="text-xs text-slate-400">
                        얼굴과 헤어스타일은 그대로 유지하며 의상만 깔끔하게 다듬어 드립니다. (약 3~5초 소요)
                      </p>
                    </div>
                  ) : previewEditedImage ? (
                    <div className="relative w-44 h-56 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-xl bg-black">
                      <img
                        src={previewEditedImage}
                        alt="의상 편집 미리보기"
                        className="w-full h-full object-cover"
                      />
                      {previewEditedImage !== outfitSourceImage && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-bold shadow-xs">
                          ✨ AI 변환 완료
                        </span>
                      )}
                    </div>
                  ) : null}

                  {aiError && (
                    <div className="mt-3 p-3 bg-red-900/80 border border-red-500 rounded-xl text-red-100 text-xs text-center flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
                      <span>{aiError}</span>
                    </div>
                  )}
                </div>

                {/* AI Style Selection Buttons */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    원하시는 의상 스타일을 선택해 주세요 (클릭 시 AI가 자동 합성합니다)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={() => handleAiEditOutfit('white_shirt')}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl text-center transition flex flex-col items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="text-2xl">👔</span>
                      <span className="text-xs font-bold text-slate-800">단정한 하얀 셔츠</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={() => handleAiEditOutfit('black_suit')}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl text-center transition flex flex-col items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="text-2xl">🧥</span>
                      <span className="text-xs font-bold text-slate-800">검정 정장 + 넥타이</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAiProcessing}
                      onClick={() => handleAiEditOutfit('navy_suit')}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl text-center transition flex flex-col items-center gap-1.5 disabled:opacity-50"
                    >
                      <span className="text-2xl">👔</span>
                      <span className="text-xs font-bold text-slate-800">남색/네이비 정장</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TEMPLATE OVERLAY TAB */
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-3 min-h-[260px] relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-44 h-56 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-xl bg-black object-cover"
                  />
                  <p className="text-[11px] text-slate-300 mt-2">
                    슬라이더를 조절하여 셔츠/정장 위치를 얼굴 아래에 딱 맞춰주세요.
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. 의상 종류 선택
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplate('white_shirt');
                          setTimeout(drawTemplateCanvas, 10);
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                          selectedTemplate === 'white_shirt'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        👔 하얀 셔츠
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplate('black_suit');
                          setTimeout(drawTemplateCanvas, 10);
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                          selectedTemplate === 'black_suit'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        🧥 검정 정장
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplate('navy_suit');
                          setTimeout(drawTemplateCanvas, 10);
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                          selectedTemplate === 'navy_suit'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        👔 네이비 정장
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>2. 옷 높이 조절 (Y축)</span>
                      <span>{overlayY}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="85"
                      value={overlayY}
                      onChange={(e) => {
                        setOverlayY(Number(e.target.value));
                        setTimeout(drawTemplateCanvas, 10);
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>3. 어깨/옷 크기 조절</span>
                      <span>{overlayScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      value={overlayScale}
                      onChange={(e) => {
                        setOverlayScale(Number(e.target.value));
                        setTimeout(drawTemplateCanvas, 10);
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyTemplateOverlay}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    이 위치로 템플릿 적용하기
                  </button>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => setIsOutfitModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveFinalOutfitImage}
                disabled={isAiProcessing}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>이 사진으로 이력서 등록하기</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

