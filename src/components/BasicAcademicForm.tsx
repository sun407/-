import React, { useState } from 'react';
import { Client, BasicAcademicTest } from '../types';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Calculator,
  Eye,
  Check,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface BasicAcademicFormProps {
  client: Client;
  onSave: (test: BasicAcademicTest) => void;
  onCancel: () => void;
}

export default function BasicAcademicForm({
  client,
  onSave,
  onCancel,
}: BasicAcademicFormProps) {
  const [evaluatorName, setEvaluatorName] = useState('담당 교사');
  const [testDate, setTestDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. 신상정보 인지 (담당자가 O, X 체크)
  const [personalInfo, setPersonalInfo] = useState({
    nameGender: true,
    birthDate: true,
    testDate: true,
    disabilityInfo: true,
    address: true,
    family: true,
    parentPhone: true,
    selfPhone: true,
    homePhone: false,
  });

  // 2. 수 개념
  const [numberConcept, setNumberConcept] = useState({
    dictationSingle: '',
    dictationDouble: '',
    dictationTriple: '',
    biggerChoice1: null as number | null, // 3 vs 8
    biggerChoice2: null as number | null, // 23 vs 19
    biggerChoice3: null as number | null, // 325 vs 125
    calc3Plus4: '',
    calc23Plus11: '',
    calc7Minus2: '',
    calc16Minus3: '',
    calc3Times5: '',
    calc10Times11: '',
    calc25Div5: '',
    calc12Div2: '',
  });

  // 3. 지각능력
  const [perception, setPerception] = useState({
    lengthChoice: null as 'short' | 'long' | null,
    directionRight: null as 'left' | 'right' | 'up' | 'down' | null,
    directionUp: null as 'left' | 'right' | 'up' | 'down' | null,
    shapes: {
      circle: '',
      triangle: '',
      square: '',
      diamond: '',
      oval: '',
    },
    colors: {
      red: '',
      green: '',
      yellow: '',
      blue: '',
    },
    timeAnalogHour: '',
    timeAnalogMinute: '',
    timeDigitalHour: '',
    timeDigitalMinute: '',
    reading1: '',
    reading2: '',
    reading3: '',
    writing1: '',
    writing2: '',
  });

  const [overallNotes, setOverallNotes] = useState('');

  // 헬퍼: 1번 신상정보 O 개수
  const personalInfoScore = Object.values(personalInfo).filter(Boolean).length;

  // 헬퍼: 수개념 큰 수 정답 개수
  const biggerCorrectCount =
    (numberConcept.biggerChoice1 === 8 ? 1 : 0) +
    (numberConcept.biggerChoice2 === 23 ? 1 : 0) +
    (numberConcept.biggerChoice3 === 325 ? 1 : 0);

  // 헬퍼: 수개념 계산 정답 개수
  const calcCorrectCount =
    (numberConcept.calc3Plus4.trim() === '7' ? 1 : 0) +
    (numberConcept.calc23Plus11.trim() === '34' ? 1 : 0) +
    (numberConcept.calc7Minus2.trim() === '5' ? 1 : 0) +
    (numberConcept.calc16Minus3.trim() === '13' ? 1 : 0) +
    (numberConcept.calc3Times5.trim() === '15' ? 1 : 0) +
    (numberConcept.calc10Times11.trim() === '110' ? 1 : 0) +
    (numberConcept.calc25Div5.trim() === '5' ? 1 : 0) +
    (numberConcept.calc12Div2.trim() === '6' ? 1 : 0);

  const handleSaveAll = () => {
    const newTest: BasicAcademicTest = {
      id: 'academic_' + Math.random().toString(36).substring(2, 11),
      clientId: client.id,
      testDate,
      evaluatorName,
      personalInfoCheck: personalInfo,
      numberConcept,
      perception,
      overallNotes,
      createdAt: new Date().toISOString(),
    };
    onSave(newTest);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-slate-300 hover:text-white transition-all"
            title="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded-lg text-[11px] font-black">
                태블릿 / 인터랙티브 검사
              </span>
              <h1 className="text-xl font-extrabold tracking-tight">
                기초학력수준 검사 (Basic Academic Ability Test)
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              훈련생: <strong className="text-white">{client.name}</strong> ({client.gender === 'M' ? '남성' : '여성'}, {client.trainingClass || '직업적응훈련반'})
            </p>
          </div>
        </div>

        {/* Input meta info */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">검사일자</span>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="bg-slate-900 text-white px-2 py-1 rounded-lg border border-slate-600 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">평가사</span>
            <input
              type="text"
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              className="bg-slate-900 text-white px-2 py-1 rounded-lg border border-slate-600 font-semibold w-24 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Interactive Step Navigator Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveStep(1)}
          className={`p-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-between border ${
            activeStep === 1
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${activeStep === 1 ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
              1
            </span>
            <span>1. 신상정보 인지</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeStep === 1 ? 'bg-indigo-800/60 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
            담당자 O,X
          </span>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`p-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-between border ${
            activeStep === 2
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${activeStep === 2 ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
              2
            </span>
            <span>2. 수 개념</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeStep === 2 ? 'bg-indigo-800/60 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
            터치/마우스
          </span>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`p-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-between border ${
            activeStep === 3
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${activeStep === 3 ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
              3
            </span>
            <span>3. 지각 및 인지능력</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeStep === 3 ? 'bg-indigo-800/60 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
            터치/마우스
          </span>
        </button>

        <button
          onClick={() => setActiveStep(4)}
          className={`p-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-between border ${
            activeStep === 4
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${activeStep === 4 ? 'bg-white text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              4
            </span>
            <span>4. 종합 결과 저장</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeStep === 4 ? 'bg-emerald-800/60 text-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
            저장 / 완료
          </span>
        </button>
      </div>

      {/* STEP 1: 신상정보 인지 (담당자가 O, X 체크) */}
      {activeStep === 1 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <div>
              <h2 className="text-sm font-black text-amber-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                1. 신상정보 인지 검사 (담당자 체크 영역)
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                ※ 담당 평가사가 훈련생에게 구두 질문 후, 훈련생이 올바르게 인지하여 답하면 [ O ], 인지하지 못하거나 미응답 시 [ X ]를 클릭하세요.
              </p>
            </div>
            <div className="px-3.5 py-1.5 bg-amber-200/60 rounded-xl text-amber-900 font-extrabold text-xs">
              인지 성공: <strong className="text-amber-950 text-sm">{personalInfoScore}</strong> / 9 개
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { key: 'nameGender', label: '이름 / 성별 인지', detail: '본인의 이름과 성별을 정확히 인지하는가?' },
              { key: 'birthDate', label: '생년월일 인지', detail: '본인의 생년월일을 말하거나 인지하는가?' },
              { key: 'testDate', label: '검사일 (오늘 날짜) 인지', detail: '오늘이 몇 월 며칠인지 인지하는가?' },
              { key: 'disabilityInfo', label: '장애유형 / 정도 인지', detail: '자신의 장애 상태나 유형을 인지하는가?' },
              { key: 'address', label: '집 주소 인지', detail: '거주하고 있는 집 주소를 말하거나 인지하는가?' },
              { key: 'family', label: '가족 구성원 및 가족이름', detail: '함께 사는 가족 구성원과 이름을 말하는가?' },
              { key: 'parentPhone', label: '1. 부모님 핸드폰 번호', detail: '부모님의 연락처를 인지하거나 암기하는가?' },
              { key: 'selfPhone', label: '2. 본인 핸드폰 번호', detail: '본인의 연락처를 정확히 기억하는가?' },
              { key: 'homePhone', label: '3. 집 전화번호', detail: '집 유선전화 번호를 인지하는가?' },
            ].map((item) => {
              const isChecked = personalInfo[item.key as keyof typeof personalInfo];
              return (
                <div
                  key={item.key}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    isChecked
                      ? 'bg-indigo-50/50 border-indigo-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-slate-800 block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {item.detail}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          [item.key]: true,
                        }))
                      }
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isChecked
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      O (인지)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPersonalInfo((prev) => ({
                          ...prev,
                          [item.key]: false,
                        }))
                      }
                      className={`py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        !isChecked
                          ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      X (미인지)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveStep(2)}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              다음: 2. 수 개념 검사로 이동 →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 수 개념 (터치 / 마우스 직접 수행) */}
      {activeStep === 2 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
            <h2 className="text-sm font-black text-indigo-900 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-600" />
              2. 수 개념 검사 (터치 / 마우스 직접 반응 영역)
            </h2>
            <p className="text-xs text-indigo-800 mt-1">
              ※ 태블릿 화면에서 훈련생이 직접 숫자를 터치하거나 정답 항목을 누를 수 있습니다.
            </p>
          </div>

          {/* 2-1) 숫자 받아 적기 */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              1) 평가사가 말하는 숫자 받아 적기/입력
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ① 한 자리 숫자 (예: 7)
                </label>
                <input
                  type="text"
                  value={numberConcept.dictationSingle}
                  onChange={(e) =>
                    setNumberConcept((prev) => ({
                      ...prev,
                      dictationSingle: e.target.value,
                    }))
                  }
                  placeholder="한 자리 입력"
                  className="w-full text-center text-lg font-black p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ② 두 자리 숫자 (예: 28)
                </label>
                <input
                  type="text"
                  value={numberConcept.dictationDouble}
                  onChange={(e) =>
                    setNumberConcept((prev) => ({
                      ...prev,
                      dictationDouble: e.target.value,
                    }))
                  }
                  placeholder="두 자리 입력"
                  className="w-full text-center text-lg font-black p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ③ 세 자리 숫자 (예: 154)
                </label>
                <input
                  type="text"
                  value={numberConcept.dictationTriple}
                  onChange={(e) =>
                    setNumberConcept((prev) => ({
                      ...prev,
                      dictationTriple: e.target.value,
                    }))
                  }
                  placeholder="세 자리 입력"
                  className="w-full text-center text-lg font-black p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2-2) 큰 수에 ○ 표시 하기 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                2) 큰 수에 ○ 표시 하세요 (더 큰 숫자를 직접 터치)
              </h3>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                정답 맞춤: {biggerCorrectCount} / 3 개
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { pair: [3, 8], correct: 8, key: 'biggerChoice1' },
                { pair: [23, 19], correct: 23, key: 'biggerChoice2' },
                { pair: [325, 125], correct: 325, key: 'biggerChoice3' },
              ].map((item, idx) => {
                const selectedVal = numberConcept[item.key as keyof typeof numberConcept];

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3"
                  >
                    <span className="text-xs font-bold text-slate-600 block">
                      문제 {idx + 1}: 더 큰 수 터치
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {item.pair.map((num) => {
                        const isChosen = selectedVal === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setNumberConcept((prev) => ({
                                ...prev,
                                [item.key]: num,
                              }))
                            }
                            className={`p-4 rounded-2xl font-black text-2xl transition-all relative flex items-center justify-center border ${
                              isChosen
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-4 ring-indigo-200 scale-105'
                                : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-400 active:scale-95'
                            }`}
                          >
                            {num}
                            {isChosen && (
                              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-extrabold shadow-sm border border-white">
                                ◯
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2-3) 다음 문제를 계산하세요 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                3) 다음 문제를 계산하세요 (답 입력)
              </h3>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                계산 정답: {calcCorrectCount} / 8 개
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '3 + 4 =', key: 'calc3Plus4', ans: '7' },
                { label: '23 + 11 =', key: 'calc23Plus11', ans: '34' },
                { label: '7 - 2 =', key: 'calc7Minus2', ans: '5' },
                { label: '16 - 3 =', key: 'calc16Minus3', ans: '13' },
                { label: '3 × 5 =', key: 'calc3Times5', ans: '15' },
                { label: '10 × 11 =', key: 'calc10Times11', ans: '110' },
                { label: '25 ÷ 5 =', key: 'calc25Div5', ans: '5' },
                { label: '12 ÷ 2 =', key: 'calc12Div2', ans: '6' },
              ].map((item) => {
                const val = numberConcept[item.key as keyof typeof numberConcept] as string;
                const isCorrect = val.trim() === item.ans;

                return (
                  <div
                    key={item.key}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-center"
                  >
                    <span className="text-xs font-black text-slate-700 block">
                      {item.label}
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const v = e.target.value;
                        setNumberConcept((prev) => ({
                          ...prev,
                          [item.key]: v,
                        }));
                      }}
                      placeholder="답 입력"
                      className={`w-full text-center text-lg font-black p-2.5 bg-white border rounded-xl focus:outline-none ${
                        val.trim()
                          ? isCorrect
                            ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                            : 'border-amber-500 text-amber-900'
                          : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(1)}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all"
            >
              ← 이전: 1. 신상정보
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              다음: 3. 지각 및 인지능력 검사로 이동 →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 지각능력 및 인지기능 (터치 / 마우스 직접 수행) */}
      {activeStep === 3 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200">
            <h2 className="text-sm font-black text-teal-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-teal-600" />
              3. 지각 및 인지능력 검사 (터치 / 마우스 직접 선택 영역)
            </h2>
            <p className="text-xs text-teal-800 mt-1">
              ※ 화면의 시각 자료(막대, 화살표, 도형, 색상, 시계, 지문)를 보고 직접 터치하거나 대답을 기록합니다.
            </p>
          </div>

          {/* 3-1) 길이 지각 */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              1) 길이 지각 : ※ 더 긴 막대에 ○ 표시를 하세요 (직접 터치)
            </h3>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Short bar */}
                <button
                  type="button"
                  onClick={() =>
                    setPerception((prev) => ({
                      ...prev,
                      lengthChoice: 'short',
                    }))
                  }
                  className={`p-6 rounded-2xl border text-left transition-all relative flex flex-col justify-center ${
                    perception.lengthChoice === 'short'
                      ? 'bg-rose-50 border-rose-500 shadow-md ring-4 ring-rose-200'
                      : 'bg-white border-slate-300 hover:border-teal-400'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-500 mb-3">막대 A</span>
                  <div className="w-36 h-8 bg-blue-600 rounded-lg shadow-xs"></div>
                  {perception.lengthChoice === 'short' && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black">
                      ◯ 선택됨 (오답)
                    </span>
                  )}
                </button>

                {/* Long bar */}
                <button
                  type="button"
                  onClick={() =>
                    setPerception((prev) => ({
                      ...prev,
                      lengthChoice: 'long',
                    }))
                  }
                  className={`p-6 rounded-2xl border text-left transition-all relative flex flex-col justify-center ${
                    perception.lengthChoice === 'long'
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-200'
                      : 'bg-white border-slate-300 hover:border-teal-400'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-500 mb-3">막대 B</span>
                  <div className="w-full max-w-[280px] h-8 bg-blue-600 rounded-lg shadow-xs"></div>
                  {perception.lengthChoice === 'long' && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> ◯ 선택됨 (정답)
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3-2) 방향 지각 */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              2) 방향 지각 (해당하는 방향 화살표를 직접 터치)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Question 1: 오른쪽 화살표 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-black text-slate-800 block">
                  ※ 오른쪽을 나타내는 화살표에 ○ 표시 하세요
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      dir: 'left',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="40,25 40,38 90,38 90,62 40,62 40,75 10,50" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      dir: 'right',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="60,25 60,38 10,38 10,62 60,62 60,75 90,50" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      dir: 'up',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="25,40 38,40 38,90 62,90 62,40 75,40 50,10" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      dir: 'down',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="25,60 38,60 38,10 62,10 62,60 75,60 50,90" fill="currentColor" />
                        </svg>
                      ),
                    },
                  ].map((item) => {
                    const isSelected = perception.directionRight === item.dir;
                    return (
                      <button
                        key={item.dir}
                        type="button"
                        onClick={() =>
                          setPerception((prev) => ({
                            ...prev,
                            directionRight: item.dir as any,
                          }))
                        }
                        className={`p-4 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-105 ring-2 ring-teal-300'
                            : 'bg-white text-blue-600 border-slate-300 hover:border-teal-400'
                        }`}
                      >
                        {item.svg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: 위쪽 화살표 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-black text-slate-800 block">
                  ※ 위쪽 방향을 나타내는 화살표에 ○ 표시 하세요
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      dir: 'left',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="40,25 40,38 90,38 90,62 40,62 40,75 10,50" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      dir: 'right',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="60,25 60,38 10,38 10,62 60,62 60,75 90,50" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      dir: 'up',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="25,40 38,40 38,90 62,90 62,40 75,40 50,10" fill="currentColor" />
                        </svg>
                      ),
                    },
                    {
                      dir: 'down',
                      svg: (
                        <svg className="w-10 h-10" viewBox="0 0 100 100">
                          <polygon points="25,60 38,60 38,10 62,10 62,60 75,60 50,90" fill="currentColor" />
                        </svg>
                      ),
                    },
                  ].map((item) => {
                    const isSelected = perception.directionUp === item.dir;
                    return (
                      <button
                        key={item.dir}
                        type="button"
                        onClick={() =>
                          setPerception((prev) => ({
                            ...prev,
                            directionUp: item.dir as any,
                          }))
                        }
                        className={`p-4 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm scale-105 ring-2 ring-teal-300'
                            : 'bg-white text-blue-600 border-slate-300 hover:border-teal-400'
                        }`}
                      >
                        {item.svg}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 3-3) 모양 지각 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              3) 모양 지각 : ※ 아래 도형들은 무엇일까요?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                {
                  id: 'circle',
                  name: '원 (동그라미)',
                  svg: (
                    <svg className="w-12 h-12 text-blue-600" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  id: 'triangle',
                  name: '삼각형',
                  svg: (
                    <svg className="w-12 h-12 text-blue-600" viewBox="0 0 100 100">
                      <polygon points="50,10 90,90 10,90" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  id: 'square',
                  name: '사각형 (네모)',
                  svg: (
                    <svg className="w-12 h-12 text-blue-600" viewBox="0 0 100 100">
                      <rect x="15" y="15" width="70" height="70" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  id: 'diamond',
                  name: '마름모 (다이아몬드)',
                  svg: (
                    <svg className="w-12 h-12 text-blue-600" viewBox="0 0 100 100">
                      <polygon points="50,10 90,50 50,90 10,50" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  id: 'oval',
                  name: '타원형',
                  svg: (
                    <svg className="w-12 h-12 text-blue-600" viewBox="0 0 100 100">
                      <ellipse cx="50" cy="50" rx="45" ry="25" fill="currentColor" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center space-y-2"
                >
                  <div className="h-16 flex items-center justify-center">{item.svg}</div>
                  <input
                    type="text"
                    value={perception.shapes[item.id as keyof typeof perception.shapes]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPerception((prev) => ({
                        ...prev,
                        shapes: { ...prev.shapes, [item.id]: val },
                      }));
                    }}
                    placeholder=""
                    className="w-full text-center text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3-4) 색 인지 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              4) 색 인지 (제시된 색상 이름 인지/입력)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'red', colorBg: 'bg-rose-500', name: '빨간색' },
                { id: 'green', colorBg: 'bg-emerald-500', name: '초록색' },
                { id: 'yellow', colorBg: 'bg-amber-400', name: '노란색' },
                { id: 'blue', colorBg: 'bg-sky-500', name: '파란색' },
              ].map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center space-y-2"
                >
                  <div className={`w-full h-12 ${item.colorBg} rounded-xl shadow-xs`}></div>
                  <input
                    type="text"
                    value={perception.colors[item.id as keyof typeof perception.colors]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPerception((prev) => ({
                        ...prev,
                        colors: { ...prev.colors, [item.id]: val },
                      }));
                    }}
                    placeholder=""
                    className="w-full text-center text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3-5) 시간 인지 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              5) 시간 인지 : 다음 시계를 보고 시간을 말하시오
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Analog Clock (10시 10분) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center space-y-3">
                <span className="text-xs font-bold text-slate-700">① 아날로그 시계</span>
                <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-white relative flex items-center justify-center shadow-xs">
                  {/* Clock numbers */}
                  <span className="absolute top-1 font-bold text-xs text-slate-700">12</span>
                  <span className="absolute right-2 font-bold text-xs text-slate-700">3</span>
                  <span className="absolute bottom-1 font-bold text-xs text-slate-700">6</span>
                  <span className="absolute left-2 font-bold text-xs text-slate-700">9</span>
                  {/* Center pin */}
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full z-10"></div>
                  {/* Hour hand pointing at 10 */}
                  <div className="absolute w-1 h-8 bg-slate-900 rounded-full origin-bottom -translate-y-4 -rotate-[60deg]"></div>
                  {/* Minute hand pointing at 2 (10 min) */}
                  <div className="absolute w-1 h-12 bg-indigo-600 rounded-full origin-bottom -translate-y-6 rotate-[60deg]"></div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={perception.timeAnalogHour}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        timeAnalogHour: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-14 text-center font-extrabold text-base p-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                  <span className="text-xs font-bold text-slate-700">시</span>
                  <input
                    type="text"
                    value={perception.timeAnalogMinute}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        timeAnalogMinute: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-14 text-center font-extrabold text-base p-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                  <span className="text-xs font-bold text-slate-700">분</span>
                </div>
              </div>

              {/* Digital Clock (12:48) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center space-y-3">
                <span className="text-xs font-bold text-slate-700">② 디지털 시계</span>
                <div className="px-6 py-4 bg-slate-950 text-emerald-400 font-mono font-black text-3xl rounded-2xl border-2 border-slate-800 shadow-md tracking-wider">
                  12 : 48
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={perception.timeDigitalHour}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        timeDigitalHour: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-14 text-center font-extrabold text-base p-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                  <span className="text-xs font-bold text-slate-700">시</span>
                  <input
                    type="text"
                    value={perception.timeDigitalMinute}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        timeDigitalMinute: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-14 text-center font-extrabold text-base p-1.5 bg-white border border-slate-300 rounded-xl"
                  />
                  <span className="text-xs font-bold text-slate-700">분</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-6) 독해 능력 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              6) 독해 능력
            </h3>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
              <div className="p-3 bg-white border border-amber-300 rounded-xl text-center">
                <span className="text-sm font-black text-slate-900">
                  “의사가 양치질을 해야 한다.”고 말하였습니다.
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ① 누가 말하였나요?
                  </label>
                  <input
                    type="text"
                    value={perception.reading1}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        reading1: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ② 무엇을 해야 한다고 말하였나요?
                  </label>
                  <input
                    type="text"
                    value={perception.reading2}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        reading2: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ③ 왜 그렇게 해야 하나요?
                  </label>
                  <input
                    type="text"
                    value={perception.reading3}
                    onChange={(e) =>
                      setPerception((prev) => ({
                        ...prev,
                        reading3: e.target.value,
                      }))
                    }
                    placeholder=""
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3-7) 쓰기 능력 */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              7) 쓰기 능력 : ※ 평가사가 말하는 것을 작성해주세요
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  받아쓰기 문장 ①
                </label>
                <input
                  type="text"
                  value={perception.writing1}
                  onChange={(e) =>
                    setPerception((prev) => ({
                      ...prev,
                      writing1: e.target.value,
                    }))
                  }
                  placeholder="문장 1 입력"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  받아쓰기 문장 ②
                </label>
                <input
                  type="text"
                  value={perception.writing2}
                  onChange={(e) =>
                    setPerception((prev) => ({
                      ...prev,
                      writing2: e.target.value,
                    }))
                  }
                  placeholder="문장 2 입력"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(2)}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all"
            >
              ← 이전: 2. 수 개념
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              다음: 4. 최종 결과 확인 및 저장 →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 최종 검사 결과 종합 및 저장 */}
      {activeStep === 4 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <h2 className="text-sm font-black text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              4. 기초학력수준 검사 결과 종합 요약
            </h2>
            <p className="text-xs text-emerald-800 mt-1">
              검사 결과를 최종 점검하고 지도 교사 종합 소견을 작성한 후 저장하세요.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-500">1. 신상정보 인지</span>
              <div className="text-xl font-black text-indigo-700">
                {personalInfoScore} / 9 항목 인지
              </div>
              <p className="text-[11px] text-slate-500">
                알고 있음: {personalInfoScore}개, 미인지: {9 - personalInfoScore}개
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-500">2. 수 개념 수행</span>
              <div className="text-xl font-black text-indigo-700">
                큰 수: {biggerCorrectCount}/3, 계산: {calcCorrectCount}/8
              </div>
              <p className="text-[11px] text-slate-500">
                받아적기: 1자({numberConcept.dictationSingle || '-'}), 2자({numberConcept.dictationDouble || '-'}), 3자({numberConcept.dictationTriple || '-'})
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-500">3. 지각 및 인지능력</span>
              <div className="text-xl font-black text-indigo-700">
                {perception.lengthChoice === 'long' ? '길이지각 정답' : '길이지각 미달'}
              </div>
              <p className="text-[11px] text-slate-500">
                방향(우:{perception.directionRight === 'right' ? 'O' : 'X'}, 위:{perception.directionUp === 'up' ? 'O' : 'X'}), 시계({perception.timeAnalogHour || '-'}:{perception.timeAnalogMinute || '-'})
              </p>
            </div>
          </div>

          {/* Overall Evaluator Opinion */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800">
              담당 교사 종합 소견 및 교육 지도 방향
            </label>
            <textarea
              rows={4}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="본 기초학력수준 검사 결과에 따른 훈련생의 인지/수개념/지각 능력 총평 및 향후 교육 지도 방향을 기재하세요."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs leading-relaxed font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              onClick={() => setActiveStep(3)}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all"
            >
              ← 이전: 3. 지각 및 인지능력
            </button>

            <button
              onClick={handleSaveAll}
              className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              기초학력수준 검사 저장 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
