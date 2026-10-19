/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Client,
  PurdueTest,
  ERSTest,
  PictureInterestPDF,
  IndividualizedServicePlan,
  IWPErsDomainScore,
  IWPPurdueScore,
  IWPComparisonRow,
  IWPShortTermGoal,
  MidtermEvaluationReportData,
  MidtermScoreSummaryRow,
  MidtermGoalReviewItem
} from '../types';
import { analyzeErsTest, PURDUE_NORMS_BY_TYPE } from '../data/assessmentData';
import { findYearAssessments, parseYearFromDate } from './yearHelper';

// 하위영역별 취약점 지도 가이드 문구
const DOMAIN_GUIDANCE_MAP: Record<string, { guide: string; service: string; goalService: string }> = {
  '사회기술': {
    guide: '대인관계 상황에서의 의사소통, 감정조절 및 직장 내 관계 형성에 대한 지속적인 지도와 훈련',
    service: '사회기술 향상을 위한 집단활동 및 대인관계 훈련',
    goalService: '대인관계 의사소통 훈련 및 감정조절 프로그램 연계 실시'
  },
  '일상생활': {
    guide: '개인위생 관리, 단정한 복장 유지 및 규칙적인 자기관리 습관 형성에 대한 지도',
    service: '일상생활 자립기술 훈련 및 위생 점검',
    goalService: '일상생활기술(개인위생, 시간관리) 훈련 상시 진행'
  },
  '인지기술': {
    guide: '기본적인 수 개념, 금전관리 및 작업지시 이해력 증진을 위한 보충 훈련',
    service: '인지학습 및 계산·측정 보조 도구 활용 훈련',
    goalService: '기초 수개념 및 작업 지시문 읽기·이해 훈련 주 1회 실시'
  },
  '자존감': {
    guide: '자기표현 및 자기옹호 능력 향상, 긍정적 자기효능감 고취를 위한 정서적 지지',
    service: '자아존중감 향상 프로그램 및 긍정적 피드백 제공',
    goalService: '자기표현 및 성취경험 중심의 자존감 증진 활동 병행'
  },
  '직업의식': {
    guide: '직업의 필요성 이해, 근로 동기 강화 및 직업인으로서의 책임감 고취',
    service: '직업탐색 활동 및 직업의식 고취 교육',
    goalService: '직업의식 및 근로동기 강화를 위한 직업준비 교육 실시'
  },
  '직업기술': {
    guide: '직장 내 안전수칙 준수, 출결 관리 및 작업태도 향상을 위한 체계적인 지도',
    service: '직무환경 적응 및 근태·안전관리 훈련',
    goalService: '작업장 규칙 준수 및 집중력 유지 훈련 집중 실시'
  },
  '작업기술': {
    guide: '작업의 정확도와 속도 향상, 도구 활용 능력 및 정밀 조립 숙련도 증진',
    service: '작업 숙련성 향상을 위한 반복 임가공 및 도구 활용 훈련',
    goalService: '작업 공정별 단계적 도구 사용 및 불량률 감소 훈련 상시 진행'
  },
};

/**
 * 훈련생 정보 및 검사 기록을 기반으로 개별화재활계획서(IWP) 1차 또는 2차 기본 데이터 자동 생성
 */
