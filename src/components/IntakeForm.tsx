import React, { useState } from 'react';
import { Client, ClientIntakeRecord, FamilyMember, EducationHistory, ServiceHistory, WorkHistory, DiagnosisItem } from '../types';
import { Save, ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2, User, HeartPulse, Users, Stethoscope, Activity, FileText, Sparkles } from 'lucide-react';

interface IntakeFormProps {
  client: Client;
  onSave: (record: ClientIntakeRecord) => void;
  onCancel: () => void;
}

function formatIdNum(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

function calculateAgeFromIdNum(idNum: string): string {
  const digits = idNum.replace(/\D/g, '');
  if (digits.length < 7) return '';

  const yy = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10) - 1; // 0-indexed month
  const dd = parseInt(digits.slice(4, 6), 10);
  const genderDigit = digits.charAt(6);

  let century = 1900;
  if (genderDigit === '1' || genderDigit === '2' || genderDigit === '5' || genderDigit === '6') {
    century = 1900;
  } else if (genderDigit === '3' || genderDigit === '4' || genderDigit === '7' || genderDigit === '8') {
    century = 2000;
  } else if (genderDigit === '9' || genderDigit === '0') {
    century = 1800;
  }

  const birthYear = century + yy;
  const today = new Date();
  let age = today.getFullYear() - birthYear;

  const birthDateThisYear = new Date(today.getFullYear(), mm, dd);
  if (today < birthDateThisYear) {
    age--;
  }

  return age >= 0 ? String(age) : '';
}

export function generateAiCounselingNotes(data: ClientIntakeRecord, client: Client): string {
  const name = client.name;
  const age = data.age || calculateAgeFromIdNum(data.idNum) || '';
  const ageStr = age ? `(만 ${age}세)` : '';
  const diagnosis = data.disabilityName || client.diagnosis || '지적장애';
  const grade = data.disabilityGrade || '중증(심한장애)';
  const cause = data.disabilityCause || '선천적장애';

  const selectedPrograms = data.desiredPrograms && data.desiredPrograms.length > 0
    ? data.desiredPrograms.join(', ')
    : (data.desiredProgram || 'AI전자작가');
  const programStr = selectedPrograms + (data.desiredProgramOther ? ` (${data.desiredProgramOther})` : '');

  const adlItems = data.adlCheckedItems && data.adlCheckedItems.length > 0
    ? data.adlCheckedItems.join(', ')
    : '기본 일상생활 자립 수행 가능';

  const healthStr = `건강상태 ${data.currentHealthStatus || '양호'}, 약물복용 여부 [${data.medicationIsTaking === '○' ? `복용 중(${data.medicationReason || '기분조절'})` : 'X'}]`;
  const familyStr = `가족관계 ${data.familyRelation || '원만'}, 동거가족 ${data.familyMembers?.length || 0}명`;

  return `[수원시장애인종합복지관 능력개발지원팀 직업적응훈련반 초기 접수상담 소견]

1. 기본 인적사항 및 장애 특성
- 훈련생 ${name}${ageStr}은(는) ${diagnosis}(${grade}, ${cause})로, 직업적응훈련반 서비스 이용을 위해 접수상담을 진행함.
- 주요 상담 내용 및 주된 어려움: ${data.mainDifficulty || '일상생활 수행 및 직업적응 훈련 필요'}.

2. 전반적 일상생활수행능력(ADL) 및 개인 특성
- ADL 자립 항목: ${adlItems}${data.adlOther ? ` (기타: ${data.adlOther})` : ''}.
- 성격 및 특성: ${data.personality || '온순하고 긍정적이나 환경 적응 지원 필요'}.
- 취미 및 여가: ${data.hobbies || '음악감상, 산책'}.
- 운동기능 및 사회적 관계: ${data.motorSkills || '대근육 양호'} / ${data.socialRelations || '원만한 관계 유지'}.

3. 가계 및 건강상태
- ${familyStr}. (가족력: ${data.familyHistory || '특이사항 없음'})
- ${healthStr}. (주 진료기관: ${data.currentHospital || '없음'})

4. 희망 프로그램 및 종합의견
- 희망 프로그램: ${programStr}.
- 종합소견: 상기 훈련생은 직업적응훈련반 참여 의지가 높으며, ${programStr} 활동을 통한 직업적응 및 사회적 자립 능력 향상이 기대됨. 상황평가(2주) 진행 후 개별화 직업재활계획(IWP)을 수립하여 구체적 훈련을 제공하는 것이 적절함.`;
}

