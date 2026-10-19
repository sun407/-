/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  text: string;
  category?: string;
  subCategory?: string;
}

// 1. ERS (사회성 및 직업적응력 평가) - 63문항, 7개 영역
// Likert 4-point (1: 고용이 어려울 정도로 수행이 안됨, 2: 고용 시 문제가 될 정도로 일관성 없는 수행을 보임, 3: 강점은 아니더라도 적절하게 수행함, 4: 고용이 가능할 정도로 수행이 잘 됨)
export const ERS_QUESTIONS: Question[] = [
  { id: 1, text: "옷차림이 단정하고 깔끔하다.", category: "일상생활", subCategory: "개인위생" },
  { id: 2, text: "간단한 문장을 읽고 이해할 수 있다.", category: "인지기술", subCategory: "읽기" },
  { id: 3, text: "긍정적인 자아상을 갖는다.", category: "자존감", subCategory: "자아상" },
  { id: 4, text: "돈을 벌기 위해 일을 하고 싶어 한다.", category: "직업의식", subCategory: "직업욕구" },
  { id: 5, text: "사소한 일, 중요하지 않은 일에 쉽게 화를 내지 않는다.", category: "사회기술", subCategory: "일반" },
  { id: 6, text: "허락 없이 작업장을 함부로 벗어나지 않는다.", category: "직업관련기술", subCategory: "작업습관" },
  { id: 7, text: "양손의 민첩성이 좋고 빠른 작업수행을 보인다.", category: "작업기술", subCategory: "양손민첩성" },
  { id: 8, text: "몸을 청결히 하고 위생을 지킨다.", category: "일상생활", subCategory: "개인위생" },
  { id: 9, text: "시(時), 분(分)단위로 시간을 말할 수 있다.", category: "인지기술", subCategory: "시간개념" },
  { id: 10, text: "자기 자신을 격려하고 지지한다.", category: "자존감", subCategory: "자기옹호" },
  { id: 11, text: "자신이 성인이기 때문에 직업을 가져야 한다고 생각한다.", category: "직업의식", subCategory: "직업욕구" },
  { id: 12, text: "다른 사람에게 피해를 주는 행동을 하지 않는다.", category: "사회기술", subCategory: "일반" },
  { id: 13, text: "결근, 지각, 조퇴를 하지 않는다.", category: "직업관련기술", subCategory: "근무태도" },
  { id: 14, text: "불량품을 만들지 않도록 정확하게 작업한다.", category: "작업기술", subCategory: "작업정확성" },
  { id: 15, text: "면도 또는 생리처리를 할 수 있다.", category: "일상생활", subCategory: "개인위생" },
  { id: 16, text: "10가지 사물을 정확하게 셀 수 있다.", category: "인지기술", subCategory: "수개념" },
  { id: 17, text: "오해나 문제가 발생하면 적절히 자신을 변호하고 옹호한다.", category: "자존감", subCategory: "자기옹호" },
  { id: 18, text: "생계비를 버는 것을 중요하게 생각한다.", category: "직업의식", subCategory: "직업의식" },
  { id: 19, text: "부적절한 말이나 행동을 하지 않는다.", category: "사회기술", subCategory: "일반" },
  { id: 20, text: "작업시간과 휴식시간을 구별하여 행동한다.", category: "직업관련기술", subCategory: "작업태도" },
  { id: 21, text: "지시한 방법에 따라 정확하게 과제를 수행한다.", category: "작업기술", subCategory: "작업정확성" },
  { id: 22, text: "옷이 더러워지면 세탁 시기를 알 수 있다.", category: "일상생활", subCategory: "세탁하기" },
  { id: 23, text: "100가지 사물을 정확하게 셀 수 있다.", category: "인지기술", subCategory: "수개념" },
  { id: 24, text: "매사에 자신감을 보이고 적극적으로 어떤 활동에 참여한다.", category: "자존감", subCategory: "자신감" },
  { id: 25, text: "자기의 능력을 알고 희망하는 직업이 현실적이다.", category: "직업의식", subCategory: "자기이해" },
  { id: 26, text: "충고를 하거나 잘못을 지적해도 화를 내거나 의기소침해 하지 않는다.", category: "사회기술", subCategory: "일반" },
  { id: 27, text: "정해진 안전수칙을 지킨다.", category: "직업관련기술", subCategory: "안전수칙" },
  { id: 28, text: "정교하고 복잡한 작업과제를 꼼꼼하고 정확하게 잘 수행한다.", category: "작업기술", subCategory: "작업정확성" },
  { id: 29, text: "식습관이나 식사예절이 올바르다.", category: "일상생활", subCategory: "식사예절" },
  { id: 30, text: "두 자리 수의 덧셈과 뺄셈이 가능하다.", category: "인지기술", subCategory: "덧셈과 뺄셈" },
  { id: 31, text: "자신을 존중하고 가치있는 존재라고 생각한다.", category: "자존감", subCategory: "자존감" },
  { id: 32, text: "자신이 희망하는 직업흥미나 업무를 말할 수 있다.", category: "직업의식", subCategory: "자기이해" },
  { id: 33, text: "스트레스 상황에서 자신의 감정을 통제하고 차분함을 유지한다.", category: "사회기술", subCategory: "일반" },
  { id: 34, text: "회사사정으로 잔업이 필요할 경우 잔업을 할 수 있다.", category: "직업관련기술", subCategory: "작업태도" },
  { id: 35, text: "생산량에 맞추어 신속하게 작업과제를 수행한다.", category: "작업기술", subCategory: "작업수행" },
  { id: 36, text: "이불 개기, 쓰레기 버리기, 옷 걸기 등의 일상적인 집안일을 할 수 있다.", category: "일상생활", subCategory: "집안일 돕기" },
  { id: 37, text: "거스름돈 계산이 가능하다.", category: "인지기술", subCategory: "금전개념" },
  { id: 38, text: "자신의 고민을 의논할 수 있다.", category: "자존감", subCategory: "자기표현" },
  { id: 39, text: "직업정보에 관심이 있으며 상담하는 것만이 아니라 스스로 정보를 얻고자 직접 행동한다.", category: "직업의식", subCategory: "구직활동" },
  { id: 40, text: "작업장에서 동료들과 적절한 관계를 유지한다.", category: "사회기술", subCategory: "직업관련" },
  { id: 41, text: "적절한 휴식이 제공된다면 8시간의 좌식작업이 가능하다.", category: "직업관련기술", subCategory: "체력" },
  { id: 42, text: "과제수행이 익숙해짐에 따라 숙련을 보이고 생산량이 증가한다.", category: "작업기술", subCategory: "작업숙련성" },
  { id: 43, text: "감기나 배탈 등의 간단한 질병에 대해 보고하거나 대처할 수 있다.", category: "일상생활", subCategory: "건강관리" },
  { id: 44, text: "전화를 받을 수 있고 통화내용을 대부분 정확하게 전달한다.", category: "인지기술", subCategory: "전화사용" },
  { id: 45, text: "자신의 감정을 표현할 수 있다.", category: "자존감", subCategory: "자기표현" },
  { id: 46, text: "취업을 희망하고 이를 달성하기 위해 구직활동을 한다.", category: "직업의식", subCategory: "구직활동" },
  { id: 47, text: "작업장에서 관리자와 적절한 관계를 유지한다.", category: "사회기술", subCategory: "직업관련" },
  { id: 48, text: "적절한 휴식이 제공된다면 8시간의 입식작업이 가능하다.", category: "직업관련기술", subCategory: "체력" },
  { id: 49, text: "정해진 방법에 따라 효율적으로 도구를 사용한다.", category: "작업기술", subCategory: "도구사용력" },
  { id: 50, text: "질문을 통해 간단한 서류작성이 가능하다 (예: 나이, 이름, 전화번호, 주소 등).", category: "인지기술", subCategory: "정보전달력" },
  { id: 51, text: "자기가 잘못한 일을 반성할 수 있다.", category: "자존감", subCategory: "자기반성" },
  { id: 52, text: "직장 동료가 실수를 하더라도 불필요한 간섭을 하지 않는다.", category: "사회기술", subCategory: "직업관련" },
  { id: 53, text: "가벼운 물건(5kg 이하)을 다루는 작업을 8시간 정도 지속할 수 있다.", category: "직업관련기술", subCategory: "체력" },
  { id: 54, text: "이전에 배운 기술을 새로운 과제에 응용한다.", category: "작업기술", subCategory: "작업응용" },
  { id: 55, text: "대중교통수단을 이용하여 가까운 거리의 이동이 가능하다.", category: "인지기술", subCategory: "대중교통" },
  { id: 56, text: "주의사항을 잘 듣고 그대로 이행한다.", category: "사회기술", subCategory: "직업관련" },
  { id: 57, text: "변경된 작업과제에 쉽게 적응하고 생산량을 적절하게 유지한다.", category: "작업기술", subCategory: "작업적응" },
  { id: 58, text: "대중교통수단을 이용하여 먼 거리(시외 지역)의 이동이 가능하다.", category: "인지기술", subCategory: "대중교통" },
  { id: 59, text: "최소한의 감독·관리로 과제를 수행한다.", category: "작업기술", subCategory: "관리감독 양" },
  { id: 60, text: "가게에서 필요한 물건을 구입한다.", category: "인지기술", subCategory: "물건구매" },
  { id: 61, text: "작업방법을 바꾸도록 지시할 때 변경한다.", category: "작업기술", subCategory: "관리감독 양" },
  { id: 62, text: "인터넷을 이용하여 원하는 정보를 검색하고 활용한다 (예: 뉴스, 음악 등).", category: "인지기술", subCategory: "인터넷활용" },
  { id: 63, text: "인터넷으로 버스노선, 위치검색을 통하여 원하는 목적지로 이동할 수 있다.", category: "인지기술" , subCategory: "인터넷활용" }
];

