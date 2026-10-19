import React, { useState } from 'react';
import {
  Client,
  SituationEvaluationLog,
  SituationEvaluationRow,
  ComprehensiveEvaluationReport,
} from '../types';
import {
  COMPREHENSIVE_EVALUATION_QUESTIONS,
  FREQUENT_EVAL_NOTES,
  CATEGORY_COMMENT_PRESETS,
  SITUATION_TRAINING_COURSES,
  SITUATION_TRAINING_COURSE_OPTIONS,
} from '../data/evaluationConstants';
import SituationEvaluationReport from './SituationEvaluationReport';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  Plus,
  Trash2,
  Save,
  Printer,
  ArrowLeft,
  Sparkles,
  Award,
} from 'lucide-react';

interface SituationEvaluationManagerProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onBack: () => void;
}

const START_TIME_OPTIONS = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'];
const END_TIME_OPTIONS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

export function generateAiSituationSpecialNotes(
  client: Client | null,
  rows: SituationEvaluationRow[],
  _startDate?: string,
  _endDate?: string
): string {
  const clientName = client?.name || '훈련생';
  const validRows = rows.filter((r) => r.date || r.taskName || r.evaluationNote);
  const totalDays = validRows.length;

  if (totalDays === 0) {
    return `[상황평가 2주간 종합 관찰 및 지도 소견]\n${clientName} 훈련생의 등록된 일별 기록이 없습니다. 일자별 훈련과정 및 평가·지도사항을 입력하신 후 다시 생성해주세요.`;
  }

  // 1. 출결 통계 분석
  const attendCount = validRows.filter((r) => r.attendance === '출석').length;
  const lateCount = validRows.filter((r) => r.attendance === '지각').length;
  const earlyCount = validRows.filter((r) => r.attendance === '조퇴').length;
  const absentCount = validRows.filter((r) => r.attendance === '결석').length;
  const attendRate = totalDays > 0 ? Math.round((attendCount / totalDays) * 100) : 100;

  let attendSummary = '';
  if (attendCount === totalDays) {
    attendSummary = `2주간 상황평가 기간(총 ${totalDays}회 훈련) 동안 지각이나 결석 없이 100% 출석하여 규칙적인 일과 및 생활리듬을 성실하게 유지함.`;
  } else {
    const issues: string[] = [];
    if (lateCount > 0) issues.push(`지각 ${lateCount}회`);
    if (earlyCount > 0) issues.push(`조퇴 ${earlyCount}회`);
    if (absentCount > 0) issues.push(`결석 ${absentCount}회`);
    attendSummary = `상황평가 기간 총 ${totalDays}회 훈련 중 출석 ${attendCount}회(출석률 ${attendRate}%${
      issues.length > 0 ? `, ${issues.join(', ')}` : ''
    })를 기록하였으며, 전반적인 훈련 참여 성실도가 양호함.`;
  }

  // 2. 훈련과정 분석
  const uniqueCourses = Array.from(
    new Set(validRows.map((r) => r.taskName?.trim()).filter(Boolean))
  );
  const courseStr = uniqueCourses.length > 0 ? uniqueCourses.join(', ') : '기본 직업적응 과제';

  // 3. 일자별 평가 및 지도사항 분석 & 세부 문맥 결합
  const notesWithCourse = validRows
    .filter((r) => r.evaluationNote && r.evaluationNote.trim().length > 0)
    .map((r) => ({
      course: r.taskName || '직무훈련',
      note: r.evaluationNote.trim(),
      date: r.date,
    }));

  let evaluatedHighlights = '';
  if (notesWithCourse.length > 0) {
    // 코스별 지도사항 그룹화
    const courseMap: { [course: string]: string[] } = {};
    notesWithCourse.forEach(({ course, note }) => {
      if (!courseMap[course]) courseMap[course] = [];
      if (!courseMap[course].includes(note)) {
        courseMap[course].push(note);
      }
    });

    const bulletPoints = Object.entries(courseMap)
      .slice(0, 5)
      .map(([course, notes]) => `  • [${course}] ${notes.join(' / ')}`)
      .join('\n');

    evaluatedHighlights = `\n${bulletPoints}`;
  } else {
    evaluatedHighlights = '\n  • 직업적응훈련 기본 과제에 참여하여 지시된 작업을 성실히 이행함.';
  }

  // 4. 관찰된 특성 종합 (태도, 사회성, 작업수행)
  const allNotesText = validRows.map((r) => r.evaluationNote || '').join(' ');
  const isCooperative = /인사|예의|대인|동료|원만|밝|교사|경어|적응|협동/.test(allNotesText);
  const isFocused = /집중|정확|숙련|향상|빠름|양호|완성|도구|조작|안정|꼼꼼/.test(allNotesText);
  const needsSupport = /산만|휴식|이탈|서툼|반복|지도|필요|지체|어려움/.test(allNotesText);

  let attitudeSummary = '';
  if (isCooperative) {
    attitudeSummary = '담당 교사의 피드백과 작업 지시를 경청하고 수용하는 태도가 우수하며, 동료 훈련생들과 원만한 상호작용 및 인사 예절을 실천함.';
  } else {
    attitudeSummary = '훈련 환경에 적응하며 기본적 대인관계 및 기관 이용 예절을 준수함.';
  }

  let workSummary = '';
  if (isFocused) {
    workSummary = '과제 수행 시 도구 및 기기 조작에 흥미를 보이고, 반복 학습을 통해 작업 속도와 정확도가 안정적으로 유지됨.';
  } else if (needsSupport) {
    workSummary = '작업 초기 주의집중 유지를 위한 반복 설명과 시각적 안내가 효과적이었으며, 지도가 지속될수록 과제 순응도가 점차 향상됨.';
  } else {
    workSummary = '주어진 직업적응 과제 공정에 맞춰 성실하게 작업을 완수함.';
  }

  return `[상황평가 2주간 종합 관찰 및 지도 소견]

1. 출결 및 일과 참여도
- ${attendSummary}

2. 훈련과정별 수행 역량 및 주요 지도사항
- 참여 훈련과정: ${courseStr}${evaluatedHighlights}
- 작업수행 특성: ${workSummary}

3. 작업 태도 및 대인관계
- ${attitudeSummary}

4. 향후 훈련 제언
- ${clientName} 훈련생은 직업적응훈련반 훈련 참여 욕구와 직무 적응 잠재력이 확인됨. 상황평가 관찰 결과를 바탕으로 개별화 직업재활계획(IWP)을 수립하고, 흥미와 강점이 확인된 훈련과정을 중심으로 체계적인 직무 역량 강화 훈련을 지속하는 것이 적절함.`;
}

