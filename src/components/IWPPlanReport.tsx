/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { IndividualizedServicePlan } from '../types';
import { Printer, ArrowLeft, Edit3, Sparkles } from 'lucide-react';

interface IWPPlanReportProps {
  plan: IndividualizedServicePlan;
  onBack: () => void;
  onEdit: () => void;
}

export default function IWPPlanReport({ plan, onBack, onEdit }: IWPPlanReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const isSecondHalf = plan.termType === '2차' || plan.planType === '재수립';
  const termLabel = isSecondHalf ? '2차' : '1차';
  const termSubtitle = isSecondHalf ? '중간평가 및 하반기 재수립' : '연초 수립';

  // ERS 차트용 최대값 (15 기준)
  const maxErs = 15;

  return (
    <div id="iwp-report-container" className="max-w-[850px] mx-auto pb-16 text-slate-900">
      
      {/* Top Action Bar (Print Hidden) */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button
            id="iwp-back-btn"
            onClick={onBack}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            워크스페이스로 돌아가기
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[11px] font-black rounded-md ${
                isSecondHalf ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {termLabel} 계획서
              </span>
              <h2 className="text-sm font-extrabold text-slate-800">
                {plan.name} 훈련생 {termLabel} 개별화재활계획서 ({termSubtitle})
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {plan.trainingClass} | 계획일자: {plan.planDate} ({plan.planType})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="iwp-edit-btn"
            onClick={onEdit}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
          >
            <Edit3 className="h-4 w-4" />
            계획서 수정하기
          </button>
          <button
            id="iwp-print-btn"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" />
            A4 2페이지 인쇄 (PDF 저장)
          </button>
        </div>
      </div>

      {/* ========================================================
          PAGE 1 (A4 규격 공문서)
         ======================================================== */}
      <div 
        id="iwp-print-page-1"
        className="bg-white p-8 md:p-10 border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 text-[11px] leading-tight font-sans text-slate-950 mb-8 print:mb-0 print:page-break-after"
        style={{ minHeight: '1080px' }}
      >
        {/* Document Header Title */}
        <div className="text-center pb-3 border-b-2 border-slate-950 mb-3">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-950">
            {termLabel} 개별화재활계획서
            <span className="text-xs md:text-sm font-semibold ml-2 text-slate-600">
              ({termSubtitle})
            </span>
            <span className="text-sm md:text-base font-bold ml-2 tracking-normal">
              (문화예술반 {plan.trainingClass === '문화예술반' ? '■' : '□'}, 스마트산업반 {plan.trainingClass === '스마트산업반' ? '■' : '□'})
            </span>
          </h1>
        </div>

        {/* 1. 기본정보 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1 flex items-center gap-1">
            1. 기본정보
          </h2>
          <table className="w-full border-collapse border border-slate-950 text-center text-[10.5px]">
            <tbody>
              <tr>
                <th className="border border-slate-950 bg-slate-100 py-1 px-2 font-bold w-1/6">성명</th>
                <td className="border border-slate-950 py-1 px-2 w-2/6 font-semibold">{plan.name}</td>
                <th className="border border-slate-950 bg-slate-100 py-1 px-2 font-bold w-1/6">성별</th>
                <td className="border border-slate-950 py-1 px-2 w-2/6 font-semibold">{plan.gender}</td>
              </tr>
              <tr>
                <th className="border border-slate-950 bg-slate-100 py-1 px-2 font-bold">생년월일</th>
                <td className="border border-slate-950 py-1 px-2 font-semibold">{plan.birthDate}</td>
                <th className="border border-slate-950 bg-slate-100 py-1 px-2 font-bold">장애유형</th>
                <td className="border border-slate-950 py-1 px-2 font-semibold">{plan.disabilityType}</td>
              </tr>
              <tr>
                <th className="border border-slate-950 bg-slate-100 py-1 px-2 font-bold">욕구사항</th>
                <td colSpan={3} className="border border-slate-950 py-1.5 px-3 text-left font-medium">
                  {plan.desiredGoal}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 2. 강점 및 제한점 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            2. 강점 및 제한점
          </h2>
          <table className="w-full border-collapse border border-slate-950 text-[10.5px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-950 py-1 px-2 font-bold w-1/2 text-center">강점</th>
                <th className="border border-slate-950 py-1 px-2 font-bold w-1/2 text-center">제한점</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-950 p-2 align-top space-y-0.5">
                  {plan.strengths.map((str, idx) => (
                    <div key={idx} className="leading-snug">- {str}</div>
                  ))}
                </td>
                <td className="border border-slate-950 p-2 align-top space-y-0.5">
                  {plan.limitations.map((lim, idx) => (
                    <div key={idx} className="leading-snug">- {lim}</div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 3. 진단 및 평가 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            3. 진단 및 평가
          </h2>

          {/* 3-1. 직업준비검사 (ERS) */}
          <div className="border border-slate-950 p-2 mb-2 bg-white">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-[11px] text-slate-950">3-1. 직업준비검사(ERS)</h3>
              <span className="text-[10px] font-medium text-slate-600">검사기간 : {plan.ersTestDate}</span>
            </div>

            {/* Grid for Score Table and ERS Profile Bar Chart */}
            <div className="grid grid-cols-12 gap-2 mb-1.5 items-stretch">
              {/* ERS Table (Left 5 Cols) */}
              <div className="col-span-5 flex flex-col justify-between">
                <table className="w-full border-collapse border border-slate-950 text-center text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">구분</th>
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">원점수</th>
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">환산점수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.ersScores.map((scoreItem, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-950 py-0.5 px-1 font-semibold bg-slate-50">{scoreItem.domain}</td>
                        <td className="border border-slate-950 py-0.5 px-1 font-mono">{scoreItem.rawScore}</td>
                        <td className={`border border-slate-950 py-0.5 px-1 font-mono font-bold ${
                          scoreItem.domain === plan.ersLowestDomain ? 'text-red-600 bg-red-50/50' : ''
                        }`}>
                          {scoreItem.convertedScore}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-950 py-0.5 px-1">환산점수 합계</td>
                      <td colSpan={2} className="border border-slate-950 py-0.5 px-1 font-mono text-center font-black">
                        {plan.ersConvertedSum}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-950 py-0.5 px-1">표준점수</td>
                      <td colSpan={2} className="border border-slate-950 py-0.5 px-1 font-mono text-center font-black text-indigo-900">
                        {plan.ersStandardScore}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ERS Profile Bar Graph (Right 7 Cols) */}
              <div className="col-span-7 border border-slate-950 p-1.5 flex flex-col justify-between bg-white">
                <div className="text-center font-bold text-[10px] pb-1 border-b border-slate-200">
                  ERS Profile
                </div>
                
                <div className="relative flex items-end justify-between h-28 pt-3 px-1">
                  {/* Y Axis Guide Lines */}
                  <div className="absolute inset-x-1 top-2 bottom-4 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full border-t border-slate-950 text-[7.5px] font-mono text-right pr-0.5">15</div>
                    <div className="w-full border-t border-slate-950 text-[7.5px] font-mono text-right pr-0.5">10</div>
                    <div className="w-full border-t border-slate-950 text-[7.5px] font-mono text-right pr-0.5">5</div>
                    <div className="w-full border-t border-slate-950 text-[7.5px] font-mono text-right pr-0.5">0</div>
                  </div>

                  {/* Bars */}
                  {plan.ersScores.map((item, idx) => {
                    const heightPct = Math.min(100, Math.max(5, (item.convertedScore / maxErs) * 100));
                    const isLowest = item.domain === plan.ersLowestDomain;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative z-10 px-0.5">
                        <span className={`text-[8.5px] font-bold font-mono mb-0.5 ${
                          isLowest ? 'text-red-600 font-black' : 'text-slate-800'
                        }`}>
                          {item.convertedScore}
                        </span>
                        <div 
                          className={`w-full max-w-[18px] border border-slate-950 ${
                            isLowest ? 'bg-amber-400' : 'bg-slate-700'
                          }`}
                          style={{ height: `${heightPct * 0.75}%` }}
                        />
                        <span className="text-[7.5px] font-bold text-slate-800 mt-1 whitespace-nowrap tracking-tighter">
                          {item.domain}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ERS Analysis Text */}
            <div className="text-[9.5px] leading-relaxed text-slate-900 border-t border-slate-200 pt-1 whitespace-pre-line">
              {plan.ersAnalysisText}
            </div>
          </div>

          {/* 3-2. 그림직업흥미검사 */}
          <div className="border border-slate-950 p-2 mb-2 bg-white">
            <h3 className="font-bold text-[11px] text-slate-950 mb-1">3-2. 그림직업흥미검사</h3>
            <p className="text-[9.5px] leading-relaxed text-slate-900 whitespace-pre-line">
              {plan.pictureInterestAnalysis}
            </p>
          </div>

          {/* 3-3. Purdue Pegboard (퍼듀펙보드) */}
          <div className="border border-slate-950 p-2 mb-2 bg-white">
            <h3 className="font-bold text-[11px] text-slate-950 mb-1">3-3. Purdue Pegboard(퍼듀펙보드)</h3>
            
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Dual Bar Chart (Left 7 Cols) */}
              <div className="col-span-7 border border-slate-950 p-1.5 bg-white">
                <div className="flex justify-between items-center text-[9px] font-bold pb-1 border-b border-slate-200">
                  <span>당사자 점수 / 기준평균 비교표</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-500 border border-slate-950 inline-block"></span>내 점수</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 border border-slate-950 inline-block"></span>기준평균</span>
                  </div>
                </div>

                <div className="relative flex items-end justify-between h-24 pt-3 px-1">
                  {plan.purdueScores.map((item, idx) => {
                    const maxVal = item.item === '합계' ? 55 : item.item === '조립' ? 35 : 22;
                    const myPct = Math.min(100, Math.max(5, (item.myScore / maxVal) * 100));
                    const meanPct = Math.min(100, Math.max(5, (item.standardMean / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full px-0.5">
                        <div className="flex items-end justify-center gap-0.5 h-[62px] w-full">
                          {/* My Score Bar */}
                          <div className="flex flex-col items-center justify-end h-full w-2.5 md:w-3">
                            <span className="text-[7.5px] font-mono font-bold text-sky-800">{item.myScore.toFixed(0)}</span>
                            <div className="w-full bg-sky-500 border border-slate-950" style={{ height: `${myPct * 0.7}%` }} />
                          </div>
                          {/* Standard Mean Bar */}
                          <div className="flex flex-col items-center justify-end h-full w-2.5 md:w-3">
                            <span className="text-[7px] font-mono text-rose-800">{item.standardMean.toFixed(0)}</span>
                            <div className="w-full bg-rose-400 border border-slate-950" style={{ height: `${meanPct * 0.7}%` }} />
                          </div>
                        </div>
                        <span className="text-[7.5px] font-bold text-slate-800 mt-1 whitespace-nowrap tracking-tighter">
                          {item.item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pegboard Table (Right 5 Cols) */}
              <div className="col-span-5">
                <table className="w-full border-collapse border border-slate-950 text-center text-[9px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">검사항목</th>
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">내 점수</th>
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">기준평균</th>
                      <th className="border border-slate-950 py-0.5 px-1 font-bold">결과문구</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.purdueScores.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-950 py-0.5 px-1 font-semibold bg-slate-50">{row.item}</td>
                        <td className="border border-slate-950 py-0.5 px-1 font-mono font-bold">{row.myScore.toFixed(2)}</td>
                        <td className="border border-slate-950 py-0.5 px-1 font-mono">{row.standardMean.toFixed(2)}</td>
                        <td className={`border border-slate-950 py-0.5 px-1 font-bold ${
                          row.resultText === '낮음' || row.resultText === '매우 낮음' ? 'text-red-600' :
                          row.resultText === '높음' || row.resultText === '매우 높음' ? 'text-indigo-700' : 'text-slate-800'
                        }`}>
                          {row.resultText}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3-4. 직업적응훈련반 훈련 비교 분석 사항 */}
          <div className="border border-slate-950 p-2 bg-white">
            <h3 className="font-bold text-[11px] text-slate-950 mb-1">
              3-4. 직업적응훈련반 훈련 {isSecondHalf ? '비교 분석 사항 (상·하반기)' : '평가 사항 (상반기)'}
            </h3>
            
            <div className="grid grid-cols-12 gap-2 items-stretch mb-1">
              {/* Tables (Left 6 Cols) */}
              <div className="col-span-6 flex flex-col justify-between space-y-1">
                {/* 상반기 */}
                <div>
                  <div className="text-[8.5px] font-bold text-slate-700 mb-0.5">상반기(1월~6월) 성취도 <span className="text-[7.5px] font-normal text-slate-500">(5.0점 만점 기준)</span></div>
                  <table className="w-full border-collapse border border-slate-950 text-center text-[8.5px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-950 py-0.5 px-1 font-bold">구분</th>
                        <th className="border border-slate-950 py-0.5 px-1 font-bold">환산점수(5점)</th>
                        <th className="border border-slate-950 py-0.5 px-1 font-bold">100분율(%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.trainingCompareFirstHalf.map((row, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-950 py-0.5 px-1 font-medium bg-slate-50 text-left pl-1">{row.item}</td>
                          <td className="border border-slate-950 py-0.5 px-1 font-mono font-semibold">
                            {typeof row.convertedScore === 'number' && row.convertedScore > 0
                              ? (row.convertedScore % 1 !== 0 ? row.convertedScore.toFixed(1) : `${row.convertedScore}.0`)
                              : (row.convertedScore || 0)}
                          </td>
                          <td className="border border-slate-950 py-0.5 px-1 font-mono font-bold text-blue-700">{row.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 하반기 (2차 계획서일 때만 표시) */}
                {isSecondHalf && (
                  <div>
                    <div className="text-[8.5px] font-bold text-slate-700 mb-0.5">하반기(7월~12월) 성취도 <span className="text-[7.5px] font-normal text-slate-500">(5.0점 만점 기준)</span></div>
                    <table className="w-full border-collapse border border-slate-950 text-center text-[8.5px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-950 py-0.5 px-1 font-bold">구분</th>
                          <th className="border border-slate-950 py-0.5 px-1 font-bold">환산점수(5점)</th>
                          <th className="border border-slate-950 py-0.5 px-1 font-bold">100분율(%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.trainingCompareSecondHalf.map((row, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-950 py-0.5 px-1 font-medium bg-slate-50 text-left pl-1">{row.item}</td>
                            <td className="border border-slate-950 py-0.5 px-1 font-mono font-semibold">
                              {typeof row.convertedScore === 'number' && row.convertedScore > 0
                                ? (row.convertedScore % 1 !== 0 ? row.convertedScore.toFixed(1) : `${row.convertedScore}.0`)
                                : (row.convertedScore || 0)}
                            </td>
                            <td className="border border-slate-950 py-0.5 px-1 font-mono font-bold text-red-700">{row.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isSecondHalf && (
                  <div className="text-[8px] text-slate-500 bg-slate-50 p-1 border border-slate-200 rounded">
                    ※ 하반기(7월~12월) 평가는 7~8월 2차 개별화재활계획서 재수립 시 비교 분석 예정
                  </div>
                )}
              </div>

              {/* Compare Chart (Right 6 Cols) */}
              <div className="col-span-6 border border-slate-950 p-2 h-full flex flex-col justify-between bg-white min-h-[140px]">
                <div className="flex justify-between items-center text-[8px] font-bold pb-1 border-b border-slate-200 shrink-0">
                  <span>훈련 {isSecondHalf ? '비교 분석 차트 (0%~100%)' : '상반기 성취율 차트 (0%~100%)'}</span>
                  {isSecondHalf ? (
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-blue-500 inline-block"></span>상반기</span>
                      <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-red-400 inline-block"></span>하반기</span>
                    </div>
                  ) : (
                    <span className="text-[7.5px] text-blue-600 font-bold">■ 상반기 성취도</span>
                  )}
                </div>

                <div className="relative flex-1 flex flex-col justify-between pt-2 pb-0.5 px-1 min-h-[110px]">
                  <div className="absolute inset-x-1 top-2 bottom-5 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">100%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">75%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">50%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">25%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">0%</div>
                  </div>

                  <div className="flex-1 flex items-end justify-between w-full z-10 pb-0.5">
                    {plan.trainingCompareFirstHalf.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full px-0.5">
                        <div className="flex-1 flex items-end justify-center gap-0.5 w-full pb-0.5">
                          <div className="w-2.5 bg-blue-500 border border-slate-950" style={{ height: `${Math.max(4, item.percentage)}%` }} />
                          {isSecondHalf && (
                            <div className="w-2.5 bg-red-400 border border-slate-950" style={{ height: `${Math.max(4, plan.trainingCompareSecondHalf[idx]?.percentage || 0)}%` }} />
                          )}
                        </div>
                        <span className="text-[6.5px] font-bold text-slate-800 mt-0.5 text-center truncate max-w-[40px] shrink-0" title={item.item}>
                          {item.item.slice(0, 4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[9.5px] text-slate-800 font-medium pt-0.5">
              {plan.trainingCompareNotes}
            </div>
          </div>
        </section>

        {/* Page 1 Footer Note (Print indicator) */}
        <div className="text-right text-[8.5px] text-slate-400 font-mono mt-1">
          1 / 2 페이지 ({termLabel} 개별화재활계획서)
        </div>
      </div>

      {/* ========================================================
          PAGE 2 (A4 규격 공문서)
         ======================================================== */}
      <div 
        id="iwp-print-page-2"
        className="bg-white p-8 md:p-10 border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 text-[11px] leading-tight font-sans text-slate-950"
        style={{ minHeight: '1080px' }}
      >
        {/* 3-5. 전공훈련 프로그램 평가 사항 */}
        <section className="mb-3">
          <div className="border border-slate-950 p-2 bg-white">
            <h3 className="font-bold text-[11px] text-slate-950 mb-1">
              3-5. 전공훈련 프로그램 {isSecondHalf ? '비교 평가 사항' : '평가 사항 (상반기)'}
            </h3>
            
            <div className="grid grid-cols-12 gap-2 items-stretch mb-1">
              {/* Tables (Left 6 Cols) */}
              <div className="col-span-6 flex flex-col justify-between space-y-1">
                <div>
                  <div className="text-[8.5px] font-bold text-slate-700 mb-0.5">상반기 평가표</div>
                  <table className="w-full border-collapse border border-slate-950 text-center text-[8.5px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-950 py-0.5 px-1 font-bold">구분</th>
                        <th className="border border-slate-950 py-0.5 px-1 font-bold">환산점수</th>
                        <th className="border border-slate-950 py-0.5 px-1 font-bold">백분율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.majorCompareFirstHalf.map((row, idx) => (
                        <tr key={idx}>
                          <td className="border border-slate-950 py-0.5 px-1 font-medium bg-slate-50 text-left pl-1">{row.item}</td>
                          <td className="border border-slate-950 py-0.5 px-1 font-mono">{typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore}</td>
                          <td className="border border-slate-950 py-0.5 px-1 font-mono">{row.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {isSecondHalf && (
                  <div>
                    <div className="text-[8.5px] font-bold text-slate-700 mb-0.5">하반기 평가표</div>
                    <table className="w-full border-collapse border border-slate-950 text-center text-[8.5px]">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-950 py-0.5 px-1 font-bold">구분</th>
                          <th className="border border-slate-950 py-0.5 px-1 font-bold">환산점수</th>
                          <th className="border border-slate-950 py-0.5 px-1 font-bold">백분율</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.majorCompareSecondHalf.map((row, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-950 py-0.5 px-1 font-medium bg-slate-50 text-left pl-1">{row.item}</td>
                            <td className="border border-slate-950 py-0.5 px-1 font-mono">{typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore}</td>
                            <td className="border border-slate-950 py-0.5 px-1 font-mono">{row.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!isSecondHalf && (
                  <div className="text-[8px] text-slate-500 bg-slate-50 p-1 border border-slate-200 rounded">
                    ※ 전공훈련 하반기 평가는 2차 개별화재활계획서에서 종합 비교 예정
                  </div>
                )}
              </div>

              {/* Compare Chart (Right 6 Cols) */}
              <div className="col-span-6 border border-slate-950 p-2 h-full flex flex-col justify-between bg-white min-h-[140px]">
                <div className="flex justify-between items-center text-[8px] font-bold pb-1 border-b border-slate-200 shrink-0">
                  <span>전공훈련 {isSecondHalf ? '비교 차트 (0%~100%)' : '상반기 성취 차트 (0%~100%)'}</span>
                  {isSecondHalf ? (
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-blue-500 inline-block border border-slate-950"></span>상반기</span>
                      <span className="flex items-center gap-0.5"><span className="w-2 h-2 bg-red-400 inline-block border border-slate-950"></span>하반기</span>
                    </div>
                  ) : (
                    <span className="text-[7.5px] text-blue-600 font-bold">■ 상반기 성취도</span>
                  )}
                </div>

                <div className="relative flex-1 flex flex-col justify-between pt-2 pb-0.5 px-1 min-h-[110px]">
                  <div className="absolute inset-x-1 top-2 bottom-5 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">100%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">75%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">50%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">25%</div>
                    <div className="w-full border-t border-slate-950 text-[7px] text-right">0%</div>
                  </div>

                  <div className="flex-1 flex items-end justify-between w-full z-10 pb-0.5">
                    {plan.majorCompareFirstHalf.map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full px-0.5">
                        <div className="flex-1 flex items-end justify-center gap-0.5 w-full pb-0.5">
                          <div className="w-2.5 bg-blue-500 border border-slate-950" style={{ height: `${Math.max(4, item.percentage)}%` }} />
                          {isSecondHalf && (
                            <div className="w-2.5 bg-red-400 border border-slate-950" style={{ height: `${Math.max(4, plan.majorCompareSecondHalf[idx]?.percentage || 0)}%` }} />
                          )}
                        </div>
                        <span className="text-[6.5px] font-bold text-slate-800 mt-0.5 text-center truncate max-w-[45px] shrink-0" title={item.item}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[9.5px] text-slate-800 font-medium pt-0.5">
              {plan.majorCompareNotes}
            </div>
          </div>
        </section>

        {/* 4. 방향 및 목표 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            4. 방향 및 목표
          </h2>
          <table className="w-full border-collapse border border-slate-950 text-[10.5px]">
            <tbody>
              <tr>
                <th className="border border-slate-950 bg-slate-100 py-1.5 px-2 font-bold w-1/6 text-center">장기목표</th>
                <td className="border border-slate-950 py-1.5 px-3 font-medium">
                  {plan.longTermGoal}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 5-1. 교육역량강화 단기목표 계획 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            5-1. 교육역량강화 단기목표 계획
          </h2>
          <table className="w-full border-collapse border border-slate-950 text-[9.5px]">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-950 py-1 px-1.5 w-[20%]">단기목표</th>
                <th className="border border-slate-950 py-1 px-1 w-[15%]">서비스 제공기간</th>
                <th className="border border-slate-950 py-1 px-2 w-[45%]">서비스 내용 및 수행방법</th>
                <th className="border border-slate-950 py-1 px-1 w-[10%]">담당자</th>
                <th className="border border-slate-950 py-1 px-1 w-[10%]">수행달성여부<br/>(예/아니오/진행예정)</th>
              </tr>
            </thead>
            <tbody>
              {plan.educationGoals.map((goal, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-950 p-1.5 font-bold align-top whitespace-pre-line bg-slate-50/50">
                    {goal.goalTitle}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top whitespace-pre-line">
                    {goal.period}
                  </td>
                  <td className="border border-slate-950 p-1.5 align-top whitespace-pre-line leading-relaxed">
                    {goal.serviceContent}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top font-semibold">
                    {goal.evaluator}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top font-medium text-slate-700">
                    {goal.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 5-2. 개인역량강화 단기목표 계획 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            5-2. 개인역량강화 단기목표 계획
          </h2>
          <table className="w-full border-collapse border border-slate-950 text-[9.5px]">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-950 py-1 px-1.5 w-[20%]">단기목표</th>
                <th className="border border-slate-950 py-1 px-1 w-[15%]">서비스 제공기간</th>
                <th className="border border-slate-950 py-1 px-2 w-[45%]">서비스 내용 및 수행방법</th>
                <th className="border border-slate-950 py-1 px-1 w-[10%]">담당자</th>
                <th className="border border-slate-950 py-1 px-1 w-[10%]">수행달성여부<br/>(예/아니오/진행예정)</th>
              </tr>
            </thead>
            <tbody>
              {plan.personalGoals.map((goal, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-950 p-1.5 font-bold align-top bg-slate-50/50">
                    {goal.goalTitle}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top whitespace-pre-line">
                    {goal.period}
                  </td>
                  <td className="border border-slate-950 p-1.5 align-top whitespace-pre-line leading-relaxed">
                    {goal.serviceContent}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top font-semibold">
                    {goal.evaluator}
                  </td>
                  <td className="border border-slate-950 p-1 text-center align-top font-medium text-slate-700">
                    {goal.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 6. 단기목표 달성 여부 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            6. 단기목표 달성 여부{isSecondHalf ? ' (상반기 중간평가 반영)' : ' (2026년 7~8월 중간평가 시 작성 예정)'}
          </h2>
          <div className="border border-slate-950 p-2 text-[9.5px] text-slate-800 whitespace-pre-line leading-relaxed bg-white">
            {plan.goalAchievementNote}
          </div>
        </section>

        {/* 7. 단기목표 미달성 재수립 계획 */}
        <section className="mb-3">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            7. 단기목표 미달성 재수립 계획
          </h2>
          <div className="border border-slate-950 p-2 text-[9.5px] text-slate-800 whitespace-pre-line leading-relaxed bg-white">
            {plan.goalUnachievedReplanNote}
          </div>
        </section>

        {/* 8. 지원계획회의(사례회의) */}
        <section className="mb-4">
          <h2 className="font-black text-xs md:text-[12.5px] text-slate-950 mb-1">
            8. 지원계획회의(사례회의)
          </h2>
          <table className="w-full border-collapse border border-slate-950 text-[9.5px]">
            <thead>
              <tr className="bg-slate-100 text-center font-bold">
                <th className="border border-slate-950 py-1 px-1 w-[15%]">일시</th>
                <th className="border border-slate-950 py-1 px-2 w-[55%]">주요내용</th>
                <th className="border border-slate-950 py-1 px-2 w-[30%]">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-950 p-1.5 text-center font-medium align-middle">
                  {plan.caseConferenceDate}
                </td>
                <td className="border border-slate-950 p-1.5 align-middle whitespace-pre-line">
                  {plan.caseConferenceContent}
                </td>
                <td className="border border-slate-950 p-1.5 align-middle whitespace-pre-line text-slate-800">
                  {plan.caseConferenceNote}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Agreement and Signature Confirmation Box */}
        <div className="border border-slate-950 p-3 bg-slate-50/30 text-center space-y-2 mb-2">
          <p className="text-[10px] font-semibold text-slate-900 leading-snug">
            이상의 내용은 <span className="font-black underline">{plan.name}</span>님의 서비스과정평가 
            ({termLabel} {plan.planType === '수립' ? '■ 수립' : '■ 재수립'})에 따른 개별화재활계획 내용입니다.
            <br />
            위와 같은 내용에 본인 및 보호자는 직접 의견을 제시하고 참여하였으며, 이에 동의하였음을 확인합니다.
          </p>

          <div className="text-[11px] font-bold text-slate-950 pt-1">
            {plan.planDate}
          </div>

          <div className="flex justify-end gap-8 pt-1 text-[11px] font-bold text-slate-950 pr-4">
            <div className="flex items-center gap-2">
              <span>당사자 :</span>
              <span className="font-extrabold tracking-widest">{plan.clientSignName}</span>
              <span className="text-[10px] font-normal text-slate-500">(인 / 서명)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>담당자 :</span>
              <span className="font-extrabold tracking-widest">{plan.evaluatorName}</span>
              <span className="text-[10px] font-normal text-slate-500">(인 / 서명)</span>
            </div>
          </div>

          <div className="text-center font-black text-sm text-slate-950 pt-2 tracking-tight">
            {plan.organizationName}
          </div>
        </div>

        {/* Page 2 Footer Note */}
        <div className="text-right text-[8.5px] text-slate-400 font-mono">
          2 / 2 페이지 ({termLabel} 개별화재활계획서)
        </div>
      </div>

    </div>
  );
}

