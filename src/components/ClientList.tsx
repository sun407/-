/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client } from '../types';
import { User, Search, Plus, UserPlus, FileText, ChevronRight, Activity, Calendar, Award, Clock } from 'lucide-react';
import { formatServicePeriod, getEffectiveExtensionCount } from '../utils/yearHelper';

interface ClientListProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
}

export default function ClientList({
  clients,
  selectedClient,
  onSelectClient,
  onAddClient,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [diagnosis, setDiagnosis] = useState('');
  const [handDominance, setHandDominance] = useState<'R' | 'L' | 'Ambi'>('R');
  const [memos, setMemos] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;
    onAddClient({
      name,
      birthDate,
      gender,
      diagnosis,
      handDominance,
      memos,
    });
    // Reset Form
    setName('');
    setBirthDate('');
    setGender('M');
    setDiagnosis('');
    setHandDominance('R');
    setMemos('');
    setIsAdding(false);
  };

  return (
    <div id="client-list-section" className="flex flex-col h-full bg-white border-r border-slate-200 w-80 shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            평가 대상 명단
          </h2>
          <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {clients.length}명
          </span>
        </div>
        
        <div className="relative">
          <input
            id="client-search-input"
            type="text"
            placeholder="이름, 장애유형 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Action Button */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        {!isAdding ? (
          <button
            id="add-client-toggle"
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            새 평가 대상 추가
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-3 rounded-xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">새 대상자 정보</span>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)} 
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                취소
              </button>
            </div>
            
            <div>
              <label htmlFor="patient-name" className="block text-[11px] font-bold text-slate-500 mb-1">이름 *</label>
              <input
                id="patient-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="patient-birth" className="block text-[11px] font-bold text-slate-500 mb-1">생년월일 *</label>
                <input
                  id="patient-birth"
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">성별 *</label>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden h-[29px]">
                  <button
                    id="gender-m"
                    type="button"
                    onClick={() => setGender('M')}
                    className={`flex-1 text-xs font-semibold transition-colors ${gender === 'M' ? 'bg-indigo-50 text-indigo-600 border-r border-slate-200' : 'bg-white text-slate-500'}`}
                  >
                    남성
                  </button>
                  <button
                    id="gender-f"
                    type="button"
                    onClick={() => setGender('F')}
                    className={`flex-1 text-xs font-semibold transition-colors ${gender === 'F' ? 'bg-indigo-50 text-indigo-600 border-l border-slate-200' : 'bg-white text-slate-500'}`}
                  >
                    여성
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="patient-dominance" className="block text-[11px] font-bold text-slate-500 mb-1">dominant hand</label>
              <select
                id="patient-dominance"
                value={handDominance}
                onChange={(e) => setHandDominance(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="R">우세손: 오른손 (Dominant Right)</option>
                <option value="L">우세손: 왼손 (Dominant Left)</option>
                <option value="Ambi">양손잡이 (Ambidextrous)</option>
              </select>
            </div>

            <div>
              <label htmlFor="patient-diagnosis" className="block text-[11px] font-bold text-slate-500 mb-1">장애유형</label>
              <input
                id="patient-diagnosis"
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="예: 지체장애, 지적장애, 자폐성장애 등"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="patient-memo" className="block text-[11px] font-bold text-slate-500 mb-1">욕구사항</label>
              <textarea
                id="patient-memo"
                value={memos}
                onChange={(e) => setMemos(e.target.value)}
                placeholder="훈련 욕구 및 고용 요구사항 작성..."
                rows={2}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              id="submit-patient-btn"
              type="submit"
              className="w-full py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              저장 및 생성
            </button>
          </form>
        )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <User className="h-8 w-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-xs">등록된 대상이 없거나<br />일치하는 검색 결과가 없습니다.</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const isSelected = selectedClient?.id === client.id;
            return (
              <button
                id={`client-item-${client.id}`}
                key={client.id}
                onClick={() => onSelectClient(client)}
                className={`w-full text-left p-4 focus:outline-none transition-all flex items-center justify-between ${
                  isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex gap-3 items-start min-w-0">
                  <div className={`p-2 rounded-full shrink-0 ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-800 truncate">{client.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/60 font-medium text-slate-600 shrink-0">
                        {client.gender === 'M' ? '남성' : '여성'}
                      </span>
                    </div>
                    {client.diagnosis && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{client.diagnosis}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 inline" />
                        {client.birthDate}
                      </span>
                      {client.serviceStartDate && (
                        (() => {
                          const extCount = getEffectiveExtensionCount(client.serviceStartDate, client.serviceEndDate, client.serviceExtensionCount);
                          return (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-0.5 font-mono ${
                              extCount > 0 
                                ? 'text-amber-800 bg-amber-50 border-amber-200' 
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                            }`}>
                              <Clock className="h-2.5 w-2.5 inline" />
                              {extCount === 0 ? '4년과정' : `총${4 * (1 + extCount)}년(${extCount}차)`}
                            </span>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-300'}`} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
