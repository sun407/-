import React, { useState, useEffect } from 'react';
import { 
  Client, 
  IndividualizedServicePlan, 
  IWPComparisonRow, 
  SemesterEvaluationData,
  MidtermJobTrainingReport,
  MidtermSubjectDetailedReport,
  MidtermDomainScoreItem
} from '../types';
import { 
  BarChart3, 
  Save, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  User, 
  Calendar, 
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  FolderSync,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Sun,
  Flame,
  Award,
  RefreshCw
} from 'lucide-react';
import MidtermEvaluationReports from './MidtermEvaluationReports';

interface SemesterEvaluationPageProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  iwpPlans: IndividualizedServicePlan[];
  onSaveIWPPlan?: (plan: IndividualizedServicePlan) => void;
  onBack?: () => void;
  initialSemester?: 'first_half' | 'second_half' | 'both';
}

const DEFAULT_TRAINING_ITEMS = [
  '작업훈련',
  '직업교육',
  '직종훈련 프로그램',
  '자치회의 및 동아리 활동',
  '공통교육'
];

const DEFAULT_MAJOR_ITEMS_SMART = ['AI전자작가', '스마트팜', '사무보조'];
const DEFAULT_MAJOR_ITEMS_ART = ['AI샌드아트', '미술', '공예'];

export const SUBJECT_EVAL_META: Record<string, { taskName: string; evalDomain: string }> = {
  'AI샌드아트': {
    taskName: 'AI 샌드아트 기초 실기 및 이미지 구현',
    evalDomain: '라이트박스 조작 및 모래 표현 기법'
  },
  'AI전자작가': {
    taskName: 'AI 프롬프트 활용 및 디지털 원고 작성',
    evalDomain: '디지털 기기 조작 및 창작 표현력'
  },
  '미술': {
    taskName: '디지털 드로잉 및 채색 실기',
    evalDomain: '색채 감각 및 태블릿 드로잉'
  },
  '공예': {
    taskName: '수공예 소품 제작 및 도구 조작',
    evalDomain: '소근육 조작 및 공예품 완성도'
  },
  '스마트팜': {
    taskName: '스마트팜 수경재배 및 생육 환경 관리',
    evalDomain: '스마트팜 제어 및 작물 재배 관리'
  },
  '사무보조': {
    taskName: '문서 스캔, 파쇄 및 사무기기 활용 실습',
    evalDomain: '사무기기 조작 및 정확한 문서 분류'
  },
  '작업활동': {
    taskName: '기초 조립 및 포장 직무 실습',
    evalDomain: '작업 정확성 및 도구 조작 숙련도'
  },
  '합창': {
    taskName: '합창 (발성 호흡 및 지정곡 앙상블 실창)',
    evalDomain: '음정/박자 정확성 및 단체 하모니'
  }
};

