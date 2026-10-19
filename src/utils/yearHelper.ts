/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PurdueTest,
  ERSTest,
  BasicAcademicTest,
  PictureInterestPDF,
  IndividualizedServicePlan,
  SituationEvaluationLog,
  ComprehensiveEvaluationReport,
  SemesterEvaluationData
} from '../types';

/**
 * 날짜 문자열(예: '2026-08-07', '2026. 2. 6.', '2026. 8. 7.') 또는 명시적 year에서 4자리 연도를 추출합니다.
 */
export function parseYearFromDate(dateStr?: string, defaultYear = new Date().getFullYear()): number {
  if (!dateStr) return defaultYear;
  const match = dateStr.match(/\b(20\d{2})\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return defaultYear;
}

/**
 * 날짜 문자열의 월(Month) 정보를 기반으로 1차(연초 1~5월) / 2차(6~8월 및 하반기 6~12월) 회차를 판정합니다.
 */
export function parseRoundFromDate(dateStr?: string, explicitRound?: '1차' | '2차' | '상시'): '1차' | '2차' | '상시' {
  if (explicitRound) return explicitRound;
  if (!dateStr) return '1차';

  // Extract month: YYYY-MM-DD or YYYY. M. D.
  let month = 1;
  const hyphenParts = dateStr.split('-');
  if (hyphenParts.length >= 2) {
    month = parseInt(hyphenParts[1], 10);
  } else {
    const dotParts = dateStr.split('.');
    if (dotParts.length >= 2) {
      month = parseInt(dotParts[1].trim(), 10);
    }
  }

  if (isNaN(month)) return '1차';
  return month >= 6 ? '2차' : '1차';
}

/**
 * 대상자의 모든 등록 데이터에서 연도 목록을 집계하여 최신순(내림차순)으로 반환합니다.
 */
export function getAvailableYears(options: {
  purdueTests?: PurdueTest[];
  ersTests?: ERSTest[];
  basicAcademicTests?: BasicAcademicTest[];
  picturePdfs?: PictureInterestPDF[];
  iwpPlans?: IndividualizedServicePlan[];
  semesterEvals?: SemesterEvaluationData[];
  situationLogs?: SituationEvaluationLog[];
  comprehensiveReports?: ComprehensiveEvaluationReport[];
  extraYears?: number[];
}): number[] {
  const currentYear = new Date().getFullYear();
  const yearSet = new Set<number>([currentYear, currentYear - 1]);

  if (options.extraYears) {
    options.extraYears.forEach(y => yearSet.add(y));
  }

  options.purdueTests?.forEach(t => {
    yearSet.add(t.year || parseYearFromDate(t.testDate));
  });

  options.ersTests?.forEach(t => {
    yearSet.add(t.year || parseYearFromDate(t.testDate));
  });

  options.basicAcademicTests?.forEach(t => {
    yearSet.add(t.year || parseYearFromDate(t.testDate));
  });

  options.picturePdfs?.forEach(p => {
    yearSet.add(p.year || parseYearFromDate(p.testDate));
  });

  options.iwpPlans?.forEach(p => {
    yearSet.add(p.year || parseYearFromDate(p.planDate));
  });

  options.semesterEvals?.forEach(s => {
    if (s.year) yearSet.add(s.year);
  });

  options.situationLogs?.forEach(l => {
    yearSet.add(l.year || parseYearFromDate(l.startDate));
  });

  options.comprehensiveReports?.forEach(r => {
    yearSet.add(r.year || parseYearFromDate(r.startDate));
  });

  return Array.from(yearSet).sort((a, b) => b - a);
}

/**
 * 특정 연도에 해당하는 1차(연초) 및 2차(6~8월) ERS 및 퍼듀펙보드 검사 기록을 분리하여 반환합니다.
 */
export function findYearAssessments(
  year: number,
  purdueTests: PurdueTest[],
  ersTests: ERSTest[]
): {
  purdue1st: PurdueTest | null;
  purdue2nd: PurdueTest | null;
  ers1st: ERSTest | null;
  ers2nd: ERSTest | null;
  yearPurdueTests: PurdueTest[];
  yearErsTests: ERSTest[];
} {
  const yearPurdueTests = purdueTests.filter(t => (t.year || parseYearFromDate(t.testDate)) === year);
  const yearErsTests = ersTests.filter(t => (t.year || parseYearFromDate(t.testDate)) === year);

  // Purdue 1st and 2nd
  let purdue1st: PurdueTest | null = null;
  let purdue2nd: PurdueTest | null = null;

  // Search by explicit round first
  purdue1st = yearPurdueTests.find(t => t.round === '1차') || null;
  purdue2nd = yearPurdueTests.find(t => t.round === '2차') || null;

  // Fallback by date / month if not explicitly tagged
  if (!purdue1st || !purdue2nd) {
    const sortedPurdue = [...yearPurdueTests].sort((a, b) => (a.testDate || '').localeCompare(b.testDate || ''));
    sortedPurdue.forEach(t => {
      const r = parseRoundFromDate(t.testDate, t.round);
      if (r === '1차' && !purdue1st) {
        purdue1st = t;
      } else if (r === '2차' && !purdue2nd) {
        purdue2nd = t;
      }
    });

    if (!purdue1st && sortedPurdue.length > 0) {
      purdue1st = sortedPurdue[0];
    }
    if (!purdue2nd && sortedPurdue.length > 1) {
      purdue2nd = sortedPurdue[sortedPurdue.length - 1];
    }
  }

  // ERS 1st and 2nd
  let ers1st: ERSTest | null = null;
  let ers2nd: ERSTest | null = null;

  ers1st = yearErsTests.find(t => t.round === '1차') || null;
  ers2nd = yearErsTests.find(t => t.round === '2차') || null;

  if (!ers1st || !ers2nd) {
    const sortedErs = [...yearErsTests].sort((a, b) => (a.testDate || '').localeCompare(b.testDate || ''));
    sortedErs.forEach(t => {
      const r = parseRoundFromDate(t.testDate, t.round);
      if (r === '1차' && !ers1st) {
        ers1st = t;
      } else if (r === '2차' && !ers2nd) {
        ers2nd = t;
      }
    });

    if (!ers1st && sortedErs.length > 0) {
      ers1st = sortedErs[0];
    }
    if (!ers2nd && sortedErs.length > 1) {
      ers2nd = sortedErs[sortedErs.length - 1];
    }
  }

  return {
    purdue1st,
    purdue2nd,
    ers1st,
    ers2nd,
    yearPurdueTests,
    yearErsTests
  };
}

/**
 * 훈련반 이용 시작일(YYYY-MM-DD)과 연장 횟수를 기준으로 이용기간의 종료일(YYYY-MM-DD)을 자동 계산합니다.
 * - 기본(0회 연장): 4년 (예: 2024-03-01 -> 2028-02-29)
 * - 1차 연장(1회): 총 8년 (예: 2024-03-01 -> 2032-02-29)
 * - 2차 연장(2회): 총 12년 (예: 2024-03-01 -> 2036-02-29)
 */
export function calculateServiceEndDate(startDateStr?: string, extensionCount: number = 0): string {
  if (!startDateStr) return '';
  const cleanStr = startDateStr.trim().replace(/\./g, '-');
  const parts = cleanStr.split('-');
  if (parts.length < 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return '';

  const totalYears = 4 * (1 + Math.max(0, extensionCount));

  // totalYears 후 - 1일 계산
  const date = new Date(y + totalYears, m - 1, d);
  date.setDate(date.getDate() - 1);

  const ey = date.getFullYear();
  const em = String(date.getMonth() + 1).padStart(2, '0');
  const ed = String(date.getDate()).padStart(2, '0');
  return `${ey}-${em}-${ed}`;
}

/**
 * 4년 기본 종료일 계산 래퍼 함수 (호환성 유지)
 */
export function calculate4YearEndDate(startDateStr?: string): string {
  return calculateServiceEndDate(startDateStr, 0);
}

/**
 * 시작일과 종료일 또는 지정된 연장 횟수를 바탕으로 실제 적용된 연장 횟수를 유추/반환합니다.
 */
export function getEffectiveExtensionCount(startDateStr?: string, endDateStr?: string, extensionCount?: number): number {
  if (typeof extensionCount === 'number' && extensionCount >= 0) {
    return extensionCount;
  }
  if (!startDateStr || !endDateStr) return 0;
  const sParts = startDateStr.trim().replace(/\./g, '-').split('-');
  const eParts = endDateStr.trim().replace(/\./g, '-').split('-');
  if (sParts.length < 3 || eParts.length < 3) return 0;
  const sy = parseInt(sParts[0], 10);
  const ey = parseInt(eParts[0], 10);
  if (isNaN(sy) || isNaN(ey)) return 0;
  const diffYears = ey - sy + 1;
  const count = Math.round(diffYears / 4) - 1;
  return Math.max(0, count);
}

/**
 * 연장 횟수에 따른 훈련 기간 라벨 (예: "기본 4년", "총 8년 (1차 연장 +4년)")
 */
export function getServicePeriodLabel(extensionCount: number = 0): string {
  if (extensionCount === 0) return '기본 4년 과정';
  if (extensionCount === 1) return '총 8년 (1차 연장 +4년)';
  if (extensionCount === 2) return '총 12년 (2차 연장 +4년)';
  return `총 ${4 * (1 + extensionCount)}년 (${extensionCount}차 연장 +4년)`;
}

/**
 * 훈련반 이용기간 표시용 포맷팅 (예: "2024.03.01 ~ 2028.02.29 (기본 4년)" 또는 "2024.03.01 ~ 2032.02.29 (총 8년/1차 연장)")
 */
export function formatServicePeriod(startDateStr?: string, endDateStr?: string, extensionCount?: number): string {
  if (!startDateStr) return '';
  const startFmt = startDateStr.replace(/-/g, '.');
  const count = getEffectiveExtensionCount(startDateStr, endDateStr, extensionCount);
  const end = endDateStr || calculateServiceEndDate(startDateStr, count);
  const endFmt = end ? end.replace(/-/g, '.') : '';

  let tag = '기본 4년';
  if (count === 1) tag = '총 8년 (1차 연장)';
  else if (count === 2) tag = '총 12년 (2차 연장)';
  else if (count > 2) tag = `총 ${4 * (1 + count)}년 (${count}차 연장)`;

  return endFmt ? `${startFmt} ~ ${endFmt} (${tag})` : `${startFmt} ~ (${tag})`;
}

export const EXTENSION_OPTIONS = [
  { count: 0, label: '기본 4년 과정 (연장 없음)', years: 4, badge: '4년' },
  { count: 1, label: '1차 연장 (+4년 추가, 총 8년)', years: 8, badge: '8년 (1차 연장)' },
  { count: 2, label: '2차 연장 (+4년 추가, 총 12년)', years: 12, badge: '12년 (2차 연장)' },
  { count: 3, label: '3차 연장 (+4년 추가, 총 16년)', years: 16, badge: '16년 (3차 연장)' },
];


