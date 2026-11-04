import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { ResumeData, AccessibilityLevel } from './types';
import { SAMPLE_RESUME_DATA } from './data/presets';
import { Header } from './components/Header';
import { QuestionWizard } from './components/QuestionWizard';
import { ResumePreview } from './components/ResumePreview';
import { CloudSyncModal } from './components/CloudSyncModal';
import { exportResumeToPdf, stopSpeech } from './utils/pdfExport';
import { 
  auth, 
  testConnection, 
  fetchUserResumes, 
  isPhotoExpired 
} from './firebase';
import { Heart, Sparkles, FileCheck, HelpCircle, Cloud, AlertCircle, X, ShieldCheck } from 'lucide-react';

const INITIAL_BLANK_RESUME: ResumeData = {
  personal: {
    name: '',
    birthDate: '',
    gender: '남성',
    phone: '',
    emergencyPhone: '',
    address: '',
    disabilityType: '',
    photoUrl: null,
    photoUploadedAt: null,
  },
  jobGoal: {
    desiredJob: '',
    workSchedule: '주 5일 (오전 근무)',
    startDate: '즉시 가능',
  },
  education: {
    schoolName: '',
    graduationStatus: '졸업',
    period: '',
  },
  experiences: [],
  strength: {
    tags: ['⏰ 시간을 잘 지켜요', '😊 인사성이 밝고 친절해요'],
    myStory: '',
  },
  accommodations: {
    supportNeeded: '',
    hobbies: '',
  },
  templateStyle: 'standard',
};

