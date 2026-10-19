/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client, PurdueTest, ERSTest, BasicAcademicTest, ClientIntakeRecord, TrainingClassType, PictureInterestPDF, IndividualizedServicePlan } from '../types';
import { ERS_QUESTIONS, analyzeErsTest } from '../data/assessmentData';
import {
  CLASS_MAJOR_SUBJECTS,
  ALL_TRAINING_SUBJECTS,
  validateSubjectSelection,
} from '../data/evaluationConstants';
import { Activity, ClipboardCheck, Calendar, FileText, Plus, Trash2, Edit2, User, Eye, ArrowRight, Save, Award, TrendingUp, Sparkles, Printer, FilePlus, CheckSquare, BookOpen, Tablet, UploadCloud, FileSpreadsheet, FolderCheck, Clock, PlusCircle } from 'lucide-react';
import IntakeForm, { getDefaultIntakeRecord } from './IntakeForm';
import IntakeReport from './IntakeReport';
import PictureInterestModal from './PictureInterestModal';
import IWPPlanForm from './IWPPlanForm';
import IWPPlanReport from './IWPPlanReport';
import MidtermEvaluationReport from './MidtermEvaluationReport';
import SituationEvaluationManager from './SituationEvaluationManager';
import SemesterEvaluationPage from './SemesterEvaluationPage';
import { generateDefaultIWP } from '../utils/iwpGenerator';
import {
  getAvailableYears,
  parseYearFromDate,
  findYearAssessments,
  calculateServiceEndDate,
  calculate4YearEndDate,
  formatServicePeriod,
  getEffectiveExtensionCount,
  getServicePeriodLabel,
  EXTENSION_OPTIONS,
} from '../utils/yearHelper';

interface ClientWorkspaceProps {
  client: Client;
  onUpdateClient: (updated: Client) => void;
  onDeleteClient: (id: string) => void;
  purdueTests: PurdueTest[];
  ersTests: ERSTest[];
  basicAcademicTests?: BasicAcademicTest[];
  pictureInterestPdfs?: PictureInterestPDF[];
  iwpPlans?: IndividualizedServicePlan[];
  onStartPurdueTest: () => void;
  onStartErsTest: () => void;
  onStartBasicAcademicTest?: () => void;
  onOpenSituationEval: () => void;
  onSaveIWPPlan?: (plan: IndividualizedServicePlan) => void;
  onDeleteIWPPlan?: (id: string) => void;
  onViewPurdueResult: (test: PurdueTest) => void;
  onViewErsResult: (test: ERSTest) => void;
  onViewBasicAcademicResult?: (test: BasicAcademicTest) => void;
  onDeletePurdueTest: (id: string) => void;
  onDeleteErsTest: (id: string) => void;
  onDeleteBasicAcademicTest?: (id: string) => void;
  onSavePictureInterestPdf?: (pdf: PictureInterestPDF) => void;
  onDeletePictureInterestPdf?: (id: string) => void;
}

