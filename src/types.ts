/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FamilyMember {
  id: string;
  name: string;
  age: string;
  relation: string;
  job: string;
  note: string;
}

export interface EducationHistory {
  school: string;
  major: string;
  period: string;
  note: string;
}

export interface ServiceHistory {
  agency: string;
  content: string;
  period: string;
  note: string;
}

export interface WorkHistory {
  company: string;
  jobTitle: string;
  period: string;
  reasonForLeaving: string;
  note: string;
}

export interface DiagnosisItem {
  id: string;
  name: string; // 진단명
  date: string; // 진단시기
  agency: string; // 진단기관
  note?: string; // 기타/비고
}

export interface ClientIntakeRecord {
  receiptNo: string; // 접수번호 (예: 26-001)
  counselor: string; // 상담자
  counselDate: string; // 상담일시
  
  // 기본인적사항
  idNum: string; // 주민등록번호
  birthType: '음' | '양';
  age: string; // 만 세
  address: string; // 주소
  phone: string; // 전화번호
  mobileSelf: string; // 휴대폰 본인
  mobileGuard: string; // 휴대폰 보호자
  email: string;
  
  housingType: string; // 자가 / 전세 / 월세 / 임대 / 영구임대 / 기타
  housingTypeOther?: string;
  economicCondition: string; // 일반 / 차상위 / 수급권
  maritalStatus: string; // 미혼 / 기혼 / 동거 / 이혼 / 사별
  hasJob: string; // 유 / 무
  
  // 장애 정보
  hasDisabilityReg: string; // 유 / 무
  disabilityName: string; // 장애명
  disabilityGrade: string; // 장애등급: 중증(심한장애) / 경증(심하지않은장애)
  disabilityYear: string; // 장애발생년도
  disabilityCause: string; // 장애원인: 선천적장애 / 후천적장애
  useAssistiveDevice: string; // ○ / X
  assistiveDeviceName: string; // 보장구명
  
  mainDifficulty: string; // 주된 어려움
  desiredProgram: string; // 희망하는 프로그램 (AI전자작가, 공예, 미술, 사무보조, 샌드아트, 스마트팜, 기타)
  desiredPrograms?: string[]; // 복수 선택된 희망하는 프로그램 목록
  desiredProgramOther?: string;
  referralRoute: string; // 복지관 이용경로 (인터넷, 주위소개, 타기관소개, 기타)
  referralRouteOther?: string;
  
  evaluations: {
    social: boolean; // 사회평가
    psychological: boolean; // 심리평가
    speech: boolean; // 언어평가
    motor: boolean; // 운동기능평가
    vocational: boolean; // 직업평가
    reApplication: boolean; // 재접수
  };
  
  // 동거 가족
  familyMembers: FamilyMember[];
  familyRelation: string; // 1)수용 2)부정 3)슬픔 4)원만 5)기타
  familyHistory: string; // 가족력
  
  // 병력 및 건강상태
  medicalHistoryHospital: string; // 진료병원/시기
  medicalHistoryContent: string; // 진료내용
  currentHospital: string; // 현재의 진료병원/과목
  medicationIsTaking: string; // ○ / X
  medicationUsage: string; // 복용법 (매일 등)
  medicationReason: string; // 이유
  currentHealthStatus: string; // 현재 건강상태
  
  // 진단사항
  diagnosisList?: DiagnosisItem[];
  diagnosisName1: string;
  diagnosisDate: string;
  diagnosisAgency: string;
  diagnosisName2: string;
  
  applicantName: string; // 신청자 (보호자) 성명
  
  // Page 2: 사회평가지 (ADL 체크박스)
  adlCheckedItems?: string[]; // 체크된 ADL 항목 배열 (대화하기, 식사하기, 착탈의, 대변보기, 소변보기, 목욕하기, 실내 이동하기, 계단오르기, 내려가기, 바깥일보기, 기타 등)
  adlDialogue: string; // 대화하기
  adlEating: string; // 식사하기
  adlDressing: string; // 착탈의
  adlDefecation: string; // 대변보기
  adlUrination: string; // 소변보기
  adlBathing: string; // 목욕하기
  adlIndoorMove: string; // 실내 이동하기
  adlStairs: string; // 계단오르기/내려가기
  adlOutdoorMove: string; // 바깥일보기
  adlOther: string; // 기타 직접 입력
  
