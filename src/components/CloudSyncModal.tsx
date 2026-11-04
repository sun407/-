import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  LogOut, 
  LogIn, 
  Plus, 
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  saveResumeToFirestore, 
  fetchUserResumes, 
  deleteResumeFromFirestore, 
  purgeExpiredPhotosNow,
  isPhotoExpired,
  PHOTO_RETENTION_MS,
  CloudResumeRecord 
} from '../firebase';
import { ResumeData } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResume: ResumeData;
  onLoadResume: (resume: ResumeData, resumeId?: string) => void;
  activeResumeId: string | null;
  setActiveResumeId: (id: string | null) => void;
  highContrast?: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  currentResume,
  onLoadResume,
  activeResumeId,
  setActiveResumeId,
  highContrast = false,
}) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [resumes, setResumes] = useState<CloudResumeRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [resumeTitle, setResumeTitle] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isCleaningPhotos, setIsCleaningPhotos] = useState<boolean>(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadResumes(currentUser.uid);
      } else {
        setResumes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update default title when opening or changing currentResume
  useEffect(() => {
    if (isOpen) {
      const defaultName = currentResume.personal.name.trim();
      setResumeTitle(defaultName ? `${defaultName} 님의 이력서` : '알기 쉬운 내 이력서');
      if (auth.currentUser) {
        loadResumes(auth.currentUser.uid);
      }
    }
  }, [isOpen, currentResume]);

  const loadResumes = async (uid: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const { resumes: fetched, cleanedPhotosCount } = await fetchUserResumes(uid);
      setResumes(fetched);
      if (cleanedPhotosCount > 0) {
        setStatusMessage({
          text: `1주일이 경과한 사진 ${cleanedPhotosCount}장이 정책에 따라 자동으로 안전하게 정리되었습니다.`,
          type: 'info',
        });
      }
    } catch (err: any) {
      console.error('Error loading resumes:', err);
      setStatusMessage({
        text: '클라우드 데이터를 불러오지 못했습니다. 네트워크를 확인해 주세요.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setStatusMessage({ text: `${loggedUser.displayName || '사용자'} 님 환영합니다!`, type: 'success' });
        await loadResumes(loggedUser.uid);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ text: '로그인에 실패했습니다. 다시 시도해 주세요.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logoutUser();
      setUser(null);
      setResumes([]);
      setActiveResumeId(null);
      setStatusMessage({ text: '로그아웃 되었습니다.', type: 'info' });
    }
  };

  const handleSaveToCloud = async (saveAsNew: boolean = false) => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const docId = (saveAsNew || !activeResumeId) ? `resume_${Date.now()}` : activeResumeId;
      const titleToSave = resumeTitle.trim() || '알기 쉬운 이력서';
      
      const savedRecord = await saveResumeToFirestore(
        user.uid,
        docId,
        titleToSave,
        currentResume,
        currentResume.personal.photoUploadedAt
      );

      setActiveResumeId(docId);
      setStatusMessage({
        text: `파이어베이스 클라우드에 성공적으로 저장되었습니다. (사진은 1주일간 보관됩니다)`,
        type: 'success',
      });
      await loadResumes(user.uid);
    } catch (err: any) {
      console.error('Save error:', err);
      setStatusMessage({
        text: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async (resumeId: string, title: string) => {
    if (!user) return;
    if (confirm(`'${title}' 이력서를 정말 삭제하시겠습니까?`)) {
      try {
        await deleteResumeFromFirestore(user.uid, resumeId);
        if (activeResumeId === resumeId) {
          setActiveResumeId(null);
        }
        setResumes((prev) => prev.filter((r) => r.id !== resumeId));
        setStatusMessage({ text: '이력서가 삭제되었습니다.', type: 'info' });
      } catch (err) {
        console.error(err);
        setStatusMessage({ text: '삭제에 실패했습니다.', type: 'error' });
      }
    }
  };

  const handleSelectResume = (record: CloudResumeRecord) => {
    // Check if the photo was expired
    const cloned = JSON.parse(JSON.stringify(record.resumeData)) as ResumeData;
    if (cloned.personal.photoUrl && isPhotoExpired(record.photoUploadedAt)) {
      cloned.personal.photoUrl = null;
      cloned.personal.photoUploadedAt = null;
    }
    
    onLoadResume(cloned, record.id);
    setActiveResumeId(record.id);
    onClose();
  };

  const handlePurgeExpiredPhotos = async () => {
    if (!user) return;
    setIsCleaningPhotos(true);
    try {
      const count = await purgeExpiredPhotosNow(user.uid);
      if (count > 0) {
        setStatusMessage({
          text: `총 ${count}개의 1주일 지난 사진이 데이터베이스에서 자동 정리되었습니다.`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: '현재 1주일이 경과하여 삭제 대상인 사진이 없습니다.',
          type: 'info',
        });
      }
      await loadResumes(user.uid);
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: '사진 정리 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsCleaningPhotos(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl transition-all my-auto border ${
        highContrast
          ? 'bg-zinc-950 text-yellow-300 border-yellow-400'
          : 'bg-white text-[#3d3d3d] border-[#e8e6df]'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e8e6df] mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-[#7a8d7c] text-white shadow-xs'
            }`}>
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>파이어베이스 클라우드 보관함</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Firebase Firestore
                </span>
              </h3>
              <p className="text-xs text-[#8e8d88] mt-0.5">
                작성 중인 이력서를 클라우드에 안전하게 보관하고 다른 기기에서도 언제든 불러옵니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8e8d88] hover:text-[#3d3d3d] hover:bg-[#f8f7f2] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1-Week Photo Automatic Expiry Policy Notice */}
        <div className={`p-4 rounded-2xl mb-5 flex items-start gap-3 border ${
          highContrast
            ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
            : 'bg-[#f0f4f1] border-[#c2d6c5] text-[#2d4b33]'
        }`}>
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
              <span>사진 파일 1주일 자동 제거 정책 안내</span>
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-semibold">
                자동 관리
              </span>
            </p>
            <p>
              데이터베이스 용량 절약 및 이용자의 소중한 개인정보 보호를 위해, 등록된 증명사진은 
              <strong> 1주일(7일) 동안 보관된 후 자동으로 데이터베이스에서 제거</strong>됩니다. 
              작성하신 인적사항, 학력, 경력 등 이력서 텍스트 내용은 영구히 안전하게 보존됩니다.
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Not Logged In View */}
        {!user ? (
          <div className="text-center py-8 px-4 bg-[#f8f7f2] rounded-2xl border border-[#e8e6df] space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-white flex items-center justify-center text-[#7a8d7c] shadow-xs">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#4a544b]">
                구글 계정으로 로그인하여 시작하세요
              </h4>
              <p className="text-xs text-[#8e8d88] mt-1 max-w-sm mx-auto">
                로그인하시면 작성한 이력서를 파이어베이스에 안전하게 자동 저장하고, 
                사진 파일 1주일 자동 파기 관리를 받으실 수 있습니다.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="px-6 py-3 bg-[#7a8d7c] hover:bg-[#647566] text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 mx-auto shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>로그인 진행 중...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>구글 계정으로 로그인하기</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Logged In View */
          <div className="space-y-6">
            
            {/* User Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#f8f7f2] rounded-2xl border border-[#e8e6df]">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="프로필" className="w-9 h-9 rounded-full border border-white shadow-xs" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#7a8d7c] text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#4a544b]">
                    {user.displayName || '사용자'} 님
                  </p>
                  <p className="text-[11px] text-[#8e8d88]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePurgeExpiredPhotos}
                  disabled={isCleaningPhotos}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition flex items-center gap-1 shadow-2xs"
                  title="일주일 지난 사진들을 즉시 점검하고 정리합니다"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCleaningPhotos ? 'animate-spin' : ''}`} />
                  <span>만료 사진 정리 검사</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>

            {/* Save Current Resume Section */}
            <div className="p-4 bg-white rounded-2xl border border-[#e8e6df] shadow-xs space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-[#4a544b] flex items-center justify-between">
                <span>현재 작성 중인 이력서 저장</span>
                {activeResumeId && (
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                    현재 연결된 클라우드 문서
                  </span>
                )}
              </h4>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="이력서 이름을 입력하세요 (예: 홍길동 2026 이력서)"
                  className="flex-1 px-3 py-2 text-xs sm:text-sm border rounded-xl font-medium focus:ring-2 focus:ring-[#7a8d7c] outline-hidden bg-[#fdfcf9] border-[#e8e6df]"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveToCloud(false)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#7a8d7c] hover:bg-[#647566] text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudCheck className="w-4 h-4" />
                    )}
                    <span>{activeResumeId ? '수정 내용 저장' : '클라우드 저장'}</span>
                  </button>

                  {activeResumeId && (
                    <button
                      onClick={() => handleSaveToCloud(true)}
                      disabled={isSaving}
                      className="px-3 py-2 bg-white hover:bg-[#f8f7f2] text-[#4a544b] border border-[#e8e6df] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shrink-0"
                      title="새로운 별도 이력서로 복사하여 저장합니다"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>새로 저장</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Resumes List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs sm:text-sm font-bold text-[#4a544b] flex items-center gap-1.5">
                  <span>저장된 이력서 목록</span>
                  <span className="text-xs bg-[#f0f2f0] text-[#7a8d7c] px-2 py-0.5 rounded-full font-bold">
                    {resumes.length}건
                  </span>
                </h4>
                <button
                  onClick={() => loadResumes(user.uid)}
                  className="text-xs text-[#7a8d7c] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>새로고침</span>
                </button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-xs text-[#8e8d88] flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#7a8d7c]" />
                  <span>클라우드에서 이력서를 불러오는 중...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="py-8 text-center bg-[#f8f7f2] rounded-2xl border border-[#e8e6df] text-xs text-[#8e8d88]">
                  저장된 이력서가 없습니다. 위의 저장 버튼을 눌러 첫 번째 이력서를 클라우드에 보관해 보세요!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {resumes.map((rec) => {
                    const isSelected = activeResumeId === rec.id;
                    const hasPhoto = Boolean(rec.resumeData?.personal?.photoUrl);
                    
                    // Photo expiration calculation
                    let photoNotice = '사진 없음';
                    let isExpiringSoon = false;
                    if (hasPhoto && rec.photoUploadedAt) {
                      const uploadTime = new Date(rec.photoUploadedAt).getTime();
                      const daysLeft = 7 - Math.floor((Date.now() - uploadTime) / (24 * 3600 * 1000));
                      if (daysLeft <= 0) {
                        photoNotice = '만료됨 (자동 제거 예정)';
                      } else {
                        photoNotice = `사진 보관 중 (${daysLeft}일 후 자동 삭제)`;
                        if (daysLeft <= 2) isExpiringSoon = true;
                      }
                    } else if (!hasPhoto && rec.photoUploadedAt) {
                      photoNotice = '1주일 경과로 사진 자동 제거됨';
                    }

                    return (
                      <div
                        key={rec.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#f0f4f1] border-[#7a8d7c] ring-1 ring-[#7a8d7c]'
                            : 'bg-white hover:bg-[#fcfbf7] border-[#e8e6df]'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-[#3d3d3d] truncate">
                              {rec.title}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-[#7a8d7c] text-white px-2 py-0.2 rounded-full font-bold">
                                현재 열림
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-[#8e8d88] mt-1 flex-wrap">
                            <span>작성자: {rec.resumeData?.personal?.name || '미입력'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(rec.updatedAt).toLocaleDateString('ko-KR')}
                            </span>
                            <span>•</span>
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              hasPhoto 
                                ? isExpiringSoon ? 'text-amber-600' : 'text-emerald-700'
                                : 'text-slate-400'
                            }`}>
                              <ImageIcon className="w-3 h-3" />
                              <span>{photoNotice}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleSelectResume(rec)}
                            className="px-3 py-1.5 bg-[#7a8d7c] hover:bg-[#647566] text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>불러오기</span>
                          </button>
                          <button
                            onClick={() => handleDeleteResume(rec.id, rec.title)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                            title="이력서 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#e8e6df] flex items-center justify-between text-xs text-[#8e8d88]">
          <p>수원시장애인종합복지관 클라우드 연동</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
