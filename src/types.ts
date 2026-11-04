export interface EducationItem {
  id: string;
  schoolName: string;       // 다니거나 졸업한 학교/기관
  graduationStatus: string; // 졸업/수료 구분 (예: 졸업, 수료, 재학 중, 중퇴)
  period: string;           // 기간 (예: 2020년 ~ 2023년)
}

export interface ExperienceItem {
  id: string;
  title: string;       // 일한 곳 / 기관 이름 (예: 햇살카페, 무지개복지관)
  role: string;        // 했던 일 (예: 컵 세척, 장보기 보조)
  period: string;      // 기간 (예: 6개월, 2023년)
  description: string; // 한 일 설명
  leaveReason?: string; // 퇴사 / 종료 사유 (예: 계약기간 만료, 사업장 이전 등)
}

export interface ResumeData {
  personal: {
    name: string;             // 이름
    birthDate: string;        // 생년월일 (YYYY-MM-DD or YYYY년 MM월 DD일)
    gender: '남성' | '여성' | '선택안함'; // 성별
    phone: string;            // 연락처
    emergencyPhone: string;   // 비상 연락처 (보호자/담당자)
    address: string;          // 주소
    disabilityType: string;   // 장애 유형 (예: 지적장애 2급, 정신장애, 자폐성장애 등)
    photoUrl: string | null;  // 사진 Data URL
    photoUploadedAt?: string | null; // 사진 등록 일시 (1주일 자동 삭제 정책 기준)
  };
  jobGoal: {
    desiredJob: string;       // 희망 직종 (예: 카페 보조, 세탁/포장)
    workSchedule: string;     // 희망 근무 시간 (예: 주 5일, 오전 근무)
    startDate: string;        // 일 시작할 수 있는 날 (예: 바로 가능)
  };
  education: {
    schoolName: string;       // 다니거나 졸업한 학교/기관
    graduationStatus: string; // 졸업/수료 구분 (예: 졸업, 수료, 재학중)
    period: string;           // 기간 (예: 2020년 ~ 2023년)
  };
  educations?: EducationItem[]; // 여러 학교/교육기관
  experiences: ExperienceItem[];
  strength: {
    tags: string[];           // 선택한 나의 장점 키워드들
    myStory: string;          // 자기소개 / 자랑하고 싶은 점
  };
  accommodations: {
    supportNeeded: string;    // 일할 때 도움이 필요한 점 (배려사항)
    hobbies: string;          // 취미 및 특기
  };
  templateStyle: 'standard' | 'modern' | 'simple'; // 이력서 양식 스타일
}

export type AccessibilityLevel = 'normal' | 'large' | 'xlarge';
