import React, { useState } from 'react';
import { 
  MidtermJobTrainingReport, 
  MidtermSubjectDetailedReport, 
  Client 
} from '../types';
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  BookOpen, 
  Music, 
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  getDefaultJobReport, 
  getDefaultDetailedSubjectReport, 
  getDefaultSubjectDetailedReports,
  get5DomainScoresForSubject,
  SUBJECT_DETAILED_CONFIGS
} from './SemesterEvaluationPage';

interface MidtermEvaluationReportsProps {
  client: Client;
  evaluationYear: number;
  semesterType?: 'first' | 'second';
  midtermJobReport: MidtermJobTrainingReport;
  subjectReports: MidtermSubjectDetailedReport[];
  choirReport: MidtermSubjectDetailedReport;
  onUpdateJobReport: (updated: MidtermJobTrainingReport) => void;
  onUpdateSubjectReports: (updated: MidtermSubjectDetailedReport[]) => void;
  onUpdateChoirReport: (updated: MidtermSubjectDetailedReport) => void;
  onApplyPreset: () => void;
}

const AVAILABLE_PRESET_SUBJECTS = [
  'AI샌드아트',
  '미술',
  '공예',
  'AI전자작가',
  '스마트팜',
  '사무보조',
  '작업활동'
];

export default function MidtermEvaluationReports({
  client,
  evaluationYear,
  semesterType = 'first',
  midtermJobReport,
  subjectReports,
  choirReport,
  onUpdateJobReport,
  onUpdateSubjectReports,
  onUpdateChoirReport,
  onApplyPreset
}: MidtermEvaluationReportsProps) {
  // Active view tab: 'all' | 'choir' | number (subject index)
  const [activeSubjectTab, setActiveSubjectTab] = useState<number | 'all' | 'choir'>('all');
  const [showAddSubjectMenu, setShowAddSubjectMenu] = useState(false);
  const [isGeneratingJobAi, setIsGeneratingJobAi] = useState(false);
  const [jobAiSuccess, setJobAiSuccess] = useState(false);
  const [jobAiError, setJobAiError] = useState<string | null>(null);

  // Generate Midterm Job Training Report Manager Opinion with Gemini AI
  const handleGenerateJobAi = async () => {
    setIsGeneratingJobAi(true);
    setJobAiError(null);
    setJobAiSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-midterm-job-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: client.name,
          majorDept: midtermJobReport.majorDept || client.trainingClass || '직업적응훈련반',
          semesterType,
          evaluationYear,
          rows: midtermJobReport.rows,
          totalScore: midtermJobReport.totalScore
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI 종합의견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        onUpdateJobReport({
          ...midtermJobReport,
          managerOpinion: data.text
        });
        setJobAiSuccess(true);
        setTimeout(() => setJobAiSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error('Failed to generate job opinion:', err);
      setJobAiError(err?.message || 'AI 종합의견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingJobAi(false);
    }
  };

  // Check if job report currently has the mandatory choir row
  const hasChoirInJobReport = midtermJobReport.rows.some(
    r => r.subjectName.includes('공통') || r.subjectName.includes('합창') || r.taskName.includes('합창')
  );

  // Sync rows to current trainee's vocational subjects + mandatory 공통교육 합창
  const handleSyncAllTraineeSubjects = () => {
    // 1. Sync Job Report (Page 1)
    const defaultJobRep = getDefaultJobReport(client);
    onUpdateJobReport({
      ...midtermJobReport,
      rows: defaultJobRep.rows,
      totalScore: defaultJobRep.totalScore,
      managerOpinion: defaultJobRep.managerOpinion
    });

    // 2. Sync Subject Detailed Reports (Page 2s)
    const defaultSubjReps = getDefaultSubjectDetailedReports(client);
    onUpdateSubjectReports(defaultSubjReps);
  };

  // Add mandatory Choir row back to Page 1 if missing
  const handleAddMandatoryChoirRow = () => {
    if (hasChoirInJobReport) return;
    const choirDomains = get5DomainScoresForSubject('합창');
    const choirRow = {
      subjectName: '공통교육 (합창)',
      taskName: '합창 (발성 호흡 및 지정곡 앙상블 실창)',
      evalDomain: '음정/박자 정확성 및 단체 하모니',
      domainScores: choirDomains,
      maxScore: 25,
      score: choirDomains.reduce((acc, d) => acc + (Number(d.score) || 0), 0)
    };
    const newRows = [...midtermJobReport.rows, choirRow];
    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    onUpdateJobReport({
      ...midtermJobReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  // Job Report Row Updaters (Page 1)
  const handleUpdateJobRow = (idx: number, field: string, val: any) => {
    const newRows = [...midtermJobReport.rows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    onUpdateJobReport({
      ...midtermJobReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  // Update a single domain score (0~5) inside a job row (Page 1)
  const handleUpdateJobDomainScore = (rowIdx: number, domainIdx: number, scoreVal: number) => {
    const newRows = [...midtermJobReport.rows];
    const targetRow = newRows[rowIdx];
    if (!targetRow) return;

    const currentDomains = get5DomainScoresForSubject(targetRow.subjectName, targetRow.domainScores);
    const clamped = Math.max(0, Math.min(5, isNaN(scoreVal) ? 0 : scoreVal));
    
    currentDomains[domainIdx] = {
      ...currentDomains[domainIdx],
      score: clamped
    };

    const rowTotal = currentDomains.reduce((acc, d) => acc + (Number(d.score) || 0), 0);

    newRows[rowIdx] = {
      ...targetRow,
      domainScores: currentDomains,
      score: rowTotal
    };

    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    onUpdateJobReport({
      ...midtermJobReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  // Update a single domain name inside a job row (Page 1)
  const handleUpdateJobDomainName = (rowIdx: number, domainIdx: number, nameVal: string) => {
    const newRows = [...midtermJobReport.rows];
    const targetRow = newRows[rowIdx];
    if (!targetRow) return;

    const currentDomains = get5DomainScoresForSubject(targetRow.subjectName, targetRow.domainScores);
    currentDomains[domainIdx] = {
      ...currentDomains[domainIdx],
      domainName: nameVal
    };

    newRows[rowIdx] = {
      ...targetRow,
      domainScores: currentDomains
    };

    onUpdateJobReport({
      ...midtermJobReport,
      rows: newRows
    });
  };

  const handleAddJobRow = () => {
    const genericDomains = get5DomainScoresForSubject('추가훈련');
    const newRows = [
      ...midtermJobReport.rows,
      {
        subjectName: '추가훈련',
        taskName: '직무 실습 및 수행',
        domainScores: genericDomains,
        maxScore: 25,
        score: genericDomains.reduce((acc, d) => acc + (Number(d.score) || 0), 0)
      }
    ];
    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    onUpdateJobReport({
      ...midtermJobReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  const handleRemoveJobRow = (idx: number) => {
    const targetRow = midtermJobReport.rows[idx];
    const isChoir = targetRow && (targetRow.subjectName.includes('공통') || targetRow.subjectName.includes('합창') || targetRow.taskName.includes('합창'));
    if (isChoir) {
      if (!window.confirm('합창은 모든 훈련생의 필수 공통과목입니다. 정말로 삭제하시겠습니까?')) {
        return;
      }
    }
    if (midtermJobReport.rows.length <= 1) return;
    const newRows = midtermJobReport.rows.filter((_, i) => i !== idx);
    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    onUpdateJobReport({
      ...midtermJobReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  // Detailed Subject Reports Updaters (Page 2 List)
  const handleUpdateSingleSubjectReport = (reportIdx: number, updated: MidtermSubjectDetailedReport) => {
    const newReports = [...subjectReports];
    newReports[reportIdx] = updated;
    onUpdateSubjectReports(newReports);
  };

  const handleUpdateSubjectRow = (reportIdx: number, rowIdx: number, field: string, val: any) => {
    const targetReport = subjectReports[reportIdx];
    if (!targetReport) return;

    const newRows = [...targetReport.rows];
    newRows[rowIdx] = { ...newRows[rowIdx], [field]: val };
    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);

    handleUpdateSingleSubjectReport(reportIdx, {
      ...targetReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  const handleAddSubjectReport = (subjectName: string) => {
    const newReport = getDefaultDetailedSubjectReport(subjectName, client);
    onUpdateSubjectReports([...subjectReports, newReport]);
    setShowAddSubjectMenu(false);
    setActiveSubjectTab(subjectReports.length); // Switch to newly created tab
  };

  const handleRemoveSubjectReport = (reportIdx: number) => {
    if (subjectReports.length <= 1) {
      alert('최소 1개 이상의 전공훈련 중간평가표가 유지되어야 합니다.');
      return;
    }
    const reportTitle = subjectReports[reportIdx]?.subjectTitle || '평가표';
    if (!window.confirm(`'${reportTitle}'를 삭제하시겠습니까?`)) return;

    const newReports = subjectReports.filter((_, i) => i !== reportIdx);
    onUpdateSubjectReports(newReports);
    setActiveSubjectTab('all');
  };

  const handleApplySubjectPreset = (reportIdx: number, presetName: string) => {
    const newReport = getDefaultDetailedSubjectReport(presetName, client);
    const existing = subjectReports[reportIdx];
    handleUpdateSingleSubjectReport(reportIdx, {
      ...newReport,
      evalDate: existing?.evalDate || newReport.evalDate,
      evaluatorName: existing?.evaluatorName || newReport.evaluatorName,
      targetName: client.name
    });
  };

  // Choir Report Row Updaters (Page 3)
  const handleUpdateChoirRow = (idx: number, field: string, val: any) => {
    const newRows = [...choirReport.rows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    const newTotal = newRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    onUpdateChoirReport({
      ...choirReport,
      rows: newRows,
      totalScore: newTotal
    });
  };

  return (
    <div className="space-y-8 print:space-y-12">

      {/* Global Sync Banner for Top Midterm Evaluations */}
      <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 flex flex-wrap items-center gap-2">
              <span>{client.name} 훈련생 평가표 구성</span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                직종훈련 {subjectReports.length}과목
              </span>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                <Music className="h-3 w-3 text-sky-600" />
                필수 공통교육(합창) 포함
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              모든 훈련생에게 필수 공통과목인 <strong>[공통교육 - 합창(25점)]</strong>과 훈련생별 전공 직종과목({client.selectedSubjects && client.selectedSubjects.length > 0 ? client.selectedSubjects.join(', ') : '기본 과목'})이 일괄 편성됩니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasChoirInJobReport && (
            <button
              type="button"
              onClick={handleAddMandatoryChoirRow}
              className="text-xs font-bold px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl border border-sky-300 flex items-center gap-1.5 transition-all"
            >
              <Music className="h-3.5 w-3.5" />
              필수 공통 합창 추가
            </button>
          )}
          <button
            type="button"
            onClick={handleSyncAllTraineeSubjects}
            className="text-xs font-extrabold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="훈련생의 전공과목 및 필수 공통과목(합창)에 맞춰 1번 성적표 및 2·3번 세부 루브릭 평가표들을 일괄 자동 동기화합니다."
          >
            <RefreshCw className="h-3.5 w-3.5" />
            훈련생 과목 전체 자동 맞춤
          </button>
        </div>
      </div>

      {/* =========================================================================
          PAGE 1: 직종훈련 프로그램 평가 성적표 (전공과목 + 필수 공통교육 합창)
         ========================================================================= */}
      <div className="bg-white border-2 border-slate-900 p-6 md:p-8 rounded-none shadow-xs text-slate-950 font-sans print:shadow-none print:border-2 print:p-6 print:break-after-page">
        
        {/* Document Header & Approval Box */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 text-center pl-24">
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-slate-950 pb-1">
              {semesterType === 'second' ? '직종훈련 프로그램 하반기 기말평가 성적표' : '직종훈련 프로그램 상반기 중간평가 성적표'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              ( {evaluationYear}년도 {semesterType === 'second' ? '하반기(7~12월) 기말 직무능력 및 종합수행평가 결과표' : '상반기(1~6월) 중간 직무능력 및 수행평가 결과표'} - 직종과목 및 필수 공통 합창 )
            </p>
          </div>

          {/* 결재란 (담당 / 팀장) */}
          <div className="shrink-0 w-36 border border-slate-950 text-center text-xs">
            <div className="grid grid-cols-2 border-b border-slate-950 bg-slate-100 font-bold py-1">
              <div className="border-r border-slate-950">담 당</div>
              <div>팀 장</div>
            </div>
            <div className="grid grid-cols-2 h-14 bg-white">
              <div className="border-r border-slate-950 flex items-center justify-center text-[11px] text-slate-400"></div>
              <div className="flex items-center justify-center text-[11px] text-slate-400"></div>
            </div>
          </div>
        </div>

        {/* 1. 훈련생 기본 정보 */}
        <div className="mb-6 space-y-2">
          <h2 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-900 inline-block"></span>
            1. 훈련생 기본 정보
          </h2>
          <div className="border border-slate-950 p-3 bg-white grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-24 text-slate-700 font-bold shrink-0">전공훈련과 :</span>
              <input
                type="text"
                value={midtermJobReport.majorDept}
                onChange={(e) => onUpdateJobReport({ ...midtermJobReport, majorDept: e.target.value })}
                className="flex-1 border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-bold text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-slate-700 font-bold shrink-0">성 명 :</span>
              <span className="font-black text-slate-950 text-sm">{client.name}</span>
              <span className="text-[11px] text-slate-500 font-normal">({client.gender === 'M' ? '남' : '여'}, {client.diagnosis || '지적/자폐성 발달장애'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-slate-700 font-bold shrink-0">평 가 일 :</span>
              <input
                type="date"
                value={midtermJobReport.evaluationDate}
                onChange={(e) => onUpdateJobReport({ ...midtermJobReport, evaluationDate: e.target.value })}
                className="border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-mono text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-slate-700 font-bold shrink-0">평 가 자 :</span>
              <input
                type="text"
                value={midtermJobReport.evaluatorName}
                onChange={(e) => onUpdateJobReport({ ...midtermJobReport, evaluatorName: e.target.value })}
                className="flex-1 border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 2. 전공훈련별 성적 */}
        <div className="mb-6 space-y-2">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-900 inline-block"></span>
                2. 전공훈련별 성적
              </h2>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
                (직종과목 {midtermJobReport.rows.filter(r => !r.subjectName.includes('공통') && !r.taskName.includes('합창')).map(r => r.subjectName).join(', ')} + 필수 공통교육 합창)
              </span>
            </div>
            <div className="flex items-center gap-1.5 print:hidden">
              <button
                type="button"
                onClick={handleAddJobRow}
                className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> 과목 행 추가
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-950 text-center text-xs">
              <thead>
                <tr className="bg-amber-50/90 border-b border-slate-950 font-bold text-slate-900">
                  <th rowSpan={2} className="border-r border-slate-950 py-2 px-1.5 w-24 text-center">직종<br />훈련과목</th>
                  <th rowSpan={2} className="border-r border-slate-950 py-2 px-2 w-36 text-center">수행 과제</th>
                  <th colSpan={5} className="border-r border-slate-950 py-1.5 px-2 bg-amber-100/90 text-center">
                    평가 영역 (5개 영역 / 각 5점 만점)
                  </th>
                  <th rowSpan={2} className="border-r border-slate-950 py-2 px-1.5 w-16 text-center">합계<br />(25점)</th>
                  <th rowSpan={2} className="py-2 px-1 w-8 text-center print:hidden">관리</th>
                </tr>
                <tr className="bg-amber-50/90 border-b border-slate-950 font-bold text-slate-900 text-center">
                  <th className="border-r border-slate-950 py-1 px-1 w-24">영역 1</th>
                  <th className="border-r border-slate-950 py-1 px-1 w-24">영역 2</th>
                  <th className="border-r border-slate-950 py-1 px-1 w-24">영역 3</th>
                  <th className="border-r border-slate-950 py-1 px-1 w-24">영역 4</th>
                  <th className="border-r border-slate-950 py-1 px-1 w-24">영역 5</th>
                </tr>
              </thead>
              <tbody>
                {midtermJobReport.rows.map((row, idx) => {
                  const isCommonEducation = row.subjectName.includes('공통') || row.subjectName.includes('합창') || row.taskName.includes('합창');
                  const domainItems = get5DomainScoresForSubject(row.subjectName, row.domainScores);
                  return (
                    <tr 
                      key={idx} 
                      className={`border-b border-slate-950 ${isCommonEducation ? 'bg-sky-50/50 hover:bg-sky-50/80' : 'hover:bg-slate-50/50'}`}
                    >
                      {/* 직종 훈련과목 */}
                      <td className={`border-r border-slate-950 py-2 px-1 font-bold ${isCommonEducation ? 'bg-sky-100/70 text-sky-950' : 'bg-white'}`}>
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <input
                            type="text"
                            value={row.subjectName}
                            onChange={(e) => handleUpdateJobRow(idx, 'subjectName', e.target.value)}
                            className="w-full text-center bg-transparent border-0 font-bold text-xs p-0 focus:ring-1 focus:ring-slate-900"
                          />
                          {isCommonEducation && (
                            <span className="text-[9px] bg-sky-200 text-sky-900 px-1 py-0.2 rounded font-black flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 fill-sky-700 text-sky-700" /> 필수공통
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 수행 과제 */}
                      <td className="border-r border-slate-950 py-2 px-2 text-left">
                        <textarea
                          rows={2}
                          value={row.taskName}
                          onChange={(e) => handleUpdateJobRow(idx, 'taskName', e.target.value)}
                          className="w-full bg-transparent border-0 text-xs p-0 focus:ring-1 focus:ring-slate-900 font-medium resize-none leading-snug"
                        />
                      </td>

                      {/* 5개 평가 영역 칸 (각각 5점 만점) */}
                      {domainItems.map((dom, dIdx) => (
                        <td key={dIdx} className="border-r border-slate-950 p-1.5 bg-white align-top">
                          <div className="flex flex-col items-center justify-between h-full min-h-[58px] gap-1">
                            <input
                              type="text"
                              value={dom.domainName}
                              onChange={(e) => handleUpdateJobDomainName(idx, dIdx, e.target.value)}
                              title={dom.domainName}
                              className="w-full text-center bg-transparent border-0 text-[11px] font-bold text-slate-800 focus:ring-1 focus:ring-slate-900 p-0 leading-tight"
                              placeholder={`영역 ${dIdx + 1}`}
                            />
                            <div className="flex items-center justify-center gap-0.5 mt-auto pt-1">
                              <input
                                type="number"
                                min={0}
                                max={dom.maxScore || 5}
                                value={dom.score}
                                onChange={(e) => handleUpdateJobDomainScore(idx, dIdx, Number(e.target.value))}
                                className="w-9 text-center font-mono font-black text-xs py-0.5 bg-slate-50 border border-slate-300 rounded focus:border-slate-900 focus:bg-white text-indigo-950"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">/5</span>
                            </div>
                          </div>
                        </td>
                      ))}

                      {/* 합계 점수 (25점 만점) */}
                      <td className="border-r border-slate-950 py-2 px-1 font-mono font-black text-sm text-indigo-950 bg-indigo-50/40">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-sm font-black font-mono text-indigo-900">{row.score}</span>
                          <span className="text-[10px] text-slate-500 font-normal">/ 25점</span>
                        </div>
                      </td>

                      {/* 관리 버튼 */}
                      <td className="py-2 px-1 print:hidden">
                        {midtermJobReport.rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveJobRow(idx)}
                            title={isCommonEducation ? '필수 공통과목' : '행 삭제'}
                            className={`p-1 rounded ${isCommonEducation ? 'text-sky-400 hover:text-rose-600' : 'text-slate-400 hover:text-rose-600'}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* 점수 결과 총점 행 */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-950 text-slate-950">
                  <td colSpan={2} className="border-r border-slate-950 py-2.5 px-2 bg-slate-200 text-center font-black">
                    점수 결과
                  </td>
                  <td colSpan={6} className="py-2.5 px-4 text-center text-sm font-black tracking-wide">
                    총점 ( <span className="text-base text-indigo-950 font-mono px-2 underline decoration-2">{midtermJobReport.totalScore}</span> ) 점 / {midtermJobReport.rows.length * 25}점 만점
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 담당자 의견 */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-slate-900 inline-block"></span>
              3. 담당자 의견
            </h2>
            <div className="flex items-center gap-2 print:hidden">
              {jobAiSuccess && (
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  AI 종합의견 반영 완료
                </span>
              )}
              {jobAiError && (
                <span className="text-[11px] font-bold text-red-600">
                  {jobAiError}
                </span>
              )}
              <button
                type="button"
                onClick={handleGenerateJobAi}
                disabled={isGeneratingJobAi}
                className="px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                title="직종훈련 성적과 공통과목(합창) 점수를 분석하여 Gemini AI로 담당자 종합의견을 자동 작성합니다."
              >
                {isGeneratingJobAi ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    AI 작성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    AI 담당자의견 작성
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="border border-slate-950 p-3 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[90px]">
            <div className="md:col-span-2 flex items-center justify-center font-bold text-xs bg-amber-50/80 border border-amber-200/80 rounded py-2 text-slate-800">
              종합의견
            </div>
            <div className="md:col-span-10">
              <textarea
                rows={3}
                value={midtermJobReport.managerOpinion}
                onChange={(e) => onUpdateJobReport({ ...midtermJobReport, managerOpinion: e.target.value })}
                placeholder="담당자 종합 의견을 입력하세요 (예: 전공 훈련 및 공통과목(합창) 전반에서 적극적인 태도로 과제를 성실히 수행함...)"
                className="w-full h-full text-xs leading-relaxed p-2 border border-slate-300 focus:border-slate-900 rounded bg-transparent font-sans"
              />
            </div>
          </div>
        </div>

        {/* 서명란 */}
        <div className="flex justify-end items-center gap-8 pt-4 text-xs font-bold text-slate-950">
          <div className="flex items-center gap-2">
            <span>훈련생 :</span>
            <input
              type="text"
              value={midtermJobReport.traineeSignatureName}
              onChange={(e) => onUpdateJobReport({ ...midtermJobReport, traineeSignatureName: e.target.value })}
              className="w-20 border-b border-slate-400 py-0.5 px-1 text-center font-bold"
            />
            <span className="text-slate-600 font-normal">(서명)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>보호자 :</span>
            <input
              type="text"
              value={midtermJobReport.guardianSignatureName}
              onChange={(e) => onUpdateJobReport({ ...midtermJobReport, guardianSignatureName: e.target.value })}
              className="w-20 border-b border-slate-400 py-0.5 px-1 text-center font-bold"
            />
            <span className="text-slate-600 font-normal">(서명)</span>
          </div>
        </div>

      </div>


      {/* =========================================================================
          PAGE 2 & 3 NAVIGATION BAR: 전공훈련 중간평가표 & 공통교육(합창) 중간평가표
         ========================================================================= */}
      <div className="space-y-4">
        {/* Navigation & Controls Bar for Subject Detailed Reports */}
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-black tracking-wide">
              세부 중간평가표 목록 ({subjectReports.length}개 전공 + 1개 필수공통)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* View All Button */}
            <button
              type="button"
              onClick={() => setActiveSubjectTab('all')}
              className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${
                activeSubjectTab === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              전체 펼쳐보기 (인쇄 모드)
            </button>

            {/* Subject Tabs */}
            {subjectReports.map((report, idx) => {
              // Extract subject name from title
              const splitted = report.subjectTitle.split('-');
              const shortName = splitted[splitted.length - 1]?.trim() || `과목 ${idx + 1}`;
              const isSelected = activeSubjectTab === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSubjectTab(idx)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{shortName}</span>
                  <span className="text-[10px] font-mono opacity-80">({report.totalScore}점)</span>
                </button>
              );
            })}

            {/* Mandatory Choir Tab */}
            <button
              type="button"
              onClick={() => setActiveSubjectTab('choir')}
              className={`text-xs font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                activeSubjectTab === 'choir'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-sky-950/80 text-sky-200 border border-sky-800/80 hover:bg-sky-900'
              }`}
              title="모든 훈련생 필수 공통과목: 합창 중간평가표"
            >
              <Music className="h-3 w-3 text-amber-300" />
              <span>★ 필수공통: 합창</span>
              <span className="text-[10px] font-mono opacity-80">({choirReport.totalScore}점)</span>
            </button>

            {/* Add Subject Button with dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddSubjectMenu(!showAddSubjectMenu)}
                className="text-xs font-bold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs flex items-center gap-1 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                과목 평가표 추가
              </button>

              {showAddSubjectMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-slate-900 font-medium text-xs">
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    표준 전공과목 선택
                  </div>
                  {AVAILABLE_PRESET_SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleAddSubjectReport(subj)}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold">{subj}</span>
                      <span className="text-[10px] text-slate-400">{SUBJECT_DETAILED_CONFIGS[subj]?.deptName || '전공'}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      const customName = prompt('추가할 직종 훈련과목명을 입력하세요:', '신규직종과목');
                      if (customName && customName.trim()) {
                        handleAddSubjectReport(customName.trim());
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-indigo-600 font-bold text-xs"
                  >
                    + 직접 입력하여 추가...
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render Each Subject Detailed Report Sheet */}
        {subjectReports.map((report, reportIdx) => {
          const isVisible = activeSubjectTab === 'all' || activeSubjectTab === reportIdx;
          if (!isVisible) return null;

          return (
            <div 
              key={reportIdx}
              className="bg-white border-2 border-slate-900 p-6 md:p-8 rounded-none shadow-xs text-slate-950 font-sans print:shadow-none print:border-2 print:p-6 print:break-after-page space-y-6"
            >
              
              {/* Document Header & Approval Box */}
              <div className="flex justify-between items-start">
                <div className="flex-1 text-center pl-24">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      value={report.subjectTitle}
                      onChange={(e) => handleUpdateSingleSubjectReport(reportIdx, { ...report, subjectTitle: e.target.value })}
                      className="text-xl md:text-2xl font-black tracking-wider text-slate-950 pb-1 border-b border-transparent hover:border-slate-300 focus:border-slate-900 bg-transparent text-center w-full max-w-xl"
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    ( {evaluationYear}년도 전공과목 세부 실기 및 표현능력 중간평가 )
                  </p>
                </div>

                {/* 결재란 (담당 / 팀장) */}
                <div className="shrink-0 w-36 border border-slate-950 text-center text-xs">
                  <div className="grid grid-cols-2 border-b border-slate-950 bg-slate-100 font-bold py-1">
                    <div className="border-r border-slate-950">담 당</div>
                    <div>팀 장</div>
                  </div>
                  <div className="grid grid-cols-2 h-14 bg-white">
                    <div className="border-r border-slate-950 flex items-center justify-center text-[11px] text-slate-400"></div>
                    <div className="flex items-center justify-center text-[11px] text-slate-400"></div>
                  </div>
                </div>
              </div>

              {/* Subheader Toolbar with Preset Rubric Loader & Delete Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl print:hidden text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600">표준 루브릭 빠른 적용:</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {AVAILABLE_PRESET_SUBJECTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleApplySubjectPreset(reportIdx, preset)}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded border border-slate-200 shadow-2xs transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {subjectReports.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubjectReport(reportIdx)}
                    className="text-rose-600 hover:text-rose-700 font-bold px-2 py-0.5 hover:bg-rose-50 rounded flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="h-3 w-3" /> 평가표 삭제
                  </button>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="border border-slate-950 p-3 bg-white grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold shrink-0">대 상 :</span>
                  <span className="font-black text-slate-950 text-sm">{client.name}</span>
                  <span className="text-[11px] text-slate-500 font-normal">({client.trainingClass || '문화예술반'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold shrink-0">평 가 일 :</span>
                  <input
                    type="date"
                    value={report.evalDate}
                    onChange={(e) => handleUpdateSingleSubjectReport(reportIdx, { ...report, evalDate: e.target.value })}
                    className="border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-mono text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-bold shrink-0">평 가 자 :</span>
                  <input
                    type="text"
                    value={report.evaluatorName}
                    onChange={(e) => handleUpdateSingleSubjectReport(reportIdx, { ...report, evaluatorName: e.target.value })}
                    className="flex-1 border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* 평가과제 및 평가방법 박스 */}
              <div className="border border-slate-950 text-xs">
                <div className="grid grid-cols-12 border-b border-slate-950">
                  <div className="col-span-3 md:col-span-2 bg-amber-50/90 border-r border-slate-950 p-2 font-bold text-center flex items-center justify-center text-slate-900">
                    평가과제
                  </div>
                  <div className="col-span-9 md:col-span-10 p-2 bg-white font-medium">
                    <input
                      type="text"
                      value={report.taskTitle}
                      onChange={(e) => handleUpdateSingleSubjectReport(reportIdx, { ...report, taskTitle: e.target.value })}
                      className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-1 focus:ring-slate-900 text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-3 md:col-span-2 bg-amber-50/90 border-r border-slate-950 p-2 font-bold text-center flex items-center justify-center text-slate-900">
                    평가방법
                  </div>
                  <div className="col-span-9 md:col-span-10 p-2 bg-white font-medium">
                    <input
                      type="text"
                      value={report.evalMethod}
                      onChange={(e) => handleUpdateSingleSubjectReport(reportIdx, { ...report, evalMethod: e.target.value })}
                      className="w-full bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 세부 평가영역 및 루브릭 테이블 */}
              <div>
                <table className="w-full border-collapse border border-slate-950 text-xs">
                  <thead>
                    <tr className="bg-amber-50/90 border-b border-slate-950 font-bold text-slate-900 text-center">
                      <th className="border-r border-slate-950 py-2 px-3 w-40">평가영역</th>
                      <th className="border-r border-slate-950 py-2 px-3">평가내용 (루브릭 세부 기준)</th>
                      <th className="py-2 px-2 w-28">배점 (획득)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-slate-950 hover:bg-slate-50/50">
                        <td className="border-r border-slate-950 py-2 px-3 font-bold text-slate-900 bg-white">
                          <input
                            type="text"
                            value={row.domain}
                            onChange={(e) => handleUpdateSubjectRow(reportIdx, rowIdx, 'domain', e.target.value)}
                            className="w-full bg-transparent border-0 p-0 font-bold text-xs focus:ring-1 focus:ring-slate-900"
                          />
                        </td>
                        <td className="border-r border-slate-950 py-2 px-3 text-slate-700 text-left">
                          <textarea
                            rows={2}
                            value={row.content}
                            onChange={(e) => handleUpdateSubjectRow(reportIdx, rowIdx, 'content', e.target.value)}
                            className="w-full bg-transparent border-0 p-0 text-xs focus:ring-1 focus:ring-slate-900 resize-none leading-relaxed"
                          />
                        </td>
                        <td className="py-2 px-2 text-center bg-indigo-50/30">
                          <div className="flex items-center justify-center gap-1 font-mono font-bold">
                            <input
                              type="number"
                              min={0}
                              max={row.maxScore}
                              value={row.score}
                              onChange={(e) => handleUpdateSubjectRow(reportIdx, rowIdx, 'score', Number(e.target.value))}
                              className="w-12 text-center py-0.5 font-mono font-black text-sm bg-white border border-slate-300 rounded focus:border-slate-900"
                            />
                            <span className="text-slate-400 text-xs">/ {row.maxScore}점</span>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* 총점 행 */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-950 text-slate-950">
                      <td className="border-r border-slate-950 py-2.5 px-3 bg-slate-200 text-center">점수 결과</td>
                      <td colSpan={2} className="py-2.5 px-4 text-center text-sm font-black tracking-wide">
                        총점 ( <span className="text-base text-indigo-950 font-mono px-2 underline decoration-2">{report.totalScore}</span> ) 점 / 25점 만점
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 강사 의견 */}
              <div className="border border-slate-950 p-3 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[90px]">
                <div className="md:col-span-2 flex items-center justify-center font-bold text-xs bg-amber-50/80 border border-amber-200/80 rounded py-2 text-slate-800">
                  강사 의견
                </div>
                <div className="md:col-span-10">
                  <textarea
                    rows={3}
                    value={report.instructorOpinion}
                    onChange={(e) => handleUpdateSingleSubjectReport(reportIdx, { ...report, instructorOpinion: e.target.value })}
                    placeholder="강사 평가 의견을 작성하세요 (예: 기초 실기 조작과 과제 완성도에서 뛰어난 능력을 보임...)"
                    className="w-full h-full text-xs leading-relaxed p-2 border border-slate-300 focus:border-slate-900 rounded bg-transparent font-sans"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>


      {/* =========================================================================
          PAGE 3: 공통교육훈련 중간평가표 - 합창 (전체 훈련생 필수 공통과목)
         ========================================================================= */}
      {(activeSubjectTab === 'all' || activeSubjectTab === 'choir') && (
        <div className="bg-white border-2 border-slate-900 p-6 md:p-8 rounded-none shadow-xs text-slate-950 font-sans print:shadow-none print:border-2 print:p-6 print:break-after-page space-y-6">
          
          {/* Document Header & Approval Box */}
          <div className="flex justify-between items-start">
            <div className="flex-1 text-center pl-24">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-wider text-slate-950 pb-1">
                  공통교육훈련 중간평가표 - 합창
                </h1>
                <span className="text-[11px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300 print:hidden flex items-center gap-1">
                  <Star className="h-3 w-3 fill-sky-600 text-sky-600" />
                  전체 훈련생 필수 공통과목
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ( {evaluationYear}년도 공통과목 단체 협동 및 표현능력 중간평가 - 필수 공통교육 )
              </p>
            </div>

            {/* 결재란 (담당 / 팀장) */}
            <div className="shrink-0 w-36 border border-slate-950 text-center text-xs">
              <div className="grid grid-cols-2 border-b border-slate-950 bg-slate-100 font-bold py-1">
                <div className="border-r border-slate-950">담 당</div>
                <div>팀 장</div>
              </div>
              <div className="grid grid-cols-2 h-14 bg-white">
                <div className="border-r border-slate-950 flex items-center justify-center text-[11px] text-slate-400"></div>
                <div className="flex items-center justify-center text-[11px] text-slate-400"></div>
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="border border-slate-950 p-3 bg-white grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-bold shrink-0">대 상 :</span>
              <span className="font-black text-slate-950 text-sm">{client.name}</span>
              <span className="text-[11px] text-slate-500 font-normal">({client.gender === 'M' ? '남' : '여'}, {client.trainingClass || '직업적응훈련반'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-bold shrink-0">평 가 일 :</span>
              <input
                type="date"
                value={choirReport.evalDate}
                onChange={(e) => onUpdateChoirReport({ ...choirReport, evalDate: e.target.value })}
                className="border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-mono text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-bold shrink-0">평 가 자 :</span>
              <input
                type="text"
                value={choirReport.evaluatorName}
                onChange={(e) => onUpdateChoirReport({ ...choirReport, evaluatorName: e.target.value })}
                className="flex-1 border-b border-slate-300 focus:border-slate-900 bg-transparent py-0.5 px-1 font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* 평가과제 및 평가방법 박스 */}
          <div className="border border-slate-950 text-xs">
            <div className="grid grid-cols-12 border-b border-slate-950">
              <div className="col-span-3 md:col-span-2 bg-amber-50/90 border-r border-slate-950 p-2 font-bold text-center flex items-center justify-center text-slate-900">
                평가과제
              </div>
              <div className="col-span-9 md:col-span-10 p-2 bg-white font-medium">
                <input
                  type="text"
                  value={choirReport.taskTitle}
                  onChange={(e) => onUpdateChoirReport({ ...choirReport, taskTitle: e.target.value })}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold focus:ring-1 focus:ring-slate-900 text-slate-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-3 md:col-span-2 bg-amber-50/90 border-r border-slate-950 p-2 font-bold text-center flex items-center justify-center text-slate-900">
                평가방법
              </div>
              <div className="col-span-9 md:col-span-10 p-2 bg-white font-medium">
                <input
                  type="text"
                  value={choirReport.evalMethod}
                  onChange={(e) => onUpdateChoirReport({ ...choirReport, evalMethod: e.target.value })}
                  className="w-full bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 세부 평가영역 및 내용 테이블 */}
          <div>
            <table className="w-full border-collapse border border-slate-950 text-xs">
              <thead>
                <tr className="bg-amber-50/90 border-b border-slate-950 font-bold text-slate-900 text-center">
                  <th className="border-r border-slate-950 py-2 px-3 w-40">평가영역</th>
                  <th className="border-r border-slate-950 py-2 px-3">평가내용 (루브릭 세부 기준)</th>
                  <th className="py-2 px-2 w-28">배점 (획득)</th>
                </tr>
              </thead>
              <tbody>
                {choirReport.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-950 hover:bg-slate-50/50">
                    <td className="border-r border-slate-950 py-2 px-3 font-bold text-slate-900 bg-white">
                      <input
                        type="text"
                        value={row.domain}
                        onChange={(e) => handleUpdateChoirRow(idx, 'domain', e.target.value)}
                        className="w-full bg-transparent border-0 p-0 font-bold text-xs focus:ring-1 focus:ring-slate-900"
                      />
                    </td>
                    <td className="border-r border-slate-950 py-2 px-3 text-slate-700 text-left">
                      <textarea
                        rows={2}
                        value={row.content}
                        onChange={(e) => handleUpdateChoirRow(idx, 'content', e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-xs focus:ring-1 focus:ring-slate-900 resize-none leading-relaxed"
                      />
                    </td>
                    <td className="py-2 px-2 text-center bg-indigo-50/30">
                      <div className="flex items-center justify-center gap-1 font-mono font-bold">
                        <input
                          type="number"
                          min={0}
                          max={row.maxScore}
                          value={row.score}
                          onChange={(e) => handleUpdateChoirRow(idx, 'score', Number(e.target.value))}
                          className="w-12 text-center py-0.5 font-mono font-black text-sm bg-white border border-slate-300 rounded focus:border-slate-900"
                        />
                        <span className="text-slate-400 text-xs">/ {row.maxScore}점</span>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* 총점 행 */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-950 text-slate-950">
                  <td className="border-r border-slate-950 py-2.5 px-3 bg-slate-200 text-center">점수 결과</td>
                  <td colSpan={2} className="py-2.5 px-4 text-center text-sm font-black tracking-wide">
                    총점 ( <span className="text-base text-indigo-950 font-mono px-2 underline decoration-2">{choirReport.totalScore}</span> ) 점 / 25점 만점
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 강사 의견 */}
          <div className="border border-slate-950 p-3 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[90px]">
            <div className="md:col-span-2 flex items-center justify-center font-bold text-xs bg-amber-50/80 border border-amber-200/80 rounded py-2 text-slate-800">
              강사 의견
            </div>
            <div className="md:col-span-10">
              <textarea
                rows={3}
                value={choirReport.instructorOpinion}
                onChange={(e) => onUpdateChoirReport({ ...choirReport, instructorOpinion: e.target.value })}
                placeholder="강사 평가 의견을 작성하세요 (예: 박자감과 발성 훈련에 성실히 임하며 단체 합창 시 다른 단원들과 조화로운 음색을 형성함...)"
                className="w-full h-full text-xs leading-relaxed p-2 border border-slate-300 focus:border-slate-900 rounded bg-transparent font-sans"
              />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