// 과목별 5대 세부 루브릭 평가 항목 설정
export const SUBJECT_DETAILED_CONFIGS: Record<string, {
  deptName: string;
  evaluatorTitle: string;
  taskTitle: string;
  evalMethod: string;
  rows: { domain: string; content: string; maxScore: number; defaultScore: number }[];
  defaultInstructorOpinion: string;
}> = {
  'AI샌드아트': {
    deptName: '문화예술',
    evaluatorTitle: 'AI샌드아트 전문강사',
    taskTitle: '모래를 활용한 사물 및 풍경 표현과 AI 이미지 응용 실습',
    evalMethod: '실기 관찰 평가 및 루브릭 기준 작품 완성도 평가',
    rows: [
      { domain: '라이트박스 조작 및 안전', content: '샌드아트 라이트박스 전원 및 조명 밝기를 스스로 바르게 조절할 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '모래 뿌리기 및 펴기(기초)', content: '모래를 손바닥에 쥐고 균일하게 뿌려 화면 전체를 고르게 채울 수 있는가', maxScore: 5, defaultScore: 4 },
      { domain: '손가락 드로잉(선/면)', content: '손가락 끝과 손날을 이용하여 선과 면의 명암을 구분하여 표현할 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '사물 및 주제 표현력', content: '제시된 주제(나무, 꽃, 동물 등)의 형태적 특징을 살려 표현할 수 있는가', maxScore: 5, defaultScore: 4 },
      { domain: '작업 정리 및 도구 관리', content: '수업 후 사용한 모래와 라이트박스를 정리하고 주변을 청결히 정돈하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 모래의 촉감을 편안하게 수용하며, 기본 명암 표현 및 형상 묘사 능력이 지속적으로 향상되고 있음.'
  },
  'AI전자작가': {
    deptName: '스마트산업',
    evaluatorTitle: 'AI전자작가 전문강사',
    taskTitle: '생성형 AI 프롬프트 입력 및 디지털 스토리북 원고 작성',
    evalMethod: '디지털 기기 실습 관찰 및 제작 원고 결과물 루브릭 평가',
    rows: [
      { domain: 'PC/태블릿 기기 기본 조작', content: '컴퓨터 및 태블릿 전원을 켜고 필요한 프로그램을 스스로 실행할 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '키보드 타이핑 및 텍스트 입력', content: '한글 자판을 활용하여 단어와 간단한 문장을 오타 없이 입력할 수 있는가', maxScore: 5, defaultScore: 4 },
      { domain: 'AI 프롬프트 작성 및 생성', content: '원하는 이미지나 스토리 키워드를 입력하여 AI 결과물을 생성할 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '원고 구성 및 편집 완성도', content: '생성된 이미지와 텍스트를 조합하여 1편의 전자책 페이지를 완성하는가', maxScore: 5, defaultScore: 4 },
      { domain: '수업 태도 및 파일 저장', content: '작업한 파일을 지정된 폴더에 스스로 저장하고 수업에 성실히 집중하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: IT 기기 활용 능력이 우수하며 AI 이미지 생성 프롬프트를 창의적으로 구상하여 완성도 높은 결과물을 제작함.'
  },
  '미술': {
    deptName: '문화예술',
    evaluatorTitle: '미술 지도강사',
    taskTitle: '태블릿 디지털 드로잉 및 채색 기법 실습',
    evalMethod: '실기 제작 관찰 및 포트폴리오 루브릭 평가',
    rows: [
      { domain: '드로잉 도구 활용', content: '디지털 펜 및 미술 도구를 올바른 파지법으로 쥐고 사용할 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '형태 스케치 및 비례', content: '제시된 밑그림의 외곽선을 관찰하고 비례에 맞게 스케치할 수 있는가', maxScore: 5, defaultScore: 4 },
      { domain: '색채 선택 및 채색 완성', content: '색상의 조화를 고려하여 빈틈없이 균일하게 색을 칠할 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '창의적 표현 및 개성', content: '자신만의 감각을 더해 개성 있는 배경이나 디테일을 묘사할 수 있는가', maxScore: 5, defaultScore: 4 },
      { domain: '작업 지속성 및 정리', content: '정해진 시간 동안 집중하여 작품을 완성하고 미술 도구를 정돈하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 색채 선택 감각이 뛰어나며 세밀한 채색 작업 시 높은 집중력을 유지하여 수준 높은 작품을 완성함.'
  },
  '공예': {
    deptName: '문화예술',
    evaluatorTitle: '공예 지도강사',
    taskTitle: '소근육 활용 수공예 소품 및 실용 공예품 제작',
    evalMethod: '제작 과정 관찰 및 완성품 규격 루브릭 평가',
    rows: [
      { domain: '공예 재료 탐색 및 준비', content: '수업에 필요한 공예 재료와 부자재를 바르게 구분하고 준비하는가', maxScore: 5, defaultScore: 5 },
      { domain: '소근육 정밀 조작', content: '자르기, 붙이기, 엮기 등의 소근육 작업을 정밀하게 수행하는가', maxScore: 5, defaultScore: 4 },
      { domain: '제작 순서 준수', content: '강사가 안내한 공예 제작 순서와 단계를 차례대로 잘 따르는가', maxScore: 5, defaultScore: 5 },
      { domain: '작품 완성도 및 견고성', content: '이음새가 튼튼하고 마감이 깔끔하게 공예품을 완성할 수 있는가', maxScore: 5, defaultScore: 4 },
      { domain: '안전 수칙 및 환경 정돈', content: '가위, 풀 등 도구를 안전하게 사용하고 책상 주변을 깨끗이 정리하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 손끝 조작 능력이 정교하여 제작 단계별 규격을 잘 지키며, 성실하게 작품을 완성함.'
  },
  '스마트팜': {
    deptName: '스마트산업',
    evaluatorTitle: '스마트팜 지도강사',
    taskTitle: '스마트팜 수경재배 파종, 정식 및 환경 모니터링',
    evalMethod: '실습 현장 관찰 및 생육 관리 루브릭 평가',
    rows: [
      { domain: '스마트팜 장비 점검', content: 'LED 조명, 순환 펌프 등 스마트팜 기본 장비의 가동 상태를 확인하는가', maxScore: 5, defaultScore: 5 },
      { domain: '파종 및 정식 작업', content: '스펀지에 씨앗을 정해진 개수대로 파종하고 베드에 바르게 정식하는가', maxScore: 5, defaultScore: 4 },
      { domain: '양액 배합 및 수위 측정', content: '측정 도구를 활용하여 양액 농도(EC/pH)와 수위를 관찰하고 기록하는가', maxScore: 5, defaultScore: 5 },
      { domain: '수확 및 포장 규격화', content: '성숙한 작물을 뿌리째 수확하여 규격 봉투에 상처 없이 포장하는가', maxScore: 5, defaultScore: 4 },
      { domain: '재배실 위생 및 정리정돈', content: '작업 후 재배 베드와 바닥을 청소하고 위생복을 단정히 착용하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 스마트팜 재배 단계별 매뉴얼을 잘 숙지하고 있으며, 작물 수확 및 포장 작업에서 정확한 손놀림을 보임.'
  },
  '사무보조': {
    deptName: '스마트산업',
    evaluatorTitle: '사무보조 직무강사',
    taskTitle: '문서 분류, 스캔, 복사 및 세절기 활용 실무',
    evalMethod: '사무 직무 수행 평가 및 시간/정확도 루브릭 평가',
    rows: [
      { domain: '문서 분류 및 라벨링', content: '제시된 기준(날짜, 부서, 서식)에 따라 문서를 오류 없이 분류하는가', maxScore: 5, defaultScore: 5 },
      { domain: '복합기 및 스캐너 조작', content: '복사/스캔 설정(용지 크기, 방향)을 맞추고 기기를 정상 조작하는가', maxScore: 5, defaultScore: 4 },
      { domain: '문서 세절 및 보안 관리', content: '폐기 문서를 적정 수량씩 세절기에 안전하게 투입하여 파쇄하는가', maxScore: 5, defaultScore: 5 },
      { domain: '우편물 수발신 및 배부', content: '우편물 및 전달 서류를 지정된 부서 수납함에 정확히 전달하는가', maxScore: 5, defaultScore: 4 },
      { domain: '사무 환경 정돈 및 보고', content: '작업 완료 후 사무용품을 제자리에 정리하고 완료 사항을 보고하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 지시사항을 정확하게 이해하고 꼼꼼한 문서 작업 태도를 보여 실무 보조원으로서의 잠재력이 높음.'
  },
  '작업활동': {
    deptName: '직업적응',
    evaluatorTitle: '직업훈련교사',
    taskTitle: '단순 부품 조립, 계량 및 포장 직무 실습',
    evalMethod: '작업 속도 및 불량률 관찰 루브릭 평가',
    rows: [
      { domain: '작업 준비 및 안전 수칙', content: '작업복을 단정히 착용하고 작업 전 준비 절차를 올바르게 준수하는가', maxScore: 5, defaultScore: 5 },
      { domain: '부품 조립 정확성', content: '부품의 방향과 규격을 맞추어 오조립 없이 정확하게 조립하는가', maxScore: 5, defaultScore: 4 },
      { domain: '계량 및 수량 검수', content: '정해진 수량(세트)을 저울 또는 눈금판으로 오차 없이 계량하는가', maxScore: 5, defaultScore: 5 },
      { domain: '작업 속도 및 지속성', content: '일정한 작업 템포를 유지하며 30분 이상 지치지 않고 지속하는가', maxScore: 5, defaultScore: 4 },
      { domain: '작업장 정리 및 도구 정돈', content: '작업 종료 후 잔여 자재를 정리하고 도구를 정리함에 보관하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 작업 속도와 정확도가 고르게 유지되며, 지시사항에 따라 성실하게 조립 및 포장 과제를 완수함.'
  },
  '합창': {
    deptName: '공통교육',
    evaluatorTitle: '합창 지도강사',
    taskTitle: '공통교육(합창) 기초 발성 및 단체 하모니 실습',
    evalMethod: '실습 참여도 관찰 및 루브릭 앙상블 평가',
    rows: [
      { domain: '바른 자세 및 복식호흡', content: '노래할 때 올바른 자세를 유지하고 배에 힘을 주어 안정적인 호흡을 유지하는가', maxScore: 5, defaultScore: 5 },
      { domain: '음정 및 박자 정확성', content: '지정곡의 멜로디 음정과 박자 리듬을 정확히 파악하여 소리 낼 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '가사 전달력 및 발음', content: '노랫말을 명확하게 발음하며 감정을 담아 노래를 표현하는가', maxScore: 5, defaultScore: 4 },
      { domain: '화음 및 앙상블 조화', content: '지휘자의 지휘에 맞춰 타 파트의 소리를 경청하며 균형 있게 소리를 맞추는가', maxScore: 5, defaultScore: 5 },
      { domain: '참여도 및 단합력', content: '연습에 성실히 참여하고 동료 단원들을 배려하며 합창 활동에 협동하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 정확한 음정과 맑은 성량으로 파트의 중심을 잘 잡아주며, 단체 앙상블 시 지휘에 집중하여 일체감 있는 하모니를 만들어냄.'
  },
  '공통교육': {
    deptName: '공통교육',
    evaluatorTitle: '합창 지도강사',
    taskTitle: '공통교육(합창) 기초 발성 및 단체 하모니 실습',
    evalMethod: '실습 참여도 관찰 및 루브릭 앙상블 평가',
    rows: [
      { domain: '바른 자세 및 복식호흡', content: '노래할 때 올바른 자세를 유지하고 배에 힘을 주어 안정적인 호흡을 유지하는가', maxScore: 5, defaultScore: 5 },
      { domain: '음정 및 박자 정확성', content: '지정곡의 멜로디 음정과 박자 리듬을 정확히 파악하여 소리 낼 수 있는가', maxScore: 5, defaultScore: 5 },
      { domain: '가사 전달력 및 발음', content: '노랫말을 명확하게 발음하며 감정을 담아 노래를 표현하는가', maxScore: 5, defaultScore: 4 },
      { domain: '화음 및 앙상블 조화', content: '지휘자의 지휘에 맞춰 타 파트의 소리를 경청하며 균형 있게 소리를 맞추는가', maxScore: 5, defaultScore: 5 },
      { domain: '참여도 및 단합력', content: '연습에 성실히 참여하고 동료 단원들을 배려하며 합창 활동에 협동하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: '○ 강사 의견: 단체 공통교육(합창)에 적극적으로 참여하여 안정적인 발성과 조화로운 화음을 표현함.'
  }
};

// 직종 과목별 단일 세부 중간평가표 생성 함수
export const getDefaultDetailedSubjectReport = (subjectName: string, client: Client | null, period: 'first' | 'second' = 'first'): MidtermSubjectDetailedReport => {
  const conf = SUBJECT_DETAILED_CONFIGS[subjectName] || {
    deptName: client?.trainingClass ? client.trainingClass.replace('반', '') : '전공',
    evaluatorTitle: `${subjectName} 전문강사`,
    taskTitle: `${subjectName} 기초 실기 및 직무 과제 수행`,
    evalMethod: '실기 관찰 평가 및 작품/과제 완성도 루브릭 평가',
    rows: [
      { domain: '도구 및 장비 조작', content: `${subjectName} 관련 장비 및 도구의 기본 기능을 이해하고 바르게 조작할 수 있는가`, maxScore: 5, defaultScore: 5 },
      { domain: '기초 기술 습득', content: `${subjectName} 핵심 기초 기술을 습득하고 과제를 지시대로 수행하는가`, maxScore: 5, defaultScore: 4 },
      { domain: '과제 수행 완성도', content: '주어진 직무 과제를 규격과 마감 기한에 맞추어 성실하게 완수하는가', maxScore: 5, defaultScore: 5 },
      { domain: '응용 및 문제 해결', content: '훈련 중 발생하는 문제를 강사에게 보고하고 보완하여 해결하는가', maxScore: 5, defaultScore: 4 },
      { domain: '수업 태도 및 정리정돈', content: '수업에 적극적으로 참여하고 작업 후 도구 및 환경을 바르게 정리정돈하는가', maxScore: 5, defaultScore: 5 },
    ],
    defaultInstructorOpinion: `○ 강사 의견: ${subjectName} 훈련에 대한 높은 집중력과 적극적인 참여 태도를 보이며, 직무 수행 완성도가 지속적으로 향상되고 있음.`
  };

  const rows = conf.rows.map(r => ({
    domain: r.domain,
    content: r.content,
    maxScore: r.maxScore,
    score: r.defaultScore
  }));
  const totalScore = rows.reduce((acc, r) => acc + r.score, 0);

  const deptPrefix = client?.trainingClass ? client.trainingClass.replace('반', '') : conf.deptName;
  const termName = period === 'second' ? '하반기 기말평가표' : '상반기 중간평가표';

  return {
    subjectTitle: `${deptPrefix} 전공훈련 ${termName} - ${subjectName}`,
    evalDate: new Date().toISOString().split('T')[0],
    evaluatorName: conf.evaluatorTitle,
    targetName: client?.name || '',
    taskTitle: conf.taskTitle,
    evalMethod: conf.evalMethod,
    rows,
    totalScore,
    instructorOpinion: conf.defaultInstructorOpinion
  };
};

// 훈련생의 모든 직종 훈련과목별 세부 평가표 배열 생성
export const getDefaultSubjectDetailedReports = (client: Client | null, period: 'first' | 'second' = 'first'): MidtermSubjectDetailedReport[] => {
  const defaultMajorSubjects = client?.trainingClass === '스마트산업반'
    ? DEFAULT_MAJOR_ITEMS_SMART
    : DEFAULT_MAJOR_ITEMS_ART;

  const subjects = client?.selectedSubjects && client.selectedSubjects.length > 0
    ? client.selectedSubjects
    : defaultMajorSubjects;

  return subjects.map(s => getDefaultDetailedSubjectReport(s, client, period));
};

// 5개 평가영역별 기본 항목 및 점수 생성 헬퍼 (각 5점 만점)
export const get5DomainScoresForSubject = (
  subjName: string, 
  existingDomainScores?: MidtermDomainScoreItem[]
): MidtermDomainScoreItem[] => {
  if (existingDomainScores && existingDomainScores.length === 5) {
    return existingDomainScores;
  }
  const cleanSubj = subjName.replace(/공통교육|\(|\)|\[|\]/g, '').trim() || subjName;
  const conf = SUBJECT_DETAILED_CONFIGS[cleanSubj] || SUBJECT_DETAILED_CONFIGS[subjName] || SUBJECT_DETAILED_CONFIGS['공통교육'];
  if (conf && conf.rows && conf.rows.length === 5) {
    return conf.rows.map((r, i) => ({
      domainName: r.domain,
      maxScore: 5,
      score: existingDomainScores?.[i]?.score ?? r.defaultScore ?? 5
    }));
  }
  const defaultNames = ['기초 준비 및 안전', '도구 및 장비 조작', '과제 수행 및 숙련도', '품질 및 완성도', '작업 태도 및 정리'];
  return defaultNames.map((name, i) => ({
    domainName: existingDomainScores?.[i]?.domainName || name,
    maxScore: 5,
    score: existingDomainScores?.[i]?.score ?? 5
  }));
};

// Initial Default for 직종훈련 성적표 (Page 1)
export const getDefaultJobReport = (client: Client | null, period: 'first' | 'second' = 'first'): MidtermJobTrainingReport => {
  const defaultMajorSubjects = client?.trainingClass === '스마트산업반'
    ? DEFAULT_MAJOR_ITEMS_SMART
    : DEFAULT_MAJOR_ITEMS_ART;

  const vocationalSubjects = client?.selectedSubjects && client.selectedSubjects.length > 0
    ? client.selectedSubjects
    : defaultMajorSubjects;

  // 1. 직종훈련과목별 평가 행 생성
  const vocationalRows = vocationalSubjects.map((subj) => {
    const meta = SUBJECT_EVAL_META[subj] || {
      taskName: `${subj} 기초 실기 및 직무 과제 수행`,
      evalDomain: '직무 기술 습득 및 수행 완성도'
    };
    const domainScores = get5DomainScoresForSubject(subj);
    const score = domainScores.reduce((acc, d) => acc + (Number(d.score) || 0), 0);
    return {
      subjectName: subj,
      taskName: meta.taskName,
      evalDomain: meta.evalDomain,
      domainScores,
      maxScore: 25,
      score
    };
  });

  // 2. 필수 공통교육 '합창' 과목 행 추가
  const choirDomainScores = get5DomainScoresForSubject('합창');
  const commonChoirRow = {
    subjectName: '공통교육 (합창)',
    taskName: '합창 (발성 호흡 및 지정곡 앙상블 실창)',
    evalDomain: '음정/박자 정확성 및 단체 하모니',
    domainScores: choirDomainScores,
    maxScore: 25,
    score: choirDomainScores.reduce((acc, d) => acc + (Number(d.score) || 0), 0)
  };

  const allRows = [...vocationalRows, commonChoirRow];
  const totalScore = allRows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);

  const opinionText = period === 'second'
    ? `○ 하반기 종합의견: ${vocationalSubjects.join(', ')} 등 직종 훈련과목 및 공통교육(합창) 전반에서 연간 목표를 상회하는 직무 숙련도를 나타내었으며, 동료와의 협업 및 규정 준수 태도가 매우 우수함.`
    : `○ 상반기 종합의견: ${vocationalSubjects.join(', ')} 등 직종 훈련과목 및 공통교육(합창) 전반에 걸쳐 높은 관심과 자발적인 참여도를 보이며, 과제 수행 과정에서 타 훈련생과의 협동 및 규칙 준수 상태가 매우 양호함.`;

  return {
    evaluationDate: new Date().toISOString().split('T')[0],
    evaluatorName: '담당 직업재활사',
    majorDept: client?.trainingClass || '문화예술반',
    rows: allRows,
    totalScore,
    managerOpinion: opinionText,
    traineeSignatureName: client?.name || '',
    guardianSignatureName: client?.intakeRecord?.applicantName || ''
  };
};

export const getDefaultSandartReport = (client: Client | null, period: 'first' | 'second' = 'first'): MidtermSubjectDetailedReport => {
  const firstSubj = client?.selectedSubjects?.[0] || (client?.trainingClass === '스마트산업반' ? 'AI전자작가' : 'AI샌드아트');
  return getDefaultDetailedSubjectReport(firstSubj, client, period);
};

export const getDefaultChoirReport = (client: Client | null, period: 'first' | 'second' = 'first'): MidtermSubjectDetailedReport => ({
  subjectTitle: period === 'second' ? '공통교육훈련 하반기 기말평가표 - 합창' : '공통교육훈련 상반기 중간평가표 - 합창',
  evalDate: new Date().toISOString().split('T')[0],
  evaluatorName: '합창 지도강사',
  targetName: client?.name || '',
  taskTitle: '합창 파트별 발성 호흡 및 지정곡 앙상블 실창',
  evalMethod: '파트별 개인 실창 관찰 및 단체 합창 조화도 평가',
  rows: [
    { domain: '바른 자세 및 복식호흡', content: '노래할 때 올바른 자세를 유지하고 배에 힘을 주어 안정적인 호흡을 유지하는가', maxScore: 5, score: 5 },
    { domain: '음정 및 박자 정확성', content: '지정곡의 멜로디 음정과 박자 리듬을 정확히 파악하여 소리 낼 수 있는가', maxScore: 5, score: 5 },
    { domain: '가사 전달력 및 발음', content: '노랫말을 명확하게 발음하며 감정을 담아 노래를 표현하는가', maxScore: 5, score: 4 },
    { domain: '화음 및 앙상블 조화', content: '지휘자의 지휘에 맞춰 타 파트의 소리를 경청하며 균형 있게 소리를 맞추는가', maxScore: 5, score: 5 },
    { domain: '참여도 및 단합력', content: '연습에 성실히 참여하고 동료 단원들을 배려하며 합창 활동에 협동하는가', maxScore: 5, score: 5 },
  ],
  totalScore: 24,
  instructorOpinion: period === 'second'
    ? '○ 강사 의견: 화음 파트별 조화와 안정된 호흡 조절 능력이 연중 돋보였으며, 발표회 합창 무대에서도 단합된 하모니를 훌륭히 발휘함.'
    : '○ 강사 의견: 정확한 음정과 맑은 성량으로 파트의 중심을 잘 잡아주며, 단체 앙상블 시 지휘에 집중하여 일체감 있는 하모니를 만들어냄.'
});

export default function SemesterEvaluationPage({
  clients,
  selectedClient,
  onSelectClient,
  iwpPlans,
  onSaveIWPPlan,
  onBack,
  initialSemester = 'first_half'
}: SemesterEvaluationPageProps) {
  const currentClient = selectedClient || (clients.length > 0 ? clients[0] : null);
  const [evaluationYear, setEvaluationYear] = useState<number>(new Date().getFullYear());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // === Active Semester View Switcher ('first_half' | 'second_half' | 'both') ===
  const [activeSemesterTab, setActiveSemesterTab] = useState<'first_half' | 'second_half' | 'both'>(initialSemester);

  // === 1. 상반기 (First Half) Data States ===
  const [midtermJobReport, setMidtermJobReport] = useState<MidtermJobTrainingReport>(() => getDefaultJobReport(currentClient, 'first'));
  const [subjectReports, setSubjectReports] = useState<MidtermSubjectDetailedReport[]>(() => getDefaultSubjectDetailedReports(currentClient, 'first'));
  const [choirReport, setChoirReport] = useState<MidtermSubjectDetailedReport>(() => getDefaultChoirReport(currentClient, 'first'));
  const [trainingFirstHalf, setTrainingFirstHalf] = useState<IWPComparisonRow[]>(() => 
    DEFAULT_TRAINING_ITEMS.map(item => ({ item, convertedScore: 0, percentage: 0 }))
  );
  const [majorFirstHalf, setMajorFirstHalf] = useState<IWPComparisonRow[]>(() => {
    const defaultList = currentClient?.selectedSubjects && currentClient.selectedSubjects.length > 0
      ? currentClient.selectedSubjects
      : (currentClient?.trainingClass === '스마트산업반' ? DEFAULT_MAJOR_ITEMS_SMART : DEFAULT_MAJOR_ITEMS_ART);
    return defaultList.map(item => ({ item, convertedScore: 0, percentage: 0 }));
  });
  const [firstHalfTrainingNotes, setFirstHalfTrainingNotes] = useState<string>('○ 상반기 소견: 1차 평가 결과 직업기능 및 일상생활 영역에서 성실한 태도를 유지함.(6월 평가)');
  const [firstHalfMajorNotes, setFirstHalfMajorNotes] = useState<string>('○ 상반기 소견: 전공훈련 과목 전반에서 기초 직무 기능 습득을 안정적으로 완수함.(6월 평가)');

  // === 2. 하반기 (Second Half) Data States ===
  const [secondHalfJobReport, setSecondHalfJobReport] = useState<MidtermJobTrainingReport>(() => getDefaultJobReport(currentClient, 'second'));
  const [secondHalfSubjectReports, setSecondHalfSubjectReports] = useState<MidtermSubjectDetailedReport[]>(() => getDefaultSubjectDetailedReports(currentClient, 'second'));
  const [secondHalfChoirReport, setSecondHalfChoirReport] = useState<MidtermSubjectDetailedReport>(() => getDefaultChoirReport(currentClient, 'second'));
  const [trainingSecondHalf, setTrainingSecondHalf] = useState<IWPComparisonRow[]>(() => 
    DEFAULT_TRAINING_ITEMS.map(item => ({ item, convertedScore: 0, percentage: 0 }))
  );
  const [majorSecondHalf, setMajorSecondHalf] = useState<IWPComparisonRow[]>(() => {
    const defaultList = currentClient?.selectedSubjects && currentClient.selectedSubjects.length > 0
      ? currentClient.selectedSubjects
      : (currentClient?.trainingClass === '스마트산업반' ? DEFAULT_MAJOR_ITEMS_SMART : DEFAULT_MAJOR_ITEMS_ART);
    return defaultList.map(item => ({ item, convertedScore: 0, percentage: 0 }));
  });
  const [secondHalfTrainingNotes, setSecondHalfTrainingNotes] = useState<string>('○ 하반기 소견: 2차 기말 평가 결과 전 영역에 걸쳐 직무 숙련도가 지속적으로 향상됨.(12월 평가)');
  const [secondHalfMajorNotes, setSecondHalfMajorNotes] = useState<string>('○ 하반기 소견: 전공 심화 실습 및 포트폴리오 작성을 성공적으로 완수함.(12월 평가)');

  // === 3. 연간 비교 분석 종합 소견 (비교표) ===
  const [trainingNotes, setTrainingNotes] = useState<string>('○ 종합 총평: 상반기 대비 하반기 전 영역에서 직무 숙련도가 지속적으로 성장하여 높은 성취율을 달성함.');
  const [majorNotes, setMajorNotes] = useState<string>('○ 종합 총평: 전공훈련 기초과정 이수 후 하반기 실무 프로젝트를 성실히 완수함.');

  // === 4. AI 소견 생성 상태 (상반기 & 하반기 종합) ===
  const [isGeneratingTrainingFirstAi, setIsGeneratingTrainingFirstAi] = useState(false);
  const [trainingFirstAiSuccess, setTrainingFirstAiSuccess] = useState(false);
  const [trainingFirstAiError, setTrainingFirstAiError] = useState<string | null>(null);

  const [isGeneratingMajorFirstAi, setIsGeneratingMajorFirstAi] = useState(false);
  const [majorFirstAiSuccess, setMajorFirstAiSuccess] = useState(false);
  const [majorFirstAiError, setMajorFirstAiError] = useState<string | null>(null);

  const [isGeneratingTrainingSecondAi, setIsGeneratingTrainingSecondAi] = useState(false);
  const [trainingSecondAiSuccess, setTrainingSecondAiSuccess] = useState(false);
  const [trainingSecondAiError, setTrainingSecondAiError] = useState<string | null>(null);

  const [isGeneratingMajorSecondAi, setIsGeneratingMajorSecondAi] = useState(false);
  const [majorSecondAiSuccess, setMajorSecondAiSuccess] = useState(false);
  const [majorSecondAiError, setMajorSecondAiError] = useState<string | null>(null);

  // Load from LocalStorage or matching IWP Plan when client changes
  useEffect(() => {
    if (!currentClient) return;

    // Check localStorage first
    const storageKey = `semester_eval_${currentClient.id}_${evaluationYear}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SemesterEvaluationData = JSON.parse(saved);
        
        // --- 1. 상반기 데이터 로드 ---
        if (parsed.midtermJobReport) {
          parsed.midtermJobReport.rows = parsed.midtermJobReport.rows.map(row => ({
            ...row,
            domainScores: get5DomainScoresForSubject(row.subjectName, row.domainScores)
          }));
          const hasChoir = parsed.midtermJobReport.rows.some(
            r => r.subjectName.includes('공통') || r.subjectName.includes('합창') || r.taskName.includes('합창')
          );
          if (!hasChoir) {
            const choirDomainScores = get5DomainScoresForSubject('합창');
            parsed.midtermJobReport.rows.push({
              subjectName: '공통교육 (합창)',
              taskName: '합창 (발성 호흡 및 지정곡 앙상블 실창)',
              evalDomain: '음정/박자 정확성 및 단체 하모니',
              domainScores: choirDomainScores,
              maxScore: 25,
              score: choirDomainScores.reduce((acc, d) => acc + (Number(d.score) || 0), 0)
            });
          }
          parsed.midtermJobReport.totalScore = parsed.midtermJobReport.rows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
          setMidtermJobReport(parsed.midtermJobReport);
        } else {
          setMidtermJobReport(getDefaultJobReport(currentClient, 'first'));
        }

        if (parsed.subjectDetailedReports && parsed.subjectDetailedReports.length > 0) {
          setSubjectReports(parsed.subjectDetailedReports);
        } else if (parsed.sandartReport) {
          const defs = getDefaultSubjectDetailedReports(currentClient, 'first');
          defs[0] = parsed.sandartReport;
          setSubjectReports(defs);
        } else {
          setSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'first'));
        }

        if (parsed.choirReport) setChoirReport(parsed.choirReport);
        else setChoirReport(getDefaultChoirReport(currentClient, 'first'));

        if (parsed.trainingCompareFirstHalf) setTrainingFirstHalf(parsed.trainingCompareFirstHalf);
        if (parsed.majorCompareFirstHalf) setMajorFirstHalf(parsed.majorCompareFirstHalf);
        if (parsed.firstHalfTrainingNotes) setFirstHalfTrainingNotes(parsed.firstHalfTrainingNotes);
        if (parsed.firstHalfMajorNotes) setFirstHalfMajorNotes(parsed.firstHalfMajorNotes);

        // --- 2. 하반기 데이터 로드 ---
        if (parsed.secondHalfJobReport) {
          parsed.secondHalfJobReport.rows = parsed.secondHalfJobReport.rows.map(row => ({
            ...row,
            domainScores: get5DomainScoresForSubject(row.subjectName, row.domainScores)
          }));
          const hasChoir = parsed.secondHalfJobReport.rows.some(
            r => r.subjectName.includes('공통') || r.subjectName.includes('합창') || r.taskName.includes('합창')
          );
          if (!hasChoir) {
            const choirDomainScores = get5DomainScoresForSubject('합창');
            parsed.secondHalfJobReport.rows.push({
              subjectName: '공통교육 (합창)',
              taskName: '합창 (발성 호흡 및 지정곡 앙상블 실창)',
              evalDomain: '음정/박자 정확성 및 단체 하모니',
              domainScores: choirDomainScores,
              maxScore: 25,
              score: choirDomainScores.reduce((acc, d) => acc + (Number(d.score) || 0), 0)
            });
          }
          parsed.secondHalfJobReport.totalScore = parsed.secondHalfJobReport.rows.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
          setSecondHalfJobReport(parsed.secondHalfJobReport);
        } else {
          setSecondHalfJobReport(getDefaultJobReport(currentClient, 'second'));
        }

        if (parsed.secondHalfSubjectDetailedReports && parsed.secondHalfSubjectDetailedReports.length > 0) {
          setSecondHalfSubjectReports(parsed.secondHalfSubjectDetailedReports);
        } else {
          setSecondHalfSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'second'));
        }

        if (parsed.secondHalfChoirReport) setSecondHalfChoirReport(parsed.secondHalfChoirReport);
        else setSecondHalfChoirReport(getDefaultChoirReport(currentClient, 'second'));

        if (parsed.trainingCompareSecondHalf) setTrainingSecondHalf(parsed.trainingCompareSecondHalf);
        if (parsed.majorCompareSecondHalf) setMajorSecondHalf(parsed.majorCompareSecondHalf);
        if (parsed.secondHalfTrainingNotes) setSecondHalfTrainingNotes(parsed.secondHalfTrainingNotes);
        if (parsed.secondHalfMajorNotes) setSecondHalfMajorNotes(parsed.secondHalfMajorNotes);

        if (parsed.trainingCompareNotes !== undefined) setTrainingNotes(parsed.trainingCompareNotes);
        if (parsed.majorCompareNotes !== undefined) setMajorNotes(parsed.majorCompareNotes);
        return;
      } catch (e) {
        console.error('Failed to parse saved semester evaluation', e);
      }
    }

    // Otherwise check IWP Plan
    const matchingIwp = iwpPlans.find(p => p.clientId === currentClient.id);
    if (matchingIwp) {
      setMidtermJobReport(getDefaultJobReport(currentClient, 'first'));
      setSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'first'));
      setChoirReport(getDefaultChoirReport(currentClient, 'first'));

      setSecondHalfJobReport(getDefaultJobReport(currentClient, 'second'));
      setSecondHalfSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'second'));
      setSecondHalfChoirReport(getDefaultChoirReport(currentClient, 'second'));

      if (matchingIwp.trainingCompareFirstHalf && matchingIwp.trainingCompareFirstHalf.length > 0) {
        setTrainingFirstHalf(matchingIwp.trainingCompareFirstHalf);
      }
      if (matchingIwp.trainingCompareSecondHalf && matchingIwp.trainingCompareSecondHalf.length > 0) {
        setTrainingSecondHalf(matchingIwp.trainingCompareSecondHalf);
      }
      if (matchingIwp.trainingCompareNotes) {
        setTrainingNotes(matchingIwp.trainingCompareNotes);
      }
      if (matchingIwp.majorCompareFirstHalf && matchingIwp.majorCompareFirstHalf.length > 0) {
        setMajorFirstHalf(matchingIwp.majorCompareFirstHalf);
      }
      if (matchingIwp.majorCompareSecondHalf && matchingIwp.majorCompareSecondHalf.length > 0) {
        setMajorSecondHalf(matchingIwp.majorCompareSecondHalf);
      }
      if (matchingIwp.majorCompareNotes) {
        setMajorNotes(matchingIwp.majorCompareNotes);
      }
    } else {
      // Fresh defaults
      setMidtermJobReport(getDefaultJobReport(currentClient, 'first'));
      setSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'first'));
      setChoirReport(getDefaultChoirReport(currentClient, 'first'));

      setSecondHalfJobReport(getDefaultJobReport(currentClient, 'second'));
      setSecondHalfSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'second'));
      setSecondHalfChoirReport(getDefaultChoirReport(currentClient, 'second'));

      setTrainingFirstHalf(DEFAULT_TRAINING_ITEMS.map(item => ({ item, convertedScore: 0, percentage: 0 })));
      setTrainingSecondHalf(DEFAULT_TRAINING_ITEMS.map(item => ({ item, convertedScore: 0, percentage: 0 })));
      setTrainingNotes('○ 총점: 해당 사항 없음.(1차 평가 6월 진행 예정)');

      const defaultSubjects = currentClient.selectedSubjects && currentClient.selectedSubjects.length > 0
        ? currentClient.selectedSubjects
        : (currentClient.trainingClass === '스마트산업반' ? DEFAULT_MAJOR_ITEMS_SMART : DEFAULT_MAJOR_ITEMS_ART);

      setMajorFirstHalf(defaultSubjects.map(item => ({ item, convertedScore: 0, percentage: 0 })));
      setMajorSecondHalf(defaultSubjects.map(item => ({ item, convertedScore: 0, percentage: 0 })));
      setMajorNotes('○ 총점: 해당 사항 없음.(1차 평가 6월 진행 예정)');
    }
  }, [currentClient, evaluationYear, iwpPlans]);

  // Save current evaluation
  const handleSave = () => {
    if (!currentClient) return;

    const data: SemesterEvaluationData = {
      id: `eval_${currentClient.id}_${evaluationYear}`,
      clientId: currentClient.id,
      year: evaluationYear,
      evaluatorName: '담당 직업재활사',
      // 상반기
      midtermJobReport,
      subjectDetailedReports: subjectReports,
      sandartReport: subjectReports[0] || getDefaultSandartReport(currentClient, 'first'),
      choirReport,
      firstHalfTrainingNotes,
      firstHalfMajorNotes,
      // 하반기
      secondHalfJobReport,
      secondHalfSubjectDetailedReports: secondHalfSubjectReports,
      secondHalfChoirReport,
      secondHalfTrainingNotes,
      secondHalfMajorNotes,
      // 3-4 & 3-5 비교표
      trainingCompareFirstHalf: trainingFirstHalf,
      trainingCompareSecondHalf: trainingSecondHalf,
      trainingCompareNotes: trainingNotes,
      majorCompareFirstHalf: majorFirstHalf,
      majorCompareSecondHalf: majorSecondHalf,
      majorCompareNotes: majorNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to LocalStorage
    localStorage.setItem(`semester_eval_${currentClient.id}_${evaluationYear}`, JSON.stringify(data));

    // Synchronize into client's IWP Plan if exists
    if (onSaveIWPPlan) {
      const existingIwp = iwpPlans.find(p => p.clientId === currentClient.id);
      if (existingIwp) {
        const updatedIwp: IndividualizedServicePlan = {
          ...existingIwp,
          trainingCompareFirstHalf: trainingFirstHalf,
          trainingCompareSecondHalf: trainingSecondHalf,
          trainingCompareNotes: trainingNotes,
          majorCompareFirstHalf: majorFirstHalf,
          majorCompareSecondHalf: majorSecondHalf,
          majorCompareNotes: majorNotes,
          updatedAt: new Date().toISOString()
        };
        onSaveIWPPlan(updatedIwp);
      }
    }

    const termLabel = activeSemesterTab === 'first_half' ? '상반기 평가표' : activeSemesterTab === 'second_half' ? '하반기 평가표' : '상·하반기 전체 평가표';
    setSaveToast(`${termLabel} 및 개별화계획서(IWP)가 성공적으로 저장 및 동기화되었습니다.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Reset to default blank state
  const handleResetToBlank = () => {
    if (!window.confirm('모든 점수를 0점(미실시 예정) 상태로 초기화하시겠습니까?')) return;
    setTrainingFirstHalf(DEFAULT_TRAINING_ITEMS.map(item => ({ item, convertedScore: 0, percentage: 0 })));
    setTrainingSecondHalf(DEFAULT_TRAINING_ITEMS.map(item => ({ item, convertedScore: 0, percentage: 0 })));
    setTrainingNotes('○ 총점: 해당 사항 없음.(1차 평가 6월 진행 예정)');

    const subjects = currentClient?.selectedSubjects && currentClient.selectedSubjects.length > 0
      ? currentClient.selectedSubjects
      : (currentClient?.trainingClass === '스마트산업반' ? DEFAULT_MAJOR_ITEMS_SMART : DEFAULT_MAJOR_ITEMS_ART);

    setMajorFirstHalf(subjects.map(item => ({ item, convertedScore: 0, percentage: 0 })));
    setMajorSecondHalf(subjects.map(item => ({ item, convertedScore: 0, percentage: 0 })));
    setMajorNotes('○ 총점: 해당 사항 없음.(1차 평가 6월 진행 예정)');
  };

  // Apply Sample 1: 1st Half Completed Evaluation
  const handleApplyFirstHalfSample = () => {
    setMidtermJobReport(getDefaultJobReport(currentClient, 'first'));
    setSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'first'));
    setChoirReport(getDefaultChoirReport(currentClient, 'first'));

    setTrainingFirstHalf([
      { item: '작업훈련', convertedScore: 3.7, percentage: 74 },
      { item: '직업교육', convertedScore: 4.3, percentage: 86 },
      { item: '직종훈련 프로그램', convertedScore: 4.0, percentage: 80 },
      { item: '자치회의 및 동아리 활동', convertedScore: 4.7, percentage: 94 },
      { item: '공통교육', convertedScore: 4.3, percentage: 86 }
    ]);
    setFirstHalfTrainingNotes('○ 상반기 총평: 직업교육 및 자치회의 활동에 적극적으로 참여하여 5점 만점 기준 평균 4.2점(84.0%)의 높은 달성률을 보임.');

    const subjects = majorFirstHalf.map(m => m.item);
    setMajorFirstHalf(subjects.map((item, idx) => ({
      item,
      convertedScore: 12 + (idx % 3),
      percentage: 80 + (idx * 6)
    })));
    setFirstHalfMajorNotes('○ 상반기 총평: 전공훈련 과목 전반에서 기초 직무 기능 습득 완료. 하반기 실무 숙련도 향상 훈련 진행 예정.');
    
    setSaveToast('상반기(1차/6월) 평가 완료 예시 데이터가 성공적으로 반영되었습니다.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Apply Sample 2: Full Year Completed Comparison Evaluation
  const handleApplyFullYearSample = () => {
    setMidtermJobReport(getDefaultJobReport(currentClient, 'first'));
    setSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'first'));
    setChoirReport(getDefaultChoirReport(currentClient, 'first'));

    setSecondHalfJobReport(getDefaultJobReport(currentClient, 'second'));
    setSecondHalfSubjectReports(getDefaultSubjectDetailedReports(currentClient, 'second'));
    setSecondHalfChoirReport(getDefaultChoirReport(currentClient, 'second'));

    setTrainingFirstHalf([
      { item: '작업훈련', convertedScore: 3.7, percentage: 74 },
      { item: '직업교육', convertedScore: 4.3, percentage: 86 },
      { item: '직종훈련 프로그램', convertedScore: 4.0, percentage: 80 },
      { item: '자치회의 및 동아리 활동', convertedScore: 4.7, percentage: 94 },
      { item: '공통교육', convertedScore: 4.3, percentage: 86 }
    ]);
    setTrainingSecondHalf([
      { item: '작업훈련', convertedScore: 4.7, percentage: 94 },
      { item: '직업교육', convertedScore: 5.0, percentage: 100 },
      { item: '직종훈련 프로그램', convertedScore: 4.7, percentage: 94 },
      { item: '자치회의 및 동아리 활동', convertedScore: 5.0, percentage: 100 },
      { item: '공통교육', convertedScore: 4.7, percentage: 94 }
    ]);
    setSecondHalfTrainingNotes('○ 하반기 총평: 상반기 기초과정 이수 후 하반기 직업적응훈련 전 영역 5점 만점 기준 평균 4.8점(96.4%) 성취도를 달성함.');
    setTrainingNotes('○ 종합 총평: 상반기 대비 하반기 작업훈련(+20%p) 및 직종훈련 프로그램(+14%p)에서 괄목할 만한 성장을 달성하여 전 영역 평균 96.4% 성취도를 기록함.');

    const subjects = majorFirstHalf.map(m => m.item);
    setMajorFirstHalf(subjects.map((item, idx) => ({
      item,
      convertedScore: 11 + idx,
      percentage: 75 + (idx * 5)
    })));
    setMajorSecondHalf(subjects.map((item, idx) => ({
      item,
      convertedScore: 14 + (idx % 2),
      percentage: 92 + (idx * 3)
    })));
    setSecondHalfMajorNotes('○ 하반기 총평: 전공훈련 과목별 심화 실습 및 포트폴리오 제작을 성공적으로 완수함.');
    setMajorNotes('○ 종합 총평: 상반기 기초과정 이수 후 하반기 심화 프로젝트 실무를 성공적으로 완수함.');

    setSaveToast('하반기 및 연간 비교평가 완료 예시 데이터가 성공적으로 반영되었습니다.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Helpers for table edits
  const updateTrainingFirstHalf = (index: number, field: 'convertedScore' | 'percentage', value: number) => {
    setTrainingFirstHalf(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateTrainingSecondHalf = (index: number, field: 'convertedScore' | 'percentage', value: number) => {
    setTrainingSecondHalf(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateMajorFirstHalf = (index: number, field: 'item' | 'convertedScore' | 'percentage', value: string | number) => {
    setMajorFirstHalf(prev => {
      const next = [...prev];
      const val = field === 'convertedScore' && typeof value === 'number' ? Number(value.toFixed(1)) : value;
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const updateMajorSecondHalf = (index: number, field: 'item' | 'convertedScore' | 'percentage', value: string | number) => {
    setMajorSecondHalf(prev => {
      const next = [...prev];
      const val = field === 'convertedScore' && typeof value === 'number' ? Number(value.toFixed(1)) : value;
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // === AI 소견 생성 핸들러 4종 ===
  // 1. 상반기 직업적응훈련 담당자 소견 AI 생성
  const handleGenerateTrainingFirstAi = async () => {
    if (!currentClient) return;
    setIsGeneratingTrainingFirstAi(true);
    setTrainingFirstAiError(null);
    setTrainingFirstAiSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-training-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: currentClient.name,
          trainingClass: currentClient.trainingClass || '직업적응훈련반',
          firstHalfScores: trainingFirstHalf,
          isFirstTerm: true
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI 소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setFirstHalfTrainingNotes(data.text);
        setTrainingFirstAiSuccess(true);
        setTimeout(() => setTrainingFirstAiSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error('Failed to generate training first opinion:', err);
      setTrainingFirstAiError(err?.message || 'AI 소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingTrainingFirstAi(false);
    }
  };

  // 2. 상반기 전공훈련 담당자 소견 AI 생성
  const handleGenerateMajorFirstAi = async () => {
    if (!currentClient) return;
    setIsGeneratingMajorFirstAi(true);
    setMajorFirstAiError(null);
    setMajorFirstAiSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-major-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: currentClient.name,
          trainingClass: currentClient.trainingClass || '문화예술반',
          firstHalfScores: majorFirstHalf,
          isFirstTerm: true
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI 소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setFirstHalfMajorNotes(data.text);
        setMajorFirstAiSuccess(true);
        setTimeout(() => setMajorFirstAiSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error('Failed to generate major first opinion:', err);
      setMajorFirstAiError(err?.message || 'AI 소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingMajorFirstAi(false);
    }
  };

  // 3. 상·하반기 직업적응훈련 비교 분석 종합 소견 AI 생성
  const handleGenerateTrainingSecondAi = async () => {
    if (!currentClient) return;
    setIsGeneratingTrainingSecondAi(true);
    setTrainingSecondAiError(null);
    setTrainingSecondAiSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-training-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: currentClient.name,
          trainingClass: currentClient.trainingClass || '직업적응훈련반',
          firstHalfScores: trainingFirstHalf,
          secondHalfScores: trainingSecondHalf,
          isFirstTerm: false
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI 소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setTrainingNotes(data.text);
        setTrainingSecondAiSuccess(true);
        setTimeout(() => setTrainingSecondAiSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error('Failed to generate training comparison opinion:', err);
      setTrainingSecondAiError(err?.message || 'AI 소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingTrainingSecondAi(false);
    }
  };

  // 4. 상·하반기 전공훈련 비교 분석 종합 소견 AI 생성
  const handleGenerateMajorSecondAi = async () => {
    if (!currentClient) return;
    setIsGeneratingMajorSecondAi(true);
    setMajorSecondAiError(null);
    setMajorSecondAiSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-major-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeName: currentClient.name,
          trainingClass: currentClient.trainingClass || '문화예술반',
          firstHalfScores: majorFirstHalf,
          secondHalfScores: majorSecondHalf,
          isFirstTerm: false
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI 소견 생성 중 오류가 발생했습니다.');
      }

      if (data.text) {
        setMajorNotes(data.text);
        setMajorSecondAiSuccess(true);
        setTimeout(() => setMajorSecondAiSuccess(false), 4000);
      }
    } catch (err: any) {
      console.error('Failed to generate major comparison opinion:', err);
      setMajorSecondAiError(err?.message || 'AI 소견 생성에 실패했습니다.');
    } finally {
      setIsGeneratingMajorSecondAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentClient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-500">
        <User className="h-12 w-12 text-slate-300 mb-3" />
        <p className="font-bold text-base text-slate-700">등록된 훈련생이 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">먼저 훈련생을 등록해 주세요.</p>
      </div>
    );
  }

  // Y-axis percentage grid marks (100% down to 0%)
  const yAxisTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-100 min-h-screen">
      
      {/* Top Header & Toolbar (Hidden during print) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Top Row: Back, Title, Client & Year Selector, Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Title & Trainee Info */}
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition-colors"
                  title="뒤로 가기"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    직종훈련 및 직업적응 평가표
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {evaluationYear}년도
                  </span>
                </div>
                <h1 className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  {activeSemesterTab === 'first_half' ? '🌸 상반기 평가표 (1차 / 6월 중간평가)' : 
                   activeSemesterTab === 'second_half' ? '🍁 하반기 평가표 (2차 / 12월 기말 & 종합비교)' : 
                   '📑 상·하반기 전체 통합 평가표'}
                </h1>
              </div>
            </div>

            {/* Center: Trainee & Year Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <label htmlFor="eval-trainee-select" className="text-xs font-bold text-slate-600">훈련생:</label>
                <select
                  id="eval-trainee-select"
                  value={currentClient.id}
                  onChange={(e) => {
                    const target = clients.find(c => c.id === e.target.value);
                    if (target) onSelectClient(target);
                  }}
                  className="text-xs font-black text-indigo-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.trainingClass || '문화예술반'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-2xl">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <label htmlFor="eval-year-select" className="text-xs font-bold text-slate-600">연도:</label>
                <select
                  id="eval-year-select"
                  value={evaluationYear}
                  onChange={(e) => setEvaluationYear(Number(e.target.value))}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  {[evaluationYear - 1, evaluationYear, evaluationYear + 1].map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetToBlank}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                title="모든 항목 0% 미실시로 초기화"
              >
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
              
              {activeSemesterTab === 'first_half' ? (
                <button
                  type="button"
                  onClick={handleApplyFirstHalfSample}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl border border-sky-200 transition-all flex items-center gap-1"
                  title="상반기 평가 완료 샘플 자동 입력"
                >
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  상반기 완료 예시
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyFullYearSample}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1"
                  title="하반기/연간 전체 완료 샘플 자동 입력"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  하반기/연간 예시
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                {activeSemesterTab === 'first_half' ? '상반기 인쇄 / PDF' : 
                 activeSemesterTab === 'second_half' ? '하반기 인쇄 / PDF' : '전체 인쇄 / PDF'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                저장 및 IWP 동기화
              </button>
            </div>
          </div>

          {/* Bottom Row: Semester Switcher Tabs (상반기 / 하반기 / 전체 분리 탭) */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              id="semester-tab-first"
              onClick={() => setActiveSemesterTab('first_half')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 border transition-all ${
                activeSemesterTab === 'first_half'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-200'
                  : 'bg-white text-slate-700 border-slate-250 hover:bg-sky-50/50 hover:text-sky-800'
              }`}
            >
              <Sun className={`h-4 w-4 ${activeSemesterTab === 'first_half' ? 'text-amber-300' : 'text-sky-600'}`} />
              <span>🌸 1. 상반기 평가표 (1차 / 6월 중간평가)</span>
            </button>

            <button
              type="button"
              id="semester-tab-second"
              onClick={() => setActiveSemesterTab('second_half')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 border transition-all ${
                activeSemesterTab === 'second_half'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-200'
                  : 'bg-white text-slate-700 border-slate-250 hover:bg-emerald-50/50 hover:text-emerald-800'
              }`}
            >
              <Award className={`h-4 w-4 ${activeSemesterTab === 'second_half' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <span>🍁 2. 하반기 평가표 (2차 / 12월 기말 & 종합비교)</span>
            </button>

            <button
              type="button"
              id="semester-tab-both"
              onClick={() => setActiveSemesterTab('both')}
              className={`py-2.5 px-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all ${
                activeSemesterTab === 'both'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-250 hover:bg-slate-50'
              }`}
              title="상반기와 하반기를 한 페이지에 모두 표시합니다."
            >
              <Layers className="h-3.5 w-3.5" />
              <span>📑 전체 보기</span>
            </button>
          </div>

        </div>
      </header>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4 print:hidden">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            {saveToast}
          </div>
        </div>
      )}

      {/* Main Document Content Area */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 space-y-8">
        
        {/* =========================================================================
            VIEW 1: 🌸 상반기 평가표 (1차 평가 / 6월 중간평가)
           ========================================================================= */}
        {(activeSemesterTab === 'first_half' || activeSemesterTab === 'both') && (
          <div className="space-y-6">
            
            {/* Header Banner for First Half */}
            <div className="bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/10 border-2 border-sky-300/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-xs">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 border border-sky-300">
                      🌸 1차 평가 (1월 ~ 6월)
                    </span>
                    <h2 className="text-sm font-black text-slate-900">
                      {currentClient.name} 훈련생 ({currentClient.trainingClass || '문화예술반'}) 상반기 평가표
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-[11px] font-bold text-sky-800 bg-white px-3 py-1 rounded-xl border border-sky-200 shadow-xs flex items-center gap-1.5">
                  <FolderSync className="h-3.5 w-3.5 text-sky-600" />
                  상반기 IWP 동기화 지원
                </span>
              </div>
            </div>

            {/* Part 1: 직종훈련 프로그램 상반기 중간평가 성적표 & 세부 평가표 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 print:hidden">
                <FileSpreadsheet className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-black text-slate-800">
                  직종훈련 프로그램 및 전공·공통과목 상반기 중간평가 성적표
                </h2>
              </div>
              
              <MidtermEvaluationReports
                client={currentClient}
                evaluationYear={evaluationYear}
                semesterType="first"
                midtermJobReport={midtermJobReport}
                subjectReports={subjectReports}
                choirReport={choirReport}
                onUpdateJobReport={setMidtermJobReport}
                onUpdateSubjectReports={setSubjectReports}
                onUpdateChoirReport={setChoirReport}
                onApplyPreset={handleApplyFirstHalfSample}
              />
            </div>

            {/* Part 2: 직업적응 및 전공훈련 상반기 평가표 & 단독 그래프 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 print:hidden pt-2">
                <BarChart3 className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-black text-slate-800">
                  직업적응훈련반 및 전공훈련 상반기 평가 사항
                </h2>
              </div>

              <div 
                id="first-half-eval-doc" 
                className="bg-white border-2 border-slate-900 p-6 md:p-8 shadow-xs print:shadow-none print:border-2 print:p-6 space-y-8 text-slate-950 font-sans print:break-before-page"
              >
                
                {/* 직업적응훈련반 상반기 평가표 */}
                <section className="space-y-2">
                  <div className="border-t-2 border-b-2 border-slate-950 py-1.5 px-2 bg-white flex justify-between items-center">
                    <h2 className="text-sm md:text-base font-black text-slate-950 tracking-tight">
                      직업적응훈련반 상반기(1월~6월) 훈련 평가 사항
                    </h2>
                    <span className="text-[11px] font-bold text-sky-800">1차 중간평가</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Left 6: 상반기 테이블 */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                      <div>
                        <div className="text-center font-bold text-[11px] bg-sky-50 border-t border-x border-slate-950 py-1 text-sky-950">
                          상반기(1월~6월) 성취도 <span className="text-[9px] font-normal text-sky-800">(5.0점 만점 기준)</span>
                        </div>
                        <table className="w-full border-collapse border border-slate-950 text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-950">
                              <th className="border-r border-slate-950 py-1.5 px-2 font-bold w-2/5">평가 영역</th>
                              <th className="border-r border-slate-950 py-1.5 px-2 font-bold w-3/10">환산점수(5점)</th>
                              <th className="py-1.5 px-2 font-bold w-3/10">100분율(%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trainingFirstHalf.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-950">
                                <td className="border-r border-slate-950 py-1.5 px-2 font-bold text-left pl-3 bg-white">
                                  {row.item}
                                </td>
                                <td className="border-r border-slate-950 py-1 px-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={5}
                                    value={row.convertedScore === 0 ? '' : row.convertedScore}
                                    placeholder="0.0"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const score = val === '' ? 0 : parseFloat(val);
                                      const safeScore = isNaN(score) ? 0 : Math.min(5, Math.max(0, score));
                                      const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                                      updateTrainingFirstHalf(idx, 'convertedScore', safeScore);
                                      updateTrainingFirstHalf(idx, 'percentage', pct);
                                    }}
                                    className="w-full text-center py-0.5 bg-transparent border-0 font-mono text-[11px] focus:ring-1 focus:ring-sky-500 rounded font-bold"
                                  />
                                </td>
                                <td className="py-1 px-1 font-mono">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={row.percentage}
                                      onChange={(e) => updateTrainingFirstHalf(idx, 'percentage', Number(e.target.value))}
                                      className="w-12 text-center py-0.5 bg-transparent border-0 font-mono text-[11px] focus:ring-1 focus:ring-sky-500 rounded font-bold text-sky-800"
                                    />
                                    <span className="text-[10px] font-bold text-slate-600">%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right 6: 상반기 단독 막대그래프 */}
                    <div className="lg:col-span-6 border border-slate-950 p-3 bg-white flex flex-col justify-between min-h-[260px]">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-700 pb-1">
                        <span className="text-slate-500">영역별 성취도 그래프</span>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-sky-500 border border-sky-800 inline-block"></span>
                          <span>상반기 성취율(%)</span>
                        </div>
                      </div>

                      <div className="relative flex-1 flex flex-col justify-between pt-1 pb-6 px-6 min-h-[200px]">
                        <div className="absolute inset-x-2 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                          {yAxisTicks.map((tick) => (
                            <div key={tick} className="w-full flex items-center gap-1">
                              <span className="w-6 text-right text-[8px] font-mono text-slate-500 shrink-0">
                                {tick}%
                              </span>
                              <div className="flex-1 border-t border-slate-200"></div>
                            </div>
                          ))}
                        </div>

                        <div className="relative z-10 flex items-end justify-around h-full pl-6">
                          {trainingFirstHalf.map((item, idx) => {
                            const firstPct = item.percentage || 0;
                            return (
                              <div key={idx} className="flex flex-col items-center justify-end h-full px-1 flex-1 max-w-[70px]">
                                <div className="flex items-end justify-center h-[150px] w-full">
                                  <div className="flex flex-col items-center justify-end h-full w-5">
                                    <span className="text-[8px] font-mono font-bold text-sky-800 mb-0.5 leading-none">
                                      {firstPct}%
                                    </span>
                                    <div
                                      className="w-full bg-sky-500 border border-sky-800 transition-all duration-300"
                                      style={{ height: `${Math.max(2, (firstPct / 100) * 130)}px` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-800 mt-2 text-center leading-tight truncate max-w-full" title={item.item}>
                                  {item.item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상반기 소견란 */}
                  <div className="border border-slate-950 p-2.5 bg-white space-y-1">
                    <span className="text-[10px] font-extrabold text-sky-900 block">3-4 상반기 직업적응훈련 담당자 소견</span>
                    <input
                      type="text"
                      value={firstHalfTrainingNotes}
                      onChange={(e) => setFirstHalfTrainingNotes(e.target.value)}
                      placeholder="○ 상반기 소견: 1차 평가 결과 직업기능 및 일상생활 영역에서 성실한 태도를 유지함."
                      className="w-full text-xs font-medium text-slate-950 bg-transparent border-0 focus:ring-0 p-0"
                    />
                  </div>
                </section>

                {/* 3-5. 전공훈련 프로그램 상반기 평가표 */}
                <section className="space-y-2 pt-2">
                  <div className="border-t-2 border-b-2 border-slate-950 py-1.5 px-2 bg-white flex justify-between items-center">
                    <h2 className="text-sm md:text-base font-black text-slate-950 tracking-tight">
                      3-5. 전공훈련 프로그램 상반기(1월~6월) 평가 사항
                    </h2>
                    <span className="text-[11px] font-bold text-sky-800">1차 중간평가</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                    {/* Left 6: 전공 테이블 */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                      <div>
                        <div className="text-center font-bold text-[11px] bg-sky-50 border-t border-x border-slate-950 py-1 text-sky-950">
                          상반기 전공과목별 성취도
                        </div>
                        <table className="w-full border-collapse border border-slate-950 text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-950">
                              <th className="border-r border-slate-950 py-1.5 px-2 font-bold w-2/5">전공 과목</th>
                              <th className="border-r border-slate-950 py-1.5 px-2 font-bold w-3/10">환산점수</th>
                              <th className="py-1.5 px-2 font-bold w-3/10">백분율(%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {majorFirstHalf.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-950">
                                <td className="border-r border-slate-950 py-1.5 px-2 font-bold text-left pl-3 bg-white">
                                  <input
                                    type="text"
                                    value={row.item}
                                    onChange={(e) => updateMajorFirstHalf(idx, 'item', e.target.value)}
                                    className="w-full bg-transparent border-0 font-bold text-[10px] p-0 focus:ring-0 text-slate-900"
                                  />
                                </td>
                                <td className="border-r border-slate-950 py-1 px-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={100}
                                    value={row.convertedScore === 0 ? '' : (typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore)}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const num = val === '' ? 0 : parseFloat(val);
                                      const safeScore = isNaN(num) ? 0 : Number(num.toFixed(1));
                                      updateMajorFirstHalf(idx, 'convertedScore', safeScore);
                                    }}
                                    placeholder="0.0"
                                    className="w-full text-center py-0.5 bg-transparent border-0 font-mono text-[11px] focus:ring-1 focus:ring-sky-500 rounded font-bold"
                                  />
                                </td>
                                <td className="py-1 px-1 font-mono">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={row.percentage}
                                      onChange={(e) => updateMajorFirstHalf(idx, 'percentage', Number(e.target.value))}
                                      className="w-12 text-center py-0.5 bg-transparent border-0 font-mono text-[11px] focus:ring-1 focus:ring-sky-500 rounded font-bold text-sky-800"
                                    />
                                    <span className="text-[10px] font-bold text-slate-600">%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right 6: 전공 막대그래프 */}
                    <div className="lg:col-span-6 border border-slate-950 p-3 bg-white flex flex-col justify-between min-h-[260px]">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-700 pb-1">
                        <span className="text-slate-500">전공별 성취도 그래프</span>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-sky-500 border border-sky-800 inline-block"></span>
                          <span>상반기 성취율(%)</span>
                        </div>
                      </div>

                      <div className="relative flex-1 flex flex-col justify-between pt-1 pb-6 px-6 min-h-[200px]">
                        <div className="absolute inset-x-2 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                          {yAxisTicks.map((tick) => (
                            <div key={tick} className="w-full flex items-center gap-1">
                              <span className="w-6 text-right text-[8px] font-mono text-slate-500 shrink-0">
                                {tick}%
                              </span>
                              <div className="flex-1 border-t border-slate-200"></div>
                            </div>
                          ))}
                        </div>

                        <div className="relative z-10 flex items-end justify-around h-full pl-6">
                          {majorFirstHalf.map((item, idx) => {
                            const firstPct = item.percentage || 0;
                            return (
                              <div key={idx} className="flex flex-col items-center justify-end h-full px-2 flex-1 max-w-[90px]">
                                <div className="flex items-end justify-center h-[150px] w-full">
                                  <div className="flex flex-col items-center justify-end h-full w-6">
                                    <span className="text-[8px] font-mono font-bold text-sky-800 mb-0.5 leading-none">
                                      {firstPct}%
                                    </span>
                                    <div
                                      className="w-full bg-sky-500 border border-sky-800 transition-all duration-300"
                                      style={{ height: `${Math.max(2, (firstPct / 100) * 130)}px` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-800 mt-2 text-center leading-tight truncate max-w-full" title={item.item}>
                                  {item.item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상반기 전공 소견란 */}
                  <div className="border border-slate-950 p-2.5 bg-white space-y-1">
                    <span className="text-[10px] font-extrabold text-sky-900 block">3-5 상반기 전공훈련 담당자 소견</span>
                    <input
                      type="text"
                      value={firstHalfMajorNotes}
                      onChange={(e) => setFirstHalfMajorNotes(e.target.value)}
                      placeholder="○ 상반기 소견: 전공훈련 과목 전반에서 기초 직무 기능 습득을 안정적으로 완수함."
                      className="w-full text-xs font-medium text-slate-950 bg-transparent border-0 focus:ring-0 p-0"
                    />
                  </div>
                </section>

              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: 🍁 하반기 평가표 (2차 평가 / 12월 기말 & 상·하반기 종합비교)
           ========================================================================= */}
        {(activeSemesterTab === 'second_half' || activeSemesterTab === 'both') && (
          <div className="space-y-6 pt-4">
            
            {/* Header Banner for Second Half */}
            <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/10 border-2 border-emerald-400/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                      🍁 2차 평가 (7월 ~ 12월 & 연간 종합비교)
                    </span>
                    <h2 className="text-sm font-black text-slate-900">
                      {currentClient.name} 훈련생 ({currentClient.trainingClass || '문화예술반'}) 하반기 평가표
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-1.5">
                  <FolderSync className="h-3.5 w-3.5 text-emerald-600" />
                  하반기/연간 IWP 동기화 지원
                </span>
              </div>
            </div>

            {/* Part 1: 직종훈련 프로그램 하반기 기말평가 성적표 & 세부 평가표 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 print:hidden">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                <h2 className="text-sm font-black text-slate-800">
                  직종훈련 프로그램 및 전공·공통과목 하반기 기말평가 성적표
                </h2>
              </div>
              
              <MidtermEvaluationReports
                client={currentClient}
                evaluationYear={evaluationYear}
                semesterType="second"
                midtermJobReport={secondHalfJobReport}
                subjectReports={secondHalfSubjectReports}
                choirReport={secondHalfChoirReport}
                onUpdateJobReport={setSecondHalfJobReport}
                onUpdateSubjectReports={setSecondHalfSubjectReports}
                onUpdateChoirReport={setSecondHalfChoirReport}
                onApplyPreset={handleApplyFullYearSample}
              />
            </div>

            {/* Part 2: 3-4 & 3-5 상·하반기 훈련 비교 분석 평가표 (종합 비교) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1 print:hidden pt-2">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                <h2 className="text-sm font-black text-slate-800">
                  3-4 & 3-5 상·하반기 훈련 비교 분석 평가표 (연간 종합 비교)
                </h2>
              </div>

              <div 
                id="second-half-eval-doc" 
                className="bg-white border-2 border-slate-900 p-6 md:p-8 shadow-xs print:shadow-none print:border-2 print:p-6 space-y-8 text-slate-950 font-sans print:break-before-page"
              >
                
                {/* 3-4. 직업적응훈련반 상·하반기 훈련 비교 분석 사항 */}
                <section className="space-y-2">
                  <div className="border-t-2 border-b-2 border-slate-950 py-1.5 px-2 bg-white flex justify-between items-center">
                    <h2 className="text-sm md:text-base font-black text-slate-950 tracking-tight">
                      3-4. 직업적응훈련반 훈련 비교 분석 사항 (상·하반기 종합)
                    </h2>
                    <span className="text-[11px] font-bold text-emerald-800">상·하반기 듀얼 비교</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                    
                    {/* Left Column: 상반기 & 하반기 비교 테이블 */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                      
                      {/* 상반기(1월~6월) 테이블 */}
                      <div>
                        <div className="text-center font-bold text-[11px] bg-slate-50 border-t border-x border-slate-950 py-0.5">
                          상반기(1월~6월) 성취도 <span className="text-[9px] font-normal text-slate-600">(5.0점 만점)</span>
                        </div>
                        <table className="w-full border-collapse border border-slate-950 text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-950">
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-2/5">구분</th>
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-3/10">환산점수(5점)</th>
                              <th className="py-1 px-2 font-bold w-3/10">100분율(%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trainingFirstHalf.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-950">
                                <td className="border-r border-slate-950 py-1 px-2 font-medium text-left pl-3 bg-white">
                                  {row.item}
                                </td>
                                <td className="border-r border-slate-950 py-0.5 px-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={5}
                                    value={row.convertedScore === 0 ? '' : row.convertedScore}
                                    placeholder="0.0"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const score = val === '' ? 0 : parseFloat(val);
                                      const safeScore = isNaN(score) ? 0 : Math.min(5, Math.max(0, score));
                                      const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                                      updateTrainingFirstHalf(idx, 'convertedScore', safeScore);
                                      updateTrainingFirstHalf(idx, 'percentage', pct);
                                    }}
                                    className="w-full text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 font-bold"
                                  />
                                </td>
                                <td className="py-0.5 px-1 font-mono">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={row.percentage}
                                      onChange={(e) => updateTrainingFirstHalf(idx, 'percentage', Number(e.target.value))}
                                      className="w-12 text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 text-blue-700 font-bold"
                                    />
                                    <span className="text-[10px]">%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 하반기(7월~12월) 테이블 */}
                      <div>
                        <div className="text-center font-bold text-[11px] bg-slate-900 text-white border-t border-x border-slate-950 py-0.5">
                          하반기(7월~12월) 성취도 <span className="text-[9px] font-normal text-slate-300">(5.0점 만점)</span>
                        </div>
                        <table className="w-full border-collapse border border-slate-950 text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-950">
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-2/5">구분</th>
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-3/10">환산점수(5점)</th>
                              <th className="py-1 px-2 font-bold w-3/10">100분율(%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trainingSecondHalf.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-950">
                                <td className="border-r border-slate-950 py-1 px-2 font-medium text-left pl-3 bg-white">
                                  {row.item}
                                </td>
                                <td className="border-r border-slate-950 py-0.5 px-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={5}
                                    value={row.convertedScore === 0 ? '' : row.convertedScore}
                                    placeholder="0.0"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const score = val === '' ? 0 : parseFloat(val);
                                      const safeScore = isNaN(score) ? 0 : Math.min(5, Math.max(0, score));
                                      const pct = Math.min(100, Math.max(0, Math.round((safeScore / 5) * 100)));
                                      updateTrainingSecondHalf(idx, 'convertedScore', safeScore);
                                      updateTrainingSecondHalf(idx, 'percentage', pct);
                                    }}
                                    className="w-full text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 font-bold"
                                  />
                                </td>
                                <td className="py-0.5 px-1 font-mono">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={row.percentage}
                                      onChange={(e) => updateTrainingSecondHalf(idx, 'percentage', Number(e.target.value))}
                                      className="w-12 text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 text-red-700 font-bold"
                                    />
                                    <span className="text-[10px]">%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>

                    {/* Right Column: Comparative Bar Chart (0% ~ 100%) */}
                    <div className="lg:col-span-6 border border-slate-950 p-3 bg-white flex flex-col justify-between min-h-[280px]">
                      
                      {/* Chart Top: Legend */}
                      <div className="flex justify-end items-center gap-4 text-[9px] font-medium text-slate-700 pb-1">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-blue-500 border border-slate-600 inline-block"></span>
                          <span>상반기(1월~6월)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-slate-900 border border-slate-950 inline-block"></span>
                          <span>하반기(7월~12월)</span>
                        </div>
                      </div>

                      {/* Chart Body: Grid Lines & Bars */}
                      <div className="relative flex-1 flex flex-col justify-between pt-1 pb-6 px-8 min-h-[220px]">
                        
                        {/* Horizontal Grid lines & Y-Axis Labels */}
                        <div className="absolute inset-x-2 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                          {yAxisTicks.map((tick) => (
                            <div key={tick} className="w-full flex items-center gap-1">
                              <span className="w-7 text-right text-[8px] font-mono text-slate-600 shrink-0 select-none">
                                {tick}%
                              </span>
                              <div className="flex-1 border-t border-slate-200"></div>
                            </div>
                          ))}
                        </div>

                        {/* Bars Container */}
                        <div className="relative z-10 flex items-end justify-around h-full pl-8">
                          {trainingFirstHalf.map((item, idx) => {
                            const firstPct = item.percentage || 0;
                            const secondPct = trainingSecondHalf[idx]?.percentage || 0;

                            return (
                              <div key={idx} className="flex flex-col items-center justify-end h-full px-1 flex-1 max-w-[70px]">
                                {/* Dual Bar Group */}
                                <div className="flex items-end justify-center gap-1 h-[170px] w-full">
                                  
                                  {/* Bar 1: 상반기 (Blue) */}
                                  <div className="flex flex-col items-center justify-end h-full w-3.5">
                                    <span className="text-[7.5px] font-mono font-bold text-blue-700 mb-0.5 leading-none">
                                      {firstPct}%
                                    </span>
                                    <div
                                      className="w-full bg-blue-500 border border-blue-800 transition-all duration-300"
                                      style={{ height: `${Math.max(2, (firstPct / 100) * 150)}px` }}
                                    />
                                  </div>

                                  {/* Bar 2: 하반기 (Dark Slate) */}
                                  <div className="flex flex-col items-center justify-end h-full w-3.5">
                                    <span className="text-[7.5px] font-mono font-bold text-slate-900 mb-0.5 leading-none">
                                      {secondPct}%
                                    </span>
                                    <div
                                      className="w-full bg-slate-900 border border-slate-950 transition-all duration-300"
                                      style={{ height: `${Math.max(2, (secondPct / 100) * 150)}px` }}
                                    />
                                  </div>

                                </div>

                                {/* X-Axis Category Label */}
                                <span 
                                  className="text-[9px] font-bold text-slate-800 mt-2 text-center leading-tight truncate max-w-full"
                                  title={item.item}
                                >
                                  {item.item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Bottom Summary / Notes (연간 종합 소견) */}
                  <div className="border border-slate-950 p-2.5 bg-white space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-900 block">3-4 상·하반기 직업적응훈련 비교 분석 종합 소견</span>
                    <input
                      type="text"
                      value={trainingNotes}
                      onChange={(e) => setTrainingNotes(e.target.value)}
                      placeholder="○ 종합 총평: 상반기 대비 하반기 작업훈련(+20%p) 및 직종훈련 프로그램(+13%p)에서 괄목할 만한 성장을 달성함."
                      className="w-full text-xs font-medium text-slate-950 bg-transparent border-0 focus:ring-0 p-0"
                    />
                  </div>
                </section>

                {/* 3-5. 전공훈련 프로그램 상·하반기 훈련 비교 분석 사항 */}
                <section className="space-y-2 pt-2">
                  <div className="border-t-2 border-b-2 border-slate-950 py-1.5 px-2 bg-white flex justify-between items-center">
                    <h2 className="text-sm md:text-base font-black text-slate-950 tracking-tight">
                      3-5. 전공훈련 프로그램 훈련 비교 분석 사항 (상·하반기 종합)
                    </h2>
                    <span className="text-[11px] font-bold text-emerald-800">전공 듀얼 비교</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                    
                    {/* Left Column: Tables */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                      
                      {/* 상반기 전공 평가표 */}
                      <div>
                        <div className="text-center font-bold text-[11px] bg-slate-50 border-t border-x border-slate-950 py-0.5">
                          상반기 전공 평가표
                        </div>
                        <table className="w-full border-collapse border border-slate-950 text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-950">
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-2/5">구분</th>
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-3/10">환산점수</th>
                              <th className="py-1 px-2 font-bold w-3/10">백분율</th>
                            </tr>
                          </thead>
                          <tbody>
                            {majorFirstHalf.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-950">
                                <td className="border-r border-slate-950 py-1 px-2 font-medium text-left pl-3 bg-white">
                                  <input
                                    type="text"
                                    value={row.item}
                                    onChange={(e) => {
                                      updateMajorFirstHalf(idx, 'item', e.target.value);
                                      updateMajorSecondHalf(idx, 'item', e.target.value);
                                    }}
                                    className="w-full bg-transparent border-0 font-medium text-[10px] p-0 focus:ring-0 text-slate-900"
                                  />
                                </td>
                                <td className="border-r border-slate-950 py-0.5 px-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={100}
                                    value={row.convertedScore === 0 ? '' : (typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore)}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const num = val === '' ? 0 : parseFloat(val);
                                      const safeScore = isNaN(num) ? 0 : Number(num.toFixed(1));
                                      updateMajorFirstHalf(idx, 'convertedScore', safeScore);
                                    }}
                                    placeholder="0.0"
                                    className="w-full text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 font-bold"
                                  />
                                </td>
                                <td className="py-0.5 px-1 font-mono">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={row.percentage}
                                      onChange={(e) => updateMajorFirstHalf(idx, 'percentage', Number(e.target.value))}
                                      className="w-12 text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 text-blue-700 font-bold"
                                    />
                                    <span className="text-[10px]">%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 하반기 전공 평가표 */}
                      <div>
                        <div className="text-center font-bold text-[11px] bg-red-950 text-white border-t border-x border-slate-950 py-0.5">
                          하반기 전공 평가표
                        </div>
                        <table className="w-full border-collapse border border-slate-950 text-center text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-950">
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-2/5">구분</th>
                              <th className="border-r border-slate-950 py-1 px-2 font-bold w-3/10">환산점수</th>
                              <th className="py-1 px-2 font-bold w-3/10">백분율</th>
                            </tr>
                          </thead>
                          <tbody>
                            {majorSecondHalf.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-950">
                                <td className="border-r border-slate-950 py-1 px-2 font-medium text-left pl-3 bg-white">
                                  {row.item}
                                </td>
                                <td className="border-r border-slate-950 py-0.5 px-1 font-mono">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min={0}
                                    max={100}
                                    value={row.convertedScore === 0 ? '' : (typeof row.convertedScore === 'number' ? Number(row.convertedScore.toFixed(1)) : row.convertedScore)}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const num = val === '' ? 0 : parseFloat(val);
                                      const safeScore = isNaN(num) ? 0 : Number(num.toFixed(1));
                                      updateMajorSecondHalf(idx, 'convertedScore', safeScore);
                                    }}
                                    placeholder="0.0"
                                    className="w-full text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 font-bold"
                                  />
                                </td>
                                <td className="py-0.5 px-1 font-mono">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={row.percentage}
                                      onChange={(e) => updateMajorSecondHalf(idx, 'percentage', Number(e.target.value))}
                                      className="w-12 text-center py-0.5 bg-transparent border-0 font-mono text-[10px] focus:ring-1 focus:ring-indigo-500 rounded print:border-0 text-red-700 font-bold"
                                    />
                                    <span className="text-[10px]">%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>

                    {/* Right Column: Comparative Bar Chart (0% ~ 100%) */}
                    <div className="lg:col-span-6 border border-slate-950 p-3 bg-white flex flex-col justify-between min-h-[280px]">
                      
                      {/* Chart Top: Legend */}
                      <div className="flex justify-end items-center gap-4 text-[9px] font-medium text-slate-700 pb-1">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-blue-500 border border-slate-600 inline-block"></span>
                          <span>상반기 평가표</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-red-600 border border-slate-950 inline-block"></span>
                          <span>하반기 평가표</span>
                        </div>
                      </div>

                      {/* Chart Body: Grid Lines & Bars */}
                      <div className="relative flex-1 flex flex-col justify-between pt-1 pb-6 px-8 min-h-[220px]">
                        
                        {/* Horizontal Grid lines & Y-Axis Labels */}
                        <div className="absolute inset-x-2 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                          {yAxisTicks.map((tick) => (
                            <div key={tick} className="w-full flex items-center gap-1">
                              <span className="w-7 text-right text-[8px] font-mono text-slate-600 shrink-0 select-none">
                                {tick}%
                              </span>
                              <div className="flex-1 border-t border-slate-200"></div>
                            </div>
                          ))}
                        </div>

                        {/* Bars Container */}
                        <div className="relative z-10 flex items-end justify-around h-full pl-8">
                          {majorFirstHalf.map((item, idx) => {
                            const firstPct = item.percentage || 0;
                            const secondPct = majorSecondHalf[idx]?.percentage || 0;

                            return (
                              <div key={idx} className="flex flex-col items-center justify-end h-full px-2 flex-1 max-w-[90px]">
                                {/* Dual Bar Group */}
                                <div className="flex items-end justify-center gap-1.5 h-[170px] w-full">
                                  
                                  {/* Bar 1: 상반기 (Blue) */}
                                  <div className="flex flex-col items-center justify-end h-full w-4">
                                    <span className="text-[7.5px] font-mono font-bold text-blue-700 mb-0.5 leading-none">
                                      {firstPct}%
                                    </span>
                                    <div
                                      className="w-full bg-blue-500 border border-blue-800 transition-all duration-300"
                                      style={{ height: `${Math.max(2, (firstPct / 100) * 150)}px` }}
                                    />
                                  </div>

                                  {/* Bar 2: 하반기 (Red) */}
                                  <div className="flex flex-col items-center justify-end h-full w-4">
                                    <span className="text-[7.5px] font-mono font-bold text-red-700 mb-0.5 leading-none">
                                      {secondPct}%
                                    </span>
                                    <div
                                      className="w-full bg-red-600 border border-red-900 transition-all duration-300"
                                      style={{ height: `${Math.max(2, (secondPct / 100) * 150)}px` }}
                                    />
                                  </div>

                                </div>

                                {/* X-Axis Category Label */}
                                <span 
                                  className="text-[9px] font-bold text-slate-800 mt-2 text-center leading-tight truncate max-w-full"
                                  title={item.item}
                                >
                                  {item.item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Bottom Summary / Notes (연간 전공 종합 소견) */}
                  <div className="border border-slate-950 p-2.5 bg-white space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-900 block">3-5 상·하반기 전공훈련 비교 분석 종합 소견</span>
                    <input
                      type="text"
                      value={majorNotes}
                      onChange={(e) => setMajorNotes(e.target.value)}
                      placeholder="○ 종합 총평: 상반기 기초과정 이수 후 하반기 심화 프로젝트 실무를 성공적으로 완수함."
                      className="w-full text-xs font-medium text-slate-950 bg-transparent border-0 focus:ring-0 p-0"
                    />
                  </div>
                </section>

              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
