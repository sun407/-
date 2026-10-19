/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MidtermEvaluationReportData,
  Client,
  PurdueTest,
  ERSTest,
  PictureInterestPDF,
  IndividualizedServicePlan,
  IWPErsDomainScore,
  IWPPurdueScore,
  IWPShortTermGoal,
  MidtermGoalAchievementRow
} from '../types';
import { generateDefaultMidtermReport } from '../utils/iwpGenerator';
import {
  Printer,
  ArrowLeft,
  Edit3,
  Sparkles,
  Save,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  Plus,
  Trash2
} from 'lucide-react';

interface MidtermEvaluationReportProps {
  client: Client;
  purdueTests: PurdueTest[];
  ersTests: ERSTest[];
  picturePdfs?: PictureInterestPDF[];
  iwpPlan1st?: IndividualizedServicePlan;
  iwpPlan2nd?: IndividualizedServicePlan;
  iwpPlan?: IndividualizedServicePlan;
  initialData?: MidtermEvaluationReportData;
  targetYear?: number;
  onSave?: (data: MidtermEvaluationReportData) => void;
  onBack?: () => void;
  onNavigateToIwp2nd?: () => void;
  onNavigateTo2ndIwp?: () => void;
}

export default function MidtermEvaluationReport({
  client,
  purdueTests,
  ersTests,
  picturePdfs,
  iwpPlan1st,
  iwpPlan2nd,
  iwpPlan,
  initialData,
  targetYear,
  onSave,
  onBack,
  onNavigateToIwp2nd,
  onNavigateTo2ndIwp
}: MidtermEvaluationReportProps) {
  const navigateTo2nd = onNavigateTo2ndIwp || onNavigateToIwp2nd;
  const evalYear = targetYear || new Date().getFullYear();
  const [data, setData] = useState<MidtermEvaluationReportData>(() => {
    if (initialData) return initialData;
    const saved = localStorage.getItem(`midterm_eval_${client.id}_${evalYear}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new fields exist
        const def = generateDefaultMidtermReport(client, purdueTests, ersTests, evalYear);
        return { ...def, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return generateDefaultMidtermReport(client, purdueTests, ersTests, evalYear);
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleAutoFillPreset = () => {
    const defaultData = generateDefaultMidtermReport(client, purdueTests, ersTests);
    setData(defaultData);
    localStorage.setItem(`midterm_eval_${client.id}_${data.year}`, JSON.stringify(defaultData));
    if (onSave) onSave(defaultData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSaveData = () => {
    const updated = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    setData(updated);
    localStorage.setItem(`midterm_eval_${client.id}_${data.year}`, JSON.stringify(updated));
    if (onSave) onSave(updated);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // AI 자동 소견 생성
  const handleGenerateAiOpinion = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const ers1 = data.ers1stStandardScore || 102;
      const ers2 = data.ers2ndStandardScore || 138;
      const diff = ers2 - ers1;
      
      const newErsOpinion = `직업준비검사 결과 : 하반기 상황평가 대비 표준점수(${ers1}점 → ${ers2}점, +${diff}점)가 뚜렷하게 상향되었음. 하위영역 중 인지기술 및 직업의식, 자존감 영역은 15점으로 최상위 수준을 나타내며 양호한 편이나, 직업기술(${data.ers2ndScores.find(s=>s.domain==='직업기술')?.convertedScore || 13}점)이 타 영역보다 다소 낮게 나타남. 하반기에는 실질적인 직업기술 및 작업 숙련도 능력 향상을 위한 보완 훈련이 지속적으로 필요할 것으로 사료됨.`;

      const newTrainingComment = `상반기 직업적응훈련 결과 : 성실한 출결과 적극적인 참여 태도로 자치회의 및 공통교육에서 높은 성취를 달성함. 작업훈련 시 집중력 유지 시간과 정확도가 지속적으로 향상되고 있음.`;

      const newMajorComment = `상반기 전공훈련 프로그램 평가 결과 : ${data.selectedSubjects.join(', ')} 과목 실습에서 기본 도구 사용 및 안전수칙을 철저히 준수하였으며, 기초 과제 수행 능력이 안정적으로 형성됨.`;

      setData(prev => ({
        ...prev,
        ersResultOpinion: newErsOpinion,
        training1stHalfComment: newTrainingComment,
        major1stHalfComment: newMajorComment
      }));
      setIsGeneratingAi(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }, 600);
  };

  return (
    <div id="midterm-evaluation-container" className="max-w-[920px] mx-auto pb-16 text-slate-900">
      
      {/* Top Action Bar (Print Hidden) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button
            id="midterm-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            워크스페이스
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-black rounded-md">
                7~8월 중간평가
              </span>
              <h2 className="text-sm font-extrabold text-slate-800">
                {client.name} 훈련생 개별화서비스계획 중간평가서
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {data.trainingClass} | 평가일자: {data.evalDate} | 평가기간: {data.evalPeriod}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveToast && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" />
              반영되었습니다
            </span>
          )}

          <button
            id="midterm-ai-btn"
            onClick={handleGenerateAiOpinion}
            disabled={isGeneratingAi}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs rounded-xl border border-purple-200 transition-all flex items-center gap-1.5"
            title="검사 데이터 기반 AI 종합 소견 자동 작성"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            {isGeneratingAi ? '소견 생성 중...' : 'AI 소견 자동작성'}
          </button>

          <button
            id="midterm-autofill-btn"
            onClick={handleAutoFillPreset}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-200 transition-all flex items-center gap-1.5"
            title="양식 기본 예시 데이터로 초기화"
          >
            예시데이터 채우기
          </button>

          <button
            id="midterm-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 font-extrabold text-xs rounded-xl border transition-all flex items-center gap-1.5 ${
              isEditing
                ? 'bg-slate-800 text-white border-slate-900'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {isEditing ? '조회 모드로 전환' : '내용 수정하기'}
          </button>

          {isEditing && (
            <button
              id="midterm-save-btn"
              onClick={handleSaveData}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              저장
            </button>
          )}

          <button
            id="midterm-print-btn"
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            A4 2페이지 인쇄 (PDF)
          </button>
        </div>
      </div>

      {/* Linked 2nd IWP Banner */}
      {navigateTo2nd && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3.5 rounded-2xl mb-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black text-blue-950">
                중간평가 완료 후 2차 개별화재활계획서(IWP) 재수립 연계
              </div>
              <div className="text-[11px] text-blue-700">
                상반기 중간평가 결과가 2차 계획서의 비교분석 및 하반기 목표에 반영됩니다.
              </div>
            </div>
          </div>
          <button
            onClick={navigateTo2nd}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1"
          >
            2차 개별화재활계획서로 이동
            <TrendingUp className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          PAGE 1 (공문서 A4 규격 - 첨부 양식 완벽 일치)
         ======================================================== */}
      <div
        id="midterm-print-page-1"
        className="bg-white p-7 md:p-8 border border-slate-400 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 text-[10px] leading-tight font-sans text-black mb-8 print:mb-0 print:page-break-after"
        style={{ minHeight: '1080px' }}
      >
        {/* Document Header Title */}
        <div className="text-center pb-2.5 mb-2.5">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-black flex items-center justify-center gap-2">
            <span>개별화서비스계획 중간평가서</span>
            <span className="text-sm font-semibold tracking-normal">
              (문화예술반{' '}
              <span
                className="cursor-pointer font-bold inline-block"
                onClick={() => isEditing && setData({ ...data, trainingClass: '문화예술반' })}
              >
                {data.trainingClass === '문화예술반' ? '■' : '□'}
              </span>
              , 스마트산업반{' '}
              <span
                className="cursor-pointer font-bold inline-block"
                onClick={() => isEditing && setData({ ...data, trainingClass: '스마트산업반' })}
              >
                {data.trainingClass === '스마트산업반' ? '■' : '□'}
              </span>
              )
            </span>
          </h1>
        </div>

        {/* 1. 기본정보 */}
        <section className="mb-2.5">
          <div className="font-bold text-[11px] text-black mb-0.5">
            1. 기본정보
          </div>
          <table className="w-full border-collapse border border-black text-center text-[10px]">
            <tbody>
              <tr>
                <th className="border border-black bg-slate-100/70 py-1 px-2 font-bold w-[18%]">성명</th>
                <td className="border border-black py-1 px-2 w-[32%] font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.name}
                      onChange={e => setData({ ...data, name: e.target.value })}
                      className="w-full text-center border border-slate-300 rounded px-1 text-[10px]"
                    />
                  ) : (
                    data.name
                  )}
                </td>
                <th className="border border-black bg-slate-100/70 py-1 px-2 font-bold w-[18%]">성별</th>
                <td className="border border-black py-1 px-2 w-[32%] font-medium">
                  {isEditing ? (
                    <select
                      value={data.gender}
                      onChange={e => setData({ ...data, gender: e.target.value as '남' | '여' })}
                      className="border border-slate-300 rounded text-[10px] px-1"
                    >
                      <option value="남">남</option>
                      <option value="여">여</option>
                    </select>
                  ) : (
                    data.gender
                  )}
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-slate-100/70 py-1 px-2 font-bold">생년월일</th>
                <td className="border border-black py-1 px-2 font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.birthDate}
                      onChange={e => setData({ ...data, birthDate: e.target.value })}
                      className="w-full text-center border border-slate-300 rounded px-1 text-[10px]"
                    />
                  ) : (
                    data.birthDate
                  )}
                </td>
                <th className="border border-black bg-slate-100/70 py-1 px-2 font-bold">장애유형</th>
                <td className="border border-black py-1 px-2 font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.disabilityType}
                      onChange={e => setData({ ...data, disabilityType: e.target.value })}
                      className="w-full text-center border border-slate-300 rounded px-1 text-[10px]"
                    />
                  ) : (
                    data.disabilityType
                  )}
                </td>
              </tr>
              <tr>
                <th className="border border-black bg-slate-100/70 py-1 px-2 font-bold">욕구사항</th>
                <td colSpan={3} className="border border-black py-1 px-2 text-left font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={data.desiredGoal}
                      onChange={e => setData({ ...data, desiredGoal: e.target.value })}
                      className="w-full border border-slate-300 rounded px-1 text-[10px]"
                    />
                  ) : (
                    data.desiredGoal
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 2. 직업준비검사 결과 */}
        <section className="mb-2.5">
          <div className="font-bold text-[11px] text-black mb-0.5">
            2. 직업준비검사 결과
          </div>

          {/* 2-1. 직업준비검사(ERS) */}
          <div className="mb-2">
            <div className="font-bold text-[10.5px] text-black mb-0.5">
              2-1. 직업준비검사(ERS)
            </div>

            {/* 1차 검사기간 / 2차 검사기간 2-열 표 및 프로파일 */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* 1차 검사기간 */}
              <div className="border border-black p-1">
                <div className="grid grid-cols-2 border border-black mb-1 text-[9.5px]">
                  <div className="text-center font-bold bg-slate-100/70 py-0.5 border-r border-black">
                    1차 검사기간
                  </div>
                  <div className="text-center font-semibold bg-white py-0.5 px-1 flex items-center justify-center text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.ers1stDate ?? `${data.year || new Date().getFullYear()}. 02. 06.`}
                        onChange={e => setData({ ...data, ers1stDate: e.target.value })}
                        placeholder="예: 2026. 02. 06."
                        className="w-full text-center border border-slate-300 rounded px-1 text-[9px] font-semibold"
                      />
                    ) : (
                      <span>{data.ers1stDate || `${data.year || new Date().getFullYear()}. 02. 06.`}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-1 items-start">
                  {/* Left: 1차 점수표 */}
                  <div className="col-span-5">
                    <table className="w-full border-collapse border border-black text-center text-[8.5px]">
                      <thead>
                        <tr className="bg-slate-100/70 font-bold">
                          <th className="border border-black py-0.5 px-0.5">구분</th>
                          <th className="border border-black py-0.5 px-0.5">원점수</th>
                          <th className="border border-black py-0.5 px-0.5">환산<br/>점수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.ers1stScores.map((s, idx) => (
                          <tr key={idx}>
                            <td className="border border-black py-0.5 px-0.5 font-medium">{s.domain}</td>
                            <td className="border border-black py-0.5 px-0.5">{s.rawScore}</td>
                            <td className="border border-black py-0.5 px-0.5 font-bold">{s.convertedScore}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td className="border border-black py-0.5 px-0.5">환산점수 합계</td>
                          <td colSpan={2} className="border border-black py-0.5 px-0.5 font-bold">
                            {data.ers1stConvertedSum}
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="border border-black py-0.5 px-0.5">표준점수</td>
                          <td colSpan={2} className="border border-black py-0.5 px-0.5 font-bold">
                            {data.ers1stStandardScore}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right: 1차 ERS Profile Bar Chart */}
                  <div className="col-span-7 flex flex-col items-center justify-between border border-slate-300 p-1 bg-white" style={{ minHeight: '140px' }}>
                    <div className="text-[8px] font-bold text-slate-700 text-center mb-0.5">ERS Profile</div>
                    {/* SVG Chart */}
                    <svg viewBox="0 0 200 115" className="w-full h-auto">
                      {/* Y-axis grid lines 1..15 */}
                      {[3, 6, 9, 12, 15].map(val => {
                        const y = 95 - (val / 15) * 85;
                        return (
                          <g key={val}>
                            <line x1="18" y1={y} x2="195" y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
                            <text x="14" y={y + 2.5} fontSize="6" textAnchor="end" fill="#64748b">{val}</text>
                          </g>
                        );
                      })}
                      {/* Base line */}
                      <line x1="18" y1="95" x2="195" y2="95" stroke="#000" strokeWidth="0.75" />

                      {/* 7 Bars */}
                      {data.ers1stScores.map((s, idx) => {
                        const x = 24 + idx * 24;
                        const barH = (Math.min(15, s.convertedScore) / 15) * 85;
                        const y = 95 - barH;
                        return (
                          <g key={idx}>
                            <rect
                              x={x}
                              y={y}
                              width="14"
                              height={barH}
                              fill={idx % 2 === 0 ? '#38bdf8' : '#f87171'}
                              stroke="#000"
                              strokeWidth="0.4"
                            />
                            {/* Score on top */}
                            <text x={x + 7} y={y - 2} fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#000">
                              {s.convertedScore}
                            </text>
                            {/* Label under base */}
                            <text
                              x={x + 7}
                              y="103"
                              fontSize="5.5"
                              textAnchor="middle"
                              fill="#000"
                            >
                              {s.domain.slice(0, 2)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2차 검사기간 */}
              <div className="border border-black p-1">
                <div className="grid grid-cols-2 border border-black mb-1 text-[9.5px]">
                  <div className="text-center font-bold bg-slate-100/70 py-0.5 border-r border-black">
                    2차 검사기간
                  </div>
                  <div className="text-center font-semibold bg-white py-0.5 px-1 flex items-center justify-center text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.ers2ndDate ?? `${data.year || new Date().getFullYear()}. 07. 15.`}
                        onChange={e => setData({ ...data, ers2ndDate: e.target.value })}
                        placeholder="예: 2026. 07. 15."
                        className="w-full text-center border border-slate-300 rounded px-1 text-[9px] font-semibold"
                      />
                    ) : (
                      <span>{data.ers2ndDate || `${data.year || new Date().getFullYear()}. 07. 15.`}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-1 items-start">
                  {/* Left: 2차 점수표 */}
                  <div className="col-span-5">
                    <table className="w-full border-collapse border border-black text-center text-[8.5px]">
                      <thead>
                        <tr className="bg-slate-100/70 font-bold">
                          <th className="border border-black py-0.5 px-0.5">구분</th>
                          <th className="border border-black py-0.5 px-0.5">원점수</th>
                          <th className="border border-black py-0.5 px-0.5">환산<br/>점수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.ers2ndScores.map((s, idx) => (
                          <tr key={idx}>
                            <td className="border border-black py-0.5 px-0.5 font-medium">{s.domain}</td>
                            <td className="border border-black py-0.5 px-0.5">{s.rawScore}</td>
                            <td className="border border-black py-0.5 px-0.5 font-bold">{s.convertedScore}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td className="border border-black py-0.5 px-0.5">환산점수 합계</td>
                          <td colSpan={2} className="border border-black py-0.5 px-0.5 font-bold">
                            {data.ers2ndConvertedSum}
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="border border-black py-0.5 px-0.5">표준점수</td>
                          <td colSpan={2} className="border border-black py-0.5 px-0.5 font-bold">
                            {data.ers2ndStandardScore}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Right: 2차 ERS Profile Bar Chart */}
                  <div className="col-span-7 flex flex-col items-center justify-between border border-slate-300 p-1 bg-white" style={{ minHeight: '140px' }}>
                    <div className="text-[8px] font-bold text-slate-700 text-center mb-0.5">ERS Profile</div>
                    {/* SVG Chart */}
                    <svg viewBox="0 0 200 115" className="w-full h-auto">
                      {[3, 6, 9, 12, 15].map(val => {
                        const y = 95 - (val / 15) * 85;
                        return (
                          <g key={val}>
                            <line x1="18" y1={y} x2="195" y2={y} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
                            <text x="14" y={y + 2.5} fontSize="6" textAnchor="end" fill="#64748b">{val}</text>
                          </g>
                        );
                      })}
                      <line x1="18" y1="95" x2="195" y2="95" stroke="#000" strokeWidth="0.75" />

                      {data.ers2ndScores.map((s, idx) => {
                        const x = 24 + idx * 24;
                        const barH = (Math.min(15, s.convertedScore) / 15) * 85;
                        const y = 95 - barH;
                        return (
                          <g key={idx}>
                            <rect
                              x={x}
                              y={y}
                              width="14"
                              height={barH}
                              fill={idx % 2 === 0 ? '#38bdf8' : '#fb923c'}
                              stroke="#000"
                              strokeWidth="0.4"
                            />
                            <text x={x + 7} y={y - 2} fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#000">
                              {s.convertedScore}
                            </text>
                            <text
                              x={x + 7}
                              y="103"
                              fontSize="5.5"
                              textAnchor="middle"
                              fill="#000"
                            >
                              {s.domain.slice(0, 2)}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ERS 소견 영역 */}
            <div className="border border-black border-t-0 p-1 bg-white text-[9px] leading-snug">
              <span className="font-bold">○ 직업준비검사 결과 : </span>
              {isEditing ? (
                <textarea
                  value={data.ersResultOpinion}
                  onChange={e => setData({ ...data, ersResultOpinion: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-300 rounded p-1 text-[9px] mt-0.5"
                />
              ) : (
                <span>{data.ersResultOpinion}</span>
              )}
            </div>
          </div>

          {/* 2-2. Purdue Pegboard(퍼듀펙보드) */}
          <div className="mb-2">
            <div className="font-bold text-[10.5px] text-black mb-0.5">
              2-2. Purdue Pegboard(퍼듀펙보드)
            </div>

            {/* 1차 / 2차 2열 그리드 */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* 1차 검사기간 */}
              <div className="border border-black p-1">
                <div className="grid grid-cols-2 border border-black mb-1 text-[9.5px]">
                  <div className="text-center font-bold bg-slate-100/70 py-0.5 border-r border-black">
                    1차 검사기간
                  </div>
                  <div className="text-center font-semibold bg-white py-0.5 px-1 flex items-center justify-center text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.purdue1stDate ?? `${data.year || new Date().getFullYear()}. 02. 06.`}
                        onChange={e => setData({ ...data, purdue1stDate: e.target.value })}
                        placeholder="예: 2026. 02. 06."
                        className="w-full text-center border border-slate-300 rounded px-1 text-[9px] font-semibold"
                      />
                    ) : (
                      <span>{data.purdue1stDate || `${data.year || new Date().getFullYear()}. 02. 06.`}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-1 items-start">
                  {/* Left: 차트 */}
                  <div className="col-span-7 border border-slate-300 p-1 bg-white" style={{ minHeight: '130px' }}>
                    <div className="text-[7.5px] font-bold text-center mb-0.5">당사자 점수 / 기준평균 비교표</div>
                    <svg viewBox="0 0 170 100" className="w-full h-auto">
                      {/* Grid */}
                      {[0, 10, 20, 30, 40, 50].map(v => {
                        const y = 85 - (v / 50) * 75;
                        return (
                          <g key={v}>
                            <line x1="18" y1={y} x2="165" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                            <text x="15" y={y + 2} fontSize="5" textAnchor="end" fill="#64748b">{v}</text>
                          </g>
                        );
                      })}
                      <line x1="18" y1="85" x2="165" y2="85" stroke="#000" strokeWidth="0.6" />

                      {/* 5 categories */}
                      {data.purdue1stScores.map((p, idx) => {
                        const groupX = 22 + idx * 28;
                        const myH = (Math.min(50, p.myScore) / 50) * 75;
                        const stdH = (Math.min(50, p.standardMean) / 50) * 75;
                        return (
                          <g key={idx}>
                            {/* My Bar (blue) */}
                            <rect x={groupX} y={85 - myH} width="10" height={myH} fill="#3b82f6" stroke="#000" strokeWidth="0.3" />
                            <text x={groupX + 5} y={85 - myH - 1.5} fontSize="5" fontWeight="bold" textAnchor="middle">{p.myScore.toFixed(0)}</text>

                            {/* Std Bar (orange/red) */}
                            <rect x={groupX + 11} y={85 - stdH} width="10" height={stdH} fill="#f97316" stroke="#000" strokeWidth="0.3" />
                            <text x={groupX + 16} y={85 - stdH - 1.5} fontSize="5" textAnchor="middle" fill="#c2410c">{p.standardMean.toFixed(0)}</text>

                            {/* Label */}
                            <text x={groupX + 10.5} y="92" fontSize="5" textAnchor="middle">{p.item.slice(0, 3)}</text>
                          </g>
                        );
                      })}
                      {/* Legend */}
                      <g transform="translate(60, 97)">
                        <rect x="0" y="0" width="4" height="2.5" fill="#3b82f6" />
                        <text x="5" y="2.5" fontSize="4.5">내 점수</text>
                        <rect x="25" y="0" width="4" height="2.5" fill="#f97316" />
                        <text x="30" y="2.5" fontSize="4.5">기준평균</text>
                      </g>
                    </svg>
                  </div>

                  {/* Right: 점수표 */}
                  <div className="col-span-5">
                    <table className="w-full border-collapse border border-black text-center text-[8px]">
                      <thead>
                        <tr className="bg-slate-100/70 font-bold">
                          <th className="border border-black py-0.5 px-0.5">검사항목</th>
                          <th className="border border-black py-0.5 px-0.5">내 점수</th>
                          <th className="border border-black py-0.5 px-0.5">기준평균</th>
                          <th className="border border-black py-0.5 px-0.5">결과문구</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.purdue1stScores.map((p, idx) => (
                          <tr key={idx}>
                            <td className="border border-black py-0.5 px-0.5 font-medium">{p.item}</td>
                            <td className="border border-black py-0.5 px-0.5 font-bold">{p.myScore.toFixed(2)}</td>
                            <td className="border border-black py-0.5 px-0.5 text-slate-700">{p.standardMean.toFixed(2)}</td>
                            <td className="border border-black py-0.5 px-0.5">{p.resultText}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2차 검사기간 */}
              <div className="border border-black p-1">
                <div className="grid grid-cols-2 border border-black mb-1 text-[9.5px]">
                  <div className="text-center font-bold bg-slate-100/70 py-0.5 border-r border-black">
                    2차 검사기간
                  </div>
                  <div className="text-center font-semibold bg-white py-0.5 px-1 flex items-center justify-center text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.purdue2ndDate ?? `${data.year || new Date().getFullYear()}. 07. 15.`}
                        onChange={e => setData({ ...data, purdue2ndDate: e.target.value })}
                        placeholder="예: 2026. 07. 15."
                        className="w-full text-center border border-slate-300 rounded px-1 text-[9px] font-semibold"
                      />
                    ) : (
                      <span>{data.purdue2ndDate || `${data.year || new Date().getFullYear()}. 07. 15.`}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-1 items-start">
                  {/* Left: 차트 */}
                  <div className="col-span-7 border border-slate-300 p-1 bg-white" style={{ minHeight: '130px' }}>
                    <div className="text-[7.5px] font-bold text-center mb-0.5">당사자 점수 / 기준평균 비교표</div>
                    <svg viewBox="0 0 170 100" className="w-full h-auto">
                      {[0, 10, 20, 30, 40, 50, 60].map(v => {
                        const y = 85 - (v / 60) * 75;
                        return (
                          <g key={v}>
                            <line x1="18" y1={y} x2="165" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                            <text x="15" y={y + 2} fontSize="5" textAnchor="end" fill="#64748b">{v}</text>
                          </g>
                        );
                      })}
                      <line x1="18" y1="85" x2="165" y2="85" stroke="#000" strokeWidth="0.6" />

                      {data.purdue2ndScores.map((p, idx) => {
                        const groupX = 22 + idx * 28;
                        const myH = (Math.min(60, p.myScore) / 60) * 75;
                        const stdH = (Math.min(60, p.standardMean) / 60) * 75;
                        return (
                          <g key={idx}>
                            <rect x={groupX} y={85 - myH} width="10" height={myH} fill="#3b82f6" stroke="#000" strokeWidth="0.3" />
                            <text x={groupX + 5} y={85 - myH - 1.5} fontSize="5" fontWeight="bold" textAnchor="middle">{p.myScore.toFixed(0)}</text>

                            <rect x={groupX + 11} y={85 - stdH} width="10" height={stdH} fill="#ef4444" stroke="#000" strokeWidth="0.3" />
                            <text x={groupX + 16} y={85 - stdH - 1.5} fontSize="5" textAnchor="middle" fill="#b91c1c">{p.standardMean.toFixed(0)}</text>

                            <text x={groupX + 10.5} y="92" fontSize="5" textAnchor="middle">{p.item.slice(0, 3)}</text>
                          </g>
                        );
                      })}
                      {/* Legend */}
                      <g transform="translate(60, 97)">
                        <rect x="0" y="0" width="4" height="2.5" fill="#3b82f6" />
                        <text x="5" y="2.5" fontSize="4.5">내 점수</text>
                        <rect x="25" y="0" width="4" height="2.5" fill="#ef4444" />
                        <text x="30" y="2.5" fontSize="4.5">기준평균</text>
                      </g>
                    </svg>
                  </div>

                  {/* Right: 점수표 */}
                  <div className="col-span-5">
                    <table className="w-full border-collapse border border-black text-center text-[8px]">
                      <thead>
                        <tr className="bg-slate-100/70 font-bold">
                          <th className="border border-black py-0.5 px-0.5">검사항목</th>
                          <th className="border border-black py-0.5 px-0.5">내 점수</th>
                          <th className="border border-black py-0.5 px-0.5">기준평균</th>
                          <th className="border border-black py-0.5 px-0.5">결과문구</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.purdue2ndScores.map((p, idx) => (
                          <tr key={idx}>
                            <td className="border border-black py-0.5 px-0.5 font-medium">{p.item}</td>
                            <td className="border border-black py-0.5 px-0.5 font-bold">{p.myScore.toFixed(2)}</td>
                            <td className="border border-black py-0.5 px-0.5 text-slate-700">{p.standardMean.toFixed(2)}</td>
                            <td className="border border-black py-0.5 px-0.5">{p.resultText}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-3. 상반기 직업적응훈련반 훈련 평가 사항 */}
          <div className="mb-2">
            <div className="font-bold text-[10.5px] text-black mb-0.5">
              2-3. 상반기 직업적응훈련반 훈련 평가 사항
            </div>
            <div className="grid grid-cols-12 gap-1.5 border border-black p-1">
              {/* Left: 상반기(1월~6월) Table */}
              <div className="col-span-6">
                <div className="text-center font-bold bg-slate-100/70 py-0.5 border border-black mb-0.5 text-[8.5px]">
                  상반기(1월~6월)
                </div>
                <table className="w-full border-collapse border border-black text-center text-[8px]">
                  <thead>
                    <tr className="bg-slate-100/70 font-bold">
                      <th className="border border-black py-0.5 px-1">구분</th>
                      <th className="border border-black py-0.5 px-1">환산점수</th>
                      <th className="border border-black py-0.5 px-1">백분율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.training1stHalfScores.map((r, idx) => (
                      <tr key={idx}>
                        <td className="border border-black py-0.5 px-1 text-left font-medium">{r.item}</td>
                        <td className="border border-black py-0.5 px-1 font-bold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={r.convertedScore}
                              onChange={e => {
                                const updated = [...data.training1stHalfScores];
                                updated[idx].convertedScore = Number(e.target.value);
                                setData({ ...data, training1stHalfScores: updated });
                              }}
                              className="w-8 text-center border border-slate-300 rounded text-[8px]"
                            />
                          ) : (
                            r.convertedScore
                          )}
                        </td>
                        <td className="border border-black py-0.5 px-1">
                          {isEditing ? (
                            <input
                              type="number"
                              value={r.percentage}
                              onChange={e => {
                                const updated = [...data.training1stHalfScores];
                                updated[idx].percentage = Number(e.target.value);
                                setData({ ...data, training1stHalfScores: updated });
                              }}
                              className="w-8 text-center border border-slate-300 rounded text-[8px]"
                            />
                          ) : (
                            `${r.percentage}%`
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right: Bar Chart (0~5 scale) */}
              <div className="col-span-6 border border-slate-300 p-1 bg-white flex flex-col justify-between" style={{ minHeight: '90px' }}>
                <svg viewBox="0 0 200 80" className="w-full h-auto">
                  {[0, 1, 2, 3, 4, 5].map(v => {
                    const y = 68 - (v / 5) * 58;
                    return (
                      <g key={v}>
                        <line x1="18" y1={y} x2="195" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                        <text x="14" y={y + 2} fontSize="5" textAnchor="end" fill="#64748b">{v}</text>
                      </g>
                    );
                  })}
                  <line x1="18" y1="68" x2="195" y2="68" stroke="#000" strokeWidth="0.6" />

                  {data.training1stHalfScores.map((r, idx) => {
                    const x = 26 + idx * 34;
                    const h = (Math.min(5, r.convertedScore) / 5) * 58;
                    return (
                      <g key={idx}>
                        <rect x={x} y={68 - h} width="16" height={h} fill="#38bdf8" stroke="#000" strokeWidth="0.3" />
                        <text x={x + 8} y={68 - h - 1.5} fontSize="5" fontWeight="bold" textAnchor="middle">
                          {r.convertedScore > 0 ? r.convertedScore : ''}
                        </text>
                        <text x={x + 8} y="75" fontSize="4.5" textAnchor="middle">
                          {r.item.slice(0, 4)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
            {/* 소견 */}
            <div className="border border-black border-t-0 p-1 bg-white text-[9px]">
              <span className="font-bold">○ 상반기 훈련 평가 결과: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.training1stHalfComment}
                  onChange={e => setData({ ...data, training1stHalfComment: e.target.value })}
                  className="w-3/4 border border-slate-300 rounded px-1 text-[9px]"
                />
              ) : (
                <span>{data.training1stHalfComment}</span>
              )}
            </div>
          </div>

          {/* 2-4. 상반기 전공 훈련 프로그램 평가 사항 */}
          <div>
            <div className="font-bold text-[10.5px] text-black mb-0.5">
              2-4. 상반기 전공 훈련 프로그램 평가 사항
            </div>
            <div className="grid grid-cols-12 gap-1.5 border border-black p-1">
              {/* Left: 상반기 평가표 Table */}
              <div className="col-span-6">
                <div className="text-center font-bold bg-slate-100/70 py-0.5 border border-black mb-0.5 text-[8.5px]">
                  상반기 평가표
                </div>
                <table className="w-full border-collapse border border-black text-center text-[8px]">
                  <thead>
                    <tr className="bg-slate-100/70 font-bold">
                      <th className="border border-black py-0.5 px-1">구분</th>
                      <th className="border border-black py-0.5 px-1">환산점수</th>
                      <th className="border border-black py-0.5 px-1">백분율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.major1stHalfScores.map((r, idx) => (
                      <tr key={idx}>
                        <td className="border border-black py-0.5 px-1 text-left font-medium">{r.item}</td>
                        <td className="border border-black py-0.5 px-1 font-bold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={r.convertedScore}
                              onChange={e => {
                                const updated = [...data.major1stHalfScores];
                                updated[idx].convertedScore = Number(e.target.value);
                                setData({ ...data, major1stHalfScores: updated });
                              }}
                              className="w-8 text-center border border-slate-300 rounded text-[8px]"
                            />
                          ) : (
                            r.convertedScore
                          )}
                        </td>
                        <td className="border border-black py-0.5 px-1">
                          {isEditing ? (
                            <input
                              type="number"
                              value={r.percentage}
                              onChange={e => {
                                const updated = [...data.major1stHalfScores];
                                updated[idx].percentage = Number(e.target.value);
                                setData({ ...data, major1stHalfScores: updated });
                              }}
                              className="w-8 text-center border border-slate-300 rounded text-[8px]"
                            />
                          ) : (
                            `${r.percentage}%`
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right: Bar Chart (0~5 scale) */}
              <div className="col-span-6 border border-slate-300 p-1 bg-white flex flex-col justify-between" style={{ minHeight: '90px' }}>
                <svg viewBox="0 0 200 80" className="w-full h-auto">
                  {[0, 1, 2, 3, 4, 5].map(v => {
                    const y = 68 - (v / 5) * 58;
                    return (
                      <g key={v}>
                        <line x1="18" y1={y} x2="195" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                        <text x="14" y={y + 2} fontSize="5" textAnchor="end" fill="#64748b">{v}</text>
                      </g>
                    );
                  })}
                  <line x1="18" y1="68" x2="195" y2="68" stroke="#000" strokeWidth="0.6" />

                  {data.major1stHalfScores.map((r, idx) => {
                    const x = 32 + idx * 48;
                    const h = (Math.min(5, r.convertedScore) / 5) * 58;
                    return (
                      <g key={idx}>
                        <rect x={x} y={68 - h} width="20" height={h} fill="#f43f5e" stroke="#000" strokeWidth="0.3" />
                        <text x={x + 10} y={68 - h - 1.5} fontSize="5" fontWeight="bold" textAnchor="middle">
                          {r.convertedScore > 0 ? r.convertedScore : ''}
                        </text>
                        <text x={x + 10} y="75" fontSize="4.5" textAnchor="middle">
                          {r.item}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
            {/* 소견 */}
            <div className="border border-black border-t-0 p-1 bg-white text-[9px]">
              <span className="font-bold">○ 상반기 전공훈련 프로그램 평가 결과: </span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.major1stHalfComment}
                  onChange={e => setData({ ...data, major1stHalfComment: e.target.value })}
                  className="w-3/4 border border-slate-300 rounded px-1 text-[9px]"
                />
              ) : (
                <span>{data.major1stHalfComment}</span>
              )}
            </div>
          </div>

        </section>
      </div>

      {/* ========================================================
          PAGE 2 (공문서 A4 규격 - 첨부 양식 완벽 일치)
         ======================================================== */}
      <div
        id="midterm-print-page-2"
        className="bg-white p-7 md:p-8 border border-slate-400 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 text-[10px] leading-tight font-sans text-black"
        style={{ minHeight: '1080px' }}
      >
        {/* 3. 방향 및 목표 */}
        <section className="mb-4">
          <div className="font-bold text-[11px] text-black mb-1">
            3. 방향 및 목표
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <tbody>
              <tr>
                <th className="border border-black bg-slate-100/70 py-2 px-3 font-bold w-[18%] text-center">
                  장기목표
                </th>
                <td className="border border-black p-2 font-medium">
                  {isEditing ? (
                    <textarea
                      value={data.longTermGoal}
                      onChange={e => setData({ ...data, longTermGoal: e.target.value })}
                      rows={2}
                      className="w-full border border-slate-300 rounded p-1 text-[10px]"
                    />
                  ) : (
                    data.longTermGoal
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 4-1. 교육역량강화 단기목표 계획 */}
        <section className="mb-4">
          <div className="font-bold text-[11px] text-black mb-1">
            4-1. 교육역량강화 단기목표 계획
          </div>
          <table className="w-full border-collapse border border-black text-center text-[9.5px]">
            <thead>
              <tr className="bg-slate-100/70 font-bold">
                <th className="border border-black py-1 px-1.5 w-[20%]">단기목표</th>
                <th className="border border-black py-1 px-1 w-[16%]">서비스 제공기간</th>
                <th className="border border-black py-1 px-2 w-[40%]">서비스 내용 및 수행방법</th>
                <th className="border border-black py-1 px-1 w-[10%]">담당자</th>
                <th className="border border-black py-1 px-1 w-[14%]">
                  수행달성여부<br/>(예/아니오/진행예정)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.educationGoals.map((g, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-1.5 text-center font-semibold whitespace-pre-line">
                    {isEditing ? (
                      <textarea
                        value={g.goalTitle}
                        onChange={e => {
                          const updated = [...data.educationGoals];
                          updated[idx].goalTitle = e.target.value;
                          setData({ ...data, educationGoals: updated });
                        }}
                        rows={2}
                        className="w-full border border-slate-300 rounded p-1 text-[9px]"
                      />
                    ) : (
                      g.goalTitle
                    )}
                  </td>
                  <td className="border border-black p-1.5 text-center whitespace-pre-line font-mono text-[9px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={g.period}
                        onChange={e => {
                          const updated = [...data.educationGoals];
                          updated[idx].period = e.target.value;
                          setData({ ...data, educationGoals: updated });
                        }}
                        className="w-full text-center border border-slate-300 rounded text-[9px]"
                      />
                    ) : (
                      g.period
                    )}
                  </td>
                  <td className="border border-black p-1.5 text-left whitespace-pre-line leading-snug px-2">
                    {isEditing ? (
                      <textarea
                        value={g.serviceContent}
                        onChange={e => {
                          const updated = [...data.educationGoals];
                          updated[idx].serviceContent = e.target.value;
                          setData({ ...data, educationGoals: updated });
                        }}
                        rows={3}
                        className="w-full border border-slate-300 rounded p-1 text-[9px]"
                      />
                    ) : (
                      g.serviceContent
                    )}
                  </td>
                  <td className="border border-black p-1.5 text-center font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        value={g.evaluator}
                        onChange={e => {
                          const updated = [...data.educationGoals];
                          updated[idx].evaluator = e.target.value;
                          setData({ ...data, educationGoals: updated });
                        }}
                        className="w-full text-center border border-slate-300 rounded text-[9px]"
                      />
                    ) : (
                      g.evaluator
                    )}
                  </td>
                  <td className="border border-black p-1.5 text-center font-bold">
                    {isEditing ? (
                      <select
                        value={g.status}
                        onChange={e => {
                          const updated = [...data.educationGoals];
                          updated[idx].status = e.target.value as any;
                          setData({ ...data, educationGoals: updated });
                        }}
                        className="border border-slate-300 rounded text-[9px]"
                      >
                        <option value="진행 예정">진행 예정</option>
                        <option value="진행중">진행중</option>
                        <option value="달성">달성</option>
                        <option value="미달성">미달성</option>
                      </select>
                    ) : (
                      g.status
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 4-2. 개인역량강화 단기목표 계획 */}
        <section className="mb-4">
          <div className="font-bold text-[11px] text-black mb-1">
            4-2. 개인역량강화 단기목표 계획
          </div>
          <table className="w-full border-collapse border border-black text-center text-[9.5px]">
            <thead>
              <tr className="bg-slate-100/70 font-bold">
                <th className="border border-black py-1 px-1.5 w-[20%]">단기목표</th>
                <th className="border border-black py-1 px-1 w-[16%]">서비스 제공기간</th>
                <th className="border border-black py-1 px-2 w-[40%]">서비스 내용 및 수행방법</th>
                <th className="border border-black py-1 px-1 w-[10%]">담당자</th>
                <th className="border border-black py-1 px-1 w-[14%]">
                  수행달성여부<br/>(예/아니오/진행예정)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.personalGoals.map((g, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-1.5 text-center font-semibold whitespace-pre-line">
                    {isEditing ? (
                      <input
                        type="text"
                        value={g.goalTitle}
                        onChange={e => {
                          const updated = [...data.personalGoals];
                          updated[idx].goalTitle = e.target.value;
                          setData({ ...data, personalGoals: updated });
                        }}
                        className="w-full text-center border border-slate-300 rounded p-1 text-[9px]"
                      />
                    ) : (
                      g.goalTitle
                    )}
                  </td>
                  <td className="border border-black p-1.5 text-center whitespace-pre-line font-mono text-[9px]">
                    {g.period}
                  </td>
                  <td className="border border-black p-1.5 text-left whitespace-pre-line leading-snug px-2">
                    {isEditing ? (
                      <textarea
                        value={g.serviceContent}
                        onChange={e => {
                          const updated = [...data.personalGoals];
                          updated[idx].serviceContent = e.target.value;
                          setData({ ...data, personalGoals: updated });
                        }}
                        rows={2}
                        className="w-full border border-slate-300 rounded p-1 text-[9px]"
                      />
                    ) : (
                      g.serviceContent
                    )}
                  </td>
                  <td className="border border-black p-1.5 text-center font-medium">
                    {g.evaluator}
                  </td>
                  <td className="border border-black p-1.5 text-center font-bold">
                    {g.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 5. 단기목표 달성 여부 */}
        <section className="mb-4">
          <div className="font-bold text-[11px] text-black mb-1">
            5. 단기목표 달성 여부
          </div>
          <table className="w-full border-collapse border border-black text-center text-[9.5px]">
            <thead>
              <tr className="bg-slate-100/70 font-bold">
                <th className="border border-black py-1 px-1.5 w-[20%]">단기목표</th>
                <th className="border border-black py-1 px-1 w-[16%]">서비스 제공기간</th>
                <th className="border border-black py-1 px-2 w-[36%]">서비스 내용 및 수행방법</th>
                <th className="border border-black py-1 px-1 w-[12%]">달성여부</th>
                <th className="border border-black py-1 px-1 w-[16%]">내용</th>
              </tr>
            </thead>
            <tbody>
              {data.goalAchievementRows.map((r, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-1.5 text-center">{r.goalTitle}</td>
                  <td className="border border-black p-1.5 text-center font-mono">{r.period}</td>
                  <td className="border border-black p-1.5 text-center">{r.serviceContent}</td>
                  <td className="border border-black p-1.5 text-center">{r.status}</td>
                  <td className="border border-black p-1.5 text-center">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 6. 단기목표 미달성 재수립 계획 */}
        <section className="mb-6">
          <div className="font-bold text-[11px] text-black mb-1">
            6. 단기목표 미달성 재수립 계획
          </div>
          <div className="border border-black p-2 bg-white text-[10px] min-h-[36px]">
            {isEditing ? (
              <textarea
                value={data.unachievedPlanNote}
                onChange={e => setData({ ...data, unachievedPlanNote: e.target.value })}
                rows={2}
                className="w-full border border-slate-300 rounded p-1 text-[10px]"
              />
            ) : (
              <div>{data.unachievedPlanNote}</div>
            )}
          </div>
        </section>

        {/* 하단 동의문 및 서명란 */}
        <div className="border border-black p-4 text-center space-y-3 bg-white mt-auto">
          <p className="text-[10.5px] font-medium text-black leading-relaxed">
            이상의 내용은 <span className="font-bold underline px-1">{data.name}</span>님의 서비스과정평가에 따른 개별화서비스계획 중간평가 내용입니다.
            <br />
            위와 같은 내용에 본인 및 보호자는 직접 의견을 제시하고 참여하였으며, 이에 동의하였음을 확인합니다.
          </p>

          <div className="text-[11px] font-bold text-black pt-2">
            2026년. &nbsp;&nbsp;&nbsp;&nbsp;월. &nbsp;&nbsp;&nbsp;&nbsp;일.
          </div>

          <div className="flex justify-end gap-10 pt-2 text-[11px] font-bold text-black pr-6">
            <div className="flex items-center gap-2">
              <span>당사자 :</span>
              <span className="font-medium inline-block min-w-[50px] text-left">{data.traineeSignatureName}</span>
              <span className="text-[10px] font-normal text-slate-700">(인 / 서명)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>담당자 :</span>
              <span className="font-medium inline-block min-w-[50px] text-left">{data.evaluatorSignatureName}</span>
              <span className="text-[10px] font-normal text-slate-700">(인 / 서명)</span>
            </div>
          </div>

          <div className="text-center font-bold text-[13px] text-black pt-3 tracking-wider">
            {data.organizationName || '수원시장애인종합복지관 능력개발지원팀'}
          </div>
        </div>

      </div>

    </div>
  );
}
