import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Edit3, 
  X, 
  User, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Calendar, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Save, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { CloudResumeRecord, updateResumeAdminMeta, isPhotoExpired } from '../firebase';
import { exportResumeToPdf } from '../utils/pdfExport';

interface AdminPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CloudResumeRecord | null;
  onEditResume: (record: CloudResumeRecord) => void;
  onRefreshData?: () => void;
  highContrast?: boolean;
}

export const AdminPrintModal: React.FC<AdminPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  onEditResume,
  onRefreshData,
  highContrast = false,
}) => {
  if (!isOpen || !record) return null;

  const { resumeData } = record;
  const { personal, jobGoal, education, educations, experiences, strength, accommodations } = resumeData;

  const [status, setStatus] = useState<'대기' | '검토중' | '취업연계' | '완료'>(record.status || '대기');
  const [adminNotes, setAdminNotes] = useState<string>(record.adminNotes || '');
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Education list fallback
  const eduList = educations && educations.length > 0 
    ? educations 
    : education?.schoolName 
    ? [{ id: '1', schoolName: education.schoolName, graduationStatus: education.graduationStatus, period: education.period }] 
    : [];

  const handleSaveMeta = async () => {
    setIsSavingMeta(true);
    setSaveSuccess(false);
    try {
      await updateResumeAdminMeta(record.id, { status, adminNotes });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefreshData?.();
    } catch (err) {
      console.error(err);
      alert('상태 및 상담 메모 저장에 실패했습니다.');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const fileName = `[수원시장애인복지관]_${personal.name || '알기쉬운'}_이력서.pdf`;
      await exportResumeToPdf('admin-print-doc-content', fileName);
    } catch (err) {
      console.error(err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const photoActive = Boolean(personal.photoUrl && !isPhotoExpired(record.photoUploadedAt));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-[#fdfcf9] rounded-3xl shadow-2xl flex flex-col my-auto border border-slate-200 overflow-hidden max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 print:hidden shadow-xs">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                관리자 전용 출력 & 저장 창
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {personal.name || '신청자'} 님의 이력서
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              등록일: {new Date(record.createdAt).toLocaleDateString('ko-KR')} | 최근 수정: {new Date(record.updatedAt).toLocaleDateString('ko-KR')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit in Wizard Button */}
            <button
              type="button"
              onClick={() => {
                onEditResume(record);
                onClose();
              }}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>에디터에서 수정하기</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄하기 (출력)</span>
            </button>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-[#7a8d7c] hover:bg-[#647566] text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'PDF 생성 중...' : 'PDF 다운로드 (저장)'}</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:p-0 print:overflow-visible">
          
          {/* Admin Management Section (Status & Internal Consultation Notes) */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs print:hidden space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">진행 상태 관리:</span>
                <div className="flex gap-1.5">
                  {(['대기', '검토중', '취업연계', '완료'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        status === st
                          ? st === '완료' 
                            ? 'bg-blue-600 text-white' 
                            : st === '취업연계' 
                            ? 'bg-emerald-600 text-white' 
                            : st === '검토중' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveMeta}
                disabled={isSavingMeta}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50 self-end sm:self-auto"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>저장 완료!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingMeta ? '저장 중...' : '상태 & 메모 저장'}</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                복지관 내부 상담 메모 / 특이사항 (출력물에는 인쇄되지 않는 관리자 전용 기록)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="예: 2026.11.04 직업상담 완료, 카페 바리스타 보조 직종 희망, 보호자 동석 면담 예정"
                rows={2}
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50"
              />
            </div>
          </div>

          {/* PRINTABLE RESUME DOCUMENT CONTENT */}
          <div className="flex justify-center print:w-full">
            <div
              id="admin-print-doc-content"
              className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 border border-slate-300 shadow-md rounded-sm print:shadow-none print:border-none print:p-0 print:max-w-none print:w-full"
              style={{ fontFamily: 'Pretendard, "Noto Sans KR", sans-serif' }}
            >
              {/* Document Header */}
              <div className="border-b-4 border-[#7a8d7c] pb-4 mb-6 flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold tracking-widest text-[#8e8d88] uppercase">Resume</span>
                  <h1 className="text-3xl font-black text-[#2d332e] tracking-tight">이 력 서</h1>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">수원시장애인종합복지관</p>
                  <p>이력서 관리 번호: {record.id.slice(0, 16)}</p>
                </div>
              </div>

              {/* Section 1: 인적사항 (Personal Details) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pb-6 mb-6 border-b border-slate-200">
                {/* Photo Box */}
                <div className="sm:col-span-1 flex flex-col items-center justify-center">
                  <div className="w-32 h-40 border border-[#e8e6df] rounded overflow-hidden bg-[#f8f7f2] flex items-center justify-center">
                    {photoActive ? (
                      <img
                        src={personal.photoUrl!}
                        alt="사진"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-[#8e8d88]">
                        <User className="w-12 h-12 mx-auto mb-1 stroke-1" />
                        <span className="text-[11px] leading-tight block">
                          {record.photoUploadedAt ? '사진 보관 기한 만료' : '사진 미등록'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Fields */}
                <div className="sm:col-span-3 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#8e8d88] block">성명 (Name)</span>
                      <span className="text-lg font-bold text-slate-900">{personal.name || '미입력'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#8e8d88] block">생년월일 (Birth)</span>
                      <span className="font-semibold text-slate-800">{personal.birthDate || '미입력'} ({personal.gender})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-[#8e8d88] block">연락처 (Phone)</span>
                      <span className="font-semibold text-slate-800">{personal.phone || '미입력'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#8e8d88] block">비상 연락처 (Emergency)</span>
                      <span className="font-semibold text-slate-800">{personal.emergencyPhone || '미입력'}</span>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-[#8e8d88] block">주소 (Address)</span>
                    <span className="text-slate-800 font-medium">{personal.address || '미입력'}</span>
                  </div>

                  {personal.disabilityType && (
                    <div>
                      <span className="text-xs font-bold text-[#8e8d88] block">장애 유형 / 복지카드</span>
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs inline-block">
                        {personal.disabilityType}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: 희망 근로 조건 (Job Goal) */}
              <div className="pb-6 mb-6 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#4a544b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#7a8d7c]" />
                  <span>희망 근무 조건</span>
                </h3>
                <div className="bg-[#f8f7f2] p-4 rounded-xl border border-[#e8e6df] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-xs text-[#8e8d88] font-bold block">희망 직무</span>
                    <span className="font-bold text-slate-900">{jobGoal.desiredJob || '미입력'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8e8d88] font-bold block">근무 가능 시간</span>
                    <span className="font-semibold text-slate-800">{jobGoal.workSchedule || '미입력'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8e8d88] font-bold block">근무 시작 가능일</span>
                    <span className="font-semibold text-slate-800">{jobGoal.startDate || '미입력'}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: 학력 및 교육 이수 사항 (Education) */}
              <div className="pb-6 mb-6 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#4a544b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#7a8d7c]" />
                  <span>학력 및 훈련/교육 이수 사항</span>
                </h3>
                {eduList.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">
                    <table className="w-full text-left">
                      <thead className="bg-[#f8f7f2] text-slate-600 font-bold border-b border-slate-200 text-xs">
                        <tr>
                          <th className="p-2.5">학교 / 교육기관명</th>
                          <th className="p-2.5">구분</th>
                          <th className="p-2.5">기간</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {eduList.map((edu, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-900">{edu.schoolName || '미입력'}</td>
                            <td className="p-2.5 text-slate-700">{edu.graduationStatus}</td>
                            <td className="p-2.5 text-slate-600">{edu.period || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">등록된 학력 정보가 없습니다.</p>
                )}
              </div>

              {/* Section 4: 일한 경험 (Work Experience) */}
              <div className="pb-6 mb-6 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#4a544b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7a8d7c]" />
                  <span>일한 경험 및 활동 (경력사항)</span>
                </h3>
                {experiences && experiences.length > 0 ? (
                  <div className="space-y-3">
                    {experiences.map((exp, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-900 mb-1">
                          <span className="text-sm">{exp.title}</span>
                          <span className="text-xs text-slate-500 font-medium">{exp.period} | {exp.role}</span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-700 leading-relaxed mt-1">
                            {exp.description}
                          </p>
                        )}
                        {exp.leaveReason && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            (종료/퇴사 사유: {exp.leaveReason})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">등록된 경력 사항이 없습니다.</p>
                )}
              </div>

              {/* Section 5: 나의 장점 및 자기소개 (Strengths & Story) */}
              <div className="pb-6 mb-6 border-b border-slate-200">
                <h3 className="text-sm font-bold text-[#4a544b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#7a8d7c]" />
                  <span>나의 장점 및 자기소개</span>
                </h3>
                {strength.tags && strength.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {strength.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {strength.myStory && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                    {strength.myStory}
                  </div>
                )}
              </div>

              {/* Section 6: 배려사항 및 취미 (Accommodations) */}
              <div className="pb-6 mb-8 border-b border-slate-200 text-xs sm:text-sm space-y-3">
                {accommodations.supportNeeded && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">일할 때 배려가 필요한 점</span>
                    <p className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed font-medium">
                      {accommodations.supportNeeded}
                    </p>
                  </div>
                )}
                {accommodations.hobbies && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1">취미 및 특기</span>
                    <p className="text-slate-700 font-medium">
                      {accommodations.hobbies}
                    </p>
                  </div>
                )}
              </div>

              {/* Document Signature Footer */}
              <div className="pt-6 text-center space-y-3">
                <p className="text-sm font-bold text-slate-700">
                  작성일 : {new Date(record.updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  위 사실은 틀림이 없음을 확인합니다.
                </p>
                <p className="text-base font-extrabold text-slate-900 pt-1">
                  지원자 : <span className="underline underline-offset-4 decoration-2 decoration-[#7a8d7c] font-black">{personal.name || '홍길동'}</span> (서명 또는 인)
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
          <span>수원시장애인종합복지관 이력서 작성 및 관리 시스템</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