export function generateDefaultIWP(
  client: Client,
  purdueTests: PurdueTest[],
  ersTests: ERSTest[],
  picturePdfs: PictureInterestPDF[],
  termType: '1차' | '2차' = '1차',
  targetYear?: number
): IndividualizedServicePlan {
  const currentYear = targetYear || new Date().getFullYear();
  const trainingClass = client.trainingClass || '문화예술반';

  // Find assessments for the specified year
  const yearAssessments = findYearAssessments(currentYear, purdueTests, ersTests);

  // Pick appropriate assessment based on termType
  const targetPurdue = termType === '2차'
    ? (yearAssessments.purdue2nd || yearAssessments.purdue1st || (purdueTests.length > 0 ? purdueTests[0] : null))
    : (yearAssessments.purdue1st || (purdueTests.length > 0 ? purdueTests[0] : null));

  const targetErs = termType === '2차'
    ? (yearAssessments.ers2nd || yearAssessments.ers1st || (ersTests.length > 0 ? ersTests[0] : null))
    : (yearAssessments.ers1st || (ersTests.length > 0 ? ersTests[0] : null));

  const clientPdfs = picturePdfs.filter(p => p.clientId === client.id);
  const targetPdf = clientPdfs.find(p => (p.year || parseYearFromDate(p.testDate)) === currentYear) || clientPdfs[0] || null;

  // 1. ERS 점수 산출
  let ersScores: IWPErsDomainScore[] = [];
  let ersConvertedSum = 80;
  let ersStandardScore = 108;
  let ersLowestDomain = '일상생활';

  if (targetErs) {
    const analysis = analyzeErsTest(targetErs.answers);
    ersScores = analysis.domainResults.map(d => ({
      domain: d.name,
      rawScore: d.score,
      convertedScore: d.convertedScore
    }));
    ersConvertedSum = analysis.convertedSum;
    ersStandardScore = analysis.standardScoreVal;

    let minScore = 999;
    ersScores.forEach(s => {
      if (s.convertedScore < minScore) {
        minScore = s.convertedScore;
        ersLowestDomain = s.domain;
      }
    });
  } else {
    ersScores = [
      { domain: '일상생활', rawScore: 18, convertedScore: 8 },
      { domain: '인지기술', rawScore: 46, convertedScore: 13 },
      { domain: '자존감', rawScore: 26, convertedScore: 12 },
      { domain: '직업의식', rawScore: 28, convertedScore: 15 },
      { domain: '사회기술', rawScore: 24, convertedScore: 10 },
      { domain: '직업기술', rawScore: 24, convertedScore: 10 },
      { domain: '작업기술', rawScore: 37, convertedScore: 12 },
    ];
    ersConvertedSum = 80;
    ersStandardScore = 108;
    ersLowestDomain = '일상생활';
  }

  const domainScoreStr = ersScores.map(s => `${s.domain}: ${s.convertedScore}점`).join(' / ');
  const guidance = DOMAIN_GUIDANCE_MAP[ersLowestDomain] || DOMAIN_GUIDANCE_MAP['사회기술'];

  const ersAnalysisText = `○ ERS 종합 소견 및 영역별 성취도 분석
- 영역별 점수: ${domainScoreStr}
- 당사자는 ERS 직업준비검사 결과 표준점수 ${ersStandardScore}점으로 ${
    ersStandardScore >= 115 ? '우수한' : ersStandardScore >= 90 ? '평균 수준' : '보충 지도가 필요한'
  } 직업준비행동을 보이는 것으로 확인됨. 특히 인지기술 및 직업의식 영역에서 비교적 높은 수준을 나타내어 기본적인 이해력과 직업에 대한 동기 및 태도가 긍정적으로 형성되어 있는 것으로 판단됨.
- 또한 직업기술 및 작업기술 영역에서도 안정적인 수행 수준을 보여 반복적이고 구조화된 작업환경에서 직무 수행이 가능할 것으로 보임.
- 일상생활기술, 자존감 영역 역시 전반적으로 양호한 수준을 유지하고 있어 기본적인 자기관리와 사회적 역할 수행에 필요한 기반이 형성되어 있는 것으로 평가됨.
- 다만 ${ersLowestDomain} 영역은 다른 영역에 비해 상대적으로 낮은 수준을 보여 ${guidance.guide}가 필요할 것으로 판단됨.
- 따라서, 직업적응훈련을 통해 작업 정확성 및 직무 지속능력을 강화하고, 실제 작업환경 중심의 반복 훈련과 ${guidance.service}을 병행하여 지원할 계획임.`;

  // 2. 그림직업흥미검사 분석
  let pictureInterestAnalysis = `- 당사자는 음식, 서비스, 청소 영역 등 타인의 편의를 돕거나 정리·보조 중심의 직무에 대한 흥미가 높게 나타났으며, 도구를 활용하여 직접 작업에 참여하는 활동에서 높은 동기 수준을 보이는 것으로 확인됨. 또한 개인 활동보다 집단 활동을 선호하고 실외 활동에 대한 선호가 비교적 높아, 타인과 함께 협력하며 반복적이고 구조화된 환경에서 수행되는 직무에서 안정적인 참여가 가능할 것으로 판단됨.`;

  if (targetPdf && targetPdf.notes && targetPdf.notes.trim().length > 10) {
    pictureInterestAnalysis = targetPdf.notes;
  }

  // 3. Purdue Pegboard 점수 산출
  const norms = PURDUE_NORMS_BY_TYPE['지원고용'];
  let purdueScores: IWPPurdueScore[] = [];

  if (targetPurdue) {
    const isLeftDom = client.handDominance === 'L';
    const rScore = targetPurdue.rightHand;
    const lScore = targetPurdue.leftHand;
    const bScore = targetPurdue.bothHands;
    const sumScore = Number((rScore + lScore + bScore).toFixed(2));
    const aScore = targetPurdue.assembly;

    const domScore = isLeftDom ? lScore : rScore;
    const nonDomScore = isLeftDom ? rScore : lScore;
    const domMean = isLeftDom ? norms.leftHand.mean : norms.rightHand.mean;
    const nonDomMean = isLeftDom ? norms.rightHand.mean : norms.leftHand.mean;

    const getResultText = (score: number, mean: number): '평균' | '높음' | '낮음' => {
      if (score >= mean + 1.0) return '높음';
      if (score <= mean - 1.5) return '낮음';
      return '평균';
    };

    purdueScores = [
      { item: '우세손', myScore: domScore, standardMean: domMean, resultText: getResultText(domScore, domMean) },
      { item: '비우세손', myScore: nonDomScore, standardMean: nonDomMean, resultText: getResultText(nonDomScore, nonDomMean) },
      { item: '양손', myScore: bScore, standardMean: norms.bothHands.mean, resultText: getResultText(bScore, norms.bothHands.mean) },
      { item: '합계', myScore: sumScore, standardMean: norms.sumRLB.mean, resultText: getResultText(sumScore, norms.sumRLB.mean) },
      { item: '조립', myScore: aScore, standardMean: norms.assembly.mean, resultText: getResultText(aScore, norms.assembly.mean) },
    ];
  } else {
    purdueScores = [
      { item: '우세손', myScore: 12.00, standardMean: 12.61, resultText: '평균' },
      { item: '비우세손', myScore: 10.00, standardMean: 11.94, resultText: '평균' },
      { item: '양손', myScore: 12.00, standardMean: 9.35, resultText: '높음' },
      { item: '합계', myScore: 33.00, standardMean: 33.91, resultText: '평균' },
      { item: '조립', myScore: 16.00, standardMean: 24.54, resultText: '낮음' },
    ];
  }

  // 4. 훈련 비교 분석 사항 (1차 vs 2차 차별화)
  const isSecond = termType === '2차';
  const prevYear = currentYear - 1;

  // Try to load previous year evaluation data if available for 1st term
  let prevYearTrainingScores: IWPComparisonRow[] | null = null;
  let prevYearMajorScores: IWPComparisonRow[] | null = null;

  if (!isSecond && typeof window !== 'undefined' && window.localStorage) {
    try {
      const prevEvalRaw = localStorage.getItem(`semester_eval_${client.id}_${prevYear}`);
      if (prevEvalRaw) {
        const prevEval = JSON.parse(prevEvalRaw);
        if (prevEval.trainingCompareSecondHalf && prevEval.trainingCompareSecondHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          prevYearTrainingScores = prevEval.trainingCompareSecondHalf;
        } else if (prevEval.trainingCompareFirstHalf && prevEval.trainingCompareFirstHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          prevYearTrainingScores = prevEval.trainingCompareFirstHalf;
        }

        if (prevEval.majorCompareSecondHalf && prevEval.majorCompareSecondHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          prevYearMajorScores = prevEval.majorCompareSecondHalf;
        } else if (prevEval.majorCompareFirstHalf && prevEval.majorCompareFirstHalf.some((r: any) => (r.convertedScore > 0 || r.percentage > 0))) {
          prevYearMajorScores = prevEval.majorCompareFirstHalf;
        }
      }

      if (!prevYearTrainingScores || !prevYearMajorScores) {
        const savedIwpRaw = localStorage.getItem('iwp_plans');
        if (savedIwpRaw) {
          const list = JSON.parse(savedIwpRaw);
          const prevPlan = list.find((p: any) => p.clientId === client.id && p.year === prevYear && (p.termType === '2차' || p.planType === '재수립'));
          if (prevPlan) {
            if (!prevYearTrainingScores && prevPlan.trainingCompareSecondHalf) {
              prevYearTrainingScores = prevPlan.trainingCompareSecondHalf;
            }
            if (!prevYearMajorScores && prevPlan.majorCompareSecondHalf) {
              prevYearMajorScores = prevPlan.majorCompareSecondHalf;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not read previous year evaluation from localStorage', e);
    }
  }

  const trainingCompareFirstHalf: IWPComparisonRow[] = isSecond
    ? [
        { item: '작업훈련', convertedScore: 3.6, percentage: 72 },
        { item: '직업교육', convertedScore: 4.0, percentage: 80 },
        { item: '직종훈련 프로그램', convertedScore: 3.8, percentage: 76 },
        { item: '자치회의 및 동아리 활동', convertedScore: 4.4, percentage: 88 },
        { item: '공통교육', convertedScore: 4.2, percentage: 84 },
      ]
    : (prevYearTrainingScores || [
        { item: '작업훈련', convertedScore: 0, percentage: 0 },
        { item: '직업교육', convertedScore: 0, percentage: 0 },
        { item: '직종훈련 프로그램', convertedScore: 0, percentage: 0 },
        { item: '자치회의 및 동아리 활동', convertedScore: 0, percentage: 0 },
        { item: '공통교육', convertedScore: 0, percentage: 0 },
      ]);

  const trainingCompareSecondHalf: IWPComparisonRow[] = isSecond
    ? [
        { item: '작업훈련', convertedScore: 4.2, percentage: 84 },
        { item: '직업교육', convertedScore: 4.4, percentage: 88 },
        { item: '직종훈련 프로그램', convertedScore: 4.4, percentage: 88 },
        { item: '자치회의 및 동아리 활동', convertedScore: 4.6, percentage: 92 },
        { item: '공통교육', convertedScore: 4.6, percentage: 92 },
      ]
    : [
        { item: '작업훈련', convertedScore: 0, percentage: 0 },
        { item: '직업교육', convertedScore: 0, percentage: 0 },
        { item: '직종훈련 프로그램', convertedScore: 0, percentage: 0 },
        { item: '자치회의 및 동아리 활동', convertedScore: 0, percentage: 0 },
        { item: '공통교육', convertedScore: 0, percentage: 0 },
      ];

  // 5. 전공훈련 프로그램 평가 사항
  const subjects = client.selectedSubjects && client.selectedSubjects.length > 0
    ? client.selectedSubjects
    : (trainingClass === '스마트산업반' ? ['AI전자작가', '미술', '사무보조'] : ['AI샌드아트', '미술', '공예']);

  const majorCompareFirstHalf: IWPComparisonRow[] = isSecond
    ? subjects.map((sub, idx) => ({
        item: sub,
        convertedScore: Number((3.6 + (idx * 0.2)).toFixed(1)),
        percentage: 72 + (idx * 4)
      }))
    : (prevYearMajorScores || subjects.map(sub => ({
        item: sub,
        convertedScore: 0,
        percentage: 0
      })));

  const majorCompareSecondHalf: IWPComparisonRow[] = isSecond
    ? subjects.map((sub, idx) => ({
        item: sub,
        convertedScore: Number((4.2 + (idx * 0.2)).toFixed(1)),
        percentage: 84 + (idx * 4)
      }))
    : subjects.map(sub => ({
        item: sub,
        convertedScore: 0,
        percentage: 0
      }));

  // 6. 단기목표 계획
  const defaultPeriod1st = `${currentYear}. 2. ~ 8.\n(6개월)`;
  const defaultPeriod2nd = `${currentYear}. 8. ~ '${String(currentYear + 1).slice(-2)}. 2.\n(6개월)`;
  const defaultPeriod = isSecond ? defaultPeriod2nd : defaultPeriod1st;

  const educationGoals: IWPShortTermGoal[] = [
    {
      id: 'goal_1',
      goalTitle: `직업준비도 향상\n(${ersConvertedSum}점 -> ${ersConvertedSum + 5}점)\n평가방법: ERS`,
      period: defaultPeriod,
      serviceContent: `- 도구평가를 통한 직업준비도 사전 수준 파악 1회 진행\n- 직업교육, 일상생활훈련 PG참여 분기 1회 이상 실시\n- ${guidance.goalService}\n- 보호자 상담 및 사례회의를 통한 사후검사 실시 및 목표 달성 여부 확인`,
      evaluator: '최재원',
      status: isSecond ? '달성' : '진행 예정'
    },
    {
      id: 'goal_2',
      goalTitle: `작업능력 증진\n(조립영역 평균 달성)\n평가방법: 퍼듀펙보드`,
      period: defaultPeriod,
      serviceContent: `- 임가공 및 도안 채색 활동 상시 진행\n- 부품 조립 및 양손 민첩성 훈련 주 2회 실시`,
      evaluator: '최재원',
      status: isSecond ? '달성' : '진행 예정'
    },
    {
      id: 'goal_3',
      goalTitle: `직무적응력 형성\n(평균 3점 이상)\n평가방법: 모니터링 평가표`,
      period: defaultPeriod,
      serviceContent: `- 자치회의 및 자조모임 동아리 참여 월 1회 이상 실시\n- 직업적응훈련반 워크숍 1회 참여\n- 공통교육(합창) 주 1회 참여`,
      evaluator: '최재원',
      status: isSecond ? '진행중' : '진행 예정'
    },
    {
      id: 'goal_4',
      goalTitle: `직무기술 습득\n(평균 3점 이상)\n평가방법: 전공훈련 평가표`,
      period: defaultPeriod,
      serviceContent: `- 전공훈련 프로그램 주 1회 이상 참여\n  (${subjects.join(', ')})`,
      evaluator: '최재원',
      status: isSecond ? '진행중' : '진행 예정'
    }
  ];

  const personalGoals: IWPShortTermGoal[] = [
    {
      id: 'pgoal_1',
      goalTitle: '감정조절 방법 습득',
      period: defaultPeriod,
      serviceContent: `- 감정조절 및 자기표현 훈련 상시 진행\n- 무단이탈 및 부적절한 행동 발생 시 즉각적인 상황중재 및 상담 진행`,
      evaluator: '최재원',
      status: isSecond ? '진행중' : '진행 예정'
    },
    {
      id: 'pgoal_2',
      goalTitle: '올바른 금전관리 형성',
      period: defaultPeriod,
      serviceContent: `- 금전관리 및 타인 물품 사용 규칙에 대한 반복 교육 진행`,
      evaluator: '최재원',
      status: isSecond ? '달성' : '진행 예정'
    }
  ];

  // 생년월일 포맷
  const birthFormatted = client.birthDate
    ? client.birthDate.replace(/-/g, '. ') + '.'
    : '1997. 5. 31.';

  return {
    id: `iwp_${client.id}_${isSecond ? '2nd' : '1st'}_${currentYear}`,
    clientId: client.id,
    year: currentYear,
    termType,
    planType: isSecond ? '재수립' : '수립',
    trainingClass,
    planDate: isSecond ? `${currentYear}. 8. 7.` : `${currentYear}. 2. 6.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // 1. 기본정보
    name: client.name,
    gender: client.gender === 'M' ? '남' : '여',
    birthDate: birthFormatted,
    disabilityType: client.diagnosis ? client.diagnosis.split('/')[0].trim() : '지적',
    desiredGoal: '직업적응훈련을 통한 직무 탐색 및 취업 전이 역량 강화',

    // 2. 강점 및 제한점
    strengths: [
      '단순 조립 및 반복 작업 수행 가능',
      '작업지시 이해 및 의사소통 가능',
      '직업의식 및 책임감 양호',
      '집단활동 적응 가능'
    ],
    limitations: [
      '작업 숙련도 및 속도 향상 필요',
      '환경 변화 적응에 시간 필요',
      '사회적 상황 판단 및 역할 이해 지도 필요',
      '지속적인 반복 훈련 필요'
    ],

    // 3. 진단 및 평가
    ersTestDate: targetErs ? `${targetErs.testDate}` : (isSecond ? `${currentYear}. 7. 25.(금)` : `${currentYear}. 2. 2.(월)`),
    ersScores,
    ersConvertedSum,
    ersStandardScore,
    ersLowestDomain,
    ersAnalysisText,

    pictureInterestAnalysis,

    purdueScores,

    trainingCompareFirstHalf,
    trainingCompareSecondHalf,
    trainingCompareNotes: isSecond
      ? '○ 상반기 중간평가(작업훈련 72%, 직업교육 80%) 성과를 바탕으로 하반기에는 직무 집중력과 정확도를 향상시켜 전 영역 85% 이상 성취를 목표로 함.'
      : (prevYearTrainingScores
          ? `○ 직전년도(${prevYear}년) 하반기 직업적응훈련 평가 결과를 반영함.`
          : '○ 해당 사항 없음 (1차 평가 6월 진행 예정)'),

    majorCompareFirstHalf,
    majorCompareSecondHalf,
    majorCompareNotes: isSecond
      ? '○ 전공 실습에서 기초 작업 도구 조작 능력이 향상되었으며, 하반기에는 심화 과제 수행 및 불량률 감소 훈련을 강화할 예정임.'
      : (prevYearMajorScores
          ? `○ 직전년도(${prevYear}년) 하반기 전공훈련 평가 결과를 반영함.`
          : '○ 해당 사항 없음 (1차 평가 6월 진행 예정)'),

    // 4. 방향 및 목표
    longTermGoal: '- 직업적응훈련을 통한 직무역량 및 사회적응능력 향상을 기반으로 외부 취업 및 안정적인 직업 유지 도모',

    // 5. 단기목표 계획
    educationGoals,
    personalGoals,

    // 6. 단기목표 달성 여부
    goalAchievementNote: isSecond
      ? '○ 1차 단기목표 점검 결과:\n- ERS 직업준비도 검사 목표 환산점수 5점 향상 달성\n- 퍼듀펙보드 조립영역 표준 규준 도달 달성\n- 직무적응력 및 전공기술 루브릭 평가 3점 이상 유지 중'
      : '- 해당 사항 없음.(연초 1차 수립으로, 7~8월 중간평가 시 점검 예정)',

    // 7. 단기목표 미달성 재수립 계획
    goalUnachievedReplanNote: isSecond
      ? '○ 하반기 재수립 계획:\n- 복합 부품 조립 공정 및 작업 속도 15% 향상 목표 추가\n- 직무 대인관계 의사소통 훈련 주 1회 연계 및 자기옹호 프로그램 참여'
      : '- 해당 사항 없음.',

    // 8. 지원계획회의
    caseConferenceDate: isSecond ? `'${String(currentYear).slice(-2)}. 8. 7.` : `'${String(currentYear).slice(-2)}. 2. 2.`,
    caseConferenceContent: isSecond
      ? '- 상반기 중간평가 결과 공유 및 2차 개별화재활계획서(IWP) 재수립 심의'
      : '- 상황평가 내용 공유 및 직업적응훈련반 선정 여부 논의',
    caseConferenceNote: isSecond
      ? '2차 재수립 계획 원안 승인\n(하반기 맞춤형 훈련 지속 지원)'
      : '직업적응훈련반 이용 선정\n(26년 2월 ~ 30년 2월)',

    // 서명란
    evaluatorName: '최 재 원',
    clientSignName: client.name,
    organizationName: '수원시장애인종합복지관 능력개발지원팀'
  };
}

/**
 * 7~8월 중간평가서 기본 데이터 생성기 (개별화서비스계획 중간평가서 공문서 규격)
 */
export function generateDefaultMidtermReport(
  client: Client,
  purdueTests: PurdueTest[],
  ersTests: ERSTest[],
  targetYear?: number
): MidtermEvaluationReportData {
  const currentYear = targetYear || new Date().getFullYear();
  const trainingClass = client.trainingClass || '문화예술반';
  const subjects = client.selectedSubjects && client.selectedSubjects.length > 0
    ? client.selectedSubjects
    : (trainingClass === '스마트산업반' ? ['AI전자작가', '미술', '사무보조'] : ['AI샌드아트', '미술', '공예']);

  // Get year-specific assessments
  const yearAssessments = findYearAssessments(currentYear, purdueTests, ersTests);
  const ers1 = yearAssessments.ers1st;
  const ers2 = yearAssessments.ers2nd;

  let ers1stScores: IWPErsDomainScore[] = [
    { domain: '일상생활', rawScore: 23, convertedScore: 11 },
    { domain: '인지기술', rawScore: 50, convertedScore: 14 },
    { domain: '자존감', rawScore: 18, convertedScore: 8 },
    { domain: '직업의식', rawScore: 24, convertedScore: 13 },
    { domain: '사회기술', rawScore: 18, convertedScore: 8 },
    { domain: '직업기술', rawScore: 25, convertedScore: 10 },
    { domain: '작업기술', rawScore: 33, convertedScore: 11 },
  ];
  let ers1stConvertedSum = 75;
  let ers1stStandardScore = 102;

  let ers2ndScores: IWPErsDomainScore[] = [
    { domain: '일상생활', rawScore: 28, convertedScore: 13 },
    { domain: '인지기술', rawScore: 52, convertedScore: 15 },
    { domain: '자존감', rawScore: 32, convertedScore: 15 },
    { domain: '직업의식', rawScore: 28, convertedScore: 15 },
    { domain: '사회기술', rawScore: 36, convertedScore: 15 },
    { domain: '직업기술', rawScore: 32, convertedScore: 13 },
    { domain: '작업기술', rawScore: 44, convertedScore: 14 },
  ];
  let ers2ndConvertedSum = 100;
  let ers2ndStandardScore = 138;

  if (ers1) {
    const analysis1 = analyzeErsTest(ers1.answers);
    ers1stScores = analysis1.domainResults.map(d => ({ domain: d.name, rawScore: d.score, convertedScore: d.convertedScore }));
    ers1stConvertedSum = analysis1.convertedSum;
    ers1stStandardScore = analysis1.standardScoreVal;
  }
  if (ers2) {
    const analysis2 = analyzeErsTest(ers2.answers);
    ers2ndScores = analysis2.domainResults.map(d => ({ domain: d.name, rawScore: d.score, convertedScore: d.convertedScore }));
    ers2ndConvertedSum = analysis2.convertedSum;
    ers2ndStandardScore = analysis2.standardScoreVal;
  } else if (ers1) {
    ers2ndScores = ers1stScores.map(s => ({
      domain: s.domain,
      rawScore: s.rawScore + 2,
      convertedScore: Math.min(15, s.convertedScore + 2)
    }));
    ers2ndConvertedSum = Math.min(105, ers1stConvertedSum + 10);
    ers2ndStandardScore = Math.min(150, ers1stStandardScore + 15);
  }

  // Purdue 1차 / 2차 데이터 구성
  const norms = PURDUE_NORMS_BY_TYPE['지원고용'];
  const p1 = yearAssessments.purdue1st;
  const p2 = yearAssessments.purdue2nd;

  const buildPurdueScores = (test: PurdueTest | null, fallback: IWPPurdueScore[]): IWPPurdueScore[] => {
    if (!test) return fallback;
    const isLeftDom = client.handDominance === 'L';
    const rScore = test.rightHand;
    const lScore = test.leftHand;
    const bScore = test.bothHands;
    const sumScore = Number((rScore + lScore + bScore).toFixed(2));
    const aScore = test.assembly;

    const domScore = isLeftDom ? lScore : rScore;
    const nonDomScore = isLeftDom ? rScore : lScore;
    const domMean = isLeftDom ? norms.leftHand.mean : norms.rightHand.mean;
    const nonDomMean = isLeftDom ? norms.rightHand.mean : norms.leftHand.mean;

    const getResultText = (score: number, mean: number): '평균' | '높음' | '낮음' | '매우 높음' | '매우 낮음' => {
      if (score >= mean + 2.5) return '매우 높음';
      if (score >= mean + 1.0) return '높음';
      if (score <= mean - 2.5) return '매우 낮음';
      if (score <= mean - 1.0) return '낮음';
      return '평균';
    };

    return [
      { item: '우세손', myScore: domScore, standardMean: domMean, resultText: getResultText(domScore, domMean) },
      { item: '비우세손', myScore: nonDomScore, standardMean: nonDomMean, resultText: getResultText(nonDomScore, nonDomMean) },
      { item: '양손', myScore: bScore, standardMean: norms.bothHands.mean, resultText: getResultText(bScore, norms.bothHands.mean) },
      { item: '합계', myScore: sumScore, standardMean: norms.sumRLB.mean, resultText: getResultText(sumScore, norms.sumRLB.mean) },
      { item: '조립', myScore: aScore, standardMean: norms.assembly.mean, resultText: getResultText(aScore, norms.assembly.mean) },
    ];
  };

  const defaultPurdue1st: IWPPurdueScore[] = [
    { item: '우세손', myScore: 12.00, standardMean: 13.53, resultText: '평균' },
    { item: '비우세손', myScore: 18.00, standardMean: 13.27, resultText: '매우 높음' },
    { item: '양손', myScore: 12.00, standardMean: 10.51, resultText: '평균' },
    { item: '합계', myScore: 43.00, standardMean: 37.31, resultText: '평균' },
    { item: '조립', myScore: 34.00, standardMean: 25.95, resultText: '높음' },
  ];

  const defaultPurdue2nd: IWPPurdueScore[] = [
    { item: '우세손', myScore: 16.00, standardMean: 18.19, resultText: '낮음' },
    { item: '비우세손', myScore: 11.00, standardMean: 17.36, resultText: '매우 낮음' },
    { item: '양손', myScore: 9.00, standardMean: 14.60, resultText: '매우 낮음' },
    { item: '합계', myScore: 47.00, standardMean: 50.14, resultText: '평균' },
    { item: '조립', myScore: 38.00, standardMean: 42.72, resultText: '평균' },
  ];

  const purdue1stScores = buildPurdueScores(p1, defaultPurdue1st);
  const purdue2ndScores = buildPurdueScores(p2, defaultPurdue2nd);

  const formatTestDate = (dateStr?: string, fallbackMonth = 2, fallbackDay = 6) => {
    if (!dateStr) return `${currentYear}. ${String(fallbackMonth).padStart(2, '0')}. ${String(fallbackDay).padStart(2, '0')}.`;
    const clean = dateStr.replace(/[-]/g, '. ');
    return clean.endsWith('.') ? clean : clean + '.';
  };

  const ers1stDate = formatTestDate(ers1?.testDate, 2, 6);
  const ers2ndDate = formatTestDate(ers2?.testDate, 7, 15);
  const purdue1stDate = formatTestDate(p1?.testDate, 2, 6);
  const purdue2ndDate = formatTestDate(p2?.testDate, 7, 15);

  // 2-3. 상반기 직업적응훈련반 훈련 평가 사항
  const training1stHalfScores: IWPComparisonRow[] = [
    { item: '작업훈련', convertedScore: 0, percentage: 0 },
    { item: '직업교육', convertedScore: 0, percentage: 0 },
    { item: '직종훈련 프로그램', convertedScore: 0, percentage: 0 },
    { item: '자치회의 및 동아리 활동', convertedScore: 0, percentage: 0 },
    { item: '공통교육', convertedScore: 0, percentage: 0 },
  ];

  // 2-4. 상반기 전공 훈련 프로그램 평가 사항
  const major1stHalfScores: IWPComparisonRow[] = subjects.map(sub => ({
    item: sub,
    convertedScore: 0,
    percentage: 0
  }));

  const defaultPeriod = `${currentYear}. 2. 2. ~ 8. 2.\n(6개월)`;

  // 4-1. 교육역량강화 단기목표 계획
  const educationGoals: IWPShortTermGoal[] = [
    {
      id: 'm_edu_1',
      goalTitle: '직업준비도 향상\n(00점 -> 00점)',
      period: defaultPeriod,
      serviceContent: '- 도구평가를 통한 직업준비도 사전 수준 파악 1회 진행\n- 직업교육 및 일상생활훈련 PG 참여 분기 1회 이상 실시',
      evaluator: '최재원',
      status: '진행 예정'
    },
    {
      id: 'm_edu_2',
      goalTitle: '작업능력 증진\n(00점 -> 00점)',
      period: defaultPeriod,
      serviceContent: '- 소근육 조립 및 임가공 반복 훈련 진행\n- 도구 활용 및 부품 조립 숙련도 향상',
      evaluator: '최재원',
      status: '진행 예정'
    },
    {
      id: 'm_edu_3',
      goalTitle: '직무적응력 형성\n(00점 -> 00점)',
      period: defaultPeriod,
      serviceContent: '- 월1~2회 이상 자치회의 참여\n- 월1~2회 이상 동아리 활동 수행',
      evaluator: '최재원',
      status: '진행 예정'
    },
    {
      id: 'm_edu_4',
      goalTitle: '직무기술 습득\n(00점 -> 00점)',
      period: defaultPeriod,
      serviceContent: '- 금전 관리 및 생활기술 습득을 위한 상담 진행\n- 전공훈련 프로그램 주 1회 이상 참여',
      evaluator: '최재원',
      status: '진행 예정'
    }
  ];

  // 4-2. 개인역량강화 단기목표 계획
  const personalGoals: IWPShortTermGoal[] = [
    {
      id: 'm_pers_1',
      goalTitle: '감정조절 및 자기표현',
      period: defaultPeriod,
      serviceContent: '- 스트레스 상황 시 담당자에게 알리고 의사표현하기\n- 감정조절 훈련 및 상담 상시 진행',
      evaluator: '최재원',
      status: '진행 예정'
    },
    {
      id: 'm_pers_2',
      goalTitle: '올바른 금전관리 형성',
      period: defaultPeriod,
      serviceContent: '- 용돈 기입 및 타인 물품 사용 규칙 준수 훈련',
      evaluator: '최재원',
      status: '진행 예정'
    }
  ];

  const birthFormatted = client.birthDate
    ? client.birthDate.replace(/-/g, '. ') + '.'
    : '1997. 5. 31.';

  return {
    id: `midterm_${client.id}_${currentYear}`,
    clientId: client.id,
    year: currentYear,
    evalDate: `${currentYear}. 8. 7.`,
    evalPeriod: `${currentYear}. 2. 2. ~ 8. 2. (6개월)`,
    evaluatorName: '최재원',
    teamLeadName: '최재원',
    trainingClass,
    selectedSubjects: subjects,
    name: client.name,
    gender: client.gender === 'M' ? '남' : '여',
    birthDate: birthFormatted,
    disabilityType: client.diagnosis ? client.diagnosis.split('/')[0].trim() : '지적',
    desiredGoal: '직업적응훈련을 통한 직무 탐색 및 취업 전이 역량 강화',

    // 2. 직업준비검사 결과
    ers1stDate,
    ers2ndDate,
    ers1stScores,
    ers1stConvertedSum,
    ers1stStandardScore,
    ers2ndScores,
    ers2ndConvertedSum,
    ers2ndStandardScore,
    ersResultOpinion: '하반기 상황평가 대비 표준점수 상향되었음. 하위영역 중 일상생활기술은 타 영역보다 양호한 편이나, 직업기술이 타 영역보다 다소 낮게 나타남. 실질적인 직업기술 능력 향상 보완 훈련 필요할 것으로 사료됨.',

    purdue1stDate,
    purdue2ndDate,
    purdue1stScores,
    purdue2ndScores,

    training1stHalfScores,
    training1stHalfComment: '상반기 직업적응훈련 전반에 성실하게 참여하였으며, 출결 및 기본 생활 규칙 준수 양호함.',

    major1stHalfScores,
    major1stHalfComment: '전공 선택 과목 기초 조작 및 실습 도구 활용 방법을 원활하게 습득함.',

    // 3. 방향 및 목표
    longTermGoal: '- 직업적응훈련을 통한 직무역량 및 사회적응능력 향상을 기반으로 외부 취업 및 안정적인 직업 유지 도모',

    // 4. 단기목표 계획
    educationGoals,
    personalGoals,

    // 5. 단기목표 달성 여부
    goalAchievementRows: [
      { goalTitle: '-', period: '-', serviceContent: '-', status: '-', note: '-' }
    ],

    // 6. 단기목표 미달성 재수립 계획
    unachievedPlanNote: '- 해당 사항 없음.',

    // 서명란
    evalDateYear: String(currentYear),
    evalDateMonth: '8',
    evalDateDay: '7',
    traineeSignatureName: client.name,
    guardianSignatureName: client.name + ' 보호자',
    evaluatorSignatureName: '최재원',
    organizationName: '수원시장애인종합복지관 능력개발지원팀',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