const LOCAL_STORAGE_KEY = 'easy_resume_builder_data_v1';
const ACTIVE_RESUME_ID_KEY = 'easy_resume_active_cloud_id';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: ResumeData = JSON.parse(saved);
        // Check 1-week photo retention on load
        if (parsed.personal?.photoUrl && isPhotoExpired(parsed.personal.photoUploadedAt)) {
          parsed.personal.photoUrl = null;
          parsed.personal.photoUploadedAt = null;
        }
        return parsed;
      }
      return SAMPLE_RESUME_DATA;
    } catch {
      return SAMPLE_RESUME_DATA;
    }
  });

  const [activeTab, setActiveTab] = useState<'wizard' | 'preview'>('wizard');
  const [fontSize, setFontSize] = useState<AccessibilityLevel>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Cloud & Firebase State
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_RESUME_ID_KEY) || null;
  });
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

  // Initial connection test & Auth listener & Weekly Photo Cleanup check
  useEffect(() => {
    testConnection();

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Automatically scan and clean up any photos older than 1 week in Firestore
        fetchUserResumes(currentUser.uid)
          .then(({ cleanedPhotosCount }) => {
            if (cleanedPhotosCount > 0) {
              setNotification({
                message: `개인정보 보호 정책에 따라 1주일이 경과한 사진 파일 ${cleanedPhotosCount}건이 클라우드에서 안전하게 자동 정리되었습니다.`,
                type: 'info',
              });
            }
          })
          .catch((err) => {
            console.warn('Auto photo cleanup check error:', err);
          });
      }
    });

    // Check if the current resume photo has expired (1 week)
    if (resumeData.personal.photoUrl && isPhotoExpired(resumeData.personal.photoUploadedAt)) {
      setResumeData((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          photoUrl: null,
          photoUploadedAt: null,
        },
      }));
      setNotification({
        message: '등록된 증명사진이 보관 기한(1주일)을 경과하여 안전하게 자동 제거되었습니다.',
        type: 'info',
      });
    }

    return () => unsubscribe();
  }, []);

  // Sync activeResumeId with localStorage
  useEffect(() => {
    if (activeResumeId) {
      localStorage.setItem(ACTIVE_RESUME_ID_KEY, activeResumeId);
    } else {
      localStorage.removeItem(ACTIVE_RESUME_ID_KEY);
    }
  }, [activeResumeId]);

  // Auto save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [resumeData]);

  const handleFillSample = () => {
    if (confirm('예시 이력서 내용으로 채우시겠습니까? 작성 중인 내용이 대체됩니다.')) {
      setResumeData(SAMPLE_RESUME_DATA);
      setActiveResumeId(null);
    }
  };

  const handleReset = () => {
    if (confirm('이력서를 처음부터 다시 새로 작성하시겠습니까?')) {
      setResumeData(INITIAL_BLANK_RESUME);
      setActiveResumeId(null);
      setActiveTab('wizard');
    }
  };

  const handleLoadResumeFromCloud = (loadedData: ResumeData, resumeId?: string) => {
    setResumeData(loadedData);
    if (resumeId) {
      setActiveResumeId(resumeId);
    }
    setNotification({
      message: `'${loadedData.personal.name || '알기 쉬운'}' 이력서를 클라우드에서 불러왔습니다.`,
      type: 'success',
    });
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      await new Promise((res) => setTimeout(res, 300));
    }

    const fileName = `${resumeData.personal.name || '알기쉬운'}_이력서.pdf`;
    await exportResumeToPdf('resume-pdf-content', fileName);
    setIsExportingPdf(false);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      highContrast 
        ? 'bg-black text-yellow-300' 
        : 'bg-[#fdfcf9] text-[#3d3d3d]'
    }`}>
      
      {/* Top Header Controls */}
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        isSpeaking={isSpeaking}
        onStopSpeech={stopSpeech}
        onFillSample={handleFillSample}
        onReset={handleReset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
        isLoggedIn={Boolean(user)}
        userName={user?.displayName}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Auto Photo-Removal / Notification Banner */}
        {notification && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Welcome Hero Banner with Cloud Integration Info */}
        <div className={`mb-6 p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
          highContrast
            ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
            : 'bg-[#7a8d7c] text-white border-[#647566]'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
              <Heart className="w-7 h-7 fill-white/20" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                <span>쉬운 질문에 하나씩 답해보세요!</span>
                {user ? (
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    ☁️ 파이어베이스 연동됨
                  </span>
                ) : (
                  <button
                    onClick={() => setIsCloudModalOpen(true)}
                    className="text-[11px] bg-white/25 hover:bg-white/35 px-2 py-0.5 rounded-full font-bold transition flex items-center gap-1"
                  >
                    <Cloud className="w-3 h-3" />
                    <span>클라우드 연동하기</span>
                  </button>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-[#f0f2f0] font-medium mt-0.5">
                복잡한 서식 없이 질문을 보며 작성하면 깔끔한 맞춤형 이력서가 완성됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                activeTab === 'wizard'
                  ? 'bg-white text-[#4a544b]'
                  : 'bg-[#647566] hover:bg-[#536255] text-white'
              }`}
            >
              1. 질문 응답
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                activeTab === 'preview'
                  ? 'bg-white text-[#4a544b]'
                  : 'bg-[#647566] hover:bg-[#536255] text-white'
              }`}
            >
              2. 이력서 미리보기
            </button>
          </div>
        </div>

        {/* Tab Content View Switcher */}
        <AnimatePresence mode="wait">
          {activeTab === 'wizard' ? (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionWizard
                data={resumeData}
                onChange={setResumeData}
                fontSize={fontSize}
                highContrast={highContrast}
                onFinish={() => setActiveTab('preview')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ResumePreview
                data={resumeData}
                onEdit={() => setActiveTab('wizard')}
                onExportPdf={handleExportPdf}
                isExportingPdf={isExportingPdf}
                highContrast={highContrast}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Cloud Sync & Firebase Storage Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        currentResume={resumeData}
        onLoadResume={handleLoadResumeFromCloud}
        activeResumeId={activeResumeId}
        setActiveResumeId={setActiveResumeId}
        highContrast={highContrast}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-semibold">
          수원시장애인종합복지관 알기 쉬운 이력서 작성 프로그램
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          작성하신 정보는 파이어베이스 클라우드 및 브라우저에 안전하게 보관되며, 사진 파일은 개인정보 보호 정책에 따라 1주일 후 자동으로 영구 삭제됩니다.
        </p>
      </footer>
    </div>
  );
}
