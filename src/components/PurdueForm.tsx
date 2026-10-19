/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, PurdueTest } from '../types';
import { PURDUE_NORMS, PURDUE_NORMS_BY_TYPE } from '../data/assessmentData';
import { Activity, ClipboardList, Info, CheckCircle } from 'lucide-react';

interface PurdueFormProps {
  client: Client;
  onSave: (test: Omit<PurdueTest, 'id' | 'clientId'>) => void;
  onCancel: () => void;
  initialTest?: PurdueTest | null;
}

export default function PurdueForm({
  client,
  onSave,
  onCancel,
  initialTest,
}: PurdueFormProps) {
  const [rightHandTrials, setRightHandTrials] = useState<number[]>(() => {
    if (initialTest) {
      return initialTest.rightHandTrials || [initialTest.rightHand, initialTest.rightHand, initialTest.rightHand];
    }
    return [15, 15, 15];
  });
  const [leftHandTrials, setLeftHandTrials] = useState<number[]>(() => {
    if (initialTest) {
      return initialTest.leftHandTrials || [initialTest.leftHand, initialTest.leftHand, initialTest.leftHand];
    }
    return [14, 14, 14];
  });
  const [bothHandsTrials, setBothHandsTrials] = useState<number[]>(() => {
    if (initialTest) {
      return initialTest.bothHandsTrials || [initialTest.bothHands, initialTest.bothHands, initialTest.bothHands];
    }
    return [12, 12, 12];
  });
  const [assemblyTrials, setAssemblyTrials] = useState<number[]>(() => {
    if (initialTest) {
      return initialTest.assemblyTrials || [initialTest.assembly, initialTest.assembly, initialTest.assembly];
    }
    return [35, 35, 35];
  });

  const [notes, setNotes] = useState<string>(initialTest ? initialTest.notes : '');
  const [evaluatorName, setEvaluuatorName] = useState<string>(initialTest ? initialTest.evaluatorName : '');
  const [testDate, setTestDate] = useState<string>(initialTest ? initialTest.testDate : new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState<number>(() => {
    if (initialTest && initialTest.year) return initialTest.year;
    return new Date().getFullYear();
  });
  const [round, setRound] = useState<'1차' | '2차' | '상시'>(() => {
    if (initialTest && initialTest.round) return initialTest.round;
    const m = new Date().getMonth() + 1;
    return m >= 6 ? '2차' : '1차';
  });
  const [normType, setNormType] = useState<'비장애인' | '지적장애인' | '지원고용' | '보호고용'>(() => {
    if (initialTest && initialTest.normType) return initialTest.normType;
    return '지원고용';
  });

  const calculateAverage = (trials: number[]) => {
    if (trials.length === 0) return 0;
    const sum = trials.reduce((a, b) => a + b, 0);
    return Number((sum / trials.length).toFixed(2));
  };

  useEffect(() => {
    if (initialTest) {
      setRightHandTrials(initialTest.rightHandTrials || [initialTest.rightHand, initialTest.rightHand, initialTest.rightHand]);
      setLeftHandTrials(initialTest.leftHandTrials || [initialTest.leftHand, initialTest.leftHand, initialTest.leftHand]);
      setBothHandsTrials(initialTest.bothHandsTrials || [initialTest.bothHands, initialTest.bothHands, initialTest.bothHands]);
      setAssemblyTrials(initialTest.assemblyTrials || [initialTest.assembly, initialTest.assembly, initialTest.assembly]);
      setNotes(initialTest.notes);
      setEvaluuatorName(initialTest.evaluatorName);
      setTestDate(initialTest.testDate);
      if (initialTest.year) setYear(initialTest.year);
      if (initialTest.round) setRound(initialTest.round);
      setNormType(initialTest.normType || '지원고용');
    }
  }, [initialTest]);

  const handleDateChange = (newDate: string) => {
    setTestDate(newDate);
    const parsedYear = parseInt(newDate.split('-')[0], 10);
    if (!isNaN(parsedYear)) setYear(parsedYear);
    const parsedMonth = parseInt(newDate.split('-')[1], 10);
    if (!isNaN(parsedMonth)) {
      setRound(parsedMonth >= 6 ? '2차' : '1차');
    }
  };

  const currentNorms = PURDUE_NORMS_BY_TYPE[normType];
  const currentRightMean = client.handDominance === 'L' ? currentNorms.leftHand.mean : currentNorms.rightHand.mean;
  const currentLeftMean = client.handDominance === 'L' ? currentNorms.rightHand.mean : currentLeftMeanDefault(currentNorms);
  const currentBothMean = currentNorms.bothHands.mean;
  const currentAssemblyMean = currentNorms.assembly.mean;

  function currentLeftMeanDefault(norms: typeof currentNorms) {
    return norms.leftHand.mean;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      testDate,
      year,
      round,
      rightHand: calculateAverage(rightHandTrials),
      leftHand: calculateAverage(leftHandTrials),
      bothHands: calculateAverage(bothHandsTrials),
      assembly: calculateAverage(assemblyTrials),
      notes,
      evaluatorName,
      rightHandTrials,
      leftHandTrials,
      bothHandsTrials,
      assemblyTrials,
      normType,
    });
  };

  return (
    <form id="purdue-assessment-form" onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
      <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600 animate-pulse" />
            퍼듀펙보드(Purdue Pegboard) 검사 입력
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {client.name}님 ({client.gender === 'M' ? '남성' : '여성'} / 우세손: {client.handDominance === 'R' ? '오른손' : client.handDominance === 'L' ? '왼손' : '양손잡이'}) 의 세부 항목 점수를 기록합니다.
          </p>
        </div>
      </div>
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start text-xs text-indigo-900">
        <Info className="h-4.5 w-4.5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold text-indigo-800 block mb-1">
            선택된 평가 기준형: <span className="text-indigo-600 underline font-black font-sans">{normType} 기준</span>
          </span>
          <p className="leading-relaxed text-slate-750">
            우세손 평균: <span className="font-bold text-indigo-950 font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100">{currentNorms.rightHand.mean}개</span> |
            비우세손 평균: <span className="font-bold text-indigo-950 font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100">{currentNorms.leftHand.mean}개</span> |
            양손 평균: <span className="font-bold text-indigo-950 font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100">{currentNorms.bothHands.mean}개</span> |
            합산 평균: <span className="font-bold text-indigo-950 font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100">{currentNorms.sumRLB.mean}개</span> |
            조립 평균: <span className="font-bold text-indigo-950 font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-100">{currentNorms.assembly.mean}개</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1.5">
            * 핀 꽂기 검사는 각 30초, 조립(Assembly) 검사는 60초 제한 규정 시간 동안의 정량적 성공 횟수를 개별 기입합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <label htmlFor="test-date-picker" className="block text-xs font-bold text-slate-700 mb-1.5">검사 시행일 *</label>
          <input
            id="test-date-picker"
            type="date"
            required
            value={testDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-white"
          />
        </div>
        <div>
          <label htmlFor="test-round-select" className="block text-xs font-bold text-slate-700 mb-1.5">평가 회차(차수) *</label>
          <select
            id="test-round-select"
            value={round}
            onChange={(e) => setRound(e.target.value as '1차' | '2차' | '상시')}
            className="w-full text-sm px-3 py-2 border border-slate-200 cursor-pointer rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-indigo-700"
          >
            <option value="1차">1차 (연초 / 상반기 계획용)</option>
            <option value="2차">2차 (6~8월 중간평가 / 하반기용)</option>
            <option value="상시">상시 (수시 평가)</option>
          </select>
        </div>
        <div>
          <label htmlFor="evaluator-name-input" className="block text-xs font-bold text-slate-700 mb-1.5">담당 평가자</label>
          <input
            id="evaluator-name-input"
            type="text"
            placeholder="예: 홍길동 직업재활사"
            value={evaluatorName}
            onChange={(e) => setEvaluuatorName(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-white"
          />
        </div>
        <div>
          <label htmlFor="norm-type-select" className="block text-xs font-bold text-slate-700 mb-1.5">평가 기준유형 *</label>
          <select
            id="norm-type-select"
            value={normType}
            onChange={(e) => setNormType(e.target.value as '비장애인' | '지적장애인' | '지원고용' | '보호고용')}
            className="w-full text-sm px-3 py-2 border border-slate-200 cursor-pointer rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-705"
          >
            <option value="비장애인">비장애인 기준</option>
            <option value="지적장애인">지적장애인 기준</option>
            <option value="지원고용">지원고용 기준</option>
            <option value="보호고용">보호고용 기준</option>
          </select>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">검사 회차별 점수 입력 (3회 측정 평균 자동 산출)</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Right Hand */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-150 pb-2">
              <label className="font-bold text-slate-800">
                오른손 (Right Hand, 30초) {client.handDominance === 'L' ? '[비우세손]' : '[우세손]'}
              </label>
              <span className="text-slate-500 font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 border border-slate-200 rounded">평균: {currentRightMean}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-[10px] text-slate-500 font-bold text-center">{idx + 1}차</span>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={rightHandTrials[idx] !== undefined ? rightHandTrials[idx] : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        const newTrials = [...rightHandTrials];
                        newTrials[idx] = val;
                        setRightHandTrials(newTrials);
                      }}
                      className="w-full text-sm font-bold font-mono py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                    <span className="absolute right-1 bottom-1 text-[8px] text-slate-450">개</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-indigo-50/50 rounded-lg p-2 text-xs border border-indigo-100/50 mt-1">
              <span className="font-semibold text-indigo-750">3회 평균 산출값:</span>
              <span className="font-extrabold text-indigo-900 font-mono text-xs bg-white border border-indigo-200 rounded-md px-2 py-0.5">
                {calculateAverage(rightHandTrials)} 개
              </span>
            </div>
          </div>

          {/* Left Hand */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-150 pb-2">
              <label className="font-bold text-slate-800">
                왼손 (Left Hand, 30초) {client.handDominance === 'L' ? '[우세손]' : '[비우세손]'}
              </label>
              <span className="text-slate-500 font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 border border-slate-200 rounded">평균: {currentLeftMean}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-[10px] text-slate-500 font-bold text-center">{idx + 1}차</span>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={leftHandTrials[idx] !== undefined ? leftHandTrials[idx] : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        const newTrials = [...leftHandTrials];
                        newTrials[idx] = val;
                        setLeftHandTrials(newTrials);
                      }}
                      className="w-full text-sm font-bold font-mono py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                    <span className="absolute right-1 bottom-1 text-[8px] text-slate-450">개</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-indigo-50/50 rounded-lg p-2 text-xs border border-indigo-100/50 mt-1">
              <span className="font-semibold text-indigo-750">3회 평균 산출값:</span>
              <span className="font-extrabold text-indigo-900 font-mono text-xs bg-white border border-indigo-200 rounded-md px-2 py-0.5">
                {calculateAverage(leftHandTrials)} 개
              </span>
            </div>
          </div>

          {/* Both Hands */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-150 pb-2">
              <label className="font-bold text-slate-800">양손 (Both Hands, 30초)</label>
              <span className="text-slate-500 font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 border border-slate-200 rounded">평균: {currentBothMean}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-[10px] text-slate-500 font-bold text-center">{idx + 1}차</span>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={bothHandsTrials[idx] !== undefined ? bothHandsTrials[idx] : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        const newTrials = [...bothHandsTrials];
                        newTrials[idx] = val;
                        setBothHandsTrials(newTrials);
                      }}
                      className="w-full text-sm font-bold font-mono py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                    <span className="absolute right-1 bottom-1 text-[8px] text-slate-450">개</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-indigo-50/50 rounded-lg p-2 text-xs border border-indigo-100/50 mt-1">
              <span className="font-semibold text-indigo-750">3회 평균 산출값:</span>
              <span className="font-extrabold text-indigo-900 font-mono text-xs bg-white border border-indigo-200 rounded-md px-2 py-0.5">
                {calculateAverage(bothHandsTrials)} 개
              </span>
            </div>
          </div>

          {/* Assembly */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs border-b border-slate-150 pb-2">
              <label className="font-bold text-slate-800">조립 (Assembly, 60초)</label>
              <span className="text-slate-500 font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 border border-slate-200 rounded">평균: {currentAssemblyMean}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block text-[10px] text-slate-500 font-bold text-center">{idx + 1}차</span>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={assemblyTrials[idx] !== undefined ? assemblyTrials[idx] : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        const newTrials = [...assemblyTrials];
                        newTrials[idx] = val;
                        setAssemblyTrials(newTrials);
                      }}
                      className="w-full text-sm font-bold font-mono py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                    <span className="absolute right-1 bottom-1 text-[8px] text-slate-450">개</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-indigo-50/50 rounded-lg p-2 text-xs border border-indigo-100/50 mt-1">
              <span className="font-semibold text-indigo-750">3회 평균 산출값:</span>
              <span className="font-extrabold text-indigo-900 font-mono text-xs bg-white border border-indigo-200 rounded-md px-2 py-0.5">
                {calculateAverage(assemblyTrials)} 개
              </span>
            </div>
          </div>
        </div>

        {/* Calculated RLB preview */}
        <div id="rlb-preview-card" className="mt-5 bg-indigo-50 border border-dashed border-indigo-200 rounded-xl p-3.5 flex justify-between items-center text-xs text-indigo-800 shadow-sm">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            최종 합산점수 자동 계산 (R + L + B Sum Average):
          </span>
          <span className="font-extrabold font-mono text-sm bg-indigo-100 rounded-md px-3 py-1 text-indigo-700">
            {Number((
              calculateAverage(rightHandTrials) +
              calculateAverage(leftHandTrials) +
              calculateAverage(bothHandsTrials)
            ).toFixed(2))} 개
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="purdue-form-memo" className="block text-xs font-bold text-slate-700">평가자 관찰 메모 및 특이사항 (짧게 기입)</label>
          <span className="text-[10px] text-indigo-600 font-semibold">💡 종합 분석 소견 및 권장사항은 결과지 내 AI 분석으로 자동 구성됩니다.</span>
        </div>
        <textarea
          id="purdue-form-memo"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="평가 중 수행 특이사항, 태도 등 간단한 비고를 짧게 기재하십시오 (예: 왼손 과제 진행 중 다공성 마찰 등)..."
          rows={2}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          id="cancel-purdue-form"
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors"
        >
          취소
        </button>
        <button
          id="save-purdue-form"
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <CheckCircle className="h-4 w-4" />
          {initialTest ? '점수 수정 업데이트' : '검사 결과 저장'}
        </button>
      </div>
    </form>
  );
}
