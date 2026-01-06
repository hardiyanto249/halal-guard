
import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface Props {
  currentView: 'dashboard' | 'analysis' | 'reports' | 'monitoring';
  onNavigate: (view: 'dashboard' | 'analysis' | 'reports' | 'monitoring') => void;
}

const Header: React.FC<Props> = ({ currentView, onNavigate }) => {
  const getLinkClass = (view: string) => {
    const baseClass = "cursor-pointer transition-colors px-3 py-2 rounded-md";
    return currentView === view
      ? `${baseClass} text-white bg-emerald-800`
      : `${baseClass} hover:text-emerald-300 hover:bg-emerald-800/50`;
  };

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">HalalGuard AI</h1>
            <p className="text-xs text-emerald-300">Deteksi Anomali Transaksi Syariah</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-2 text-sm font-medium items-center">
          <button onClick={() => onNavigate('dashboard')} className={getLinkClass('dashboard')}>
            Dashboard
          </button>
          <button onClick={() => onNavigate('analysis')} className={getLinkClass('analysis')}>
            Analisis
          </button>
          <button onClick={() => onNavigate('reports')} className={getLinkClass('reports')}>
            Laporan
          </button>
          <div className="h-6 w-px bg-emerald-700 mx-2"></div>
          <button onClick={() => onNavigate('monitoring')} className={`${getLinkClass('monitoring')} flex items-center gap-1.5`}>
            <Activity className="w-4 h-4" /> Status Sistem
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