  personality: string; // 성격 및 특성
  hobbies: string; // 취미 및 여가생활
  motorSkills: string; // 운동기능
  socialRelations: string; // 사회적 관계 (친구, 이웃, 종교 등)
  
  education: EducationHistory[]; // 교육사항
  currentServices: ServiceHistory[]; // 현 이용 서비스
  pastServices: ServiceHistory[]; // 과거 이용 서비스
  workHistory: WorkHistory[]; // 취업경력
  counselingNotes: string; // 상담내용
}

export type TrainingClassType = '문화예술반' | '스마트산업반';

export interface Client {
  id: string; // Unique UUID or customized string
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  diagnosis: string; // e.g., stroke, spinal cord injury, carpaltunnel, healthy etc.
  handDominance: 'R' | 'L' | 'Ambi';
  userType?: '신규' | '기존'; // '신규': 신규 입소 훈련생 (2주 상황/종합평가 필수) | '기존': 기존 계속 훈련생 (상황/종합평가 생략 가능, 기본값)
  trainingClass?: TrainingClassType; // '문화예술반' | '스마트산업반'
  selectedSubjects?: string[]; // 선택 수강 과목 3가지
  serviceStartDate?: string; // 훈련반 이용 시작일 (YYYY-MM-DD)
  serviceEndDate?: string; // 훈련반 이용 종료일 (4년 단위 자동설정, YYYY-MM-DD)
  serviceExtensionCount?: number; // 훈련반 연장 횟수 (0: 기본 4년, 1: 1차 연장(+4년=총 8년), 2: 2차 연장(+4년=총 12년) 등)
  memos: string;
  createdAt: string; // ISO date
  intakeRecord?: ClientIntakeRecord; // 접수상담기록지 및 사회평가지 데이터
}

// 신규 훈련생 상황평가일지 및 종합 평가기록부 타입
export interface SituationEvaluationRow {
  id: string;
  date: string; // 훈련일자 (예: 2026-08-10)
  attendance: '출석' | '결석' | '지각' | '조퇴'; // 출석/결석/지각/조퇴
  trainingTime: string; // 훈련시간 (예: 10:00~16:00)
  taskName: string; // 수행과제
  evaluationNote: string; // 평가 및 지도사항
}

export interface SituationEvaluationLog {
  id: string;
  clientId: string;
  year?: number;
  evaluatorName: string; // 담당자
  teamLeadName: string; // 팀장
  startDate: string; // 평가기간 시작일
  endDate: string; // 평가기간 종료일
  disabilityInfo: string; // 장애유형/정도 (예: 지적장애 / 심한)
  rows: SituationEvaluationRow[]; // 일별 상황평가
  specialNotes: string; // 특이사항
  createdAt: string;
  updatedAt: string;
}

export interface ComprehensiveEvaluationReport {
  id: string;
  clientId: string;
  year?: number;
  evaluatorName: string; // 담당자
  teamLeadName: string; // 팀장
  startDate: string; // 평가기간 시작일
  endDate: string; // 평가기간 종료일
  disabilityInfo: string; // 장애유형/정도
  scores: { [itemId: number]: number }; // 1~20번 항목 점수 (1:불량, 2:미흡, 3:보통, 4:양호, 5:우수)
  categoryComments?: { [category: string]: string }; // 영역별 평가 소견 (오른쪽 열)
  totalScore: number; // 총점 (만점 100점)
  overallOpinion: string; // 종합 평가 소견
  createdAt: string;
  updatedAt: string;
}

