export interface EvaluationQuestion {
  id: number;
  category: '근무태도' | '대인관계' | '작업태도' | '작업수행';
  text: string;
}

export const COMPREHENSIVE_EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  // 근무태도 (1~5)
  { id: 1, category: '근무태도', text: '결근, 지각, 조퇴 등을 하지 않는다.' },
  { id: 2, category: '근무태도', text: '결근, 지각, 조퇴 등을 할 때는 연락을 취한다.' },
  { id: 3, category: '근무태도', text: '휴식시간과 근무시간을 잘 지킨다.' },
  { id: 4, category: '근무태도', text: '주의사항을 잘 듣고 그대로 이행한다.' },
  { id: 5, category: '근무태도', text: '외모를 깨끗하고 단정하게 유지한다.' },

  // 대인관계 (6~10)
  { id: 6, category: '대인관계', text: '상황에 맞는 적절한 경어를 사용한다.' },
  { id: 7, category: '대인관계', text: '주위동료와 협조를 잘한다.' },
  { id: 8, category: '대인관계', text: '상사, 동료, 고객에게 인사를 잘한다.' },
  { id: 9, category: '대인관계', text: '질문에 적절한 답변을 할 수 있다.' },
  { id: 10, category: '대인관계', text: '다른 사람의 이야기를 잘 청취한다.' },

  // 작업태도 (11~15)
  { id: 11, category: '작업태도', text: '적극적으로 업무에 참여한다.' },
  { id: 12, category: '작업태도', text: '지시없이 스스로 자신의 일을 수행한다.' },
  { id: 13, category: '작업태도', text: '열심히 작업에 몰두한다.' },
  { id: 14, category: '작업태도', text: '목표량을 완수하면 다른 일거리를 찾는다.' },
  { id: 15, category: '작업태도', text: '잘못을 지적할 때 호의적으로 반응한다.' },

  // 작업수행 (16~20)
  { id: 16, category: '작업수행', text: '도구가 기계를 잘 다룬다.' },
  { id: 17, category: '작업수행', text: '지시한 방법대로 작업을 수행한다(정확성).' },
  { id: 18, category: '작업수행', text: '근무시간동안 산만하지 않고, 꾸준히 일한다.' },
  { id: 19, category: '작업수행', text: '주어진 작업량을 완수한다.' },
  { id: 20, category: '작업수행', text: '직무를 수행할수록, 속도와 정확성이 증가한다.(숙련성)' },
];

export const SITUATION_TRAINING_COURSES = [
  'AI샌드아트',
  'AI전자작가',
  '공예',
  '미술',
  '사무보조',
  '스마트팜',
  '작업활동',
  '합청',
] as const;

export const SITUATION_TRAINING_COURSE_OPTIONS = [
  ...SITUATION_TRAINING_COURSES,
  '기타',
] as const;

export const FREQUENT_TASKS = [
  'AI샌드아트',
  'AI전자작가',
  '공예',
  '미술',
  '사무보조',
  '스마트팜',
  '작업활동',
  '합청',
];

export const FREQUENT_EVAL_NOTES = [
  '지시사항을 잘 듣고 서툴지만 적극적으로 수행함.',
  '집중력이 우수하며 주어진 작업 목표를 잘 완수함.',
  '동료들과 호의적인 관계를 유지하며 인사를 잘함.',
  '휴식시간과 근무시간 구분을 잘 지키고 태도가 양호함.',
  '도구 사용 시 다소 어색함이 있어 지속적인 지도 필요함.',
  '속도와 정확성이 점차 향상되는 모습을 보임.',
];

export const CATEGORY_COMMENT_PRESETS: { [category: string]: string[] } = {
  근무태도: [
    '2주간 무단 지각이나 결근 없이 출석률 100%를 기록하였으며, 휴식시간과 작업시간 구분을 명확히 준수함.',
    '주의사항 및 안전 지도사항을 숙지하고 스스로 복장과 단정한 용모를 유지하려는 태도가 양호함.',
    '출결 상태가 매우 원만하며 훈련시간 동안 높은 집중력과 안정된 정서 상태를 유지함.',
  ],
  대인관계: [
    '동료 훈련생 및 담당 교사에게 밝은 미소로 적절한 경어와 예의 바른 인사를 건네며 호의적인 대인관계를 유지함.',
    '주위 동료와 협조하여 과제를 진행하고, 질문에 명확하고 적절하게 답변하며 타인의 의견을 잘 청취함.',
    '집단 활동 시 동료를 배려하는 태도를 보이며, 원활한 의사소통을 통해 긍정적인 라포를 형성함.',
  ],
  작업태도: [
    '주어진 직업적응 과제에 적극적으로 참여하며, 작업이 완료된 후에도 정리정돈 및 다음 일거리를 자발적으로 탐색함.',
    '지시가 없어도 스스로 자신의 과제를 차분하게 이행하며, 잘못을 지적받을 때 겸손하고 호의적으로 수정함.',
    '열심히 작업에 몰두하는 태도가 우수하며 훈련 목표량을 완수하려는 책임감이 높음.',
  ],
  작업수행: [
    '훈련 도구 및 기기를 안전하고 정확하게 다루며, 주어진 훈련시간 동안 산만하지 않고 지속적으로 작업을 이행함.',
    '지시된 작업 공정 순서와 방법에 맞춰 정확하게 작업을 수행하며, 훈련을 거듭할수록 작업 속도와 정확성이 지속적으로 향상됨.',
    '주어진 하루 목표 작업량을 안정적으로 완수하며 향후 직무 숙련성 발전에 높은 가능성을 나타냄.',
  ],
};

// 훈련반 및 전공/비전공 과목 관련 상수 정의
export const CLASS_MAJOR_SUBJECTS: Record<'문화예술반' | '스마트산업반', string[]> = {
  문화예술반: ['AI샌드아트', '미술', '공예'],
  스마트산업반: ['AI전자작가', '스마트팜', '사무보조'],
};

export const ALL_TRAINING_SUBJECTS = [
  'AI샌드아트',
  '미술',
  '공예',
  'AI전자작가',
  '스마트팜',
  '사무보조',
];

// 과목 선택 검증 함수 (총 3개 선택, 본인 반 전공 최소 2개 포함)
export function validateSubjectSelection(
  trainingClass: '문화예술반' | '스마트산업반',
  selectedSubjects: string[]
): { valid: boolean; message?: string } {
  if (!trainingClass) {
    return { valid: false, message: '훈련반(문화예술반 또는 스마트산업반)을 먼저 선택해 주세요.' };
  }
  if (selectedSubjects.length !== 3) {
    return { valid: false, message: `수업 과목은 정확히 3가지를 선택해야 합니다. (현재 ${selectedSubjects.length}개 선택됨)` };
  }

  const majors = CLASS_MAJOR_SUBJECTS[trainingClass];
  const selectedMajorCount = selectedSubjects.filter((s) => majors.includes(s)).length;

  if (selectedMajorCount < 2) {
    return {
      valid: false,
      message: `${trainingClass} 전공과목(${majors.join(', ')}) 중 최소 2가지 이상을 선택해야 합니다.`,
    };
  }

  return { valid: true };
}