// 2. Employment Readiness Scale (구직준비도 검사) - ERS (직업재활 버전)
// 15 items, Likert 5-point (1: 매우 부족하다, 2: 다소 부족하다, 3: 보통이다, 4: 대체로 준비됨, 5: 완벽히 준비됨)
export const EMPLOYABILITY_QUESTIONS: Question[] = [
  { id: 1, text: "내가 원하는 직업 분야가 명확하고, 어떤 일을 해야 하는지 잘 알고 있다.", category: "진로 목표 명확성" },
  { id: 2, text: "이력서나 자기소개서를 스스로 완성도 있게 작성할 수 있다.", category: "구직 기술" },
  { id: 3, text: "면접 상황에서 나의 장점과 작업 능력을 긴장하지 않고 충분히 어필할 수 있다.", category: "면접 및 직무 자신감" },
  { id: 4, text: "취업을 위해 필요한 정보(구인 공고, 자격 요건, 직업 훈련 등)를 잘 검색하고 수집할 수 있다.", category: "구직 기술" },
  { id: 5, text: "새로운 직장 동료들과 쉽게 원만한 대인관계를 형성하고 갈등을 예방할 수 있다.", category: "사회적 기술" },
  { id: 6, text: "정해진 출근 시간 및 규칙적인 일과 스케줄을 매일 성실히 준수할 자신감이 있다.", category: "직업 태도" },
  { id: 7, text: "업무상 지시나 피드백을 수용하고, 실수나 오류를 능동적으로 보완할 준비가 되어 있다.", category: "직동/지시 수용능력" },
  { id: 8, text: "직무 수행 중 생기는 피로감이나 체력적 부담을 성실히 이겨내고 관리할 체력이 있다.", category: "신체적 준비도" },
  { id: 9, text: "직업 환경에서 마주할 수 있는 예측하지 못한 문제들을 주도적으로 해결하려 시도한다.", category: "문제해결력" },
  { id: 10, text: "나의 건강 상태(또는 장애 요인)가 일상 생활과 직무에 미치는 영향을 객관적으로 알고 다룰 줄 안다.", category: "자기 조절 및 장애관리" },
  { id: 11, text: "취업 후 안정적인 출퇴근을 위한 교통수단 이용에 전혀 제약이 없다.", category: "환경적 준비도" },
  { id: 12, text: "가족이나 주변 사람들은 나의 취업을 신뢰하고 성실하게 응원해준다.", category: "외적 지지 체계" },
  { id: 13, text: "직업 생활을 유지하는 동안 예상치 못한 스트레스가 발생하더라도 슬기롭게 복원할 수 있다.", category: "정서적 유연성" },
  { id: 14, text: "직무 기술이나 기계 조작법 등 직무 요구 사항을 습득하는 데 열의와 배움의 의지가 충만하다.", category: "직무 학습 능력" },
  { id: 15, text: "경제적 자립(월급 관리 등) 및 취업 유지에 대한 개인적인 동기가 확고하다.", category: "취업 동기" }
];

