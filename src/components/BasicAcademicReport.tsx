import React from 'react';
import { Client, BasicAcademicTest } from '../types';
import { ArrowLeft, Printer, CheckCircle2, XCircle } from 'lucide-react';

interface BasicAcademicReportProps {
  client: Client;
  test: BasicAcademicTest;
  onBack: () => void;
}

export default function BasicAcademicReport({
  client,
  test,
  onBack,
}: BasicAcademicReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const pCheck = test.personalInfoCheck;
  const numConcept = test.numberConcept;
  const perc = test.perception;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="no-print flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-md">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          개별파일 목록으로
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold">
            검사일자: {test.testDate} (평가사: {test.evaluatorName})
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="h-4 w-4" />
            기록지 인쇄 / PDF 저장
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-slate-200 text-slate-900 print:shadow-none print:p-0 print:border-none print:rounded-none">
        
        {/* Title Header */}
        <div className="text-center pb-6 mb-6 border-b-2 border-slate-800">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            기초학력수준 검사 기록지
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            수원시장애인종합복지관 직업적응훈련반
          </p>
        </div>

        {/* 2 Column Layout (Left: 1 & 2, Right: 3) to match PDF image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          
          {/* Left Column: 1. 신상정보 인지 & 2. 수 개념 */}
          <div className="space-y-6">
            
            {/* 1. 신상정보 인지 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-800 font-bold text-xs flex justify-between items-center">
                <span>1. 신상정보 인지 (인지 여부 O, X 체크)</span>
              </div>

              <table className="w-full text-xs text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300 w-24">이름 / 성별</td>
                    <td className="p-2 border-r border-slate-300">{client.name} / {client.gender === 'M' ? '남' : '여'}</td>
                    <td className="p-2 text-center font-extrabold w-12">{pCheck.nameGender ? 'O' : 'X'}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">생년월일</td>
                    <td className="p-2 border-r border-slate-300">{client.birthDate}</td>
                    <td className="p-2 text-center font-extrabold">{pCheck.birthDate ? 'O' : 'X'}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">검사일 / 장애</td>
                    <td className="p-2 border-r border-slate-300">{test.testDate} / {client.diagnosis || '-'}</td>
                    <td className="p-2 text-center font-extrabold">{pCheck.testDate ? 'O' : 'X'}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">집 주소</td>
                    <td className="p-2 border-r border-slate-300">거주지 주소 인지 여부</td>
                    <td className="p-2 text-center font-extrabold">{pCheck.address ? 'O' : 'X'}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">가족 구성원</td>
                    <td className="p-2 border-r border-slate-300">가족 구성원 및 이름 인지</td>
                    <td className="p-2 text-center font-extrabold">{pCheck.family ? 'O' : 'X'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold bg-slate-50 border-r border-slate-300">연락처 인지</td>
                    <td className="p-2 border-r border-slate-300 text-[11px] leading-relaxed">
                      1. 부모님: {pCheck.parentPhone ? 'O' : 'X'}<br/>
                      2. 본인: {pCheck.selfPhone ? 'O' : 'X'}<br/>
                      3. 집전화: {pCheck.homePhone ? 'O' : 'X'}
                    </td>
                    <td className="p-2 text-center font-extrabold">
                      {(pCheck.parentPhone && pCheck.selfPhone) ? 'O' : '△'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. 수 개념 */}
            <div className="border border-slate-800 rounded-xl overflow-hidden space-y-3 p-3">
              <h3 className="font-bold text-xs bg-slate-100 p-2 rounded-lg border border-slate-300">
                2. 수 개념
              </h3>

              {/* 1) 받아 적기 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">※ 평가사가 말하는 숫자를 적어주세요</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">1) 한 자리 숫자</span>
                    <strong className="text-sm font-black">{numConcept.dictationSingle || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">2) 두 자리 숫자</span>
                    <strong className="text-sm font-black">{numConcept.dictationDouble || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">3) 세 자리 숫자</span>
                    <strong className="text-sm font-black">{numConcept.dictationTriple || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* 2) 큰 수 표시 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">※ 큰 수에 ○ 표시 해 주세요.</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center font-bold">
                  <div>
                    3 / <span className={numConcept.biggerChoice1 === 8 ? 'underline font-black text-indigo-700' : ''}>8</span> (선택: {numConcept.biggerChoice1 || '-'})
                  </div>
                  <div>
                    <span className={numConcept.biggerChoice2 === 23 ? 'underline font-black text-indigo-700' : ''}>23</span> / 19 (선택: {numConcept.biggerChoice2 || '-'})
                  </div>
                  <div>
                    <span className={numConcept.biggerChoice3 === 325 ? 'underline font-black text-indigo-700' : ''}>325</span> / 125 (선택: {numConcept.biggerChoice3 || '-'})
                  </div>
                </div>
              </div>

              {/* 3) 계산 문제 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">※ 다음 문제를 계산하세요.</p>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center">
                  <div>3 + 4 = <strong>{numConcept.calc3Plus4 || '-'}</strong></div>
                  <div>23 + 11 = <strong>{numConcept.calc23Plus11 || '-'}</strong></div>
                  <div>7 - 2 = <strong>{numConcept.calc7Minus2 || '-'}</strong></div>
                  <div>16 - 3 = <strong>{numConcept.calc16Minus3 || '-'}</strong></div>
                  <div>3 × 5 = <strong>{numConcept.calc3Times5 || '-'}</strong></div>
                  <div>10 × 11 = <strong>{numConcept.calc10Times11 || '-'}</strong></div>
                  <div>25 ÷ 5 = <strong>{numConcept.calc25Div5 || '-'}</strong></div>
                  <div>12 ÷ 2 = <strong>{numConcept.calc12Div2 || '-'}</strong></div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: 3. 지각능력 */}
          <div className="space-y-6">
            <div className="border border-slate-800 rounded-xl overflow-hidden p-3 space-y-4">
              <h3 className="font-bold text-xs bg-slate-100 p-2 rounded-lg border border-slate-300">
                3. 지각능력 및 인지기능
              </h3>

              {/* 1) 길이 지각 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">1) 길이 지각 (※ 더 긴 막대에 ○ 표시)</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>선택 결과: <strong>{perc.lengthChoice === 'long' ? '막대 B (긴 막대 - 정답)' : perc.lengthChoice === 'short' ? '막대 A (오답)' : '미선택'}</strong></span>
                </div>
              </div>

              {/* 2) 방향 지각 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">2) 방향 지각</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div>※ 오른쪽 화살표: <strong>{perc.directionRight === 'right' ? '➡️ (정답)' : perc.directionRight || '미선택'}</strong></div>
                  <div>※ 위쪽 화살표: <strong>{perc.directionUp === 'up' ? '⬆️ (정답)' : perc.directionUp || '미선택'}</strong></div>
                </div>
              </div>

              {/* 3) 모양 지각 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">3) 모양 지각 (도형 명칭)</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-1 text-[11px]">
                  <div>원: {perc.shapes.circle || '-'}</div>
                  <div>삼각형: {perc.shapes.triangle || '-'}</div>
                  <div>사각형: {perc.shapes.square || '-'}</div>
                  <div>마름모: {perc.shapes.diamond || '-'}</div>
                  <div>타원: {perc.shapes.oval || '-'}</div>
                </div>
              </div>

              {/* 4) 색 인지 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">4) 색 인지 (색상 명칭)</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-1 text-[11px]">
                  <div>빨간색: {perc.colors.red || '-'}</div>
                  <div>초록색: {perc.colors.green || '-'}</div>
                  <div>노란색: {perc.colors.yellow || '-'}</div>
                  <div>파란색: {perc.colors.blue || '-'}</div>
                </div>
              </div>

              {/* 5) 시간 인지 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">5) 시간 인지 (시계 읽기)</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div>시계 1 (아날로그): {perc.timeAnalogHour || '-'}시 {perc.timeAnalogMinute || '-'}분</div>
                  <div>시계 2 (디지털): {perc.timeDigitalHour || '-'}시 {perc.timeDigitalMinute || '-'}분</div>
                </div>
              </div>

              {/* 6) 독해 능력 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">6) 독해 능력 (“의사가 양치질을 해야 한다.”)</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                  <div>① 누가: {perc.reading1 || '-'}</div>
                  <div>② 무엇을: {perc.reading2 || '-'}</div>
                  <div>③ 왜: {perc.reading3 || '-'}</div>
                </div>
              </div>

              {/* 7) 쓰기 능력 */}
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-700">7) 쓰기 능력 (받아쓰기)</p>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                  <div>① {perc.writing1 || '-'}</div>
                  <div>② {perc.writing2 || '-'}</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Overall Evaluator Opinion Footer */}
        {test.overallNotes && (
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">■ 담당 교사 종합 의견</h4>
            <p className="p-3 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed whitespace-pre-wrap">
              {test.overallNotes}
            </p>
          </div>
        )}

        {/* Footer Emblem / Signature */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-[11px] text-slate-500 font-bold">
          <span>사회복지법인 수원성교회복지재단 수원시장애인종합복지관</span>
          <span>담당 평가사: {test.evaluatorName} (서명/인)</span>
        </div>

      </div>
    </div>
  );
}
