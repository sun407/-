import React from 'react';
import { FamilyMember } from '../types';

interface FamilyGenogramProps {
  clientName: string;
  clientAge?: string;
  familyMembers?: FamilyMember[];
}

interface GenogramNode {
  id: string;
  name: string;
  age: string;
  relation: string;
  isSelf: boolean;
  gender: 'M' | 'F';
}

export default function FamilyGenogram({ clientName, clientAge, familyMembers = [] }: FamilyGenogramProps) {
  // 성별 추정 함수
  const getGender = (relation: string, isSelf: boolean): 'M' | 'F' => {
    const rel = relation.trim();
    if (['부', '아버지', '조부', '할아버지', '형', '오빠', '남동생', '남편', '아들', '손자'].includes(rel)) {
      return 'M';
    }
    if (['모', '어머니', '조모', '할머니', '누나', '언니', '여동생', '처', '아내', '딸', '손녀'].includes(rel)) {
      return 'F';
    }
    return 'M'; // 기본값
  };

  // 세대별 노드 분류
  const parentsNodes: GenogramNode[] = [];
  const selfNodes: GenogramNode[] = [];
  const childrenNodes: GenogramNode[] = [];

  // 본인 노드
  const selfNode: GenogramNode = {
    id: 'self',
    name: clientName || '본인',
    age: clientAge || '',
    relation: '본인',
    isSelf: true,
    gender: 'M', // 스타일에서 본인은 전용 배지/색상으로 표시
  };

  selfNodes.push(selfNode);

  // 동거가족 노드 분류
  familyMembers.forEach((m, idx) => {
    if (!m.relation && !m.name) return;
    const rel = m.relation || '';
    const node: GenogramNode = {
      id: `fam-${idx}`,
      name: m.name || '-',
      age: m.age || '',
      relation: rel,
      isSelf: false,
      gender: getGender(rel, false),
    };

    if (['부', '아버지', '모', '어머니', '조부', '조모', '할아버지', '할머니', '시아버지', '시어머니', '장인', '장모'].includes(rel)) {
      parentsNodes.push(node);
    } else if (['아들', '딸', '자녀', '손자', '손녀'].includes(rel)) {
      childrenNodes.push(node);
    } else {
      // 본인 세대 (형제, 자매, 배우자 등)
      selfNodes.push(node);
    }
  });

  // 부모 세대 정렬 (부 -> 모)
  parentsNodes.sort((a, b) => {
    if (a.relation.includes('부') || a.relation.includes('아버지')) return -1;
    if (b.relation.includes('부') || b.relation.includes('아버지')) return 1;
    return 0;
  });

  // SVG dimensions
  const width = 340;
  const height = 150;
  const nodeWidth = 32;
  const nodeHeight = 32;

  // 세대 Y 좌표
  const yParents = 25;
  const ySelf = parentsNodes.length > 0 ? 80 : 45;
  const yChildren = childrenNodes.length > 0 ? 135 : 120;

  // X 좌표 계산 함수
  const getXPositions = (count: number, startX = 20, endX = width - 20) => {
    if (count === 1) return [(startX + endX) / 2];
    const step = (endX - startX) / (count - 1);
    return Array.from({ length: count }, (_, i) => startX + i * step);
  };

  const parentsX = getXPositions(parentsNodes.length, 100, width - 100);
  const selfX = getXPositions(selfNodes.length, 30, width - 30);
  const childrenX = getXPositions(childrenNodes.length, 80, width - 80);

  // 부모 세대와 본인 세대를 잇는 중앙 라인 X
  const parentCenterX = parentsNodes.length > 0
    ? (parentsX[0] + parentsX[parentsX.length - 1]) / 2
    : width / 2;

  const selfCenterX = selfNodes.length > 0
    ? (selfX[0] + selfX[selfX.length - 1]) / 2
    : width / 2;

  return (
    <div className="w-full flex flex-col items-center justify-center p-1 bg-white rounded border border-slate-200 shadow-inner">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-[360px] h-auto overflow-visible">
        <defs>
          <style>{`
            .node-text { font-size: 10px; font-weight: 700; fill: #1e293b; text-anchor: middle; }
            .rel-text { font-size: 8.5px; font-weight: 600; fill: #64748b; text-anchor: middle; }
            .line-style { stroke: #475569; stroke-width: 1.5; stroke-linecap: round; }
          `}</style>
        </defs>

        {/* --- CONNECTOR LINES --- */}
        {/* 부모 - 본인 세대 연결선 */}
        {parentsNodes.length > 0 && (
          <g>
            {/* 부모 간 가로 연결선 */}
            {parentsNodes.length >= 2 && (
              <line x1={parentsX[0]} y1={yParents} x2={parentsX[parentsX.length - 1]} y2={yParents} className="line-style" />
            )}
            {/* 부모 수직 연결선 */}
            <line x1={parentCenterX} y1={yParents} x2={parentCenterX} y2={(yParents + ySelf) / 2} className="line-style" />
            {/* 본인 세대 수평 분포선 */}
            <line x1={selfX[0]} y1={(yParents + ySelf) / 2} x2={selfX[selfX.length - 1]} y2={(yParents + ySelf) / 2} className="line-style" />
            {/* 각 본인 세대 노드로 내리는 수직선 */}
            {selfNodes.map((_, i) => (
              <line key={`p-line-${i}`} x1={selfX[i]} y1={(yParents + ySelf) / 2} x2={selfX[i]} y2={ySelf - 16} className="line-style" />
            ))}
          </g>
        )}

        {/* 본인 - 자녀 세대 연결선 */}
        {childrenNodes.length > 0 && (
          <g>
            <line x1={selfCenterX} y1={ySelf + 16} x2={selfCenterX} y2={(ySelf + yChildren) / 2} className="line-style" />
            <line x1={childrenX[0]} y1={(ySelf + yChildren) / 2} x2={childrenX[childrenX.length - 1]} y2={(ySelf + yChildren) / 2} className="line-style" />
            {childrenNodes.map((_, i) => (
              <line key={`c-line-${i}`} x1={childrenX[i]} y1={(ySelf + yChildren) / 2} x2={childrenX[i]} y2={yChildren - 16} className="line-style" />
            ))}
          </g>
        )}

        {/* --- PARENTS NODES --- */}
        {parentsNodes.map((node, i) => {
          const cx = parentsX[i];
          const cy = yParents;
          const isMale = node.gender === 'M';
          return (
            <g key={node.id}>
              {isMale ? (
                <rect x={cx - 12} y={cy - 12} width="24" height="24" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" rx="2" />
              ) : (
                <circle cx={cx} cy={cy} r="12" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />
              )}
              <text x={cx} y={cy + 3} className="node-text">{node.relation}</text>
              <text x={cx} y={cy - 16} className="rel-text">{node.name}{node.age ? `(${node.age})` : ''}</text>
            </g>
          );
        })}

        {/* --- SELF / SIBLINGS NODES --- */}
        {selfNodes.map((node, i) => {
          const cx = selfX[i];
          const cy = ySelf;
          const isSelf = node.isSelf;
          const isMale = node.gender === 'M';

          return (
            <g key={node.id}>
              {isSelf ? (
                <>
                  {/* 본인 강조 박스/원 */}
                  <rect x={cx - 15} y={cy - 15} width="30" height="30" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" rx="4" />
                  <rect x={cx - 12} y={cy - 12} width="24" height="24" fill="#ffffff" stroke="#4f46e5" strokeWidth="1.5" rx="2" />
                  <text x={cx} y={cy + 3} className="node-text" fill="#4f46e5">본인</text>
                  <text x={cx} y={cy + 24} className="rel-text" fontWeight="bold" fill="#312e81">
                    {node.name}{node.age ? `(${node.age}세)` : ''}
                  </text>
                </>
              ) : (
                <>
                  {isMale ? (
                    <rect x={cx - 12} y={cy - 12} width="24" height="24" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" rx="2" />
                  ) : (
                    <circle cx={cx} cy={cy} r="12" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
                  )}
                  <text x={cx} y={cy + 3} className="node-text">{node.relation}</text>
                  <text x={cx} y={cy + 22} className="rel-text">{node.name}{node.age ? `(${node.age})` : ''}</text>
                </>
              )}
            </g>
          );
        })}

        {/* --- CHILDREN NODES --- */}
        {childrenNodes.map((node, i) => {
          const cx = childrenX[i];
          const cy = yChildren;
          const isMale = node.gender === 'M';
          return (
            <g key={node.id}>
              {isMale ? (
                <rect x={cx - 12} y={cy - 12} width="24" height="24" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" rx="2" />
              ) : (
                <circle cx={cx} cy={cy} r="12" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
              )}
              <text x={cx} y={cy + 3} className="node-text">{node.relation}</text>
              <text x={cx} y={cy + 22} className="rel-text">{node.name}{node.age ? `(${node.age})` : ''}</text>
            </g>
          );
        })}
      </svg>
      {/* 범례 (Legend) */}
      <div className="flex items-center justify-center gap-3 mt-1 text-[9px] text-slate-500 border-t border-slate-100 pt-1 w-full">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-600 bg-slate-100 inline-block rounded-sm"></span> 남성</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-600 bg-slate-100 inline-block rounded-full"></span> 여성</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border-2 border-indigo-600 bg-indigo-100 inline-block rounded-sm"></span> 본인</span>
      </div>
    </div>
  );
}
