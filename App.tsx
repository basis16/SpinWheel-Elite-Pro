
import React, { useState, useCallback } from 'react';
import Wheel from './components/Wheel';
import Sidebar from './components/Sidebar';
import WinnerModal from './components/WinnerModal';
import { Entry, Theme } from './types';
import { DEFAULT_ENTRIES } from './constants';

const App: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>(
    DEFAULT_ENTRIES.map((text, i) => ({ id: i.toString() + Date.now(), text }))
  );
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(Theme.NEON);

  const spin = useCallback(() => {
    if (spinning || entries.length < 2) return;
    
    setWinner(null);
    setSpinning(true);
    
    // Putaran ekstra untuk estetika profesional
    const extraDegrees = Math.random() * (2 * Math.PI);
    const newRotation = (Math.PI * 2 * (15 + Math.random() * 10)) + extraDegrees;
    setRotation(newRotation);
  }, [spinning, entries.length]);

  const onSpinEnd = (winnerName: string) => {
    setSpinning(false);
    setWinner(winnerName);
  };

  const removeWinner = (name: string) => {
    setEntries(prev => prev.filter(e => e.text !== name));
    setWinner(null);
  };

  const shuffleEntries = () => {
    setEntries(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0f172a] overflow-hidden">
      {/* Header Mobile */}
      <header className="md:hidden flex items-center justify-between p-5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-30 shadow-lg">
        <h1 className="text-2xl font-black text-white tracking-tighter">
          SPINWHEEL <span className="text-indigo-500">ELITE</span>
        </h1>
        <button 
          onClick={() => document.getElementById('sidebar-overlay')?.classList.toggle('hidden')}
          className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-xl text-indigo-400 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-bars-staggered"></i>
        </button>
      </header>

      {/* Area Roda Utama */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Glow Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] -z-10 animate-pulse delay-700"></div>

        <div className="absolute top-10 left-10 hidden md:block">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <span className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 border border-indigo-400/20">
              <i className="fa-solid fa-bolt"></i>
            </span>
            SPINWHEEL <span className="text-indigo-500">ELITE</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 tracking-[0.2em] uppercase text-[10px]">SISTEM UNDIAN PREMIUM</p>
        </div>

        {/* Theme Selector */}
        <div className="absolute top-10 right-10 flex items-center gap-1 bg-slate-900/60 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800 z-20 shadow-2xl">
          {Object.values(Theme).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${
                theme === t 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Wheel Container */}
        <div className="w-full h-full flex flex-col items-center justify-center gap-12 md:gap-16">
          <Wheel 
            entries={entries} 
            spinning={spinning} 
            rotation={rotation} 
            onSpinEnd={onSpinEnd}
            theme={theme}
          />
          
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <button
              onClick={spin}
              disabled={spinning || entries.length < 2}
              className={`
                relative group z-20 w-full
                py-7 rounded-[2rem] text-2xl font-black uppercase tracking-[0.4em]
                transition-all duration-500 transform overflow-hidden
                ${spinning || entries.length < 2
                  ? 'bg-slate-800 text-slate-700 cursor-not-allowed border border-slate-700 opacity-50'
                  : 'bg-white text-slate-950 shadow-[0_20px_80px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_100px_rgba(99,102,241,0.5)] hover:-translate-y-2 hover:scale-105 active:scale-95'
                }
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative z-10">
                {spinning ? 'MEMUTAR...' : 'SPIN NOW'}
              </span>
            </button>

            {/* Info Badge */}
            <div className="flex gap-6 items-center px-8 py-4 bg-slate-900/80 border border-slate-800/80 rounded-[1.5rem] text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-xl backdrop-blur-md">
               <span className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
                {entries.length} PESERTA AKTIF
              </span>
              <div className="w-px h-4 bg-slate-800"></div>
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-crown text-yellow-500/40"></i> SESI UNDIAN
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block w-[450px] bg-slate-900 border-l border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-30">
        <Sidebar 
          entries={entries} 
          setEntries={setEntries} 
          onShuffle={shuffleEntries}
          disabled={spinning}
        />
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <div 
        id="sidebar-overlay"
        className="fixed inset-0 z-40 hidden md:hidden"
      >
        <div 
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
          onClick={() => document.getElementById('sidebar-overlay')?.classList.add('hidden')}
        ></div>
        <div className="absolute right-0 top-0 bottom-0 w-[85%] bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-slate-800">
           <Sidebar 
            entries={entries} 
            setEntries={setEntries} 
            onShuffle={shuffleEntries}
            disabled={spinning}
          />
        </div>
      </div>

      <WinnerModal 
        winner={winner} 
        onClose={() => setWinner(null)} 
        onRemove={removeWinner}
      />
    </div>
  );
};

export default App;