export function getDefaultIntakeRecord(client: Client): ClientIntakeRecord {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const defaultYearYY = String(yyyy).slice(-2);

  const defaults: ClientIntakeRecord = {
    receiptNo: `${defaultYearYY}-001`,
    counselor: '',
    counselDate: dateStr,
    idNum: '',
    birthType: '양',
    age: '0',
    address: '',
    phone: '',
    mobileSelf: '',
    mobileGuard: '',
    email: '',
    housingType: '자가',
    housingTypeOther: '',
    economicCondition: '일반',
    maritalStatus: '미혼',
    hasJob: '무',
    hasDisabilityReg: '유',
    disabilityName: client.diagnosis || '지적장애',
    disabilityGrade: '중증(심한장애)',
    disabilityYear: '',
    disabilityCause: '선천적장애',
    useAssistiveDevice: 'X',
    assistiveDeviceName: '',
    mainDifficulty: '일상생활 수행 및 직업 적응 훈련 필요',
    desiredProgram: 'AI전자작가',
    desiredPrograms: ['AI전자작가'],
    desiredProgramOther: '',
    referralRoute: '주위 소개',
    referralRouteOther: '',
    evaluations: {
      social: true,
      psychological: false,
      speech: false,
      motor: true,
      vocational: true,
      reApplication: false,
    },
    familyMembers: [
      { id: 'f1', name: '', age: '', relation: '부', job: '', note: '' },
      { id: 'f2', name: '', age: '', relation: '모', job: '', note: '' },
    ],
    familyRelation: '원만',
    familyHistory: '특이 가족력 없음',
    medicalHistoryHospital: '',
    medicalHistoryContent: '',
    currentHospital: '',
    medicationIsTaking: '×',
    medicationUsage: '',
    medicationReason: '',
    currentHealthStatus: '양호',
    diagnosisList: [
      { id: 'd1', name: client.diagnosis || '지적장애', date: '', agency: '' }
    ],
    diagnosisName1: client.diagnosis || '지적장애',
    diagnosisDate: '',
    diagnosisAgency: '',
    diagnosisName2: '',
    applicantName: client.name,
    adlCheckedItems: ['대화하기', '식사하기', '착탈의', '대변보기', '소변보기', '실내 이동하기', '계단오르기', '내려가기'],
    adlDialogue: '가능',
    adlEating: '가능',
    adlDressing: '가능',
    adlDefecation: '가능',
    adlUrination: '가능',
    adlBathing: '부분도움',
    adlIndoorMove: '가능',
    adlStairs: '가능',
    adlOutdoorMove: '부분도움',
    adlOther: '',
    personality: '온순하고 긍정적이나 다소 수줍음이 있음.',
    hobbies: '음악 감상, 산책',
    motorSkills: '대근육 양호, 소근육 정밀 작업 훈련 필요',
    socialRelations: '원만한 또래 관계 유지',
    education: [
      { school: '', major: '', period: '', note: '' },
    ],
    currentServices: [],
    pastServices: [],
    workHistory: [],
    counselingNotes: '',
  };

  if (client.intakeRecord) {
    return {
      ...defaults,
      ...client.intakeRecord,
      evaluations: {
        ...defaults.evaluations,
        ...(client.intakeRecord.evaluations || {}),
      },
      familyMembers: client.intakeRecord.familyMembers && client.intakeRecord.familyMembers.length > 0 
        ? client.intakeRecord.familyMembers 
        : defaults.familyMembers,
      diagnosisList: client.intakeRecord.diagnosisList && client.intakeRecord.diagnosisList.length > 0 
        ? client.intakeRecord.diagnosisList 
        : defaults.diagnosisList,
      adlCheckedItems: client.intakeRecord.adlCheckedItems || defaults.adlCheckedItems,
      education: client.intakeRecord.education || defaults.education,
      currentServices: client.intakeRecord.currentServices || defaults.currentServices,
      pastServices: client.intakeRecord.pastServices || defaults.pastServices,
      workHistory: client.intakeRecord.workHistory || defaults.workHistory,
      desiredPrograms: client.intakeRecord.desiredPrograms || defaults.desiredPrograms,
    };
  }

  return defaults;
}

