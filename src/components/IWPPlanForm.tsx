/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Client,
  PurdueTest,
  ERSTest,
  PictureInterestPDF,
  IndividualizedServicePlan,
  TrainingClassType
} from '../types';
import { generateDefaultIWP } from '../utils/iwpGenerator';
import {
  Save,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  FileCheck,
  Award,
  BookOpen,
  CheckCircle,
  Eye,
  Calendar,
  FolderSync
} from 'lucide-react';

interface IWPPlanFormProps {
  client: Client;
  purdueTests: PurdueTest[];
  ersTests: ERSTest[];
  picturePdfs: PictureInterestPDF[];
  initialPlan?: IndividualizedServicePlan;
  onSave: (plan: IndividualizedServicePlan) => void;
  onCancel: () => void;
  onPreview: (plan: IndividualizedServicePlan) => void;
}

interface PeriodState {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

function parsePeriodState(str: string): PeriodState {
  const currentYear = new Date().getFullYear();
  const defaultState: PeriodState = {
    startYear: currentYear,
    startMonth: 2,
    endYear: currentYear,
    endMonth: 7
  };

  if (!str) return defaultState;

  // Extract clean parts
  const clean = str.replace(/\([^)]*\)/g, '').replace(/'/g, '').trim();
  const parts = clean.split('~');

  if (parts.length >= 2) {
    const leftMatches = parts[0].match(/\d+/g);
    const rightMatches = parts[1].match(/\d+/g);

    let startYear = currentYear;
    let startMonth = 2;
    let endYear = currentYear;
    let endMonth = 7;

    if (leftMatches && leftMatches.length >= 2) {
      let y = parseInt(leftMatches[0], 10);
      if (y < 100) y += 2000;
      startYear = y;
      startMonth = parseInt(leftMatches[1], 10) || 1;
    } else if (leftMatches && leftMatches.length === 1) {
      startMonth = parseInt(leftMatches[0], 10) || 1;
    }

    if (rightMatches && rightMatches.length >= 2) {
      let y = parseInt(rightMatches[0], 10);
      if (y < 100) y += 2000;
      endYear = y;
      endMonth = parseInt(rightMatches[1], 10) || 12;
    } else if (rightMatches && rightMatches.length === 1) {
      endYear = startYear;
      endMonth = parseInt(rightMatches[0], 10) || 12;
    }

    return {
      startYear,
      startMonth: Math.min(Math.max(startMonth, 1), 12),
      endYear: Math.max(endYear, startYear),
      endMonth: Math.min(Math.max(endMonth, 1), 12)
    };
  }

  return defaultState;
}

function formatPeriodState(state: PeriodState): string {
  const { startYear, startMonth, endYear, endMonth } = state;
  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  const calculatedMonths = Math.max(1, totalMonths);

  const startYearShort = `'${String(startYear).slice(-2)}`;
  const endYearShort = `'${String(endYear).slice(-2)}`;

  if (startYear === endYear) {
    return `${startYearShort}. ${startMonth}. ~ ${endMonth}.\n(${calculatedMonths}개월)`;
  } else {
    return `${startYearShort}. ${startMonth}. ~ ${endYearShort}. ${endMonth}.\n(${calculatedMonths}개월)`;
  }
}

function PeriodRangePicker({
  value,
  onChange,
  className = ''
}: {
  value: string;
  onChange: (newVal: string) => void;
  className?: string;
}) {
  const [isManual, setIsManual] = useState(false);
  const state = parsePeriodState(value);
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const totalMonths = (state.endYear - state.startYear) * 12 + (state.endMonth - state.startMonth) + 1;
  const calculatedMonths = Math.max(1, totalMonths);

  const updateState = (updates: Partial<PeriodState>) => {
    const newState = { ...state, ...updates };
    // if end date is before start date, adjust end date
    if (newState.endYear < newState.startYear) {
      newState.endYear = newState.startYear;
    }
    if (newState.endYear === newState.startYear && newState.endMonth < newState.startMonth) {
      newState.endMonth = newState.startMonth;
    }
    onChange(formatPeriodState(newState));
  };

  const applyPreset = (startM: number, endM: number, addYear: number = 0) => {
    const newState: PeriodState = {
      startYear: state.startYear,
      startMonth: startM,
      endYear: state.startYear + addYear,
      endMonth: endM
    };
    onChange(formatPeriodState(newState));
  };

  return (
    <div className={`space-y-2 bg-white/95 p-3 rounded-2xl border border-indigo-100 shadow-xs ${className}`}>
      {/* Header with auto-calculated badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-black text-slate-700 truncate">서비스 제공기간</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px] tracking-tight shadow-xs">
            {calculatedMonths}개월 자동계산
          </span>
          <button
            type="button"
            onClick={() => setIsManual(!isManual)}
            className="text-[10px] text-slate-400 hover:text-indigo-600 underline font-semibold"
          >
            {isManual ? '선택창' : '직접수정'}
          </button>
        </div>
      </div>

      {!isManual ? (
        <div className="space-y-2">
          {/* Selectors: Start ~ End */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Start Year & Month */}
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold text-slate-500 block">시작</span>
              <div className="flex items-center gap-1">
                <select
                  value={state.startYear}
                  onChange={(e) => updateState({ startYear: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <select
                  value={state.startMonth}
                  onChange={(e) => updateState({ startMonth: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 focus:ring-1 focus:ring-indigo-500"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Year & Month */}
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold text-slate-500 block">종료</span>
              <div className="flex items-center gap-1">
                <select
                  value={state.endYear}
                  onChange={(e) => updateState({ endYear: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <select
                  value={state.endMonth}
                  onChange={(e) => updateState({ endMonth: Number(e.target.value) })}
                  className="w-full text-xs font-bold p-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 focus:ring-1 focus:ring-indigo-500"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 font-semibold mr-0.5">프리셋:</span>
            <button
              type="button"
              onClick={() => applyPreset(2, 7, 0)}
              className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded font-medium transition-colors"
            >
              상반기(2~7월, 6개월)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(8, 1, 1)}
              className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded font-medium transition-colors"
            >
              하반기(8~1월, 6개월)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2, 1, 1)}
              className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded font-medium transition-colors"
            >
              1년(2~1월, 12개월)
            </button>
          </div>

          {/* Clean format display */}
          <div className="text-[10.5px] font-mono text-center font-bold text-indigo-900 bg-indigo-50/70 py-1 px-2 rounded-lg border border-indigo-100 whitespace-pre-line">
            {value}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <textarea
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono focus:ring-1 focus:ring-indigo-500"
            placeholder={`'26. 2. ~ 7.\n(6개월)`}
          />
        </div>
      )}
    </div>
  );
}

export default function IWPPlanForm({
  client,
  purdueTests,
  ersTests,
  picturePdfs,
  initialPlan,
  onSave,
  onCancel,
  onPreview
}: IWPPlanFormProps) {
  // Initialize state with initialPlan or generate new default
  const [formData, setFormData] = useState<IndividualizedServicePlan>(() => {
    if (initialPlan) return initialPlan;
    return generateDefaultIWP(client, purdueTests, ersTests, picturePdfs);
  });

  // AI ERS Opinion Generation State
  const [isGeneratingErsAi, setIsGeneratingErsAi] = useState(false);
  const [aiGenerateSuccess, setAiGenerateSuccess] = useState(false);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  // AI Picture Interest Opinion Generation State (3-2)
  const [isGeneratingPicAi, setIsGeneratingPicAi] = useState(false);
  const [picAiSuccess, setPicAiSuccess] = useState(false);
  const [picAiError, setPicAiError] = useState<string | null>(null);

  // AI 3-4 Vocational Adaptation Training Opinion State
  const [isGeneratingTrainingAi, setIsGeneratingTrainingAi] = useState(false);
  const [trainingAiSuccess, setTrainingAiSuccess] = useState(false);
  const [trainingAiError, setTrainingAiError] = useState<string | null>(null);

  // AI 3-5 Major Program Evaluation Opinion State
  const [isGeneratingMajorAi, setIsGeneratingMajorAi] = useState(false);
  const [majorAiSuccess, setMajorAiSuccess] = useState(false);
  const [majorAiError, setMajorAiError] = useState<string | null>(null);

  // Generate ERS Opinion using Gemini AI API
  const handleGenerateErsWithAi = async () => {
    setIsGeneratingErsAi(true);
    setAiErrorMsg(null);
    setAiGenerateSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-ers-opinion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeName: client.name,
          gender: client.gender === 'M' ? '남성' : client.gender === 'F' ? '여성' : client.gender,
          birthDate: client.birthDate,
          disabilityType: client.intakeRecord?.disabilityName || client.diagnosis || '발달장애',
          disabilityLevel: client.intakeRecord?.disabilityGrade || '중증(심한장애)',
          trainingClass: formData.trainingClass || client.trainingClass || '문화예술반',
          ersScores: formData.ersScores,
          ersConvertedSum: formData.ersConvertedSum,
          ersStandardScore: formData.ersStandardScore,
          ersLowestDomain: formData.ersLowestDomain,
          clientGoals: formData.clientGoals || formData.guardianGoals || '',
          mainDifficulty: client.intakeRecord?.mainDifficulty || '',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI 소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setFormData(prev => ({
          ...prev,
          ersAnalysisText: data.text
        }));
        setAiGenerateSuccess(true);
        setTimeout(() => setAiGenerateSuccess(false), 4000);
      }
    } catch (error: any) {
      console.error('Failed to generate ERS AI opinion:', error);
      setAiErrorMsg(error?.message || 'AI 소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingErsAi(false);
    }
  };

  // Generate Picture Vocational Interest Opinion (3-2) using Gemini AI API
  const handleGeneratePictureInterestWithAi = async () => {
    setIsGeneratingPicAi(true);
    setPicAiError(null);
    setPicAiSuccess(false);

    try {
      const latestPdf = picturePdfs && picturePdfs.length > 0 ? picturePdfs[0] : null;
      const response = await fetch('/api/ai/generate-picture-interest-opinion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeName: client.name,
          gender: client.gender === 'M' ? '남성' : client.gender === 'F' ? '여성' : client.gender,
          birthDate: client.birthDate,
          disabilityType: client.intakeRecord?.disabilityName || client.diagnosis || '발달장애',
          disabilityLevel: client.intakeRecord?.disabilityGrade || '중증(심한장애)',
          trainingClass: formData.trainingClass || client.trainingClass || '문화예술반',
          pdfNotes: latestPdf?.notes || '',
          pdfFileName: latestPdf?.fileName || '',
          pdfBase64: latestPdf?.fileData || ''
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || '그림직업흥미검사 AI 소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setFormData(prev => ({
          ...prev,
          pictureInterestAnalysis: data.text
        }));
        setPicAiSuccess(true);
        setTimeout(() => setPicAiSuccess(false), 4000);
      }
    } catch (error: any) {
      console.error('Failed to generate picture interest AI opinion:', error);
      setPicAiError(error?.message || 'AI 소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingPicAi(false);
    }
  };

  // Generate 3-4 Vocational Adaptation Training Opinion using Gemini AI API
  const handleGenerateTrainingWithAi = async () => {
    setIsGeneratingTrainingAi(true);
    setTrainingAiError(null);
    setTrainingAiSuccess(false);

    try {
      const isFirst = formData.termType !== '2차';
      const response = await fetch('/api/ai/generate-training-opinion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeName: client.name,
          trainingClass: formData.trainingClass || client.trainingClass || '직업적응훈련반',
          firstHalfScores: formData.trainingCompareFirstHalf,
          secondHalfScores: formData.trainingCompareSecondHalf,
          isFirstTerm: isFirst
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || '직업적응훈련 AI 종합소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setFormData(prev => ({
          ...prev,
          trainingCompareNotes: data.text
        }));
        setTrainingAiSuccess(true);
        setTimeout(() => setTrainingAiSuccess(false), 4000);
      }
    } catch (error: any) {
      console.error('Failed to generate training AI opinion:', error);
      setTrainingAiError(error?.message || 'AI 종합소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingTrainingAi(false);
    }
  };

