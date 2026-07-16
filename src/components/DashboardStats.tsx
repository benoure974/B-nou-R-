import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Coins, 
  ChevronRight, 
  UserCheck, 
  Award,
  BookOpen,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { Member, Session } from '../types';

interface DashboardStatsProps {
  members: Member[];
  sessions: Session[];
}

export default function DashboardStats({ members, sessions }: DashboardStatsProps) {
  const [hoveredSessionIndex, setHoveredSessionIndex] = useState<number | null>(null);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'attendance' | 'dues'>('attendance');

  // --- ATTENDANCE STATS CALCULATIONS ---
  const activeMembers = members.filter(m => m.status === 'Actif');
  const activeMembersCount = activeMembers.length || members.length || 1;

  // Sort sessions chronological ascending
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const attendanceData = sortedSessions.map((session) => {
    const dateObj = new Date(session.date);
    const formattedDate = isNaN(dateObj.getTime()) 
      ? 'Non daté' 
      : dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    
    const presentCount = session.presentIds ? session.presentIds.length : 0;
    const excusedCount = session.excusedIds ? session.excusedIds.length : 0;
    const visitorCount = session.visitorIds ? session.visitorIds.length : 0;
    
    const rate = Math.min(100, Math.round((presentCount / activeMembersCount) * 100));
    
    return {
      id: session.id,
      title: session.title || 'Tenue',
      shortTitle: (session.title || 'Tenue').replace(/du \d{2}\/\d{2}\/\d{4}/, '').trim(),
      date: formattedDate,
      fullDate: isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      degree: session.degree,
      type: session.type,
      presentCount,
      excusedCount,
      visitorCount,
      totalCount: activeMembersCount,
      rate,
    };
  });

  // Calculate average attendance
  const averageAttendance = attendanceData.length > 0
    ? Math.round(attendanceData.reduce((acc, curr) => acc + curr.rate, 0) / attendanceData.length)
    : 0;

  // Attendance by Grade/Degree
  const grades = ['Apprenti', 'Compagnon', 'Maitre'] as const;
  const attendanceByGrade = grades.map(grade => {
    const gradeSessions = sessions.filter(s => s.degree === grade);
    if (gradeSessions.length === 0) return { grade, rate: 0, count: 0 };
    
    const totalRate = gradeSessions.reduce((acc, session) => {
      // In high grades, only members of that grade or above are present.
      // But let's calculate rate based on the eligible members for that grade
      const eligibleMembers = members.filter(m => {
        if (grade === 'Maitre') return m.grade === 'Maitre';
        if (grade === 'Compagnon') return m.grade === 'Compagnon' || m.grade === 'Maitre';
        return m.status === 'Actif'; // All active members can attend Apprenti sessions
      });
      const eligibleCount = eligibleMembers.length || 1;
      const presentCount = session.presentIds ? session.presentIds.filter(id => eligibleMembers.some(em => em.id === id)).length : 0;
      return acc + Math.min(100, Math.round((presentCount / eligibleCount) * 100));
    }, 0);
    
    return {
      grade,
      rate: Math.round(totalRate / gradeSessions.length),
      count: gradeSessions.length
    };
  });


  // --- DUES / COTISATIONS CALCULATIONS ---
  // We compute dues expected vs received per month based on deterministic entry date
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const monthAbbrs = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  const monthlyExpected = Array(12).fill(0);
  const monthlyPaid = Array(12).fill(0);

  members.forEach(m => {
    // Determine month based on entry date (or stable hash of id)
    const entryDate = m.entryDate || '2026-01-01';
    let mDate = new Date(entryDate);
    if (isNaN(mDate.getTime())) {
      mDate = new Date('2026-01-01');
    }
    const baseMonth = mDate.getMonth(); // 0 - 11

    // 1. Lodge dues
    const lodgeMonth = baseMonth;
    monthlyExpected[lodgeMonth] += m.lodgeDues;
    if (m.lodgeDuesPaid) {
      monthlyPaid[lodgeMonth] += m.lodgeDues;
    }

    // 2. Order dues (staggered slightly to make the progression curve smooth and beautiful)
    const orderMonth = (baseMonth + 1) % 12;
    monthlyExpected[orderMonth] += m.orderDues;
    if (m.orderDuesPaid) {
      monthlyPaid[orderMonth] += m.orderDues;
    }

    // 3. Elevation dues
    if (m.elevationDues > 0) {
      const elevMonth = (baseMonth + 2) % 12;
      monthlyExpected[elevMonth] += m.elevationDues;
      if (m.elevationDuesPaid) {
        monthlyPaid[elevMonth] += m.elevationDues;
      }
    }
  });

  // Cumulative sums month-by-month
  let sumExpected = 0;
  let sumPaid = 0;
  const cumulativeExpected = Array(12).fill(0);
  const cumulativePaid = Array(12).fill(0);

  for (let i = 0; i < 12; i++) {
    sumExpected += monthlyExpected[i];
    sumPaid += monthlyPaid[i];
    cumulativeExpected[i] = sumExpected;
    cumulativePaid[i] = sumPaid;
  }

  const annualTargetDues = sumExpected || 1;
  const totalCollectedDues = sumPaid;
  const globalCollectionRate = Math.round((totalCollectedDues / annualTargetDues) * 100);

  // Formatting values for charts
  const maxDuesValue = Math.max(...cumulativeExpected, 1000) * 1.1;


  // --- SVG PLOTTING UTILITIES ---
  // Coordinates mapper for Attendance Chart
  const svgW = 500;
  const svgH = 180;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  // Attendance points coordinates
  const attendancePoints = attendanceData.map((d, index) => {
    const x = padL + (attendanceData.length > 1 ? (index / (attendanceData.length - 1)) * chartW : chartW / 2);
    const y = svgH - padB - (d.rate / 100) * chartH;
    return { x, y, ...d };
  });

  // Line path generator
  let attendancePath = '';
  let attendanceAreaPath = '';
  if (attendancePoints.length > 0) {
    attendancePath = `M ${attendancePoints[0].x} ${attendancePoints[0].y} ` + 
      attendancePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    
    attendanceAreaPath = `${attendancePath} L ${attendancePoints[attendancePoints.length - 1].x} ${svgH - padB} L ${attendancePoints[0].x} ${svgH - padB} Z`;
  }

  // Cotisations points coordinates
  const duesPoints = cumulativePaid.map((val, index) => {
    const x = padL + (index / 11) * chartW;
    const y = svgH - padB - (val / maxDuesValue) * chartH;
    return { x, y, val, expected: cumulativeExpected[index], month: monthAbbrs[index], fullName: monthNames[index] };
  });

  // Cotisations line generators
  let duesPaidPath = '';
  let duesPaidAreaPath = '';
  let duesExpectedPath = '';
  if (duesPoints.length > 0) {
    duesPaidPath = `M ${duesPoints[0].x} ${duesPoints[0].y} ` + 
      duesPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    
    duesPaidAreaPath = `${duesPaidPath} L ${duesPoints[11].x} ${svgH - padB} L ${duesPoints[0].x} ${svgH - padB} Z`;

    duesExpectedPath = `M ${duesPoints[0].x} ${svgH - padB - (duesPoints[0].expected / maxDuesValue) * chartH} ` + 
      duesPoints.slice(1).map(p => `L ${p.x} ${svgH - padB - (p.expected / maxDuesValue) * chartH}`).join(' ');
  }

  return (
    <div className="bg-[#122428] border border-amber-500/15 rounded-2xl p-6 shadow-xl relative overflow-hidden select-none">
      {/* Background radial glowing gradients */}
      <div className="absolute right-0 bottom-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-0 top-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-500/10 pb-4 mb-6">
        <div>
          <h3 className="font-sans text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Statistiques & Analyses de l'Atelier
          </h3>
          <p className="text-xs text-[#87A0A0]">
            Données consolidées d'assiduité maçonnique et d'évolution des cotisations de la Loge
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#081619] p-1 rounded-xl border border-[#87A0A0]/10 shrink-0">
          <button
            onClick={() => setActiveChartTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeChartTab === 'attendance' 
                ? 'bg-[#0C7A7A] text-white border border-amber-500/15' 
                : 'text-[#87A0A0] hover:text-white'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Assiduité ({averageAttendance}%)
          </button>
          <button
            onClick={() => setActiveChartTab('dues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeChartTab === 'dues' 
                ? 'bg-[#0C7A7A] text-white border border-amber-500/15' 
                : 'text-[#87A0A0] hover:text-white'
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            Cotisations ({globalCollectionRate}%)
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: ATTENDANCE CHARTS */}
      {activeChartTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Main Attendance Chart */}
          <div className="lg:col-span-2 bg-[#081619]/40 border border-amber-500/10 rounded-xl p-4 flex flex-col justify-between relative min-h-[260px]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">Assiduité Historique</span>
                <span className="text-sm font-bold text-white">Taux de présence par tenue</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-[#87A0A0]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500/20 border border-teal-500" />
                  <span>Présents (%)</span>
                </div>
              </div>
            </div>

            {/* Attendance SVG chart */}
            <div className="relative flex-grow h-44 w-full">
              {attendancePoints.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-mono">
                  Aucun historique de tenue disponible
                </div>
              ) : (
                <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="100%" className="overflow-visible">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((gridVal) => {
                    const y = svgH - padB - (gridVal / 100) * chartH;
                    return (
                      <g key={gridVal}>
                        <line 
                          x1={padL} 
                          y1={y} 
                          x2={svgW - padR} 
                          y2={y} 
                          stroke="#122428" 
                          strokeWidth="1" 
                          strokeDasharray="3 3" 
                        />
                        <text 
                          x={padL - 8} 
                          y={y + 3} 
                          fill="#87A0A0" 
                          fontSize="9" 
                          fontFamily="monospace" 
                          textAnchor="end"
                          opacity="0.6"
                        >
                          {gridVal}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill under curve */}
                  {attendanceAreaPath && (
                    <path 
                      d={attendanceAreaPath} 
                      fill="url(#attendanceGrad)" 
                    />
                  )}

                  {/* Smooth line */}
                  {attendancePath && (
                    <path 
                      d={attendancePath} 
                      fill="none" 
                      stroke="#0C7A7A" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Custom gradients definition */}
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0C7A7A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0C7A7A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Interactive Circles & Labels */}
                  {attendancePoints.map((pt, idx) => {
                    const isHovered = hoveredSessionIndex === idx;
                    return (
                      <g key={pt.id}>
                        {/* Invisible larger hover zone */}
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="15" 
                          fill="transparent" 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredSessionIndex(idx)}
                          onMouseLeave={() => setHoveredSessionIndex(null)}
                        />
                        {/* Visible circle outline and point */}
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isHovered ? "6" : "4"} 
                          fill="#081619" 
                          stroke={isHovered ? "#C5A059" : "#0C7A7A"} 
                          strokeWidth={isHovered ? "3" : "2"} 
                          className="transition-all duration-150 pointer-events-none"
                        />
                        {/* X-axis Month/Day Label */}
                        <text 
                          x={pt.x} 
                          y={svgH - 8} 
                          fill="#87A0A0" 
                          fontSize="9" 
                          fontFamily="monospace" 
                          textAnchor="middle"
                          opacity={isHovered ? "1" : "0.7"}
                          className="transition-all pointer-events-none"
                        >
                          {pt.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Dynamic HTML Tooltip on hover */}
              {hoveredSessionIndex !== null && attendancePoints[hoveredSessionIndex] && (
                <div className="absolute bg-[#122428] border border-amber-500/30 rounded-xl p-3 shadow-2xl z-50 text-xs w-60 animate-fade-in pointer-events-none"
                  style={{
                    left: `${Math.min(75, Math.max(5, (attendancePoints[hoveredSessionIndex].x / svgW) * 100))}%`,
                    top: '10px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <p className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                    {attendancePoints[hoveredSessionIndex].degree} • {attendancePoints[hoveredSessionIndex].type}
                  </p>
                  <p className="font-bold text-white mt-0.5 truncate">
                    {attendancePoints[hoveredSessionIndex].title}
                  </p>
                  <p className="text-[#87A0A0] text-[10px] mt-0.5">
                    {attendancePoints[hoveredSessionIndex].fullDate}
                  </p>
                  <div className="border-t border-[#87A0A0]/10 mt-2 pt-1.5 flex justify-between items-center text-[11px]">
                    <span className="text-[#87A0A0]">Taux de présence :</span>
                    <span className="font-bold text-teal-400">{attendancePoints[hoveredSessionIndex].rate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#87A0A0] mt-1">
                    <span>Membres présents :</span>
                    <span className="font-mono text-white">
                      {attendancePoints[hoveredSessionIndex].presentCount} / {attendancePoints[hoveredSessionIndex].totalCount}
                    </span>
                  </div>
                  {(attendancePoints[hoveredSessionIndex].excusedCount > 0 || attendancePoints[hoveredSessionIndex].visitorCount > 0) && (
                    <div className="border-t border-dashed border-[#87A0A0]/10 mt-1.5 pt-1.5 flex gap-2 justify-between text-[10px] text-[#87A0A0]">
                      {attendancePoints[hoveredSessionIndex].excusedCount > 0 && (
                        <span>{attendancePoints[hoveredSessionIndex].excusedCount} excusé(s)</span>
                      )}
                      {attendancePoints[hoveredSessionIndex].visitorCount > 0 && (
                        <span className="text-emerald-400 font-semibold">{attendancePoints[hoveredSessionIndex].visitorCount} visiteur(s)</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats Block: Key Indicators and Attendance by Degree */}
          <div className="flex flex-col justify-between gap-4">
            {/* Quick KPIs Card */}
            <div className="bg-[#081619]/40 border border-amber-500/10 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] text-[#87A0A0] font-mono tracking-widest uppercase">Moyenne Générale</span>
                <h4 className="text-3xl font-extrabold text-teal-400 tracking-tight font-sans">
                  {averageAttendance}%
                </h4>
                <span className="text-[10px] text-[#87A0A0] block">Assiduité sur l'année</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-teal-400" />
              </div>
            </div>

            {/* Attendance by grade bars */}
            <div className="bg-[#081619]/40 border border-amber-500/10 rounded-xl p-4 flex-grow flex flex-col justify-center gap-3 shadow-md">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block mb-1">Assiduité par Grade</span>
              
              {attendanceByGrade.map((item) => (
                <div key={item.grade} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Award className={`h-3 w-3 ${
                        item.grade === 'Apprenti' ? 'text-[#87A0A0]' : 
                        item.grade === 'Compagnon' ? 'text-amber-500/70' : 'text-amber-400'
                      }`} />
                      {item.grade}
                    </span>
                    <span className="font-mono text-[#87A0A0]">
                      {item.rate}% <span className="text-[10px]">({item.count} tenues)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#122428] rounded-full overflow-hidden border border-[#87A0A0]/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.grade === 'Apprenti' ? 'bg-teal-600' : 
                        item.grade === 'Compagnon' ? 'bg-amber-600' : 'bg-[#C5A059]'
                      }`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW 2: FINANCIAL / DUES PROGRESSION */}
      {activeChartTab === 'dues' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Main Dues Cumulative Progress Curve */}
          <div className="lg:col-span-2 bg-[#081619]/40 border border-amber-500/10 rounded-xl p-4 flex flex-col justify-between relative min-h-[260px]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">Évolution des Encaissements</span>
                <span className="text-sm font-bold text-white">Courbe cumulative des cotisations perçues</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono text-[#87A0A0]">
                <div className="flex items-center gap-1">
                  <span className="h-0.5 w-4 border-t border-dashed border-[#87A0A0]/60" />
                  <span>Cible ({annualTargetDues} €)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/20 border border-amber-500" />
                  <span>Encaissé cumulé</span>
                </div>
              </div>
            </div>

            {/* Dues SVG chart */}
            <div className="relative flex-grow h-44 w-full">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="100%" className="overflow-visible">
                {/* Expected dues curve (dashed target path or background progress guide) */}
                {duesExpectedPath && (
                  <path 
                    d={duesExpectedPath} 
                    fill="none" 
                    stroke="#87A0A0" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    opacity="0.25"
                  />
                )}

                {/* Target final value line */}
                <line 
                  x1={padL} 
                  y1={svgH - padB - (annualTargetDues / maxDuesValue) * chartH} 
                  x2={svgW - padR} 
                  y2={svgH - padB - (annualTargetDues / maxDuesValue) * chartH} 
                  stroke="#C5A059" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3" 
                  opacity="0.4"
                />
                
                {/* Text for Target Final Value */}
                <text 
                  x={svgW - padR} 
                  y={svgH - padB - (annualTargetDues / maxDuesValue) * chartH - 5} 
                  fill="#C5A059" 
                  fontSize="8" 
                  fontFamily="monospace" 
                  textAnchor="end"
                  opacity="0.8"
                >
                  Objectif Annuel : {annualTargetDues} €
                </text>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const targetVal = maxDuesValue * pct;
                  const y = svgH - padB - (targetVal / maxDuesValue) * chartH;
                  if (idx === 0) return null; // skip base line
                  return (
                    <g key={idx}>
                      <line 
                        x1={padL} 
                        y1={y} 
                        x2={svgW - padR} 
                        y2={y} 
                        stroke="#122428" 
                        strokeWidth="1" 
                        strokeDasharray="3 3" 
                      />
                      <text 
                        x={padL - 8} 
                        y={y + 3} 
                        fill="#87A0A0" 
                        fontSize="8" 
                        fontFamily="monospace" 
                        textAnchor="end"
                        opacity="0.5"
                      >
                        {Math.round(targetVal)} €
                      </text>
                    </g>
                  );
                })}

                {/* Area fill under cumulative paid curve */}
                {duesPaidAreaPath && (
                  <path 
                    d={duesPaidAreaPath} 
                    fill="url(#duesGrad)" 
                  />
                )}

                {/* Cumulative paid line */}
                {duesPaidPath && (
                  <path 
                    d={duesPaidPath} 
                    fill="none" 
                    stroke="#C5A059" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                )}

                {/* Dues visual gradient definition */}
                <defs>
                  <linearGradient id="duesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C5A059" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Interactive circles */}
                {duesPoints.map((pt, idx) => {
                  const isHovered = hoveredMonthIndex === idx;
                  return (
                    <g key={idx}>
                      {/* Invisible hover zones */}
                      <rect 
                        x={pt.x - 12} 
                        y={padT} 
                        width="24" 
                        height={chartH} 
                        fill="transparent" 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIndex(idx)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                      />
                      {/* Visible point circle */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isHovered ? "5" : "3"} 
                        fill="#081619" 
                        stroke={isHovered ? "#0C7A7A" : "#C5A059"} 
                        strokeWidth="2" 
                        className="transition-all duration-150 pointer-events-none"
                      />
                      {/* X Axis Month Labels */}
                      <text 
                        x={pt.x} 
                        y={svgH - 8} 
                        fill="#87A0A0" 
                        fontSize="8" 
                        fontFamily="monospace" 
                        textAnchor="middle"
                        opacity={isHovered ? "1" : "0.6"}
                        className="transition-all pointer-events-none"
                      >
                        {pt.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic HTML Tooltip on hover */}
              {hoveredMonthIndex !== null && duesPoints[hoveredMonthIndex] && (
                <div className="absolute bg-[#122428] border border-amber-500/30 rounded-xl p-3 shadow-2xl z-50 text-xs w-56 animate-fade-in pointer-events-none"
                  style={{
                    left: `${Math.min(80, Math.max(5, (duesPoints[hoveredMonthIndex].x / svgW) * 100))}%`,
                    top: '15px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <p className="font-mono text-[10px] text-[#87A0A0] uppercase tracking-wider">
                    Situation à Fin
                  </p>
                  <p className="font-bold text-white text-sm">
                    {duesPoints[hoveredMonthIndex].fullName} 2026
                  </p>
                  <div className="border-t border-[#87A0A0]/10 mt-2 pt-1.5 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#87A0A0]">Encaissé Cumulé :</span>
                      <span className="font-bold text-emerald-400">
                        {duesPoints[hoveredMonthIndex].val.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#87A0A0]">Appel de fonds :</span>
                      <span className="font-mono text-white/80">
                        {duesPoints[hoveredMonthIndex].expected.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#87A0A0] pt-1 border-t border-dashed border-[#87A0A0]/5">
                      <span>Taux d'encaissement :</span>
                      <span className="font-bold text-amber-400">
                        {Math.round((duesPoints[hoveredMonthIndex].val / (duesPoints[hoveredMonthIndex].expected || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats Block: Key Indicators and Payment breakdown */}
          <div className="flex flex-col justify-between gap-4">
            {/* KPI Card */}
            <div className="bg-[#081619]/40 border border-amber-500/10 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] text-[#87A0A0] font-mono tracking-widest uppercase">Taux de Recouvrement</span>
                <h4 className="text-3xl font-extrabold text-[#C5A059] tracking-tight font-sans">
                  {globalCollectionRate}%
                </h4>
                <span className="text-[10px] text-[#87A0A0] block">
                  {totalCollectedDues.toLocaleString('fr-FR')} € sur {annualTargetDues.toLocaleString('fr-FR')} €
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#C5A059]" />
              </div>
            </div>

            {/* Dues categories breakdown */}
            <div className="bg-[#081619]/40 border border-amber-500/10 rounded-xl p-4 flex-grow flex flex-col justify-center gap-3.5 shadow-md">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block mb-1">Détails par Type de Dues</span>
              
              {/* Lodge dues */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Cotisations de Loge</span>
                  <span className="font-mono text-[#87A0A0]">
                    {members.filter(m => m.lodgeDuesPaid).length} / {members.length} payées
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#122428] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.round((members.filter(m => m.lodgeDuesPaid).length / members.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Order dues */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">Capitations Nationales</span>
                  <span className="font-mono text-[#87A0A0]">
                    {members.filter(m => m.orderDuesPaid).length} / {members.length} payées
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#122428] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.round((members.filter(m => m.orderDuesPaid).length / members.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Elevation dues */}
              {members.filter(m => m.elevationDues > 0).length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white">Droits d'Élévation de Grade</span>
                    <span className="font-mono text-[#87A0A0]">
                      {members.filter(m => m.elevationDues > 0 && m.elevationDuesPaid).length} / {members.filter(m => m.elevationDues > 0).length} payés
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#122428] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${Math.round((members.filter(m => m.elevationDues > 0 && m.elevationDuesPaid).length / (members.filter(m => m.elevationDues > 0).length || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer information bar */}
      <div className="mt-6 pt-4 border-t border-amber-500/10 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#87A0A0] font-mono gap-2">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-amber-500/60" />
          Mise à jour en temps réel d'après les registres du Secrétariat et de la Trésorerie
        </span>
        <span className="flex items-center gap-1">
          Période fiscale : 2026 • Clôture au 31 Décembre
        </span>
      </div>
    </div>
  );
}