export default function SituationEvaluationManager({
  clients,
  selectedClient,
  onSelectClient,
  onBack,
}: SituationEvaluationManagerProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'comprehensive' | 'report'>('log');

  // 오늘 날짜 및 2주 기간 생성 보조 함수
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const generate10Days = (startDateStr: string): SituationEvaluationRow[] => {
    const rows: SituationEvaluationRow[] = [];
    let current = new Date(startDateStr);
    if (isNaN(current.getTime())) current = new Date();

    while (rows.length < 10) {
      const dayOfWeek = current.getDay();
      // 토요일(6), 일요일(0) 제외
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        rows.push({
          id: 'row_' + Math.random().toString(36).substr(2, 9),
          date: `${mm}/${dd}`,
          attendance: '출석',
          trainingTime: '10:00~16:00',
          taskName: SITUATION_TRAINING_COURSES[rows.length % SITUATION_TRAINING_COURSES.length],
          evaluationNote: FREQUENT_EVAL_NOTES[rows.length % FREQUENT_EVAL_NOTES.length],
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return rows;
  };

  // LocalStorage 불러오기 / 초기화
  const [evaluatorName, setEvaluatorName] = useState('');
  const [teamLeadName, setTeamLeadName] = useState('');
  const [startDate, setStartDate] = useState(() => getTodayStr());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // 상황평가 일지 state
  const [rows, setRows] = useState<SituationEvaluationRow[]>(() => generate10Days(getTodayStr()));
  const [specialNotes, setSpecialNotes] = useState(
    '2주간 신규 훈련 적응 과정에 지시사항을 이행하려는 태도가 양호함. 출결 상황 원만하며 직업적응훈련반 참여 의욕이 높음.'
  );

  // 종합 평가 state
  const [scores, setScores] = useState<{ [key: number]: number }>(() => {
    const initial: { [key: number]: number } = {};
    COMPREHENSIVE_EVALUATION_QUESTIONS.forEach((q) => {
      initial[q.id] = 4; // 기본 4점(양호)
    });
    return initial;
  });

  const [categoryComments, setCategoryComments] = useState<{ [category: string]: string }>({
    근무태도: '2주간 무단 지각이나 결근 없이 출석률 100%를 기록하였으며, 휴식시간과 작업시간 구분을 명확히 준수함.',
    대인관계: '동료 훈련생 및 담당 교사에게 밝은 미소로 적절한 경어와 예의 바른 인사를 건네며 호의적인 대인관계를 유지함.',
    작업태도: '주어진 직업적응 과제에 적극적으로 참여하며, 작업이 완료된 후에도 정리정돈 및 다음 일거리를 자발적으로 탐색함.',
    작업수행: '지시된 작업 공정 순서와 방법에 맞춰 정확하게 작업을 수행하며, 훈련을 거듭할수록 작업 속도와 정확성이 지속적으로 향상됨.',
  });

  // AI 자동생성 알림 상태
  const [aiGeneratedNotice, setAiGeneratedNotice] = useState(false);

  // 저장 완료 상태
  const [isSaved, setIsSaved] = useState(false);

  // 클라이언트 변경 시 자동 초기화
  const handleClientChange = (c: Client) => {
    onSelectClient(c);
    const newRows = generate10Days(startDate);
    setRows(newRows);
    setSpecialNotes(generateAiSituationSpecialNotes(c, newRows, startDate, endDate));
  };

  // 10일 자동 세팅
  const handleAutoGenerateRows = () => {
    const generated = generate10Days(startDate);
    setRows(generated);
    setSpecialNotes(generateAiSituationSpecialNotes(selectedClient, generated, startDate, endDate));
  };

  // 총점 계산
  const totalScore: number = (Object.values(scores) as number[]).reduce((sum: number, s: number) => sum + (Number(s) || 0), 0);

  // 일괄 점수 변경
  const setAllScores = (val: number) => {
    const updated: { [key: number]: number } = {};
    COMPREHENSIVE_EVALUATION_QUESTIONS.forEach((q) => {
      updated[q.id] = val;
    });
    setScores(updated);
  };

  // 상황평가일지 데이터 객체 생성
  const situationLogData: SituationEvaluationLog = {
    id: 'sit_log_' + (selectedClient?.id || 'default'),
    clientId: selectedClient?.id || '',
    evaluatorName,
    teamLeadName,
    startDate,
    endDate,
    disabilityInfo: selectedClient?.intakeRecord
      ? `${selectedClient.intakeRecord.disabilityName || '지적장애'} / ${selectedClient.intakeRecord.disabilityGrade || '심한장애'}`
      : '지적장애 / 심한',
    rows,
    specialNotes,
    createdAt: getTodayStr(),
    updatedAt: getTodayStr(),
  };

  const comprehensiveReportData: ComprehensiveEvaluationReport = {
    id: 'comp_report_' + (selectedClient?.id || 'default'),
    clientId: selectedClient?.id || '',
    evaluatorName,
    teamLeadName,
    startDate,
    endDate,
    disabilityInfo: situationLogData.disabilityInfo,
    scores,
    categoryComments,
    totalScore,
    overallOpinion: '',
    createdAt: getTodayStr(),
    updatedAt: getTodayStr(),
  };

  const handleSaveAll = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!selectedClient && clients.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200 mt-8">
        <UserCheck className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">훈련생을 선택해주세요</h2>
        <p className="text-sm text-slate-500 mb-6">상황평가일지 및 종합평가를 작성할 신규 이용자를 선택하세요.</p>
        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => handleClientChange(c)}
              className={`px-4 py-2 font-bold text-xs rounded-xl border transition-all ${
                c.userType === '신규'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {c.name} {c.userType === '신규' ? '✨ [신규]' : '[기존]'} ({c.birthDate || '생년월일 미입력'})
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'report' && selectedClient) {
    return (
      <SituationEvaluationReport
        client={selectedClient}
        situationLog={situationLogData}
        comprehensiveReport={comprehensiveReportData}
        onBack={() => setActiveTab('log')}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* 상단 툴바 및 타이틀 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            title="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black">
                신규 훈련생 평가
              </span>
              <h1 className="text-xl font-black text-slate-900">상황평가일지 &amp; 종합평가기록부</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              2주간의 매일 활동 기록(상황평가)과 20개 항목 종합평가를 간편하게 작성하세요.
            </p>
          </div>
        </div>

        {/* 훈련생 선택 드롭다운 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">대상 훈련생:</label>
          <select
            value={selectedClient?.id || ''}
            onChange={(e) => {
              const found = clients.find((c) => c.id === e.target.value);
              if (found) handleClientChange(found);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.userType === '신규' ? '✨ [신규]' : '[기존]'} ({c.birthDate || '생년월일 미입력'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 평가기간 설정 바 */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold text-indigo-300 block mb-0.5">상황평가 및 종합평가 기간</span>
          <p className="text-xs text-slate-300 font-medium">인쇄 시 출력될 2주간의 시작일과 종료일을 지정하세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">평가 시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">평가 종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-bold"
            />
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'log'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> 1단계: 상황평가일지 (2주 매일 기록)
        </button>
        <button
          onClick={() => setActiveTab('comprehensive')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === 'comprehensive'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" /> 2단계: 훈련생 종합 평가기록부 (20개 항목)
        </button>
      </div>

      {/* ==================== TAB 1: 상황평가일지 작성 ==================== */}
      {activeTab === 'log' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" /> 일자별 훈련 내역 (총 {rows.length}일 기록)
                </h3>
                <p className="text-[11px] text-slate-500">
                  평가기간 동안 매일 수행한 과제와 지도사항을 간편하게 기록하세요.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoGenerateRows}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 시작일 기준 2주(10일) 자동 세팅
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRows((prev) => [
                      ...prev,
                      {
                        id: 'row_' + Math.random().toString(36).substr(2, 9),
                        date: '08/25',
                        attendance: '출석',
                        trainingTime: '10:00~16:00',
                        taskName: SITUATION_TRAINING_COURSES[0],
                        evaluationNote: '양호하게 수행함',
                      },
                    ])
                  }
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 1일 추가
                </button>
              </div>
            </div>

            {/* 일자별 작성 테이블 헤더 (데스크톱) */}
            <div className="hidden md:grid grid-cols-12 gap-2.5 px-3.5 py-1.5 bg-slate-100/80 border border-slate-200 rounded-xl text-[11px] font-extrabold text-slate-600">
              <div className="col-span-2 text-center">훈련일자 / 순번</div>
              <div className="col-span-2 text-center">출결 상황</div>
              <div className="col-span-2 text-center">훈련시간</div>
              <div className="col-span-3 text-center">훈련과정</div>
              <div className="col-span-3 text-center">평가 및 지도사항</div>
            </div>

            {/* 일자별 작성 테이블 목록 */}
            <div className="space-y-3">
              {rows.map((row, idx) => {
                const times = (row.trainingTime || '10:00~16:00').split('~');
                const startTime = times[0] || '10:00';
                const endTime = times[1] || '16:00';
                const isBaseCourse = (SITUATION_TRAINING_COURSES as readonly string[]).includes(row.taskName);

                return (
                  <div
                    key={row.id}
                    className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* 일자 & 순번 */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={row.date}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, date: val } : r)));
                        }}
                        placeholder="MM/DD"
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                    </div>

                    {/* 근태 상태 버튼들 */}
                    <div className="md:col-span-2 flex items-center gap-1">
                      {(['출석', '결석', '지각', '조퇴'] as const).map((att) => (
                        <button
                          key={att}
                          type="button"
                          onClick={() =>
                            setRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, attendance: att } : r))
                            )
                          }
                          className={`flex-1 py-1 text-[11px] font-extrabold rounded-lg border transition-all ${
                            row.attendance === att
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {att}
                        </button>
                      ))}
                    </div>

                    {/* 훈련시간 (시작시간 ~ 종료시간 선택) */}
                    <div className="md:col-span-2 flex items-center gap-1">
                      <select
                        value={startTime}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, trainingTime: `${newStart}~${endTime}` } : r
                            )
                          );
                        }}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        title="시작시간"
                      >
                        {START_TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs font-extrabold text-slate-400 shrink-0">~</span>
                      <select
                        value={endTime}
                        onChange={(e) => {
                          const newEnd = e.target.value;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, trainingTime: `${startTime}~${newEnd}` } : r
                            )
                          );
                        }}
                        className="w-full px-1 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        title="종료시간"
                      >
                        {END_TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 훈련과정 (드롭다운 + 기타 직접입력창) */}
                    <div className="md:col-span-3 space-y-1.5">
                      <select
                        value={isBaseCourse ? row.taskName : '기타'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '기타') {
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, taskName: isBaseCourse ? '' : r.taskName }
                                  : r
                              )
                            );
                          } else {
                            setRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, taskName: val } : r))
                            );
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        title="훈련과정 선택"
                      >
                        {SITUATION_TRAINING_COURSE_OPTIONS.map((course) => (
                          <option key={course} value={course}>
                            {course === '기타' ? '기타 (직접입력)' : course}
                          </option>
                        ))}
                      </select>

                      {/* 기타 선택 시 또는 표준 과정 외 내용일 경우 수기 기입 인풋 표시 */}
                      {!isBaseCourse && (
                        <input
                          type="text"
                          value={row.taskName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, taskName: val } : r))
                            );
                          }}
                          placeholder="기타 훈련과정을 직접 입력하세요"
                          className="w-full px-2.5 py-1 bg-amber-50/80 border border-amber-300 text-slate-900 placeholder-slate-400 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          autoFocus
                        />
                      )}
                    </div>

                    {/* 평가 및 지도사항 & 삭제 */}
                    <div className="md:col-span-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={row.evaluationNote}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows((prev) =>
                            prev.map((r) => (r.id === row.id ? { ...r, evaluationNote: val } : r))
                          );
                        }}
                        placeholder="평가 및 지도사항"
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                        className="text-slate-400 hover:text-red-500 p-1 shrink-0 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 특이사항 입력 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
                  상황평가 종합 특이사항
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  위 일자별 훈련과정, 출결, 평가 및 지도사항을 분석하여 종합 소견을 작성합니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const generated = generateAiSituationSpecialNotes(selectedClient, rows, startDate, endDate);
                  setSpecialNotes(generated);
                  setAiGeneratedNotice(true);
                  setTimeout(() => setAiGeneratedNotice(false), 3000);
                }}
                className="py-1.5 px-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="위의 출결, 훈련과정, 평가 및 지도사항을 종합 분석하여 특이사항을 자동으로 작성합니다"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                AI 종합 특이사항 자동 작성
              </button>
            </div>

            {aiGeneratedNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                평가 및 지도사항이 반영된 AI 종합 특이사항이 성공적으로 작성되었습니다. 필요에 따라 내용을 수정하실 수 있습니다.
              </div>
            )}

            <textarea
              rows={6}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="상단의 'AI 종합 특이사항 자동 작성' 버튼을 클릭하면 위 일자별 훈련과정과 평가 및 지도사항을 종합 분석하여 전문적인 소견이 자동으로 생성됩니다."
              className="w-full p-3.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          {/* 하단 이동 버튼 */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
            <button
              onClick={handleSaveAll}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> 저장하기
            </button>
            <button
              onClick={() => setActiveTab('comprehensive')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-indigo-150"
            >
              2단계: 종합 평가 작성으로 이동 &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: 종합 평가 작성 ==================== */}
      {activeTab === 'comprehensive' && (
        <div className="space-y-6">
          {/* 상단 간편 버튼들 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-800">20개 평가지표 원클릭 평가</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-black text-[11px]">
                  총점: {totalScore} / 100점
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                근무태도, 대인관계, 작업태도, 작업수행 각 5개 항목(우수 5점 ~ 불량 1점)을 점수 채점하세요.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">일괄채점:</span>
              <button
                type="button"
                onClick={() => setAllScores(5)}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 transition-all"
              >
                전체 우수(5점)
              </button>
              <button
                type="button"
                onClick={() => setAllScores(4)}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition-all"
              >
                전체 양호(4점)
              </button>
              <button
                type="button"
                onClick={() => setAllScores(3)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 transition-all"
              >
                전체 보통(3점)
              </button>
            </div>
          </div>

          {/* 카테고리별 질문 목록 */}
          {(['근무태도', '대인관계', '작업태도', '작업수행'] as const).map((cat) => {
            const qList = COMPREHENSIVE_EVALUATION_QUESTIONS.filter((q) => q.category === cat);

            return (
              <div key={cat} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-black text-indigo-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                    {cat} (5개 항목)
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {qList.map((q) => {
                    const score = scores[q.id] || 4;
                    return (
                      <div
                        key={q.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap md:flex-nowrap items-center justify-between gap-3"
                      >
                        <span className="text-xs font-bold text-slate-800 flex-1">
                          {q.id}. {q.text}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {[
                            { val: 5, label: '우수 (5점)' },
                            { val: 4, label: '양호 (4점)' },
                            { val: 3, label: '보통 (3점)' },
                            { val: 2, label: '미흡 (2점)' },
                            { val: 1, label: '불량 (1점)' },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setScores((prev) => ({ ...prev, [q.id]: opt.val }))}
                              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all ${
                                score === opt.val
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 영역별 평가 소견 상세 작성 */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      [{cat}] 상세 평가 소견 작성:
                    </label>
                    <span className="text-[11px] text-slate-400">
                      출력 시 종합평가기록부 해당 영역에 정갈하게 인쇄됩니다.
                    </span>
                  </div>

                  {/* 예시 예문 칩 버튼 */}
                  {CATEGORY_COMMENT_PRESETS[cat] && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        💡 추천 예시 문구 (클릭 시 추가):
                      </span>
                      <div className="space-y-1">
                        {CATEGORY_COMMENT_PRESETS[cat].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              setCategoryComments((prev) => {
                                const current = prev[cat] || '';
                                const next = current ? `${current}\n${preset}` : preset;
                                return { ...prev, [cat]: next };
                              });
                            }}
                            className="w-full text-left p-1.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-all hover:border-indigo-300 shadow-2xs block truncate"
                            title={preset}
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    value={categoryComments[cat] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryComments((prev) => ({ ...prev, [cat]: val }));
                    }}
                    placeholder={`${cat} 영역 관찰 내용 및 총평을 상세히 입력하세요.`}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            );
          })}

          {/* 하단 최종 버튼 */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('log')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              &larr; 1단계: 상황평가일지로 돌아가기
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {isSaved ? '저장 완료!' : '저장하기'}
              </button>
              <button
                onClick={() => {
                  handleSaveAll();
                  setActiveTab('report');
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-150"
              >
                <Printer className="w-4 h-4" /> 양식 인쇄 / PDF 출력 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