export interface PurdueTest {
  id: string;
  clientId: string;
  testDate: string;
  year?: number; // 평가 연도 (예: 2026)
  round?: '1차' | '2차' | '상시'; // 1차(연초) | 2차(6~8월 중간) | 상시
  rightHand: number; // Right hand pegs (30 sec)
  leftHand: number;  // Left hand pegs (30 sec)
  bothHands: number; // Both hands pegs (30 sec)
  assembly: number;  // Assembly pegs (60 sec)
  // RLB is calculated as rightHand + leftHand + bothHands
  notes: string;
  evaluatorName: string;
  rightHandTrials?: number[];
  leftHandTrials?: number[];
  bothHandsTrials?: number[];
  assemblyTrials?: number[];
  normType?: '비장애인' | '지적장애인' | '지원고용' | '보호고용';
}

export type ERSQuestionType = 'vocational_ers';

export interface ERSTest {
  id: string;
  clientId: string;
  testDate: string;
  year?: number; // 평가 연도 (예: 2026)
  round?: '1차' | '2차' | '상시'; // 1차(연초) | 2차(6~8월 중간) | 상시
  type: ERSQuestionType;
  answers: { [questionId: number]: number }; // questionId (1-based) to score (1-4 or 1-5)
  totalScore: number;
  averageScore: number;
  interpretation: string; // Automatic clinical feedback
  notes: string;
  evaluatorName: string;
}

// 기초학력수준 검사 기록지 타입
export interface BasicAcademicTest {
  id: string;
  clientId: string;
  testDate: string;
  year?: number;
  round?: '1차' | '2차' | '상시';
  evaluatorName: string;
  // 1. 신상정보 인지 (담당자가 O, X 체크)
  personalInfoCheck: {
    nameGender: boolean;    // 이름/성별
    birthDate: boolean;     // 생년월일
    testDate: boolean;      // 검사일
    disabilityInfo: boolean;// 장애/정도
    address: boolean;       // 집 주소
    family: boolean;        // 가족 구성원 및 가족이름
    parentPhone: boolean;   // 연락처 1. 부모님 핸드폰
    selfPhone: boolean;     // 연락처 2. 본인 핸드폰
    homePhone: boolean;     // 연락처 3. 집 전화
  };
  // 2. 수 개념 (터치/마우스)
  numberConcept: {
    dictationSingle: string;  // 1) 한 자리 숫자
    dictationDouble: string;  // 2) 두 자리 숫자
    dictationTriple: string;  // 3) 세 자리 숫자
    biggerChoice1: number | null; // 큰 수 1 (3 vs 8) -> 선택된 값
    biggerChoice2: number | null; // 큰 수 2 (23 vs 19)
    biggerChoice3: number | null; // 큰 수 3 (325 vs 125)
    calc3Plus4: string;      // 3+4=
    calc23Plus11: string;    // 23+11=
    calc7Minus2: string;     // 7-2=
    calc16Minus3: string;    // 16-3=
    calc3Times5: string;     // 3×5=
    calc10Times11: string;   // 10×11=
    calc25Div5: string;      // 25÷5=
    calc12Div2: string;      // 12÷2=
  };
  // 3. 지각능력 (터치/마우스)
  perception: {
    lengthChoice: 'long' | 'short' | null; // 1) 길이 지각 (긴 막대)
    directionRight: 'left' | 'right' | 'up' | 'down' | null; // 2-1) 오른쪽 화살표
    directionUp: 'left' | 'right' | 'up' | 'down' | null;    // 2-2) 위쪽 화살표
    shapes: {
      circle: string;    // 원
      triangle: string;  // 삼각형
      square: string;    // 사각형
      diamond: string;   // 마름모/다이아몬드
      oval: string;      // 타원
    };
    colors: {
      red: string;       // 빨간색
      green: string;     // 초록색
      yellow: string;    // 노란색
      blue: string;      // 파란색
    };
    timeAnalogHour: string;   // 아날로그 시계 시
    timeAnalogMinute: string; // 아날로그 시계 분
    timeDigitalHour: string;  // 디지털 시계 시 (12:48)
    timeDigitalMinute: string;// 디지털 시계 분
    reading1: string; // 누가 말하였나요?
    reading2: string; // 무엇을 해야 한다고 말하였나요?
    reading3: string; // 왜 그렇게 해야 하나요?
    writing1: string; // 쓰기 1
    writing2: string; // 쓰기 2
  };
  overallNotes?: string; // 평가 종합 의견
  createdAt: string;
}

