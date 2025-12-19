
import React, { useEffect, useState } from 'react';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

interface WinnerModalProps {
  winner: string | null;
  onClose: () => void;
  onRemove: (name: string) => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, onRemove }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (winner) {
      setShow(true);
      
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      const audio = new Audio('https://www.soundjay.com/misc/sounds/magic-chime-01.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } else {
      setShow(false);
    }
  }, [winner]);

  if (!winner || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative bg-[#0f172a] border border-white/10 rounded-[3rem] p-12 max-w-2xl w-full shadow-[0_0_100px_rgba(99,102,241,0.3)] text-center transform scale-in duration-500 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px] -z-10"></div>
        
        <div className="w-24 h-24 bg-white/5 border border-white/10 text-yellow-400 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-4xl shadow-2xl">
          <i className="fa-solid fa-trophy animate-bounce"></i>
        </div>
        
        <h2 className="text-xl font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">PEMENANG TERPILIH</h2>
        
        <div className="text-7xl md:text-8xl font-black text-white py-10 mb-10 tracking-tight leading-tight" style={{ fontFamily: 'Bungee' }}>
          {winner}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className="py-5 px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl uppercase tracking-widest text-xs transition-all border border-slate-700"
          >
            TETAP DI DAFTAR
          </button>
          <button
            onClick={() => onRemove(winner)}
            className="py-5 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-105 active:scale-95"
          >
            HAPUS & LANJUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