// Purdue Pegboard Standard Norms (직업적응훈련_지원고용기준)
// 우세손 12.61, 비우세손 11.94, 양손평균 9.35, 조립평균 24.54, 합산 33.9
export const PURDUE_NORMS = {
  male: {
    rightHand: { mean: 12.61, sd: 2.25 },
    leftHand: { mean: 11.94, sd: 2.27 },
    bothHands: { mean: 9.35, sd: 2.09 },
    assembly: { mean: 24.54, sd: 7.38 },
    sumRLB: { mean: 33.91, sd: 6.07 }
  },
  female: {
    rightHand: { mean: 12.61, sd: 2.25 },
    leftHand: { mean: 11.94, sd: 2.27 },
    bothHands: { mean: 9.35, sd: 2.09 },
    assembly: { mean: 24.54, sd: 7.38 },
    sumRLB: { mean: 33.91, sd: 6.07 }
  }
};

export type PurdueNormType = '비장애인' | '지적장애인' | '지원고용' | '보호고용';

export const PURDUE_NORMS_BY_TYPE: Record<PurdueNormType, {
  rightHand: { mean: number; sd: number }; // 우세손
  leftHand: { mean: number; sd: number };  // 비우세손
  bothHands: { mean: number; sd: number }; // 양손
  sumRLB: { mean: number; sd: number };    // 합계
  assembly: { mean: number; sd: number };  // 조립
}> = {
  '비장애인': {
    rightHand: { mean: 18.19, sd: 1.49 },
    leftHand: { mean: 17.36, sd: 1.57 },
    bothHands: { mean: 14.60, sd: 1.46 },
    sumRLB: { mean: 50.14, sd: 3.95 },
    assembly: { mean: 42.72, sd: 5.64 }
  },
  '지적장애인': {
    rightHand: { mean: 13.53, sd: 2.46 },
    leftHand: { mean: 13.27, sd: 2.35 },
    bothHands: { mean: 10.51, sd: 2.31 },
    sumRLB: { mean: 37.31, sd: 6.61 },
    assembly: { mean: 25.95, sd: 7.64 }
  },
  '지원고용': {
    rightHand: { mean: 12.61, sd: 2.25 },
    leftHand: { mean: 11.94, sd: 2.27 },
    bothHands: { mean: 9.35, sd: 2.09 },
    sumRLB: { mean: 33.91, sd: 6.07 },
    assembly: { mean: 24.54, sd: 7.38 }
  },
  '보호고용': {
    rightHand: { mean: 10.17, sd: 2.45 },
    leftHand: { mean: 9.47, sd: 2.63 },
    bothHands: { mean: 7.07, sd: 2.42 },
    sumRLB: { mean: 26.72, sd: 6.97 },
    assembly: { mean: 17.07, sd: 5.89 }
  }
};

