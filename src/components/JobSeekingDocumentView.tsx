import React, { useState, useMemo } from 'react';
import {
  Client,
  ClientIntakeRecord,
  JobSeekingDocument,
  JobSeekingTrainingItem,
  JobSeekingCertificateItem,
  JobSeekingCareerItem,
} from '../types';
import {
  Printer,
  Edit3,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  CheckSquare,
  Square,
  FileCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import SignaturePadModal from './SignaturePadModal';

interface JobSeekingDocumentViewProps {
  client: Client;
  onSaveDoc: (updatedDoc: JobSeekingDocument) => void;
  onBackToIntakeReport?: () => void;
}

export default function JobSeekingDocumentView({
  client,
  onSaveDoc,
  onBackToIntakeReport,
}: JobSeekingDocumentViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSignModal, setActiveSignModal] = useState<
    'applicant' | 'guardian' | 'counselor' | null
  >(null);

  const existingDoc = client.jobSeekingDoc;
  const intake = client.intakeRecord;

  // Initialize or pull overlapping fields from intakeRecord & client
  const defaultDoc: JobSeekingDocument = useMemo(() => {
    // Determine economic status
    let econ = '비해당';
    if (intake?.economicCondition?.includes('수급')) econ = '기초생활수급자';
    else if (intake?.economicCondition?.includes('차상위')) econ = '차상위계층';

    // Assistive device
    const hasAssistive =
      intake?.useAssistiveDevice === '○' ||
      Boolean(intake?.assistiveDeviceName && intake.assistiveDeviceName.trim().length > 0);

    // Medication
    const hasMed = intake?.medicationIsTaking === '○';

    // Education level guess
    let edu = '고졸';
    if (intake?.education && intake.education.length > 0) {
      const sch = intake.education.map((e) => e.school).join(' ');
      if (sch.includes('대')) edu = '대졸 이상';
      else if (sch.includes('전문')) edu = '전문대졸';
      else if (sch.includes('고')) edu = '고졸';
      else if (sch.includes('중')) edu = '중졸';
      else if (sch.includes('초')) edu = '초졸';
    }

    // Careers from intake
    const initialCareers: JobSeekingCareerItem[] =
      intake?.workHistory && intake.workHistory.length > 0
        ? intake.workHistory.map((w) => ({
            companyName: w.company || '',
            jobTitle: w.jobTitle || '',
            periodAndType: w.period || '',
            salary: '',
            leaveReason: w.reasonForLeaving || '',
          }))
        : [
            {
              companyName: '',
              jobTitle: '',
              periodAndType: '',
              salary: '',
              leaveReason: '',
            },
          ];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[today.getDay()];

    return {
      id: existingDoc?.id || `job-seek-${client.id}`,
      clientId: client.id,
      receiptNo: existingDoc?.receiptNo || intake?.receiptNo || '26-001',
      counselor: existingDoc?.counselor || intake?.counselor || '상담사',
      counselDate: existingDoc?.counselDate || intake?.counselDate || todayStr,
      counselDayOfWeek: existingDoc?.counselDayOfWeek || dayName,

      // Overlapping fields
      name: existingDoc?.name || client.name,
      birthDate: existingDoc?.birthDate || client.birthDate,
      age: existingDoc?.age || intake?.age || '',
      gender: existingDoc?.gender || client.gender,
      address: existingDoc?.address || intake?.address || '',
      phoneSelf: existingDoc?.phoneSelf || intake?.mobileSelf || intake?.phone || '',
      phoneGuard: existingDoc?.phoneGuard || intake?.mobileGuard || '',
      email: existingDoc?.email || intake?.email || '',
      maritalStatus: existingDoc?.maritalStatus || intake?.maritalStatus || '미혼',
      economicStatus: existingDoc?.economicStatus || econ,
      disabilityType: existingDoc?.disabilityType || intake?.disabilityName || client.diagnosis || '',
      disabilityGrade: existingDoc?.disabilityGrade || intake?.disabilityGrade || '심한 장애 (중증)',
      assistiveDeviceUse: existingDoc?.assistiveDeviceUse || (hasAssistive ? '유' : '무'),
      assistiveDeviceDetail: existingDoc?.assistiveDeviceDetail || intake?.assistiveDeviceName || '',

      // Health
      medicationUse: existingDoc?.medicationUse || (hasMed ? '유' : '무'),
      medicationDetail: existingDoc?.medicationDetail || intake?.medicationReason || '',
      medicationMethod: existingDoc?.medicationMethod || intake?.medicationUsage || '매일 복용',
      healthCondition: existingDoc?.healthCondition || intake?.currentHealthStatus || '양호',

      // Education
      educationLevel: existingDoc?.educationLevel || edu,

      // Additional job seek tables
      trainingList: existingDoc?.trainingList?.length
        ? existingDoc.trainingList
        : [
            { institution: '수원시장애인종합복지관', period: '2026.01 ~ 2026.06', jobType: '직업적응훈련' },
            { institution: '', period: '', jobType: '' },
          ],
      certList: existingDoc?.certList?.length
        ? existingDoc.certList
        : [
            { certName: '', date: '', note: '' },
            { certName: '', date: '', note: '' },
          ],
      careerList: existingDoc?.careerList?.length ? existingDoc.careerList : initialCareers,

      // Desired job conditions
      desiredJobType: existingDoc?.desiredJobType || intake?.desiredProgram || '사무보조 및 직무참여',
      desiredEmploymentType: existingDoc?.desiredEmploymentType || '계약직 / 지원고용',
      desiredWorkLocation: existingDoc?.desiredWorkLocation || '수원시 및 인근 지역',
      desiredWorkHours: existingDoc?.desiredWorkHours || '주 20시간 (일 4시간)',
      desiredSalary: existingDoc?.desiredSalary || '시급제 (최저임금 이상)',
      desiredNotes: existingDoc?.desiredNotes || '출퇴근 지원 및 직무지도원 배치 희망',

      // Counselor opinion & signatures
      summaryOpinion:
        existingDoc?.summaryOpinion ||
        intake?.counselingNotes ||
        '성실하고 직업재활 훈련에 적극적으로 참여하고 있으며, 단순 사무 보조 및 환경 정리 등 적합 직종으로 취업 연계 지원이 요망됨.',
      applicantSignature: existingDoc?.applicantSignature || '',
      counselorSignature: existingDoc?.counselorSignature || '',

      // Page 2: Agreement
      agreePurpose: existingDoc ? existingDoc.agreePurpose : true,
      agreeBasic: existingDoc ? existingDoc.agreeBasic : true,
      agreeDisabilityInfo: existingDoc ? existingDoc.agreeDisabilityInfo : true,
      agreePhotoVideo: existingDoc ? existingDoc.agreePhotoVideo : true,
      agreeUniqueId: existingDoc ? existingDoc.agreeUniqueId : true,
      agreeThirdParty: existingDoc ? existingDoc.agreeThirdParty : true,

      agreementDate: existingDoc?.agreementDate || todayStr,
      isDelegated: existingDoc?.isDelegated ?? false,
      applicantSignerName: existingDoc?.applicantSignerName || client.name,
      applicantSignerCanvas: existingDoc?.applicantSignerCanvas || '',
      guardianSignerName: existingDoc?.guardianSignerName || intake?.applicantName || '',
      guardianSignerCanvas: existingDoc?.guardianSignerCanvas || '',
    };
  }, [client, intake, existingDoc]);

  // Local form state
  const [formData, setFormData] = useState<JobSeekingDocument>(defaultDoc);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleFieldChange = (key: keyof JobSeekingDocument, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAgreeAll = (agree: boolean) => {
    setFormData((prev) => ({
      ...prev,
      agreePurpose: agree,
      agreeBasic: agree,
      agreeDisabilityInfo: agree,
      agreePhotoVideo: agree,
      agreeUniqueId: agree,
      agreeThirdParty: agree,
    }));
  };

  const handleSave = () => {
    const updated: JobSeekingDocument = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    onSaveDoc(updated);
    setIsEditing(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper date parsing for formatted print
  const formatFullDate = (dStr: string) => {
    if (!dStr) return { year: '2026', month: '01', day: '01' };
    const parts = dStr.split('-');
    return {
      year: parts[0] || '2026',
      month: parts[1] || '01',
      day: parts[2] || '01',
    };
  };

  const { year: docYear, month: docMonth, day: docDay } = formatFullDate(formData.counselDate || '');
  const { year: agreeYear, month: agreeMonth, day: agreeDay } = formatFullDate(
    formData.agreementDate || formData.counselDate || ''
  );

  return (
    <div className="flex-1 bg-slate-100 p-3 sm:p-6 space-y-6 print:p-0 print:bg-white print:overflow-visible">
      {/* Top Banner & Control Toolbar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          {onBackToIntakeReport && (
            <button
              onClick={onBackToIntakeReport}
              className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              &larr; 접수상담기록지로
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-black border border-indigo-100">
                A4 정규서식 (2매)
              </span>
              <h2 className="text-base font-black text-slate-900">
                구직상담기록지 &amp; 개인정보 수집・이용 동의서
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              접수상담기록지의 기본인적사항 및 병력·경력이 자동으로 연동되며, 미입력 항목 작성 및 태블릿 서명이 가능합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                미리보기로 전환
              </button>
              <button
                onClick={handleSave}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                저장 완료
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="py-2 px-4 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-800 hover:text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Edit3 className="h-4 w-4 text-indigo-600" />
                항목 작성 / 서명 편집
              </button>
              <button
                onClick={handlePrint}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                공문서 인쇄 / PDF 출력
              </button>
            </>
          )}
        </div>
      </div>

      {isSavedNotice && (
        <div className="max-w-4xl mx-auto p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 print:hidden animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          구직상담기록지 및 개인정보동의서 내용이 성공적으로 저장되었습니다.
        </div>
      )}

      {/* EDIT DRAWER / FORM (Visible when isEditing is true) */}
      {isEditing && (
        <div className="max-w-4xl mx-auto bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm space-y-6 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">추가 문항 작성 및 태블릿 서명</h3>
            </div>
            <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <Info className="h-3.5 w-3.5" />
              접수상담기록지 연동 데이터는 자동 반영되어 있습니다
            </span>
          </div>

          {/* Quick Tablet Signatures Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <PenTool className="h-3.5 w-3.5 text-indigo-600" />
                  신청자 / 동의자 태블릿 직접 서명
                </label>
                {formData.applicantSignerCanvas && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    서명 등록됨
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={formData.applicantSignerName}
                  onChange={(e) => handleFieldChange('applicantSignerName', e.target.value)}
                  placeholder="성명"
                  className="w-28 text-xs font-bold px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => setActiveSignModal('applicant')}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <PenTool className="h-3.5 w-3.5" />
                  {formData.applicantSignerCanvas ? '서명 다시하기' : '태블릿에서 직접 서명'}
                </button>
                {formData.applicantSignerCanvas && (
                  <div className="h-10 w-20 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                    <img
                      src={formData.applicantSignerCanvas}
                      alt="신청자 서명"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <PenTool className="h-3.5 w-3.5 text-indigo-600" />
                  보호자 / 대리인 서명 (위임 시)
                </label>
                <label className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDelegated}
                    onChange={(e) => handleFieldChange('isDelegated', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  위임함
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={formData.guardianSignerName}
                  onChange={(e) => handleFieldChange('guardianSignerName', e.target.value)}
                  placeholder="보호자 성명"
                  className="w-28 text-xs font-bold px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => setActiveSignModal('guardian')}
                  className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <PenTool className="h-3.5 w-3.5" />
                  {formData.guardianSignerCanvas ? '서명 다시하기' : '보호자 서명 패드 열기'}
                </button>
                {formData.guardianSignerCanvas && (
                  <div className="h-10 w-20 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                    <img
                      src={formData.guardianSignerCanvas}
                      alt="보호자 서명"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Consent All Checkbox */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-indigo-900">
                개인정보 수집・이용 동의서 (2페이지) 체크박스 상태
              </h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                5개 항목(목적·거부권, 기본개인정보, 민감정보, 고유식별정보, 제3자 제공)의 동의 여부를 관리합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAgreeAll(true)}
                className="py-1.5 px-3 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                전체 동의함 (일괄체크)
              </button>
              <button
                type="button"
                onClick={() => handleAgreeAll(false)}
                className="py-1.5 px-3 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                전체 해제
              </button>
            </div>
          </div>

          {/* Section 1: Non-overlapping Vocational Training */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800">1. 직업훈련 이력 (구직상담 전용)</h4>
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('trainingList', [
                    ...formData.trainingList,
                    { institution: '', period: '', jobType: '' },
                  ])
                }
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> 행 추가
              </button>
            </div>
            <div className="space-y-2">
              {formData.trainingList.map((t, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={t.institution}
                    onChange={(e) => {
                      const updated = [...formData.trainingList];
                      updated[idx].institution = e.target.value;
                      handleFieldChange('trainingList', updated);
                    }}
                    placeholder="기관명 (예: 수원시장애인종합복지관)"
                    className="col-span-4 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={t.period}
                    onChange={(e) => {
                      const updated = [...formData.trainingList];
                      updated[idx].period = e.target.value;
                      handleFieldChange('trainingList', updated);
                    }}
                    placeholder="훈련기간 (예: 2026.01 ~ 2026.06)"
                    className="col-span-4 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={t.jobType}
                    onChange={(e) => {
                      const updated = [...formData.trainingList];
                      updated[idx].jobType = e.target.value;
                      handleFieldChange('trainingList', updated);
                    }}
                    placeholder="훈련직종 (예: 바리스타 / 스마트팜)"
                    className="col-span-3 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.trainingList.filter((_, i) => i !== idx);
                      handleFieldChange('trainingList', updated);
                    }}
                    className="col-span-1 p-2 text-slate-400 hover:text-red-500 rounded flex justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Non-overlapping Certificate Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800">2. 보유 자격증 (구직상담 전용)</h4>
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('certList', [
                    ...formData.certList,
                    { certName: '', date: '', note: '' },
                  ])
                }
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> 행 추가
              </button>
            </div>
            <div className="space-y-2">
              {formData.certList.map((c, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={c.certName}
                    onChange={(e) => {
                      const updated = [...formData.certList];
                      updated[idx].certName = e.target.value;
                      handleFieldChange('certList', updated);
                    }}
                    placeholder="자격증명 (예: 바리스타 2급, 컴퓨터활용)"
                    className="col-span-4 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={c.date}
                    onChange={(e) => {
                      const updated = [...formData.certList];
                      updated[idx].date = e.target.value;
                      handleFieldChange('certList', updated);
                    }}
                    placeholder="취득시기 (예: 2025.10)"
                    className="col-span-3 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={c.note}
                    onChange={(e) => {
                      const updated = [...formData.certList];
                      updated[idx].note = e.target.value;
                      handleFieldChange('certList', updated);
                    }}
                    placeholder="기타사항"
                    className="col-span-4 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.certList.filter((_, i) => i !== idx);
                      handleFieldChange('certList', updated);
                    }}
                    className="col-span-1 p-2 text-slate-400 hover:text-red-500 rounded flex justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Career History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800">3. 취업경력 (구직상담 전용)</h4>
              <button
                type="button"
                onClick={() =>
                  handleFieldChange('careerList', [
                    ...formData.careerList,
                    { companyName: '', jobTitle: '', periodAndType: '', salary: '', leaveReason: '' },
                  ])
                }
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> 행 추가
              </button>
            </div>
            <div className="space-y-2">
              {formData.careerList.map((car, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={car.companyName}
                    onChange={(e) => {
                      const updated = [...formData.careerList];
                      updated[idx].companyName = e.target.value;
                      handleFieldChange('careerList', updated);
                    }}
                    placeholder="업체명 (예: OO식품)"
                    className="col-span-3 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={car.jobTitle}
                    onChange={(e) => {
                      const updated = [...formData.careerList];
                      updated[idx].jobTitle = e.target.value;
                      handleFieldChange('careerList', updated);
                    }}
                    placeholder="직무 (예: 포장원)"
                    className="col-span-2 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={car.periodAndType}
                    onChange={(e) => {
                      const updated = [...formData.careerList];
                      updated[idx].periodAndType = e.target.value;
                      handleFieldChange('careerList', updated);
                    }}
                    placeholder="고용형태 및 근무기간 (예: 계약직 6개월)"
                    className="col-span-3 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={car.salary}
                    onChange={(e) => {
                      const updated = [...formData.careerList];
                      updated[idx].salary = e.target.value;
                      handleFieldChange('careerList', updated);
                    }}
                    placeholder="임금 (예: 월 120만원)"
                    className="col-span-2 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={car.leaveReason}
                    onChange={(e) => {
                      const updated = [...formData.careerList];
                      updated[idx].leaveReason = e.target.value;
                      handleFieldChange('careerList', updated);
                    }}
                    placeholder="퇴직사유"
                    className="col-span-1 text-xs p-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.careerList.filter((_, i) => i !== idx);
                      handleFieldChange('careerList', updated);
                    }}
                    className="col-span-1 p-2 text-slate-400 hover:text-red-500 rounded flex justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Desired Job Conditions */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800">4. 희망 취업 조건</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">희망 직종</label>
                <input
                  type="text"
                  value={formData.desiredJobType || ''}
                  onChange={(e) => handleFieldChange('desiredJobType', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">고용형태</label>
                <input
                  type="text"
                  value={formData.desiredEmploymentType || ''}
                  onChange={(e) => handleFieldChange('desiredEmploymentType', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">근무지역</label>
                <input
                  type="text"
                  value={formData.desiredWorkLocation || ''}
                  onChange={(e) => handleFieldChange('desiredWorkLocation', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">근무시간</label>
                <input
                  type="text"
                  value={formData.desiredWorkHours || ''}
                  onChange={(e) => handleFieldChange('desiredWorkHours', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">희망 급여</label>
                <input
                  type="text"
                  value={formData.desiredSalary || ''}
                  onChange={(e) => handleFieldChange('desiredSalary', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">기타사항</label>
                <input
                  type="text"
                  value={formData.desiredNotes || ''}
                  onChange={(e) => handleFieldChange('desiredNotes', e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Comprehensive Opinion */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-800">5. 상담내용 및 종합의견</h4>
            <textarea
              rows={3}
              value={formData.summaryOpinion || ''}
              onChange={(e) => handleFieldChange('summaryOpinion', e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg leading-relaxed"
              placeholder="구직상담 내용 및 직무배치/취업연계 관련 종합의견을 입력하세요."
            />
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              양식에 반영 및 저장
            </button>
          </div>
        </div>
      )}

      {/* 2-PAGE PRINTABLE FORM CONTAINER (Exact Replica of provided PDF) */}
      <div className="max-w-[820px] mx-auto space-y-10 print:space-y-0 text-slate-900 font-sans leading-snug">
        {/* ========================================================================= */}
        {/* PAGE 1: 구 직 상 담 기 록 지                                           */}
        {/* ========================================================================= */}
        <div className="bg-white p-8 sm:p-10 shadow-lg border border-slate-300 rounded-2xl print:border-none print:shadow-none print:p-0 print:rounded-none min-h-[1080px] flex flex-col justify-between page-break-after">
          <div>
            {/* Title */}
            <div className="text-center mb-5">
              <h1 className="text-2xl font-black tracking-[0.3em] text-slate-950 inline-block pb-1">
                구 직 상 담 기 록 지
              </h1>
            </div>

            {/* Header metadata row */}
            <div className="flex justify-between items-center text-xs font-bold mb-1.5 px-1 text-slate-800">
              <div>
                접수번호 :{' '}
                <span className="font-extrabold underline underline-offset-2">
                  {formData.receiptNo || '26-001'}
                </span>
              </div>
              <div>
                상담자 :{' '}
                <span className="font-extrabold underline underline-offset-2">
                  {formData.counselor || '상담사'}
                </span>
              </div>
              <div>
                상담일시 :{' '}
                <span className="font-extrabold underline underline-offset-2">
                  {docYear}년 {docMonth}월 {docDay}일 ({formData.counselDayOfWeek || '월'}요일)
                </span>
              </div>
            </div>

            {/* Main Table Grid */}
            <table className="w-full border-collapse border border-black text-xs text-slate-950">
              <tbody>
                {/* Row 1: 성명 / 생년월일 / 성별 */}
                <tr className="border-b border-black">
                  <td className="w-20 bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    성 명
                  </td>
                  <td className="w-36 border-r border-black font-extrabold text-center py-1.5">
                    {formData.name}
                  </td>
                  <td className="w-24 bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    생년월일
                  </td>
                  <td className="border-r border-black font-medium text-center py-1.5">
                    {formData.birthDate}{' '}
                    <span className="font-bold">({formData.age || '20'}세)</span>
                  </td>
                  <td className="w-16 bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    성 별
                  </td>
                  <td className="w-28 text-center py-1.5 font-medium">
                    <span className="inline-flex items-center gap-1 mr-3">
                      {formData.gender === 'M' ? '■' : '□'} 남
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {formData.gender === 'F' ? '■' : '□'} 여
                    </span>
                  </td>
                </tr>

                {/* Row 2: 주소 */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    주 소
                  </td>
                  <td colSpan={5} className="px-3 py-1.5 font-medium">
                    {formData.address || '경기도 수원시'}
                  </td>
                </tr>

                {/* Row 3: 연락처 (본인, 보호자, E-mail) */}
                <tr className="border-b border-black">
                  <td rowSpan={2} className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    연락처
                  </td>
                  <td className="bg-slate-50 border-r border-black font-bold text-center py-1 w-20">
                    본인
                  </td>
                  <td className="border-r border-black px-2 py-1 font-medium">
                    {formData.phoneSelf || '-'}
                  </td>
                  <td className="bg-slate-50 border-r border-black font-bold text-center py-1 w-20">
                    보호자
                  </td>
                  <td colSpan={2} className="px-2 py-1 font-medium">
                    {formData.phoneGuard || '-'}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="bg-slate-50 border-r border-black font-bold text-center py-1">
                    E-mail
                  </td>
                  <td colSpan={4} className="px-2 py-1 font-medium">
                    {formData.email || '-'}
                  </td>
                </tr>

                {/* Row 4: 결혼여부 / 경제적 여건 */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    결혼여부
                  </td>
                  <td colSpan={2} className="border-r border-black px-2 py-1.5 font-medium text-[11px]">
                    <span className="mr-2">미혼{formData.maritalStatus === '미혼' ? '■' : '□'}</span>
                    <span className="mr-2">기혼{formData.maritalStatus === '기혼' ? '■' : '□'}</span>
                    <span className="mr-2">동거{formData.maritalStatus === '동거' ? '■' : '□'}</span>
                    <span className="mr-2">이혼{formData.maritalStatus === '이혼' ? '■' : '□'}</span>
                    <span>사별{formData.maritalStatus === '사별' ? '■' : '□'}</span>
                  </td>
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5 w-24">
                    경제적 여건
                  </td>
                  <td colSpan={2} className="px-2 py-1.5 font-medium text-[11px]">
                    <span className="mr-2">
                      {formData.economicStatus === '기초생활수급자' ? '■' : '□'} 기초생활수급자
                    </span>
                    <span className="mr-2">
                      {formData.economicStatus === '차상위계층' ? '■' : '□'} 차상위계층
                    </span>
                    <span>{formData.economicStatus === '비해당' ? '■' : '□'} 비해당</span>
                  </td>
                </tr>

                {/* Row 5: 장애유형 / 장애정도 / 보장구 사용여부 */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    장애유형
                  </td>
                  <td className="border-r border-black text-center py-1.5 font-bold">
                    {formData.disabilityType || '-'}
                  </td>
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    장애정도
                  </td>
                  <td className="border-r border-black text-center py-1.5 font-medium">
                    {formData.disabilityGrade || '심한 장애'}
                  </td>
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5 text-[10px] leading-tight">
                    보장구<br />사용여부
                  </td>
                  <td className="px-2 py-1.5 font-medium text-[10px]">
                    <div>※ 목발, 휠체어, 보청기 등</div>
                    <div className="mt-0.5">
                      <span className="mr-1.5">
                        {formData.assistiveDeviceUse === '무' ? '■' : '□'} 무
                      </span>
                      <span>
                        {formData.assistiveDeviceUse === '유' ? '■' : '□'} 유
                        {formData.assistiveDeviceDetail ? `: (${formData.assistiveDeviceDetail})` : ''}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Row 6: 병력관리 (약물복용, 복용방법, 건강상태) */}
                <tr className="border-b border-black">
                  <td rowSpan={2} className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    병력관리
                  </td>
                  <td className="bg-slate-50 border-r border-black font-bold text-center py-1 text-[11px]">
                    약물복용
                  </td>
                  <td colSpan={4} className="px-2 py-1 text-[11px] font-medium">
                    <span className="mr-3">{formData.medicationUse === '무' ? '■' : '□'} 무</span>
                    <span>
                      {formData.medicationUse === '유' ? '■' : '□'} 유
                      {formData.medicationDetail ? `: (${formData.medicationDetail})` : ''}
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="bg-slate-50 border-r border-black font-bold text-center py-1 text-[11px]">
                    복용 방법
                  </td>
                  <td className="border-r border-black px-2 py-1 text-[11px] font-medium">
                    {formData.medicationMethod || '-'}
                  </td>
                  <td className="bg-slate-50 border-r border-black font-bold text-center py-1 text-[11px]">
                    건강상태
                  </td>
                  <td colSpan={2} className="px-2 py-1 text-[11px] font-medium">
                    {formData.healthCondition || '양호'}
                  </td>
                </tr>

                {/* Row 7: 최종학력 */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-1.5">
                    최종학력
                  </td>
                  <td colSpan={5} className="px-3 py-1.5 font-medium text-[11px]">
                    <span className="mr-3">{formData.educationLevel === '무학' ? '■' : '□'} 무학</span>
                    <span className="mr-3">{formData.educationLevel === '초졸' ? '■' : '□'} 초졸</span>
                    <span className="mr-3">{formData.educationLevel === '중졸' ? '■' : '□'} 중졸</span>
                    <span className="mr-3">{formData.educationLevel === '고졸' ? '■' : '□'} 고졸</span>
                    <span className="mr-3">
                      {formData.educationLevel === '전문대졸' ? '■' : '□'} 전문대졸
                    </span>
                    <span>{formData.educationLevel === '대졸 이상' ? '■' : '□'} 대졸 이상</span>
                  </td>
                </tr>

                {/* Row 8: 직업훈련 (PDF 양식 일치: 좌측 직업훈련, 우측 기관명/훈련기간/훈련직종 2열) */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-2">
                    직업훈련
                  </td>
                  <td colSpan={5} className="p-0">
                    <table className="w-full border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-black">
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-1.5 w-[14%] text-[11px]">
                            기 관 명
                          </td>
                          <td className="border-r border-black px-2 py-1.5 text-center font-medium w-[43%]">
                            {formData.trainingList[0]?.institution || ''}
                          </td>
                          <td className="px-2 py-1.5 text-center font-medium w-[43%]">
                            {formData.trainingList[1]?.institution || ''}
                          </td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-1.5 w-[14%] text-[11px]">
                            훈련기간
                          </td>
                          <td className="border-r border-black px-2 py-1.5 text-center font-medium w-[43%]">
                            {formData.trainingList[0]?.period || '∼'}
                          </td>
                          <td className="px-2 py-1.5 text-center font-medium w-[43%]">
                            {formData.trainingList[1]?.period || '∼'}
                          </td>
                        </tr>
                        <tr>
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-1.5 w-[14%] text-[11px]">
                            훈련직종
                          </td>
                          <td className="border-r border-black px-2 py-1.5 text-center font-medium w-[43%]">
                            {formData.trainingList[0]?.jobType || ''}
                          </td>
                          <td className="px-2 py-1.5 text-center font-medium w-[43%]">
                            {formData.trainingList[1]?.jobType || ''}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Row 9: 보유 자격증 (PDF 양식 일치: 자격증명 / 시기 / 기타사항 2행) */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-2 text-[11px] leading-tight">
                    보유<br />자격증
                  </td>
                  <td colSpan={5} className="p-0">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-black bg-slate-50 font-bold text-center">
                          <td className="border-r border-black py-1.5 w-[40%] text-[11px]">자격증명</td>
                          <td className="border-r border-black py-1.5 w-[26%] text-[11px]">시기</td>
                          <td className="py-1.5 w-[34%] text-[11px]">기타사항</td>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1].map((idx) => {
                          const item = formData.certList[idx];
                          const isLast = idx === 1 && formData.certList.length <= 2;
                          return (
                            <tr key={`cert-${idx}`} className={isLast ? '' : 'border-b border-black'}>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item?.certName || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item?.date || ''}
                              </td>
                              <td className="px-2 py-1.5 text-center font-medium">
                                {item?.note || ''}
                              </td>
                            </tr>
                          );
                        })}
                        {formData.certList.length > 2 &&
                          formData.certList.slice(2).map((item, idx, arr) => (
                            <tr
                              key={`cert-extra-${idx}`}
                              className={idx === arr.length - 1 ? '' : 'border-b border-black'}
                            >
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item.certName || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item.date || ''}
                              </td>
                              <td className="px-2 py-1.5 text-center font-medium">
                                {item.note || ''}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Row 10: 취업경력 (PDF 양식 일치: 업체명 / 직무 / 고용형태 및 근무기간 / 임금 / 퇴직사유 정확한 5칸 및 3행) */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-2 text-[11px]">
                    취업경력
                  </td>
                  <td colSpan={5} className="p-0">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-black bg-slate-50 font-bold text-center">
                          <td className="border-r border-black py-1.5 w-[20%] text-[11px]">업체명</td>
                          <td className="border-r border-black py-1.5 w-[18%] text-[11px]">직무</td>
                          <td className="border-r border-black py-0.5 w-[24%] text-[11px] leading-tight">
                            고용형태 및<br />근무기간
                          </td>
                          <td className="border-r border-black py-1.5 w-[16%] text-[11px]">임금</td>
                          <td className="py-1.5 w-[22%] text-[11px]">퇴직사유</td>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1, 2].map((idx) => {
                          const item = formData.careerList[idx];
                          const isLast = idx === 2 && formData.careerList.length <= 3;
                          return (
                            <tr key={`career-${idx}`} className={isLast ? '' : 'border-b border-black'}>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item?.companyName || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item?.jobTitle || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item?.periodAndType || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item?.salary || ''}
                              </td>
                              <td className="px-2 py-1.5 text-center font-medium">
                                {item?.leaveReason || ''}
                              </td>
                            </tr>
                          );
                        })}
                        {formData.careerList.length > 3 &&
                          formData.careerList.slice(3).map((item, idx, arr) => (
                            <tr
                              key={`career-extra-${idx}`}
                              className={idx === arr.length - 1 ? '' : 'border-b border-black'}
                            >
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item.companyName || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item.jobTitle || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item.periodAndType || ''}
                              </td>
                              <td className="border-r border-black px-2 py-1.5 text-center font-medium">
                                {item.salary || ''}
                              </td>
                              <td className="px-2 py-1.5 text-center font-medium">
                                {item.leaveReason || ''}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Row 11: 희망 취업 조건 & 근무시간 (PDF 양식 일치: 6칸 2행 정확한 그리드) */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-2 text-[11px] leading-tight">
                    희망<br />취업<br />조건
                  </td>
                  <td colSpan={5} className="p-0">
                    <table className="w-full border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-black">
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-2 w-[14%] text-[11px] tracking-widest">
                            직 &nbsp; 종
                          </td>
                          <td className="border-r border-black px-2 py-2 w-[19%] text-center text-[11px] font-medium">
                            {formData.desiredJobType || ''}
                          </td>
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-2 w-[14%] text-[11px]">
                            고용형태
                          </td>
                          <td className="border-r border-black px-2 py-2 w-[19%] text-center text-[11px] font-medium">
                            {formData.desiredEmploymentType || ''}
                          </td>
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-2 w-[14%] text-[11px]">
                            근무지역
                          </td>
                          <td className="px-2 py-2 w-[20%] text-center text-[11px] font-medium">
                            {formData.desiredWorkLocation || ''}
                          </td>
                        </tr>
                        <tr>
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-2 w-[14%] text-[11px]">
                            근무시간
                          </td>
                          <td className="border-r border-black px-2 py-2 w-[19%] text-center text-[11px] font-medium">
                            {formData.desiredWorkHours || ''}
                          </td>
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-2 w-[14%] text-[11px] tracking-widest">
                            급 &nbsp; 여
                          </td>
                          <td className="border-r border-black px-2 py-2 w-[19%] text-center text-[11px] font-medium">
                            {formData.desiredSalary || ''}
                          </td>
                          <td className="bg-slate-50 border-r border-black font-bold text-center py-2 w-[14%] text-[11px]">
                            기타사항
                          </td>
                          <td className="px-2 py-2 w-[20%] text-center text-[11px] font-medium">
                            {formData.desiredNotes || ''}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* Row 12: 상담내용 · 종합의견 */}
                <tr className="border-b border-black">
                  <td className="bg-slate-100 border-r border-black font-bold text-center py-4 text-[11px] leading-tight">
                    상담내용<br />·<br />종합의견
                  </td>
                  <td colSpan={5} className="p-3 text-[11px] font-medium leading-relaxed min-h-[90px] align-top whitespace-pre-wrap">
                    {formData.summaryOpinion ||
                      '훈련생의 구직 욕구 및 적합 직무 탐색 결과, 직무지도원 배치를 통한 환경적응 및 반복 훈련이 유효할 것으로 판단됨.'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Signatures Block */}
            <div className="mt-8 flex justify-end gap-10 text-xs font-bold text-slate-900 pr-4">
              <div className="flex items-center gap-2">
                <span>신 청 자 (대 리 인) :</span>
                <span className="font-bold underline underline-offset-2">
                  {formData.applicantSignerName || formData.name}
                </span>
                <span className="inline-flex items-center gap-1 relative">
                  (인)
                  {formData.applicantSignerCanvas && (
                    <img
                      src={formData.applicantSignerCanvas}
                      alt="신청자 서명"
                      className="absolute -top-3 -left-1 h-8 max-w-[50px] object-contain pointer-events-none"
                    />
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>상 담 사 :</span>
                <span className="font-bold underline underline-offset-2">
                  {formData.counselor || '상담사'}
                </span>
                <span className="inline-flex items-center gap-1 relative">
                  (인)
                  {formData.counselorSignature ? (
                    <img
                      src={formData.counselorSignature}
                      alt="상담사 서명"
                      className="absolute -top-3 -left-1 h-8 max-w-[50px] object-contain pointer-events-none"
                    />
                  ) : null}
                </span>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="text-center font-extrabold text-sm tracking-wider text-slate-900 pt-6">
            수원시장애인종합복지관
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: 개인정보 수집 ・ 이용 동의서                                      */}
        {/* ========================================================================= */}
        <div className="bg-white p-8 sm:p-10 shadow-lg border border-slate-300 rounded-2xl print:border-none print:shadow-none print:p-0 print:rounded-none min-h-[1080px] flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="text-center mb-4">
              <h1 className="text-2xl font-black tracking-[0.25em] text-slate-950 inline-block pb-1">
                개인정보 수집 ・ 이용 동의서
              </h1>
            </div>

            {/* Intro text */}
            <div className="text-[11.5px] leading-relaxed text-slate-800 mb-4 px-1 text-justify">
              수원시장애인종합복지관은 [개인정보보호법] 제15조 및 기타 관련 법률 등에 의거하여 귀하의
              개인정보를 수집·이용함에 있어 동의를 받고 있습니다. 아래 내용을 충분히 숙지하신 후 본인
              또는 보호자가 직접 동의란에 서명해 주시기 바랍니다.
            </div>

            {/* Section 1: 목적 및 보유기간, 불이익 */}
            <div className="border border-slate-700 p-3 rounded-lg text-[11px] leading-relaxed space-y-2 mb-3 bg-slate-50/40">
              <div>
                <span className="font-black text-slate-950">■ 개인정보 수집 및 이용 목적</span>
                <p className="mt-0.5 text-slate-800">
                  수원시장애인종합복지관은 프로그램 이용 시 복지관 업무와 복지정보 및 서비스이용 안내,
                  통계/분석, 사업홍보 등을 위해 개인정보를 수집합니다.
                </p>
              </div>

              <div>
                <span className="font-black text-slate-950">■ 개인정보 보유 및 이용기간</span>
                <p className="mt-0.5 text-slate-800">
                  수집한 개인정보 파일의 보유기간은 수집 목적을 달성한 시점까지이며, 파기를 요청하실 경우
                  절차에 따라 즉시(5일 이내) 파기됩니다.
                </p>
              </div>

              <div>
                <span className="font-black text-slate-950">
                  ■ 개인정보 제공 동의 거부 권리 및 동의 거부 따른 불이익 내용 또는 제한사항
                </span>
                <p className="mt-0.5 text-slate-800">
                  귀하는 개인정보 제공 동의를 거부할 권리가 있으며, 동의 거부에 따른 불이익은 없습니다.
                  다만, 미동의로 인해 해당되는 서비스 특성에 따라 제한이 있을 수 있습니다.
                </p>
              </div>

              {/* Check 1 */}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900">
                <span>개인정보의 수집 및 이용목적, 거부에 따른 불이익(제한사항)에 동의하십니까?</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreePurpose}
                      onChange={(e) => handleFieldChange('agreePurpose', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.agreePurpose ? '■' : '□'} 동의함</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.agreePurpose}
                      onChange={(e) => handleFieldChange('agreePurpose', !e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{!formData.agreePurpose ? '■' : '□'} 동의하지 않음</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: 기본개인정보 수집·이용 항목 */}
            <div className="border border-slate-700 p-3 rounded-lg text-[11px] leading-relaxed space-y-1.5 mb-3 bg-slate-50/40">
              <span className="font-black text-slate-950">■ 기본개인정보 수집·이용 항목</span>
              <p className="text-slate-800">
                ○ 기본정보 : 성명, 생년월일, 성별, 주소, 연락처(전화 또는 휴대전화, 이메일 주소) 등
              </p>

              {/* Check 2 */}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900">
                <span>기본개인정보 이용에 동의하십니까?</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeBasic}
                      onChange={(e) => handleFieldChange('agreeBasic', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.agreeBasic ? '■' : '□'} 동의함</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.agreeBasic}
                      onChange={(e) => handleFieldChange('agreeBasic', !e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{!formData.agreeBasic ? '■' : '□'} 동의하지 않음</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3: 민감정보 수집·이용 항목 */}
            <div className="border border-slate-700 p-3 rounded-lg text-[11px] leading-relaxed space-y-2 mb-3 bg-slate-50/40">
              <span className="font-black text-slate-950">■ 민감정보 수집·이용 항목</span>
              <div className="text-slate-800">
                <p>○ 민감정보 : 장애정보(진단명, 장애정도), 참여자(이용자)의 사진 및 동영상 자료</p>
                <p>
                  ○ 수집•이용목적 : 장애인 대상 확인, 복지관 홈페이지•SNS•리플렛 등 사업 홍보 활용
                </p>
              </div>

              {/* Check 3-1 */}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900">
                <span>장애정보 이용에 동의하십니까?</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeDisabilityInfo}
                      onChange={(e) => handleFieldChange('agreeDisabilityInfo', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.agreeDisabilityInfo ? '■' : '□'} 동의함</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.agreeDisabilityInfo}
                      onChange={(e) => handleFieldChange('agreeDisabilityInfo', !e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{!formData.agreeDisabilityInfo ? '■' : '□'} 동의하지 않음</span>
                  </label>
                </div>
              </div>

              {/* Check 3-2 */}
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900">
                <span>참여자(이용자)의 사진 및 영상 활용에 동의하십니까?</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreePhotoVideo}
                      onChange={(e) => handleFieldChange('agreePhotoVideo', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.agreePhotoVideo ? '■' : '□'} 동의함</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.agreePhotoVideo}
                      onChange={(e) => handleFieldChange('agreePhotoVideo', !e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{!formData.agreePhotoVideo ? '■' : '□'} 동의하지 않음</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: 고유식별정보 수집 */}
            <div className="border border-slate-700 p-3 rounded-lg text-[11px] leading-relaxed space-y-1.5 mb-3 bg-slate-50/40">
              <span className="font-black text-slate-950">■ 고유식별정보 수집</span>
              <div className="text-slate-800">
                <p>○ 고유식별정보 : 복지카드 사본(장애증명서), 주민등록번호, 기초생활수급자 증명서 등</p>
                <p>
                  ○ 수집•이용목적 : 장애인 대상 확인 증빙, 이용료 감면 대상 확인, 여행자보험 가입 등
                </p>
              </div>

              {/* Check 4 */}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900">
                <span>고유식별정보 처리에 동의하십니까?</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeUniqueId}
                      onChange={(e) => handleFieldChange('agreeUniqueId', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.agreeUniqueId ? '■' : '□'} 동의함</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.agreeUniqueId}
                      onChange={(e) => handleFieldChange('agreeUniqueId', !e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{!formData.agreeUniqueId ? '■' : '□'} 동의하지 않음</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 5: 개인정보 제 3자 정보제공•이용 */}
            <div className="border border-slate-700 p-3 rounded-lg text-[10.5px] leading-relaxed space-y-1 mb-4 bg-slate-50/40">
              <span className="font-black text-slate-950">■ 개인정보 제 3자 정보제공•이용</span>
              <div className="text-slate-800 space-y-0.5">
                <p>
                  ○ 수집•보유한 모든 개인정보는 ⌜ 개인정보보호법 ⌟ 에 의거하여 본인의 사전 동의 없이 제
                  3자에게 제공 또는 공유하지 않습니다. (단, ⌜ 개인정보보호법 ⌟ 제 18조 2항에 의거한
                  사항들에 대해서는 예외로 합니다.)
                </p>
                <p>
                  ○ 제공 받는자 : 보험사, 언론사, 지방자치단체, 국세청, 통합사례회의 참여기관 등
                </p>
                <p>
                  ○ 제공 목적 : 여행자보험 가입, 언론 보도, 지방자치단체 보고, 연말정산 간소화 서비스
                  이용, 사례 지원 서비스 계획수립 등
                </p>
                <p>
                  ○ 제공 항목 : 보험사(성함, 주민등록번호), 언론사(사진, 영상 등),
                  지방자치단체(사진, 기본개인정보 등), 국세청(성명, 주민등록번호, 기부금액 등),
                  통합사례회의 참여기관(사례관리 대상자 기본 개인정보, 민감정보 등)
                </p>
              </div>

              {/* Check 5 */}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900 text-[11px]">
                <span>개인정보 제 3자 정보제공•이용에 동의하십니까?</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeThirdParty}
                      onChange={(e) => handleFieldChange('agreeThirdParty', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.agreeThirdParty ? '■' : '□'} 동의함</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.agreeThirdParty}
                      onChange={(e) => handleFieldChange('agreeThirdParty', !e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{!formData.agreeThirdParty ? '■' : '□'} 동의하지 않음</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Closing statement */}
            <div className="text-center font-bold text-xs text-slate-900 my-4 px-2 leading-relaxed">
              상기인은 위의 내용을 충분히 숙지하였으며, 수원시장애인종합복지관의 보다 나은 서비스
              제공과 정책수립을 위해 개인정보를 수집, 활용에 동의하고 프로그램 이용을 신청합니다.
            </div>

            {/* Date */}
            <div className="text-center font-bold text-sm tracking-widest text-slate-900 my-5">
              {agreeYear}년 &nbsp; {agreeMonth}월 &nbsp; {agreeDay}일
            </div>

            {/* Signatures & Delegation Block */}
            <div className="border-t border-b border-black py-4 px-6 space-y-4 my-2 text-xs font-bold text-slate-900 bg-slate-50/20">
              {/* Primary Signer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-20">동의자 :</span>
                  <span className="text-sm font-extrabold underline underline-offset-4">
                    {formData.applicantSignerName || formData.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative inline-flex items-center justify-center min-w-[120px] h-10 border border-dashed border-slate-400 bg-white rounded px-3">
                    {formData.applicantSignerCanvas ? (
                      <img
                        src={formData.applicantSignerCanvas}
                        alt="동의자 서명"
                        className="max-h-8 max-w-[100px] object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 text-[11px]">(인 또는 서명)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSignModal('applicant')}
                    className="print:hidden py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <PenTool className="h-3 w-3" />
                    서명 패드
                  </button>
                </div>
              </div>

              {/* Guardian / Delegate Signer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1 cursor-pointer mr-2">
                    <input
                      type="checkbox"
                      checked={formData.isDelegated}
                      onChange={(e) => handleFieldChange('isDelegated', e.target.checked)}
                      className="print:hidden rounded text-indigo-600"
                    />
                    <span>{formData.isDelegated ? '■' : '□'} 위임</span>
                  </label>
                  <span>보호자 또는 동의자 :</span>
                  <span className="text-sm font-extrabold underline underline-offset-4">
                    {formData.guardianSignerName || (formData.isDelegated ? '보호자 성명' : '-')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative inline-flex items-center justify-center min-w-[120px] h-10 border border-dashed border-slate-400 bg-white rounded px-3">
                    {formData.guardianSignerCanvas ? (
                      <img
                        src={formData.guardianSignerCanvas}
                        alt="보호자 서명"
                        className="max-h-8 max-w-[100px] object-contain"
                      />
                    ) : (
                      <span className="text-slate-400 text-[11px]">(인 또는 서명)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSignModal('guardian')}
                    className="print:hidden py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <PenTool className="h-3 w-3" />
                    보호자 서명
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="text-center font-black text-base tracking-[0.25em] text-slate-950 pt-8 pb-2">
            수원시장애인종합복지관장 귀하
          </div>
        </div>
      </div>

      {/* Touch/Tablet Signature Pad Modal */}
      <SignaturePadModal
        isOpen={activeSignModal !== null}
        title={
          activeSignModal === 'applicant'
            ? '신청자 / 동의자 태블릿 직접 서명'
            : activeSignModal === 'guardian'
            ? '보호자 또는 대리인 태블릿 직접 서명'
            : '상담사 서명'
        }
        subtitle="태블릿 화면에서 터치펜 또는 손가락으로 자연스럽게 서명해 주세요."
        initialSignature={
          activeSignModal === 'applicant'
            ? formData.applicantSignerCanvas
            : activeSignModal === 'guardian'
            ? formData.guardianSignerCanvas
            : formData.counselorSignature
        }
        onSave={(dataUrl) => {
          if (activeSignModal === 'applicant') {
            handleFieldChange('applicantSignerCanvas', dataUrl);
            handleFieldChange('applicantSignature', dataUrl);
          } else if (activeSignModal === 'guardian') {
            handleFieldChange('guardianSignerCanvas', dataUrl);
          } else if (activeSignModal === 'counselor') {
            handleFieldChange('counselorSignature', dataUrl);
          }
          setActiveSignModal(null);
        }}
        onClose={() => setActiveSignModal(null)}
      />
    </div>
  );
}