// 그림직업흥미검사 PDF 업로드 기록 타입
export interface PictureInterestPDF {
  id: string;
  clientId: string;
  testDate: string;      // 검사일자 (예: 2026-08-07)
  year?: number;
  round?: '1차' | '2차' | '상시';
  evaluatorName: string; // 평가자 성명
  fileName: string;      // PDF 파일명
  fileData: string;      // Base64 Data URL (data:application/pdf;base64,...)
  fileSize?: string;     // 용량 (예: 1.5 MB)
  notes?: string;        // 검사 소견 및 비고
  createdAt: string;
}

// 개별화서비스계획서 (Individualized Service Plan - IWP) 타입
export interface IWPErsDomainScore {
  domain: string;        // '일상생활' | '인지기술' | '자존감' | '직업의식' | '사회기술' | '직업기술' | '작업기술'
  rawScore: number;      // 원점수
  convertedScore: number;// 환산점수 (1~15 등)
}

export interface IWPPurdueScore {
  item: '우세손' | '비우세손' | '양손' | '합계' | '조립';
  myScore: number;
  standardMean: number;
  resultText: '평균' | '높음' | '낮음' | '매우 높음' | '매우 낮음';
}

export interface IWPComparisonRow {
  item: string;
  convertedScore: number;
  percentage: number;
}

export interface IWPShortTermGoal {
  id: string;
  goalTitle: string;
  period: string;
  serviceContent: string;
  evaluator: string;
  status: '진행 예정' | '진행중' | '달성' | '미달성';
}

export interface IndividualizedServicePlan {
  id: string;
  clientId: string;
  year?: number; // 계획 수립 연도 (예: 2026)
  termType?: '1차' | '2차'; // 1차 (연초 수립) | 2차 (중간평가 후 재수립)
  planType: '수립' | '재수립';
  trainingClass: TrainingClassType; // 문화예술반 | 스마트산업반
  planDate: string; // 예: 2026. 2. 6.
  createdAt: string;
  updatedAt: string;

  // 1. 기본정보
  name: string;
  gender: '남' | '여';
  birthDate: string;
  disabilityType: string;
  desiredGoal: string; // 욕구사항

  // 2. 강점 및 제한점
  strengths: string[];
  limitations: string[];

  // 3. 진단 및 평가
  // 3-1. ERS
  ersTestDate: string;
  ersScores: IWPErsDomainScore[];
  ersConvertedSum: number;
  ersStandardScore: number;
  ersLowestDomain: string; // 제일 점수 낮은 영역
  ersAnalysisText: string;

  // 3-2. 그림직업흥미검사
  pictureInterestAnalysis: string;

  // 3-3. Purdue Pegboard
  purdueScores: IWPPurdueScore[];

  // 3-4. 직업적응훈련반 훈련 비교 분석 사항
  trainingCompareFirstHalf: IWPComparisonRow[];
  trainingCompareSecondHalf: IWPComparisonRow[];
  trainingCompareNotes: string;

  // 3-5. 전공훈련 프로그램 평가 사항
  majorCompareFirstHalf: IWPComparisonRow[];
  majorCompareSecondHalf: IWPComparisonRow[];
  majorCompareNotes: string;

  // 4. 방향 및 목표
  longTermGoal: string;

  // 5-1. 교육역량강화 단기목표 계획
  educationGoals: IWPShortTermGoal[];

  // 5-2. 개인역량강화 단기목표 계획
  personalGoals: IWPShortTermGoal[];

  // 6. 단기목표 달성 여부
  goalAchievementNote: string;

  // 7. 단기목표 미달성 재수립 계획
  goalUnachievedReplanNote: string;

  // 8. 지원계획회의(사례회의)
  caseConferenceDate: string;
  caseConferenceContent: string;
  caseConferenceNote: string;

  // 서명란
  evaluatorName: string;
  clientSignName: string;
  organizationName: string;
}

// 7~8월 중간평가서 (직업적응훈련 중간평가 및 하반기 연계 종합보고서)
export interface MidtermGoalReviewItem {
  id: string;
  goalTitle: string;
  targetPeriod: string;
  achievementStatus: '달성' | '진행중' | '보완필요' | '미달성';
  reviewComment: string;
}