/**
 * Perform a clinical evaluation of a Purdue score based on gender and component
 * Returns score interpretation, warning levels, normative average
 */
export function analyzePurdueScore(
  gender: 'M' | 'F',
  component: 'rightHand' | 'leftHand' | 'bothHands' | 'assembly' | 'sumRLB',
  score: number,
  handDominance: 'R' | 'L' | 'Ambi' = 'R',
  normType: '비장애인' | '지적장애인' | '지원고용' | '보호고용' = '지원고용'
) {
  const normGroup = PURDUE_NORMS_BY_TYPE[normType] || PURDUE_NORMS_BY_TYPE['지원고용'];
  
  let targetComponent = component;
  if (handDominance === 'L') {
    if (component === 'rightHand') targetComponent = 'leftHand';
    else if (component === 'leftHand') targetComponent = 'rightHand';
  }
  
  const { mean, sd } = normGroup[targetComponent];
  
  // Calculate Z-score = (score - mean) / sd
  const zScore = (score - mean) / sd;

  // Exact cumulative standard normal distribution calculation using Abramowitz & Stegun approximation (precision ~1e-7)
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(zScore));
  const d = 0.39894228 * Math.exp(-zScore * zScore / 2.0);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = zScore >= 0 ? 1.0 - p : p;
  const percentile = parseFloat(((1.0 - cdf) * 100).toFixed(1));
  const pctVal = parseFloat((cdf * 100).toFixed(1));
  
  let classification: '매우 우수' | '우수' | '보통' | '미흡' | '매우 미흡' = '보통';
  let statusColor = 'text-slate-600 bg-slate-50 border border-slate-150';
  let severity: 'normal' | 'low' | 'very_low' | 'high' = 'normal';

  if (pctVal >= 84) {
    classification = '매우 우수';
    statusColor = 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    severity = 'high';
  } else if (pctVal >= 60) {
    classification = '우수';
    statusColor = 'text-indigo-600 bg-indigo-50 border border-indigo-100';
    severity = 'high';
  } else if (pctVal >= 40) {
    classification = '보통';
    statusColor = 'text-slate-600 bg-slate-50 border border-slate-150';
    severity = 'normal';
  } else if (pctVal >= 16) {
    classification = '미흡';
    statusColor = 'text-amber-600 bg-amber-50 border border-amber-100';
    severity = 'low';
  } else {
    classification = '매우 미흡';
    statusColor = 'text-rose-600 bg-rose-50 border border-rose-150';
    severity = 'very_low';
  }

  return {
    mean,
    sd,
    zScore: parseFloat(zScore.toFixed(2)),
    percentile,
    classification,
    statusColor,
    severity
  };
}

