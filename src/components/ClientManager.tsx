/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client, PurdueTest, ERSTest, TrainingClassType } from '../types';
import {
  CLASS_MAJOR_SUBJECTS,
  ALL_TRAINING_SUBJECTS,
  validateSubjectSelection,
} from '../data/evaluationConstants';
import {
  calculateServiceEndDate,
  calculate4YearEndDate,
  formatServicePeriod,
  getEffectiveExtensionCount,
  getServicePeriodLabel,
  EXTENSION_OPTIONS,
} from '../utils/yearHelper';
import {
  User,
  Search,
  UserPlus,
  Calendar,
  Award,
  ChevronRight,
  Sparkles,
  LogIn,
  Trash2,
  ClipboardList,
  Share2,
  Database,
  Copy,
  Check,
  Upload,
  Download,
  FileSpreadsheet,
  Eye,
  EyeOff,
  ArrowLeft,
  Clock,
  PlusCircle,
  RotateCw
} from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  purdueTests: PurdueTest[];
  ersTests: ERSTest[];
  onSelectClient: (client: Client) => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onDeleteClient: (id: string) => void;
  onOpenSituationEval?: () => void;
}

export default function ClientManager({
  clients,
  purdueTests,
  ersTests,
  onSelectClient,
  onAddClient,
  onDeleteClient,
  onOpenSituationEval,
}: ClientManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // View Page Mode: 'list' | 'register' | 'backup'
  const [pageMode, setPageMode] = useState<'list' | 'register' | 'backup'>('list');
  
  // App Sharing copy state
  const [sharedUrlCopied, setSharedUrlCopied] = useState(false);
  const [gasCodeCopied, setGasCodeCopied] = useState(false);

  // Google Sheets Apps Script Sync state
  const [appsScriptUrl, setAppsScriptUrl] = useState(() => {
    return localStorage.getItem('rehab_apps_script_url') || '';
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [showGasCode, setShowGasCode] = useState(false);

  // Registration Form States
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [diagnosis, setDiagnosis] = useState('');
  const [handDominance, setHandDominance] = useState<'R' | 'L' | 'Ambi'>('R');
  const [userType, setUserType] = useState<'신규' | '기존'>('기존');
  const [memos, setMemos] = useState('');
  const [trainingClass, setTrainingClass] = useState<TrainingClassType>('문화예술반');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['AI샌드아트', '미술', '공예']);
  const [serviceStartDate, setServiceStartDate] = useState('');
  const [serviceEndDate, setServiceEndDate] = useState('');
  const [serviceExtensionCount, setServiceExtensionCount] = useState(0);
  const [formError, setFormError] = useState('');

  // Trainee category filter
  const [filterUserType, setFilterUserType] = useState<'ALL' | '기존' | '신규'>('ALL');

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterUserType === '신규') return c.userType === '신규';
    if (filterUserType === '기존') return c.userType !== '신규';
    return true;
  });

  const countTotal = clients.length;
  const countExisting = clients.filter(c => c.userType !== '신규').length;
  const countNew = clients.filter(c => c.userType === '신규').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) {
      setFormError('이름과 생년월일은 필수 입력사항입니다.');
      return;
    }

    const val = validateSubjectSelection(trainingClass, selectedSubjects);
    if (!val.valid) {
      setFormError(val.message || '과목 선택 조건을 확인해 주세요.');
      return;
    }
    
    onAddClient({
      name,
      birthDate,
      gender,
      diagnosis,
      handDominance,
      userType,
      trainingClass,
      selectedSubjects,
      serviceStartDate: serviceStartDate || undefined,
      serviceEndDate: serviceStartDate ? (serviceEndDate || calculateServiceEndDate(serviceStartDate, serviceExtensionCount)) : undefined,
      serviceExtensionCount: serviceStartDate ? serviceExtensionCount : undefined,
      memos,
    });

    // Reset form field states
    setName('');
    setBirthDate('');
    setGender('M');
    setDiagnosis('');
    setHandDominance('R');
    setUserType('기존');
    setTrainingClass('문화예술반');
    setSelectedSubjects(['AI샌드아트', '미술', '공예']);
    setServiceStartDate('');
    setServiceEndDate('');
    setServiceExtensionCount(0);
    setMemos('');
    setFormError('');
    setPageMode('list');
  };

  // Copy sharing URL
  const handleCopySharedUrl = () => {
    const shareUrl = "https://ais-pre-cfg2ef7zu3hsmjjihvqfnt-368891413016.asia-northeast1.run.app";
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSharedUrlCopied(true);
      setTimeout(() => setSharedUrlCopied(false), 2000);
    });
  };

  // Copy Google Apps Script code
  const handleCopyGasCode = () => {
    const gasCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. 등록 대상자 시트 기록
    var clientSheet = ss.getSheetByName("등록 대상자") || ss.insertSheet("등록 대상자");
    clientSheet.clear();
    clientSheet.appendRow(["대상자 ID", "이름", "생년월일", "성별", "우세손", "장애유형 및 코드", "참고메모", "동기화등록일자"]);
    if (data.clients && data.clients.length > 0) {
      data.clients.forEach(function(c) {
        clientSheet.appendRow([
          c.id, 
          c.name, 
          c.birthDate, 
          c.gender === "M" ? "남성" : "여성", 
          c.handDominance === "R" ? "오른손잡이" : c.handDominance === "L" ? "왼손잡이" : "양손잡이", 
          c.diagnosis, 
          c.memos, 
          c.createdAt
        ]);
      });
    }
    
    // 2. 퍼듀펙보드 결과 시트 기록
    var purdueSheet = ss.getSheetByName("퍼듀펙보드 결과") || ss.insertSheet("퍼듀펙보드 결과");
    purdueSheet.clear();
    purdueSheet.appendRow(["검사 ID", "대상자 ID", "검사일자", "우세손 규준", "오른손 점수", "왼손 점수", "양손 점수", "복합 조립 점수", "평가사", "특이사항"]);
    if (data.purdueTests && data.purdueTests.length > 0) {
      data.purdueTests.forEach(function(t) {
        purdueSheet.appendRow([
          t.id, 
          t.clientId, 
          t.testDate, 
          t.normType || "기본", 
          t.rightHand, 
          t.leftHand, 
          t.bothHands, 
          t.assembly, 
          t.evaluatorName, 
          t.notes
        ]);
      });
    }
    
    // 3. ERS 평가 결과 시트 기록
    var ersSheet = ss.getSheetByName("ERS 평가 결과") || ss.insertSheet("ERS 평가 결과");
    ersSheet.clear();
    ersSheet.appendRow(["검사 ID", "대상자 ID", "검사일자", "총점", "평균점수", "종합 등급판정", "평가사", "특이사항"]);
    if (data.ersTests && data.ersTests.length > 0) {
      data.ersTests.forEach(function(t) {
        ersSheet.appendRow([
          t.id, 
          t.clientId, 
          t.testDate, 
          t.totalScore, 
          t.averageScore, 
          t.interpretation || "", 
          t.evaluatorName, 
          t.notes
        ]);
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "구글 시트 백업이 성공적으로 동기화되었습니다."}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(gasCode).then(() => {
      setGasCodeCopied(true);
      setTimeout(() => setGasCodeCopied(false), 2000);
    });
  };

  // 1. JSON Export
  const downloadBackupJSON = () => {
    const backupData = {
      clients,
      purdueTests,
      ersTests,
      backupVersion: "1.0",
      backedUpAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `swrehab_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. JSON Import
  const handleUploadBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.clients || parsed.purdueTests || parsed.ersTests)) {
            if (confirm("이 백업 파일을 불러오시겠습니까? 기존에 존재하던 모든 대상자 정보와 평가 기록이 이 백업 파일 내용으로 대체(원복)됩니다.")) {
              localStorage.setItem('rehab_clients', JSON.stringify(parsed.clients || []));
              localStorage.setItem('rehab_purdue_tests', JSON.stringify(parsed.purdueTests || []));
              localStorage.setItem('rehab_ers_tests', JSON.stringify(parsed.ersTests || []));
              alert("백업 복원이 완료되었습니다. 변경사항을 적용하기 위해 페이지를 새로고침합니다.");
              window.location.reload();
            }
          } else {
            alert("유효한 백업 파일 형식이 아닙니다.");
          }
        } catch (err) {
          alert("파일 분석 중 오류가 발생했습니다.");
        }
      };
    }
  };

  // 3. Tabular CSV Exports
  const downloadClientsCSV = () => {
    if (clients.length === 0) {
      alert("내보낼 대상자가 없습니다.");
      return;
    }
    const headers = ["ID", "이름", "생년월일", "성별", "우세손", "장애유형", "훈련반", "이용시작일", "이용종료일", "연장차수", "이용기간(총연수)", "참고메모", "등록일"];
    const rows = clients.map(c => {
      const extCount = getEffectiveExtensionCount(c.serviceStartDate, c.serviceEndDate, c.serviceExtensionCount);
      return [
        c.id, c.name, c.birthDate, c.gender === 'M' ? '남성' : '여성', c.handDominance === 'R' ? '오른손잡이' : c.handDominance === 'L' ? '왼손잡이' : '양손잡이', c.diagnosis, c.trainingClass || '', c.serviceStartDate || '', c.serviceEndDate || '', extCount > 0 ? `${extCount}차 연장` : '기본(연장없음)', formatServicePeriod(c.serviceStartDate, c.serviceEndDate, c.serviceExtensionCount), (c.memos || '').replace(/\n/g, ' '), c.createdAt
      ];
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `swrehab_clients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadPurdueCSV = () => {
    if (purdueTests.length === 0) {
      alert("내보낼 퍼듀 평가 기록이 없습니다.");
      return;
    }
    const headers = ["평가ID", "훈련생ID", "훈련생이름", "평가일자", "우세손기준", "오른손점수", "왼손점수", "양손점수", "조립결과", "평가사", "특이사항"];
    const rows = purdueTests.map(t => {
      const client = clients.find(c => c.id === t.clientId);
      return [
        t.id, t.clientId, client ? client.name : '삭제된대상', t.testDate, t.normType || "기본", t.rightHand, t.leftHand, t.bothHands, t.assembly, t.evaluatorName, (t.notes || '').replace(/\n/g, ' ')
      ];
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `swrehab_purdue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadErsCSV = () => {
    if (ersTests.length === 0) {
      alert("내보낼 ERS 평가 기록이 없습니다.");
      return;
    }
    const headers = ["평가ID", "훈련생ID", "훈련생이름", "평가일자", "총점", "평균점수", "등급판정", "평가사", "특이사항"];
    const rows = ersTests.map(t => {
      const client = clients.find(c => c.id === t.clientId);
      return [
        t.id, t.clientId, client ? client.name : '삭제된대상', t.testDate, t.totalScore, t.averageScore, t.interpretation || '', t.evaluatorName, (t.notes || '').replace(/\n/g, ' ')
      ];
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `swrehab_ers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 4. Live fetch POST to Apps Script Webapp URL
  const handleSyncToGoogleSheets = async () => {
    if (!appsScriptUrl) {
      alert("구글 Apps Script 웹앱 URL을 입력해주십시오.");
      return;
    }
    setSyncStatus('syncing');
    setSyncMessage('구글 시트 백업 데이터를 인코딩하여 즉시 실시간 전송 중입니다...');
    
    try {
      const payload = {
        clients,
        purdueTests,
        ersTests,
        syncedAt: new Date().toISOString()
      };
      
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      setSyncStatus('success');
      setSyncMessage('구글 스프레드시트로 동기화 백업이 즉시 송신 완료되었습니다!');
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(`연동 실패: ${err.message || '인터넷 연결 상태나 웹앱 URL 주소를 재확인해주십시오.'}`);
    }
  };

  const handleSaveAppsScriptUrl = (url: string) => {
    setAppsScriptUrl(url);
    localStorage.setItem('rehab_apps_script_url', url);
  };

  return (
    <div id="client-directory-manager" className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
      
      {/* 1. LIST PAGE MODE */}
      {pageMode === 'list' && (
        <div className="space-y-6">
          {/* Main Top Header Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white border border-slate-200 rounded-3xl p-6 gap-4 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-600" />
                능력개발지원팀 직업적응훈련반
              </h2>
              <p className="text-xs text-slate-500">
                수원시장애인종합복지관 직업재활 평가 시스템에 등록된 훈련생 명단입니다. 훈련생을 선택하거나 우측 상단 버튼을 통해 신규 대상자를 등록하십시오.
              </p>
            </div>
            
            {/* Top Right Actions Area */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <input
                  id="manager-search"
                  type="text"
                  placeholder="이름, 장애유형 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>

              {/* Situation Evaluation Button */}
              {onOpenSituationEval && (
                <button
                  id="btn-open-situation-eval"
                  onClick={onOpenSituationEval}
                  className="py-2.5 px-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  신규 훈련생 상황/종합평가
                </button>
              )}

              {/* Data Backup & Google Sync Button */}
              <button
                id="btn-goto-backup"
                onClick={() => setPageMode('backup')}
                className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200/80 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Database className="h-4 w-4 text-teal-600" />
                백업 & 구글 연동
              </button>

              {/* REGISTER NEW TRAINEE BUTTON (Main Top Right Button) */}
              <button
                id="btn-open-register-page"
                onClick={() => setPageMode('register')}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-200 hover:shadow-indigo-300"
              >
                <UserPlus className="h-4 w-4" />
                신규 대상자 등록
              </button>
            </div>
          </div>

          {/* Client Cards Section */}
          <section className="space-y-4">
            {/* Filter and Count Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">분류 필터:</span>
                <button
                  type="button"
                  id="filter-all-trainees"
                  onClick={() => setFilterUserType('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterUserType === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  전체 ({countTotal})
                </button>
                <button
                  type="button"
                  id="filter-existing-trainees"
                  onClick={() => setFilterUserType('기존')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterUserType === '기존'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  기존 훈련생 ({countExisting})
                </button>
                <button
                  type="button"
                  id="filter-new-trainees"
                  onClick={() => setFilterUserType('신규')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterUserType === '신규'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  신규 훈련생 ({countNew})
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-400 hidden lg:inline">
                훈련생 명단 카드를 선택하면 개별 평가 대시보드로 진입합니다.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.length === 0 ? (
                <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                    <ClipboardList className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-800 mb-1">등록되었거나 검색 조건에 일치하는 대상자가 없습니다</h4>
                    <p className="text-xs text-slate-400">오른쪽 상단의 <span className="font-bold text-indigo-600">'신규 대상자 등록'</span> 버튼을 눌러 평가 대상 훈련생을 기재해 주십시오.</p>
                  </div>
                  <button
                    onClick={() => setPageMode('register')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all"
                  >
                    <UserPlus className="h-4 w-4" />
                    신규 대상자 등록하기
                  </button>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const pTests = purdueTests.filter(t => t.clientId === client.id);
                  const eTests = ersTests.filter(t => t.clientId === client.id);
                  
                  return (
                    <div
                      id={`directory-card-${client.id}`}
                      key={client.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 shadow-sm group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="font-extrabold text-base text-slate-800">{client.name}</h4>
                                
                                {/* Trainee userType badge */}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                    client.userType === '신규'
                                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {client.userType === '신규' ? '✨ 신규' : '기존'}
                                </span>

                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-bold text-slate-600">
                                  {client.gender === 'M' ? '남성' : '여성'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono block mt-0.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3 inline" />
                                {client.birthDate}
                              </span>
                            </div>
                          </div>

                          {/* Quick Delete */}
                          <button
                            id={`del-client-dir-${client.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`${client.name} 의 정보를 삭제하시겠습니까? 관련된 기민성 및 ERS 평가 기록이 함께 전량 소거됩니다.`)) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-colors"
                            title="대상자 삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Class, Subject, Hand dominance badge & Diagnosis */}
                        <div className="space-y-2 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-xs">
                          {/* Training Class Badge */}
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-600 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                              소속 훈련반:
                            </span>
                            {client.trainingClass ? (
                              <span
                                className={`font-extrabold px-2.5 py-0.5 rounded-lg text-[11px] border ${
                                  client.trainingClass === '문화예술반'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-teal-50 text-teal-700 border-teal-200'
                                }`}
                              >
                                {client.trainingClass === '문화예술반' ? '🎨 문화예술반' : '🤖 스마트산업반'}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[11px]">미지정</span>
                            )}
                          </div>

                          {/* Selected 3 Subjects */}
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              수강 과목 (3개):
                            </span>
                            {client.selectedSubjects && client.selectedSubjects.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {client.selectedSubjects.map((subj, sIdx) => {
                                  const isMajor = client.trainingClass
                                    ? CLASS_MAJOR_SUBJECTS[client.trainingClass]?.includes(subj)
                                    : false;
                                  return (
                                    <span
                                      key={sIdx}
                                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                        isMajor
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                          : 'bg-amber-50 text-amber-800 border-amber-200'
                                      }`}
                                    >
                                      {subj}
                                      <span className="ml-1 text-[9px] opacity-75 font-normal">
                                        ({isMajor ? '전공' : '비전공'})
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">미선택</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200/60">
                            <span className="font-bold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              우세손:
                            </span>
                            <span className="font-extrabold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-lg border border-indigo-100">
                              {client.handDominance === 'R' ? '오른손잡이 (Right)' : client.handDominance === 'L' ? '왼손잡이 (Left)' : '양손잡이 (Ambi)'}
                            </span>
                          </div>

                          {/* 훈련반 이용기간 & 연장차수 */}
                          <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200/60">
                            <span className="font-bold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-emerald-600" />
                              이용기간:
                            </span>
                            {client.serviceStartDate ? (
                              <div className="text-right">
                                <span className="font-mono text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 block">
                                  {formatServicePeriod(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount)}
                                </span>
                                {getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount) > 0 && (
                                  <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    ⚡ {getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount)}차 연장 (+4년 추가)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium">이용기간 미입력</span>
                            )}
                          </div>
                          
                          <div className="text-slate-600 font-medium">
                            <span className="font-bold text-slate-500">장애유형: </span>
                            <span className="text-slate-800 font-extrabold">{client.diagnosis || '미기재'}</span>
                          </div>

                          {client.memos && (
                            <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1 border-t border-slate-200/60 mt-1">
                              "{client.memos}"
                            </div>
                          )}
                        </div>

                        {/* Cumulative Test Counts */}
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1 pt-1">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/70">
                            퍼듀 누적: <span className="text-indigo-650 font-bold">{pTests.length}회</span>
                          </span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/70">
                            ERS 누적: <span className="text-indigo-650 font-bold">{eTests.length}회</span>
                          </span>
                        </div>
                      </div>

                      <button
                        id={`client-direct-workspace-btn-${client.id}`}
                        onClick={() => onSelectClient(client)}
                        className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:bg-indigo-600 group-hover:text-white"
                      >
                        <LogIn className="h-4 w-4" />
                        상세 평가 대시보드 진입
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      {/* 2. DEDICATED NEW TRAINEE REGISTRATION PAGE MODE */}
      {pageMode === 'register' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header Bar with Back Button */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <button
              onClick={() => setPageMode('list')}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              평가대상 명단으로 돌아가기
            </button>
            <span className="text-xs font-bold text-slate-400">신규 훈련생 등록 페이지</span>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserPlus className="h-5 w-5" />
                </div>
                신규 평가대상자 인적사항 등록
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                직업재활 신체 기민성(퍼듀) 및 행동특성(ERS) 평가 진행 전 훈련생 분의 기초 정보를 정확히 입력해 주십시오.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {formError && (
                <div className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-150 p-3 rounded-2xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    훈련생 성명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium bg-slate-50/30"
                  />
                </div>

                <div>
                  <label htmlFor="reg-birth" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    생년월일 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-birth"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono bg-slate-50/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    성별 <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex border border-slate-200 rounded-2xl overflow-hidden p-1 bg-slate-50">
                    <button
                      id="reg-gender-m"
                      type="button"
                      onClick={() => setGender('M')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                        gender === 'M' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      남성 (Male)
                    </button>
                    <button
                      id="reg-gender-f"
                      type="button"
                      onClick={() => setGender('F')}
                      className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                        gender === 'F' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      여성 (Female)
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-dominance" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    주용제 / 우세손 (Dominant Hand) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="reg-dominance"
                    value={handDominance}
                    onChange={(e) => setHandDominance(e.target.value as any)}
                    className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium"
                  >
                    <option value="R">오른손잡이 (Dominant Right)</option>
                    <option value="L">왼손잡이 (Dominant Left)</option>
                    <option value="Ambi">양손잡이 (Ambidextrous)</option>
                  </select>
                </div>
              </div>

              {/* 훈련반 이용기간 (4년 단위 및 연장 관리) */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>훈련반 이용기간 <span className="text-emerald-700 font-bold">(4년 기본 + 연장 시 4년씩 추가)</span></span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = serviceExtensionCount + 1;
                        setServiceExtensionCount(newCount);
                        if (serviceStartDate) {
                          setServiceEndDate(calculateServiceEndDate(serviceStartDate, newCount));
                        }
                      }}
                      className="text-[11px] font-bold text-emerald-700 bg-white hover:bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="h-3 w-3 text-emerald-600" />
                      +4년 연장 추가
                    </button>
                    {serviceExtensionCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newCount = Math.max(0, serviceExtensionCount - 1);
                          setServiceExtensionCount(newCount);
                          if (serviceStartDate) {
                            setServiceEndDate(calculateServiceEndDate(serviceStartDate, newCount));
                          }
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        연장 취소(-4년)
                      </button>
                    )}
                  </div>
                </div>

                {/* 연장 차수 선택 탭 */}
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>이용 연장 차수 선택:</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {serviceExtensionCount === 0 ? '기본 4년 과정' : `현재 ${serviceExtensionCount}차 연장 (+${serviceExtensionCount * 4}년 추가, 총 ${4 * (1 + serviceExtensionCount)}년)`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {EXTENSION_OPTIONS.map((opt) => {
                      const isSelected = serviceExtensionCount === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => {
                            setServiceExtensionCount(opt.count);
                            if (serviceStartDate) {
                              setServiceEndDate(calculateServiceEndDate(serviceStartDate, opt.count));
                            }
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'
                          }`}
                        >
                          {opt.badge}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label htmlFor="reg-service-start" className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      훈련반 이용 시작일
                    </label>
                    <input
                      id="reg-service-start"
                      type="date"
                      value={serviceStartDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setServiceStartDate(val);
                        if (val) {
                          setServiceEndDate(calculateServiceEndDate(val, serviceExtensionCount));
                        } else {
                          setServiceEndDate('');
                        }
                      }}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-service-end" className="block text-[11px] font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                      <span>훈련반 이용 종료일</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        ({serviceExtensionCount === 0 ? '4년 후 자동설정' : `총 ${4 * (1 + serviceExtensionCount)}년 후 자동설정`})
                      </span>
                    </label>
                    <input
                      id="reg-service-end"
                      type="date"
                      value={serviceEndDate}
                      onChange={(e) => setServiceEndDate(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono bg-white"
                    />
                  </div>
                </div>

                {serviceStartDate && (
                  <div className="text-xs font-bold text-emerald-900 bg-white/95 p-2.5 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                      설정된 총 훈련반 이용기간:
                    </span>
                    <span className="font-mono text-emerald-950 font-extrabold text-sm">
                      {formatServicePeriod(serviceStartDate, serviceEndDate, serviceExtensionCount)}
                    </span>
                  </div>
                )}
              </div>

              {/* 훈련생 이용 구분 (신규 입소 vs 기존 계속) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 flex items-center justify-between">
                  <span>훈련생 이용 구분 <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    이용 상태에 따라 평가 진행 절차가 차별화됩니다
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="reg-usertype-existing"
                    onClick={() => setUserType('기존')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      userType === '기존'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${userType === '기존' ? 'bg-white' : 'bg-blue-500'}`}></span>
                        기존 계속 이용 훈련생 (기본값)
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        userType === '기존' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                      }`}>
                        상황평가 생략가능
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${userType === '기존' ? 'text-blue-100' : 'text-slate-500'}`}>
                      이미 이용 중인 훈련생으로, 2주 상황평가를 생략하고 개별파일 및 3대 기초검사·1차 계획서부터 진행합니다.
                    </p>
                  </button>

                  <button
                    type="button"
                    id="reg-usertype-new"
                    onClick={() => setUserType('신규')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                      userType === '신규'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        신규 입소 훈련생
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        userType === '신규' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'
                      }`}>
                        초기 2주 평가 필수
                      </span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${userType === '신규' ? 'text-amber-100' : 'text-slate-500'}`}>
                      새로 입소한 훈련생으로, 초기 2주 상황평가일지(10일분) 및 직업평가 종합평가기록부를 필수로 거칩니다.
                    </p>
                  </button>
                </div>
              </div>

              {/* 훈련반 구분 & 수강 과목 3가지 선택 */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-150 rounded-2xl space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>소속 훈련반 선택 <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      문화예술반 또는 스마트산업반 중 택 1
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="reg-class-culture"
                      onClick={() => {
                        setTrainingClass('문화예술반');
                        const currentMajors = selectedSubjects.filter(s => CLASS_MAJOR_SUBJECTS['문화예술반'].includes(s));
                        if (currentMajors.length < 2) {
                          setSelectedSubjects(['AI샌드아트', '미술', '공예']);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        trainingClass === '문화예술반'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      🎨 문화예술반
                    </button>
                    <button
                      type="button"
                      id="reg-class-smart"
                      onClick={() => {
                        setTrainingClass('스마트산업반');
                        const currentMajors = selectedSubjects.filter(s => CLASS_MAJOR_SUBJECTS['스마트산업반'].includes(s));
                        if (currentMajors.length < 2) {
                          setSelectedSubjects(['AI전자작가', '스마트팜', '사무보조']);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        trainingClass === '스마트산업반'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      🤖 스마트산업반
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                    <label className="text-xs font-extrabold text-slate-800">
                      수강 과목 선택 <span className="text-rose-500">*</span> (3개 필수 선택)
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      [{trainingClass}] 전공 최소 2개 + 1개 추가 (전공/비전공)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_TRAINING_SUBJECTS.map((subj) => {
                      const isMajor = CLASS_MAJOR_SUBJECTS[trainingClass].includes(subj);
                      const isSelected = selectedSubjects.includes(subj);

                      return (
                        <button
                          key={subj}
                          type="button"
                          id={`reg-subject-${subj}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedSubjects(prev => prev.filter(s => s !== subj));
                            } else {
                              if (selectedSubjects.length >= 3) {
                                alert('수강 과목은 최대 3가지만 선택할 수 있습니다. 변경하려면 먼저 다른 과목을 해제하세요.');
                                return;
                              }
                              setSelectedSubjects(prev => [...prev, subj]);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{subj}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : isMajor
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isMajor ? '전공' : '비전공'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Realtime Selection Feedback */}
                  <div className="mt-2.5 text-[11px] font-semibold text-slate-600 flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span>
                      현재 선택: <strong className="text-indigo-700">{selectedSubjects.join(', ') || '없음'}</strong> ({selectedSubjects.length}/3개)
                    </span>
                    {selectedSubjects.length === 3 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        ✓ 3가지 과목 선택 완료
                      </span>
                    ) : (
                      <span className="text-rose-500 font-bold">
                        {3 - selectedSubjects.length}개 과목 추가 선택 필요
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-diagnosis" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  장애유형 및 진단명 / 특이사항 코드
                </label>
                <input
                  id="reg-diagnosis"
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="예: 지체장애 우측 편마비, 지적장애 2급, 뇌병변장애 등"
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium bg-slate-50/30"
                />
              </div>

              <div>
                <label htmlFor="reg-memos" className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  훈련생 개별 훈련 욕구 및 참고 메모
                </label>
                <textarea
                  id="reg-memos"
                  value={memos}
                  onChange={(e) => setMemos(e.target.value)}
                  placeholder="훈련생 분의 특성, 직업적 희망 욕구, 우세손 관련 관찰 사항 등을 기재해 주십시오."
                  rows={4}
                  className="w-full text-sm px-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium bg-slate-50/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPageMode('list')}
                  className="py-3 px-6 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  취소
                </button>
                <button
                  id="submit-register-btn"
                  type="submit"
                  className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  신규 평가대상 정보 등록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BACKUP & GOOGLE SHEETS SYNC PAGE MODE */}
      {pageMode === 'backup' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Top Back Navigation Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <button
              onClick={() => setPageMode('list')}
              className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              평가대상 명단으로 돌아가기
            </button>
            <span className="text-xs font-bold text-slate-400">데이터 백업 & 연동 센터</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. App Sharing & Local File Backup */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-indigo-600" />
                  시스템 주소 공유 및 안전 로컬 백업
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  외부 기기 공유 URL 및 파일 단위 종합 백업 기능을 제공합니다.
                </p>
              </div>

              {/* App Share URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">시스템 전용 공유 URL</label>
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-indigo-950 truncate">
                    https://ais-pre-cfg2ef7zu3hsmjjihvqfnt-368891413016.asia-northeast1.run.app
                  </span>
                  <button
                    onClick={handleCopySharedUrl}
                    className="p-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors shrink-0"
                    title="주소 복사"
                  >
                    {sharedUrlCopied ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* JSON Local Backup & Restore */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">전체 평가 데이터 백업 & 원복</label>
                <p className="text-xs text-slate-500 leading-relaxed">
                  PC 교체나 데이터 유실에 대비하여 대상자 인적사항 및 퍼듀/ERS 누적 평가 전체를 안전 백업 파일(.json)로 저장하거나 불러올 수 있습니다.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadBackupJSON}
                    className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download className="h-4 w-4" />
                    내 컴퓨터로 백업
                  </button>
                  <label className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm cursor-pointer text-center transition-all">
                    <Upload className="h-4 w-4" />
                    백업 복원하기
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleUploadBackupJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* CSV Exports */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">구글 시트 / 엑셀 직접 등록용 CSV</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={downloadClientsCSV}
                    className="w-full py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center justify-between transition-colors shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                      1. 평가대상 일괄 명단 CSV 다운로드
                    </span>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={downloadPurdueCSV}
                    className="w-full py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center justify-between transition-colors shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      2. 퍼듀펙보드 점수기록 CSV 다운로드
                    </span>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={downloadErsCSV}
                    className="w-full py-2 px-3 border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold rounded-xl flex items-center justify-between transition-colors shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-rose-600" />
                      3. ERS 직업적응 행동특성 CSV 다운로드
                    </span>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Google Sheets Apps Script Sync */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                  구글 스프레드시트 실시간 원클릭 동기화 (GAS)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  구글 Apps Script 웹앱 URL을 연동하여 버튼 한 번으로 클라우드 시트에 백업합니다.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="gas-url-input" className="block text-xs font-extrabold text-slate-700 mb-1">
                    Apps Script 배포 웹앱 URL
                  </label>
                  <input
                    id="gas-url-input"
                    type="url"
                    value={appsScriptUrl}
                    onChange={(e) => handleSaveAppsScriptUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono bg-slate-50/50"
                  />
                </div>

                <button
                  onClick={handleSyncToGoogleSheets}
                  disabled={syncStatus === 'syncing'}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {syncStatus === 'syncing' ? '구글 시트로 백업 전송 중...' : '구글 스프레드시트로 전체 데이터 동기화'}
                </button>

                {syncMessage && (
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                    syncStatus === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold' :
                    syncStatus === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {syncMessage}
                  </div>
                )}
              </div>

              {/* GAS Code View Accordion */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowGasCode(!showGasCode)}
                  className="w-full p-3 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between font-extrabold"
                >
                  <span>구글 Apps Script 연동 설명 및 코드 보기</span>
                  {showGasCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                {showGasCode && (
                  <div className="p-4 border-t border-slate-200 bg-white space-y-3 text-xs text-slate-600 leading-relaxed">
                    <p className="font-extrabold text-indigo-950">연동 방법 순서:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                      <li>새 구글 스프레드시트를 생성합니다.</li>
                      <li>시트 상단 메뉴에서 <span className="font-bold text-indigo-900">확장 프로그램 {'>'} Apps Script</span>에 들어갑니다.</li>
                      <li>아래 '스크립트 코드 복사' 버튼을 눌러 스크립트를 전체 복사해 붙여넣습니다.</li>
                      <li>우측 상단의 <span className="font-bold text-emerald-700">배포 {'>'} 새 배포</span>를 클릭합니다.</li>
                      <li>유형 선택에서 <span className="font-bold text-indigo-900">웹 앱</span>을 선택합니다.</li>
                      <li>액세스 권한을 <span className="font-extrabold text-indigo-900">모든 사용자(Anyone)</span>로 설정하여 배포한 후 발급된 URL을 위 입력 칸에 저장합니다.</li>
                    </ol>

                    <button
                      onClick={handleCopyGasCode}
                      className="w-full py-2 border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      {gasCodeCopied ? (
                        <>
                          <Check className="h-4 w-4 text-teal-600" />
                          코드 복사 완료!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          스프레드시트 스크립트 코드 복사
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

