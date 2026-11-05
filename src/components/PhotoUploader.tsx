import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  User, 
  RefreshCw, 
  X, 
  Check, 
  Image as ImageIcon, 
  Clock,
  Sparkles,
  Palette,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { 
  replacePhotoBackground, 
  BACKGROUND_OPTIONS, 
  StudioBackgroundType 
} from '../utils/backgroundReplacer';

interface PhotoUploaderProps {
  photoUrl: string | null;
  photoUploadedAt?: string | null;
  onChangePhoto: (url: string | null) => void;
  highContrast?: boolean;
}

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
  const [originalCapturedImage, setOriginalCapturedImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Background Processing State
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [selectedBgInCamera, setSelectedBgInCamera] = useState<StudioBackgroundType | null>(null);

  // Standalone Background Editor Modal State (for existing/uploaded photos)
  const [isBgEditorOpen, setIsBgEditorOpen] = useState(false);
  const [bgEditorSourceImage, setBgEditorSourceImage] = useState<string | null>(null);
  const [bgEditorPreviewImage, setBgEditorPreviewImage] = useState<string | null>(null);
  const [selectedEditorBg, setSelectedEditorBg] = useState<StudioBackgroundType>('blue');
  const [bgEditorError, setBgEditorError] = useState<string | null>(null);

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
    setOriginalCapturedImage(null);
    setSelectedBgInCamera(null);

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
    setOriginalCapturedImage(null);
    setCameraError(null);
    setSelectedBgInCamera(null);
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
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setOriginalCapturedImage(dataUrl);
    setCapturedImage(dataUrl);
    setSelectedBgInCamera(null);
  };

  // Replace background right after capturing
  const handleApplyBackgroundInCamera = async (bgType: StudioBackgroundType) => {
    if (!originalCapturedImage) return;
    setIsProcessingBg(true);
    setSelectedBgInCamera(bgType);

    try {
      const result = await replacePhotoBackground(originalCapturedImage, bgType);
      setCapturedImage(result);
    } catch (err) {
      console.error('Background replacement failed:', err);
      alert('배경 변경 중 오류가 발생했습니다. 원본 사진을 사용합니다.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleRevertToOriginalInCamera = () => {
    if (originalCapturedImage) {
      setCapturedImage(originalCapturedImage);
      setSelectedBgInCamera(null);
    }
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

  // Open standalone background editor for currently registered photo
  const handleOpenBgEditor = (targetImg: string) => {
    setBgEditorSourceImage(targetImg);
    setBgEditorPreviewImage(targetImg);
    setSelectedEditorBg('blue');
    setIsBgEditorOpen(true);
    setBgEditorError(null);
  };

  const handleApplyEditorBackground = async (bgType: StudioBackgroundType) => {
    if (!bgEditorSourceImage) return;
    setIsProcessingBg(true);
    setSelectedEditorBg(bgType);
    setBgEditorError(null);

    try {
      const result = await replacePhotoBackground(bgEditorSourceImage, bgType);
      setBgEditorPreviewImage(result);
    } catch (err: any) {
      console.error('Background editor error:', err);
      setBgEditorError('배경 변환 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleSaveEditorPhoto = () => {
    if (bgEditorPreviewImage) {
      onChangePhoto(bgEditorPreviewImage);
      setIsBgEditorOpen(false);
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
                onClick={() => handleOpenBgEditor(photoUrl)}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold shadow-xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>배경 스튜디오 변환</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCameraModal}
                className="w-full py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-1 text-xs font-bold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>다시 촬영</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center gap-1 text-xs font-bold"
              >
                <Upload className="w-3.5 h-3.5" />
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
        {/* If Photo Exists: Prominent Studio Background Transform Button */}
        {photoUrl && (
          <button
            type="button"
            onClick={() => handleOpenBgEditor(photoUrl)}
            className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm border border-blue-700"
          >
            <Palette className="w-4 h-4 text-blue-200" />
            <span>✨ 배경을 증명사진(스튜디오)으로 변경</span>
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

      {/* LIVE CAMERA MODAL (with Studio Background Replacement feature) */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col items-center relative border border-[#e8e6df] my-auto">
            
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
                
                {/* Photo Preview Container with Processing State */}
                <div className="relative w-48 h-64 rounded-2xl overflow-hidden border-4 border-[#7a8d7c] shadow-lg bg-black">
                  <img
                    src={capturedImage}
                    alt="촬영된 사진"
                    className="w-full h-full object-cover"
                  />

                  {isProcessingBg && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2 p-3 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                      <span>증명사진 스튜디오 배경으로 정리 중...</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-[11px] text-center py-1 rounded font-medium">
                    {selectedBgInCamera ? '✨ 스튜디오 배경 적용됨' : '촬영 완료 미리보기'}
                  </div>
                </div>

                {/* Studio Background Selector Panel */}
                <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>배경을 증명사진 스타일로 변경</span>
                    </span>
                    {selectedBgInCamera && (
                      <button
                        type="button"
                        onClick={handleRevertToOriginalInCamera}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5 underline font-medium"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>원본 배경</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    방 안이나 야외 배경을 깔끔한 단색/그라데이션 증명사진 배경으로 바꿔줍니다.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {BACKGROUND_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isProcessingBg}
                        onClick={() => handleApplyBackgroundInCamera(opt.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                          selectedBgInCamera === opt.id
                            ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border border-slate-300 shrink-0 ${
                          opt.id === 'white' ? 'bg-white' : `bg-gradient-to-br ${opt.previewColor}`
                        }`} />
                        <span className="truncate">{opt.label.split(' ')[0]} {opt.label.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm & Retake Buttons */}
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setOriginalCapturedImage(null);
                      setSelectedBgInCamera(null);
                    }}
                    className="flex-1 py-3 bg-[#f8f7f2] hover:bg-[#e8e6df] text-[#4a544b] font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>다시 찍기</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCaptured}
                    disabled={isProcessingBg}
                    className="flex-1 py-3 bg-[#7a8d7c] hover:bg-[#647566] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>이 사진으로 등록</span>
                  </button>
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

                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-500">
                    💡 사진을 찍은 후 배경을 깔끔한 증명사진 배경으로 바꿀 수 있습니다.
                  </p>
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

      {/* STANDALONE BACKGROUND CONVERTER MODAL (for registered or uploaded photos) */}
      {isBgEditorOpen && bgEditorSourceImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col relative border border-[#e8e6df] my-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    증명사진 스튜디오 배경 변경
                  </h3>
                  <p className="text-xs text-slate-500">
                    배경을 깔끔한 정규 증명사진 스타일로 다듬습니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBgEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bgEditorError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bgEditorError}</span>
              </div>
            )}

            {/* Preview Area */}
            <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-4 min-h-[260px] relative overflow-hidden mb-4">
              {isProcessingBg ? (
                <div className="flex flex-col items-center gap-2 text-white text-center p-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                  <p className="text-xs font-bold text-blue-200">
                    배경을 증명사진 스튜디오 톤으로 정리하고 있습니다...
                  </p>
                </div>
              ) : bgEditorPreviewImage ? (
                <div className="relative w-44 h-56 rounded-xl overflow-hidden border-2 border-blue-400 shadow-xl bg-black">
                  <img
                    src={bgEditorPreviewImage}
                    alt="스튜디오 배경 변환 미리보기"
                    className="w-full h-full object-cover"
                  />
                  {bgEditorPreviewImage !== bgEditorSourceImage && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold shadow-xs">
                      ✨ 배경 적용 완료
                    </span>
                  )}
                </div>
              ) : null}
            </div>

            {/* Background Style Options */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold text-slate-700">
                원하시는 스튜디오 배경을 선택해 주세요 (클릭 시 자동 합성됩니다)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BACKGROUND_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isProcessingBg}
                    onClick={() => handleApplyEditorBackground(opt.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      selectedEditorBg === opt.id && bgEditorPreviewImage !== bgEditorSourceImage
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border border-slate-300 mt-0.5 shrink-0 ${
                      opt.id === 'white' ? 'bg-white' : `bg-gradient-to-br ${opt.previewColor}`
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save / Cancel Footer */}
            <div className="flex gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBgEditorOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveEditorPhoto}
                disabled={isProcessingBg || bgEditorPreviewImage === bgEditorSourceImage}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>이 배경으로 저장</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