export default function IntakeForm({ client, onSave, onCancel }: IntakeFormProps) {
  const [formData, setFormData] = useState<ClientIntakeRecord>(() => getDefaultIntakeRecord(client));
  const [currentStep, setCurrentStep] = useState<number>(1);

  const steps = [
    { num: 1, title: '접수 & 인적사항', icon: User },
    { num: 2, title: '장애 & 복지관 이용', icon: Activity },
    { num: 3, title: '가족사항 & 가계도', icon: Users },
    { num: 4, title: '병력 & 건강/진단', icon: Stethoscope },
    { num: 5, title: '사회평가 & ADL', icon: HeartPulse },
    { num: 6, title: '이력사항 & 상담내용', icon: FileText },
  ];

  const updateField = (key: keyof ClientIntakeRecord, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const toggleDesiredProgram = (prog: string) => {
    const currentList = formData.desiredPrograms && formData.desiredPrograms.length > 0
      ? formData.desiredPrograms
      : (formData.desiredProgram ? formData.desiredProgram.split(', ') : ['AI전자작가']);
    
    let updatedList: string[];
    if (currentList.includes(prog)) {
      updatedList = currentList.filter(p => p !== prog);
    } else {
      updatedList = [...currentList, prog];
    }
    setFormData(prev => ({
      ...prev,
      desiredPrograms: updatedList,
      desiredProgram: updatedList.join(', '),
    }));
  };

  const handleIdNumChange = (val: string) => {
    const formatted = formatIdNum(val);
    const autoAge = calculateAgeFromIdNum(formatted);
    setFormData(prev => ({
      ...prev,
      idNum: formatted,
      age: autoAge !== '' ? autoAge : prev.age,
    }));
  };

  const updateEvaluation = (key: keyof ClientIntakeRecord['evaluations'], val: boolean) => {
    setFormData(prev => ({
      ...prev,
      evaluations: {
        ...prev.evaluations,
        [key]: val,
      },
    }));
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Dynamic Family Member Handlers
  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { id: Math.random().toString(), name: '', age: '', relation: '', job: '', note: '' },
      ],
    }));
  };

  const removeFamilyMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(f => f.id !== id),
    }));
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, val: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(f => (f.id === id ? { ...f, [field]: val } : f)),
    }));
  };

  // Dynamic Diagnosis List Handlers
  const addDiagnosisItem = () => {
    const currentList = formData.diagnosisList || [];
    setFormData(prev => ({
      ...prev,
      diagnosisList: [
        ...currentList,
        { id: Math.random().toString(), name: '', date: '', agency: '', note: '' },
      ],
    }));
  };

  const removeDiagnosisItem = (id: string) => {
    const currentList = formData.diagnosisList || [];
    setFormData(prev => ({
      ...prev,
      diagnosisList: currentList.filter(d => d.id !== id),
    }));
  };

  const updateDiagnosisItem = (id: string, field: keyof DiagnosisItem, val: string) => {
    const currentList = formData.diagnosisList || [];
    setFormData(prev => ({
      ...prev,
      diagnosisList: currentList.map(d => (d.id === id ? { ...d, [field]: val } : d)),
    }));
  };

  // Dynamic Education Handlers
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { school: '', major: '', period: '', note: '' }],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: keyof EducationHistory, val: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((e, i) => (i === index ? { ...e, [field]: val } : e)),
    }));
  };

  // Dynamic Service Handlers
  const addService = (type: 'currentServices' | 'pastServices') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { agency: '', content: '', period: '', note: '' }],
    }));
  };

  const removeService = (type: 'currentServices' | 'pastServices', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateService = (type: 'currentServices' | 'pastServices', index: number, field: keyof ServiceHistory, val: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((s, i) => (i === index ? { ...s, [field]: val } : s)),
    }));
  };

  // Dynamic Work History
  const addWork = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { company: '', jobTitle: '', period: '', reasonForLeaving: '', note: '' }],
    }));
  };

  const removeWork = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index),
    }));
  };

  const updateWork = (index: number, field: keyof WorkHistory, val: string) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map((w, i) => (i === index ? { ...w, [field]: val } : w)),
    }));
  };

  // ADL Checkbox Toggle
  const toggleAdlCheck = (itemLabel: string) => {
    const currentList = formData.adlCheckedItems || [];
    const isChecked = currentList.includes(itemLabel);
    let updatedList: string[];
    if (isChecked) {
      updatedList = currentList.filter(item => item !== itemLabel);
    } else {
      updatedList = [...currentList, itemLabel];
    }
    setFormData(prev => ({
      ...prev,
      adlCheckedItems: updatedList,
    }));
  };

  const adlOptions = [
    '대화하기',
    '식사하기',
    '착탈의',
    '대변보기',
    '소변보기',
    '목욕하기',
    '실내 이동하기',
    '계단오르기',
    '내려가기',
    '바깥일보기',
    '기타',
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <span>수원시장애인종합복지관</span>
            <span>•</span>
            <span>훈련생 개별파일 입력</span>
          </div>
          <h2 className="text-xl font-black text-slate-800">
            {client.name} 훈련생 접수상담기록지 & 사회평가지
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            분량에 맞춰 6개 단계로 나누어져 있습니다. 차례대로 입력하거나 원하는 단계를 선택하여 기재하십시오.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveSubmit}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-150"
          >
            <Save className="h-4 w-4" />
            저장 및 양식 출력
          </button>
        </div>
      </div>

      {/* Step Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map(s => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {s.num}단계
                </span>
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
              </div>
              <span className="font-extrabold text-xs tracking-tight line-clamp-1">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Form Body */}
      <form onSubmit={handleSaveSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
        
        {/* STEP 1: 접수 & 인적사항 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
                1단계: 접수 기본 정보 & 대상자 인적사항
              </h3>
              <span className="text-xs text-slate-400 font-mono">1 / 6 Step</span>
            </div>

            {/* Basic Registration info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">접수번호</label>
                <input
                  type="text"
                  value={formData.receiptNo}
                  onChange={e => updateField('receiptNo', e.target.value)}
                  placeholder="26-001"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">상담자</label>
                <input
                  type="text"
                  value={formData.counselor}
                  onChange={e => updateField('counselor', e.target.value)}
                  placeholder="담당자 이름"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">상담일시 (달력 선택)</label>
                <input
                  type="date"
                  value={formData.counselDate ? formData.counselDate.slice(0, 10) : ''}
                  onChange={e => updateField('counselDate', e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">성명</label>
                <input
                  type="text"
                  value={client.name}
                  disabled
                  className="w-full text-xs p-2.5 bg-slate-100 font-bold border border-slate-200 rounded-xl text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">주민등록번호 (하이픈 자동)</label>
                <input
                  type="text"
                  value={formData.idNum}
                  onChange={e => handleIdNumChange(e.target.value)}
                  placeholder="숫자만 입력 (000000-0000000)"
                  maxLength={14}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">생년월일 (음/양)</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={client.birthDate}
                    disabled
                    className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-xl"
                  />
                  <select
                    value={formData.birthType}
                    onChange={e => updateField('birthType', e.target.value)}
                    className="text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="양">양</option>
                    <option value="음">음</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">만 나이 (주민번호 자동계산)</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={e => updateField('age', e.target.value)}
                  placeholder="자동계산 세"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700 bg-indigo-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">주소</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => updateField('address', e.target.value)}
                placeholder="경기도 수원시 ..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Contacts & Email */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">전화번호</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="031-000-0000"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">휴대폰 (본인)</label>
                <input
                  type="text"
                  value={formData.mobileSelf}
                  onChange={e => updateField('mobileSelf', e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">휴대폰 (보호자)</label>
                <input
                  type="text"
                  value={formData.mobileGuard}
                  onChange={e => updateField('mobileGuard', e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Housing, Economic, Marriage, Job */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">주택 소유형태</label>
                <select
                  value={formData.housingType}
                  onChange={e => updateField('housingType', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="자가">자가</option>
                  <option value="전세">전세</option>
                  <option value="월세">월세</option>
                  <option value="임대">임대</option>
                  <option value="영구임대">영구임대</option>
                  <option value="기타">기타</option>
                </select>
                {formData.housingType === '기타' && (
                  <input
                    type="text"
                    value={formData.housingTypeOther || ''}
                    onChange={e => updateField('housingTypeOther', e.target.value)}
                    placeholder="기타 상세 입력"
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl mt-1"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">경제적 여건</label>
                <select
                  value={formData.economicCondition}
                  onChange={e => updateField('economicCondition', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="일반">일반</option>
                  <option value="차상위">차상위</option>
                  <option value="수급권">수급권</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">결혼여부</label>
                <select
                  value={formData.maritalStatus}
                  onChange={e => updateField('maritalStatus', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="미혼">미혼</option>
                  <option value="기혼">기혼</option>
                  <option value="동거">동거</option>
                  <option value="이혼">이혼</option>
                  <option value="사별">사별</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">직업유무</label>
                <select
                  value={formData.hasJob}
                  onChange={e => updateField('hasJob', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="무">무 (미취업)</option>
                  <option value="유">유 (취업 중)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 장애 & 복지관 이용 정보 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
                2단계: 장애 등록 정보 & 복지관 이용 신청
              </h3>
              <span className="text-xs text-slate-400 font-mono">2 / 6 Step</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">장애등록 여부</label>
                <select
                  value={formData.hasDisabilityReg}
                  onChange={e => updateField('hasDisabilityReg', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="유">등록 (유)</option>
                  <option value="무">미등록 (무)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">장애명</label>
                <input
                  type="text"
                  value={formData.disabilityName}
                  onChange={e => updateField('disabilityName', e.target.value)}
                  placeholder="예: 지적장애"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">장애등급 선택</label>
                <select
                  value={formData.disabilityGrade}
                  onChange={e => updateField('disabilityGrade', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-indigo-800"
                >
                  <option value="중증(심한장애)">중증(심한장애)</option>
                  <option value="경증(심하지않은장애)">경증(심하지않은장애)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">장애발생년도</label>
                <input
                  type="text"
                  value={formData.disabilityYear}
                  onChange={e => updateField('disabilityYear', e.target.value)}
                  placeholder="예: 2012년"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">장애원인 선택</label>
                <select
                  value={formData.disabilityCause}
                  onChange={e => updateField('disabilityCause', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                >
                  <option value="선천적장애">선천적장애</option>
                  <option value="후천적장애">후천적장애</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">보장구 사용여부</label>
                <select
                  value={formData.useAssistiveDevice}
                  onChange={e => updateField('useAssistiveDevice', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="X">X (사용 안 함)</option>
                  <option value="○">○ (사용함)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">보장구명</label>
                <input
                  type="text"
                  value={formData.assistiveDeviceName}
                  onChange={e => updateField('assistiveDeviceName', e.target.value)}
                  placeholder="예: 휠체어, 보청기 등"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">주 된 어려움</label>
                <textarea
                  rows={2}
                  value={formData.mainDifficulty}
                  onChange={e => updateField('mainDifficulty', e.target.value)}
                  placeholder="대상자가 주로 겪고 있는 소통, 대인관계, 직업적응 관련 어려움"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    희망하는 프로그램 선택 (복수 선택 가능)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {['AI전자작가', '공예', '미술', '사무보조', '샌드아트', '스마트팜', '기타'].map(prog => {
                      const selectedList = formData.desiredPrograms && formData.desiredPrograms.length > 0
                        ? formData.desiredPrograms
                        : (formData.desiredProgram ? formData.desiredProgram.split(', ') : ['AI전자작가']);
                      const isChecked = selectedList.includes(prog);
                      return (
                        <label
                          key={prog}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleDesiredProgram(prog);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 font-medium border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span className="text-xs">{prog}</span>
                        </label>
                      );
                    })}
                  </div>
                  {((formData.desiredPrograms || []).includes('기타') || formData.desiredProgram?.includes('기타')) && (
                    <input
                      type="text"
                      value={formData.desiredProgramOther || ''}
                      onChange={e => updateField('desiredProgramOther', e.target.value)}
                      placeholder="기타 희망 프로그램 직접 입력"
                      className="w-full text-xs p-2.5 border border-indigo-200 rounded-xl mt-2 bg-indigo-50/40 focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">복지관 이용경로</label>
                  <select
                    value={formData.referralRoute}
                    onChange={e => updateField('referralRoute', e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="인터넷">인터넷</option>
                    <option value="주위 소개">주위 소개</option>
                    <option value="타기관 소개">타기관 소개</option>
                    <option value="기타">기타</option>
                  </select>
                  {formData.referralRoute === '기타' && (
                    <input
                      type="text"
                      value={formData.referralRouteOther || ''}
                      onChange={e => updateField('referralRouteOther', e.target.value)}
                      placeholder="기타 이용경로 입력"
                      className="w-full text-xs p-2 border border-slate-200 rounded-xl mt-1"
                    />
                  )}
                </div>
              </div>

              {/* Evaluation Checkboxes */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">평가 여부 (해당 항목 체크)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs pt-1">
                  {[
                    { key: 'social', label: '사회평가' },
                    { key: 'psychological', label: '심리평가' },
                    { key: 'speech', label: '언어평가' },
                    { key: 'motor', label: '운동기능평가' },
                    { key: 'vocational', label: '직업평가' },
                    { key: 'reApplication', label: '재접수' },
                  ].map(ev => (
                    <label key={ev.key} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-indigo-50/50">
                      <input
                        type="checkbox"
                        checked={(formData.evaluations as any)[ev.key]}
                        onChange={e => updateEvaluation(ev.key as any, e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-semibold text-slate-700 text-xs">{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 동거가족 & 가계도/가족력 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
                3단계: 동거 가족 명단 및 가계도/가족력
              </h3>
              <span className="text-xs text-slate-400 font-mono">3 / 6 Step</span>
            </div>

            {/* Family Members Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-extrabold text-slate-700">동거 가족 목록</label>
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1 border border-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  가족 추가
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">성명</th>
                      <th className="p-2.5">연령</th>
                      <th className="p-2.5">관계</th>
                      <th className="p-2.5">직업</th>
                      <th className="p-2.5">비고</th>
                      <th className="p-2.5 w-10 text-center">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.familyMembers.map(m => (
                      <tr key={m.id}>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={m.name}
                            onChange={e => updateFamilyMember(m.id, 'name', e.target.value)}
                            placeholder="이름"
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={m.age}
                            onChange={e => updateFamilyMember(m.id, 'age', e.target.value)}
                            placeholder="연령"
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={m.relation}
                            onChange={e => updateFamilyMember(m.id, 'relation', e.target.value)}
                            placeholder="부, 모, 형제"
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={m.job}
                            onChange={e => updateFamilyMember(m.id, 'job', e.target.value)}
                            placeholder="직업"
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={m.note}
                            onChange={e => updateFamilyMember(m.id, 'note', e.target.value)}
                            placeholder="비고"
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeFamilyMember(m.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Family Relation & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">가족관계 형태</label>
                <select
                  value={formData.familyRelation}
                  onChange={e => updateField('familyRelation', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="수용">1) 수용</option>
                  <option value="부정">2) 부정</option>
                  <option value="슬픔">3) 슬픔</option>
                  <option value="원만">4) 원만</option>
                  <option value="기타">5) 기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">가족력 특이사항</label>
                <textarea
                  rows={2}
                  value={formData.familyHistory}
                  onChange={e => updateField('familyHistory', e.target.value)}
                  placeholder="가족 중 장애 동거인 여부, 지지 체계 등"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: 병력 & 건강/진단사항 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
                4단계: 병력, 건강상태 및 진단사항
              </h3>
              <span className="text-xs text-slate-400 font-mono">4 / 6 Step</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">병력 및 치료경험 (진료병원/시기)</label>
                <input
                  type="text"
                  value={formData.medicalHistoryHospital}
                  onChange={e => updateField('medicalHistoryHospital', e.target.value)}
                  placeholder="예: 아주대병원 (2020년)"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">진료내용</label>
                <input
                  type="text"
                  value={formData.medicalHistoryContent}
                  onChange={e => updateField('medicalHistoryContent', e.target.value)}
                  placeholder="예: 정기 검진 및 재활 치료"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">현재의 진료병원 / 과목</label>
              <input
                type="text"
                value={formData.currentHospital}
                onChange={e => updateField('currentHospital', e.target.value)}
                placeholder="예: 성빈센트병원 정신건강의학과"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Medication & Health Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">약물복용 여부</label>
                <select
                  value={formData.medicationIsTaking}
                  onChange={e => updateField('medicationIsTaking', e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="×">× (복용 안 함)</option>
                  <option value="○">○ (복용 중)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">복용법</label>
                <input
                  type="text"
                  value={formData.medicationUsage}
                  onChange={e => updateField('medicationUsage', e.target.value)}
                  placeholder="예: 매일 아침 1회"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">복용 이유</label>
                <input
                  type="text"
                  value={formData.medicationReason}
                  onChange={e => updateField('medicationReason', e.target.value)}
                  placeholder="예: 기분조절제"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">현재 건강상태</label>
                <input
                  type="text"
                  value={formData.currentHealthStatus}
                  onChange={e => updateField('currentHealthStatus', e.target.value)}
                  placeholder="예: 양호"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Diagnosis Items Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-800">진단사항</label>
                <button
                  type="button"
                  onClick={addDiagnosisItem}
                  className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1 border border-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  진단사항 추가
                </button>
              </div>

              {(formData.diagnosisList || []).map((diag, idx) => (
                <div key={diag.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">진단명</label>
                    <input
                      type="text"
                      value={diag.name}
                      onChange={e => updateDiagnosisItem(diag.id, 'name', e.target.value)}
                      placeholder="진단명"
                      className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">진단시기</label>
                    <input
                      type="text"
                      value={diag.date}
                      onChange={e => updateDiagnosisItem(diag.id, 'date', e.target.value)}
                      placeholder="2018년"
                      className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">진단기관</label>
                    <input
                      type="text"
                      value={diag.agency}
                      onChange={e => updateDiagnosisItem(diag.id, 'agency', e.target.value)}
                      placeholder="병원명"
                      className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">비고 / 부진단</label>
                      <input
                        type="text"
                        value={diag.note || ''}
                        onChange={e => updateDiagnosisItem(diag.id, 'note', e.target.value)}
                        placeholder="기타"
                        className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    {(formData.diagnosisList || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDiagnosisItem(diag.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">신청자 (보호자) 성명</label>
              <input
                type="text"
                value={formData.applicantName}
                onChange={e => updateField('applicantName', e.target.value)}
                placeholder="동의 서명자 성명"
                className="w-full md:w-1/2 text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 5: 사회평가 & ADL */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
                5단계: 사회평가지 - 일상생활수행능력(ADL) & 개인 특성
              </h3>
              <span className="text-xs text-slate-400 font-mono">5 / 6 Step</span>
            </div>

            {/* ADL Checkboxes */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  일상생활수행능력 (글로 쓰지 않고 체크박스로 선택 / 중복 선택 가능)
                </label>
                <p className="text-[11px] text-slate-500">훈련생이 타인의 도움 없이 자립 수행 가능한 항목들을 모두 체크하십시오.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                {adlOptions.map(opt => {
                  const isChecked = (formData.adlCheckedItems || []).includes(opt);
                  return (
                    <label
                      key={opt}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleAdlCheck(opt);
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 font-medium border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-xs">{opt}</span>
                    </label>
                  );
                })}
              </div>

              {/* If '기타' is checked or user wants to add notes */}
              {((formData.adlCheckedItems || []).includes('기타') || formData.adlOther) && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">기타 일상생활수행능력 직접 입력</label>
                  <input
                    type="text"
                    value={formData.adlOther}
                    onChange={e => updateField('adlOther', e.target.value)}
                    placeholder="기타 특이사항 직접 입력"
                    className="w-full text-xs p-2.5 border border-indigo-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Personality, Hobbies, Motor, Social */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">성격 및 특성</label>
                <textarea
                  rows={2}
                  value={formData.personality}
                  onChange={e => updateField('personality', e.target.value)}
                  placeholder="성격, 행동적 특성 기재"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">취미 및 여가생활</label>
                <textarea
                  rows={2}
                  value={formData.hobbies}
                  onChange={e => updateField('hobbies', e.target.value)}
                  placeholder="선호하는 여가 활동"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">운동기능</label>
                <textarea
                  rows={2}
                  value={formData.motorSkills}
                  onChange={e => updateField('motorSkills', e.target.value)}
                  placeholder="대근육, 소근육, 보행 상태"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">사회적 관계 (친구, 이웃, 종교 등)</label>
                <textarea
                  rows={2}
                  value={formData.socialRelations}
                  onChange={e => updateField('socialRelations', e.target.value)}
                  placeholder="대인관계 형성 및 의사소통 태도"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: 이력사항 & 상담내용 */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
                6단계: 학력, 이용 서비스, 취업경력 및 상세 상담내용
              </h3>
              <span className="text-xs text-slate-400 font-mono">6 / 6 Step</span>
            </div>

            {/* Education History */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-extrabold text-slate-800">
                  교육사항 (최종학교, 전공, 시기, 기타사항)
                </label>
                <button
                  type="button"
                  onClick={addEducation}
                  className="py-1 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1 border border-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" /> 학력 추가
                </button>
              </div>

              <div className="hidden md:grid grid-cols-4 gap-2 px-3 py-1.5 text-xs font-extrabold text-slate-600 border-b border-slate-200 bg-slate-100/70 rounded-t-xl">
                <div>최종학교</div>
                <div>전공</div>
                <div>시기</div>
                <div>기타사항</div>
              </div>

              {(formData.education || []).map((edu, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">최종학교</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={e => updateEducation(idx, 'school', e.target.value)}
                      placeholder="최종학교"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">전공</label>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={e => updateEducation(idx, 'major', e.target.value)}
                      placeholder="전공"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">시기</label>
                    <input
                      type="text"
                      value={edu.period}
                      onChange={e => updateEducation(idx, 'period', e.target.value)}
                      placeholder="시기"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">기타사항</label>
                      <input
                        type="text"
                        value={edu.note}
                        onChange={e => updateEducation(idx, 'note', e.target.value)}
                        placeholder="기타사항"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded mt-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current & Past Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 현 이용 서비스 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-extrabold text-slate-700">현 이용 서비스</label>
                  <button
                    type="button"
                    onClick={() => addService('currentServices')}
                    className="py-1 px-2.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1 border border-indigo-100"
                  >
                    <Plus className="h-3 w-3" /> 서비스 추가
                  </button>
                </div>
                {(formData.currentServices || []).map((srv, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={srv.agency}
                      onChange={e => updateService('currentServices', idx, 'agency', e.target.value)}
                      placeholder="기관명(법인/민간 등)"
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      value={srv.content}
                      onChange={e => updateService('currentServices', idx, 'content', e.target.value)}
                      placeholder="내용"
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      value={srv.period}
                      onChange={e => updateService('currentServices', idx, 'period', e.target.value)}
                      placeholder="시기"
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={srv.note}
                        onChange={e => updateService('currentServices', idx, 'note', e.target.value)}
                        placeholder="기타사항"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                      />
                      <button type="button" onClick={() => removeService('currentServices', idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(formData.currentServices || []).length === 0 && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                    등록된 현 이용 서비스가 없습니다. 추가 버튼을 누르세요.
                  </p>
                )}
              </div>

              {/* 과거 이용 서비스 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-extrabold text-slate-700">과거 이용 서비스</label>
                  <button
                    type="button"
                    onClick={() => addService('pastServices')}
                    className="py-1 px-2.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1 border border-indigo-100"
                  >
                    <Plus className="h-3 w-3" /> 서비스 추가
                  </button>
                </div>
                {(formData.pastServices || []).map((srv, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={srv.agency}
                      onChange={e => updateService('pastServices', idx, 'agency', e.target.value)}
                      placeholder="기관명(법인/민간 등)"
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      value={srv.content}
                      onChange={e => updateService('pastServices', idx, 'content', e.target.value)}
                      placeholder="내용"
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                    />
                    <input
                      type="text"
                      value={srv.period}
                      onChange={e => updateService('pastServices', idx, 'period', e.target.value)}
                      placeholder="시기"
                      className="text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={srv.note}
                        onChange={e => updateService('pastServices', idx, 'note', e.target.value)}
                        placeholder="기타사항"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400"
                      />
                      <button type="button" onClick={() => removeService('pastServices', idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(formData.pastServices || []).length === 0 && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                    등록된 과거 이용 서비스가 없습니다. 추가 버튼을 누르세요.
                  </p>
                )}
              </div>
            </div>

            {/* Employment History (5 columns with top labels) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-extrabold text-slate-700">취업 경력</label>
                <button
                  type="button"
                  onClick={addWork}
                  className="py-1 px-3 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1 border border-indigo-100"
                >
                  <Plus className="h-3.5 w-3.5" /> 경력 추가
                </button>
              </div>

              {(formData.workHistory || []).length > 0 && (
                <div className="hidden md:grid grid-cols-5 gap-2 px-3 py-1 text-[11px] font-extrabold text-slate-600 border-b border-slate-200">
                  <div>업체명</div>
                  <div>직무</div>
                  <div>근무기간</div>
                  <div>퇴직사유</div>
                  <div>기타</div>
                </div>
              )}

              {(formData.workHistory || []).map((work, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-start">
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">업체명</label>
                    <input
                      type="text"
                      value={work.company}
                      onChange={e => updateWork(idx, 'company', e.target.value)}
                      placeholder="업체명"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">직무</label>
                    <input
                      type="text"
                      value={work.jobTitle}
                      onChange={e => updateWork(idx, 'jobTitle', e.target.value)}
                      placeholder="직무"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">근무기간</label>
                    <input
                      type="text"
                      value={work.period}
                      onChange={e => updateWork(idx, 'period', e.target.value)}
                      placeholder="근무기간"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">퇴직사유</label>
                    <input
                      type="text"
                      value={work.reasonForLeaving}
                      onChange={e => updateWork(idx, 'reasonForLeaving', e.target.value)}
                      placeholder="퇴직사유"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="flex-1">
                      <label className="block md:hidden text-[10px] font-bold text-slate-500 mb-0.5">기타</label>
                      <input
                        type="text"
                        value={work.note}
                        onChange={e => updateWork(idx, 'note', e.target.value)}
                        placeholder="기타"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWork(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(formData.workHistory || []).length === 0 && (
                <p className="text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center">
                  등록된 취업 경력이 없습니다. 추가 버튼을 누르세요.
                </p>
              )}
            </div>

            {/* Counseling Notes with AI Generator */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-extrabold text-slate-800">
                  상세 상담 내용
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const notes = generateAiCounselingNotes(formData, client);
                    updateField('counselingNotes', notes);
                  }}
                  className="py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 상담내용 자동 작성
                </button>
              </div>
              <textarea
                rows={8}
                value={formData.counselingNotes}
                onChange={e => updateField('counselingNotes', e.target.value)}
                placeholder="상담 과정에서 관찰된 종합적 소견, 욕구, 재활 목표 및 상담 내용을 입력하세요. 상단의 'AI 상담내용 자동 작성' 버튼을 클릭하면 1~5단계에서 작성한 모든 전반적 체크내용을 종합하여 소견서 형태의 상담내용이 자동으로 생성됩니다."
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>
          </div>
        )}

        {/* Form Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={(e) => {
              e.preventDefault();
              setCurrentStep(prev => Math.max(1, prev - 1));
            }}
            className={`py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            이전 단계
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentStep(prev => Math.min(6, prev + 1));
                }}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-150"
              >
                다음 단계
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="py-2.5 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                <CheckCircle2 className="h-4 w-4" />
                입력 완료 및 양식 보기
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