  // Generate 3-5 Major Program Evaluation Opinion using Gemini AI API
  const handleGenerateMajorWithAi = async () => {
    setIsGeneratingMajorAi(true);
    setMajorAiError(null);
    setMajorAiSuccess(false);

    try {
      const isFirst = formData.termType !== '2차';
      const response = await fetch('/api/ai/generate-major-opinion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeName: client.name,
          trainingClass: formData.trainingClass || client.trainingClass || '직업적응훈련반',
          firstHalfScores: formData.majorCompareFirstHalf,
          secondHalfScores: formData.majorCompareSecondHalf,
          isFirstTerm: isFirst
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || '전공훈련 AI 종합소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setFormData(prev => ({
          ...prev,
          majorCompareNotes: data.text
        }));
        setMajorAiSuccess(true);
        setTimeout(() => setMajorAiSuccess(false), 4000);
      }
    } catch (error: any) {
      console.error('Failed to generate major AI opinion:', error);
      setMajorAiError(error?.message || 'AI 종합소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingMajorAi(false);
    }
  };

  // Re-generate from current actual tests
  const handleAutoFillFromTests = () => {
    if (confirm('현재 훈련생의 최신 검사 결과(ERS, Pegboard, 그림흥미)를 바탕으로 점수와 소견을 새로 산출하시겠습니까?')) {
      const generated = generateDefaultIWP(client, purdueTests, ersTests, picturePdfs);
      setFormData(prev => ({
        ...generated,
        id: prev.id || generated.id,
        createdAt: prev.createdAt || generated.createdAt
      }));
    }
  };

  // Date parsing and formatting helpers for Section 8
  const parseToIsoDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const cleaned = trimmed.replace(/[년월일]/g, '.').replace(/\s+/g, '');
    const match = cleaned.match(/(\d{2,4})[.-](\d{1,2})[.-](\d{1,2})/);
    if (match) {
      let y = parseInt(match[1], 10);
      if (y < 100) y += 2000;
      const m = String(parseInt(match[2], 10)).padStart(2, '0');
      const d = String(parseInt(match[3], 10)).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  const formatToKoreanDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
  };

  const formatToDotDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[0]}. ${parseInt(parts[1], 10)}. ${parseInt(parts[2], 10)}.`;
  };

  // Helper to apply period to all education goals
  const handleApplyAllEducationPeriods = (newPeriod: string) => {
    setFormData(prev => ({
      ...prev,
      educationGoals: prev.educationGoals.map(g => ({ ...g, period: newPeriod }))
    }));
  };

  // Helper to apply period to all personal goals
  const handleApplyAllPersonalPeriods = (newPeriod: string) => {
    setFormData(prev => ({
      ...prev,
      personalGoals: prev.personalGoals.map(g => ({ ...g, period: newPeriod }))
    }));
  };

  // Strengths / Limitations handlers
  const handleAddStrength = () => {
    setFormData(prev => ({
      ...prev,
      strengths: [...prev.strengths, '새로운 강점 항목 입력']
    }));
  };

  const handleUpdateStrength = (index: number, val: string) => {
    setFormData(prev => {
      const updated = [...prev.strengths];
      updated[index] = val;
      return { ...prev, strengths: updated };
    });
  };

  const handleDeleteStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };

  const handleAddLimitation = () => {
    setFormData(prev => ({
      ...prev,
      limitations: [...prev.limitations, '새로운 제한점 항목 입력']
    }));
  };

  const handleUpdateLimitation = (index: number, val: string) => {
    setFormData(prev => {
      const updated = [...prev.limitations];
      updated[index] = val;
      return { ...prev, limitations: updated };
    });
  };

  const handleDeleteLimitation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      limitations: prev.limitations.filter((_, i) => i !== index)
    }));
  };

  // ERS score update
  const handleUpdateErsScore = (domainIndex: number, rawVal: number, convertedVal: number) => {
    setFormData(prev => {
      const newScores = [...prev.ersScores];
      newScores[domainIndex] = {
        ...newScores[domainIndex],
        rawScore: rawVal,
        convertedScore: convertedVal
      };
      const sum = newScores.reduce((acc, curr) => acc + curr.convertedScore, 0);
      
      // find lowest domain
      let lowest = newScores[0]?.domain || '';
      let minVal = 999;
      newScores.forEach(s => {
        if (s.convertedScore < minVal) {
          minVal = s.convertedScore;
          lowest = s.domain;
        }
      });

      return {
        ...prev,
        ersScores: newScores,
        ersConvertedSum: sum,
        ersLowestDomain: lowest
      };
    });
  };

  // Purdue score update
  const handleUpdatePurdueScore = (idx: number, myScore: number, standardMean: number, resultText: '평균' | '높음' | '낮음') => {
    setFormData(prev => {
      const newScores = [...prev.purdueScores];
      newScores[idx] = {
        ...newScores[idx],
        myScore,
        standardMean,
        resultText
      };
      return { ...prev, purdueScores: newScores };
    });
  };

  // Section 3-4 Training Comparison handlers
  const handleUpdateTrainingFirstHalf = (index: number, field: 'convertedScore' | 'percentage', value: number) => {
    setFormData(prev => {
      const next = [...prev.trainingCompareFirstHalf];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, trainingCompareFirstHalf: next };
    });
  };

  const handleUpdateTrainingSecondHalf = (index: number, field: 'convertedScore' | 'percentage', value: number) => {
    setFormData(prev => {
      const next = [...prev.trainingCompareSecondHalf];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, trainingCompareSecondHalf: next };
    });
  };

  const handleApplyTrainingSample = () => {
    setFormData(prev => ({
      ...prev,
      trainingCompareFirstHalf: [
        { item: '작업훈련', convertedScore: 3.7, percentage: 74 },
        { item: '직업교육', convertedScore: 4.3, percentage: 86 },
        { item: '직종훈련 프로그램', convertedScore: 4.0, percentage: 80 },
        { item: '자치회의 및 동아리 활동', convertedScore: 4.7, percentage: 94 },
        { item: '공통교육', convertedScore: 4.3, percentage: 86 },
      ],
      trainingCompareSecondHalf: [
        { item: '작업훈련', convertedScore: 4.7, percentage: 94 },
        { item: '직업교육', convertedScore: 5.0, percentage: 100 },
        { item: '직종훈련 프로그램', convertedScore: 4.7, percentage: 94 },
        { item: '자치회의 및 동아리 활동', convertedScore: 5.0, percentage: 100 },
        { item: '공통교육', convertedScore: 4.7, percentage: 94 },
      ],
      trainingCompareNotes: '○ 종합 총평: 상반기 대비 하반기 전 영역에서 고른 성취도 향상을 보였으며, 특히 작업훈련(+20%p) 및 직종훈련 프로그램(+14%p)에서 괄목할 만한 성장을 달성하여 5점 만점 기준 평균 4.8점(96.4%)을 기록함.'
    }));
  };

  // Load previous year evaluation scores for Section 3-4 and 3-5
  const handleLoadPreviousYearEvaluation = () => {
    const prevYear = formData.year - 1;
    let loadedTraining: any[] | null = null;
    let loadedMajor: any[] | null = null;

    try {
      // 1. Check Semester Evaluation for previous year
      const savedEval = localStorage.getItem(`semester_eval_${client.id}_${prevYear}`);
      if (savedEval) {
        const parsed = JSON.parse(savedEval);
        if (parsed.trainingCompareSecondHalf && parsed.trainingCompareSecondHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          loadedTraining = parsed.trainingCompareSecondHalf;
        } else if (parsed.trainingCompareFirstHalf && parsed.trainingCompareFirstHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          loadedTraining = parsed.trainingCompareFirstHalf;
        }

        if (parsed.majorCompareSecondHalf && parsed.majorCompareSecondHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          loadedMajor = parsed.majorCompareSecondHalf;
        } else if (parsed.majorCompareFirstHalf && parsed.majorCompareFirstHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          loadedMajor = parsed.majorCompareFirstHalf;
        }
      }

      // 2. Check IWP plans in localStorage
      if (!loadedTraining || !loadedMajor) {
        const savedIwpList = localStorage.getItem('iwp_plans');
        if (savedIwpList) {
          const list = JSON.parse(savedIwpList);
          const prevPlan = list.find((p: any) => p.clientId === client.id && p.year === prevYear && (p.termType === '2차' || p.planType === '재수립'));
          if (prevPlan) {
            if (!loadedTraining && prevPlan.trainingCompareSecondHalf) {
              loadedTraining = prevPlan.trainingCompareSecondHalf;
            }
            if (!loadedMajor && prevPlan.majorCompareSecondHalf) {
              loadedMajor = prevPlan.majorCompareSecondHalf;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading previous year evaluation:', e);
    }

    if (loadedTraining || loadedMajor) {
      setFormData(prev => ({
        ...prev,
        trainingCompareFirstHalf: loadedTraining || prev.trainingCompareFirstHalf,
        majorCompareFirstHalf: loadedMajor || prev.majorCompareFirstHalf,
        trainingCompareNotes: loadedTraining
          ? `○ 직전년도(${prevYear}년) 하반기 직업적응훈련 평가 점수를 반영함.`
          : prev.trainingCompareNotes,
        majorCompareNotes: loadedMajor
          ? `○ 직전년도(${prevYear}년) 하반기 전공훈련 평가 점수를 반영함.`
          : prev.majorCompareNotes,
      }));
      alert(`직전년도(${prevYear}년) 하반기 평가 점수(직업적응훈련 및 전공훈련)를 성공적으로 반영했습니다.`);
    } else {
      setFormData(prev => ({
        ...prev,
        trainingCompareFirstHalf: [
          { item: '작업훈련', convertedScore: 0, percentage: 0 },
          { item: '직업교육', convertedScore: 0, percentage: 0 },
          { item: '직종훈련 프로그램', convertedScore: 0, percentage: 0 },
          { item: '자치회의 및 동아리 활동', convertedScore: 0, percentage: 0 },
          { item: '공통교육', convertedScore: 0, percentage: 0 },
        ],
        majorCompareFirstHalf: prev.majorCompareFirstHalf.map(m => ({ ...m, convertedScore: 0, percentage: 0 })),
        trainingCompareNotes: '○ 해당 사항 없음 (1차 평가 6월 진행 예정)',
        majorCompareNotes: '○ 해당 사항 없음 (1차 평가 6월 진행 예정)',
      }));
      alert(`직전년도(${prevYear}년) 평가 데이터가 없습니다.\n공란으로 유지되며, 종합 소견란에 "해당 사항 없음 (1차 평가 6월 진행 예정)"이 기본 적용되었습니다.`);
    }
  };

  const handleResetTraining = () => {
    setFormData(prev => ({
      ...prev,
      trainingCompareFirstHalf: [
        { item: '작업훈련', convertedScore: 0, percentage: 0 },
        { item: '직업교육', convertedScore: 0, percentage: 0 },
        { item: '직종훈련 프로그램', convertedScore: 0, percentage: 0 },
        { item: '자치회의 및 동아리 활동', convertedScore: 0, percentage: 0 },
        { item: '공통교육', convertedScore: 0, percentage: 0 },
      ],
      trainingCompareSecondHalf: [
        { item: '작업훈련', convertedScore: 0, percentage: 0 },
        { item: '직업교육', convertedScore: 0, percentage: 0 },
        { item: '직종훈련 프로그램', convertedScore: 0, percentage: 0 },
        { item: '자치회의 및 동아리 활동', convertedScore: 0, percentage: 0 },
        { item: '공통교육', convertedScore: 0, percentage: 0 },
      ],
      trainingCompareNotes: '○ 해당 사항 없음 (1차 평가 6월 진행 예정)'
    }));
  };

  // Section 3-5 Major Comparison handlers
  const handleUpdateMajorFirstHalf = (index: number, field: 'item' | 'convertedScore' | 'percentage', value: string | number) => {
    setFormData(prev => {
      const next = [...prev.majorCompareFirstHalf];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, majorCompareFirstHalf: next };
    });
  };

  const handleUpdateMajorSecondHalf = (index: number, field: 'item' | 'convertedScore' | 'percentage', value: string | number) => {
    setFormData(prev => {
      const next = [...prev.majorCompareSecondHalf];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, majorCompareSecondHalf: next };
    });
  };

  const handleAddMajorSubject = () => {
    const newSubjectName = `전공과목 ${formData.majorCompareFirstHalf.length + 1}`;
    setFormData(prev => ({
      ...prev,
      majorCompareFirstHalf: [...prev.majorCompareFirstHalf, { item: newSubjectName, convertedScore: 0, percentage: 0 }],
      majorCompareSecondHalf: [...prev.majorCompareSecondHalf, { item: newSubjectName, convertedScore: 0, percentage: 0 }]
    }));
  };

  const handleRemoveMajorSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      majorCompareFirstHalf: prev.majorCompareFirstHalf.filter((_, i) => i !== index),
      majorCompareSecondHalf: prev.majorCompareSecondHalf.filter((_, i) => i !== index)
    }));
  };

  const handleApplyMajorSample = () => {
    const subjects = formData.majorCompareFirstHalf.map(m => m.item);
    setFormData(prev => ({
      ...prev,
      majorCompareFirstHalf: subjects.map((item, idx) => ({
        item,
        convertedScore: 3.8 + (idx * 0.2),
        percentage: 76 + (idx * 4)
      })),
      majorCompareSecondHalf: subjects.map((item, idx) => ({
        item,
        convertedScore: 4.6 + (idx * 0.2),
        percentage: 92 + (idx * 4)
      })),
      majorCompareNotes: '○ 종합 총평: 상반기 기초과정 이수 후 하반기 심화 프로젝트 실무를 성공적으로 완수함.'
    }));
  };

  // Goals update
  const handleUpdateEducationGoal = (idx: number, field: string, val: string) => {
    setFormData(prev => {
      const updated = [...prev.educationGoals];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, educationGoals: updated };
    });
  };

  const handleUpdatePersonalGoal = (idx: number, field: string, val: string) => {
    setFormData(prev => {
      const updated = [...prev.personalGoals];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, personalGoals: updated };
    });
  };

  const handleAddPersonalGoal = () => {
    const currentYear = new Date().getFullYear();
    const defaultPeriod = formData.termType === '2차'
      ? `'${String(currentYear).slice(-2)}. 8. ~ '${String(currentYear + 1).slice(-2)}. 1.\n(6개월)`
      : `'${String(currentYear).slice(-2)}. 2. ~ 7.\n(6개월)`;

    const newGoal = {
      id: `pgoal_${Date.now()}`,
      goalTitle: '새로운 개인역량강화 단기목표',
      period: defaultPeriod,
      serviceContent: '- 구체적인 개별화 서비스 내용 및 수행방법을 입력하세요.',
      evaluator: formData.evaluator || '최재원',
      status: '진행 예정'
    };

    setFormData(prev => ({
      ...prev,
      personalGoals: [...prev.personalGoals, newGoal]
    }));
  };

  const handleDeletePersonalGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personalGoals: prev.personalGoals.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
            title="돌아가기"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                연초 1회 수립 (IWP)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {formData.name} 훈련생
              </span>
            </div>
            <h1 className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-2">
              개별화재활계획서 (개별화서비스계획서) 작성 및 편집
            </h1>
            <p className="text-xs text-slate-500">
              사전 3대 진단평가(ERS 직업준비검사, 퍼듀펙보드, 그림직업흥미검사) 결과를 바탕으로 연초 재활계획을 수립합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFillFromTests}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            3대 검사결과 동기화 및 자동 산출
          </button>
          <button
            type="button"
            onClick={() => onPreview(formData)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            인쇄 양식 미리보기
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            연초 계획서 저장 완료
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: 기본정보 & 구분 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              1. 기본정보 및 수립 구분
            </h2>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="radio"
                  name="termType"
                  value="1차"
                  checked={formData.termType === '1차' || (!formData.termType && formData.planType === '수립')}
                  onChange={() => setFormData(prev => ({ ...prev, termType: '1차', planType: '수립' }))}
                  className="accent-indigo-600"
                />
                1차 계획서 (연초 수립)
              </label>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <input
                  type="radio"
                  name="termType"
                  value="2차"
                  checked={formData.termType === '2차' || formData.planType === '재수립'}
                  onChange={() => setFormData(prev => ({ ...prev, termType: '2차', planType: '재수립' }))}
                  className="accent-purple-600"
                />
                2차 계획서 (7~8월 중간평가 후 재수립)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">소속 반</label>
              <select
                value={formData.trainingClass}
                onChange={(e) => setFormData(prev => ({ ...prev, trainingClass: e.target.value as TrainingClassType }))}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="문화예술반">문화예술반</option>
                <option value="스마트산업반">스마트산업반</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">성명</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">성별</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as '남' | '여' }))}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">생년월일</label>
              <input
                type="text"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                placeholder="1997. 5. 31."
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">장애유형</label>
              <input
                type="text"
                value={formData.disabilityType}
                onChange={(e) => setFormData(prev => ({ ...prev, disabilityType: e.target.value }))}
                placeholder="지적"
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-600 mb-1">욕구사항</label>
              <input
                type="text"
                value={formData.desiredGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, desiredGoal: e.target.value }))}
                placeholder="직업적응훈련을 통한 직무 탐색 및 취업 전이 역량 강화"
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: 강점 및 제한점 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            2. 강점 및 제한점
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 강점 */}
            <div className="space-y-2 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800">강점 (Strengths)</span>
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  강점 추가
                </button>
              </div>
              {formData.strengths.map((str, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 font-bold">•</span>
                  <input
                    type="text"
                    value={str}
                    onChange={(e) => handleUpdateStrength(idx, e.target.value)}
                    className="flex-1 text-xs p-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteStrength(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 제한점 */}
            <div className="space-y-2 bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-800">제한점 (Limitations)</span>
                <button
                  type="button"
                  onClick={handleAddLimitation}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  제한점 추가
                </button>
              </div>
              {formData.limitations.map((lim, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-amber-600 font-bold">•</span>
                  <input
                    type="text"
                    value={lim}
                    onChange={(e) => handleUpdateLimitation(idx, e.target.value)}
                    className="flex-1 text-xs p-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteLimitation(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3-1: 직업준비검사 (ERS) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              3-1. 직업준비검사(ERS) 점수 및 소견
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">검사일자:</span>
              <input
                type="text"
                value={formData.ersTestDate}
                onChange={(e) => setFormData(prev => ({ ...prev, ersTestDate: e.target.value }))}
                placeholder="2026. 2. 2.(월)"
                className="text-xs font-bold px-2 py-1 border border-slate-200 rounded-lg w-32"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {formData.ersScores.map((sc, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border ${
                  sc.domain === formData.ersLowestDomain
                    ? 'bg-red-50/50 border-red-200 ring-2 ring-red-400/30'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[11px] font-extrabold text-slate-700 text-center mb-1 flex items-center justify-center gap-1">
                  {sc.domain}
                  {sc.domain === formData.ersLowestDomain && (
                    <span className="text-[9px] bg-red-600 text-white px-1 rounded">최하위</span>
                  )}
                </div>
                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>원점수</span>
                    <input
                      type="number"
                      value={sc.rawScore}
                      onChange={(e) => handleUpdateErsScore(idx, Number(e.target.value), sc.convertedScore)}
                      className="w-10 text-center text-xs font-bold border border-slate-200 rounded bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>환산점수</span>
                    <input
                      type="number"
                      value={sc.convertedScore}
                      onChange={(e) => handleUpdateErsScore(idx, sc.rawScore, Number(e.target.value))}
                      className="w-10 text-center text-xs font-black border border-slate-200 rounded bg-white text-indigo-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
            <div>
              환산점수 합계: <span className="font-black text-indigo-600 text-sm ml-1">{formData.ersConvertedSum}점</span>
            </div>
            <div>
              표준점수: 
              <input
                type="number"
                value={formData.ersStandardScore}
                onChange={(e) => setFormData(prev => ({ ...prev, ersStandardScore: Number(e.target.value) }))}
                className="w-16 ml-1.5 p-1 text-center font-black text-sm text-indigo-700 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              최하위 취약 영역: <span className="font-black text-red-600 ml-1">{formData.ersLowestDomain}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-800">
                ERS 종합 소견 및 맞춤형 서비스 내용
              </label>
              <div className="flex items-center gap-2">
                {aiGenerateSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                    <CheckCircle className="w-3.5 h-3.5" /> AI 작성 완료
                  </span>
                )}
                {aiErrorMsg && (
                  <span className="text-[11px] font-medium text-rose-600 max-w-xs truncate" title={aiErrorMsg}>
                    {aiErrorMsg}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleGenerateErsWithAi}
                  disabled={isGeneratingErsAi}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all ${
                    isGeneratingErsAi
                      ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-200 active:scale-95'
                  }`}
                  title="훈련생 정보와 ERS 7대 영역 평가 점수 및 취약 영역을 분석하여 Gemini AI가 맞춤 소견을 작성합니다"
                >
                  {isGeneratingErsAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      AI 소견 작성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      AI로 소견 작성
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={7}
                value={formData.ersAnalysisText}
                onChange={(e) => setFormData(prev => ({ ...prev, ersAnalysisText: e.target.value }))}
                placeholder="ERS 종합 소견 및 맞춤형 서비스 지원 계획을 입력하거나 상단의 [AI로 소견 작성] 버튼을 클릭하세요."
                className="w-full text-xs leading-relaxed p-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800 bg-white"
              />
              {isGeneratingErsAi && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2 text-indigo-950 font-bold text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                  <span>Gemini AI가 ERS 평가 분석 및 직업재활 맞춤형 소견을 작성하고 있습니다...</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              * [AI로 소견 작성] 버튼을 누르면 훈련생의 ERS 7대 영역 평가 점수와 취약 영역, 인적사항을 분석하여 전문 직업재활사 관점의 상세 소견이 자동 작성됩니다.
            </p>
          </div>
        </div>

        {/* SECTION 3-2: 그림직업흥미검사 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                3-2. 그림직업흥미검사 분석 소견
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                업로드된 PDF 검사지 내용 및 검사 특이사항을 바탕으로 AI 임상 분석 소견을 자동 생성하거나 직접 편집합니다.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {picAiSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  AI 소견 작성 완료
                </span>
              )}
              {picAiError && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                  {picAiError}
                </span>
              )}
              <button
                type="button"
                onClick={handleGeneratePictureInterestWithAi}
                disabled={isGeneratingPicAi}
                className="px-3.5 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingPicAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AI 소견 작성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-200 fill-teal-200" />
                    AI로 소견 작성
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={5}
              value={formData.pictureInterestAnalysis}
              onChange={(e) => setFormData(prev => ({ ...prev, pictureInterestAnalysis: e.target.value }))}
              placeholder="업로드된 그림직업흥미검사 PDF를 바탕으로 분석 소견을 입력하거나 상단의 [AI로 소견 작성] 버튼을 클릭하세요."
              className="w-full text-xs leading-relaxed p-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-teal-500 font-mono text-slate-800 bg-white"
            />
            {isGeneratingPicAi && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2 text-teal-950 font-bold text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                <span>Gemini AI가 업로드된 검사지와 훈련생 프로필을 분석하여 직업흥미 소견을 작성하고 있습니다...</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            * [AI로 소견 작성] 버튼을 누르면 업로드된 그림직업흥미검사 파일과 메모를 분석하여 주요 흥미 직무군과 작업환경 선호도 소견이 자동 생성됩니다.
          </p>
        </div>

        {/* SECTION 3-3: Purdue Pegboard */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            3-3. Purdue Pegboard (퍼듀펙보드) 검사 결과
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {formData.purdueScores.map((ps, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-black text-slate-800 text-center">{ps.item}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>내 점수</span>
                    <input
                      type="number"
                      step="0.1"
                      value={ps.myScore}
                      onChange={(e) => handleUpdatePurdueScore(idx, Number(e.target.value), ps.standardMean, ps.resultText)}
                      className="w-14 text-center font-bold p-1 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>기준평균</span>
                    <input
                      type="number"
                      step="0.1"
                      value={ps.standardMean}
                      onChange={(e) => handleUpdatePurdueScore(idx, ps.myScore, Number(e.target.value), ps.resultText)}
                      className="w-14 text-center font-bold p-1 bg-white border border-slate-200 rounded"
                    />
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>판정</span>
                    <select
                      value={ps.resultText}
                      onChange={(e) => handleUpdatePurdueScore(idx, ps.myScore, ps.standardMean, e.target.value as any)}
                      className="text-xs font-bold p-1 bg-white border border-slate-200 rounded"
                    >
                      <option value="높음">높음</option>
                      <option value="평균">평균</option>
                      <option value="낮음">낮음</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3-4: 직업적응훈련반 훈련 비교 분석 사항 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                3-4. 직업적응훈련반 훈련 {formData.termType === '2차' ? '비교 분석 사항 (상·하반기)' : '평가 사항 (상반기)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.termType === '2차'
                  ? '상반기(1월~6월)와 하반기(7월~12월) 5대 영역별 환산점수 및 백분율(%)을 입력하여 비교 분석합니다.'
                  : '상반기(1월~6월) 훈련 5대 영역별 환산점수 및 백분율(%)을 입력하여 성취도를 평가합니다.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleLoadPreviousYearEvaluation}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition-all flex items-center gap-1 shadow-xs"
                title={`직전년도(${formData.year - 1}년) 하반기 직업적응훈련 및 전공훈련 평가 점수를 불러옵니다.`}
              >
                <FolderSync className="h-3 w-3 text-amber-600" />
                직전년도({formData.year - 1}년) 점수 반영
              </button>
              <button
                type="button"
                onClick={handleResetTraining}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
              >
                0% 초기화
              </button>
              <button
                type="button"
                onClick={handleApplyTrainingSample}
                className="px-3 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-all flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-indigo-600" />
                표준 예시 적용
              </button>
              <button
                type="button"
                onClick={handleGenerateTrainingWithAi}
                disabled={isGeneratingTrainingAi}
                className="px-3 py-1 text-[11px] font-black bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                {isGeneratingTrainingAi ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    작성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                    AI로 종합소견 작성
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Tables (Left 7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              {/* 상반기 Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="bg-blue-50/80 px-3 py-1.5 border-b border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    상반기 (1월~6월)
                  </span>
                  <span className="text-[10px] text-blue-600 font-normal">기준 배점 5.0점 만점</span>
                </div>
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-1.5 px-2 text-left pl-3">구분</th>
                      <th className="py-1.5 px-2 w-28">환산점수 (5점 만점)</th>
                      <th className="py-1.5 px-2 w-28">100분율(%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.trainingCompareFirstHalf.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-1.5 px-2 text-left pl-3 font-semibold text-slate-800">{row.item}</td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={row.convertedScore === 0 ? '' : row.convertedScore}
                            onChange={(e) => {
                              const val = e.target.value;
                              const score = val === '' ? 0 : parseFloat(val);
                              const safeScore = isNaN(score) ? 0 : Math.min(5, Math.max(0, score));
                              const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                              handleUpdateTrainingFirstHalf(idx, 'convertedScore', safeScore);
                              handleUpdateTrainingFirstHalf(idx, 'percentage', pct);
                            }}
                            placeholder="0.0"
                            className="w-20 p-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.percentage}
                              onChange={(e) => handleUpdateTrainingFirstHalf(idx, 'percentage', Number(e.target.value))}
                              className="w-16 p-1 text-center font-mono font-black text-blue-600 bg-blue-50/50 border border-blue-200 rounded-lg text-xs"
                            />
                            <span className="text-slate-400 text-[10px]">%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 하반기 Table (2차 계획서일 때만 표시) */}
              {formData.termType === '2차' && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <div className="bg-rose-50/80 px-3 py-1.5 border-b border-rose-100 flex items-center justify-between text-xs font-bold text-rose-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      하반기 (7월~12월)
                    </span>
                    <span className="text-[10px] text-rose-600 font-normal">기준 배점 5.0점 만점</span>
                  </div>
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-1.5 px-2 text-left pl-3">구분</th>
                        <th className="py-1.5 px-2 w-28">환산점수 (5점 만점)</th>
                        <th className="py-1.5 px-2 w-28">100분율(%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.trainingCompareSecondHalf.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-1.5 px-2 text-left pl-3 font-semibold text-slate-800">{row.item}</td>
                          <td className="py-1.5 px-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={row.convertedScore === 0 ? '' : row.convertedScore}
                              onChange={(e) => {
                                const val = e.target.value;
                                const score = val === '' ? 0 : parseFloat(val);
                                const safeScore = isNaN(score) ? 0 : Math.min(5, Math.max(0, score));
                                const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                                handleUpdateTrainingSecondHalf(idx, 'convertedScore', safeScore);
                                handleUpdateTrainingSecondHalf(idx, 'percentage', pct);
                              }}
                              placeholder="0.0"
                              className="w-20 p-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={row.percentage}
                                onChange={(e) => handleUpdateTrainingSecondHalf(idx, 'percentage', Number(e.target.value))}
                                className="w-16 p-1 text-center font-mono font-black text-rose-600 bg-rose-50/50 border border-rose-200 rounded-lg text-xs"
                              />
                              <span className="text-slate-400 text-[10px]">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Compare Live Chart (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[300px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                <span className="text-xs font-black text-slate-800">
                  {formData.termType === '2차' ? '실시간 비교 차트' : '상반기 성취율 차트'}
                </span>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> 상반기
                  </span>
                  {formData.termType === '2차' && (
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></span> 하반기
                    </span>
                  )}
                </div>
              </div>

              <div className="relative flex-1 flex flex-col justify-between pt-4 pb-1 px-2 min-h-[220px]">
                {/* Y-axis Guides */}
                <div className="absolute inset-x-2 top-4 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">100%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">75%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">50%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">25%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">0%</div>
                </div>

                <div className="flex-1 flex items-end justify-between w-full z-10 pb-1">
                  {formData.trainingCompareFirstHalf.map((item, idx) => {
                    const firstP = item.percentage || 0;
                    const secondP = formData.trainingCompareSecondHalf[idx]?.percentage || 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full px-1">
                        <div className="flex-1 flex items-end justify-center gap-1.5 w-full pb-1">
                          <div
                            className="w-4 bg-blue-500 rounded-t-sm shadow-xs transition-all duration-300 relative group"
                            style={{ height: `${Math.max(4, firstP)}%` }}
                          >
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                              {firstP}%
                            </span>
                          </div>
                          {formData.termType === '2차' && (
                            <div
                              className="w-4 bg-rose-400 rounded-t-sm shadow-xs transition-all duration-300 relative group"
                              style={{ height: `${Math.max(4, secondP)}%` }}
                            >
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-700 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                {secondP}%
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 mt-1 text-center truncate max-w-[54px] shrink-0" title={item.item}>
                          {item.item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                3-4 종합 소견 및 총평 (비고) - 수기작성란
              </label>
              {trainingAiSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  AI 소견 작성 완료
                </span>
              )}
            </div>
            
            {/* Quick Template Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] font-bold text-slate-500">빠른 문구 입력:</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, trainingCompareNotes: '○ 해당 사항 없음 (1차 평가 6월 진행 예정)' }))}
                className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                해당 사항 없음 (6월 진행 예정)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, trainingCompareNotes: '○ 해당 사항 없음 (1차 평가 7월 진행 예정)' }))}
                className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                해당 사항 없음 (7월 진행 예정)
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = prompt('1차 직업적응훈련평가 진행 예정 월을 입력하세요 (예: 6, 7):', '6');
                  if (m !== null && m.trim() !== '') {
                    setFormData(prev => ({ ...prev, trainingCompareNotes: `○ 해당 사항 없음 (1차 평가 ${m.trim()}월 진행 예정)` }));
                  }
                }}
                className="text-[11px] font-medium px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
              >
                ✏️ 진행 예정 월 직접 입력...
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={formData.trainingCompareNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, trainingCompareNotes: e.target.value }))}
                placeholder="○ 직전년도 하반기 정보가 없는 경우 '해당 사항 없음 (1차 평가 00월 진행 예정)'을 기재하거나, 훈련점수 입력 후 상단의 [AI로 종합소견 작성] 버튼을 클릭하세요."
                className="w-full text-xs leading-relaxed p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              {isGeneratingTrainingAi && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-2xl flex items-center justify-center gap-2 text-indigo-950 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>직업적응훈련 5대 영역 평가 결과를 분석하여 AI 종합소견을 작성하고 있습니다...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3-5: 전공훈련 프로그램 평가 사항 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                3-5. 전공훈련 프로그램 {formData.termType === '2차' ? '비교 평가 사항' : '평가 사항 (상반기)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                소속 반별 전공과목(AI전자작가, AI샌드아트, 미술 등)의 {formData.termType === '2차' ? '상·하반기' : '상반기'} 평가 결과를 입력합니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleLoadPreviousYearEvaluation}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition-all flex items-center gap-1 shadow-xs"
                title={`직전년도(${formData.year - 1}년) 하반기 직업적응훈련 및 전공훈련 평가 점수를 불러옵니다.`}
              >
                <FolderSync className="h-3 w-3 text-amber-600" />
                직전년도({formData.year - 1}년) 점수 반영
              </button>
              <button
                type="button"
                onClick={handleAddMajorSubject}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> 과목 추가
              </button>
              <button
                type="button"
                onClick={handleApplyMajorSample}
                className="px-3 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-all flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-indigo-600" />
                표준 예시 적용
              </button>
              <button
                type="button"
                onClick={handleGenerateMajorWithAi}
                disabled={isGeneratingMajorAi}
                className="px-3 py-1 text-[11px] font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
              >
                {isGeneratingMajorAi ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    작성 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                    AI로 종합소견 작성
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Tables (Left 7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              {/* 상반기 Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="bg-blue-50/80 px-3 py-1.5 border-b border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    상반기 (1월~6월) 전공과목 평가
                  </span>
                  <span className="text-[10px] text-blue-600 font-normal">기준 배점 5.0점 만점</span>
                </div>
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-1.5 px-2 text-left pl-3">과목명</th>
                      <th className="py-1.5 px-2 w-28">환산점수 (5점 만점)</th>
                      <th className="py-1.5 px-2 w-28">100분율(%)</th>
                      <th className="py-1.5 px-2 w-12">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.majorCompareFirstHalf.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-1.5 px-2 text-left pl-3">
                          <input
                            type="text"
                            value={row.item}
                            onChange={(e) => {
                              handleUpdateMajorFirstHalf(idx, 'item', e.target.value);
                              handleUpdateMajorSecondHalf(idx, 'item', e.target.value);
                            }}
                            className="w-full p-1 font-semibold text-slate-800 bg-transparent border-b border-slate-300 focus:border-indigo-500 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={row.convertedScore === 0 ? '' : (typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore)}
                            onChange={(e) => {
                              const val = e.target.value;
                              const score = val === '' ? 0 : parseFloat(val);
                              const safeScore = isNaN(score) ? 0 : Number(Math.min(5, Math.max(0, score)).toFixed(1));
                              const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                              handleUpdateMajorFirstHalf(idx, 'convertedScore', safeScore);
                              handleUpdateMajorFirstHalf(idx, 'percentage', pct);
                            }}
                            placeholder="0.0"
                            className="w-20 p-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.percentage}
                              onChange={(e) => handleUpdateMajorFirstHalf(idx, 'percentage', Number(e.target.value))}
                              className="w-16 p-1 text-center font-mono font-black text-blue-600 bg-blue-50/50 border border-blue-200 rounded-lg text-xs"
                            />
                            <span className="text-slate-400 text-[10px]">%</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2">
                          {formData.majorCompareFirstHalf.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMajorSubject(idx)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 하반기 Table (2차 계획서일 때만 표시) */}
              {formData.termType === '2차' && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <div className="bg-rose-50/80 px-3 py-1.5 border-b border-rose-100 flex items-center justify-between text-xs font-bold text-rose-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      하반기 (7월~12월) 전공과목 평가
                    </span>
                    <span className="text-[10px] text-rose-600 font-normal">기준 배점 5.0점 만점</span>
                  </div>
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-1.5 px-2 text-left pl-3">과목명</th>
                        <th className="py-1.5 px-2 w-28">환산점수 (5점 만점)</th>
                        <th className="py-1.5 px-2 w-28">100분율(%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.majorCompareSecondHalf.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-1.5 px-2 text-left pl-3 font-semibold text-slate-800">
                            {row.item}
                          </td>
                          <td className="py-1.5 px-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={row.convertedScore === 0 ? '' : (typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore)}
                              onChange={(e) => {
                                const val = e.target.value;
                                const score = val === '' ? 0 : parseFloat(val);
                                const safeScore = isNaN(score) ? 0 : Number(Math.min(5, Math.max(0, score)).toFixed(1));
                                const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                                handleUpdateMajorSecondHalf(idx, 'convertedScore', safeScore);
                                handleUpdateMajorSecondHalf(idx, 'percentage', pct);
                              }}
                              placeholder="0.0"
                              className="w-20 p-1 text-center font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-1.5 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={row.percentage}
                                onChange={(e) => handleUpdateMajorSecondHalf(idx, 'percentage', Number(e.target.value))}
                                className="w-16 p-1 text-center font-mono font-black text-rose-600 bg-rose-50/50 border border-rose-200 rounded-lg text-xs"
                              />
                              <span className="text-slate-400 text-[10px]">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Compare Live Chart (Right 5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-full min-h-[300px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                <span className="text-xs font-black text-slate-800">
                  {formData.termType === '2차' ? '전공 비교 차트' : '상반기 전공 성취율 차트'}
                </span>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span> 상반기
                  </span>
                  {formData.termType === '2차' && (
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="w-2.5 h-2.5 bg-rose-400 rounded-sm"></span> 하반기
                    </span>
                  )}
                </div>
              </div>

              <div className="relative flex-1 flex flex-col justify-between pt-4 pb-1 px-2 min-h-[220px]">
                <div className="absolute inset-x-2 top-4 bottom-8 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">100%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">75%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">50%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">25%</div>
                  <div className="w-full border-t border-slate-400 text-[9px] text-right font-mono">0%</div>
                </div>

                <div className="flex-1 flex items-end justify-between w-full z-10 pb-1">
                  {formData.majorCompareFirstHalf.map((item, idx) => {
                    const firstP = item.percentage || 0;
                    const secondP = formData.majorCompareSecondHalf[idx]?.percentage || 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full px-1">
                        <div className="flex-1 flex items-end justify-center gap-1.5 w-full pb-1">
                          <div
                            className="w-4 bg-blue-500 rounded-t-sm shadow-xs transition-all duration-300 relative group"
                            style={{ height: `${Math.max(4, firstP)}%` }}
                          >
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                              {firstP}%
                            </span>
                          </div>
                          {formData.termType === '2차' && (
                            <div
                              className="w-4 bg-rose-400 rounded-t-sm shadow-xs transition-all duration-300 relative group"
                              style={{ height: `${Math.max(4, secondP)}%` }}
                            >
                              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-700 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                {secondP}%
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 mt-1 text-center truncate max-w-[55px] shrink-0" title={item.item}>
                          {item.item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                3-5 전공훈련 종합 소견 및 평가 비고 - 수기작성란
              </label>
              {majorAiSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  AI 소견 작성 완료
                </span>
              )}
            </div>

            {/* Quick Template Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[11px] font-bold text-slate-500">빠른 문구 입력:</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, majorCompareNotes: '○ 해당 사항 없음 (1차 평가 6월 진행 예정)' }))}
                className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                해당 사항 없음 (6월 진행 예정)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, majorCompareNotes: '○ 해당 사항 없음 (1차 평가 7월 진행 예정)' }))}
                className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                해당 사항 없음 (7월 진행 예정)
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = prompt('1차 전공훈련평가 진행 예정 월을 입력하세요 (예: 6, 7):', '6');
                  if (m !== null && m.trim() !== '') {
                    setFormData(prev => ({ ...prev, majorCompareNotes: `○ 해당 사항 없음 (1차 평가 ${m.trim()}월 진행 예정)` }));
                  }
                }}
                className="text-[11px] font-medium px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors flex items-center gap-1"
              >
                ✏️ 진행 예정 월 직접 입력...
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={formData.majorCompareNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, majorCompareNotes: e.target.value }))}
                placeholder="○ 직전년도 하반기 정보가 없는 경우 '해당 사항 없음 (1차 평가 00월 진행 예정)'을 기재하거나, 전공과목별 실무 과제 완수 및 평가 점수 입력 후 상단의 [AI로 종합소견 작성] 버튼을 클릭하세요."
                className="w-full text-xs leading-relaxed p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              {isGeneratingMajorAi && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-2xl flex items-center justify-center gap-2 text-indigo-950 font-bold text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>전공과목별 평가 결과를 분석하여 AI 종합소견을 작성하고 있습니다...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: 방향 및 장기목표 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            4. 방향 및 목표 (장기목표)
          </h2>
          <div>
            <input
              type="text"
              value={formData.longTermGoal}
              onChange={(e) => setFormData(prev => ({ ...prev, longTermGoal: e.target.value }))}
              className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* SECTION 5-1: 교육역량강화 단기목표 계획 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                5-1. 교육역량강화 단기목표 계획 (취약영역 맞춤 서비스 반영)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                4대 고정 목표 및 평가방법에 맞춰 훈련생별 목표 점수·달성 기준(수기작성)과 서비스 내용을 설정합니다.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-slate-500">일괄 기간설정:</span>
              <button
                type="button"
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  handleApplyAllEducationPeriods(`'${String(currentYear).slice(-2)}. 2. ~ 7.\n(6개월)`);
                }}
                className="text-[11px] px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors"
              >
                상반기(6개월) 일괄적용
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  handleApplyAllEducationPeriods(`'${String(currentYear).slice(-2)}. 2. ~ '${String(currentYear + 1).slice(-2)}. 1.\n(12개월)`);
                }}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
              >
                1년(12개월) 일괄적용
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.educationGoals.map((goal, idx) => {
              const fixedConfigs = [
                { title: '직업준비도 향상', method: '평가방법: ERS', defaultTarget: '78점 -> 83점', placeholder: '78점 -> 83점' },
                { title: '작업능력 증진', method: '평가방법: 퍼듀펙보드', defaultTarget: '조립영역 평균 달성', placeholder: '조립영역 평균 달성' },
                { title: '직무적응력 형성', method: '평가방법: 모니터링 평가표', defaultTarget: '평균 3점 이상', placeholder: '평균 3점 이상' },
                { title: '직무기술 습득', method: '평가방법: 전공훈련 평가표', defaultTarget: '평균 3점 이상', placeholder: '평균 3점 이상' }
              ];
              const cfg = fixedConfigs[idx] || {
                title: goal.goalTitle.split('\n')[0] || '단기목표',
                method: '평가방법',
                defaultTarget: '목표 달성',
                placeholder: '목표치 입력'
              };

              // Extract current target in parenthesis or after method
              const match = goal.goalTitle.match(/\(([^)]+)\)/);
              const currentTarget = match ? match[1] : (goal.goalTitle.split('\n')[2]?.replace(/[()]/g, '') || cfg.defaultTarget);

              const handleTargetChange = (val: string) => {
                const formatted = `${cfg.title}\n${cfg.method}\n(${val})`;
                handleUpdateEducationGoal(idx, 'goalTitle', formatted);
              };

              return (
                <div key={goal.id || idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* 단기목표 (고정값 + 수기작성 목표칸) */}
                    <div className="lg:col-span-3 space-y-2">
                      <label className="block text-[11px] font-bold text-slate-600">
                        단기목표 <span className="text-indigo-600">(고정 항목 & 목표 설정)</span>
                      </label>
                      
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                        {/* 고정값 1: 목표 영역 */}
                        <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 bg-slate-100/70 px-2.5 py-1 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          <span>{cfg.title}</span>
                        </div>
                        
                        {/* 고정값 2: 평가방법 */}
                        <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                          {cfg.method}
                        </div>

                        {/* 수기작성: 목표치/점수 */}
                        <div className="space-y-1 pt-1">
                          <label className="block text-[10px] font-bold text-slate-500">
                            목표 점수 / 달성 기준 (수기작성)
                          </label>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-black text-xs">(</span>
                            <input
                              type="text"
                              value={currentTarget}
                              onChange={(e) => handleTargetChange(e.target.value)}
                              placeholder={cfg.placeholder}
                              className="w-full text-xs font-bold p-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-amber-950 focus:ring-1 focus:ring-amber-500 placeholder:text-amber-300"
                            />
                            <span className="text-slate-400 font-black text-xs">)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 서비스 제공기간 (연도/월 선택 및 개월수 자동계산) */}
                    <div className="lg:col-span-4">
                      <PeriodRangePicker
                        value={goal.period}
                        onChange={(newVal) => handleUpdateEducationGoal(idx, 'period', newVal)}
                      />
                    </div>

                    {/* 서비스 내용 및 수행방법 */}
                    <div className="lg:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">서비스 내용 및 수행방법</label>
                      <textarea
                        rows={6}
                        value={goal.serviceContent}
                        onChange={(e) => handleUpdateEducationGoal(idx, 'serviceContent', e.target.value)}
                        className="w-full text-xs leading-relaxed p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* 담당자 및 수행달성여부 */}
                    <div className="lg:col-span-2 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">담당자</label>
                        <input
                          type="text"
                          value={goal.evaluator}
                          onChange={(e) => handleUpdateEducationGoal(idx, 'evaluator', e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl text-center focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">수행달성여부</label>
                        <select
                          value={goal.status}
                          onChange={(e) => handleUpdateEducationGoal(idx, 'status', e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl text-center focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="진행 예정">진행 예정</option>
                          <option value="진행중">진행중</option>
                          <option value="달성">달성</option>
                          <option value="미달성">미달성</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5-2: 개인역량강화 단기목표 계획 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                5-2. 개인역량강화 단기목표 계획
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                버튼을 눌러 단기목표를 자유롭게 추가하거나 삭제하여 훈련생별 맞춤 계획을 수립합니다.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handleAddPersonalGoal}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                단기목표 추가
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <span className="text-[11px] font-bold text-slate-500">일괄 기간:</span>
              <button
                type="button"
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  handleApplyAllPersonalPeriods(`'${String(currentYear).slice(-2)}. 2. ~ 7.\n(6개월)`);
                }}
                className="text-[11px] px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-colors"
              >
                상반기(6개월)
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  handleApplyAllPersonalPeriods(`'${String(currentYear).slice(-2)}. 2. ~ '${String(currentYear + 1).slice(-2)}. 1.\n(12개월)`);
                }}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
              >
                1년(12개월)
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.personalGoals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <p className="text-xs text-slate-500 font-medium">등록된 개인역량강화 단기목표가 없습니다.</p>
                <button
                  type="button"
                  onClick={handleAddPersonalGoal}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  첫 번째 단기목표 추가
                </button>
              </div>
            ) : (
              formData.personalGoals.map((goal, idx) => (
                <div key={goal.id || idx} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      단기목표 #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeletePersonalGoal(idx)}
                      className="px-2 py-0.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                      title="단기목표 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                    {/* 단기목표 */}
                    <div className="lg:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">단기목표명</label>
                      <input
                        type="text"
                        value={goal.goalTitle}
                        onChange={(e) => handleUpdatePersonalGoal(idx, 'goalTitle', e.target.value)}
                        placeholder="예: 일상생활 자립 기술 습득"
                        className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* 서비스 제공기간 (연도/월 선택 및 개월수 자동계산) */}
                    <div className="lg:col-span-4">
                      <PeriodRangePicker
                        value={goal.period}
                        onChange={(newVal) => handleUpdatePersonalGoal(idx, 'period', newVal)}
                      />
                    </div>

                    {/* 서비스 내용 및 수행방법 */}
                    <div className="lg:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">서비스 내용 및 수행방법</label>
                      <textarea
                        rows={4}
                        value={goal.serviceContent}
                        onChange={(e) => handleUpdatePersonalGoal(idx, 'serviceContent', e.target.value)}
                        className="w-full text-xs leading-relaxed p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* 담당자 및 수행달성여부 */}
                    <div className="lg:col-span-2 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">담당자</label>
                        <input
                          type="text"
                          value={goal.evaluator}
                          onChange={(e) => handleUpdatePersonalGoal(idx, 'evaluator', e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl text-center focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">수행달성여부</label>
                        <select
                          value={goal.status}
                          onChange={(e) => handleUpdatePersonalGoal(idx, 'status', e.target.value)}
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl text-center focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="진행 예정">진행 예정</option>
                          <option value="진행중">진행중</option>
                          <option value="달성">달성</option>
                          <option value="미달성">미달성</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 8: 지원계획회의 및 서명 정보 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            8. 지원계획회의(사례회의) 및 서명 확인 정보
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 회의 일시 (달력 선택 지원) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  회의 일시
                </label>
                <span className="text-[10px] text-slate-400 font-medium">달력 선택 지원</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={parseToIsoDate(formData.caseConferenceDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({
                        ...prev,
                        caseConferenceDate: formatToDotDate(e.target.value)
                      }));
                    }
                  }}
                  className="w-10 text-xs p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl cursor-pointer transition-colors shrink-0"
                  title="달력에서 날짜 선택"
                />
                <input
                  type="text"
                  value={formData.caseConferenceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, caseConferenceDate: e.target.value }))}
                  placeholder="2026. 2. 2."
                  className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const todayIso = new Date().toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, caseConferenceDate: formatToDotDate(todayIso) }));
                  }}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md font-semibold"
                >
                  오늘 날짜로 설정
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">사례회의 주요내용</label>
              <input
                type="text"
                value={formData.caseConferenceContent}
                onChange={(e) => setFormData(prev => ({ ...prev, caseConferenceContent: e.target.value }))}
                placeholder="- 상황평가 내용 공유 및 직업적응훈련반 선정 여부 논의"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">비고 (선정기간 등)</label>
              <input
                type="text"
                value={formData.caseConferenceNote}
                onChange={(e) => setFormData(prev => ({ ...prev, caseConferenceNote: e.target.value }))}
                placeholder="직업적응훈련반 이용 선정 (26년 2월 ~ 30년 2월)"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            {/* 계획서 수립일자 (달력 선택 지원) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  계획서 수립일자
                </label>
                <span className="text-[10px] text-slate-400 font-medium">달력 선택 지원</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={parseToIsoDate(formData.planDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({
                        ...prev,
                        planDate: formatToKoreanDate(e.target.value)
                      }));
                    }
                  }}
                  className="w-10 text-xs p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl cursor-pointer transition-colors shrink-0"
                  title="달력에서 날짜 선택"
                />
                <input
                  type="text"
                  value={formData.planDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, planDate: e.target.value }))}
                  placeholder="2026년 2월 6일"
                  className="w-full text-xs font-black text-indigo-900 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const todayIso = new Date().toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, planDate: formatToKoreanDate(todayIso) }));
                  }}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md font-semibold"
                >
                  오늘 날짜로 설정
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">당사자 성명</label>
              <input
                type="text"
                value={formData.clientSignName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientSignName: e.target.value }))}
                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">담당자 성명</label>
              <input
                type="text"
                value={formData.evaluatorName}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluatorName: e.target.value }))}
                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onPreview(formData)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            양식 미리보기
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            개별화서비스계획서 저장
          </button>
        </div>

      </form>
    </div>
  );
}
