import { ResumeData } from '../types';

export const JOB_PRESETS = [
  '☕ 카페 보조 / 바리스타 보조',
  '🧹 청소 / 환경정비 / 소독',
  '📦 상품 진열 / 포장 작업',
  '📄 문서 파쇄 / 사무 보조',
  '🧺 세탁 / 다림질 보조',
  '🍽️ 식당 급식 / 식기 세척 보조',
  '🌱 화단 관리 / 원예 보조',
  '🚴 배달 / 물품 전달 보조',
];

export interface StrengthCategory {
  category: string;
  icon: string;
  tags: string[];
}

export const STRENGTH_CATEGORIZED_TAGS: StrengthCategory[] = [
  {
    category: '태도 / 성실성',
    icon: '⏰',
    tags: [
      '⏰ 출퇴근 시간을 잘 지켜요',
      '지각이나 결석을 절대 하지 않아요',
      '규칙과 지침을 성실하게 따라요',
      '단정하고 깔끔한 차림을 해요',
      '매일 꾸준하게 열심히 일해요',
    ],
  },
  {
    category: '업무 / 실무 능력',
    icon: '🧹',
    tags: [
      '🧹 청소와 정리를 깔끔하게 잘해요',
      '⚡ 손이 빠르고 성실해요',
      '🔥 한 가지 일에 집중을 잘해요',
      '📦 물품 포장과 스티커 붙이기를 잘해요',
      '💻 단순 컴퓨터 입력 및 체크를 잘해요',
      '🧺 식기 세척 및 정리정돈에 익숙해요',
    ],
  },
  {
    category: '소통 / 대인관계',
    icon: '😊',
    tags: [
      '😊 인사성이 밝고 친절해요',
      '😃 항상 웃는 얼굴로 대 사람을 대해요',
      '👂 담당자의 지시 사항을 잘 들어요',
      '🤝 동료들과 사이좋게 잘 지내요',
      '🙋‍♂️ 모르는 점은 바로 질문하고 배워요',
    ],
  },
  {
    category: '성격 / 건강',
    icon: '💪',
    tags: [
      '💪 체력이 좋고 서서 일해도 튼튼해요',
      '✨ 정직하고 약속을 꼭 지켜요',
      '❤️ 참을성이 있고 끈기가 있어요',
      '🌟 새로운 작업도 적극적으로 배워요',
    ],
  },
];

// All tags flattened for reference
export const STRENGTH_PRESET_TAGS = STRENGTH_CATEGORIZED_TAGS.flatMap((c) => c.tags);

export interface StoryTemplateGroup {
  groupName: string;
  icon: string;
  templates: string[];
}

export const STRENGTH_STORY_TEMPLATES: StoryTemplateGroup[] = [
  {
    groupName: '내가 잘하는 일 / 특기',
    icon: '🎯',
    templates: [
      '저는 정해진 규칙에 맞춰 구석구석 깨끗하게 청소하고 정리 정돈하는 일을 가장 잘합니다.',
      '손재주가 좋아 물품을 정성껏 포장하거나 스티커를 바르게 붙이는 작업을 빠르고 정확하게 처리합니다.',
      '방문하시는 손님이나 이용자분들께 항상 환한 미소로 인사를 건네며 친절하게 응대할 수 있습니다.',
      '단순 반복 작업이라도 방심하지 않고 처음부터 끝까지 꼼꼼하게 확인하며 일합니다.',
    ],
  },
  {
    groupName: '근무 태도 / 성실함',
    icon: '⏰',
    templates: [
      '매일 아침 출근 시간을 철저히 엄수하고, 결석이나 지각 없이 꾸준하고 성실하게 일합니다.',
      '담당 선생님이나 상사분께서 알려주신 작업 순서를 차근차근 확인하며 오차 없이 수행합니다.',
      '일하다가 모르는 점이나 어려움이 생기면 혼자 판단하지 않고 즉시 담당자분께 여쭈어봅니다.',
      '주변 정리 정돈을 잘하며 항상 정직하고 진솔한 자세로 업무에 임합니다.',
    ],
  },
  {
    groupName: '마음가짐 / 앞으로의 포부',
    icon: '🌱',
    templates: [
      '매일 규칙적으로 회사에 출근하여 제 힘으로 보람을 느끼며 오래오래 근무하고 싶습니다.',
      '동료들과 서로 어울려 돕고 배려하며, 언제나 웃는 얼굴로 밝은 분위기를 만드는 직원이 되겠습니다.',
      '새로운 작업도 두려워하지 않고 열정적으로 배워서 회사에 꼭 필요한 소중한 사람이 되겠습니다.',
    ],
  },
];

