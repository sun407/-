import React from 'react';
import { 
  Download, 
  Printer, 
  Edit3, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  History, 
  Award, 
  HeartHandshake, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  onEdit: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  highContrast: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  onEdit,
  onExportPdf,
  isExportingPdf,
  highContrast,
}) => {
  const { personal, jobGoal, education, educations, experiences, strength, accommodations } = data;

  const eduList = (educations && educations.length > 0)
    ? educations
    : (education && education.schoolName ? [{ id: 'legacy-edu', ...education }] : []);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control */}
      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border shadow-xs ${
        highContrast
          ? 'bg-zinc-900 text-yellow-300 border-yellow-400'
          : 'bg-[#f8f7f2] text-[#3d3d3d] border-[#e8e6df]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#7a8d7c] text-white rounded-xl shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#4a544b]">
              이력서가 정갈하게 완성되었습니다!
            </h2>
            <p className="text-xs text-[#8e8d88]">
              오탈자를 확인하고 'PDF 다운로드' 버튼을 누르면 문서로 저장할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-white hover:bg-[#f0f2f0] text-[#4a544b] border border-[#e8e6df] font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Edit3 className="w-4 h-4 text-[#7a8d7c]" />
            <span>질문 수정하기</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#4a544b] hover:bg-[#3d3d3d] text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>프린트</span>
          </button>

          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="px-5 py-2 bg-[#7a8d7c] hover:bg-[#647566] text-white font-bold text-sm rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? '생성 중...' : 'PDF 다운로드'}</span>
          </button>
        </div>
      </div>

      {/* Printable / Capturable Resume Document Container */}
      <div className="flex justify-center">
        <div
          id="resume-pdf-content"
          className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 border border-[#e8e6df] shadow-lg rounded-sm print:shadow-none print:border-none print:p-0"
          style={{ fontFamily: 'Pretendard, "Noto Sans KR", sans-serif' }}
        >
          {/* Resume Title Header */}
          <div className="border-b-4 border-[#7a8d7c] pb-4 mb-6">
            <span className="text-xs font-bold tracking-widest text-[#8e8d88] uppercase">Resume</span>
            <h1 className="text-3xl font-black text-[#2d332e] tracking-tight">이 력 서</h1>
          </div>

          {/* Section 1: 인적사항 (Personal Info Box with Photo) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pb-6 mb-6 border-b border-slate-200">
            {/* Photo */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center">
              <div className="w-32 h-40 border border-[#e8e6df] rounded overflow-hidden bg-[#f8f7f2] flex items-center justify-center">
                {personal.photoUrl ? (
                  <img
                    src={personal.photoUrl}
                    alt="사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-[#8e8d88]">
                    <User className="w-12 h-12 mx-auto mb-1 stroke-1" />
                    <span className="text-xs">사진 미등록</span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info Table */}
            <div className="sm:col-span-3 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">성명 (Name)</span>
                  <span className="text-lg font-bold text-slate-900">{personal.name || '미입력'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">생년월일 (Birth)</span>
                  <span className="font-semibold text-slate-800">{personal.birthDate || '미입력'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">연락처 (Phone)</span>
                  <span className="font-semibold text-slate-800">{personal.phone || '미입력'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#8e8d88] block">비상 연락처 (Emergency)</span>
                  <span className="font-semibold text-slate-800">{personal.emergencyPhone || '미입력'}</span>
                </div>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#8e8d88] block">주소 (Address)</span>
                <span className="font-medium text-slate-800">{personal.address || '미입력'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {personal.disabilityType && (
                  <div>
                    <span className="text-xs font-bold text-[#8e8d88] block">장애 유형</span>
                    <span className="inline-block bg-[#f0f2f0] text-[#7a8d7c] border border-[#7a8d7c]/30 px-2.5 py-0.5 rounded text-xs font-bold mt-0.5">
                      {personal.disabilityType}
                    </span>
                  </div>
                )}

                {jobGoal.desiredJob && (
                  <div>
                    <span className="text-xs font-bold text-[#8e8d88] block">지원 직무 (희망 직종)</span>
                    <span className="inline-block font-bold text-[#7a8d7c] text-sm mt-0.5">
                      {jobGoal.desiredJob}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: 학력 사항 (Education) */}
          <div className="mb-6">
            <h3 className="text-base font-extrabold text-[#2d332e] border-l-4 border-[#7a8d7c] pl-2 mb-3">
              학력 및 교육 이수 사항
            </h3>
            {eduList.length > 0 ? (
              <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead>
                  <tr className="bg-[#f0f2f0] text-[#4a544b] font-bold text-xs border-b border-slate-300">
                    <th className="border border-slate-300 p-2.5 text-left w-2/5">학교 / 교육기관명</th>
                    <th className="border border-slate-300 p-2.5 text-center w-1/5">구분</th>
                    <th className="border border-slate-300 p-2.5 text-left w-2/5">기간</th>
                  </tr>
                </thead>
                <tbody>
                  {eduList.map((edu, idx) => (
                    <tr key={edu.id || idx}>
                      <td className="border border-slate-300 p-2.5 font-bold text-slate-900">
                        {edu.schoolName || '미입력'}
                      </td>
                      <td className="border border-slate-300 p-2.5 text-center font-semibold text-slate-700">
                        {edu.graduationStatus || '졸업'}
                      </td>
                      <td className="border border-slate-300 p-2.5 text-slate-600">
                        {edu.period || '미입력'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 bg-[#f8f7f2] border border-[#e8e6df] rounded-xl text-center text-xs text-[#8e8d88] font-medium">
                작성된 학력 및 교육 이수 사항이 없습니다.
              </div>
            )}
          </div>

          {/* Section 4: 경력 및 봉사 활동 (Work Experiences) */}
          <div className="mb-6">
            <h3 className="text-base font-extrabold text-[#2d332e] border-l-4 border-[#7a8d7c] pl-2 mb-3">
              일했던 경험 및 봉사 활동
            </h3>
            {experiences && experiences.length > 0 ? (
              <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead>
                  <tr className="bg-[#f0f2f0] text-[#4a544b] font-bold text-xs border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-left w-[22%]">기관 / 직장명</th>
                    <th className="border border-slate-300 p-2 text-left w-[18%]">담당 업무</th>
                    <th className="border border-slate-300 p-2 text-left w-[18%]">근무 기간</th>
                    <th className="border border-slate-300 p-2 text-left w-[24%]">활동 설명</th>
                    <th className="border border-slate-300 p-2 text-left w-[18%]">퇴사 / 종료 사유</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.map((exp) => (
                    <tr key={exp.id}>
                      <td className="border border-slate-300 p-2 font-bold text-slate-900">{exp.title || '-'}</td>
                      <td className="border border-slate-300 p-2 text-slate-800">{exp.role || '-'}</td>
                      <td className="border border-slate-300 p-2 text-slate-600">{exp.period || '-'}</td>
                      <td className="border border-slate-300 p-2 text-slate-700 text-xs">{exp.description || '-'}</td>
                      <td className="border border-slate-300 p-2 text-slate-700 text-xs">{exp.leaveReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 bg-[#f8f7f2] border border-[#e8e6df] rounded-xl text-center text-xs text-[#8e8d88] font-medium">
                작성된 관련 경력 사항이 없습니다.
              </div>
            )}
          </div>

          {/* Section 4: 나의 장점 및 자기소개 (Strengths) */}
          <div className="mb-6">
            <h3 className="text-base font-extrabold text-[#2d332e] border-l-4 border-[#7a8d7c] pl-2 mb-3">
              나의 장점 및 자기소개
            </h3>
            <div className="space-y-3">
              {strength.tags && strength.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {strength.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#f0f2f0] text-[#4a544b] border border-[#7a8d7c]/30 text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                    >
                      <span className="text-[#7a8d7c]">✓</span> {tag}
                    </span>
                  ))}
                </div>
              )}

              {strength.myStory ? (
                <div className="p-4 bg-[#f8f7f2] border border-[#e8e6df] rounded-xl text-sm leading-relaxed text-[#2d332e] whitespace-pre-wrap font-medium">
                  {strength.myStory}
                </div>
              ) : (
                <div className="p-3 bg-[#f8f7f2] border border-[#e8e6df] rounded-xl text-xs text-[#8e8d88] italic">
                  자기소개 문장을 작성하면 이곳에 출력됩니다.
                </div>
              )}
            </div>
          </div>

          {/* Section 6: 일할 때 필요한 배려 및 특기 (Support & Accommodations) */}
          <div className="mb-8">
            <h3 className="text-base font-extrabold text-[#2d332e] border-l-4 border-[#7a8d7c] pl-2 mb-3">
              일할 때 도움이 필요한 점 및 특기
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-[#f8f7f2] border border-[#e8e6df] rounded-xl">
                <span className="text-xs font-bold text-[#7a8d7c] block mb-1">
                  🤝 배려 및 지원 요청 사항
                </span>
                <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {accommodations.supportNeeded || '원활한 소통과 배려 속에 최선을 다하겠습니다.'}
                </p>
              </div>

              <div className="p-4 bg-[#f8f7f2] border border-[#e8e6df] rounded-xl">
                <span className="text-xs font-bold text-[#8e8d88] block mb-1">
                  🎨 취미 및 특기
                </span>
                <p className="text-slate-800 text-xs font-medium">
                  {accommodations.hobbies || '미입력'}
                </p>
              </div>
            </div>
          </div>

          {/* Document Footer Signature */}
          <div className="pt-8 border-t border-slate-300 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">
              작성일 : {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm font-semibold text-slate-800">
              위 사실은 틀림이 없음을 확인합니다.
            </p>
            <p className="text-base font-extrabold text-slate-900 pt-1">
              지원자 : <span className="underline underline-offset-4 decoration-2 decoration-[#7a8d7c] font-black">{personal.name || '홍길동'}</span> (서명 또는 인)
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