export interface MidtermScoreSummaryRow {
  item: string;
  score: number;
  percentage: number;
  grade: '우수' | '양호' | '보통' | '미흡';
  note: string;
}

export interface MidtermGoalAchievementRow {
  goalTitle: string;
  period: string;
  serviceContent: string;
  status: string;
  note: string;
}

export interface MidtermEvaluationReportData {
  id: string;
  clientId: string;
  year: number; // 예: 2026
  evalDate: string; // 평가일자 (예: 2026. 8. 7.)
  evalPeriod: string; // 평가기간 (예: 2026. 2. 6. ~ 2026. 7. 31. / 상반기)
  evaluatorName: string; // 평가자 (담당 직업재활사)
  teamLeadName: string; // 팀장
  trainingClass: TrainingClassType;
  selectedSubjects: string[];
  
  // 1. 훈련생 기본정보
  name: string;
  gender: '남' | '여';
  birthDate: string;
  disabilityType: string;
  desiredGoal: string; // 욕구사항
  
  // 2. 직업준비검사 결과
  // 2-1. ERS (1차 vs 2차)
  ers1stDate?: string; // 1차 ERS 시행일자
  ers2ndDate?: string; // 2차 ERS 시행일자
  ers1stScores: IWPErsDomainScore[];
  ers1stConvertedSum: number;
  ers1stStandardScore: number;
  
  ers2ndScores: IWPErsDomainScore[];
  ers2ndConvertedSum: number;
  ers2ndStandardScore: number;
  
  ersResultOpinion: string; // 직업준비검사 결과 소견
  
  // 2-2. Purdue Pegboard (1차 vs 2차)
  purdue1stDate?: string; // 1차 Purdue 시행일자
  purdue2ndDate?: string; // 2차 Purdue 시행일자
  purdue1stScores: IWPPurdueScore[];
  purdue2ndScores: IWPPurdueScore[];
  
  // 2-3. 상반기 직업적응훈련반 훈련 평가 사항
  training1stHalfScores: IWPComparisonRow[];
  training1stHalfComment: string;
  
  // 2-4. 상반기 전공 훈련 프로그램 평가 사항
  major1stHalfScores: IWPComparisonRow[];
  major1stHalfComment: string;
  
  // 3. 방향 및 목표
  longTermGoal: string;
  
  // 4-1. 교육역량강화 단기목표 계획
  educationGoals: IWPShortTermGoal[];
  
  // 4-2. 개인역량강화 단기목표 계획
  personalGoals: IWPShortTermGoal[];
  
  // 5. 단기목표 달성 여부
  goalAchievementRows: MidtermGoalAchievementRow[];
  
  // 6. 단기목표 미달성 재수립 계획
  unachievedPlanNote: string;
  
  // 하위 호환 필드
  trainingScores?: MidtermScoreSummaryRow[];
  trainingOverallComment?: string;
  majorScores?: MidtermScoreSummaryRow[];
  majorOverallComment?: string;
  ersMidtermSummary?: string;
  purdueMidtermSummary?: string;
  educationGoalReviews?: MidtermGoalReviewItem[];
  personalGoalReviews?: MidtermGoalReviewItem[];
  secondHalfFocusAreas?: string;
  secondHalfActionPlan?: string;
  overallEvaluationOpinion?: string;
  caseConferenceDate?: string;
  caseConferenceDecision?: string;
  
  // 서명란
  evalDateYear?: string;
  evalDateMonth?: string;
  evalDateDay?: string;
  traineeSignatureName: string;
  guardianSignatureName: string;
  evaluatorSignatureName: string;
  organizationName: string;
  createdAt: string;
  updatedAt: string;
}

// 상·하반기 훈련 비교평가표 (3-4 & 3-5 비교 분석 전용 데이터 및 상단 중간평가 성적표들)
export interface MidtermDomainScoreItem {
  domainName: string; // 평가영역 항목명 (예: 도구 조작, 표현력, 음정/박자 등)
  maxScore: number;   // 5점 만점
  score: number;      // 획득점수 (0~5)
}