export const ACCOMMODATION_PRESETS = [
  '🗣️ 쉬운 말로 크게 설명해 주시면 잘 알아들어요',
  '📝 작업 순서를 글이나 그림으로 적어주시면 좋아요',
  '⏱️ 처음에는 천천히 배울 시간이 필요해요',
  '📦 무거운 물건을 오래 들기는 조금 힘들어요',
  '🚌 대중교통으로 혼자 출퇴근할 수 있어요',
  '🧑‍🏫 담당자 선생님이 처음 몇 번 같이 알려주시면 좋아요',
];

export const EDUCATION_PRESETS = [
  '특수학교 고등부 졸업',
  '일반고등학교 특수학급 졸업',
  '장애인 복지관 직업훈련 수료',
  '직업능력개발원 훈련 수료',
  '고등학교 졸업',
];

export const LEAVE_REASON_PRESETS = [
  '계약기간 만료',
  '사업장 이전',
  '교육 과정 수료',
  '건강상의 이유',
  '개인 사정',
  '기관 재정 사정',
];

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    name: '김민수',
    birthDate: '1998년 05월 12일',
    gender: '남성',
    phone: '010-1234-5678',
    emergencyPhone: '010-9876-5432 (보호자)',
    address: '서울특별시 성동구 서울숲길 12, 301호',
    disabilityType: '지적장애 (중증)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  jobGoal: {
    desiredJob: '☕ 카페 보조 / 식기 세척 보조',
    workSchedule: '',
    startDate: '',
  },
  education: {
    schoolName: '서울희망특수학교 고등부',
    graduationStatus: '졸업',
    period: '2015년 03월 ~ 2018년 02월',
  },
  educations: [
    {
      id: 'edu-1',
      schoolName: '서울희망특수학교 고등부',
      graduationStatus: '졸업',
      period: '2015년 03월 ~ 2018년 02월',
    },
    {
      id: 'edu-2',
      schoolName: '성동장애인종합복지관 직업훈련반',
      graduationStatus: '수료',
      period: '2018년 03월 ~ 2018년 12월',
    },
  ],
  experiences: [
    {
      id: 'sample-1',
      title: '행복복지관 바리스타 직업훈련',
      role: '커피 추출 보조 및 컵 세척',
      period: '2023년 03월 ~ 2023년 12월 (10개월)',
      description: '손님에게 친절하게 인사하고 사용한 컵을 깨끗하게 씻고 정돈했습니다.',
      leaveReason: '교육 과정 수료',
    },
    {
      id: 'sample-2',
      title: '꿈드림 장애인 작업장',
      role: '임가공 포장 작업',
      period: '2022년 01월 ~ 2022년 11월 (11개월)',
      description: '상자를 접고 물품을 정해진 수량대로 정확하게 넣는 작업을 했습니다.',
      leaveReason: '계약기간 만료',
    },
  ],
  strength: {
    tags: [
      '⏰ 출퇴근 시간을 잘 지켜요',
      '😊 인사성이 밝고 친절해요',
      '🧹 청소와 정리를 깔끔하게 잘해요',
      '⚡ 손이 빠르고 성실해요',
    ],
    myStory: '저는 매일 아침 출근 시간을 철저히 지키고 정해진 작업 수순을 성실히 따릅니다. 손재주가 좋아 정돈과 포장 작업을 오차 없이 깨끗하게 처리하며, 동료들과 밝은 미소로 인사를 주고받는 모범적인 직원이 되겠습니다.',
  },
  accommodations: {
    supportNeeded: '작업 지시를 쉬운 말로 명확하게 설명해 주시면 감사하겠습니다. 그림이나 체크리스트가 있으면 훨씬 일을 빠르게 익힙니다.',
    hobbies: '음악 듣기, 산책하기, 블록 맞추기',
  },
  templateStyle: 'standard',
};