export interface ErsDomainAnalysis {
  name: string;
  questionIds: number[];
  score: number;
  maxScore: number;
  average: number;
  convertedScore: number;
}

/**
 * ERS (사회성 및 직업적응력 평가) 63문항 분석 모듈
 * 7개 영역별 채점 및 점수 가이드를 산출합니다.
 */
export function analyzeErsTest(answers: { [questionId: number]: number }) {
  const domains = [
    { name: '일상생활', ids: [1, 8, 15, 22, 29, 36, 43], mean: 14.0, sd: 3.5 },
    { name: '인지기술', ids: [2, 9, 16, 23, 30, 37, 44, 50, 55, 58, 60, 62, 63], mean: 27.0, sd: 6.5 },
    { name: '자존감', ids: [3, 10, 17, 24, 31, 38, 45, 51], mean: 16.0, sd: 4.0 },
    { name: '직업의식', ids: [4, 11, 18, 25, 32, 39, 46], mean: 14.5, sd: 3.5 },
    { name: '사회기술', ids: [5, 12, 19, 26, 33, 40, 47, 52, 56], mean: 19.0, sd: 4.5 },
    { name: '직업관련기술', ids: [6, 13, 20, 27, 34, 41, 48, 53], mean: 16.5, sd: 4.0 },
    { name: '작업기술', ids: [7, 14, 21, 28, 35, 42, 49, 54, 57, 59, 61], mean: 22.0, sd: 5.5 }
  ];

  const domainResults: ErsDomainAnalysis[] = domains.map(d => {
    let score = 0;
    d.ids.forEach(id => {
      score += Number(answers[id] !== undefined ? answers[id] : 2); // 기본 2점
    });

    const maxScore = d.ids.length * 4;
    const convertedScore = Math.round((score / maxScore) * 19);

    return {
      name: d.name,
      questionIds: d.ids,
      score,
      maxScore,
      average: parseFloat((score / d.ids.length).toFixed(2)),
      convertedScore
    };
  });

  // Calculate overall statistics
  const answeredIds = Object.keys(answers).map(Number);
  const totalScore = answeredIds.length > 0
    ? answeredIds.reduce((sum, id) => sum + Number(answers[id] !== undefined ? answers[id] : 0), 0)
    : 63 * 2; // 기본 2점 기준

  const averageScore = parseFloat((totalScore / 63).toFixed(2));

  let level: '최우수 (Excellent)' | '우수 (Above Average)' | '보통 (Ready/Average)' | '지원보완 필요 (Needs Support)' = '보통 (Ready/Average)';
  let color = 'text-green-600 bg-green-50 border-green-200';
  let description = '';

  if (averageScore >= 3.4) {
    level = '최우수 (Excellent)';
    color = 'text-indigo-600 bg-indigo-50 border-indigo-200';
    description = '전반적인 사회성 및 직업적응력이 매우 풍부하고 정상적입니다. 일상위생관리, 기본적인 수리 및 인지능력, 직장 동료와의 우호적 협력과 신속 정확한 과제 작업기술이 우수하게 겸비되어 일반 작업현장 배치와 높은 고용유지가 적극 권장됩니다.';
  } else if (averageScore >= 2.7) {
    level = '우수 (Above Average)';
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    description = '직장 태도 및 직무 전제 조건이 우수하게 지지되고 있습니다. 일상생활의 적절한 규칙 준수와 최소한의 감독 하의 독립 과제 수행력이 안정적이며 약간의 현장 적응 지도를 병행할 시 훌륭한 고용유지 경향을 나타냅니다.';
  } else if (averageScore >= 2.0) {
    level = '보통 (Ready/Average)';
    color = 'text-amber-600 bg-amber-50 border-amber-200';
    description = '일반 구직 혹은 초기 직무 매칭 준비 단계에 준합니다. 일상의 위생이나 기본 대화 소통에는 큰 문제가 없으나, 작업 속도 향상, 돌발 문제해결, 충고 수용 및 스트레스 통제 영역의 정밀한 심리적 사회기술 보강 지도가 효율적입니다.';
  } else {
    level = '지원보완 필요 (Needs Support)';
    color = 'text-rose-600 bg-rose-50 border-rose-200';
    description = '체계적인 사회 활동 및 일상 자격 향상 훈련, 자아정체성 교육 및 지속적인 작업행동관찰 지도가 집중 제언됩니다. 지원고용이나 보호작업장 훈련을 통한 단계적 역량 확보를 권유합니다.';
  }

  const convertedSum = domainResults.reduce((sum, d) => sum + d.convertedScore, 0);
  // Max convertedSum is 133. Typically, average convertedScore is 11.875 (which is 2.5 on a 1-4 scale), so average convertedSum is 83.125.
  // Standard score average is 100 with a standard deviation of 15. We can scale it accordingly.
  const standardScoreVal = Math.max(40, Math.min(160, Math.round(100 + 15 * (convertedSum - 83.125) / 12.35)));

  return {
    totalScore,
    averageScore,
    level,
    color,
    description,
    domainResults,
    convertedSum,
    standardScoreVal
  };
}

// 구 버전과의 하위 호환성을 유지하기 위한 모의 스텁
export function analyzeEgoResilience(totalScore: number) {
  return analyzeErsTest({});
}
export function analyzeEmployability(totalScore: number) {
  return analyzeErsTest({});
}
