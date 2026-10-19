/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, ERSTest } from '../types';
import { ERS_QUESTIONS, analyzeErsTest } from '../data/assessmentData';
import { Award, CheckCircle, ClipboardCheck } from 'lucide-react';

interface ERSFormProps {
  client: Client;
  onSave: (test: Omit<ERSTest, 'id' | 'clientId'>) => void;
  onCancel: () => void;
  initialTest?: ERSTest | null;
}

export default function ERSForm({
  client,
  onSave,
  onCancel,
  initialTest,
}: ERSFormProps) {
  // ERS is now unified as vocational_ers
  const selectedType = 'vocational_ers';
  const questions = ERS_QUESTIONS;
  const maxScorePerQuestion = 4;

  // Initialize answers with 2 (다소 부족) as the average fallback
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>(() => {
    if (initialTest && initialTest.answers) {
      return initialTest.answers;
    }
    const defaultAnswers: { [qId: number]: number } = {};
    questions.forEach(q => {
      defaultAnswers[q.id] = 2;
    });
    return defaultAnswers;
  });

  const [notes, setNotes] = useState<string>(initialTest ? initialTest.notes : '');
  const [evaluatorName, setEvaluuatorName] = useState<string>(initialTest ? initialTest.evaluatorName : '수원시장애인종합복지관');
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

  useEffect(() => {
    if (initialTest) {
      setAnswers(initialTest.answers);
      setNotes(initialTest.notes);
      setEvaluuatorName(initialTest.evaluatorName);
      setTestDate(initialTest.testDate);
      if (initialTest.year) setYear(initialTest.year);
      if (initialTest.round) setRound(initialTest.round);
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

  const handleSelectAnswer = (qId: number, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: score
    }));
  };

  // Compute live scores
  const totalScore: number = Object.values(answers).reduce((sum: number, val: any) => sum + Number(val), 0) as number;
  const averageScore = parseFloat((totalScore / questions.length).toFixed(2));

  // Run unified ERS 48 analysis
  const analysis = analyzeErsTest(answers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      testDate,
      year,
      round,
      type: selectedType,
      answers,
      totalScore,
      averageScore,
      interpretation: analysis.description,
      notes,
      evaluatorName,
    });
  };

  return (
    <form id="ers-assessment-form" onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-3xl mx-auto space-y-6">
      <div className="flex border-b border-slate-100 pb-4 items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-indigo-600" />
            사회성 및 직업적응력 평가 (ERS) 입력
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {client.name} 훈련생의 7가지 영역별 63문항 평가를 진행하고 4점 평정 척도로 기록합니다.
          </p>
        </div>
      </div>

      {/* Info Details on Selected Test */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs font-sans">
        <div className="border-r border-slate-200 pr-2 col-span-1">
          <span className="text-slate-400 block font-semibold mb-1">총 평가 문항</span>
          <span className="text-slate-800 font-bold text-sm font-mono">{questions.length} 문항 (7대 영역)</span>
        </div>
        <div className="border-r border-slate-200 pr-2 col-span-1">
          <span className="text-slate-400 block font-semibold mb-1">합산 평정 점수</span>
          <span className="text-indigo-600 font-bold text-sm font-mono">{totalScore}점</span>
          <span className="text-slate-400 font-mono"> / 252점 만점 (평균 {averageScore}점)</span>
        </div>
        <div className="col-span-1">
          <span className="text-slate-400 block font-semibold mb-1">실시간 판정 수준</span>
          <span className={`font-bold border px-2 py-0.5 rounded text-[11px] inline-block mt-0.5 bg-indigo-50 text-indigo-700 border-indigo-100`}>
            {analysis.level}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div>
          <label htmlFor="ers-date" className="block text-xs font-bold text-slate-700 mb-1.5">평가 시행일 *</label>
          <input
            id="ers-date"
            type="date"
            required
            value={testDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
        </div>
        <div>
          <label htmlFor="ers-round-select" className="block text-xs font-bold text-slate-700 mb-1.5">평가 회차(차수) *</label>
          <select
            id="ers-round-select"
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
          <label htmlFor="ers-evaluator" className="block text-xs font-bold text-slate-700 mb-1.5">담당 평가자 *</label>
          <input
            id="ers-evaluator"
            type="text"
            required
            placeholder="수원시장애인종합복지관"
            value={evaluatorName}
            onChange={(e) => setEvaluuatorName(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Question Items list */}
      <div className="border-t border-slate-100 pt-5 space-y-4 max-h-[500px] overflow-y-auto pr-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-white py-1 flex justify-between">
          <span>평가 개별 평정 문항 (총 63개 질문지)</span>
          <span className="text-indigo-600 font-mono">척도 단위: 1점(고용어려움) ~ 4점(고용가능)</span>
        </h4>
        
        {questions.map((q, idx) => {
          const score = answers[q.id] || 2;
          return (
            <div id={`question-row-${q.id}`} key={q.id} className="p-4 bg-slate-50/40 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                  문항 {idx + 1}
                </span>
                <p className="text-sm font-medium text-slate-700 leading-relaxed mr-auto">
                  {q.text}
                </p>
                {q.subCategory && (
                  <span className="text-[10px] font-bold bg-indigo-100/60 text-indigo-700 border border-indigo-200/40 px-2.5 py-0.5 rounded-full shrink-0">
                    {q.subCategory}
                  </span>
                )}
              </div>

              {/* Likert Buttons Container (1 to 4) */}
              <div className="flex flex-wrap gap-1.5 justify-end">
                {[
                  { val: 1, label: "매우 부족" },
                  { val: 2, label: "다소 부족" },
                  { val: 3, label: "보통" },
                  { val: 4, label: "매우 잘함" }
                ].map((opt) => (
                  <button
                    id={`opt-emp-${q.id}-${opt.val}`}
                    key={opt.val}
                    type="button"
                    onClick={() => handleSelectAnswer(q.id, opt.val)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                      score === opt.val
                        ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {opt.val}점.{opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Realtime diagnostic preview */}
      <div id="diagnostic-conclusion" className={`border p-4 rounded-xl leading-relaxed space-y-1 bg-gradient-to-r text-xs transition-colors from-indigo-50/50 to-white border-indigo-100`}>
        <span className="font-bold flex items-center gap-1.5 text-slate-800">
          <Award className="h-4 w-4 text-indigo-600" />
          실시간 자동 평가 소견 ({analysis.level})
        </span>
        <p className="text-slate-600 mt-1">{analysis.description}</p>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="ers-notes" className="block text-xs font-bold text-slate-700">평가자 관찰 메모 및 특이사항 (짧게 기입)</label>
          <span className="text-[10px] text-indigo-600 font-semibold">💡 성향 영역 분석 및 직업훈련 추천 제언은 결과지 내 AI 분석으로 자동 구성됩니다.</span>
        </div>
        <textarea
          id="ers-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="평가 관찰 사항, 훈련생 건의 사항 및 특이 행동을 2~3줄 내외로 짧게 기재하십시오..."
          rows={2}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          id="cancel-ers-form"
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors"
        >
          취소
        </button>
        <button
          id="save-ers-form"
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <CheckCircle className="h-4 w-4" />
          {initialTest ? '평가 수정 완료' : '평가 결과 기록'}
        </button>
      </div>
    </form>
  );
}