export interface MidtermSubjectScoreRow {
  subjectName: string; // 직종 훈련과목 (예: AI샌드아트, 미술, 공예, 스마트팜, 사무보조, 공통 등)
  taskName: string; // 수행 과제
  evalDomain?: string; // (하위호환용 단일 문자열)
  domainScores?: MidtermDomainScoreItem[]; // 5개 평가영역별 세부 점수 및 항목명 (각 5점 만점, 총 25점)
  maxScore: number; // 25점
  score: number; // 획득점수 (5개 영역 점수 합계)
}

export interface SingleSubjectEvaluationRow {
  domain: string; // 평가영역
  content: string; // 평가내용
  maxScore: number; // 배점 (예: 5점 등 총 25점 만점)
  score: number; // 획득점수
}

export interface MidtermJobTrainingReport {
  evaluationDate: string;
  evaluatorName: string;
  majorDept: string; // 전공훈련과 (예: 문화예술반, 스마트산업반)
  rows: MidtermSubjectScoreRow[];
  totalScore: number; // 총점 ( / 100점)
  managerOpinion: string; // 담당자 종합의견
  traineeSignatureName: string;
  guardianSignatureName: string;
}

export interface MidtermSubjectDetailedReport {
  subjectTitle: string; // 예: "문화예술 전공훈련 중간평가표 - AI 샌드아트" 또는 "공통교육훈련 중간평가표 - 합창"
  evalDate: string;
  evaluatorName: string;
  targetName: string;
  taskTitle: string; // 평가과제
  evalMethod: string; // 평가방법
  rows: SingleSubjectEvaluationRow[];
  totalScore: number; // 총점 ( / 25점)
  instructorOpinion: string; // 강사 의견
}

export interface SemesterEvaluationData {
  id: string;
  clientId: string;
  year: number; // 예: 2026
  title?: string;
  evaluatorName: string;

  // === 상반기 (1차 평가 / 6월) ===
  // 1. 직종훈련 프로그램 상반기 중간평가 성적표 (Page 1)
  midtermJobReport?: MidtermJobTrainingReport;
  // 2. 각 직종 훈련과목별 세부 전공훈련 상반기 중간평가표 목록 (Page 2-1, 2-2, ...)
  subjectDetailedReports?: MidtermSubjectDetailedReport[];
  // (하위 호환용 단일 전공평가표)
  sandartReport?: MidtermSubjectDetailedReport;
  // 3. 공통교육훈련 상반기 중간평가표 - 합창 (Page 3)
  choirReport?: MidtermSubjectDetailedReport;
  // 상반기 3-4 직업적응훈련반 평가 소견
  firstHalfTrainingNotes?: string;
  // 상반기 3-5 전공훈련 프로그램 평가 소견
  firstHalfMajorNotes?: string;

  // === 하반기 (2차 평가 / 12월 & 종합비교) ===
  // 1. 직종훈련 프로그램 하반기 기말평가 성적표
  secondHalfJobReport?: MidtermJobTrainingReport;
  // 2. 각 직종 훈련과목별 세부 전공훈련 하반기 기말평가표 목록
  secondHalfSubjectDetailedReports?: MidtermSubjectDetailedReport[];
  // 3. 공통교육훈련 하반기 기말평가표 - 합창
  secondHalfChoirReport?: MidtermSubjectDetailedReport;
  // 하반기 3-4 직업적응훈련반 평가 소견
  secondHalfTrainingNotes?: string;
  // 하반기 3-5 전공훈련 프로그램 평가 소견
  secondHalfMajorNotes?: string;
  
  // === 3-4 & 3-5 비교 분석 데이터 (상·하반기 비교표) ===
  trainingCompareFirstHalf: IWPComparisonRow[];
  trainingCompareSecondHalf: IWPComparisonRow[];
  trainingCompareNotes: string; // 연간 종합 비교 소견

  majorCompareFirstHalf: IWPComparisonRow[];
  majorCompareSecondHalf: IWPComparisonRow[];
  majorCompareNotes: string; // 연간 종합 비교 소견

  createdAt: string;
  updatedAt: string;
}


