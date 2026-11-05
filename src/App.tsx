import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { ResumeData, AccessibilityLevel } from './types';
import { SAMPLE_RESUME_DATA } from './data/presets';
import { Header } from './components/Header';
import { QuestionWizard } from './components/QuestionWizard';
import { ResumePreview } from './components/ResumePreview';
import { AdminWorkspace } from './components/AdminWorkspace';
import { AdminLoginModal } from './components/AdminLoginModal';
import { QRCodeModal } from './components/QRCodeModal';
import { exportResumeToPdf, stopSpeech } from './utils/pdfExport';
import { 
  auth, 
  testConnection, 
  isPhotoExpired, 
  isUserAdmin, 
  submitApplicantResume,
  saveResumeToFirestore,
  CloudResumeRecord,
  ADMIN_EMAILS
} from './firebase';
import { Heart, Sparkles, FileCheck, HelpCircle, AlertCircle, X, ShieldCheck, CheckCircle2, Save, ArrowLeft, Send, QrCode } from 'lucide-react';

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
const ADMIN_SESSION_KEY = 'suwon_admin_auth_session';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: ResumeData = JSON.parse(saved);
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Admin Mode States
  const [isAdminModeActive, setIsAdminModeActive] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
  });
  const [editingAdminRecord, setEditingAdminRecord] = useState<CloudResumeRecord | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  // General Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'alert' } | null>(null);

  // Firebase Auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser && isUserAdmin(currentUser)) {
        setAdminEmail(currentUser.email || ADMIN_EMAILS[0]);
        sessionStorage.setItem(ADMIN_SESSION_KEY, currentUser.email || ADMIN_EMAILS[0]);
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

  // Auto save to local storage (only in general editing mode)
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [resumeData]);

  const isAdminAuthenticated = Boolean(adminEmail);

  // Handlers
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsAdminModeActive(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    sessionStorage.setItem(ADMIN_SESSION_KEY, email);
    setIsAdminModeActive(true);
    setNotification({
      message: `관리자 모드로 접속했습니다. (${email})`,
      type: 'success',
    });
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminEmail('');
    setIsAdminModeActive(false);
    setEditingAdminRecord(null);
    setNotification({
      message: '관리자 모드에서 로그아웃 되었습니다.',
      type: 'info',
    });
  };

  const handleFillSample = () => {
    if (confirm('예시 이력서 내용으로 채우시겠습니까? 작성 중인 내용이 대체됩니다.')) {
      setResumeData(SAMPLE_RESUME_DATA);
      setEditingAdminRecord(null);
    }
  };

  const handleReset = () => {
    if (confirm('이력서를 처음부터 다시 새로 작성하시겠습니까?')) {
      setResumeData(INITIAL_BLANK_RESUME);
      setEditingAdminRecord(null);
      setActiveTab('wizard');
    }
  };

  // General Access: Submit to Welfare Center
  const handleSubmitResume = async () => {
    if (!resumeData.personal.name) {
      alert('신청자 성명을 입력한 후 복지관에 제출해 주세요.');
      setActiveTab('wizard');
      return;
    }

    if (!confirm(`'${resumeData.personal.name}' 님의 이력서를 수원시장애인종합복지관에 온라인으로 제출하시겠습니까?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplicantResume(resumeData, resumeData.personal.photoUploadedAt);
      setNotification({
        message: `🎉 '${resumeData.personal.name}' 님의 이력서가 수원시장애인종합복지관에 안전하게 제출되었습니다! 담당 직원이 확인 후 연락드립니다.`,
        type: 'success',
      });
      alert('이력서가 성공적으로 복지관에 제출되었습니다. 담당 선생님이 내용을 검토한 후 연락을 드립니다.');
    } catch (err) {
      console.error(err);
      alert('제출 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // General Access: Export PDF
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

  // Admin Handler: Edit Resume in Editor
  const handleEditResumeInEditor = (record: CloudResumeRecord) => {
    setResumeData(record.resumeData);
    setEditingAdminRecord(record);
    setIsAdminModeActive(false);
    setActiveTab('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Handler: Create New Resume
  const handleCreateNewResume = () => {
    setResumeData(INITIAL_BLANK_RESUME);
    setEditingAdminRecord(null);
    setIsAdminModeActive(false);
    setActiveTab('wizard');
  };

  // Admin Handler: Save changes back to Firestore
  const handleSaveAdminEdits = async () => {
    if (!editingAdminRecord) return;
    try {
      await saveResumeToFirestore(
        editingAdminRecord.userId,
        editingAdminRecord.id,
        editingAdminRecord.title,
        resumeData,
        editingAdminRecord.photoUploadedAt,
        editingAdminRecord.status,
        editingAdminRecord.adminNotes
      );
      setNotification({
        message: `'${resumeData.personal.name || '이력서'}' 내용 수정이 클라우드에 안전하게 저장되었습니다.`,
        type: 'success',
      });
      alert('이력서 수정 사항이 관리자 데이터베이스에 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error(err);
      alert('수정 내용 저장 중 오류가 발생했습니다.');
    }
  };

  // IF ADMIN WORKSPACE IS ACTIVE:
  if (isAdminModeActive && isAdminAuthenticated) {
    return (
      <AdminWorkspace
        adminEmail={adminEmail}
        onExitAdminMode={() => setIsAdminModeActive(false)}
        onLogout={handleAdminLogout}
        onEditResumeInEditor={handleEditResumeInEditor}
        onCreateNewResume={handleCreateNewResume}
        highContrast={highContrast}
      />
    );
  }

  // GENERAL ACCESS VIEW (Writing, Previewing, Printing, PDF Exporting, and Submitting)
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
        onOpenAdmin={handleOpenAdmin}
        isAdmin={isAdminAuthenticated}
        adminEmail={adminEmail}
        onSubmitResume={handleSubmitResume}
        isSubmitting={isSubmitting}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Admin Editing Banner (Displayed only when an admin is currently modifying an applicant's resume) */}
        {editingAdminRecord && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-200 text-amber-900 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">
                  🏢 관리자 수정 모드: <span className="underline decoration-2">{editingAdminRecord.resumeData.personal.name || editingAdminRecord.title}</span> 님의 이력서를 편집 중입니다.
                </p>
                <p className="text-xs text-amber-700">
                  수정한 내용은 아래 '수정사항 저장' 버튼을 누르면 관리자 데이터베이스에 즉시 반영됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleSaveAdminEdits}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>수정사항 저장</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdminModeActive(true)}
                className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>관리자 목록</span>
              </button>
            </div>
          </div>
        )}

        {/* General Notification Banner */}
        {notification && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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

        {/* Welcome Hero Banner (Friendly, Accessible Natural Tones) */}
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
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                쉬운 질문에 하나씩 답해보세요!
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
              1. 질문 작성
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

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        highContrast={highContrast}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        highContrast={highContrast}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-semibold">
          수원시장애인종합복지관 알기 쉬운 이력서 작성 프로그램
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          일반 사용자는 이력서 작성, 인쇄(출력), PDF 저장이 가능하며, 등록된 증명사진은 1주일 후 자동으로 영구 삭제됩니다.
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-900 underline font-bold transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>스마트폰 접속 QR코드 안내</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={handleOpenAdmin}
            className="text-[11px] text-slate-400 hover:text-emerald-700 underline font-medium transition"
          >
            복지관 실무자 / 관리자 모드 접속
          </button>
        </div>
      </footer>
    </div>
  );
}
