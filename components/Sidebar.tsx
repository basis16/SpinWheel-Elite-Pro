
import React, { useState, useRef } from 'react';
import { Entry } from '../types';

interface SidebarProps {
  entries: Entry[];
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  onShuffle: () => void;
  disabled: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ entries, setEntries, onShuffle, disabled }) => {
  const [inputText, setInputText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addEntry = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (entries.length >= 500) {
      alert('Maksimal 500 nama diperbolehkan.');
      return;
    }
    const newEntry = { id: Math.random().toString(36).substr(2, 9) + Date.now(), text: trimmed };
    setEntries((prev) => [newEntry, ...prev]);
    setInputText('');
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter(e => e.id !== id));
  };

  const handleConfirmClear = () => {
    setEntries([]);
    setShowConfirm(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
      
      const newEntries = lines.map((text) => ({
        id: Math.random().toString(36).substr(2, 9) + Date.now() + Math.random(),
        text: text.trim().substring(0, 50)
      }));

      setEntries((prev) => {
        const combined = [...newEntries, ...prev];
        if (combined.length > 500) {
          alert('Beberapa nama tidak ditambahkan karena melebihi batas 500.');
          return combined.slice(0, 500);
        }
        return combined;
      });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 overflow-hidden relative">
      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-xs w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/20">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Hapus Semua?</h3>
            <p className="text-slate-500 text-sm mb-6">Tindakan ini tidak dapat dibatalkan. Semua nama akan hilang.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmClear}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 space-y-6">
        <header>
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <i className="fa-solid fa-users-gear text-indigo-500"></i>
            Daftar Peserta
          </h2>
          <p className="text-slate-500 text-sm mt-1">Total: {entries.length} / 500</p>
        </header>
        
        <div className="space-y-3">
          <div className="flex gap-2 p-1.5 bg-slate-800/50 rounded-2xl border border-slate-700/50 focus-within:border-indigo-500/50 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
              placeholder="Ketik nama di sini..."
              disabled={disabled}
              className="flex-1 px-4 py-2 bg-transparent text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
            />
            <button
              onClick={addEntry}
              disabled={disabled || !inputText}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onShuffle}
              disabled={disabled || entries.length < 2}
              className="py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 border border-slate-700"
            >
              <i className="fa-solid fa-shuffle mr-2"></i> Acak
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={disabled || entries.length === 0}
              className="py-3 bg-red-950/20 text-red-400 rounded-xl hover:bg-red-900/30 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 border border-red-900/30"
            >
              <i className="fa-solid fa-trash mr-2"></i> Hapus
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full py-4 bg-emerald-600/10 text-emerald-400 rounded-2xl hover:bg-emerald-600/20 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 border border-emerald-900/30 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-file-import text-lg"></i>
            Upload File .TXT
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".txt" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 space-y-2 pb-6 custom-scrollbar">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="group flex items-center justify-between p-4 bg-slate-800/30 border border-slate-800 rounded-2xl hover:border-slate-700 hover:bg-slate-800/50 transition-all"
          >
            <span className="text-white font-semibold truncate pr-4 text-sm tracking-wide">{entry.text}</span>
            <button
              onClick={() => removeEntry(entry.id)}
              disabled={disabled}
              className="p-2 text-slate-600 hover:text-red-500 transition-colors disabled:opacity-0 focus:outline-none"
              title="Hapus Peserta"
            >
              <i className="fa-solid fa-circle-xmark text-lg"></i>
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4 text-slate-600">
            <i className="fa-solid fa-inbox text-4xl opacity-20"></i>
            <p className="text-sm italic tracking-wide">Belum ada peserta</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-950/80 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
          SpinWheel Elite Professional Edition
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
