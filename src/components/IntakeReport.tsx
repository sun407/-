import React from 'react';
import { Client, ClientIntakeRecord } from '../types';
import { Printer, Edit3, ArrowLeft, UploadCloud } from 'lucide-react';
import FamilyGenogram from './FamilyGenogram';

interface IntakeReportProps {
  client: Client;
  record: ClientIntakeRecord;
  onEdit: () => void;
  onBack: () => void;
  onOpenPictureInterestModal?: () => void;
}

export default function IntakeReport({ client, record, onEdit, onBack, onOpenPictureInterestModal }: IntakeReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const adlList = [
    '대화하기',
    '식사하기',
    '착탈의',
    '대변보기',
    '소변보기',
    '목욕하기',
    '실내 이동하기',
    '계단오르기',
    '내려가기',
    '바깥일보기',
    '기타',
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 space-y-6 print:p-0 print:bg-white print:overflow-visible">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm gap-3 print:hidden max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로 돌아가기
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onEdit}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Edit3 className="h-4 w-4 text-indigo-600" />
            내용 수정하기
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            인쇄 / PDF 저장
          </button>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none text-slate-900 text-xs leading-tight font-sans">
        
        {/* PAGE 1: 접수상담기록지 */}
        <div className="bg-white p-8 md:p-10 shadow-md border border-slate-200 rounded-2xl print:border-none print:shadow-none print:p-0 print:rounded-none min-h-[1050px] flex flex-col justify-between page-break-after">
          <div>
            {/* Page Header */}
            <div className="text-center mb-4 relative">
              <span className="text-[11px] font-bold text-slate-600 absolute left-0 top-0">
                수원시장애인종합복지관
              </span>
              <h1 className="text-2xl font-black tracking-widest text-slate-900 border-b-2 border-slate-900 inline-block pb-1 px-4">
                접 수 상 담 기 록 지
              </h1>
            </div>

            {/* Sub Header info */}
            <div className="flex justify-between items-center text-[11px] font-semibold mb-1 px-1">
              <div>접수번호 : <span className="font-bold underline">{record.receiptNo || '26-001'}</span></div>
              <div>상담자 : <span className="font-bold underline">{record.counselor || '-'}</span></div>
              <div>상담일시 : <span className="font-bold underline">{record.counselDate || '-'}</span></div>
            </div>

            {/* Main Table Grid */}
            <table className="w-full border-collapse border border-slate-800 text-[11px] text-center font-medium">
              <tbody>
                {/* Row 1: 성명 / 주민번호 / 생년월일 / 만세 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold w-20 py-1.5">성 명</td>
                  <td className="border border-slate-800 font-bold text-slate-900 py-1.5">{client.name}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold w-24">주민등록번호</td>
                  <td className="border border-slate-800 font-mono py-1.5">{record.idNum || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold w-16">생년월일</td>
                  <td className="border border-slate-800 py-1.5">{client.birthDate} ({record.birthType || '양'})</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold w-12">만 세</td>
                  <td className="border border-slate-800 font-bold py-1.5">{record.age || '-'} 세</td>
                </tr>

                {/* Row 2: 주소 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1.5">주 소</td>
                  <td colSpan={7} className="border border-slate-800 text-left px-3 py-1.5">{record.address || '-'}</td>
                </tr>

                {/* Row 3: 연락처 */}
                <tr>
                  <td rowSpan={3} className="border border-slate-800 bg-slate-100 font-bold py-1.5">연 락 처</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">전화번호</td>
                  <td colSpan={2} className="border border-slate-800 font-mono text-left px-2 py-1">{record.phone || '-'}</td>
                  <td rowSpan={2} className="border border-slate-800 bg-slate-100 font-bold">경제적 여건</td>
                  <td colSpan={3} rowSpan={2} className="border border-slate-800 text-left px-2 py-1">
                    {['일반', '차상위', '수급권'].map(item => (
                      <span key={item} className="mr-3 inline-block">
                        {record.economicCondition === item ? '■' : '□'} {item}
                      </span>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold">휴 대 폰</td>
                  <td colSpan={2} className="border border-slate-800 text-left px-2 py-1 font-mono">
                    본인: {record.mobileSelf || '-'} / 보호자: {record.mobileGuard || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold">E-mail</td>
                  <td colSpan={2} className="border border-slate-800 text-left px-2 py-1 font-mono">{record.email || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">주택 소유형태</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-2 py-1">
                    {['자가', '전세', '월세', '임대', '영구임대', '기타'].map(item => (
                      <span key={item} className="mr-2 inline-block">
                        {record.housingType === item ? '■' : '□'} {item}
                      </span>
                    ))}
                    {record.housingType === '기타' && record.housingTypeOther && ` (${record.housingTypeOther})`}
                  </td>
                </tr>

                {/* Row 4: 결혼여부 / 직업유무 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1.5">결혼여부</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-2 py-1.5">
                    {['미혼', '기혼', '동거', '이혼', '사별'].map(item => (
                      <span key={item} className="mr-2.5 inline-block">
                        {record.maritalStatus === item ? '■' : '□'} {item}
                      </span>
                    ))}
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">직업유무</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-2 py-1.5">
                    <span className="mr-4 inline-block">{record.hasJob === '유' ? '■' : '□'} 유</span>
                    <span className="inline-block">{record.hasJob === '무' ? '■' : '□'} 무</span>
                  </td>
                </tr>

                {/* Row 5: 장애등록정보 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1.5">장애등록</td>
                  <td className="border border-slate-800 text-left px-2">
                    <span className="mr-2">{record.hasDisabilityReg === '유' ? '■' : '□'} 유</span>
                    <span>{record.hasDisabilityReg === '무' ? '■' : '□'} 무</span>
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">장 애 명</td>
                  <td className="border border-slate-800 font-bold text-left px-2">{record.disabilityName || client.diagnosis || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">장애등급</td>
                  <td className="border border-slate-800">{record.disabilityGrade || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">발생년도</td>
                  <td className="border border-slate-800">{record.disabilityYear || '-'}</td>
                </tr>

                {/* Row 6: 장애원인 / 보장구 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1.5">장애원인</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-2">
                    {['선천적장애', '후천적장애'].map(c => (
                      <span key={c} className="mr-3 inline-block">
                        {record.disabilityCause === c ? '■' : '□'} {c}
                      </span>
                    ))}
                    {!['선천적장애', '후천적장애'].includes(record.disabilityCause) && (record.disabilityCause || '-')}
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">보장구 사용여부</td>
                  <td className="border border-slate-800">{record.useAssistiveDevice || 'X'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">보장구명</td>
                  <td className="border border-slate-800">{record.assistiveDeviceName || '-'}</td>
                </tr>

                {/* Row 7: 주된 어려움 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-2">주 된 어려움</td>
                  <td colSpan={7} className="border border-slate-800 text-left px-3 py-1.5">{record.mainDifficulty || '-'}</td>
                </tr>

                {/* Row 8: 희망하는 프로그램 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-2">희망하는 프로그램</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-3 py-1.5">
                    {record.desiredPrograms && record.desiredPrograms.length > 0
                      ? record.desiredPrograms.join(', ')
                      : (record.desiredProgram || '-')}
                    {((record.desiredPrograms || []).includes('기타') || record.desiredProgram === '기타') && record.desiredProgramOther && ` (${record.desiredProgramOther})`}
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">복지관 이용경로</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-2 py-1.5">
                    {['인터넷', '주위 소개', '타기관 소개', '기타'].map(item => (
                      <span key={item} className="mr-2 inline-block">
                        {record.referralRoute === item ? '■' : '□'} {item}
                      </span>
                    ))}
                    {record.referralRoute === '기타' && record.referralRouteOther && ` (${record.referralRouteOther})`}
                  </td>
                </tr>

                {/* Row 8-2: 소속 훈련반 & 수강 과목 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1.5">소속 훈련반 및 과목</td>
                  <td colSpan={7} className="border border-slate-800 text-left px-3 py-1.5 font-bold">
                    <span className="text-indigo-900 mr-4">
                      [소속] {client.trainingClass || '문화예술반'}
                    </span>
                    <span className="text-slate-800">
                      수강과목: {client.selectedSubjects && client.selectedSubjects.length > 0 ? client.selectedSubjects.join(', ') : '미선택'}
                    </span>
                  </td>
                </tr>

                {/* Row 9: 평가여부 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1.5">평가여부</td>
                  <td colSpan={7} className="border border-slate-800 text-left px-3 py-1.5">
                    <span className="mr-4 inline-block">{record.evaluations?.social ? '■' : '□'} 사회평가</span>
                    <span className="mr-4 inline-block">{record.evaluations?.psychological ? '■' : '□'} 심리평가</span>
                    <span className="mr-4 inline-block">{record.evaluations?.speech ? '■' : '□'} 언어평가</span>
                    <span className="mr-4 inline-block">{record.evaluations?.motor ? '■' : '□'} 운동기능평가</span>
                    <span className="mr-4 inline-block">{record.evaluations?.vocational ? '■' : '□'} 직업평가</span>
                    <span className="inline-block">{record.evaluations?.reApplication ? '■' : '□'} 재접수</span>
                  </td>
                </tr>

                {/* Row 10: 동거 가족 Table */}
                <tr>
                  <td rowSpan={4} className="border border-slate-800 bg-slate-100 font-bold py-2">동 거 가 족</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1">성 명</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1">연 령</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1">관 계</td>
                  <td colSpan={2} className="border border-slate-800 bg-slate-100 font-bold py-1">직 업</td>
                  <td colSpan={2} className="border border-slate-800 bg-slate-100 font-bold py-1">비 고</td>
                </tr>
                {[0, 1, 2].map((idx) => {
                  const m = record.familyMembers && record.familyMembers[idx];
                  return (
                    <tr key={idx}>
                      <td className="border border-slate-800 py-1">{m ? m.name : '-'}</td>
                      <td className="border border-slate-800 py-1">{m ? m.age : '-'}</td>
                      <td className="border border-slate-800 py-1">{m ? m.relation : '-'}</td>
                      <td colSpan={2} className="border border-slate-800 py-1">{m ? m.job : '-'}</td>
                      <td colSpan={2} className="border border-slate-800 py-1">{m ? m.note : '-'}</td>
                    </tr>
                  );
                })}

                {/* Row 11: 가계도 & 가족관계/가족력 */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-2 w-20">가계도</td>
                  <td colSpan={3} className="border border-slate-800 p-2 text-center align-middle bg-white">
                    <FamilyGenogram
                      clientName={client.name}
                      clientAge={record.age}
                      familyMembers={record.familyMembers || []}
                    />
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold w-20">
                    가족관계<br />&amp;<br />가족력
                  </td>
                  <td colSpan={3} className="border border-slate-800 text-left p-2.5 align-top">
                    <div className="mb-2 border-b border-slate-300 pb-2">
                      <div className="font-bold text-slate-900 mb-1">■ 가족관계 :</div>
                      <div className="text-[10.5px] grid grid-cols-2 gap-1">
                        {['수용', '부정', '슬픔', '원만', '기타'].map((rel, i) => (
                          <span key={rel} className="inline-flex items-center gap-1">
                            <span className="font-bold">{record.familyRelation === rel ? '■' : '□'}</span>
                            <span>{i + 1}) {rel}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-1">■ 가 족 력 :</div>
                      <div className="text-[10.5px] leading-relaxed text-slate-800 min-h-[30px] whitespace-pre-wrap">
                        {record.familyHistory || '특이사항 없음'}
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Row 12: 병력 및 건강상태 */}
                <tr>
                  <td rowSpan={3} className="border border-slate-800 bg-slate-100 font-bold py-2">
                    병 력<br />및<br />건강상태
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">병력 및 치료경험</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">진료병원/시기</td>
                  <td className="border border-slate-800">{record.medicalHistoryHospital || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold">진료내용</td>
                  <td colSpan={3} className="border border-slate-800 text-left px-2">{record.medicalHistoryContent || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1">현재의 진료병원/과목</td>
                  <td colSpan={6} className="border border-slate-800 text-left px-2">{record.currentHospital || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1">현재의 약물복용</td>
                  <td colSpan={6} className="border border-slate-800 text-left px-2 py-1">
                    <span className="mr-3">여부: {record.medicationIsTaking === '○' ? '■ ○' : '■ ×'}</span>
                    <span className="mr-3">복용법: {record.medicationUsage || '-'}</span>
                    <span className="mr-3">이유: {record.medicationReason || '-'}</span>
                    <span>현재건강상태: {record.currentHealthStatus || '-'}</span>
                  </td>
                </tr>

                {/* Row 13: 진단사항 */}
                <tr>
                  <td rowSpan={(record.diagnosisList && record.diagnosisList.length > 0) ? record.diagnosisList.length + 1 : 2} className="border border-slate-800 bg-slate-100 font-bold py-2">
                    진단사항
                  </td>
                  <td className="border border-slate-800 bg-slate-100 font-bold py-1">진 단 명</td>
                  <td colSpan={2} className="border border-slate-800 bg-slate-100 font-bold py-1">진 단 시 기</td>
                  <td colSpan={2} className="border border-slate-800 bg-slate-100 font-bold py-1">진 단 기 관</td>
                  <td colSpan={2} className="border border-slate-800 bg-slate-100 font-bold py-1">비 고</td>
                </tr>
                {record.diagnosisList && record.diagnosisList.length > 0 ? (
                  record.diagnosisList.map((diag, idx) => (
                    <tr key={diag.id || idx}>
                      <td className="border border-slate-800 font-bold py-1">{diag.name || '-'}</td>
                      <td colSpan={2} className="border border-slate-800 py-1">{diag.date || '-'}</td>
                      <td colSpan={2} className="border border-slate-800 py-1">{diag.agency || '-'}</td>
                      <td colSpan={2} className="border border-slate-800 py-1">{diag.note || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-slate-800 font-bold py-1">{record.diagnosisName1 || '-'}</td>
                    <td colSpan={2} className="border border-slate-800 py-1">{record.diagnosisDate || '-'}</td>
                    <td colSpan={2} className="border border-slate-800 py-1">{record.diagnosisAgency || '-'}</td>
                    <td colSpan={2} className="border border-slate-800 py-1">{record.diagnosisName2 || '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Bottom Agreement Statement */}
            <div className="mt-3 text-[10px] leading-snug text-slate-800 font-medium space-y-1 bg-slate-50 border border-slate-300 p-2.5 rounded">
              <p>※ 접수상담 완료 후 직업지원팀 대기자 명단에 등록 됩니다. 이용 순서가 되었을 때 기관에서 연락을 드리며, 상황평가(2주) 진행 후 이용 여부가 결정됩니다. (이용 결정시 직업 평가 후 직업훈련 진행)</p>
              <p>※ 위와 같이 접수상담 및 이용절차 진행을 확인하였으며, 동의합니다.</p>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-4 pt-2 flex flex-col items-end gap-2 text-xs font-bold text-slate-900">
            <div>
              신 청 자 (보 호 자) : <span className="font-mono underline ml-1 mr-4">{record.applicantName || client.name}</span> (인)
            </div>
            <div className="w-full text-center text-sm font-extrabold tracking-widest pt-2 border-t border-slate-300">
              수원시장애인종합복지관
            </div>
          </div>
        </div>

        {/* PAGE 2: 사회평가지 */}
        <div className="bg-white p-8 md:p-10 shadow-md border border-slate-200 rounded-2xl print:border-none print:shadow-none print:p-0 print:rounded-none min-h-[1050px] flex flex-col justify-between">
          <div>
            {/* Page Header */}
            <div className="text-center mb-4 relative">
              <span className="text-[11px] font-bold text-slate-600 absolute left-0 top-0">
                수원시장애인종합복지관
              </span>
              <h1 className="text-2xl font-black tracking-widest text-slate-900 border-b-2 border-slate-900 inline-block pb-1 px-6">
                사 회 평 가 지
              </h1>
            </div>

            {/* Sub Header info */}
            <div className="flex justify-between items-center text-[11px] font-semibold mb-1 px-1">
              <div>접수번호 : <span className="font-bold underline">{record.receiptNo || '26-001'}</span></div>
              <div>상담자 : <span className="font-bold underline">{record.counselor || '-'}</span></div>
              <div>상담일시 : <span className="font-bold underline">{record.counselDate || '-'}</span></div>
            </div>

            {/* Main Table Grid */}
            <table className="w-full border-collapse border border-slate-800 text-[11px] font-medium">
              <tbody>
                {/* ADL Section */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold w-24 text-center py-3">
                    일상생활<br />수행능력
                  </td>
                  <td colSpan={3} className="border border-slate-800 p-2.5 leading-relaxed">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-2 text-[10.5px]">
                      {adlList.map(item => {
                        const isChecked = (record.adlCheckedItems || []).includes(item);
                        return (
                          <div key={item} className="flex items-center gap-1">
                            <span className="font-bold">{isChecked ? '■' : '□'}</span>
                            <span>{item}</span>
                            {item === '기타' && record.adlOther && (
                              <span className="text-indigo-900 font-semibold ml-1">({record.adlOther})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-600 border-t border-slate-200 pt-1 font-semibold">
                      ※ 전반적인 일상생활 수행능력이 타인 도움 없이 자립적으로 가능한지 확인합니다.
                    </div>
                  </td>
                </tr>

                {/* Personality & Hobbies */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold text-center py-2">성격 및 특성</td>
                  <td className="border border-slate-800 p-2 w-1/2 align-top">{record.personality || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold text-center py-2 w-24">취미 및 여가생활</td>
                  <td className="border border-slate-800 p-2 align-top">{record.hobbies || '-'}</td>
                </tr>

                {/* Motor Skills & Social Relations */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold text-center py-2">운동기능</td>
                  <td className="border border-slate-800 p-2 align-top">{record.motorSkills || '-'}</td>
                  <td className="border border-slate-800 bg-slate-100 font-bold text-center py-2">
                    사회적 관계<br /><span className="text-[9px] font-normal">(친구, 이웃, 종교 등)</span>
                  </td>
                  <td className="border border-slate-800 p-2 align-top">{record.socialRelations || '-'}</td>
                </tr>

                {/* Education */}
                <tr>
                  <td rowSpan={2} className="border border-slate-800 bg-slate-100 font-bold text-center py-2">교육사항</td>
                  <td colSpan={3} className="border border-slate-800 p-0">
                    <table className="w-full text-center border-collapse text-[10.5px] table-fixed">
                      <colgroup>
                        <col className="w-[28%]" />
                        <col className="w-[22%]" />
                        <col className="w-[22%]" />
                        <col className="w-[28%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                          <th className="border-r border-slate-800 py-1">최종학교</th>
                          <th className="border-r border-slate-800 py-1">전공</th>
                          <th className="border-r border-slate-800 py-1">시기</th>
                          <th className="py-1">기타사항</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.education && record.education.length > 0 ? (
                          record.education.map((edu, idx) => (
                            <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                              <td className="border-r border-slate-800 py-1 px-1 truncate">{edu.school || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1 truncate">{edu.major || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1 truncate">{edu.period || '-'}</td>
                              <td className="py-1 px-1 truncate">{edu.note || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="py-1">-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr></tr>

                {/* Current Services */}
                <tr>
                  <td rowSpan={2} className="border border-slate-800 bg-slate-100 font-bold text-center py-2">현 이용 서비스</td>
                  <td colSpan={3} className="border border-slate-800 p-0">
                    <table className="w-full text-center border-collapse text-[10.5px] table-fixed">
                      <colgroup>
                        <col className="w-[28%]" />
                        <col className="w-[32%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                          <th className="border-r border-slate-800 py-1">기관명(법인/민간 등)</th>
                          <th className="border-r border-slate-800 py-1">내용</th>
                          <th className="border-r border-slate-800 py-1">시기</th>
                          <th className="py-1">기타사항</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.currentServices && record.currentServices.length > 0 ? (
                          record.currentServices.map((srv, idx) => (
                            <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                              <td className="border-r border-slate-800 py-1 px-1">{srv.agency || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{srv.content || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{srv.period || '-'}</td>
                              <td className="py-1 px-1">{srv.note || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="py-1">-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr></tr>

                {/* Past Services */}
                <tr>
                  <td rowSpan={2} className="border border-slate-800 bg-slate-100 font-bold text-center py-2">과거 이용 서비스</td>
                  <td colSpan={3} className="border border-slate-800 p-0">
                    <table className="w-full text-center border-collapse text-[10.5px] table-fixed">
                      <colgroup>
                        <col className="w-[28%]" />
                        <col className="w-[32%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                          <th className="border-r border-slate-800 py-1">기관명(법인/민간 등)</th>
                          <th className="border-r border-slate-800 py-1">내용</th>
                          <th className="border-r border-slate-800 py-1">시기</th>
                          <th className="py-1">기타사항</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.pastServices && record.pastServices.length > 0 ? (
                          record.pastServices.map((srv, idx) => (
                            <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                              <td className="border-r border-slate-800 py-1 px-1">{srv.agency || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{srv.content || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{srv.period || '-'}</td>
                              <td className="py-1 px-1">{srv.note || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="py-1">-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr></tr>

                {/* Employment History */}
                <tr>
                  <td rowSpan={2} className="border border-slate-800 bg-slate-100 font-bold text-center py-2">취업경력</td>
                  <td colSpan={3} className="border border-slate-800 p-0">
                    <table className="w-full text-center border-collapse text-[10.5px] table-fixed">
                      <colgroup>
                        <col className="w-[22%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                        <col className="w-[18%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 font-bold">
                          <th className="border-r border-slate-800 py-1">업체명</th>
                          <th className="border-r border-slate-800 py-1">직무</th>
                          <th className="border-r border-slate-800 py-1">근무기간</th>
                          <th className="border-r border-slate-800 py-1">퇴직사유</th>
                          <th className="py-1">기타</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.workHistory && record.workHistory.length > 0 ? (
                          record.workHistory.map((work, idx) => (
                            <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                              <td className="border-r border-slate-800 py-1 px-1">{work.company || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{work.jobTitle || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{work.period || '-'}</td>
                              <td className="border-r border-slate-800 py-1 px-1">{work.reasonForLeaving || '-'}</td>
                              <td className="py-1 px-1">{work.note || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="border-r border-slate-800 py-1">-</td>
                            <td className="py-1">-</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr></tr>

                {/* Counseling Notes Area */}
                <tr>
                  <td className="border border-slate-800 bg-slate-100 font-bold text-center py-8">상담내용</td>
                  <td colSpan={3} className="border border-slate-800 p-3 align-top min-h-[160px]">
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-800 min-h-[140px]">
                      {record.counselingNotes || '기재된 상세 상담내용이 없습니다.'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Title */}
          <div className="mt-8 text-center text-sm font-extrabold tracking-widest border-t border-slate-300 pt-3">
            수원시장애인종합복지관
          </div>
        </div>
      </div>
    </div>
  );
}