export default function ClientWorkspace({
  client,
  onUpdateClient,
  onDeleteClient,
  purdueTests,
  ersTests,
  basicAcademicTests = [],
  iwpPlans = [],
  onStartPurdueTest,
  onStartErsTest,
  onStartBasicAcademicTest,
  onOpenSituationEval,
  onSaveIWPPlan,
  onDeleteIWPPlan,
  onViewPurdueResult,
  onViewErsResult,
  onViewBasicAcademicResult,
  onDeletePurdueTest,
  onDeleteErsTest,
  onDeleteBasicAcademicTest,
  pictureInterestPdfs = [],
  onSavePictureInterestPdf,
  onDeletePictureInterestPdf,
}: ClientWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    | 'situation_eval'
    | 'intake'
    | 'intake_edit'
    | 'purdue'
    | 'ers'
    | 'picture_interest'
    | 'academic'
    | 'iwp_1st'
    | 'midterm_eval'
    | 'iwp_2nd'
    | 'iwp_edit'
    | 'iwp_view'
    | 'semester_eval'
  >('situation_eval');
  const [isPictureInterestModalOpen, setIsPictureInterestModalOpen] = useState(false);
  const [selectedPdfIdForModal, setSelectedPdfIdForModal] = useState<string | null>(null);
  const [modalInitialShowUpload, setModalInitialShowUpload] = useState<boolean>(false);
  const [selectedIwpPlan, setSelectedIwpPlan] = useState<IndividualizedServicePlan | null>(null);

  // Year-based Data Separation State
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(currentYear);

  // Available Years Calculation
  const availableYears = React.useMemo(() => {
    return getAvailableYears({
      purdueTests,
      ersTests,
      basicAcademicTests,
      picturePdfs: pictureInterestPdfs,
      iwpPlans
    });
  }, [purdueTests, ersTests, basicAcademicTests, pictureInterestPdfs, iwpPlans]);

  // Year Filtered Data Collections
  const filteredPurdueTests = React.useMemo(() => {
    if (selectedYear === 'ALL') return purdueTests;
    return purdueTests.filter(t => (t.year || parseYearFromDate(t.testDate)) === selectedYear);
  }, [purdueTests, selectedYear]);

  const filteredErsTests = React.useMemo(() => {
    if (selectedYear === 'ALL') return ersTests;
    return ersTests.filter(t => (t.year || parseYearFromDate(t.testDate)) === selectedYear);
  }, [ersTests, selectedYear]);

  const filteredPicturePdfs = React.useMemo(() => {
    if (selectedYear === 'ALL') return pictureInterestPdfs;
    return pictureInterestPdfs.filter(p => (p.year || parseYearFromDate(p.testDate)) === selectedYear);
  }, [pictureInterestPdfs, selectedYear]);

  const filteredAcademicTests = React.useMemo(() => {
    if (!basicAcademicTests) return [];
    if (selectedYear === 'ALL') return basicAcademicTests;
    return basicAcademicTests.filter(t => (t.year || parseYearFromDate(t.testDate)) === selectedYear);
  }, [basicAcademicTests, selectedYear]);

  const filteredIwpPlans = React.useMemo(() => {
    if (!iwpPlans) return [];
    if (selectedYear === 'ALL') return iwpPlans;
    return iwpPlans.filter(p => (p.year || parseYearFromDate(p.planDate)) === selectedYear);
  }, [iwpPlans, selectedYear]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit fields profile
  const [editName, setEditName] = useState(client.name);
  const [editBirth, setEditBirth] = useState(client.birthDate);
  const [editGender, setEditGender] = useState<'M' | 'F'>(client.gender);
  const [editDiagnosis, setEditDiagnosis] = useState(client.diagnosis);
  const [editDominance, setEditDominance] = useState<'R' | 'L' | 'Ambi'>(client.handDominance);
  const [editUserType, setEditUserType] = useState<'신규' | '기존'>(client.userType || '기존');
  const [editTrainingClass, setEditTrainingClass] = useState<TrainingClassType>(client.trainingClass || '문화예술반');
  const [editSelectedSubjects, setEditSelectedSubjects] = useState<string[]>(
    client.selectedSubjects && client.selectedSubjects.length === 3
      ? client.selectedSubjects
      : (client.trainingClass === '스마트산업반' ? ['AI전자작가', '스마트팜', '사무보조'] : ['AI샌드아트', '미술', '공예'])
  );
  const [editServiceStartDate, setEditServiceStartDate] = useState(client.serviceStartDate || '');
  const [editServiceExtensionCount, setEditServiceExtensionCount] = useState(
    getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount)
  );
  const [editServiceEndDate, setEditServiceEndDate] = useState(
    client.serviceEndDate || (client.serviceStartDate ? calculateServiceEndDate(client.serviceStartDate, client.serviceExtensionCount || 0) : '')
  );
  const [editMemo, setEditMemo] = useState(client.memos);

  // When client changes, synch local states
  React.useEffect(() => {
    setEditName(client.name);
    setEditBirth(client.birthDate);
    setEditGender(client.gender);
    setEditDiagnosis(client.diagnosis);
    setEditDominance(client.handDominance);
    setEditUserType(client.userType || '기존');
    setEditTrainingClass(client.trainingClass || '문화예술반');
    setEditSelectedSubjects(
      client.selectedSubjects && client.selectedSubjects.length === 3
        ? client.selectedSubjects
        : (client.trainingClass === '스마트산업반' ? ['AI전자작가', '스마트팜', '사무보조'] : ['AI샌드아트', '미술', '공예'])
    );
    setEditServiceStartDate(client.serviceStartDate || '');
    const currentExt = getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount);
    setEditServiceExtensionCount(currentExt);
    setEditServiceEndDate(
      client.serviceEndDate || (client.serviceStartDate ? calculateServiceEndDate(client.serviceStartDate, currentExt) : '')
    );
    setEditMemo(client.memos);
  }, [client]);

  const handleSaveProfile = () => {
    const val = validateSubjectSelection(editTrainingClass, editSelectedSubjects);
    if (!val.valid) {
      alert(val.message || '과목 선택 조건을 확인해 주세요.');
      return;
    }

    onUpdateClient({
      ...client,
      name: editName,
      birthDate: editBirth,
      gender: editGender,
      diagnosis: editDiagnosis,
      handDominance: editDominance,
      userType: editUserType,
      trainingClass: editTrainingClass,
      selectedSubjects: editSelectedSubjects,
      serviceStartDate: editServiceStartDate || undefined,
      serviceEndDate: editServiceStartDate ? (editServiceEndDate || calculateServiceEndDate(editServiceStartDate, editServiceExtensionCount)) : undefined,
      serviceExtensionCount: editServiceStartDate ? editServiceExtensionCount : undefined,
      memos: editMemo,
    });
    setIsEditingProfile(false);
  };

  // Get most recent test values for Bento Grid visualization meters
  const latestPurdue = purdueTests.length > 0 ? purdueTests[0] : null;
  const latestErs = ersTests.length > 0 ? ersTests[0] : null;

  // Compute pegboard graph heights and comparison dataset
  const rightMean = client.handDominance === 'L' ? 11.94 : 12.61;
  const leftMean = client.handDominance === 'L' ? 12.61 : 11.94;
  const bothMean = 9.35;
  const sumMean = Number((rightMean + leftMean + bothMean).toFixed(2));
  const assemblyMean = 24.54;

  const dataset = [
    {
      label: "우세손 (RH)",
      userVal: latestPurdue ? latestPurdue.rightHand : 15,
      meanVal: rightMean,
      max: 20,
      color: "from-indigo-600 to-indigo-400",
    },
    {
      label: "비우세손 (LH)",
      userVal: latestPurdue ? latestPurdue.leftHand : 14,
      meanVal: leftMean,
      max: 20,
      color: "from-sky-500 to-cyan-300",
    },
    {
      label: "양손 (BH)",
      userVal: latestPurdue ? latestPurdue.bothHands : 12,
      meanVal: bothMean,
      max: 18,
      color: "from-emerald-500 to-teal-300",
    },
    {
      label: "합산 (RLB)",
      userVal: latestPurdue ? Number((latestPurdue.rightHand + latestPurdue.leftHand + latestPurdue.bothHands).toFixed(2)) : 41,
      meanVal: sumMean,
      max: 50,
      color: "from-violet-650 from-violet-600 to-fuchsia-400",
    },
    {
      label: "조립 (ASSY)",
      userVal: latestPurdue ? latestPurdue.assembly : 35,
      meanVal: assemblyMean,
      max: 45,
      color: "from-amber-500 to-yellow-300",
    },
  ];

  // Compute ERS computed factors
  let ersFactors: { name: string; score: number; max: number; level: string }[] = [];
  if (latestErs) {
    const analysis = analyzeErsTest(latestErs.answers);
    ersFactors = analysis.domainResults.map(dom => {
      let level = '보통';
      if (dom.average >= 3.4) level = '최우수';
      else if (dom.average >= 2.7) level = '우수';
      else if (dom.average >= 2.0) level = '보통';
      else level = '지원보완 필요';
      
      return {
        name: dom.name,
        score: dom.average,
        max: 4,
        level: level
      };
    });
  } else {
    // Reference standards placeholder
    ersFactors = [
      { name: '일상생활', score: 3.2, max: 4, level: '우수' },
      { name: '인지기술', score: 2.3, max: 4, level: '보통' },
      { name: '자존감', score: 3.4, max: 4, level: '최우수' },
      { name: '직업의식', score: 2.6, max: 4, level: '보통' },
      { name: '사회기술', score: 2.4, max: 4, level: '보통' },
      { name: '직업관련기술', score: 2.8, max: 4, level: '우수' },
      { name: '작업기술', score: 1.8, max: 4, level: '지원보완 필요' }
    ];
  }

  // Calculate ERS rating indicators 
  const isHighErsRisk = latestErs 
    ? (latestErs.totalScore / 252 < 0.55)
    : false;

  return (
    <div id="client-workspace" className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
      
      {/* Year-Based Data Filter & Status Bar */}
      <div id="workspace-year-filter-bar" className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-extrabold text-slate-800">
                평가 및 재활계획 연도 선택
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                연도별 이력 분리
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              선택한 연도의 1차(연초) 및 2차(6~8월) 검사 결과와 개별화재활계획서가 작업공간에 반영됩니다.
            </p>
          </div>
        </div>

        {/* Year Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {availableYears.map((yr) => {
            const isSelected = selectedYear === yr;

            return (
              <button
                key={yr}
                id={`btn-select-year-${yr}`}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-indigo-150'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{yr}년도</span>
              </button>
            );
          })}

          <button
            id="btn-select-year-all"
            onClick={() => setSelectedYear('ALL')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shadow-xs ${
              selectedYear === 'ALL'
                ? 'bg-slate-900 text-white ring-2 ring-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
          >
            전체 연도 통합보기
          </button>
        </div>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* BENTO CELL 1: Patient Core Demographics Profile */}
        <section 
          id="profile-detailed-card" 
          className="lg:col-span-7 xl:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          {!isEditingProfile ? (
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-start">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-700 shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-2.5 h-6 bg-indigo-500 rounded-full"></span>
                      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{client.name}</h3>

                      {/* User Type Badge: 신규 vs 기존 */}
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          client.userType === '신규'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {client.userType === '신규' ? '✨ 신규 입소' : '기존 계속'}
                      </span>

                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-semibold text-slate-600">
                        {client.gender === 'M' ? '남성' : '여성'}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 font-semibold text-indigo-700">
                        우세손: {client.handDominance === 'R' ? '오른손' : client.handDominance === 'L' ? '왼손' : '양손잡이'}
                      </span>

                      {/* Training Class Badge */}
                      {client.trainingClass && (
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            client.trainingClass === '문화예술반'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}
                        >
                          {client.trainingClass === '문화예술반' ? '🎨 문화예술반' : '🤖 스마트산업반'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium items-center">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        생년월일: {client.birthDate}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-emerald-800 bg-emerald-50/90 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-bold">
                        <Clock className="h-3.5 w-3.5 text-emerald-600" />
                        이용기간: {formatServicePeriod(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount)}
                      </span>
                      {getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount) > 0 && (
                        <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50/90 px-2 py-0.5 rounded-lg border border-amber-200/80 flex items-center gap-1">
                          ⚡ {getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount)}차 연장 (+4년 추가)
                        </span>
                      )}
                      {client.diagnosis && (
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100/60 px-2.5 py-0.5 rounded-lg border border-slate-200/50">
                          <span className="h-2 w-2 rounded-full bg-teal-500" />
                          장애유형: {client.diagnosis}
                        </span>
                      )}
                    </div>

                    {/* Selected 3 Course Subjects */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-600 mr-1">수강 과목:</span>
                      {client.selectedSubjects && client.selectedSubjects.length > 0 ? (
                        client.selectedSubjects.map((subj, idx) => {
                          const isMajor = client.trainingClass
                            ? CLASS_MAJOR_SUBJECTS[client.trainingClass]?.includes(subj)
                            : false;
                          return (
                            <span
                              key={idx}
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                                isMajor
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {subj}
                              <span className="ml-1 text-[9px] opacity-75 font-semibold">
                                ({isMajor ? '전공' : '비전공'})
                              </span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-400 text-xs">과목 미선택</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id="edit-profile-btn"
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 shadow-sm transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    수정
                  </button>
                  <button
                    id="delete-client-btn"
                    onClick={() => {
                      if (confirm(`${client.name} 대상자 데이터를 명단에서 삭제하시겠습니까? 관련 평가/기록 이력도 모두 영구 삭제됩니다.`)) {
                        onDeleteClient(client.id);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold px-3.5 py-2 rounded-xl border border-rose-100 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              </div>

              {client.memos && (
                <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl italic leading-relaxed">
                  " {client.memos} "
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-2 h-4 bg-indigo-600 rounded-full"></span>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">인적 정보 수정</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="edit-name" className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">이름</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-birth" className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">생년월일</label>
                  <input
                    id="edit-birth"
                    type="date"
                    value={editBirth}
                    onChange={(e) => setEditBirth(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-gender-select" className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">성별</label>
                  <select
                    id="edit-gender-select"
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-dominance-select" className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">우세손 (Dominant Hand)</label>
                  <select
                    id="edit-dominance-select"
                    value={editDominance}
                    onChange={(e) => setEditDominance(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="R">오른손 (Dominant Right)</option>
                    <option value="L">왼손 (Dominant Left)</option>
                    <option value="Ambi">양손잡이 (Ambidextrous)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-diag" className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">장애유형</label>
                  <input
                    id="edit-diag"
                    type="text"
                    value={editDiagnosis}
                    onChange={(e) => setEditDiagnosis(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 훈련반 이용기간 (4년 기본 + 연장 관리) */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>훈련반 이용기간 <span className="text-emerald-700 font-bold">(4년 기본 + 연장 시 4년씩 추가)</span></span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = editServiceExtensionCount + 1;
                        setEditServiceExtensionCount(newCount);
                        if (editServiceStartDate) {
                          setEditServiceEndDate(calculateServiceEndDate(editServiceStartDate, newCount));
                        }
                      }}
                      className="text-[10px] font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md transition-all flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="h-2.5 w-2.5 text-emerald-600" />
                      +4년 연장
                    </button>
                    {editServiceExtensionCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.max(0, editServiceExtensionCount - 1);
                          setEditServiceExtensionCount(newCount);
                          if (editServiceStartDate) {
                            setEditServiceEndDate(calculateServiceEndDate(editServiceStartDate, newCount));
                          }
                        }}
                        className="text-[10px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                      >
                        -4년 취소
                      </button>
                    )}
                  </div>
                </div>

                {/* 연장 차수 선택 탭 */}
                <div>
                  <div className="text-[10px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                    <span>이용 연장 차수:</span>
                    <span className="text-[9px] text-emerald-700 font-semibold">
                      {editServiceExtensionCount === 0 ? '기본 4년' : `${editServiceExtensionCount}차 연장 (+${editServiceExtensionCount * 4}년 추가, 총 ${4 * (1 + editServiceExtensionCount)}년)`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {EXTENSION_OPTIONS.map((opt) => {
                      const isSelected = editServiceExtensionCount === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => {
                            setEditServiceExtensionCount(opt.count);
                            if (editServiceStartDate) {
                              setEditServiceEndDate(calculateServiceEndDate(editServiceStartDate, opt.count));
                            }
                          }}
                          className={`py-1 px-1 rounded-lg text-[10px] font-bold transition-all border text-center ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                          }`}
                        >
                          {opt.badge}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-0.5">
                  <div>
                    <label htmlFor="edit-service-start" className="block text-[10px] font-bold text-slate-600 mb-1">
                      이용 시작일
                    </label>
                    <input
                      id="edit-service-start"
                      type="date"
                      value={editServiceStartDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditServiceStartDate(val);
                        if (val) {
                          setEditServiceEndDate(calculateServiceEndDate(val, editServiceExtensionCount));
                        } else {
                          setEditServiceEndDate('');
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-service-end" className="block text-[10px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                      <span>이용 종료일</span>
                      <span className="text-[9px] text-emerald-600 font-medium">
                        ({editServiceExtensionCount === 0 ? '4년 후 자동' : `총 ${4 * (1 + editServiceExtensionCount)}년 후 자동`})
                      </span>
                    </label>
                    <input
                      id="edit-service-end"
                      type="date"
                      value={editServiceEndDate}
                      onChange={(e) => setEditServiceEndDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {editServiceStartDate && (
                  <div className="text-[11px] font-bold text-emerald-900 bg-white/90 p-2 rounded-lg border border-emerald-200 flex flex-wrap items-center justify-between gap-1 shadow-xs">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Calendar className="h-3 w-3 text-emerald-600" />
                      설정된 총 이용기간:
                    </span>
                    <span className="font-mono text-emerald-950 font-extrabold">
                      {formatServicePeriod(editServiceStartDate, editServiceEndDate, editServiceExtensionCount)}
                    </span>
                  </div>
                )}
              </div>

              {/* 훈련생 구분 (신규 vs 기존) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">
                  훈련생 이용 구분 (신규 입소 vs 기존 계속)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUserType('기존')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      editUserType === '기존'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>기존 계속 이용자</span>
                    <span className="text-[10px] font-normal opacity-90">(상황평가 생략가능)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserType('신규')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      editUserType === '신규'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>✨ 신규 입소자</span>
                    <span className="text-[10px] font-normal opacity-90">(초기 상황평가 필수)</span>
                  </button>
                </div>
              </div>

              {/* 훈련반 구분 & 수강과목 3가지 수정 */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    소속 훈련반 변경
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditTrainingClass('문화예술반');
                        const currentMajors = editSelectedSubjects.filter(s => CLASS_MAJOR_SUBJECTS['문화예술반'].includes(s));
                        if (currentMajors.length < 2) {
                          setEditSelectedSubjects(['AI샌드아트', '미술', '공예']);
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        editTrainingClass === '문화예술반'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      🎨 문화예술반
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditTrainingClass('스마트산업반');
                        const currentMajors = editSelectedSubjects.filter(s => CLASS_MAJOR_SUBJECTS['스마트산업반'].includes(s));
                        if (currentMajors.length < 2) {
                          setEditSelectedSubjects(['AI전자작가', '스마트팜', '사무보조']);
                        }
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        editTrainingClass === '스마트산업반'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      🤖 스마트산업반
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    수강 과목 선택 (총 3개 필수 - [{editTrainingClass}] 전공 2개 + 추가 1개)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ALL_TRAINING_SUBJECTS.map((subj) => {
                      const isMajor = CLASS_MAJOR_SUBJECTS[editTrainingClass].includes(subj);
                      const isSelected = editSelectedSubjects.includes(subj);

                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setEditSelectedSubjects(prev => prev.filter(s => s !== subj));
                            } else {
                              if (editSelectedSubjects.length >= 3) {
                                alert('과목은 3개만 선택할 수 있습니다.');
                                return;
                              }
                              setEditSelectedSubjects(prev => [...prev, subj]);
                            }
                          }}
                          className={`p-2 rounded-lg border text-[11px] font-bold text-left flex justify-between items-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <span>{subj}</span>
                          <span
                            className={`text-[9px] px-1 py-0.5 rounded font-black ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : isMajor
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isMajor ? '전공' : '비전공'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="edit-memo-text" className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">욕구사항</label>
                <textarea
                  id="edit-memo-text"
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  rows={2}
                  className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg resize-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  id="cancel-edit-profile"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-650 hover:text-slate-800 font-semibold border border-slate-250 bg-white rounded-xl"
                >
                  취소
                </button>
                <button
                  id="save-edit-profile"
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-150"
                >
                  <Save className="h-3.5 w-3.5" />
                  변경 완료 저장
                </button>
              </div>
            </div>
          )}
        </section>

        {/* BENTO CELL 2: Quick Action Center (Ordered by workflow steps) */}
        <section 
          id="rehab-stats-launcher" 
          className="lg:col-span-5 xl:col-span-5 bg-indigo-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-indigo-150 relative overflow-hidden"
        >
          {/* Subtle design gradient accent */}
          <div className="absolute right-0 top-0 w-28 h-28 bg-indigo-500/30 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Rehab Workflow Center</p>
                <p className="text-xl font-extrabold mt-1">{client.name} 훈련생</p>
              </div>
              <Sparkles className="h-5 w-5 text-indigo-300" />
            </div>
          </div>

          {/* Quick Launcher Buttons in requested order */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {/* 상황/종합평가 */}
            <button
              id="launcher-situation-eval-btn"
              onClick={() => setActiveTab('situation_eval')}
              className={`py-2 px-1.5 rounded-xl font-extrabold text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'situation_eval'
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-white'
                  : client.userType === '신규'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 ring-1 ring-amber-200'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/60'
              }`}
            >
              <div className="flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                {client.userType === '신규' ? (
                  <span className="text-[9px] px-1 py-0.2 bg-amber-600 text-white rounded font-black">필수</span>
                ) : (
                  <span className="text-[9px] px-1 py-0.2 bg-amber-200/80 text-amber-800 rounded font-bold">선택</span>
                )}
              </div>
              <span>상황/종합평가</span>
            </button>

            {/* 개별파일 */}
            <button
              id="launcher-intake-file-btn"
              onClick={() => setActiveTab('intake')}
              className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'intake' || activeTab === 'intake_edit' ? 'bg-white text-indigo-900 ring-2 ring-indigo-300' : 'bg-white/90 hover:bg-white text-indigo-900'
              }`}
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>개별파일</span>
            </button>

            {/* 퍼듀펙검사 */}
            <button
              id="launcher-purdue-btn"
              onClick={() => {
                setActiveTab('purdue');
                onStartPurdueTest();
              }}
              className="py-2 px-1.5 bg-indigo-850 hover:bg-slate-900 text-white rounded-xl font-bold text-[11px] border border-indigo-400/30 transition-all shadow-sm flex flex-col items-center justify-center gap-1"
            >
              <Activity className="h-4 w-4 text-indigo-300" />
              <span>퍼듀펙검사</span>
            </button>

            {/* ERS검사 */}
            <button
              id="launcher-ers-btn"
              onClick={() => {
                setActiveTab('ers');
                onStartErsTest();
              }}
              className="py-2 px-1.5 bg-indigo-850 hover:bg-slate-900 text-white rounded-xl font-bold text-[11px] border border-indigo-400/30 transition-all shadow-sm flex flex-col items-center justify-center gap-1"
            >
              <ClipboardCheck className="h-4 w-4 text-indigo-300" />
              <span>ERS검사</span>
            </button>

            {/* 그림흥미검사 */}
            <button
              id="launcher-picture-interest-btn"
              onClick={() => setActiveTab('picture_interest')}
              className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'picture_interest' ? 'bg-teal-400 text-slate-950 ring-2 ring-white' : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>그림흥미검사</span>
            </button>

            {/* 기초학력검사 */}
            <button
              id="launcher-academic-btn"
              onClick={() => {
                setActiveTab('academic');
                if (onStartBasicAcademicTest) onStartBasicAcademicTest();
              }}
              className={`py-2 px-1.5 rounded-xl font-bold text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'academic' ? 'bg-emerald-400 text-slate-950 ring-2 ring-white' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Tablet className="h-4 w-4" />
              <span>기초학력검사</span>
            </button>

            {/* 1차 개별화재활계획서 */}
            <button
              id="launcher-iwp1-btn"
              onClick={() => setActiveTab('iwp_1st')}
              className={`py-2 px-1.5 rounded-xl font-black text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'iwp_1st' ? 'bg-indigo-400 text-white ring-2 ring-white' : 'bg-indigo-500 hover:bg-indigo-400 text-white'
              }`}
            >
              <FolderCheck className="h-4 w-4 text-white" />
              <span>1차 IWP계획서</span>
            </button>

            {/* 중간평가서 */}
            <button
              id="launcher-midterm-btn"
              onClick={() => setActiveTab('midterm_eval')}
              className={`py-2 px-1.5 rounded-xl font-black text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'midterm_eval' ? 'bg-rose-400 text-slate-950 ring-2 ring-white' : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 text-white" />
              <span>중간평가서</span>
            </button>

            {/* 2차 개별화재활계획서 */}
            <button
              id="launcher-iwp2-btn"
              onClick={() => setActiveTab('iwp_2nd')}
              className={`py-2 px-1.5 rounded-xl font-black text-[11px] transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                activeTab === 'iwp_2nd' ? 'bg-purple-400 text-white ring-2 ring-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-white" />
              <span>2차 IWP계획서</span>
            </button>
          </div>
        </section>

        {/* BENTO CELL 3: Main Workflow & Assessment Workspace */}
        <section 
          id="detailed-assessment-grid" 
          className="lg:col-span-7 xl:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-5"
        >
          {/* Main Tab Switcher inside workspace without numeric prefix */}
          <div id="test-category-tabs" className="border-b border-slate-200 flex flex-wrap gap-1.5 md:gap-2 pb-1.5 overflow-x-auto">
            {/* 상황/종합평가 */}
            <button
              id="tab-switcher-situation-eval"
              onClick={() => setActiveTab('situation_eval')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1.5 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'situation_eval'
                  ? 'border-amber-500 text-amber-800 bg-amber-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5 text-amber-600" />
              <span>상황/종합평가</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                client.userType === '신규'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {client.userType === '신규' ? '신규필수' : '기존선택'}
              </span>
            </button>

            {/* 개별파일 */}
            <button
              id="tab-switcher-intake"
              onClick={() => setActiveTab('intake')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'intake' || activeTab === 'intake_edit'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
              개별파일
            </button>

            {/* 퍼듀펙검사 */}
            <button
              id="tab-switcher-purdue"
              onClick={() => setActiveTab('purdue')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'purdue'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-indigo-600" />
              퍼듀펙검사
            </button>

            {/* ERS검사 */}
            <button
              id="tab-switcher-ers"
              onClick={() => setActiveTab('ers')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'ers'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600" />
              ERS검사
            </button>

            {/* 그림흥미검사 */}
            <button
              id="tab-switcher-picture-interest"
              onClick={() => setActiveTab('picture_interest')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'picture_interest'
                  ? 'border-teal-600 text-teal-800 bg-teal-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5 text-teal-600" />
              그림흥미검사
            </button>

            {/* 기초학력검사 */}
            <button
              id="tab-switcher-academic"
              onClick={() => setActiveTab('academic')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'academic'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Tablet className="h-3.5 w-3.5 text-emerald-600" />
              기초학력검사
            </button>

            {/* 1차 개별화재활계획서 */}
            <button
              id="tab-switcher-iwp1"
              onClick={() => setActiveTab('iwp_1st')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'iwp_1st' || (activeTab === 'iwp_view' && selectedIwpPlan?.termType !== '2차') || (activeTab === 'iwp_edit' && selectedIwpPlan?.termType !== '2차')
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FolderCheck className="h-3.5 w-3.5 text-indigo-600" />
              1차 개별화재활계획서
            </button>

            {/* 중간평가서 */}
            <button
              id="tab-switcher-midterm"
              onClick={() => setActiveTab('midterm_eval')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'midterm_eval'
                  ? 'border-rose-600 text-rose-800 bg-rose-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-rose-600" />
              중간평가서
            </button>

            {/* 2차 개별화재활계획서 */}
            <button
              id="tab-switcher-iwp2"
              onClick={() => setActiveTab('iwp_2nd')}
              className={`pb-2 font-bold text-xs tracking-tight border-b-2 transition-all flex items-center gap-1 px-2.5 py-1 rounded-t-lg ${
                activeTab === 'iwp_2nd' || (activeTab === 'iwp_view' && selectedIwpPlan?.termType === '2차') || (activeTab === 'iwp_edit' && selectedIwpPlan?.termType === '2차')
                  ? 'border-purple-600 text-purple-800 bg-purple-50 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
              2차 개별화재활계획서
            </button>
          </div>

          {/* TAB 1: Situation Evaluation Manager */}
          {activeTab === 'situation_eval' && (
            <div id="situation-eval-workspace-pane" className="space-y-4">
              {client.userType !== '신규' ? (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-[10px]">
                        기존 이용 훈련생
                      </span>
                      <h4 className="text-xs font-black text-blue-950">
                        초기 2주 상황/종합평가 생략 가능 안내
                      </h4>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {client.name} 훈련생은 <strong>기존 계속 이용 대상자</strong>입니다. 신규 입소 절차인 2주 상황평가일지 및 직업평가종합평가서 작성은 생략하시고 바로 <strong>[개별파일]</strong>, <strong>[3대 기초검사]</strong>, <strong>[1차 개별화재활계획서]</strong>를 진행하셔도 무방합니다. (필요 시 아래에서 자유롭게 작성도 가능합니다.)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('intake')}
                      className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      개별파일 바로가기 →
                    </button>
                    <button
                      onClick={() => setActiveTab('iwp_1st')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      1차 계획서 바로가기 →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center gap-3 shadow-xs">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-black text-[10px]">
                        신규 입소 훈련생 필수 절차
                      </span>
                      <h4 className="text-xs font-black text-amber-950">
                        초기 2주 상황평가일지 및 직업평가 종합평가기록부 작성
                      </h4>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {client.name} 훈련생의 입소 초기 2주간 직무/태도 상황평가(10일분) 및 직업평가 종합평가서를 기록하여 개별화재활계획서(IWP) 수립의 기초 자료로 활용합니다.
                    </p>
                  </div>
                </div>
              )}

              <SituationEvaluationManager
                clients={[client]}
                selectedClient={client}
                onSelectClient={() => {}}
                onBack={() => setActiveTab('intake')}
              />
            </div>
          )}

          {/* TAB CONTENT: Semester Evaluation Page */}
          {activeTab === 'semester_eval' && (
            <SemesterEvaluationPage
              clients={[client]}
              selectedClient={client}
              onSelectClient={() => {}}
              iwpPlans={iwpPlans}
              onSaveIWPPlan={onSaveIWPPlan}
              onBack={() => setActiveTab('iwp_1st')}
            />
          )}

          {/* TAB CONTENT -1: IWP Edit Form */}
          {activeTab === 'iwp_edit' && (
            <IWPPlanForm
              client={client}
              purdueTests={purdueTests}
              ersTests={ersTests}
              picturePdfs={pictureInterestPdfs}
              initialPlan={selectedIwpPlan || undefined}
              onSave={(savedPlan) => {
                if (onSaveIWPPlan) onSaveIWPPlan(savedPlan);
                setSelectedIwpPlan(savedPlan);
                setActiveTab('iwp_view');
              }}
              onCancel={() => {
                if (selectedIwpPlan?.termType === '2차') {
                  setActiveTab('iwp_2nd');
                } else {
                  setActiveTab('iwp_1st');
                }
              }}
              onPreview={(previewPlan) => {
                setSelectedIwpPlan(previewPlan);
                setActiveTab('iwp_view');
              }}
            />
          )}

          {/* TAB CONTENT -1: IWP Print / Full Document View */}
          {activeTab === 'iwp_view' && selectedIwpPlan && (
            <IWPPlanReport
              plan={selectedIwpPlan}
              onBack={() => {
                if (selectedIwpPlan.termType === '2차') {
                  setActiveTab('iwp_2nd');
                } else {
                  setActiveTab('iwp_1st');
                }
              }}
              onEdit={() => setActiveTab('iwp_edit')}
            />
          )}

          {/* TAB 7: 1차 개별화재활계획서 (연초 수립) */}
          {activeTab === 'iwp_1st' && (
            <div id="iwp-1st-workspace-pane" className="space-y-6">
              {(() => {
                const targetYearNum = selectedYear !== 'ALL' ? selectedYear : new Date().getFullYear();
                const clientPlans1st = filteredIwpPlans.filter(p => p.clientId === client.id && (p.termType === '1차' || (!p.termType && p.planType === '수립')));
                const hasPurdue = filteredPurdueTests.length > 0;
                const hasErs = filteredErsTests.length > 0;
                const clientPdfs = filteredPicturePdfs.filter(p => p.clientId === client.id);
                const hasPicturePdf = clientPdfs.length > 0;
                const completedCount = (hasErs ? 1 : 0) + (hasPurdue ? 1 : 0) + (hasPicturePdf ? 1 : 0);
                const isAllTestsCompleted = completedCount === 3;
                const previewDefault = generateDefaultIWP(client, filteredPurdueTests, filteredErsTests, filteredPicturePdfs, '1차', targetYearNum);

                return (
                  <>
                    {/* Step-by-Step 1st IWP Guide Header */}
                    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-inner">
                              <FolderCheck className="h-6 w-6 text-indigo-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-200 border border-indigo-300/30">
                                  1차 개별화재활계획서 (연초 수립)
                                </span>
                                <span className="text-xs font-bold text-slate-300">
                                  {client.trainingClass || '문화예술반'}
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-white mt-1">
                                {client.name} 훈련생 1차 개별화재활계획(IWP)
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                              isAllTestsCompleted 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${isAllTestsCompleted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                              사전 필수 검사 준비도: {completedCount} / 3 완료
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-indigo-100/90 leading-relaxed max-w-3xl">
                          1차 개별화재활계획은 <strong>연초에 진행</strong>하며, <strong>ERS 직업준비검사, Purdue Pegboard, 그림직업흥미검사</strong> 결과를 종합 분석하여 상반기 교육목표 및 개인목표를 수립합니다.
                        </p>

                        {/* 3 Prerequisite Assessment Step Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                          {/* 1. ERS Test Card */}
                          <div className={`p-3.5 rounded-2xl border transition-all ${
                            hasErs 
                              ? 'bg-white/10 border-white/20 text-white' 
                              : 'bg-black/20 border-white/10 text-slate-300'
                          }`}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-bold text-indigo-200">1. ERS 직업준비검사</span>
                              {hasErs ? (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3" /> 완료
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40">
                                  미진행
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white">
                              {hasErs ? (
                                <>
                                  표준점수 <span className="text-amber-300 font-mono font-black">{previewDefault.ersStandardScore}점</span> (최하위: {previewDefault.ersLowestDomain})
                                </>
                              ) : (
                                <span className="text-slate-400 text-[11px]">연초 ERS 검사 기록 필요</span>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                              <button
                                onClick={onStartErsTest}
                                className="text-[11px] font-bold text-indigo-200 hover:text-white flex items-center gap-1 underline underline-offset-2"
                              >
                                {hasErs ? 'ERS 재검사 / 조회' : 'ERS 검사 시작하기'} &rarr;
                              </button>
                            </div>
                          </div>

                          {/* 2. Purdue Pegboard Test Card */}
                          <div className={`p-3.5 rounded-2xl border transition-all ${
                            hasPurdue 
                              ? 'bg-white/10 border-white/20 text-white' 
                              : 'bg-black/20 border-white/10 text-slate-300'
                          }`}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-bold text-indigo-200">2. Purdue Pegboard</span>
                              {hasPurdue ? (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3" /> 완료
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40">
                                  미진행
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white">
                              {hasPurdue ? (
                                <>
                                  조립 <span className="text-amber-300 font-mono font-black">{purdueTests[0]?.assembly}개</span> (오른손: {purdueTests[0]?.rightHand}개, 왼손: {purdueTests[0]?.leftHand}개)
                                </>
                              ) : (
                                <span className="text-slate-400 text-[11px]">퍼듀펙보드 소근육 검사 필요</span>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                              <button
                                onClick={onStartPurdueTest}
                                className="text-[11px] font-bold text-indigo-200 hover:text-white flex items-center gap-1 underline underline-offset-2"
                              >
                                {hasPurdue ? '퍼듀펙보드 재측정' : '퍼듀펙보드 검사 시작'} &rarr;
                              </button>
                            </div>
                          </div>

                          {/* 3. Picture Interest PDF Card */}
                          <div className={`p-3.5 rounded-2xl border transition-all ${
                            hasPicturePdf 
                              ? 'bg-white/10 border-white/20 text-white' 
                              : 'bg-black/20 border-white/10 text-slate-300'
                          }`}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[11px] font-bold text-indigo-200">3. 그림직업흥미검사</span>
                              {hasPicturePdf ? (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3" /> {clientPdfs.length}건 등록
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/40">
                                  미등록
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white line-clamp-1">
                              {hasPicturePdf ? (
                                <>
                                  PDF: <span className="text-amber-300 font-bold">{clientPdfs[0]?.fileName || '검사지 등록완료'}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 text-[11px]">검사지 PDF 업로드 필요</span>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                              <button
                                onClick={() => setActiveTab('picture_interest')}
                                className="text-[11px] font-bold text-indigo-200 hover:text-white flex items-center gap-1 underline underline-offset-2"
                              >
                                {hasPicturePdf ? 'PDF 검사지 관리' : '검사지 PDF 등록하기'} &rarr;
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Toolbar to Generate or Edit 1st IWP */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/15">
                          <div className="text-[11px] text-indigo-200 font-medium flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                            {isAllTestsCompleted 
                              ? '사전 3대 검사가 모두 준비되었습니다. 검사결과를 자동 반영하여 1차 개별화재활계획서를 작성할 수 있습니다.'
                              : '사전 검사가 미완료된 항목이 있더라도 기존 입력 데이터를 기반으로 작성이 가능합니다.'}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedIwpPlan(previewDefault);
                                setActiveTab('iwp_view');
                              }}
                              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                            >
                              <Eye className="h-4 w-4" />
                              1차 공문서 인쇄 미리보기
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIwpPlan(previewDefault);
                                setActiveTab('iwp_edit');
                              }}
                              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 ring-2 ring-indigo-300/40"
                            >
                              <Sparkles className="h-4 w-4 text-amber-300" />
                              1차 개별화재활계획서 작성
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Saved 1st IWP Plans List */}
                    {clientPlans1st.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-2">
                            <FolderCheck className="h-4 w-4 text-indigo-600" />
                            <span className="text-xs font-black text-slate-800">
                              보관된 1차 개별화재활계획서 이력 ({clientPlans1st.length}건)
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newPlan = generateDefaultIWP(client, purdueTests, ersTests, pictureInterestPdfs, '1차');
                              setSelectedIwpPlan(newPlan);
                              setActiveTab('iwp_edit');
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            새 1차 계획서 작성
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {clientPlans1st.map((plan) => (
                            <div
                              key={plan.id}
                              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                            >
                              <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        1차 계획서 (연초 수립)
                                      </span>
                                      <span className="text-xs font-black text-slate-800">{plan.name} 훈련생</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">소속: {plan.trainingClass}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (confirm('이 1차 개별화재활계획서를 삭제하시겠습니까?')) {
                                        if (onDeleteIWPPlan) onDeleteIWPPlan(plan.id);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">계획 수립일자</span>
                                    <span className="font-bold text-slate-800">{plan.planDate}</span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">ERS 표준점수</span>
                                    <span className="font-black text-indigo-600 font-mono">{plan.ersStandardScore}점</span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">Purdue 조립</span>
                                    <span className="font-bold text-slate-800 font-mono">
                                      {plan.purdueScores.find(s => s.item === '조립')?.myScore || 0}개
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">담당 평가사</span>
                                    <span className="font-bold text-slate-800">{plan.evaluatorName || '미지정'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedIwpPlan(plan);
                                    setActiveTab('iwp_view');
                                  }}
                                  className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Eye className="h-3.5 w-3.5 text-indigo-600" />
                                  1차 공문서 인쇄 / 미리보기
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedIwpPlan(plan);
                                    setActiveTab('iwp_edit');
                                  }}
                                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  수정하기
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* TAB 8: 중간평가서 (7~8월 진행 직업적응훈련 중간평가 및 종합보고서) */}
          {activeTab === 'midterm_eval' && (
            <div id="midterm-eval-workspace-pane" className="space-y-6">
              <MidtermEvaluationReport
                client={client}
                purdueTests={filteredPurdueTests}
                ersTests={filteredErsTests}
                picturePdfs={filteredPicturePdfs}
                iwpPlan={filteredIwpPlans.find(p => p.clientId === client.id && p.termType === '1차') || filteredIwpPlans.find(p => p.clientId === client.id)}
                targetYear={selectedYear !== 'ALL' ? selectedYear : new Date().getFullYear()}
                onNavigateTo2ndIwp={() => setActiveTab('iwp_2nd')}
              />
            </div>
          )}

          {/* TAB 9: 2차 개별화재활계획서 (7~8월 중간평가 반영 상·하반기 비교 재수립) */}
          {activeTab === 'iwp_2nd' && (
            <div id="iwp-2nd-workspace-pane" className="space-y-6">
              {(() => {
                const targetYearNum = selectedYear !== 'ALL' ? selectedYear : new Date().getFullYear();
                const clientPlans2nd = filteredIwpPlans.filter(p => p.clientId === client.id && (p.termType === '2차' || (!p.termType && p.planType === '재수립')));
                const previewDefault2nd = generateDefaultIWP(client, filteredPurdueTests, filteredErsTests, filteredPicturePdfs, '2차', targetYearNum);

                return (
                  <>
                    {/* 2nd IWP Guide Header */}
                    <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 -bottom-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-inner">
                              <TrendingUp className="h-6 w-6 text-purple-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-300/30">
                                  2차 개별화재활계획서 (중간평가 연계)
                                </span>
                                <span className="text-xs font-bold text-slate-300">
                                  {client.trainingClass || '문화예술반'}
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-white mt-1">
                                {client.name} 훈련생 2차 개별화재활계획(IWP) 재수립
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-3 py-1.5 rounded-xl border bg-purple-500/20 text-purple-300 border-purple-400/40 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                              상·하반기 비교 및 하반기 목표 수립
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-purple-100/90 leading-relaxed max-w-3xl">
                          2차 개별화재활계획은 <strong>7~8월경 중간평가와 함께 진행</strong>하며, <strong>상반기 훈련 결과와 하반기 평가 결과를 비교 분석</strong>하여 하반기 집중 지원 방향 및 개별 맞춤 서비스 계획을 재수립합니다.
                        </p>

                        {/* Midterm Review Connect Alert */}
                        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <FileSpreadsheet className="h-4 w-4" />
                              중간평가서(7~8월)와 상·하반기 비교 데이터 자동 연동
                            </div>
                            <p className="text-[11px] text-purple-100">
                              상반기 성취도와 하반기 훈련 목표가 대비표 형태로 2차 계획서에 반영됩니다.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab('midterm_eval')}
                            className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                          >
                            중간평가서 먼저 확인하기 &rarr;
                          </button>
                        </div>

                        {/* Action Toolbar to Generate or Edit 2nd IWP */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/15">
                          <div className="text-[11px] text-purple-200 font-medium flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-amber-300 shrink-0" />
                            상·하반기 비교 분석 데이터가 포함된 2차 개별화재활계획서를 수립합니다.
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedIwpPlan(previewDefault2nd);
                                setActiveTab('iwp_view');
                              }}
                              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
                            >
                              <Eye className="h-4 w-4" />
                              2차 공문서 인쇄 미리보기
                            </button>
                            <button
                              onClick={() => {
                                setSelectedIwpPlan(previewDefault2nd);
                                setActiveTab('iwp_edit');
                              }}
                              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 ring-2 ring-purple-300/40"
                            >
                              <Sparkles className="h-4 w-4 text-amber-300" />
                              2차 개별화재활계획서 작성
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Saved 2nd IWP Plans List */}
                    {clientPlans2nd.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-black text-slate-800">
                              보관된 2차 개별화재활계획서 이력 ({clientPlans2nd.length}건)
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newPlan = generateDefaultIWP(client, purdueTests, ersTests, pictureInterestPdfs, '2차');
                              setSelectedIwpPlan(newPlan);
                              setActiveTab('iwp_edit');
                            }}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            새 2차 계획서 작성
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {clientPlans2nd.map((plan) => (
                            <div
                              key={plan.id}
                              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                            >
                              <div>
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                        2차 계획서 (하반기 연계)
                                      </span>
                                      <span className="text-xs font-black text-slate-800">{plan.name} 훈련생</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">소속: {plan.trainingClass}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (confirm('이 2차 개별화재활계획서를 삭제하시겠습니까?')) {
                                        if (onDeleteIWPPlan) onDeleteIWPPlan(plan.id);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">계획 재수립일자</span>
                                    <span className="font-bold text-slate-800">{plan.planDate}</span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">ERS 표준점수</span>
                                    <span className="font-black text-purple-600 font-mono">{plan.ersStandardScore}점</span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">상·하반기 비교표</span>
                                    <span className="font-bold text-slate-800 font-mono">
                                      포함 완료
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">담당 평가사</span>
                                    <span className="font-bold text-slate-800">{plan.evaluatorName || '미지정'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedIwpPlan(plan);
                                    setActiveTab('iwp_view');
                                  }}
                                  className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Eye className="h-3.5 w-3.5 text-purple-600" />
                                  2차 공문서 인쇄 / 미리보기
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedIwpPlan(plan);
                                    setActiveTab('iwp_edit');
                                  }}
                                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  수정하기
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* TAB CONTENT 0: Trainee Individual File (Intake Form / Printable Report) */}
          {activeTab === 'intake_edit' && (
            <IntakeForm
              client={client}
              onSave={(savedRecord) => {
                onUpdateClient({
                  ...client,
                  intakeRecord: savedRecord,
                });
                setActiveTab('intake');
              }}
              onCancel={() => setActiveTab('intake')}
            />
          )}

          {activeTab === 'intake' && (
            client.intakeRecord ? (
              <IntakeReport
                client={client}
                record={client.intakeRecord}
                onEdit={() => setActiveTab('intake_edit')}
                onBack={() => setActiveTab('purdue')}
                onOpenPictureInterestModal={() => setIsPictureInterestModalOpen(true)}
              />
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center space-y-3">
                <FileText className="h-10 w-10 mx-auto text-indigo-400" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">아직 입력된 훈련생 개별파일이 없습니다</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    수원시장애인종합복지관 양식에 맞춰 접수상담기록지 및 사회평가지를 6단계로 나누어 편리하게 입력하실 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('intake_edit')}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[3]" />
                  훈련생 개별파일 양식 작성하기
                </button>
              </div>
            )
          )}

          {/* TAB CONTENT 1: Purdue Pegboard */}
          {activeTab === 'purdue' && (
            <div id="purdue-tab-workspace" className="space-y-4">
              {purdueTests.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center text-slate-400">
                  <Activity className="h-9 w-9 mx-auto mb-2 text-slate-300" />
                  <h4 className="font-extrabold text-sm text-slate-600 mb-1">축적된 퍼듀펙보드 검사가 없습니다</h4>
                  <p className="text-xs">상단 런처의 'Pegboard 검사'를 눌러 검사값을 기재해주세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {purdueTests.map((test) => (
                    <div
                      id={`purdue-card-${test.id}`}
                      key={test.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-250 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            검사시행: {test.testDate}
                          </span>
                          <button
                            id={`del-purdue-${test.id}`}
                            onClick={() => {
                              if (confirm('이 검사 기록을 완전히 삭제하시겠습니까?')) onDeletePurdueTest(test.id);
                            }}
                            className="bg-slate-50 hover:bg-rose-50 border border-slate-150 hover:border-rose-100 text-slate-400 hover:text-rose-600 transition-all rounded-lg p-1"
                            title="이력 삭제"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <div className="bg-slate-50 border border-slate-150/60 py-1.5 px-1 rounded-xl flex flex-col justify-between min-h-[48px]">
                            <div>
                              <span className="block opacity-80 mb-0.5 text-[8.5px]">오른손</span>
                              <span className="font-extrabold text-slate-800 font-mono text-xs">{test.rightHand.toFixed(2)}</span>
                            </div>
                            {test.rightHandTrials && (
                              <span className="block text-[7.5px] text-slate-400 font-normal font-mono" title="각 회차별 점수">
                                ({test.rightHandTrials.join(',')})
                              </span>
                            )}
                          </div>
                          <div className="bg-slate-50 border border-slate-150/60 py-1.5 px-1 rounded-xl flex flex-col justify-between min-h-[48px]">
                            <div>
                              <span className="block opacity-80 mb-0.5 text-[8.5px]">왼손</span>
                              <span className="font-extrabold text-slate-800 font-mono text-xs">{test.leftHand.toFixed(2)}</span>
                            </div>
                            {test.leftHandTrials && (
                              <span className="block text-[7.5px] text-slate-400 font-normal font-mono" title="각 회차별 점수">
                                ({test.leftHandTrials.join(',')})
                              </span>
                            )}
                          </div>
                          <div className="bg-slate-50 border border-slate-150/60 py-1.5 px-1 rounded-xl flex flex-col justify-between min-h-[48px]">
                            <div>
                              <span className="block opacity-80 mb-0.5 text-[8.5px]">양손</span>
                              <span className="font-extrabold text-slate-800 font-mono text-xs">{test.bothHands.toFixed(2)}</span>
                            </div>
                            {test.bothHandsTrials && (
                              <span className="block text-[7.5px] text-slate-400 font-normal font-mono" title="각 회차별 점수">
                                ({test.bothHandsTrials.join(',')})
                              </span>
                            )}
                          </div>
                          <div className="bg-indigo-50 border border-indigo-100 py-1.5 px-1 rounded-xl flex flex-col justify-between min-h-[48px]">
                            <div>
                              <span className="block text-indigo-500 opacity-90 mb-0.5 text-[8.5px]">조립</span>
                              <span className="font-extrabold text-indigo-700 font-mono text-xs">{test.assembly.toFixed(2)}</span>
                            </div>
                            {test.assemblyTrials && (
                              <span className="block text-indigo-400 font-normal font-mono" title="각 회차별 점수">
                                ({test.assemblyTrials.join(',')})
                              </span>
                            )}
                          </div>
                        </div>

                        {test.notes && (
                          <p className="text-[10.5px] text-slate-500 line-clamp-1 italic leading-relaxed pt-0.5 select-none">
                            " {test.notes} "
                          </p>
                        )}
                      </div>

                      <button
                        id={`view-purdue-${test.id}`}
                        onClick={() => onViewPurdueResult(test)}
                        className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 hover:text-indigo-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-500" />
                        결과지 보기
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: ERS Scales */}
          {activeTab === 'ers' && (
            <div id="ers-tab-workspace" className="space-y-4">
              {ersTests.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center text-slate-400">
                  <ClipboardCheck className="h-9 w-9 mx-auto mb-2 text-slate-300" />
                  <h4 className="font-extrabold text-sm text-slate-600 mb-1">축적된 ERS 평가 이력이 없습니다</h4>
                  <p className="text-xs">상단 런처의 'ERS 검정' 단추를 눌러 검사지를 기재해주세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {ersTests.map((test) => {
                    return (
                      <div
                        id={`ers-card-${test.id}`}
                        key={test.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-250 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              검정시행: {test.testDate}
                            </span>
                            <button
                              id={`del-ers-${test.id}`}
                              onClick={() => {
                                if (confirm('이 ERS 기록을 영구 삭제합니까?')) onDeleteErsTest(test.id);
                              }}
                              className="bg-slate-50 hover:bg-rose-50 border border-slate-150 hover:border-rose-100 text-slate-400 hover:text-rose-600 transition-all rounded-lg p-1"
                              title="이력 삭제"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <span className="text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-teal-50 border border-teal-100 text-teal-700">
                                사회성 및 직업적응력 (ERS)
                              </span>
                              <span className="block text-xs font-semibold text-slate-800">
                                합산: <span className="text-indigo-650 font-extrabold font-mono">{test.totalScore}</span>점 (평균 {test.averageScore}점)
                              </span>
                            </div>
                            <span className="text-[9.5px] font-bold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded text-slate-500 text-right leading-tight max-w-[120px] truncate">
                              {test.interpretation}
                            </span>
                          </div>

                          {test.notes && (
                            <p className="text-[10.5px] text-slate-400 line-clamp-1 italic">
                              " {test.notes} "
                            </p>
                          )}
                        </div>

                        <button
                          id={`view-ers-${test.id}`}
                          onClick={() => onViewErsResult(test)}
                          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5 text-indigo-500" />
                          ERS 결과지 열람
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 3: Basic Academic Tests */}
          {activeTab === 'academic' && (
            <div id="academic-tab-workspace" className="space-y-4">
              {basicAcademicTests.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center text-slate-400">
                  <BookOpen className="h-9 w-9 mx-auto mb-2 text-emerald-500" />
                  <h4 className="font-extrabold text-sm text-slate-700 mb-1">기초학력수준 검사 기록이 없습니다</h4>
                  <p className="text-xs mb-3">태블릿 PC나 노트북 화면에서 훈련생과 함께 보면서 인터랙티브 검사를 진행해보세요.</p>
                  <button
                    onClick={() => {
                      if (onStartBasicAcademicTest) onStartBasicAcademicTest();
                    }}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Tablet className="h-3.5 w-3.5" />
                    신규 기초학력 검사 실시
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {basicAcademicTests.map((test) => {
                    const pScore = Object.values(test.personalInfoCheck).filter(Boolean).length;
                    return (
                      <div
                        key={test.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              시행일: {test.testDate}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm('이 기초학력수준 검사 기록을 영구 삭제합니까?')) {
                                  if (onDeleteBasicAcademicTest) onDeleteBasicAcademicTest(test.id);
                                }
                              }}
                              className="bg-slate-50 hover:bg-rose-50 border border-slate-150 hover:border-rose-100 text-slate-400 hover:text-rose-600 transition-all rounded-lg p-1"
                              title="삭제"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-800">
                              기초학력수준 검사
                            </span>
                            <div className="text-xs font-bold text-slate-800">
                              · 신상정보 인지: <span className="text-emerald-700 font-extrabold">{pScore} / 9</span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              · 길이지각: {test.perception.lengthChoice === 'long' ? '정답' : '오답'} | 방향: 우({test.perception.directionRight === 'right' ? 'O' : 'X'}), 위({test.perception.directionUp === 'up' ? 'O' : 'X'})
                            </div>
                          </div>

                          {test.overallNotes && (
                            <p className="text-[10.5px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-150">
                              "{test.overallNotes}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (onViewBasicAcademicResult) onViewBasicAcademicResult(test);
                          }}
                          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          기록지 열람 및 인쇄
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 4: Picture Interest Vocational Test PDF Management */}
          {activeTab === 'picture_interest' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-4 rounded-2xl shadow-md gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
                    <UploadCloud className="w-4 h-4 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white">
                      그림직업흥미검사 PDF 첨부 및 관리
                    </h3>
                    <p className="text-[10.5px] text-teal-200/80">
                      {client.name} 훈련생의 수검 PDF 결과지를 보관합니다.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPdfIdForModal(null);
                    setModalInitialShowUpload(true);
                    setIsPictureInterestModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  PDF 업로드
                </button>
              </div>

              {/* PDF File List */}
              {pictureInterestPdfs.filter((p) => p.clientId === client.id).length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <UploadCloud className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">등록된 그림직업흥미검사 PDF 보고서가 없습니다.</h4>
                  <button
                    onClick={() => {
                      setSelectedPdfIdForModal(null);
                      setModalInitialShowUpload(true);
                      setIsPictureInterestModalOpen(true);
                    }}
                    className="mt-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    PDF 파일 신규 등록하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pictureInterestPdfs
                    .filter((p) => p.clientId === client.id)
                    .map((pdf) => (
                      <div
                        key={pdf.id}
                        className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-2.5"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                              검사일: {pdf.testDate}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm(`'${pdf.fileName}' PDF 파일을 삭제하시겠습니까?`)) {
                                  if (onDeletePictureInterestPdf) onDeletePictureInterestPdf(pdf.id);
                                }
                              }}
                              className="text-slate-400 hover:text-red-500 p-1"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1" title={pdf.fileName}>
                            {pdf.fileName}
                          </h4>

                          <p className="text-[10px] text-slate-500 mt-0.5">
                            평가사: <span className="font-semibold text-slate-700">{pdf.evaluatorName}</span> ({pdf.fileSize})
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPdfIdForModal(pdf.id);
                            setModalInitialShowUpload(false);
                            setIsPictureInterestModalOpen(true);
                          }}
                          className="w-full py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          결과지 열람
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* BENTO CELL 4: Right Column - Compact Visualization Profiles */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">

          {/* Pegboard Clinical Performance Tracker Graph (Compact) */}
          <section 
            id="pegboard-clinical-tracker-cell" 
            className="bg-slate-900 rounded-3xl p-5 text-white overflow-hidden relative flex flex-col justify-between shadow-lg border border-slate-800/80"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-extrabold flex items-center gap-1.5 text-indigo-300">
                  <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full"></span>
                  Purdue Pegboard 시각화 프로필
                </h3>
                <span className="text-[9.5px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  {latestPurdue ? latestPurdue.testDate : '기록 없음'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400 leading-tight max-w-[190px]">
                  {latestPurdue 
                    ? '평균 측정치 vs 기준 규준' 
                    : '검사 기록 시 자동으로 그래프가 활성화됩니다.'}
                </p>
                {/* Legend */}
                <div className="flex items-center gap-2.5 text-[10px] text-slate-300 font-semibold select-none">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2 rounded bg-gradient-to-r from-indigo-500 to-indigo-400" />
                    <span>훈련생</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2 rounded bg-slate-700" />
                    <span className="text-slate-400">기준평균</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sleek Dual Bar Chart Area with horizontal gridlines */}
            <div className="relative flex items-end justify-between h-24 mt-3 px-1 border-b border-slate-800 pb-1">
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 top-0 bottom-1 flex flex-col justify-between pointer-events-none select-none">
                <div className="w-full border-t border-slate-800/60" />
                <div className="w-full border-t border-slate-800/60" />
                <div className="w-full border-t border-slate-800/60" />
              </div>

              {/* Bars */}
              {dataset.map((item, index) => {
                const userPct = Math.min(100, Math.max(5, Math.round((item.userVal / item.max) * 100)));
                const meanPct = Math.min(100, Math.max(5, Math.round((item.meanVal / item.max) * 100)));

                return (
                  <div key={index} className="flex flex-col items-center flex-1 h-full justify-end relative z-10 group">
                    <div className="flex items-end justify-center gap-1 px-0.5 h-[68px] w-full relative">
                      {/* User Bar */}
                      <div className="flex flex-col items-center justify-end h-full relative w-2.5 sm:w-3.5">
                        <span className="absolute -top-3.5 text-[8.5px] font-black font-mono text-indigo-300 select-none pb-0.5 whitespace-nowrap">
                          {latestPurdue ? item.userVal : '-'}
                        </span>
                        <div 
                          className={`w-full bg-gradient-to-t ${item.color} rounded-t shadow-[0_0_8px_rgba(99,102,241,0.25)] transition-all duration-500 group-hover:brightness-110`}
                          style={{ height: `${userPct}%` }}
                        />
                      </div>

                      {/* Mean Bar */}
                      <div className="flex flex-col items-center justify-end h-full relative w-2.5 sm:w-3.5">
                        <span className="absolute -top-3.5 text-[8px] font-bold font-mono text-slate-400 select-none pb-0.5 whitespace-nowrap">
                          {item.meanVal}
                        </span>
                        <div 
                          className="w-full bg-slate-700/90 hover:bg-slate-600 rounded-t transition-all duration-500 shadow-sm"
                          style={{ height: `${meanPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-300 font-extrabold tracking-tight mt-1 px-0.5 text-center whitespace-nowrap">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-2.5 border-t border-slate-800/80 pt-2 flex justify-between items-center text-[10.5px] text-slate-400">
              <span className="shrink-0 font-medium text-slate-500">소견:</span>
              <span className="text-slate-300 font-bold truncate ml-2 max-w-[240px]" title={latestPurdue?.notes || '기록이 없습니다.'}>
                {latestPurdue 
                  ? latestPurdue.notes 
                  : '소지 기능 검정 기록이 없습니다.'}
              </span>
            </div>
          </section>

          {/* ERS Psychological Resilience & Employability Risk Profile (Compact) */}
          <section 
            id="ers-risk-profile-cell" 
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-4 bg-teal-500 rounded-full"></span>
                  ERS 위험도 & 자아 준비성 프로필
                </h3>
                <span className={`px-2 py-0.5 text-[8.5px] font-extrabold rounded-md uppercase tracking-wider ${
                  isHighErsRisk ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isHighErsRisk ? '지원보완 필요' : '양호 / 안정'}
                </span>
              </div>

              <div className="space-y-2.5">
                {ersFactors.map((fact, idx) => {
                  const percent = Math.round((fact.score / fact.max) * 100);
                  return (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600 font-semibold">{fact.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700 font-mono text-[10px]">{fact.score} / {fact.max}</span>
                          <span className="font-extrabold text-indigo-600 text-[10px]">({fact.level})</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex items-center border border-slate-50">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            percent < 55 ? 'bg-rose-400' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 border-t border-slate-150/60 pt-2 flex justify-between items-center text-[10.5px]">
              <span className="text-slate-400">지표 판별:</span>
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 max-w-[200px] truncate">
                {latestErs ? latestErs.interpretation : '검사 이력 없음'}
              </span>
            </div>
          </section>

        </div>

      </div>

      {/* 그림직업흥미검사 PDF 업로드 및 관리 모달 (새 창) */}
      <PictureInterestModal
        isOpen={isPictureInterestModalOpen}
        onClose={() => {
          setIsPictureInterestModalOpen(false);
          setSelectedPdfIdForModal(null);
          setModalInitialShowUpload(false);
        }}
        client={client}
        pdfList={pictureInterestPdfs}
        initialPdfId={selectedPdfIdForModal}
        initialShowUpload={modalInitialShowUpload}
        onSavePdf={(newPdf) => {
          if (onSavePictureInterestPdf) {
            onSavePictureInterestPdf(newPdf);
          }
        }}
        onDeletePdf={(id) => {
          if (onDeletePictureInterestPdf) {
            onDeletePictureInterestPdf(id);
          }
        }}
      />

    </div>
  );
}
