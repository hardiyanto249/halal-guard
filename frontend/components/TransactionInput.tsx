
import React, { useState } from 'react';
import { TransactionInput } from '../types';
import { Upload, Plus, Trash2, FileText, Play, Braces } from 'lucide-react';

interface Props {
  onAnalyze: (transactions: TransactionInput[]) => void;
  isAnalyzing: boolean;
}

const SAMPLE_DATA: TransactionInput[] = [
  { id: "TXN-001", description: "Pembayaran Bunga KPR Bulanan", amount: 1200000, date: "2023-10-01", type: "Expense" },
  { id: "TXN-002", description: "Pembelian Emas Digital (Non-fisik/Spot)", amount: 5000000, date: "2023-10-02", type: "Investment" },
  { id: "TXN-003", description: "Deposit Situs Judi Online", amount: 200000, date: "2023-10-03", type: "Entertainment" },
  { id: "TXN-004", description: "Belanja Bulanan Supermarket", amount: 1500000, date: "2023-10-04", type: "Expense" },
  { id: "TXN-005", description: "Denda Keterlambatan Kartu Kredit", amount: 75000, date: "2023-10-05", type: "Fee" },
  { id: "TXN-006", description: "Premi Asuransi Jiwa Konvensional", amount: 300000, date: "2023-10-06", type: "Insurance" },
  { id: "TXN-007", description: "Bagi Hasil Kemitraan Usaha (Mudharabah)", amount: 1200000, date: "2023-10-07", type: "Income" },
];

const TransactionInputForm: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
  const [transactions, setTransactions] = useState<TransactionInput[]>([]);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manual' | 'json'>('manual');

  const addEmptyTransaction = () => {
    const newTxn: TransactionInput = {
      id: `TXN-${Date.now()}`,
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'Expense'
    };
    setTransactions([...transactions, newTxn]);
  };

  const updateTransaction = (index: number, field: keyof TransactionInput, value: string | number) => {
    const newTxns = [...transactions];
    newTxns[index] = { ...newTxns[index], [field]: value };
    setTransactions(newTxns);
  };

  const removeTransaction = (index: number) => {
    setTransactions(transactions.filter((_, i) => i !== index));
  };

  const loadSample = () => {
    setTransactions(SAMPLE_DATA);
    setJsonInput(JSON.stringify(SAMPLE_DATA, null, 2));
  };

  const handleJsonAnalyze = () => {
    if (!jsonInput.trim()) return;

    try {
      // 1. Parse JSON
      let parsed = JSON.parse(jsonInput);
      
      // 2. Handle Single Object (Wrap in Array)
      if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
        parsed = [parsed];
      }

      // 3. Validation & Normalization
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
            alert("JSON array kosong.");
            return;
        }

        const normalizedData: TransactionInput[] = parsed.map((item: any, index: number) => ({
            id: item.id || `JSON-${Date.now()}-${index}`,
            description: item.description || "Transaksi Tanpa Keterangan",
            amount: Number(item.amount) || 0,
            date: item.date || new Date().toISOString().split('T')[0],
            type: item.type || "Expense"
        }));

        // Validasi minimal: harus ada deskripsi atau jumlah
        const isValid = normalizedData.every(t => t.description || t.amount > 0);

        if (isValid) {
            onAnalyze(normalizedData);
        } else {
            alert("Data JSON tidak valid. Pastikan setiap item memiliki 'description' atau 'amount'.");
        }
      } else {
        alert("Format JSON harus berupa Array transaksi [...] atau Object tunggal {...}.");
      }
    } catch (e) {
      console.error(e);
      alert("Format JSON Error: Pastikan menggunakan tanda kutip dua (\") untuk key dan value string, serta tidak ada koma berlebih (trailing comma).");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Input Transaksi</h2>
          <p className="text-slate-500 text-sm">Tambah manual atau tempel data JSON.</p>
        </div>
        <div className="flex gap-2">
           <button 
            type="button"
            onClick={loadSample}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <FileText size={16} /> Contoh Data
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button 
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manual' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual
        </button>
        <button 
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'json' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('json')}
        >
          JSON Paste
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-4">
          {transactions.map((txn, idx) => (
            <div key={txn.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-slate-50 rounded-lg border border-slate-200">
               <div className="md:col-span-4">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Keterangan</label>
                 <input 
                    type="text" 
                    value={txn.description}
                    onChange={(e) => updateTransaction(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Contoh: Bunga Pinjaman"
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Jumlah</label>
                 <input 
                    type="number" 
                    value={txn.amount}
                    onChange={(e) => updateTransaction(idx, 'amount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                 />
               </div>
               <div className="md:col-span-3">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal</label>
                 <input 
                    type="date" 
                    value={txn.date}
                    onChange={(e) => updateTransaction(idx, 'date', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Tipe</label>
                 <select
                    value={txn.type}
                    onChange={(e) => updateTransaction(idx, 'type', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                 >
                   <option value="Expense">Pengeluaran</option>
                   <option value="Income">Pemasukan</option>
                   <option value="Investment">Investasi</option>
                   <option value="Fee">Biaya Admin/Denda</option>
                   <option value="Insurance">Asuransi</option>
                 </select>
               </div>
               <div className="md:col-span-1 flex justify-center pb-2">
                 <button 
                  type="button"
                  onClick={() => removeTransaction(idx)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
            </div>
          ))}
          
          <div className="flex gap-3 mt-4">
            <button 
              type="button"
              onClick={addEmptyTransaction}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Plus size={16} /> Tambah Transaksi
            </button>
            {transactions.length > 0 && (
              <button 
                type="button"
                onClick={() => onAnalyze(transactions)}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {isAnalyzing ? (
                  <>Memproses...</>
                ) : (
                  <> <Play size={16} /> Jalankan Analisis AI</>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <div className="absolute top-3 right-3 pointer-events-none">
                 <Braces className="w-5 h-5 text-slate-300" />
            </div>
            <textarea
                className="w-full h-64 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                placeholder={`[\n  {\n    "description": "Bunga Bank",\n    "amount": 50000\n  }\n]`}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Mendukung format Array <code>[...]</code> atau Object tunggal <code>{`{...}`}</code>.
          </p>
          <div className="mt-4 flex justify-end">
            <button 
                type="button"
                onClick={handleJsonAnalyze}
                disabled={isAnalyzing || !jsonInput}
                className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                    <span className="flex items-center gap-2">Memproses...</span>
                ) : (
                    <span className="flex items-center gap-2"><Play size={16} /> Analisis JSON</span>
                )}
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionInputForm;
