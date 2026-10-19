import React from 'react';
import { Client, SituationEvaluationLog, ComprehensiveEvaluationReport } from '../types';
import { COMPREHENSIVE_EVALUATION_QUESTIONS } from '../data/evaluationConstants';
import { Printer, ArrowLeft } from 'lucide-react';

interface SituationEvaluationReportProps {
  client: Client;
  situationLog: SituationEvaluationLog;
  comprehensiveReport?: ComprehensiveEvaluationReport;
  onBack: () => void;
}

export default function SituationEvaluationReport({
  client,
  situationLog,
  comprehensiveReport,
  onBack,
}: SituationEvaluationReportProps) {
  const handlePrint = () => {
    window.print();
  };

  // 장애유형 정보
  const disabilityText = client.intakeRecord
    ? `${client.intakeRecord.disabilityName || client.diagnosis || '지적장애'} / ${client.intakeRecord.disabilityGrade || '심한장애'}`
    : (situationLog.disabilityInfo || '지적장애 / 심한');

  // 종합평가 카테고리별 그룹화
  const categories: Array<'근무태도' | '대인관계' | '작업태도' | '작업수행'> = [
    '근무태도',
    '대인관계',
    '작업태도',
    '작업수행',
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* 상단 툴바 (인쇄 시 숨김) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> 뒤로가기
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-150 transition-all"
          >
            <Printer className="w-4 h-4" /> 출력 / PDF 저장
          </button>
        </div>
      </div>

      {/* A4 인쇄 영역 Container */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0">
        
        {/* ==================== PAGE 1: 상황평가일지 ==================== */}
        <div className="bg-white p-8 md:p-12 shadow-lg rounded-none print:shadow-none print:p-0 w-full min-h-[1000px] border border-slate-300 print:border-none print:page-break-after-always">
          
          {/* Header & Title */}
          <div className="relative mb-6">
            <h1 className="text-2xl font-black text-center tracking-widest text-black pt-2">
              직업적응훈련반 상황평가일지
            </h1>

            {/* 결재란 (출력 후 직인/도장 날인 가능하도록 빈 칸 유지) */}
            <div className="absolute top-0 right-0 border border-slate-800 text-xs">
              <table className="border-collapse text-center">
                <tbody>
                  <tr>
                    <td rowSpan={2} className="border-r border-slate-800 bg-slate-100 font-bold px-1.5 py-1 w-6">
                      결<br />재
                    </td>
                    <td className="border-r border-b border-slate-800 font-bold px-3 py-0.5 w-16">담 당</td>
                    <td className="border-b border-slate-800 font-bold px-3 py-0.5 w-16">팀 장</td>
                  </tr>
                  <tr>
                    <td className="border-r border-slate-800 h-12 w-16"></td>
                    <td className="h-12 w-16"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 mb-4">
            {/* 기본정보 테이블 */}
            <table className="w-full border-collapse border border-slate-800 text-center text-xs">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[22%]" />
                <col className="w-[28%]" />
              </colgroup>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">훈련생명</td>
                  <td className="border-r border-slate-800 py-2 font-semibold">{client.name}</td>
                  <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">생년월일</td>
                  <td className="border-r border-slate-800 py-2">{client.birthDate || '-'}</td>
                  <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">평가기간</td>
                </tr>
                <tr>
                  <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">장애유형/정도</td>
                  <td colSpan={3} className="border-r border-slate-800 py-2 text-center">
                    {disabilityText}
                  </td>
                  <td className="py-2 text-center font-medium">
                    {situationLog.startDate} ~ {situationLog.endDate}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 상황평가 일지 테이블 */}
          <table className="w-full border-collapse border border-slate-800 text-center text-xs table-fixed">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
              <col className="w-[25%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                <th className="border-r border-slate-800 py-2">구분</th>
                <th className="border-r border-slate-800 py-2">훈련일자</th>
                <th className="border-r border-slate-800 py-2">출석/결석/<br />지각/조퇴</th>
                <th className="border-r border-slate-800 py-2">훈련시간</th>
                <th className="border-r border-slate-800 py-2">훈련과정</th>
                <th className="py-2">평가 및 지도사항</th>
              </tr>
            </thead>
            <tbody>
              {situationLog.rows.map((row, idx) => (
                <tr key={row.id || idx} className="border-b border-slate-800 h-9">
                  {idx === 0 && (
                    <td
                      rowSpan={situationLog.rows.length}
                      className="border-r border-slate-800 bg-slate-50 font-bold text-center py-2 align-middle text-[11px]"
                    >
                      상<br />황<br />평<br />가
                    </td>
                  )}
                  <td className="border-r border-slate-800 py-1 font-medium">{row.date}</td>
                  <td className="border-r border-slate-800 py-1 font-medium">{row.attendance}</td>
                  <td className="border-r border-slate-800 py-1 text-[11px]">{row.trainingTime}</td>
                  <td className="border-r border-slate-800 py-1 px-1.5 text-left text-[11px] truncate">
                    {row.taskName}
                  </td>
                  <td className="py-1 px-2 text-left text-[11px] whitespace-pre-wrap leading-tight">
                    {row.evaluationNote ? `- ${row.evaluationNote}` : '-'}
                  </td>
                </tr>
              ))}

              {/* 행 개수가 부족할 때 빈 행 채우기 */}
              {Array.from({ length: Math.max(0, 10 - situationLog.rows.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-800 h-9">
                  {situationLog.rows.length === 0 && i === 0 && (
                    <td
                      rowSpan={10}
                      className="border-r border-slate-800 bg-slate-50 font-bold text-center py-2 align-middle"
                    >
                      상<br />황<br />평<br />가
                    </td>
                  )}
                  <td className="border-r border-slate-800 py-1"></td>
                  <td className="border-r border-slate-800 py-1"></td>
                  <td className="border-r border-slate-800 py-1"></td>
                  <td className="border-r border-slate-800 py-1"></td>
                  <td className="py-1"></td>
                </tr>
              ))}

              {/* 특이사항 */}
              <tr>
                <td className="border-r border-slate-800 bg-slate-100 font-bold py-3 text-center">
                  특<br />이<br />사<br />항
                </td>
                <td colSpan={5} className="text-left p-3 align-top min-h-[80px]">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800">
                    {situationLog.specialNotes || '특이사항 없음.'}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ==================== PAGE 2: 훈련생 종합 평가기록부 ==================== */}
        {comprehensiveReport && (
          <div className="bg-white p-8 md:p-12 shadow-lg rounded-none print:shadow-none print:p-0 w-full min-h-[1000px] border border-slate-300 print:border-none print:page-break-before-always">
            
            {/* Header & Title */}
            <div className="relative mb-6">
              <h1 className="text-2xl font-black text-center tracking-widest text-black pt-2">
                훈련생 종합 평가기록부
              </h1>

              {/* 결재란 (출력 후 직인/도장 날인 가능하도록 빈 칸 유지) */}
              <div className="absolute top-0 right-0 border border-slate-800 text-xs">
                <table className="border-collapse text-center">
                  <tbody>
                    <tr>
                      <td rowSpan={2} className="border-r border-slate-800 bg-slate-100 font-bold px-1.5 py-1 w-6">
                        결<br />재
                      </td>
                      <td className="border-r border-b border-slate-800 font-bold px-3 py-0.5 w-16">담 당</td>
                      <td className="border-b border-slate-800 font-bold px-3 py-0.5 w-16">팀 장</td>
                    </tr>
                    <tr>
                      <td className="border-r border-slate-800 h-12 w-16"></td>
                      <td className="h-12 w-16"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 mb-4">
              {/* 기본정보 테이블 */}
              <table className="w-full border-collapse border border-slate-800 text-center text-xs">
                <colgroup>
                  <col className="w-[15%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[22%]" />
                  <col className="w-[28%]" />
                </colgroup>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">훈련생명</td>
                    <td className="border-r border-slate-800 py-2 font-semibold">{client.name}</td>
                    <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">생년월일</td>
                    <td className="border-r border-slate-800 py-2">{client.birthDate || '-'}</td>
                    <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">평가기간</td>
                  </tr>
                  <tr>
                    <td className="border-r border-slate-800 bg-slate-100 font-bold py-2">장애유형/정도</td>
                    <td colSpan={3} className="border-r border-slate-800 py-2 text-center">
                      {disabilityText}
                    </td>
                    <td className="py-2 text-center font-medium">
                      {comprehensiveReport.startDate} ~ {comprehensiveReport.endDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 종합 평가 평가지표 테이블 */}
            <table className="w-full border-collapse border border-slate-800 text-center text-xs table-fixed">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[50%]" />
                <col className="w-[12%]" />
                <col className="w-[28%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                  <th colSpan={2} className="border-r border-slate-800 py-2">구 분</th>
                  <th className="border-r border-slate-800 py-2">평가 (점수)</th>
                  <th className="py-2">평 가 소 견</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const qList = COMPREHENSIVE_EVALUATION_QUESTIONS.filter((q) => q.category === cat);
                  const comment = comprehensiveReport.categoryComments?.[cat] || '-';

                  return qList.map((q, qIdx) => {
                    const score = comprehensiveReport.scores[q.id] || 0;

                    return (
                      <tr key={q.id} className="border-b border-slate-800 h-8">
                        {qIdx === 0 && (
                          <td
                            rowSpan={qList.length}
                            className="border-r border-slate-800 bg-slate-50 font-bold text-center py-2 align-middle text-[11px]"
                          >
                            {cat.split('').join('\n')}
                          </td>
                        )}
                        <td className="border-r border-slate-800 px-3 py-1 text-left text-[11px]">
                          {q.text}
                        </td>
                        <td className="border-r border-slate-800 py-1 font-extrabold text-indigo-900">
                          {score > 0 ? `${score}점` : '-'}
                        </td>
                        {qIdx === 0 && (
                          <td
                            rowSpan={qList.length}
                            className="p-2 text-left align-middle text-[11px] leading-relaxed whitespace-pre-wrap"
                          >
                            {comment}
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}

                {/* 총점 행 */}
                <tr className="border-b border-slate-800 bg-slate-100 font-bold h-10">
                  <td colSpan={2} className="border-r border-slate-800 py-2 text-center text-sm">
                    총 점 (만점 100점)
                  </td>
                  <td className="border-r border-slate-800 py-2 text-base font-black text-indigo-700">
                    {comprehensiveReport.totalScore} 점
                  </td>
                  <td className="p-2 text-center font-bold text-slate-400 text-xs">
                    -
                  </td>
                </tr>

                {/* 비고 채점 기준 */}
                <tr>
                  <td className="border-r border-slate-800 bg-slate-100 font-bold py-2 text-center">비고</td>
                  <td colSpan={3} className="p-2 text-left text-[11px] text-slate-700">
                    ※ 항목별 점수채점 : 우수 5점, 양호 4점, 보통 3점, 미흡 2점, 불량 1점
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
