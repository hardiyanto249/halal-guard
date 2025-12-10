
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TransactionInputForm from './components/TransactionInput';
import AnalysisDashboard from './components/AnalysisDashboard';
import TransactionList from './components/TransactionList';
import SystemMonitor from './components/SystemMonitor';
import { TransactionInput, CombinedResult, ComplianceStatus } from './types';
import { analyzeTransactions } from './services/geminiService';
import { Loader2, FileText, AlertTriangle, Printer, Download } from 'lucide-react';

type ViewState = 'dashboard' | 'analysis' | 'reports' | 'monitoring';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [data, setData] = useState<CombinedResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (transactions: TransactionInput[]) => {
    setIsAnalyzing(true);
    setError(null);
    
    // Reset previous analysis but keep input data
    const initialData: CombinedResult[] = transactions.map(t => ({ ...t, analysis: undefined }));
    setData(initialData);

    try {
      const analysisResults = await analyzeTransactions(transactions);
      
      // Merge results with original data
      const mergedData: CombinedResult[] = transactions.map(txn => {
        const result = analysisResults.find(r => r.transactionId === txn.id);
        return {
          ...txn,
          analysis: result
        };
      });

      setData(mergedData);
      // Data updated, stay on analysis view to show results
    } catch (err) {
      console.error(err);
      setError("Gagal menganalisis transaksi. Periksa kunci API atau koneksi internet Anda.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const DashboardView = () => (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Kinerja Syariah</h2>
        <p className="text-slate-500">Ringkasan status kepatuhan berdasarkan 5 Prinsip Ekonomi Islam.</p>
      </div>
      <AnalysisDashboard results={data.map(d => d.analysis!).filter(Boolean)} />
    </div>
  );

  const AnalysisView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Input & Analisis Transaksi</h2>
        <p className="text-slate-500">Masukkan data transaksi untuk diaudit oleh AI secara real-time.</p>
      </div>
      
      <TransactionInputForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      
      {data.length > 0 && (
        <div className="mt-8">
            <TransactionList data={data} />
        </div>
      )}
    </div>
  );

  const ReportView = () => {
    const nonCompliant = data.filter(d => d.analysis?.status !== ComplianceStatus.COMPLIANT);
    const analyzedCount = data.filter(d => d.analysis).length;
    
    if (analyzedCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-100 text-center animate-in fade-in">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Belum Ada Laporan Tersedia</h3>
                <p className="text-slate-500 max-w-sm mt-2 mb-6">Lakukan analisis transaksi terlebih dahulu pada menu Analisis untuk menghasilkan laporan audit.</p>
                <button 
                  onClick={() => setCurrentView('analysis')}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Buka Menu Analisis
                </button>
            </div>
        )
    }

    const handleExport = () => {
        // Set nama file untuk PDF saat di-save via browser print
        const originalTitle = document.title;
        const dateStr = new Date().toISOString().split('T')[0];
        document.title = `Laporan_Audit_Syariah_${dateStr}`;
        window.print();
        // Kembalikan judul dokumen (opsional, browser modern menangani ini dengan cepat)
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 print:hidden">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800">Laporan Audit Formal</h2>
                   <p className="text-slate-500">Siap cetak untuk dokumentasi dan arsip.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExport} 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Printer size={16} /> Cetak
                    </button>
                    <button 
                        onClick={handleExport} 
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Ekspor PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-0 print:p-0">
                {/* Header Laporan */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">Laporan Kepatuhan Syariah</h1>
                        <p className="text-slate-500 mt-2">ID Laporan: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-slate-900">HalalGuard AI</p>
                        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-emerald-500 pl-3">Ringkasan Eksekutif</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                            <div className="text-3xl font-bold text-slate-800">{data.length}</div>
                            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Total Transaksi</div>
                        </div>
                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                            <div className="text-3xl font-bold text-red-600">{nonCompliant.length}</div>
                            <div className="text-xs font-semibold text-red-600 uppercase mt-1">Temuan Pelanggaran</div>
                        </div>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <div className="text-3xl font-bold text-emerald-600">{data.length - nonCompliant.length}</div>
                            <div className="text-xs font-semibold text-emerald-600 uppercase mt-1">Transaksi Patuh</div>
                        </div>
                    </div>
                </div>

                {/* Tabel Temuan */}
                {nonCompliant.length > 0 ? (
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-red-500 pl-3">Rincian Temuan & Rekomendasi</h3>
                        <div className="overflow-hidden border border-slate-200 rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaksi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggaran</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Skor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi Perbaikan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200 text-sm">
                                    {nonCompliant.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{item.description}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{item.date} • ID: {item.id}</div>
                                                <div className="text-slate-600 font-medium mt-1">Rp {item.amount.toLocaleString('id-ID')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {item.analysis?.violationType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                {item.analysis?.confidenceScore}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {item.analysis?.suggestedCorrection || "Tidak ada saran spesifik."}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 bg-emerald-50 text-emerald-800 rounded-lg text-center border border-emerald-200">
                        <div className="text-5xl mb-4">✨</div>
                        <h3 className="font-bold text-xl mb-2">Alhamdulillah, Bersih!</h3>
                        <p>Berdasarkan analisis AI, tidak ditemukan indikasi pelanggaran syariah (Riba, Gharar, Maysir) dalam dataset ini.</p>
                    </div>
                )}
                
                {/* Footer Laporan */}
                <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                    <p>Generated by HalalGuard AI System.</p>
                    <p>Dokumen ini adalah hasil analisis komputasi dan bukan fatwa resmi.</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
                <strong className="font-bold">Terjadi Kesalahan: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Menganalisis Transaksi...</h3>
            <p className="text-slate-500 mb-8">Memeriksa terhadap 5 Prinsip Ekonomi Islam</p>
            <div className="flex gap-4 text-sm text-slate-400">
                <span>• Riba</span>
                <span>• Gharar</span>
                <span>• Maysir</span>
                <span>• Halal</span>
                <span>• Keadilan</span>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'analysis' && <AnalysisView />}
        {currentView === 'reports' && <ReportView />}
        {currentView === 'monitoring' && <SystemMonitor />}

      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p className="font-medium text-slate-500">&copy; {new Date().getFullYear()} HalalGuard AI.</p>
          <p className="mt-2 max-w-2xl mx-auto">
            Disclaimer: Skor dan analisis yang dihasilkan adalah estimasi berbasis AI untuk tujuan edukasi dan deteksi dini. 
            Mohon konsultasikan kasus kompleks dengan Dewan Pengawas Syariah yang bersertifikat.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
