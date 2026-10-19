/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Client, ERSTest } from '../types';
import { ERS_QUESTIONS, analyzeErsTest } from '../data/assessmentData';
import { Printer, ArrowLeft, Award, HelpCircle, FileText, TrendingUp } from 'lucide-react';

interface ERSReportProps {
  client: Client;
  test: ERSTest;
  onBack: () => void;
}

export default function ERSReport({
  client,
  test,
  onBack,
}: ERSReportProps) {
  const questions = ERS_QUESTIONS;
  
  const totalPossible = 252; // 63 * 4
  const actualPercent = Math.min(100, Math.round((test.totalScore / totalPossible) * 100));

  // Auto analysis using 63-question ERS algorithm
  const analysis = analyzeErsTest(test.answers);

  // Dynamic automatic descriptive summary based on vocational training criteria
  const generateVocationalERSSummary = () => {
    const domains = analysis.domainResults || [];
    const lowDomains = domains.filter(d => d.convertedScore <= 6).map(d => d.name);
    const highDomains = domains.filter(d => d.convertedScore >= 12).map(d => d.name);
    
    let intro = `[직업적응 행동특성 종합의견]
피평가자 ${client.name} 훈련생의 정서 안전성 및 직업적응 행동 적격성(ERS 63 다차원 지표)을 직업재활 및 훈련소 내 관찰 척도와 연계하여 종합 검토한 결과, 전반적인 직업 준비 행동 등급은 [${analysis.level}] 수준에 위치하고 있습니다.`;
    
    // Overall synthesis
    let synthesisText = "";
    if (analysis.level.includes("수") || analysis.level.includes("우수")) {
      synthesisText = `■ 종합 직비 행동 수준 평가
본 평정 영역 전반에 걸쳐 타인(동료 및 훈련교사)과의 협력적인 관계 맺음과 자율적인 작업 지침 준수 능력이 또래 대비 견고하게 정립되어 있습니다. 향후 실제 지원고용 및 경쟁고용 현장에 전이 배치될 경우에도 업무 스트레스 상황에서의 대인 마찰이나 직무 기피 가능성이 최소화될 것으로 예상되는 대단히 안정적인 작업 수행 자질을 갖추고 있습니다.`;
    } else if (analysis.level.includes("보통") || analysis.level.includes("양호")) {
      synthesisText = `■ 종합 직비 행동 수준 평가
공동체 생활 기본 규범이나 일차적인 지시 이행 영역에서는 모범적이고 순조로운 양상을 지지하나, 고강도로 반복되는 직무 압박이나 일시적인 업무 지체로 인한 긴장이 누적될 시 순간적인 작업 단념 또는 대인 상호작용 회피 행동이 미세하게 표출될 여지가 있습니다. 이에 훈련 과정 중에 일대일 면담 자리를 수시 배치해 정서적 이완 지도를 지속할 것을 권고합니다.`;
    } else {
      synthesisText = `■ 종합 직비 행동 수준 평가
현재 전반적인 전형적 직진 행동 규격이 외부 개입 없이는 조율이 어려운 정서 영역 상에 일부 편향되어 나타납니다. 이로 인해 엄격한 직장 내 서열식 지시 체계 수용이나 타 훈련생과의 대면 협업 배치 상에 지속적인 조력 개입이 요망됩니다. 독립적인 생산 라인 직무 배치는 지양하고, 작업 단계를 세밀하게 조정한 완치적 단계별 직무 지도법의 결합을 제안합니다.`;
    }

    // Weakness analysis
    let weaknessText = "";
    if (lowDomains.length > 0) {
      weaknessText = `■ 보완 및 집중 훈련 요망 분야
특히 직업훈련 과정 중 세심한 적응 보완과 정서 지탱 지도가 권장되는 취약 분야로는 [${lowDomains.join(", ")}] 부문(환산점수 6점 이하)이 집중 부각되었습니다. 해당 취약성을 지닌 훈련생은 직장 내 갈등 발생 시 자발적 해소보다는 대인 기피나 작업 현정에서의 감정 비인내 행동으로 전이되기 쉽기에, 직무 실습 도입기에는 소규모 의사소통 연습과 직업 생활 예절 시뮬레이션 훈련 과정을 집중 이수하도록 중점 설계해야 합니다.`;
    } else {
      weaknessText = `■ 보완 및 집중 훈련 요망 분야
다차원 적응 평정 분과 중 환산지수 6점 이하에 해당하는 고위험 직업 적응 이상 행동 지표는 식별되지 않았습니다. 이는 기본적인 규칙 적응과 타인 지시 수용력 면에서 고른 기초 역량을 안정적으로 보유하고 있음을 뒷받침합니다.`;
    }

    // Strengths analysis
    let strengthsText = "";
    if (highDomains.length > 0) {
      strengthsText = `■ 직업적 잠재 강점 영역
반면 피평가자의 돋보이는 직업적 강점 특성으로는 [${highDomains.join(", ")}] 영역(환산점수 12점 이상)의 지표가 매우 탁월하게 검증되었습니다. 해당 강점 부문과 연결되는 독립적인 직무 소임(예: 정형화된 개별 자재 정리, 자율적 정밀 선별 등)을 배정할 시 고도의 자생력을 보이며 높은 집중도와 성과율을 이끌어낼 잠재력을 갖추고 있습니다.`;
    } else {
      strengthsText = `■ 직업적 잠재 강점 영역
다차원 평정결과 중 특출나게 높게 산출된 강점 경계선(12점 이상) 지표는 단기간에 뚜렷이 집계되지 않았으나, 전반적인 직무 성향이 마찰 없이 유순하고 평탄하게 고른 분포를 보이고 있어 공조 작업 수행 시 우수한 협동력을 보여줄 것으로 판단됩니다.`;
    }

    let conclusion = `[종합 제언 및 훈련 처방]
측정 결과를 종합해 볼 때, 본 훈련생의 개별 성향 지도 다이어그램에 따른 맞춤형 대인 협동 방식과 지점별 교사 피드백 지침을 다음과 같이 현장 훈련에 적극 활용할 것을 건의합니다.`;

    return `${intro}\n\n${synthesisText}\n\n${weaknessText}\n\n${strengthsText}\n\n${conclusion}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="ers-report-container" className="space-y-6 max-w-4xl mx-auto pb-12 print:my-0 print:pb-0 px-2 font-sans">
      
      {/* Action panel (hidden in print) */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm print:hidden">
        <button
          id="back-from-ers-report"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          대상자 상세로 복귀
        </button>
        <button
          id="print-ers-btn"
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <Printer className="h-4 w-4" />
          영역별 결과지 인쇄 (PDF 저장)
        </button>
      </div>

      {/* Official Report Document */}
      <div id="ers-official-printable-sheet" className="bg-white border border-slate-350 p-8 rounded-2xl shadow-md space-y-8 print:border-0 print:shadow-none print:p-0 font-sans">
        
        {/* Document Header */}
        <div className="text-center relative">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 font-mono">Rehabilitation Readiness & Socialization Assessment</p>
          <h2 className="text-2xl font-black text-slate-850 border-b-4 border-slate-800 pb-3 mt-1 tracking-tight">
            사회성 및 직업적응력 평가 (Employability Readiness Scale - ERS) 결과지
          </h2>
        </div>

        {/* Demographics Area */}
        <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs rounded-lg">
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">평가 대상자</span>
            <span className="font-bold text-slate-800 text-sm">{client.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">생년월일 / 성별</span>
            <span className="font-semibold text-slate-800">{client.birthDate} ({client.gender === 'M' ? '남성' : '여성'})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">장애유형</span>
            <span className="font-semibold text-slate-850 truncate block">{client.diagnosis || '해당 없음'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">검사 타입</span>
            <span className="font-semibold text-indigo-700 font-semibold">
              직업적응력 (ERS)
            </span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1 col-span-2">
            <span className="text-slate-400 block font-bold mb-0.5">평가기관 / 검사담당자</span>
            <span className="font-semibold text-slate-800">{test.evaluatorName || '담당자'}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1">
            <span className="text-slate-400 block font-bold mb-0.5">평가 시행일</span>
            <span className="font-semibold text-slate-850">{test.testDate}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1 text-right">
            <span className="text-slate-400 block font-bold mb-0.5">합산 총점</span>
            <span className="font-semibold text-slate-700">{test.totalScore} / 252 점</span>
          </div>
        </div>

        {/* Diagnostic Grade Bento Card */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 border border-slate-250 rounded-xl p-5 space-y-3 flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">종합 검사 평가 분석</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-mono font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                {test.totalScore} <span className="text-xs text-slate-450 font-medium"> / {totalPossible}</span>
              </span>
              <div>
                <span className="text-xs text-slate-400 block">검사 평정 등급</span>
                <span className="font-extrabold text-[#111827] text-lg leading-tight block">{analysis.level}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-655 leading-relaxed pt-1 border-t border-slate-100">
              {analysis.description}
            </p>
          </div>

          <div className="border border-slate-250 rounded-xl p-5 space-y-3 flex flex-col items-center justify-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block text-center">종합 달성률</span>
            
            {/* Custom SVG gauge circle */}
            <div className="relative h-24 w-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="38" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                <circle cx="48" cy="48" r="38" stroke="#4F46E5" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - actualPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-850 font-mono">{actualPercent}%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* ERS Profile: Table and Graph side-by-side matches the PDF standard */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            사회성 및 직무적응 성향 프로파일 (ERS Profile)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Table */}
            <div className="md:col-span-5 overflow-hidden border border-slate-220 rounded-xl bg-white shadow-sm">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold text-[11px] border-b border-slate-220">
                    <th className="px-3 py-2.5 text-left pl-4">구분 (영역)</th>
                    <th className="px-3 py-2.5">원점수</th>
                    <th className="px-3 py-2.5 pr-4 text-indigo-700">환산점수</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100">
                  {analysis.domainResults.map((dom, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 text-left font-bold text-slate-800 pl-4">{dom.name}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600 font-semibold">{dom.score}점</td>
                      <td className="px-3 py-2.5 font-mono font-black text-indigo-600 pr-4">{dom.convertedScore}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 font-bold border-t border-slate-220 text-slate-800">
                    <td className="px-3 py-2.5 text-left pl-4 text-slate-705">환산합</td>
                    <td className="px-3 py-2.5 text-slate-400 font-mono">-</td>
                    <td className="px-3 py-2.5 font-mono font-black text-indigo-700 pr-4">{analysis.convertedSum}</td>
                  </tr>
                  <tr className="bg-slate-50/50 font-bold text-indigo-700">
                    <td className="px-3 py-2.5 text-left pl-4 text-slate-705">표준점수 (고용적응지수)</td>
                    <td className="px-3 py-2.5 text-slate-400 font-mono">-</td>
                    <td className="px-3 py-2.5 font-mono font-black text-indigo-700 pr-4 bg-indigo-50/40">{analysis.standardScoreVal}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Beautiful, PDF-style custom SVG profile bar chart */}
            <div className="md:col-span-7 border border-slate-220 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between h-[300px]">
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-1">ERS Profile</h4>
                <p className="text-[10px] text-slate-400 text-center mb-2 font-medium">분야별 환산점수 기준 프로파일 (최고치: 19점, 정상구간: 7점~13점)</p>
              </div>

              <div className="relative h-[180px] flex items-end justify-between border-b border-l border-slate-350 ml-6 mr-2 mb-3">
                {/* Horizontal dashed guide grid lines */}
                <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none text-[8.5px] text-slate-400 font-mono">
                  {[19, 16, 13, 10, 7, 4, 1].map((val) => {
                    const hPx = ((val - 1) / 18) * 120;
                    return (
                      <div 
                        key={val} 
                        className="w-full absolute flex items-center border-t border-dashed border-slate-200 h-0"
                        style={{ bottom: `${hPx}px` }}
                      >
                        <span className="absolute -left-6 text-right w-4 font-bold">{val}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Normal range shaded band (7 to 13 points) */}
                <div 
                  className="absolute inset-x-0 bg-indigo-50/45 border-y border-dashed border-indigo-200/50 pointer-events-none" 
                  style={{ bottom: `${((7 - 1) / 18) * 120}px`, height: `${((13 - 7) / 18) * 120}px` }}
                />

                {/* Vertical bars representing the 7 factors */}
                {analysis.domainResults.map((dom, i) => {
                  const pct = ((dom.convertedScore - 1) / 18) * 100;
                  const barHeight = Math.max(5, pct);
                  const colors = [
                    'bg-indigo-500 hover:bg-indigo-600',
                    'bg-indigo-500 hover:bg-indigo-600',
                    'bg-indigo-500 hover:bg-indigo-600',
                    'bg-indigo-500 hover:bg-indigo-600',
                    'bg-indigo-500 hover:bg-indigo-600',
                    'bg-indigo-500 hover:bg-indigo-600',
                    'bg-indigo-500 hover:bg-indigo-600',
                  ];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative z-10 mx-1">
                      {/* Converted score label */}
                      <span className="text-[10px] font-black text-indigo-700 font-mono bg-indigo-50 px-1 rounded border border-indigo-100 mb-1 leading-none">
                        {dom.convertedScore}
                      </span>
                      
                      {/* Svelte bar */}
                      <div 
                        className={`w-6 sm:w-8 rounded-t shadow-sm transition-all duration-300 ${colors[i % colors.length]}`}
                        style={{ height: `${barHeight * 1.2}px` }}
                      />
                      
                      {/* Shortened target category label */}
                      <span className="text-[9px] font-bold text-slate-550 mt-2 absolute -bottom-6 text-center tracking-tight truncate w-[55px]">
                        {dom.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="h-2" />
            </div>
          </div>
        </div>

        {/* Expanded Items & Client Response Appendix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <HelpCircle className="h-4 w-4 text-indigo-600" />
            문항 평정 반응 상세표 (Items & Answers Appendix)
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left text-slate-705">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-3 py-2 text-center w-12">번호</th>
                  <th className="px-3 py-2">검정 평가 내용</th>
                  <th className="px-3 py-2 w-32">영역 분류</th>
                  <th className="px-3 py-2 text-center w-28">훈련생 평정치</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {questions.map((q, i) => {
                  const ansVal = test.answers[q.id] || 2;
                  return (
                    <tr id={`report-q-row-${q.id}`} key={q.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5 text-center font-bold text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-850">{q.text}</td>
                      <td className="px-3 py-2.5 text-slate-500 font-semibold text-[10px]">{q.category || '-'}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          ansVal >= 4
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : ansVal <= 2
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ansVal} 점
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrated Social-Interaction Summary & Vocational Recommendations */}
        <div className="border-t border-slate-200 pt-6">
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5 mb-6">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-4 pb-2 border-b border-indigo-100/50">
              <FileText className="h-4 w-4 text-indigo-600" />
              직무적응행동 종합 평가 및 직업훈련 제언 (Vocational Adaptability Analysis & Recommendations)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Adaptive Summary */}
              <div className="md:col-span-7 space-y-2.5">
                <h5 className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  사회 정서 적응성 관찰 종합 소견 (Vocational Adaptability Opinion)
                </h5>
                <div className="text-[11.5px] text-slate-700 leading-relaxed bg-white/90 p-4 rounded-xl border border-indigo-100/60 min-h-[160px] shadow-sm whitespace-pre-wrap">
                  {generateVocationalERSSummary()}
                </div>
              </div>

              {/* Right Column: Tailored Recommendation Cards */}
              <div className="md:col-span-5 space-y-2.5">
                <h5 className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  성향 조율별 직업훈련 추천 제안
                </h5>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {(() => {
                    const results = [];
                    const domains = analysis.domainResults || [];
                    
                    domains.forEach(dom => {
                      const score = dom.convertedScore;
                      if (score <= 6) {
                        if (dom.name.includes("대인관계") || dom.name.includes("사회성") || dom.name.includes("의사소통")) {
                          results.push({
                            title: `${dom.name} 및 사회 행동 극대 상보 프로그램`,
                            desc: `환산점수 ${score}점. 소집단 롤플레잉, 감정 카드 분석 등 사회 기술 훈련(SST)을 완만한 직무 훈련 전단계에 설계하여 일차적 관계 스트레스를 예단 지원하십시오.`
                          });
                        } else if (dom.name.includes("자기조절") || dom.name.includes("독립성")) {
                          results.push({
                            title: `${dom.name} 조절 장애 예방 자립 지침`,
                            desc: `낮은 자기 관리 기능(환산 ${score}점). 출퇴근 자가 모니터링 서식을 배치하여 시간 약속 보증, 감정 체크 조율 훈련을 전수할 것을 권고합니다.`
                          });
                        } else {
                          results.push({
                            title: `${dom.name} 취약 공수 보강 가이드`,
                            desc: `해당 분야 환산 ${score}점의 극단 과부하를 배제하고 지그(Jig) 보정 기반의 수동 반복부터 집중적으로 가르쳐 규칙 유지를 확보해야 합니다.`
                          });
                        }
                      } else if (score >= 12) {
                        results.push({
                          title: `우수 강점 영역: [${dom.name}] 능력 극대화`,
                          desc: `환산점수 ${score}점의 매우 탁월한 적합도. 일반 사업체 내 중간 서포터 역할이나 생산라인 리더 훈련생 승급 등의 조기 전진 훈련 추천.`
                        });
                      }
                    });

                    if (results.length === 0) {
                      results.push({
                        title: "전반적인 균형 성향 및 직무 적응도 양호",
                        desc: "모든 ERS 평정 지표가 평균 등급에 포진하여 원만한 협조가 가능합니다. 일반 고용 및 세미 지원고용 단계로의 신속한 이송을 적극 후원합니다."
                      });
                    }

                    return results.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-xl border leading-relaxed bg-white border-indigo-100/50 shadow-sm">
                        <div className="font-bold text-[11px] text-slate-800 flex items-center gap-1 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {item.title}
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium pl-2.5">{item.desc}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor's brief notes at the very bottom */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/85 rounded-xl text-xs mb-8">
          <h5 className="font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <FileText className="h-4 w-4 text-slate-500" />
            담당 평가자 의견 및 특이사항 메모 (Evaluator Notes)
          </h5>
          <div className="text-[11px] text-slate-600 font-medium whitespace-pre-wrap pl-5">
            {test.notes ? (
              test.notes
            ) : (
              <span className="text-slate-400 italic">피평가자에 관해 기재된 평가 현장 특이 메모가 존재하지 않습니다.</span>
            )}
          </div>
        </div>

        {/* Signature Area */}
        <div id="rehab-signature-block-ers" className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs">
          <div className="text-slate-400">
            본 사회성의 측정 및 적응력 지표는 ERS 63 다차원 평가 표준 규격을 근거하여 연산 사후 분석을 거쳐 산정되었습니다.
          </div>
          
          <div className="flex gap-12 text-slate-800 font-semibold items-center shrink-0">
            <div className="text-center">
              <span className="text-slate-400 block text-[11px] font-medium mb-3">평가 작성자</span>
              <div className="border-b border-slate-300 w-28 pb-1 mb-1 font-bold">
                {test.evaluatorName ? test.evaluatorName.split(' ')[0] : '담당자'} (인)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
