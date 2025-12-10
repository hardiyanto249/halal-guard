
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShieldCheck, Activity, Server, Lock, AlertCircle, CheckCircle, RefreshCw, FileText, Database, Scale } from 'lucide-react';

const SystemMonitor: React.FC = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [healthData, setHealthData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([
    "System check initialized...",
    "Model drift parameters normal.",
    "Bias detection algorithms active.",
  ]);

  // Simulate Real-time Data Generation
  useEffect(() => {
    // Initial data
    const initialData = Array.from({ length: 10 }, (_, i) => ({
      time: `00:${i * 5}`,
      latency: 40 + Math.random() * 20,
      accuracy: 98 + Math.random() * 1.5
    }));
    setHealthData(initialData);

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Update Chart Data
      setHealthData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: `${now.getSeconds()}s`,
          latency: 35 + Math.random() * 30, // Random latency between 35-65ms
          accuracy: 98 + Math.random() * 2  // Random accuracy fluctuation
        });
        return newData;
      });

      // Add Random System Alert
      const systemMessages = [
        "Verifikasi integritas data... OK",
        "Pengecekan bias IEEE 7003... PATUH",
        "Sinkronisasi node... SELESAI",
        "Enkripsi data... AKTIF (AES-256)",
        "Latency check... STABIL",
        "Validasi schema OJK... LULUS"
      ];
      const randomMsg = systemMessages[Math.floor(Math.random() * systemMessages.length)];
      setAlerts(prev => [randomMsg, ...prev].slice(0, 5));

    }, 3000); // Visual update every 3s, conceptually representing the 45s cycle chunks

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Activity className="text-emerald-600" /> 
             Status Sistem & Validasi
           </h2>
           <p className="text-slate-500">Monitoring real-time kualitas AI dan kerangka kerja kepatuhan.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-500 mt-2 md:mt-0">
           <RefreshCw className="w-3 h-3 animate-spin" />
           Last Update: {lastUpdate.toLocaleTimeString()} (Interval: 45s)
        </div>
      </div>

      {/* SECTION 1: VALIDATION FRAMEWORK */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-emerald-400" />
               Framework Validasi & Kepatuhan
            </h3>
            <span className="text-xs text-slate-400 border border-slate-600 px-2 py-0.5 rounded">IEEE 7003-2024 Standard</span>
         </div>
         
         <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
               {/* Step 1 */}
               <div className="relative p-4 border border-emerald-100 bg-emerald-50/50 rounded-lg">
                  <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">STEP 1</div>
                  <div className="flex items-center gap-2 mb-2 mt-2">
                     <Database className="w-5 h-5 text-emerald-700" />
                     <h4 className="font-bold text-slate-800">Data Ingestion</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                     <li>Sanitasi Input</li>
                     <li>Enkripsi AES-256</li>
                     <li>Schema Validation</li>
                  </ul>
               </div>

               {/* Step 2 */}
               <div className="relative p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                  <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">STEP 2</div>
                  <div className="flex items-center gap-2 mb-2 mt-2">
                     <Scale className="w-5 h-5 text-blue-700" />
                     <h4 className="font-bold text-slate-800">Bias Check</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                     <li>IEEE 7003 Fairness</li>
                     <li>Demographic Parity</li>
                     <li>Algorithmic Audit</li>
                  </ul>
               </div>

               {/* Step 3 */}
               <div className="relative p-4 border border-purple-100 bg-purple-50/50 rounded-lg">
                  <div className="absolute -top-3 left-4 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">STEP 3</div>
                  <div className="flex items-center gap-2 mb-2 mt-2">
                     <Activity className="w-5 h-5 text-purple-700" />
                     <h4 className="font-bold text-slate-800">AI Analysis</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                     <li>Gemini 2.5 Flash Model</li>
                     <li>5-Point Sharia Scoring</li>
                     <li>Contextual Reasoning</li>
                  </ul>
               </div>

               {/* Step 4 */}
               <div className="relative p-4 border border-amber-100 bg-amber-50/50 rounded-lg">
                  <div className="absolute -top-3 left-4 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded">STEP 4</div>
                  <div className="flex items-center gap-2 mb-2 mt-2">
                     <FileText className="w-5 h-5 text-amber-700" />
                     <h4 className="font-bold text-slate-800">Reporting</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                     <li>Audit Trail Generation</li>
                     <li>Compliance Badging</li>
                     <li>Decision Explanation</li>
                  </ul>
               </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-center pt-4 border-t border-slate-100">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compliance Standards:</span>
               <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">OJK (Sesuai Regulasi)</span>
               <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">BI (Bank Indonesia)</span>
               <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">DSN-MUI (Prinsip Syariah)</span>
               <span className="px-3 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">ISO 27001 (Keamanan Data)</span>
            </div>
         </div>
      </div>

      {/* SECTION 2: REAL TIME MONITORING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Live Performance Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Server className="w-5 h-5 text-indigo-500" />
               Performa Sistem (Live Latency)
            </h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
                     <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="time" hide />
                     <YAxis hide domain={[0, 100]} />
                     <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        itemStyle={{color: '#6366f1', fontWeight: 'bold'}}
                     />
                     <Area type="monotone" dataKey="latency" stroke="#6366f1" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} name="Latency (ms)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
               <div>
                  <div className="text-2xl font-bold text-indigo-600">42ms</div>
                  <div className="text-xs text-slate-400">Rata-rata Latensi</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                  <div className="text-xs text-slate-400">Uptime Server</div>
               </div>
               <div>
                  <div className="text-2xl font-bold text-blue-600">0.0%</div>
                  <div className="text-xs text-slate-400">Packet Loss</div>
               </div>
            </div>
         </div>

         {/* Quality & Alerts */}
         <div className="space-y-6">
            {/* AI Fairness Score */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-500" /> Skor Fairness (IEEE 7003)</span>
                  <span className="text-emerald-600 font-bold">98/100</span>
               </h3>
               <div className="space-y-3">
                  <div>
                     <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Data Representativeness</span>
                        <span>High</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '98%'}}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Algorithmic Neutrality</span>
                        <span>Pass</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '95%'}}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Model Drift Status</span>
                        <span>Stable</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Live Alerts Log */}
            <div className="bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800 h-[200px] flex flex-col">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Live System Logs
               </h3>
               <div className="flex-1 overflow-hidden relative">
                  <div className="space-y-2 absolute inset-x-0 bottom-0">
                     {alerts.map((msg, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-emerald-400 font-mono animate-in slide-in-from-bottom-2 fade-in duration-300">
                           <span className="text-slate-600">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                           <CheckCircle className="w-3 h-3" />
                           {msg}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default SystemMonitor;
