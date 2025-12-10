import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { AnalysisResult, ComplianceStatus, ViolationType } from '../types';
import { AlertTriangle, CheckCircle, Activity, Hexagon, HeartHandshake, TrendingUp, ShieldCheck } from 'lucide-react';

interface Props {
  results: AnalysisResult[];
}

const AnalysisDashboard: React.FC<Props> = ({ results }) => {
  const stats = useMemo(() => {
    const total = results.length;
    const compliant = results.filter(r => r.status === ComplianceStatus.COMPLIANT).length;
    const nonCompliant = results.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length;
    const review = results.filter(r => r.status === ComplianceStatus.NEEDS_REVIEW).length;

    const ribaCount = results.filter(r => r.violationType === ViolationType.RIBA).length;
    const ghararCount = results.filter(r => r.violationType === ViolationType.GHARAR).length;
    const maysirCount = results.filter(r => r.violationType === ViolationType.MAYSIR).length;
    const halalCount = results.filter(r => r.violationType === ViolationType.HALAL).length;

    // Hitung rata-rata skor kepatuhan
    const avgScore = total > 0 
      ? Math.round(results.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / total) 
      : 0;
    
    // Hitung rata-rata per dimensi prinsip kepatuhan
    const breakdownSums = results.reduce((acc, curr) => {
        if (curr.breakdown) {
            acc.riba += curr.breakdown.ribaScore;
            acc.gharar += curr.breakdown.ghararScore;
            acc.maysir += curr.breakdown.maysirScore;
            acc.halal += curr.breakdown.halalScore;
            acc.justice += curr.breakdown.justiceScore;
        }
        return acc;
    }, { riba: 0, gharar: 0, maysir: 0, halal: 0, justice: 0 });

    const radarData = total > 0 ? [
        { subject: 'Riba', A: Math.round((breakdownSums.riba / total) * 100), fullMark: 100 },
        { subject: 'Gharar', A: Math.round((breakdownSums.gharar / total) * 100), fullMark: 100 },
        { subject: 'Maysir', A: Math.round((breakdownSums.maysir / total) * 100), fullMark: 100 },
        { subject: 'Halal', A: Math.round((breakdownSums.halal / total) * 100), fullMark: 100 },
        { subject: 'Keadilan', A: Math.round((breakdownSums.justice / total) * 100), fullMark: 100 },
    ] : [];

    // --- LOGIKA BARU: MASLAHAH IMPACT ---
    const maslahahSums = results.reduce((acc, curr) => {
        if (curr.maslahahAnalysis?.breakdown) {
            acc.ecoJustice += curr.maslahahAnalysis.breakdown.economicJustice;
            acc.community += curr.maslahahAnalysis.breakdown.communityDevelopment;
            acc.education += curr.maslahahAnalysis.breakdown.educationalImpact;
            acc.env += curr.maslahahAnalysis.breakdown.environmental;
            acc.social += curr.maslahahAnalysis.breakdown.socialCohesion;
            acc.total += curr.maslahahAnalysis.totalScore;
        }
        return acc;
    }, { ecoJustice: 0, community: 0, education: 0, env: 0, social: 0, total: 0 });

    const avgMaslahahScore = total > 0 ? Math.round(maslahahSums.total / total) : 0;

    const maslahahBarData = total > 0 ? [
      { name: 'Keadilan Eko.', value: Math.round(maslahahSums.ecoJustice / total), color: '#3b82f6' }, // Blue
      { name: 'Komunitas', value: Math.round(maslahahSums.community / total), color: '#8b5cf6' }, // Violet
      { name: 'Pendidikan', value: Math.round(maslahahSums.education / total), color: '#f59e0b' }, // Amber
      { name: 'Lingkungan', value: Math.round(maslahahSums.env / total), color: '#10b981' }, // Emerald
      { name: 'Kohesi Sosial', value: Math.round(maslahahSums.social / total), color: '#ec4899' }, // Pink
    ] : [];

    return { 
        total, compliant, nonCompliant, review, 
        ribaCount, ghararCount, maysirCount, halalCount, 
        avgScore, radarData,
        avgMaslahahScore, maslahahBarData
    };
  }, [results]);

  const pieData = [
    { name: 'Riba', value: stats.ribaCount, color: '#ef4444' }, // Red
    { name: 'Gharar', value: stats.ghararCount, color: '#f97316' }, // Orange
    { name: 'Maysir', value: stats.maysirCount, color: '#eab308' }, // Yellow
    { name: 'Patuh/Halal', value: stats.halalCount, color: '#10b981' }, // Emerald
  ];

  const complianceData = [
    { name: 'Patuh', value: stats.compliant },
    { name: 'Melanggar', value: stats.nonCompliant },
    { name: 'Tinjau', value: stats.review },
  ];

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="bg-emerald-50 p-4 rounded-full mb-4">
            <Activity className="w-12 h-12 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Dashboard Kosong</h3>
        <p className="text-slate-500 max-w-md mt-2">
            Belum ada data transaksi yang dianalisis. Silakan masuk ke menu <span className="font-semibold text-emerald-700">Analisis</span> untuk mulai mendeteksi anomali syariah.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kartu Skor Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> Skor Kepatuhan (Compliance)</h2>
                <p className="text-emerald-100 opacity-90 text-sm mt-1">Berdasarkan 5 Prinsip Hukum Syariah</p>
             </div>
             <div className="flex items-end justify-between mt-6 relative z-10">
                 <div className="text-5xl font-extrabold tracking-tight">{stats.avgScore}<span className="text-2xl opacity-60">/100</span></div>
                 <div className={`px-4 py-1 rounded-full text-sm font-bold uppercase ${stats.avgScore > 80 ? 'bg-emerald-500/20 border border-emerald-400' : 'bg-white/20'}`}>
                    {stats.avgScore > 80 ? 'Sangat Baik' : 'Perlu Perbaikan'}
                 </div>
             </div>
             <Hexagon className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-600 opacity-20" />
          </div>

          <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-2"><HeartHandshake className="w-6 h-6" /> Skor Maslahah (Social Impact)</h2>
                <p className="text-indigo-100 opacity-90 text-sm mt-1">Dampak Kesejahteraan Sosial & Ekonomi</p>
             </div>
             <div className="flex items-end justify-between mt-6 relative z-10">
                 <div className="text-5xl font-extrabold tracking-tight">{stats.avgMaslahahScore}<span className="text-2xl opacity-60">/100</span></div>
                 <div className="text-sm font-medium opacity-80 max-w-[150px] text-right">
                    Indeks kontribusi terhadap kemaslahatan umat
                 </div>
             </div>
             <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500 opacity-20" />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-1">Total Transaksi</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-1">Terindikasi Pelanggaran</p>
            <p className="text-3xl font-bold text-red-600">{stats.nonCompliant}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-1">Patuh Syariah</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.compliant}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-1">Perlu Tinjauan</p>
            <p className="text-3xl font-bold text-amber-600">{stats.review}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Compliance */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-emerald-500" />
            Dimensi Kepatuhan Hukum (Fiqh)
           </h3>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Skor Kepatuhan"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
                <Tooltip 
                   formatter={(value) => [`${value}/100`, 'Skor']}
                   contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
              </RadarChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Bar Chart Maslahah Impact */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-indigo-500" />
            Analisis Dampak Maslahah (Social Impact)
           </h3>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.maslahahBarData} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                   <XAxis type="number" domain={[0, 100]} />
                   <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                   <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                     {stats.maslahahBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
           <p className="text-xs text-slate-500 mt-4 text-center">
             Mengukur manfaat sosial, ekonomi, dan lingkungan berdasarkan prinsip Maslahah Mursalah.
           </p>
        </div>

        {/* Violation Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Distribusi Jenis Pelanggaran
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Status Kepatuhan
           </h3>
           <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                   {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;