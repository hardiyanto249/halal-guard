import React, { useState } from 'react';
import { CombinedResult, ViolationType, ComplianceStatus } from '../types';
import { AlertCircle, Check, HelpCircle, XCircle, Banknote, Calendar, Shield, HeartHandshake, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  data: CombinedResult[];
}

const getStatusColor = (status?: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ComplianceStatus.NON_COMPLIANT: return 'bg-red-100 text-red-800 border-red-200';
      case ComplianceStatus.NEEDS_REVIEW: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800';
    }
};

const ScoreBar = ({ label, score, weight, colorOverride }: { label: string, score: number, weight?: string, colorOverride?: string }) => {
    const percentage = score > 1 ? score : score * 100; // Handle 0-1 or 0-100 input
    let color = 'bg-emerald-500';
    
    if (colorOverride) {
        color = colorOverride;
    } else {
        if (percentage < 50) color = 'bg-red-500';
        else if (percentage < 80) color = 'bg-amber-500';
    }

    return (
      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
          <span>{label} {weight && <span className="text-slate-300">({weight})</span>}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
};

const TransactionCard: React.FC<{ item: CombinedResult }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Bagian Kiri: Info Transaksi */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(item.analysis?.status)}`}>
                      {item.analysis?.status || 'Pending'}
                    </span>
                    {item.analysis?.violationType !== ViolationType.HALAL && (
                       <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                         • Terdeteksi: {item.analysis?.violationType}
                       </span>
                    )}
                  </div>
                  
                  <h4 className="text-lg font-semibold text-slate-900 mb-1">{item.description}</h4>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-slate-400" />
                      Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {item.date}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-medium">
                      {item.type}
                    </span>
                  </div>

                  {item.analysis && (
                    <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-sm text-slate-700 leading-relaxed">
                                <span className="font-semibold text-slate-900">Analisis Kepatuhan:</span> {item.analysis.reasoning}
                            </p>
                            {item.analysis.suggestedCorrection && (
                                <div className="mt-2 text-sm text-emerald-700 bg-emerald-50/50 p-2 rounded border-l-2 border-emerald-400">
                                <strong>Saran:</strong> {item.analysis.suggestedCorrection}
                                </div>
                            )}
                        </div>
                        
                        {/* Maslahah/Social Impact Section inside card */}
                        {item.analysis.maslahahAnalysis && (
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 transition-all duration-300">
                                <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1 mb-2">
                                    <HeartHandshake className="w-3 h-3" /> Dampak Maslahah (Social Impact)
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="text-sm text-slate-600">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-blue-700">Skor: {item.analysis.maslahahAnalysis.totalScore}/100</span>
                                        </div>
                                        <p className="text-xs italic flex items-start gap-1">
                                            <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            {item.analysis.maslahahAnalysis.longTermProjection}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                         <ScoreBar label="Keadilan Eko." score={item.analysis.maslahahAnalysis.breakdown.economicJustice} colorOverride="bg-blue-400" />
                                         <ScoreBar label="Komunitas" score={item.analysis.maslahahAnalysis.breakdown.communityDevelopment} colorOverride="bg-blue-400" />
                                         
                                         {isExpanded && (
                                            <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-1 pt-1 border-t border-blue-200/50">
                                                <ScoreBar label="Pendidikan" score={item.analysis.maslahahAnalysis.breakdown.educationalImpact} colorOverride="bg-blue-400" />
                                                <ScoreBar label="Lingkungan" score={item.analysis.maslahahAnalysis.breakdown.environmental} colorOverride="bg-blue-400" />
                                                <ScoreBar label="Kohesi Sosial" score={item.analysis.maslahahAnalysis.breakdown.socialCohesion} colorOverride="bg-blue-400" />
                                            </div>
                                         )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Bagian Kanan: Scoring Breakdown (Compliance) */}
                {item.analysis?.breakdown && (
                  <div className="lg:w-64 flex flex-col gap-4">
                      {/* Compliance Score Box */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 h-full flex flex-col">
                        <div className="text-center mb-3 pb-2 border-b border-slate-200">
                            <div className="text-2xl font-bold text-emerald-800">{item.analysis.confidenceScore}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Compliance Score</div>
                        </div>
                        <div className="space-y-1.5 flex-grow">
                            <ScoreBar label="Riba" score={item.analysis.breakdown.ribaScore} weight="30%" />
                            <ScoreBar label="Gharar" score={item.analysis.breakdown.ghararScore} weight="25%" />
                            <ScoreBar label="Maysir" score={item.analysis.breakdown.maysirScore} weight="20%" />
                            
                            {isExpanded && (
                                <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-1.5 pt-1 border-t border-slate-200">
                                    <ScoreBar label="Objek Halal" score={item.analysis.breakdown.halalScore} weight="15%" />
                                    <ScoreBar label="Keadilan Harga" score={item.analysis.breakdown.justiceScore} weight="10%" />
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center pt-2 border-t border-slate-200">
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-[10px] text-slate-500 hover:text-emerald-600 font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                {isExpanded ? (
                                    <>Tutup Detail <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                    <>Lihat Detail Lengkap <ChevronDown className="w-3 h-3" /></>
                                )}
                            </button>
                        </div>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </div>
    );
};

const TransactionList: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-600" />
        Detail Analisis Transaksi
      </h3>
      
      <div className="grid gap-4">
        {data.map((item) => (
            <TransactionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default TransactionList;