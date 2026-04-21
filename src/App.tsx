/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart, 
  MapPin, 
  School, 
  TrendingUp, 
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  BATCH_DATA, 
  GRADES, 
  UNIVERSITIES, 
  AdmissionType, 
  POPULAR_SEP 
} from './data';

/**
 * Utility for merging tailwind classes.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TYPE_COLORS: Record<AdmissionType, string> = {
  '교과': 'text-blue-600',
  '종합': 'text-orange-600',
  '논술': 'text-green-600',
  '기타': 'text-purple-600',
};

const TYPE_BG: Record<AdmissionType, string> = {
  '교과': 'bg-blue-600',
  '종합': 'bg-orange-500',
  '논술': 'bg-green-600',
  '기타': 'bg-purple-600',
};

const TYPE_DOTS: Record<AdmissionType, string> = {
  '교과': '🔵',
  '종합': '🟠',
  '논술': '🟢',
  '기타': '🟣',
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userGrade, setUserGrade] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Stats Calculation
  const stats = useMemo(() => {
    const counts = { total: 0, '교과': 0, '종합': 0, '논술': 0, '기타': 0 };
    
    // Filter data based on current view criteria to make stats reactive
    const filteredBATCH = BATCH_DATA.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredBATCH.forEach(univ => {
      Object.keys(univ.grades).forEach(gradeKey => {
        // If user grade is set, only include grades in context (±0.3)
        if (userGrade) {
          const gVal = parseFloat(gradeKey);
          const uVal = parseFloat(userGrade);
          if (!isNaN(uVal) && Math.abs(gVal - uVal) > 0.31) return;
        }

        const cases = univ.grades[gradeKey];
        if (cases) {
          cases.forEach(c => {
            counts[c.type as AdmissionType]++;
            counts.total++;
          });
        }
      });
    });
    return counts;
  }, [searchTerm, userGrade]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  const filteredUniversities = UNIVERSITIES.filter(u => 
    u.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedGrades = GRADES.filter(g => {
    if (!userGrade) return true;
    const gVal = parseFloat(g);
    const uVal = parseFloat(userGrade);
    if (isNaN(uVal)) return true;
    return Math.abs(gVal - uVal) <= 0.31; // Using 0.31 to account for float precision
  });

  return (
    <div className="h-screen bg-slate-50 p-2 md:p-3 font-sans text-slate-900 flex flex-col gap-2 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Header Bento Card */}
      <header id="main-header" className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm gap-4 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded uppercase tracking-wider">Verified Result</span>
            <span className="text-slate-400 text-[10px] font-bold">/ 숭신고 합격 데이터베이스</span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-800">
            숭신고 <span className="text-indigo-600">수시 합격</span> 배치표 <span className="text-slate-400 font-bold">(2023 ~ 2026)</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div id="admission-legend" className="flex items-center gap-3 text-[10px] font-extrabold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-600"></span> 교과</div>
            <div className="flex items-center gap-1 text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 종합</div>
            <div className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-600"></span> 논술</div>
            <div className="flex items-center gap-1 text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-600"></span> 기타</div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-28 shrink-0">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500" size={11} />
              <input 
                type="number" 
                step="0.1"
                placeholder="내 등급..."
                className="w-full pl-7 pr-2 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none transition-all font-bold placeholder:text-indigo-300"
                value={userGrade}
                onChange={(e) => setUserGrade(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
              <input 
                id="univ-search-input"
                type="text" 
                placeholder="대학 검색..."
                className="w-full pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-hidden">
        
        {/* Placement Chart */}
        <main id="batch-table-container" className="col-span-12 lg:col-span-10 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0 h-full relative group">
          {/* Scroll Nav Controls */}
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-2xl hover:bg-white hover:scale-110 active:scale-95 transition-all text-indigo-600 flex items-center justify-center ring-4 ring-indigo-500/10"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} className="stroke-[3]" />
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full shadow-2xl hover:bg-white hover:scale-110 active:scale-95 transition-all text-indigo-600 flex items-center justify-center ring-4 ring-indigo-500/10"
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} className="stroke-[3]" />
          </button>

          <div ref={scrollRef} className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300 scroll-smooth">
            <table id="admission-batch-table" className="w-full text-left border-collapse min-w-[2000px] table-fixed">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 sticky top-0 z-30">
                  <th className="sticky left-0 z-40 bg-slate-100 border-r border-slate-300 p-2 w-16 text-center shadow-[4px_0_8px_rgba(0,0,0,0.05)]">
                    <div className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none">Grade</div>
                    <div className="text-[10px] font-black text-slate-900 mt-0.5">내신등급</div>
                  </th>
                  {filteredUniversities.map(u => (
                    <th key={u} className="p-2 border-r border-slate-200 text-center w-[110px] bg-slate-100/95 backdrop-blur-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                      <span className="text-[10px] font-black text-slate-700 block truncate">{u}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedGrades.map((grade, gIdx) => (
                  <tr key={grade} className={cn(
                    "border-b transition-colors group",
                    parseFloat(grade) % 0.5 === 0 ? "border-b-slate-300" : "border-b-slate-100",
                    gIdx % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                  )}>
                    <td className={cn(
                      "sticky left-0 z-20 border-r border-slate-300 p-1 text-center font-mono text-[10px] font-bold group-hover:bg-indigo-50 transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.08)]",
                      gIdx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    )}>
                      <span className={cn(
                        parseFloat(grade) % 0.5 === 0 ? "text-indigo-600 scale-110 inline-block font-black underline decoration-indigo-200" : "text-slate-400 font-medium"
                      )}>
                        {grade}
                      </span>
                    </td>
                    {filteredUniversities.map(u => {
                      const univData = BATCH_DATA.find(d => d.name === u);
                      const cases = univData?.grades[grade] || [];
                      
                      return (
                        <td key={`${u}-${grade}`} className={cn(
                          "p-0.5 border-r border-slate-100 align-top group-hover:bg-indigo-50/30 transition-colors",
                          cases.length > 0 ? "bg-indigo-50/50" : ""
                        )}>
                          <div className="flex flex-col gap-0.5 min-h-[18px]">
                            {cases.map((cs, idx) => (
                              <div 
                                id={`case-${u}-${grade}-${idx}`}
                                key={idx} 
                                className={cn(
                                  "text-[8px] leading-tight px-1 py-1 flex items-center gap-0.5 rounded shadow-[0_1px_3px_rgba(0,0,0,0.1)] bg-white border border-slate-200 relative group/tooltip",
                                  cs.isPopular ? "ring-1 ring-indigo-300 bg-indigo-50" : ""
                                )}
                              >
                                <span className={cn(TYPE_COLORS[cs.type], "shrink-0 scale-75")}>{TYPE_DOTS[cs.type]}</span>
                                <span className="truncate text-slate-800 font-bold block" title={cs.department}>
                                  {cs.department}
                                </span>

                                {/* Student Detail Tooltip */}
                                <div className="absolute left-full ml-2 top-0 z-[100] hidden group-hover/tooltip:block w-32 bg-slate-900 text-white rounded-lg p-2 shadow-xl border border-white/10 pointer-events-none">
                                  <div className="text-[7px] text-indigo-400 font-black uppercase tracking-widest mb-1">상세 기록</div>
                                  <div className="flex justify-between items-baseline mb-1.5 border-b border-white/10 pb-1">
                                    <span className="text-[10px] font-black truncate max-w-[60%]">{u}</span>
                                    <span className="text-[9px] font-mono text-indigo-300">
                                      {cs.exactGrade 
                                        ? parseFloat(cs.exactGrade).toFixed(2) 
                                        : parseFloat(grade).toFixed(2)}등급
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-[7px] opacity-50 font-bold">전형명</div>
                                    <div className="text-[8px] font-medium text-emerald-400">
                                      {cs.admissionName || (cs.type === '교과' ? '학생부교과' : cs.type === '종합' ? '학생부종합' : '일반전형')}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Side Bento Panels */}
        <aside className="col-span-12 lg:col-span-2 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
          
          {/* Target Grade Info */}
          <div className={cn(
            "rounded-xl p-4 text-white shadow-md relative overflow-hidden transition-all duration-300 min-h-[100px]",
            userGrade ? "bg-indigo-600" : "bg-slate-200 text-slate-400 shadow-none border border-slate-300"
          )}>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <TrendingUp size={60} />
            </div>
            <div className="text-[8px] opacity-80 font-bold uppercase tracking-wider mb-0.5">Target Range</div>
            {userGrade ? (
              <>
                <div className="text-2xl font-black mb-1">
                  {(parseFloat(userGrade) - 0.3).toFixed(1)} - {(parseFloat(userGrade) + 0.3).toFixed(1)}
                </div>
                <p className="text-[9px] opacity-80 leading-tight font-medium">검색 등급 기준 ±0.3 범위 데이터 노출 중</p>
              </>
            ) : (
                <>
                <div className="text-xl font-black mb-1 opacity-50">1.0 - 9.0</div>
                <p className="text-[9px] leading-tight font-bold">좌측 상단에 '내 등급'을 입력해 보세요.</p>
                </>
            )}
          </div>

          {/* Admission Type Statistics */}
          <div id="admission-stats-card" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="font-extrabold text-[11px] flex items-center gap-2 uppercase tracking-wide">
              <PieChart size={13} className="text-indigo-500" />
              {userGrade ? "해당 등급대 합격 비율 (%)" : "전체 합격 비율 (%)"}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(['교과', '종합', '논술', '기타'] as AdmissionType[]).map(type => {
                const percentage = stats.total > 0 ? ((stats[type] / stats.total) * 100).toFixed(1) : '0';
                return (
                  <div key={type} className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-100 group transition-colors hover:border-indigo-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", TYPE_BG[type])}></div>
                      <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800">{type}</span>
                    </div>
                    <div className="text-lg font-black text-slate-800 leading-none">{percentage}%</div>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-tight">
              {userGrade ? `* ${userGrade}등급(±0.3) 구간 ${stats.total}명 분석` : `* 숭신고 누적 합격생 ${stats.total}명 분석`}
            </p>
          </div>

          {/* Guidelines Bento Card */}
          <div id="footer-instruction-card" className="bg-slate-900 rounded-xl p-4 text-white/90 shadow-lg border border-white/5 mt-auto">
            <div className="flex items-center gap-1.5 mb-2.5 text-indigo-400">
              <CheckCircle2 size={13} />
              <span className="text-[9px] font-black uppercase tracking-widest">Guide & Caution</span>
            </div>
            <ul id="instruction-list" className="text-[9px] space-y-2 opacity-70 font-bold leading-tight">
              <li className="flex gap-2">
                <span className="text-indigo-500">01</span>
                <span>최종 합격(최초/충원) 사례만 엄선하여 수록</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500">02</span>
                <span>데이터는 수시 지원 전략 참고용으로만 활용</span>
              </li>
              <li className="flex gap-2 text-rose-400">
                <span className="text-rose-500">03</span>
                <span>교내 진학지도용 대외비 자료 - 무단 배포 금지</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Page Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-4 py-1.5 text-[8px] md:text-[9px] text-slate-500 font-bold tracking-tight border-t border-slate-200 bg-white/50 backdrop-blur-sm shrink-0">
        <div className="font-mono uppercase opacity-70">SUNGSHIN_HIGH_SCHOOL_ADMISSION_DB_2026</div>
        <div className="flex items-center gap-2 mt-1 md:mt-0">
          <span className="hidden md:inline h-2 w-px bg-slate-300"></span>
          <div className="text-slate-800">
            제작 : <span className="text-indigo-600 font-black">숭신고등학교 진로진학상담부 김강석</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
