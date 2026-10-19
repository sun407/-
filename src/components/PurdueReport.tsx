/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Client, PurdueTest } from '../types';
import { analyzePurdueScore } from '../data/assessmentData';
import { Printer, Calendar, User, FileText, ArrowLeft, BarChart2, MessageSquare, AlertTriangle } from 'lucide-react';

interface PurdueReportProps {
  client: Client;
  test: PurdueTest;
  onBack: () => void;
}

export default function PurdueReport({
  client,
  test,
  onBack,
}: PurdueReportProps) {
  // Analyze each component
  const chosenNormType = test.normType || '지원고용';
  const rightAnalysis = analyzePurdueScore(client.gender, 'rightHand', test.rightHand, client.handDominance, chosenNormType);
  const leftAnalysis = analyzePurdueScore(client.gender, 'leftHand', test.leftHand, client.handDominance, chosenNormType);
  const bothAnalysis = analyzePurdueScore(client.gender, 'bothHands', test.bothHands, client.handDominance, chosenNormType);
  const assemblyAnalysis = analyzePurdueScore(client.gender, 'assembly', test.assembly, client.handDominance, chosenNormType);
  
  const sumRLB = test.rightHand + test.leftHand + test.bothHands;
  const sumAnalysis = analyzePurdueScore(client.gender, 'sumRLB', sumRLB, client.handDominance, chosenNormType);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Helper values to draw custom SVG bars
  const maxBarVal = Math.max(test.rightHand, test.leftHand, test.bothHands, test.assembly, 60);

  // Dynamic automatic descriptive summary based on vocational training criteria
  const generateVocationalPurdueSummary = () => {
    const domAnalysis = client.handDominance === 'L' ? leftAnalysis : rightAnalysis;
    
    let handAnalysisText = "";
    if (domAnalysis.zScore < -1.5) {
      handAnalysisText = `■ 우세손 조작 및 기민 기능
세부 훈련지표 분석에 따르면, 우세손의 핀치 그립(Pinch Grasp) 조절성 및 미세 손동작 속도가 직업훈련 집단 평균 대비 미흡 수준(${domAnalysis.classification}, Z-score: ${domAnalysis.zScore.toFixed(2)})으로 나타납니다. 손끝으로 작은 부품이나 도구를 집어 신속하게 포장하거나 조립할 때 작업 지체가 발생하거나 정밀도가 떨어질 수 있습니다. 이에 따라 초기 작업 배치 시 단순 반복 공정 중심의 개별 훈련 단계를 선행하고, 난이도를 단계적으로 조절하는 순차적 직업적응 훈련 프로그램 배정을 권장합니다.`;
    } else if (domAnalysis.zScore < 0) {
      handAnalysisText = `■ 우세손 조작 및 기민 기능
우세손의 단순 조작 능력은 일반적인 작업 지시 수행이나 자류 선별 등의 경작업 직무에는 충분히 부합(${domAnalysis.classification}, Z-score: ${domAnalysis.zScore.toFixed(2)})하나, 정밀 속도 제어를 요하는 규격 평균치에는 소폭 도달하지 못하고 있습니다. 단순 포장이나 자재 적재 등은 단기 훈련으로도 신속 소화 가능할 것으로 보이나, 부품의 미세 체결이나 정밀도가 수반되는 조립 라인 작업에 대비하기 위해서는 숙련 기간과 지구력 보조가 요구됩니다.`;
    } else {
      handAnalysisText = `■ 우세손 조작 및 기민 기능
주요 우세손의 미세 작업 기능 및 기민 능력이 표준 규격 대비 매우 원활하고 우수한 범위(${domAnalysis.classification}, Z-score: ${domAnalysis.zScore.toFixed(2)})를 형성하고 있는 것으로 평가됩니다. 전기/전자 부품 가공, 초정밀 포장 및 조립, 부품 정밀 검수 등 섬세하고 일정한 작업 수행 속도가 지속적으로 강제되는 전문 직무 현장에 배치되었을 때 탁월한 작업 생산성을 보여줄 잠재력을 지니고 있습니다.`;
    }

    let bilateralText = "";
    const bothRatio = test.bothHands / ((test.rightHand + test.leftHand) / 2);
    if (bothAnalysis.zScore < -1.0 || bothRatio < 0.75) {
      bilateralText = `■ 양손 대칭성 및 협응 기능
또한, 양손의 대칭성 및 작업 공조력을 나타내는 양손 운동 협응 지수(Z-score: ${bothAnalysis.zScore.toFixed(2)}) 영역에서는 단일 손 조작 속도에 비해 작업 균형이 다소 떨어지는 특성이 관찰됩니다. 양손을 동시에 서로 교차하거나 대칭 형태로 각기 다른 작업을 완수해야 하는 복합 공정(예: 양손 분리 부품 장입 등) 배치 시에는 작업 중도 포기나 속도 병목이 나타날 수 있으므로, 초기에는 작업 동선이 단조로운 단독 유닛 라인의 배치와 도구적 지그(Jig) 보조를 우선적으로 제안합니다.`;
    } else {
      bilateralText = `■ 양손 대칭성 및 협응 기능
양손 협응 평점 및 대칭 기민성(Z-score: ${bothAnalysis.zScore.toFixed(2)})은 균형 잡힌 우수한 수준을 유지하고 있습니다. 생산 피드백에 맞춰 물품을 좌우로 동시 수납하거나 양손을 고르게 활용해야 하는 컨베이어 벨트 이송, 자재 교대 공급 라인 등 다방면의 협동 공정 직업훈련 시 신속한 직무 습득과 적응력을 기대해 볼 수 있습니다.`;
    }

    let assemblyText = "";
    if (assemblyAnalysis.zScore < -1.0) {
      assemblyText = `■ 다과업 조립 및 인지 기획 기능
한편, 핀-와셔-칼라 등 여러 자재의 조립 순서와 체계를 준수하는 복합 조립 검사(Assembly, Z-score: ${assemblyAnalysis.zScore.toFixed(2)}) 영역에서는 작업 공수 기획 및 동작 전환 실행 속도에 다소 지체가 발생하는 패턴이 확인됩니다. 이는 기초적인 손놀림 자체의 지체라기보다는 연속적인 다단계 순서 작업을 머릿속으로 시퀀스화하고 실행 명령을 지시하는 인지-동작 연동 병목 현상에 기인합니다. 직무 훈련 시 조립 단계를 쉽게 도식화한 시각 가이드 지그(Jig)를 적용하고 복잡도가 낮은 소단위 직무 흐름부터 훈련했을 때 눈에 띄게 작업 완성도가 개선될 수 있습니다.`;
    } else {
      assemblyText = `■ 다과업 조립 및 인지 기획 기능
다과업 연동 구성을 측정하는 복합 조립 분석(Assembly, Z-score: ${assemblyAnalysis.zScore.toFixed(2)})에서는 우수한 인지적 작업 작업 순서화 및 실행 능력이 입증되었습니다. 직무 가이드를 준수하며 주도적으로 공수 흐름을 파악하여 조립하고 검수해 나가는 일련의 전형적인 서열 정합 복합 작업에서도 훈련 성과 전이가 우월할 것으로 판정됩니다.`;
    }

    let conclusion = `[훈련 종합 처방 제언]
이처럼 본 훈련생의 작업 기능과 손놀림 기민성은 맞춤형 보조도구(Jig) 설계 및 단계별 보완 훈련을 통해 실무 능력을 충분히 유의미하게 성장시킬 수 있는 탄력적인 잠재 영역입니다. 제언하는 직업훈련 특수 중점 포인트를 토대로 집중적인 반복 연습과 숙달 과정을 배정할 것을 적극 권장합니다.`;

    return `${handAnalysisText}\n\n${bilateralText}\n\n${assemblyText}\n\n${conclusion}`;
  };

  return (
    <div id="purdue-report-container" className="space-y-6 max-w-4xl mx-auto pb-12 print:my-0 print:pb-0 px-2">
      
      {/* Back Button / Actions (Hidden in Print) */}
      <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm print:hidden">
        <button
          id="back-from-purdue-report"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          대상자 상세로 복귀
        </button>
        <button
          id="print-purdue-btn"
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <Printer className="h-4 w-4" />
          결과지 공식 인쇄 (PDF 저장)
        </button>
      </div>

      {/* Main Report Document - Optimized for standard white printing */}
      <div id="purdue-official-printable-sheet" className="bg-white border border-slate-350 p-8 rounded-2xl shadow-md space-y-8 print:border-0 print:shadow-none print:p-0 font-sans">
        
        {/* Document Header */}
        <div className="text-center relative">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 font-mono">Clinical Assessment Result Sheet</p>
          <h2 className="text-2xl font-black text-slate-850 border-b-4 border-slate-800 pb-3 mt-1 tracking-tight">
            퍼듀펙보드(Purdue Pegboard) 검사 결과지
          </h2>
          <div className="absolute right-0 top-0 text-[10px] text-slate-400 font-mono hidden pt-1">
            Rehab Assessment System V1.0
          </div>
        </div>

        {/* Demographics Area */}
        <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs rounded-lg">
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">훈련생명 / 대상자</span>
            <span className="font-bold text-slate-800 text-sm">{client.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">생년월일 / 성별</span>
            <span className="font-semibold text-slate-800">{client.birthDate} ({client.gender === 'M' ? '남성' : '여성'})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">우세손 (Dominant)</span>
            <span className="font-semibold text-slate-800">
              {client.handDominance === 'R' ? '오른손잡이' : client.handDominance === 'L' ? '왼손잡이' : '양손잡이'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold mb-0.5">장애유형</span>
            <span className="font-semibold text-indigo-850 truncate block">{client.diagnosis || '해당 없음'}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1">
            <span className="text-slate-400 block font-bold mb-0.5">검사 시행일</span>
            <span className="font-semibold text-slate-850">{test.testDate}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1 col-span-2">
            <span className="text-slate-400 block font-bold mb-0.5">담당자</span>
            <span className="font-semibold text-slate-800">{test.evaluatorName || '담당 평가자'}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1 text-right">
            <span className="text-slate-400 block font-bold mb-0.5">검사 수량 단위</span>
            <span className="font-bold text-slate-700">성공개수 (ea)</span>
          </div>
        </div>

        {/* Comparative Analysis Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <BarChart2 className="h-4 w-4 text-indigo-600" />
            항목별 상세 평정표
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3">평가 검사 세부 항목</th>
                  <th className="px-4 py-3 text-center">훈련생 점수</th>
                  <th className="px-4 py-3 text-center">기준 평균</th>
                  <th className="px-4 py-3 text-center">Z-값 (Z-Score)</th>
                  <th className="px-4 py-3 text-center">상위 백분위 기준</th>
                  <th className="px-4 py-3 text-center">평가 결과 등급</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <div>오른손 한 손 꽂기 (Right Hand, 30s) {client.handDominance === 'L' ? '[비우세손]' : '[우세손]'}</div>
                    {test.rightHandTrials && (
                      <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 select-none print:text-slate-500">
                        * 세부 회차별: [1차] {test.rightHandTrials[0]}개 | [2차] {test.rightHandTrials[1]}개 | [3차] {test.rightHandTrials[2]}개
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-700 font-mono text-sm">{test.rightHand.toFixed(2)}개</td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">{rightAnalysis.mean}개</td>
                  <td className={`px-4 py-3 text-center font-mono ${rightAnalysis.zScore < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{rightAnalysis.zScore.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 font-mono text-[11px] leading-snug">
                    <div>상위 {rightAnalysis.percentile}%</div>
                    <div className="text-[10px] text-slate-400 font-medium">(백분위 {parseFloat((100 - rightAnalysis.percentile).toFixed(1))}%)</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rightAnalysis.statusColor}`}>
                      {rightAnalysis.classification}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <div>왼손 한 손 꽂기 (Left Hand, 30s) {client.handDominance === 'L' ? '[우세손]' : '[비우세손]'}</div>
                    {test.leftHandTrials && (
                      <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 select-none print:text-slate-500">
                        * 세부 회차별: [1차] {test.leftHandTrials[0]}개 | [2차] {test.leftHandTrials[1]}개 | [3차] {test.leftHandTrials[2]}개
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-700 font-mono text-sm">{test.leftHand.toFixed(2)}개</td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">{leftAnalysis.mean}개</td>
                  <td className={`px-4 py-3 text-center font-mono ${leftAnalysis.zScore < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{leftAnalysis.zScore.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 font-mono text-[11px] leading-snug">
                    <div>상위 {leftAnalysis.percentile}%</div>
                    <div className="text-[10px] text-slate-400 font-medium">(백분위 {parseFloat((100 - leftAnalysis.percentile).toFixed(1))}%)</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${leftAnalysis.statusColor}`}>
                      {leftAnalysis.classification}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <div>양손 동시 꽂기 (Both Hands, 30s)</div>
                    {test.bothHandsTrials && (
                      <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 select-none print:text-slate-500">
                        * 세부 회차별: [1차] {test.bothHandsTrials[0]}개 | [2차] {test.bothHandsTrials[1]}개 | [3차] {test.bothHandsTrials[2]}개
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-700 font-mono text-sm">{test.bothHands.toFixed(2)}개</td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">{bothAnalysis.mean}개</td>
                  <td className={`px-4 py-3 text-center font-mono ${bothAnalysis.zScore < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{bothAnalysis.zScore.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 font-mono text-[11px] leading-snug">
                    <div>상위 {bothAnalysis.percentile}%</div>
                    <div className="text-[10px] text-slate-400 font-medium">(백분위 {parseFloat((100 - bothAnalysis.percentile).toFixed(1))}%)</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bothAnalysis.statusColor}`}>
                      {bothAnalysis.classification}
                    </span>
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-800">
                    <div>합산 점수 영역 (Right + Left + Both, 90s)</div>
                    {test.rightHandTrials && test.leftHandTrials && test.bothHandsTrials && (
                      <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 select-none print:text-slate-500">
                        * 세부 합산별: [1차] {test.rightHandTrials[0] + test.leftHandTrials[0] + test.bothHandsTrials[0]}개 | [2차] {test.rightHandTrials[1] + test.leftHandTrials[1] + test.bothHandsTrials[1]}개 | [3차] {test.rightHandTrials[2] + test.leftHandTrials[2] + test.bothHandsTrials[2]}개
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700 font-mono text-sm">
                    {sumRLB.toFixed(2)}개
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">
                    {sumAnalysis.mean}개
                  </td>
                  <td className={`px-4 py-3 text-center font-mono ${sumAnalysis.zScore < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{sumAnalysis.zScore.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 font-mono text-[11px] leading-snug">
                    <div>상위 {sumAnalysis.percentile}%</div>
                    <div className="text-[10px] text-slate-400 font-medium">(백분위 {parseFloat((100 - sumAnalysis.percentile).toFixed(1))}%)</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sumAnalysis.statusColor}`}>
                      {sumAnalysis.classification}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <div>조립 기능 검사 (Assembly, 60s)</div>
                    {test.assemblyTrials && (
                      <div className="text-[10px] text-slate-400 font-medium font-mono mt-0.5 select-none print:text-slate-500">
                        * 세부 회차별: [1차] {test.assemblyTrials[0]}개 | [2차] {test.assemblyTrials[1]}개 | [3차] {test.assemblyTrials[2]}개
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-indigo-700 font-mono text-sm">{test.assembly.toFixed(2)}개</td>
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">{assemblyAnalysis.mean}개</td>
                  <td className={`px-4 py-3 text-center font-mono ${assemblyAnalysis.zScore < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{assemblyAnalysis.zScore.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700 font-mono text-[11px] leading-snug">
                    <div>상위 {assemblyAnalysis.percentile}%</div>
                    <div className="text-[10px] text-slate-400 font-medium">(백분위 {parseFloat((100 - assemblyAnalysis.percentile).toFixed(1))}%)</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${assemblyAnalysis.statusColor}`}>
                      {assemblyAnalysis.classification}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Chart - High Fidelity Dual Comparative Bar Chart (Vertical) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <BarChart2 className="h-4.5 w-4.5 text-indigo-600" />
            검사자 실측지수 및 기준평균 대비 시범도 (Score Comparison Report - 세로막대형)
          </h4>
          <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/40 space-y-6">
            
            {(() => {
              const maxVal = Math.max(
                test.rightHand,
                rightAnalysis.mean,
                test.leftHand,
                leftAnalysis.mean,
                test.bothHands,
                bothAnalysis.mean,
                test.assembly,
                assemblyAnalysis.mean,
                test.rightHand + test.leftHand + test.bothHands,
                rightAnalysis.mean + leftAnalysis.mean + bothAnalysis.mean,
                10
              );
              
              // Clean tick calculation (step of 5 or 10 up to standard round bounds)
              const tickMax = Math.ceil(maxVal / 5) * 5;
              const tickMid = Math.round(tickMax / 2);
              const tickQuarter = Math.round(tickMax * 0.25);
              const tickThreeQuarter = Math.round(tickMax * 0.75);

              return (
                <div className="flex gap-4">
                  {/* Y-axis Ticks */}
                  <div className="flex flex-col justify-between text-[10px] font-mono text-slate-400 h-44 pb-7 pt-4 w-8 shrink-0 text-right pr-2">
                    <span>{tickMax}</span>
                    <span>{tickThreeQuarter}</span>
                    <span>{tickMid}</span>
                    <span>{tickQuarter}</span>
                    <span>0</span>
                  </div>

                  {/* Chart Body with Background helper lines */}
                  <div className="flex-1 relative h-44 border-b border-slate-300">
                    {/* Horizontal reference dashed lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0 pt-4">
                      <div className="border-t border-dashed border-slate-200 w-full" />
                      <div className="border-t border-dashed border-slate-200 w-full" />
                      <div className="border-t border-dashed border-slate-200 w-full" />
                      <div className="border-t border-dashed border-slate-200 w-full" />
                    </div>

                    {/* Bars Workspace Container */}
                    <div className="absolute inset-0 flex justify-around items-end px-2 pt-4">
                      {[
                        {
                          label: "오른손 꽂기",
                          desc: client.handDominance === 'L' ? "비우세손" : "우세손",
                          score: test.rightHand,
                          mean: rightAnalysis.mean,
                        },
                        {
                          label: "왼손 꽂기",
                          desc: client.handDominance === 'L' ? "우세손" : "비우세손",
                          score: test.leftHand,
                          mean: leftAnalysis.mean,
                        },
                        {
                          label: "양손 동시",
                          desc: "양손 협응",
                          score: test.bothHands,
                          mean: bothAnalysis.mean,
                        },
                        {
                          label: "합산 점수",
                          desc: "R + L + Both",
                          score: test.rightHand + test.leftHand + test.bothHands,
                          mean: Number((rightAnalysis.mean + leftAnalysis.mean + bothAnalysis.mean).toFixed(2)),
                        },
                        {
                          label: "조립 기능",
                          desc: "복합 기능",
                          score: test.assembly,
                          mean: assemblyAnalysis.mean,
                        },
                      ].map((item, idx) => {
                        const scoreHeight = Math.min(105, Math.max(5, (item.score / tickMax) * 100));
                        const meanHeight = Math.min(105, Math.max(5, (item.mean / tickMax) * 100));

                        return (
                          <div key={idx} className="flex flex-col items-center w-1/5 h-full justify-end group">
                            {/* The Dual Vertical Bars Wrapper */}
                            <div className="flex items-end gap-2.5 md:gap-4 relative h-28 w-full justify-center">
                              
                              {/* Left Bar: Examinee Score */}
                              <div className="flex flex-col items-center relative w-4.5 md:w-7.5 h-full justify-end">
                                {/* Floating Score text */}
                                <span className="absolute -top-5.5 text-[10.5px] font-extrabold text-indigo-650 text-indigo-700 font-mono transition-transform group-hover:scale-110">
                                  {item.score.toFixed(2)}
                                </span>
                                <div 
                                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-300 shadow-[0_-2px_8px_rgba(79,70,229,0.25)] hover:from-indigo-500 hover:to-indigo-300"
                                  style={{ height: `${scoreHeight}%` }}
                                />
                              </div>

                              {/* Right Bar: Base Mean */}
                              <div className="flex flex-col items-center relative w-4.5 md:w-7.5 h-full justify-end">
                                {/* Floating Mean text */}
                                <span className="absolute -top-5.5 text-[10px] font-bold text-slate-500 font-mono">
                                  {item.mean}
                                </span>
                                <div 
                                  className="w-full bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-md transition-all duration-300 shadow-[0_-2px_4px_rgba(100,116,139,0.1)] hover:from-slate-500 hover:to-slate-300"
                                  style={{ height: `${meanHeight}%` }}
                                />
                              </div>

                            </div>

                            {/* Labels under the baseline */}
                            <div className="pt-2 text-center">
                              <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                                {item.label}
                              </span>
                              <span className="block text-[9px] text-slate-450 font-extrabold whitespace-nowrap mt-0.5">
                                ({item.desc})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Legend info */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-200 text-[10.5px]">
              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="inline-block w-4 h-3 bg-gradient-to-r from-indigo-600 to-indigo-450 rounded" />
                  <strong>검사자 실측 점수</strong>: 훈련생 실제 성공 횟수 (ea)
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="inline-block w-4 h-3 bg-gradient-to-r from-slate-400 to-slate-250 rounded" />
                  <strong>기준 평균</strong>: 표준 {chosenNormType} 평균치 (우세 {rightAnalysis.mean} / 비우세 {leftAnalysis.mean} / 양손 {bothAnalysis.mean} / 조립 {assemblyAnalysis.mean})
                </span>
              </div>
              <div className="text-[10px] text-slate-500 bg-slate-100/50 p-2 rounded border border-slate-200 mt-1">
                <strong>💡 평가등급 수치기준 (백분위, Percentile)</strong>: 
                <span className="ml-2 font-medium">
                  매우 우수 (백분위 84% 이상) | 우수 (백분위 60% ~ 84% 미만) | 보통 (백분위 40% ~ 60% 미만) | 미흡 (백분위 16% ~ 40% 미만) | 매우 미흡 (백분위 16% 미만)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Vocational Summary & Recommendations */}
        <div className="border-t border-slate-200 pt-6">
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-5 mb-6">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 mb-4 pb-2 border-b border-indigo-100/50">
              <FileText className="h-4 w-4 text-indigo-600" />
              직무수행능력 종합 평가 및 직업훈련 제언 (Vocational Performance Assessment & Training Recommendations)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Comprehensive Paragraph */}
              <div className="md:col-span-7 space-y-2.5">
                <h5 className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  작업 기능 종합 평가 소견 (Evaluator Vocational Opinion)
                </h5>
                <div className="text-[11.5px] text-slate-700 leading-relaxed bg-white/90 p-4 rounded-xl border border-indigo-100/60 min-h-[160px] shadow-sm whitespace-pre-wrap">
                  {generateVocationalPurdueSummary()}
                </div>
              </div>

              {/* Right Column: Key Diagnostic Trait Cards */}
              <div className="md:col-span-5 space-y-2.5">
                <h5 className="text-[11px] font-bold text-indigo-950 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  영역별 맞춤 직업훈련 처방
                </h5>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {(() => {
                    const domAnalysis = client.handDominance === 'L' ? leftAnalysis : rightAnalysis;
                    const recs = [];

                    // 1. Dominant Hand Dexterity Analysis
                    if (domAnalysis.zScore < -1.5) {
                      recs.push({
                        title: "우세손 미세 손끝 민첩성 정밀 강화",
                        desc: `우세손 편차 하위권(${domAnalysis.classification}, Z-score: ${domAnalysis.zScore.toFixed(2)}) 확인. 나사, 핀 등 극소부품 적재를 지양하고 두꺼운 나사체결 혹은 점진식 가스켓 핀치(Graded Pinch) 그립 연습부터 수행을 권고합니다.`
                      });
                    } else if (domAnalysis.zScore < 0) {
                      recs.push({
                        title: "우세손 조작 정밀성 촉진 및 피로 감소",
                        desc: `Z-score ${domAnalysis.zScore.toFixed(2)}로 평균치에 소폭 미진함. 단순 사무지원/분류 배치는 우수하나 타임벨이 구획된 반복 정밀 공정 시 근지구력 훈련을 선행 적용할 것을 제안합니다.`
                      });
                    } else {
                      recs.push({
                        title: "우세손 기민 능력 우수 (상용생산 적합)",
                        desc: `우세손 지표 우수(Z-score: ${domAnalysis.zScore.toFixed(2)}) 수준으로 전기전자 부품 어셈블리 및 하이테크 분류에서 우월한 기초 작업 속도 유지가 기대됩니다.`
                      });
                    }

                    // 2. Bilateral Integration
                    const bothRatio = test.bothHands / ((test.rightHand + test.leftHand) / 2);
                    if (bothAnalysis.zScore < -1.0 || bothRatio < 0.75) {
                      recs.push({
                        title: "좌우 양손 통합 협응 조율 훈련",
                        desc: `양손 대칭 속도가 급격히 지체되어 대뇌 운동 협조 불일치가 관찰됩니다. 동시 집기보다는 교대 동작 훈련선상에 배치하고 대칭 메트로놈 반복 틀을 설계하는 것이 유리합니다.`
                      });
                    } else {
                      recs.push({
                        title: "양손 협동 대칭성 양호 보존",
                        desc: `양손 기민 지수(Z-score: ${bothAnalysis.zScore.toFixed(2)})가 안정되고 대칭적이므로 컨베이어 벨트 공급, 원자재 자동 정렬 이송 라인에서 탁월한 양수 전공정 속도 전이가 보장됩니다.`
                      });
                    }

                    // 3. Cognitive-Motor Sequencing (Assembly)
                    if (assemblyAnalysis.zScore < -1.0) {
                      recs.push({
                        title: "조립 시퀀스 인지 기획 공정 보정",
                        desc: `조립 지수 지연(${assemblyAnalysis.classification}) 관찰. 작업 전개 도면만 제공하는 대신 부품 분류 트레이를 계통 분리하고 시각 가이드 지그(Jig)로 경로 가시성을 극대화하십시오.`
                      });
                    } else {
                      recs.push({
                        title: "시퀀스 논리 구성 지각 우수",
                        desc: `조립 Z-score가 ${assemblyAnalysis.zScore.toFixed(2)}로 다단계 구성 지침 숙지가 양호합니다. 포장 매뉴얼 완수나 중간 복합 체결 라인 투입 시 숙련이 매우 신속할 것입니다.`
                      });
                    }

                    // 4. Occupational Fit
                    let jobVerdict = "";
                    if (assemblyAnalysis.zScore >= 0.0 && domAnalysis.zScore >= 0.0) {
                      jobVerdict = "고정밀 전기전자 부품 어셈블리, 반도체 가공 검수, 고밀도 포장물류 라인 적임 기질 보존";
                    } else if (assemblyAnalysis.zScore >= -1.0 && domAnalysis.zScore >= -1.0) {
                      jobVerdict = "규격 자재 정렬, 사출탈형 포장, 단순 수동 기계 제어 가공 및 분류 계열 권장";
                    } else {
                      jobVerdict = "단순 정량 적재, 구상화 보호작업 패키징, 정형화된 지그 보조 반복 조립 영역 매칭";
                    }

                    recs.push({
                      title: "최적 직업 매칭 처방",
                      desc: jobVerdict
                    });

                    return recs.map((rec, i) => (
                      <div key={i} className="p-2.5 rounded-xl border leading-relaxed bg-white border-indigo-100/50 shadow-sm">
                        <div className="font-bold text-[11px] text-slate-800 flex items-center gap-1 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {rec.title}
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium pl-2.5">{rec.desc}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Observations & Brief Notes (Show briefly at the bottom) */}
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

        {/* Official Signature Lines */}
        <div id="rehab-signature-block" className="pt-8 flex justify-between items-end border-t border-slate-200">
          <div className="text-xs text-slate-400">
            본 결과지는 퍼듀펙보드(Purdue Pegboard) 표준 매뉴얼에 의거하여 공식 평가 및 분석되었습니다.
          </div>
          
          <div className="flex gap-12 text-sm text-slate-800 font-semibold items-center">
            <div className="text-center">
              <span className="text-slate-400 block text-xs font-medium mb-3">검사 담당자</span>
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



