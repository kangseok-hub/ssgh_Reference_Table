/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  PieChart,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  BATCH_DATA, 
  GRADES, 
  UNIVERSITIES, 
  AdmissionType, 
  POPULAR_SEP,
  UnivGroup,
  GROUP_LABELS,
  getUnivGroup
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

const TYPES: AdmissionType[] = ['교과', '종합', '논술', '기타'];
const GROUPS: UnivGroup[] = ['상위15', '서울', '경기인천지방'];

const TYPE_DOTS: Record<AdmissionType, string> = {
  '교과': '🔵',
  '종합': '🟠',
  '논술': '🟢',
  '기타': '🟣',
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minGrade, setMinGrade] = useState<string>('');
  const [maxGrade, setMaxGrade] = useState<string>('');
  const hasRange = minGrade !== '' || maxGrade !== '';
  const [typeFilter, setTypeFilter] = useState<AdmissionType | null>(null);
  const [groupFilter, setGroupFilter] = useState<UnivGroup | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedUniv, setSelectedUniv] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedUniv) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedUniv(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedUniv]);

  // 선택한 대학의 전체 합격생 목록 + 전형별 비율 (등급 범위와 무관하게 전체 표시)
  const univDetail = useMemo(() => {
    if (!selectedUniv) return null;
    const data = BATCH_DATA.find(d => d.name === selectedUniv);
    const rows: { grade: number; gradeText: string; department: string; type: AdmissionType; admissionName: string; exact: boolean }[] = [];
    const counts: Record<AdmissionType, number> = { '교과': 0, '종합': 0, '논술': 0, '기타': 0 };
    Object.entries(data?.grades || {}).forEach(([gradeKey, cases]) => {
      (cases || []).forEach(c => {
        const exact = !!c.exactGrade && !isNaN(parseFloat(c.exactGrade));
        const g = exact ? parseFloat(c.exactGrade as string) : parseFloat(gradeKey);
        rows.push({
          grade: g,
          gradeText: exact ? g.toFixed(2) : `${gradeKey}대`,
          department: c.department,
          type: c.type,
          admissionName: c.admissionName || (c.type === '교과' ? '학생부교과' : c.type === '종합' ? '학생부종합' : '일반전형'),
          exact,
        });
        counts[c.type]++;
      });
    });
    rows.sort((a, b) => a.grade - b.grade);
    return { rows, counts, total: rows.length };
  }, [selectedUniv]);

  // 점수(등급) 범위 확인: 비어 있는 쪽은 제한 없음. 표의 등급 칸(예: 3.2)은 3.15~3.25 구간 대표값.
  const inGrade = (gradeKey: string) => {
    const gVal = parseFloat(gradeKey);
    const lo = parseFloat(minGrade);
    const hi = parseFloat(maxGrade);
    if (!isNaN(lo) && gVal < lo - 0.001) return false;
    if (!isNaN(hi) && gVal > hi + 0.001) return false;
    return true;
  };


  // 급간(대학 그룹)별 전형 비율: 검색어·내 등급은 반영, 전형/급간 필터는 무시(비교용)
  const groupStats = useMemo(() => {
    const init = () => ({ total: 0, '교과': 0, '종합': 0, '논술': 0, '기타': 0 });
    const result: Record<UnivGroup, ReturnType<typeof init>> = {
      '상위15': init(), '서울': init(), '경기인천지방': init(),
    };
    BATCH_DATA.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(univ => {
        const g = result[getUnivGroup(univ.name)];
        Object.keys(univ.grades).forEach(gradeKey => {
          if (!inGrade(gradeKey)) return;
          (univ.grades[gradeKey] || []).forEach(c => {
            g[c.type as AdmissionType]++;
            g.total++;
          });
        });
      });
    return result;
  }, [searchTerm, minGrade, maxGrade]);

  // Stats Calculation (선택한 급간 기준)
  const stats = useMemo(() => {
    const counts = { total: 0, '교과': 0, '종합': 0, '논술': 0, '기타': 0 };
    
    // Filter data based on current view criteria to make stats reactive
    const filteredBATCH = BATCH_DATA.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!groupFilter || getUnivGroup(u.name) === groupFilter)
    );

    filteredBATCH.forEach(univ => {
      Object.keys(univ.grades).forEach(gradeKey => {
        if (!inGrade(gradeKey)) return;

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
  }, [searchTerm, minGrade, maxGrade, groupFilter]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  const filteredUniversities = UNIVERSITIES.filter(u => 
    u.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!groupFilter || getUnivGroup(u) === groupFilter)
  );

  const displayedGrades = GRADES.filter(g => inGrade(g));

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
          <div id="admission-legend" className="flex items-center gap-1 text-[10px] font-extrabold bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
            <button
              onClick={() => setTypeFilter(null)}
              className={cn("px-2 py-0.5 rounded-md transition-colors", typeFilter === null ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-200")}
            >전체</button>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                aria-pressed={typeFilter === t}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors",
                  typeFilter === t ? cn(TYPE_BG[t], "text-white") : cn(TYPE_COLORS[t], "hover:bg-slate-200")
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", typeFilter === t ? "bg-white" : TYPE_BG[t])}></span> {t}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 shrink-0 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
              <Filter className="text-indigo-500 shrink-0" size={11} />
              <input
                type="number" step="0.1" min="1" max="9"
                placeholder="1.0"
                aria-label="최소 등급"
                className="w-12 py-0.5 bg-white border border-indigo-100 rounded text-xs text-center font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-indigo-300"
                value={minGrade}
                onChange={(e) => setMinGrade(e.target.value)}
              />
              <span className="text-indigo-400 font-black text-xs">~</span>
              <input
                type="number" step="0.1" min="1" max="9"
                placeholder="9.0"
                aria-label="최대 등급"
                className="w-12 py-0.5 bg-white border border-indigo-100 rounded text-xs text-center font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-indigo-300"
                value={maxGrade}
                onChange={(e) => setMaxGrade(e.target.value)}
              />
              {hasRange && (
                <button
                  onClick={() => { setMinGrade(''); setMaxGrade(''); }}
                  className="text-[9px] font-black text-indigo-500 hover:text-indigo-800 px-1"
                  aria-label="등급 범위 초기화"
                >초기화</button>
              )}
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
                    <th key={u} className="p-0 border-r border-slate-200 text-center w-[110px] bg-slate-100/95 backdrop-blur-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                      <button
                        onClick={() => setSelectedUniv(u)}
                        title={`${u} 합격생 목록 보기`}
                        className="w-full p-2 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] font-black text-slate-700 hover:text-indigo-700 block truncate underline decoration-dotted decoration-slate-300 underline-offset-2">{u}</span>
                      </button>
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
                      const cases = (univData?.grades[grade] || []).filter(c => !typeFilter || c.type === typeFilter);
                      
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
            hasRange ? "bg-indigo-600" : "bg-slate-200 text-slate-400 shadow-none border border-slate-300"
          )}>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <TrendingUp size={60} />
            </div>
            <div className="text-[8px] opacity-80 font-bold uppercase tracking-wider mb-0.5">Target Range</div>
            {hasRange ? (
              <>
                <div className="text-2xl font-black mb-1">
                  {minGrade !== '' ? parseFloat(minGrade).toFixed(1) : '1.0'} ~ {maxGrade !== '' ? parseFloat(maxGrade).toFixed(1) : '9.0'}
                </div>
                <p className="text-[9px] opacity-80 leading-tight font-medium">입력한 등급 범위의 배치표와 통계를 표시 중</p>
              </>
            ) : (
                <>
                <div className="text-xl font-black mb-1 opacity-50">1.0 - 9.0</div>
                <p className="text-[9px] leading-tight font-bold">상단에 등급 범위(예: 1.0 ~ 3.2)를 입력해 보세요.</p>
                </>
            )}
          </div>

          {/* University Group Filter & Comparison */}
          <div id="group-stats-card" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <h3 className="font-extrabold text-[11px] flex items-center gap-2 uppercase tracking-wide">
              <School size={13} className="text-indigo-500" />
              대학 급간별 전형 비율
            </h3>
            <button
              onClick={() => setGroupFilter(null)}
              className={cn("text-[10px] font-black px-2 py-1 rounded-md border text-left transition-colors",
                groupFilter === null ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200")}
            >전체 대학</button>
            {GROUPS.map(g => {
              const gs = groupStats[g];
              return (
                <button
                  key={g}
                  onClick={() => setGroupFilter(groupFilter === g ? null : g)}
                  aria-pressed={groupFilter === g}
                  className={cn("flex flex-col gap-1 p-2 rounded-md border text-left transition-colors",
                    groupFilter === g ? "bg-indigo-50 border-indigo-400" : "bg-slate-50 border-slate-100 hover:border-indigo-200")}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-slate-700">{GROUP_LABELS[g]}</span>
                    <span className="text-[9px] font-bold text-slate-400">{gs.total}명</span>
                  </div>
                  <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-200">
                    {TYPES.map(t => gs.total > 0 && gs[t] > 0 ? (
                      <div key={t} className={TYPE_BG[t]} style={{ width: `${(gs[t] / gs.total) * 100}%` }} title={`${t} ${gs[t]}명`} />
                    ) : null)}
                  </div>
                  <div className="flex flex-wrap gap-x-2 text-[9px] font-bold">
                    {TYPES.map(t => (
                      <span key={t} className={TYPE_COLORS[t]}>
                        {t} {gs.total > 0 ? ((gs[t] / gs.total) * 100).toFixed(0) : 0}%
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
            <p className="text-[9px] text-slate-400 font-bold tracking-tight">* 급간을 누르면 표에도 해당 대학만 표시됩니다.</p>
          </div>

          {/* Admission Type Statistics */}
          <div id="admission-stats-card" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="font-extrabold text-[11px] flex items-center gap-2 uppercase tracking-wide">
              <PieChart size={13} className="text-indigo-500" />
              {(groupFilter ? GROUP_LABELS[groupFilter] + " · " : "") + (hasRange ? "해당 등급 범위 합격 비율 (%)" : "전체 합격 비율 (%)")}
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
              {hasRange ? `* ${minGrade || '1.0'}~${maxGrade || '9.0'}등급 구간 ${stats.total}명 분석` : `* ${groupFilter ? GROUP_LABELS[groupFilter] : '숭신고 누적'} 합격생 ${stats.total}명 분석`}
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


      {/* University Detail Modal */}
      {selectedUniv && univDetail && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/50 flex items-center justify-center p-3"
          onClick={() => setSelectedUniv(null)}
        >
          <div
            role="dialog"
            aria-label={`${selectedUniv} 합격생 목록`}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 py-3 border-b border-slate-200 shrink-0">
              <div>
                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">University Detail</div>
                <h2 className="text-lg font-black text-slate-800">{selectedUniv} <span className="text-slate-400 text-sm font-bold">합격생 {univDetail.total}명</span></h2>
                <span className="text-[9px] text-slate-400 font-bold">{GROUP_LABELS[getUnivGroup(selectedUniv)]}</span>
              </div>
              <button onClick={() => setSelectedUniv(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="닫기">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
              <div className="text-[10px] font-black text-slate-500 mb-1.5">전형별 합격 비율</div>
              {univDetail.total > 0 ? (
                <>
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-200">
                    {TYPES.map(t => univDetail.counts[t] > 0 ? (
                      <div key={t} className={TYPE_BG[t]} style={{ width: `${(univDetail.counts[t] / univDetail.total) * 100}%` }} title={`${t} ${univDetail.counts[t]}명`} />
                    ) : null)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] font-black">
                    {TYPES.map(t => (
                      <span key={t} className={TYPE_COLORS[t]}>
                        {TYPE_DOTS[t]} {t} {univDetail.counts[t]}명 ({((univDetail.counts[t] / univDetail.total) * 100).toFixed(1)}%)
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-bold">등록된 합격 사례가 없습니다.</p>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-[10px] text-slate-500">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">No</th>
                    <th className="px-3 py-2 w-20">내신등급</th>
                    <th className="px-3 py-2">학과/계열</th>
                    <th className="px-3 py-2 w-24 whitespace-nowrap">구분</th>
                    <th className="px-3 py-2">전형명</th>
                  </tr>
                </thead>
                <tbody>
                  {univDetail.rows.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-indigo-50/40">
                      <td className="px-3 py-1.5 text-center text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-3 py-1.5 font-mono font-bold text-slate-800">{r.gradeText}</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">{r.department}</td>
                      <td className={cn("px-3 py-1.5 font-black whitespace-nowrap", TYPE_COLORS[r.type])}>{TYPE_DOTS[r.type]} {r.type}</td>
                      <td className="px-3 py-1.5 text-slate-600">{r.admissionName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 py-2 text-[9px] text-slate-400 font-bold">* 등급 범위·전형 필터와 관계없이 해당 대학의 전체 사례를 등급 순으로 표시합니다. '3.0대'처럼 표시된 항목은 정확한 등급이 입력되지 않은 사례입니다.</p>
            </div>
          </div>
        </div>
      )}

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
