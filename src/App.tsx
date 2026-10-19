/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, PurdueTest, ERSTest, BasicAcademicTest, PictureInterestPDF, IndividualizedServicePlan } from './types';
import { loadPictureInterestPdfs, savePictureInterestPdfs } from './utils/pdfStorage';
import ClientManager from './components/ClientManager';
import ClientWorkspace from './components/ClientWorkspace';
import PurdueForm from './components/PurdueForm';
import PurdueReport from './components/PurdueReport';
import ERSForm from './components/ERSForm';
import ERSReport from './components/ERSReport';
import BasicAcademicForm from './components/BasicAcademicForm';
import BasicAcademicReport from './components/BasicAcademicReport';
import SituationEvaluationManager from './components/SituationEvaluationManager';
import SemesterEvaluationPage from './components/SemesterEvaluationPage';
import { ClipboardList, LayoutDashboard, Activity, Sparkles, FileSpreadsheet, BookOpen, TrendingUp } from 'lucide-react';

// Default empty array as we are deleting default trainees: 김우석, 박다영, 최윤호
const DEFAULT_CLIENTS: Client[] = [];
const DEFAULT_PURDUE_TESTS: PurdueTest[] = [];
const DEFAULT_ERS_TESTS: ERSTest[] = [];


export default function App() {
  // Initialization of states from LocalStorage or Fallbacks
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('rehab_clients');
    const parsed: Client[] = saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
    // Filter out 김우석, 박다영, 최윤호 to delete them
    return parsed.filter(c => c.name !== '김우석' && c.name !== '박다영' && c.name !== '최윤호');
  });

  const [purdueTests, setPurdueTests] = useState<PurdueTest[]>(() => {
    const isCleared = localStorage.getItem('rehab_purdue_tests_cleared_v4');
    if (!isCleared) {
      localStorage.setItem('rehab_purdue_tests_cleared_v4', 'true');
      localStorage.setItem('rehab_purdue_tests', JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem('rehab_purdue_tests');
    const parsed: PurdueTest[] = saved ? JSON.parse(saved) : DEFAULT_PURDUE_TESTS;
    // Filter out associated mock tests
    return parsed.filter(t => t.clientId !== 'client_1' && t.clientId !== 'client_2' && t.clientId !== 'client_3');
  });

  const [ersTests, setErsTests] = useState<ERSTest[]>(() => {
    const isCleared = localStorage.getItem('rehab_ers_tests_cleared_v4');
    if (!isCleared) {
      localStorage.setItem('rehab_ers_tests_cleared_v4', 'true');
      localStorage.setItem('rehab_ers_tests', JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem('rehab_ers_tests');
    const parsed: ERSTest[] = saved ? JSON.parse(saved) : DEFAULT_ERS_TESTS;
    // Filter out associated mock tests
    return parsed.filter(t => t.clientId !== 'client_1' && t.clientId !== 'client_2' && t.clientId !== 'client_3');
  });

  const [basicAcademicTests, setBasicAcademicTests] = useState<BasicAcademicTest[]>(() => {
    const saved = localStorage.getItem('rehab_academic_tests');
    return saved ? JSON.parse(saved) : [];
  });

  const [iwpPlans, setIwpPlans] = useState<IndividualizedServicePlan[]>(() => {
    const saved = localStorage.getItem('rehab_iwp_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [pictureInterestPdfs, setPictureInterestPdfs] = useState<PictureInterestPDF[]>([]);

  // Load Picture Interest PDFs from IndexedDB / Storage on startup
  useEffect(() => {
    loadPictureInterestPdfs().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setPictureInterestPdfs(loaded);
      }
    });
  }, []);

  const [selectedClient, setSelectedClient] = useState<Client | null>(() => {
    const saved = localStorage.getItem('rehab_clients');
    const parsed: Client[] = saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
    const filtered = parsed.filter(c => c.name !== '김우석' && c.name !== '박다영' && c.name !== '최윤호');
    return filtered.length > 0 ? filtered[0] : null;
  });

  // Navigation Routing States
  // 'clients' | 'workspace' | 'purdue_form' | 'ers_form' | 'purdue_report' | 'ers_report' | 'situation_eval' | 'basic_academic_form' | 'basic_academic_report' | 'semester_eval'
  const [activeRoute, setActiveRoute] = useState<'clients' | 'workspace' | 'purdue_form' | 'ers_form' | 'purdue_report' | 'ers_report' | 'situation_eval' | 'basic_academic_form' | 'basic_academic_report' | 'semester_eval'>('clients');
  const [viewingPurdueTest, setViewingPurdueTest] = useState<PurdueTest | null>(null);
  const [viewingErsTest, setViewingErsTest] = useState<ERSTest | null>(null);
  const [viewingAcademicTest, setViewingAcademicTest] = useState<BasicAcademicTest | null>(null);

  // Sync to database LocalStorage
  useEffect(() => {
    localStorage.setItem('rehab_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('rehab_purdue_tests', JSON.stringify(purdueTests));
  }, [purdueTests]);

  useEffect(() => {
    localStorage.setItem('rehab_ers_tests', JSON.stringify(ersTests));
  }, [ersTests]);

  useEffect(() => {
    localStorage.setItem('rehab_academic_tests', JSON.stringify(basicAcademicTests));
  }, [basicAcademicTests]);

  useEffect(() => {
    localStorage.setItem('rehab_iwp_plans', JSON.stringify(iwpPlans));
  }, [iwpPlans]);

  useEffect(() => {
    savePictureInterestPdfs(pictureInterestPdfs);
  }, [pictureInterestPdfs]);


  // Client Handlers
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...newClientData,
      id: 'client_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setClients(prev => [newClient, ...prev]);
    setSelectedClient(newClient);
    setActiveRoute('workspace');
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    // Cascade delete exams
    setPurdueTests(prev => prev.filter(test => test.clientId !== id));
    setErsTests(prev => prev.filter(test => test.clientId !== id));
    setIwpPlans(prev => prev.filter(plan => plan.clientId !== id));
    
    // Select another client or fallback to empty
    const remaining = clients.filter(c => c.id !== id);
    if (remaining.length > 0) {
      setSelectedClient(remaining[0]);
    } else {
      setSelectedClient(null);
    }
    
    // Move back to main roster directory page
    setActiveRoute('clients');
  };

  // IWP Plan Handlers
  const handleSaveIWPPlan = (plan: IndividualizedServicePlan) => {
    setIwpPlans(prev => {
      const idx = prev.findIndex(p => p.id === plan.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = plan;
        return updated;
      }
      return [plan, ...prev];
    });
  };

  const handleDeleteIWPPlan = (id: string) => {
    setIwpPlans(prev => prev.filter(p => p.id !== id));
  };

  // Purdue Test Handlers
  const handleSavePurdueTest = (newTest: Omit<PurdueTest, 'id' | 'clientId'>) => {
    if (!selectedClient) return;
    
    const testWithId: PurdueTest = {
      ...newTest,
      id: 'purdue_' + Math.random().toString(36).substr(2, 9),
      clientId: selectedClient.id
    };

    setPurdueTests(prev => [testWithId, ...prev]);
    setViewingPurdueTest(testWithId);
    setActiveRoute('purdue_report');
  };

  const handleDeletePurdueTest = (id: string) => {
    setPurdueTests(prev => prev.filter(t => t.id !== id));
  };

  // ERS Test Handlers
  const handleSaveErsTest = (newTest: Omit<ERSTest, 'id' | 'clientId'>) => {
    if (!selectedClient) return;

    const testWithId: ERSTest = {
      ...newTest,
      id: 'ers_' + Math.random().toString(36).substr(2, 9),
      clientId: selectedClient.id
    };

    setErsTests(prev => [testWithId, ...prev]);
    setViewingErsTest(testWithId);
    setActiveRoute('ers_report');
  };

  const handleDeleteErsTest = (id: string) => {
    setErsTests(prev => prev.filter(t => t.id !== id));
  };

  // Basic Academic Test Handlers
  const handleSaveBasicAcademicTest = (newTest: BasicAcademicTest) => {
    setBasicAcademicTests(prev => [newTest, ...prev]);
    setViewingAcademicTest(newTest);
    setActiveRoute('basic_academic_report');
  };

  const handleDeleteBasicAcademicTest = (id: string) => {
    setBasicAcademicTests(prev => prev.filter(t => t.id !== id));
  };

  // Picture Interest PDF Handlers
  const handleSavePictureInterestPdf = (newPdf: PictureInterestPDF) => {
    setPictureInterestPdfs(prev => [newPdf, ...prev]);
  };

  const handleDeletePictureInterestPdf = (id: string) => {
    setPictureInterestPdfs(prev => prev.filter(p => p.id !== id));
  };

  // Filter exams for currently selected patient/client
  const currentPurdueTests = purdueTests.filter(test => test.clientId === selectedClient?.id);
  const currentErsTests = ersTests.filter(test => test.clientId === selectedClient?.id);
  const currentAcademicTests = basicAcademicTests.filter(test => test.clientId === selectedClient?.id);


  return (
    <div id="full-app-container" className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Top Banner Dashboard Title Bar */}
      <header id="rehab-banner-header" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white h-14 shrink-0 flex items-center justify-between px-6 shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
              수원시장애인종합복지관 <span className="font-mono bg-white/10 text-[10px] text-indigo-300 px-1.5 py-0.5 rounded">평가관리 허브</span>
            </h1>
            <p className="text-[10px] text-slate-300">직업적응훈련반 개별화시스템</p>
          </div>
        </div>

        {/* Global Navigation Tabs (Directory Roster vs. Selected Workspace) */}
        <nav className="flex items-center gap-2">
          <button
            id="nav-to-clients"
            onClick={() => setActiveRoute('clients')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
              activeRoute === 'clients'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            능력개발지원팀 직업적응훈련반
          </button>
          
          <button
            id="nav-to-workspace"
            onClick={() => {
              if (selectedClient) {
                setActiveRoute('workspace');
              } else {
                alert('명단(디렉토리)에서 대상자를 먼저 선택해주십시오.');
              }
            }}
            disabled={!selectedClient}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
              !selectedClient
                ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-transparent'
                : activeRoute === 'workspace'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {selectedClient ? `${selectedClient.name} 훈련생 개별파일` : '훈련생 개별파일'}
          </button>

          <button
            id="nav-to-situation-eval"
            onClick={() => setActiveRoute('situation_eval')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
              activeRoute === 'situation_eval'
                ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                : 'bg-amber-500/20 border-amber-400/30 hover:bg-amber-500/30 text-amber-200'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            신규 훈련생 상황/종합평가
          </button>

          <button
            id="nav-to-semester-eval"
            onClick={() => setActiveRoute('semester_eval')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
              activeRoute === 'semester_eval'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30 text-blue-200'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            상·하반기 평가표
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <span className="text-xs text-indigo-200 font-semibold bg-white/5 border border-indigo-400/20 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            직업적응 및 직업훈련 솔루션
          </span>
        </div>
      </header>

      {/* Main Workspace Body Layout */}
      <div id="rehab-layout-grid" className="flex flex-1 overflow-hidden">
        
        {/* Central Pane / Sandbox workspace */}
        <main id="main-content-flow" className="flex-1 flex flex-col overflow-hidden bg-white">
          {activeRoute === 'clients' && (
            <ClientManager
              clients={clients}
              purdueTests={purdueTests}
              ersTests={ersTests}
              onSelectClient={(c) => {
                setSelectedClient(c);
                setActiveRoute('workspace');
              }}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
              onOpenSituationEval={() => setActiveRoute('situation_eval')}
            />
          )}

          {activeRoute === 'situation_eval' && (
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
              <SituationEvaluationManager
                clients={clients}
                selectedClient={selectedClient}
                onSelectClient={(c) => setSelectedClient(c)}
                onBack={() => setActiveRoute(selectedClient ? 'workspace' : 'clients')}
              />
            </div>
          )}

          {activeRoute === 'semester_eval' && (
            <SemesterEvaluationPage
              clients={clients}
              selectedClient={selectedClient}
              onSelectClient={(c) => setSelectedClient(c)}
              iwpPlans={iwpPlans}
              onSaveIWPPlan={handleSaveIWPPlan}
              onBack={() => setActiveRoute(selectedClient ? 'workspace' : 'clients')}
            />
          )}

          {activeRoute !== 'clients' && activeRoute !== 'situation_eval' && activeRoute !== 'semester_eval' && (
            selectedClient ? (
              <>
                {activeRoute === 'workspace' && (
                  <ClientWorkspace
                    client={selectedClient}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                    purdueTests={currentPurdueTests}
                    ersTests={currentErsTests}
                    basicAcademicTests={currentAcademicTests}
                    pictureInterestPdfs={pictureInterestPdfs}
                    iwpPlans={iwpPlans}
                    onSaveIWPPlan={handleSaveIWPPlan}
                    onDeleteIWPPlan={handleDeleteIWPPlan}
                    onSavePictureInterestPdf={handleSavePictureInterestPdf}
                    onDeletePictureInterestPdf={handleDeletePictureInterestPdf}
                    onStartPurdueTest={() => setActiveRoute('purdue_form')}
                    onStartErsTest={() => setActiveRoute('ers_form')}
                    onStartBasicAcademicTest={() => setActiveRoute('basic_academic_form')}
                    onOpenSituationEval={() => setActiveRoute('situation_eval')}
                    onViewPurdueResult={(test) => {
                      setViewingPurdueTest(test);
                      setActiveRoute('purdue_report');
                    }}
                    onViewErsResult={(test) => {
                      setViewingErsTest(test);
                      setActiveRoute('ers_report');
                    }}
                    onViewBasicAcademicResult={(test) => {
                      setViewingAcademicTest(test);
                      setActiveRoute('basic_academic_report');
                    }}
                    onDeletePurdueTest={handleDeletePurdueTest}
                    onDeleteErsTest={handleDeleteErsTest}
                    onDeleteBasicAcademicTest={handleDeleteBasicAcademicTest}
                  />
                )}

                {activeRoute === 'purdue_form' && (
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/20">
                    <PurdueForm
                      client={selectedClient}
                      onSave={handleSavePurdueTest}
                      onCancel={() => setActiveRoute('workspace')}
                    />
                  </div>
                )}

                {activeRoute === 'ers_form' && (
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/20">
                    <ERSForm
                      client={selectedClient}
                      onSave={handleSaveErsTest}
                      onCancel={() => setActiveRoute('workspace')}
                    />
                  </div>
                )}

                {activeRoute === 'basic_academic_form' && (
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/20">
                    <BasicAcademicForm
                      client={selectedClient}
                      onSave={handleSaveBasicAcademicTest}
                      onCancel={() => setActiveRoute('workspace')}
                    />
                  </div>
                )}

                {activeRoute === 'purdue_report' && viewingPurdueTest && (
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 print:bg-white print:p-0">
                    <PurdueReport
                      client={selectedClient}
                      test={viewingPurdueTest}
                      onBack={() => setActiveRoute('workspace')}
                    />
                  </div>
                )}

                {activeRoute === 'ers_report' && viewingErsTest && (
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 print:bg-white print:p-0">
                    <ERSReport
                      client={selectedClient}
                      test={viewingErsTest}
                      onBack={() => setActiveRoute('workspace')}
                    />
                  </div>
                )}

                {activeRoute === 'basic_academic_report' && viewingAcademicTest && (
                  <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 print:bg-white print:p-0">
                    <BasicAcademicReport
                      client={selectedClient}
                      test={viewingAcademicTest}
                      onBack={() => setActiveRoute('workspace')}
                    />
                  </div>
                )}

              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-slate-400 p-8">
                <ClipboardList className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="font-bold text-slate-700 mb-1">선택된 평가 대상자가 없습니다.</h3>
                <p className="text-xs text-center mb-4">전체 명단 관리에서 대상자를 먼저 선택하십시오.</p>
                <button
                  id="nav-to-clients-fallback"
                  onClick={() => setActiveRoute('clients')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  명단 페이지로 이동
                </button>
              </div>
            )
          )}
        </main>

      </div>
    </div>
  );
}
