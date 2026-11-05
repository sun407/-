import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Plus, 
  LogOut, 
  ArrowLeft, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Calendar, 
  Briefcase,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { 
  CloudResumeRecord, 
  fetchAllResumesForAdmin, 
  deleteResumeFromFirestore, 
  purgeAllExpiredPhotos, 
  updateResumeAdminMeta,
  isPhotoExpired 
} from '../firebase';
import { AdminPrintModal } from './AdminPrintModal';

interface AdminWorkspaceProps {
  adminEmail: string;
  onExitAdminMode: () => void;
  onLogout: () => void;
  onEditResumeInEditor: (record: CloudResumeRecord) => void;
  onCreateNewResume: () => void;
  highContrast?: boolean;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = ({
  adminEmail,
  onExitAdminMode,
  onLogout,
  onEditResumeInEditor,
  onCreateNewResume,
  highContrast = false,
}) => {
  const [resumes, setResumes] = useState<CloudResumeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '대기' | '검토중' | '취업연계' | '완료'>('all');
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<CloudResumeRecord | null>(null);
  const [isPurgingPhotos, setIsPurgingPhotos] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { resumes: list, cleanedPhotosCount } = await fetchAllResumesForAdmin();
      setResumes(list);
      if (cleanedPhotosCount > 0) {
        showToast(`1주일 이상 경과한 사진 ${cleanedPhotosCount}건이 정책에 따라 자동 정리되었습니다.`);
      }
    } catch (err) {
      console.error(err);
      showToast('이력서 데이터를 불러오지 못했습니다. 네트워크를 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDelete = async (record: CloudResumeRecord) => {
    const applicant = record.resumeData.personal.name || record.title;
    if (confirm(`'${applicant}' 님의 이력서를 정말 삭제하시겠습니까? (삭제 후 복구할 수 없습니다)`)) {
      try {
        await deleteResumeFromFirestore(record.userId, record.id);
        setResumes((prev) => prev.filter((r) => r.id !== record.id));
        showToast('이력서가 성공적으로 삭제되었습니다.');
      } catch (err) {
        console.error(err);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleStatusChange = async (recordId: string, newStatus: '대기' | '검토중' | '취업연계' | '완료') => {
    try {
      await updateResumeAdminMeta(recordId, { status: newStatus });
      setResumes((prev) => prev.map((r) => r.id === recordId ? { ...r, status: newStatus } : r));
      showToast(`상태가 '${newStatus}'(으)로 변경되었습니다.`);
    } catch (err) {
      console.error(err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handlePurgePhotos = async () => {
    setIsPurgingPhotos(true);
    try {
      const count = await purgeAllExpiredPhotos();
      if (count > 0) {
        showToast(`1주일이 경과한 사진 ${count}건이 데이터베이스에서 안전하게 제거되었습니다.`);
      } else {
        showToast('현재 1주일이 경과하여 삭제 대상인 사진이 없습니다.');
      }
      await loadData();
    } catch (err) {
      console.error(err);
      alert('사진 정리 중 오류가 발생했습니다.');
    } finally {
      setIsPurgingPhotos(false);
    }
  };

  // Filter Resumes
  const filteredResumes = resumes.filter((r) => {
    const p = r.resumeData.personal;
    const j = r.resumeData.jobGoal;
    const matchSearch = 
      (p.name && p.name.includes(searchTerm)) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (j.desiredJob && j.desiredJob.includes(searchTerm)) ||
      (p.disabilityType && p.disabilityType.includes(searchTerm)) ||
      (r.title && r.title.includes(searchTerm));

    const matchStatus = statusFilter === 'all' || (r.status || '대기') === statusFilter;
    return matchSearch && matchStatus;
  });

  // KPI counts
  const totalCount = resumes.length;
  const pendingCount = resumes.filter((r) => !r.status || r.status === '대기').length;
  const inProgressCount = resumes.filter((r) => r.status === '검토중').length;
  const completedCount = resumes.filter((r) => r.status === '취업연계' || r.status === '완료').length;
  const photoCount = resumes.filter((r) => Boolean(r.resumeData.personal.photoUrl && !isPhotoExpired(r.photoUploadedAt))).length;

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black text-yellow-300' : 'bg-[#f4f6f4] text-slate-800'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-900 text-emerald-100 rounded-2xl shadow-xl border border-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  수원시장애인종합복지관 관리자 모드
                </h1>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  실무자 전용
                </span>
              </div>
              <p className="text-xs text-slate-500">
                접속 관리자: <span className="font-semibold text-slate-700">{adminEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onCreateNewResume}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>새 이력서 등록</span>
            </button>

            <button
              onClick={onExitAdminMode}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>일반 작성 화면으로</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">전체 등록 이력서</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}건</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">접수 / 대기</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}건</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">검토 / 상담 진행중</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{inProgressCount}건</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">취업 연계 / 완료</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{completedCount}건</p>
          </div>
        </div>

        {/* 1-Week Photo Policy & Purge Action Notice */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-950">
                사진 파일 1주일 자동 제거 정책 운용 중 (현재 사진 보관 중: {photoCount}건)
              </p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                개인정보 보호법 및 저장공간 정책에 따라 등록 후 7일이 경과한 사진은 자동으로 영구 삭제됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={handlePurgePhotos}
            disabled={isPurgingPhotos}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPurgingPhotos ? 'animate-spin' : ''}`} />
            <span>만료된 사진 지금 점검/정리</span>
          </button>
        </div>

        {/* Search, Filter & Actions Toolbar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 연락처, 희망직종, 장애유형 검색..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50 font-medium"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
            {(['all', '대기', '검토중', '취업연계', '완료'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? '전체 상태' : st}
              </button>
            ))}

            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition ml-1"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Resumes List Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>작성된 이력서 관리 목록</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                검색결과: {filteredResumes.length}건
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span>클라우드 데이터베이스에서 이력서 목록을 조회하고 있습니다...</span>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs sm:text-sm">
              조건에 맞는 이력서가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">신청자 성명 / 사진</th>
                    <th className="py-3 px-4">연락처 / 생년월일</th>
                    <th className="py-3 px-4">희망 직종 / 근무조건</th>
                    <th className="py-3 px-4">등록 / 수정일</th>
                    <th className="py-3 px-4">상태 관리</th>
                    <th className="py-3 px-4 text-center">관리자 작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                  {filteredResumes.map((rec) => {
                    const p = rec.resumeData.personal;
                    const j = rec.resumeData.jobGoal;
                    const photoActive = Boolean(p.photoUrl && !isPhotoExpired(rec.photoUploadedAt));

                    // Expiration calculation
                    let photoBadge = '사진 없음';
                    if (photoActive && rec.photoUploadedAt) {
                      const daysLeft = 7 - Math.floor((Date.now() - new Date(rec.photoUploadedAt).getTime()) / (24 * 3600 * 1000));
                      photoBadge = `${daysLeft}일 후 자동삭제`;
                    } else if (rec.photoUploadedAt) {
                      photoBadge = '1주 경과 자동삭제됨';
                    }

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                        {/* Name & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {photoActive ? (
                                <img src={p.photoUrl!} alt="사진" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {p.name || rec.title}
                              </p>
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 font-semibold">
                                {photoBadge}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Birth */}
                        <td className="py-3 px-4 text-xs space-y-0.5">
                          <p className="font-bold text-slate-800">{p.phone || '연락처 미입력'}</p>
                          <p className="text-slate-500">{p.birthDate || '생년월일 미입력'} ({p.gender})</p>
                          {p.emergencyPhone && (
                            <p className="text-[11px] text-slate-400">비상: {p.emergencyPhone}</p>
                          )}
                        </td>

                        {/* Desired Job */}
                        <td className="py-3 px-4 text-xs space-y-0.5">
                          <p className="font-bold text-emerald-800">{j.desiredJob || '직종 미입력'}</p>
                          <p className="text-slate-500">{j.workSchedule || '시간 협의'}</p>
                          {p.disabilityType && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold inline-block">
                              {p.disabilityType}
                            </span>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="py-3 px-4 text-xs text-slate-500 space-y-0.5 whitespace-nowrap">
                          <p>수정: {new Date(rec.updatedAt).toLocaleDateString('ko-KR')}</p>
                          <p className="text-[11px] text-slate-400">등록: {new Date(rec.createdAt).toLocaleDateString('ko-KR')}</p>
                        </td>

                        {/* Status Select */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={rec.status || '대기'}
                            onChange={(e) => handleStatusChange(rec.id, e.target.value as any)}
                            className={`text-xs font-bold py-1 px-2.5 rounded-lg border outline-hidden transition cursor-pointer ${
                              rec.status === '완료'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : rec.status === '취업연계'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : rec.status === '검토중'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="대기">대기</option>
                            <option value="검토중">검토중</option>
                            <option value="취업연계">취업연계</option>
                            <option value="완료">완료</option>
                          </select>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Detailed Print & Save Window Button */}
                            <button
                              onClick={() => setSelectedRecordForPrint(rec)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                              title="관리자 전용 출력 및 저장 창 열기"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>출력/저장 창</span>
                            </button>

                            {/* Edit in Editor */}
                            <button
                              onClick={() => onEditResumeInEditor(rec)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              title="이력서 내용 수정하기"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>수정</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(rec)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="이력서 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* DEDICATED ADMIN PRINT & SAVE MODAL */}
      <AdminPrintModal
        isOpen={Boolean(selectedRecordForPrint)}
        onClose={() => setSelectedRecordForPrint(null)}
        record={selectedRecordForPrint}
        onEditResume={onEditResumeInEditor}
        onRefreshData={loadData}
        highContrast={highContrast}
      />

    </div>
  );
};
