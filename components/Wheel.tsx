
import React, { useRef, useEffect, useState } from 'react';
import { Entry, Theme } from '../types';
import { WHEEL_COLORS } from '../constants';

interface WheelProps {
  entries: Entry[];
  spinning: boolean;
  rotation: number;
  onSpinEnd: (winner: string) => void;
  theme: Theme;
}

const Wheel: React.FC<WheelProps> = ({ entries, spinning, rotation, onSpinEnd, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const colors = WHEEL_COLORS[theme];

  const audioContext = useRef<AudioContext | null>(null);
  const lastTickIndex = useRef<number>(-1);

  const playTick = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current.state === 'suspended') audioContext.current.resume();
      const osc = audioContext.current.createOscillator();
      const gain = audioContext.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioContext.current.currentTime);
      gain.gain.setValueAtTime(0.05, audioContext.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioContext.current.destination);
      osc.start();
      osc.stop(audioContext.current.currentTime + 0.05);
    } catch (e) {}
  };

  // Fungsi untuk merender roda ke canvas offscreen (Cache)
  const renderOffscreenWheel = () => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;
    const totalEntries = entries.length;
    if (totalEntries === 0) return;
    const arc = (2 * Math.PI) / totalEntries;

    ctx.clearRect(0, 0, size, size);

    entries.forEach((entry, i) => {
      const angle = i * arc;
      
      // Slice
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();
      
      // Border tipis antar irisan
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = totalEntries > 100 ? 1 : 4;
      ctx.stroke();

      // Text - Render hanya jika tidak terlalu banyak untuk dibaca, atau perkecil
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      
      // Font dinamis berdasarkan jumlah peserta
      const fontSize = Math.min(60, Math.max(10, 500 / Math.sqrt(totalEntries)));
      ctx.font = `900 ${fontSize}px 'Bungee'`;
      
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;

      // Sembunyikan teks jika terlalu rapat agar tidak berantakan
      if (totalEntries < 300 || i % 2 === 0) {
        const displayText = entry.text.length > 20 ? entry.text.substring(0, 17) + '...' : entry.text;
        ctx.fillText(displayText, radius - 40, fontSize / 3);
      }
      ctx.restore();
    });
  };

  // Render utama yang dipanggil setiap frame
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;

    ctx.clearRect(0, 0, size, size);

    // 1. Gambar Roda yang sudah di-cache dengan rotasi
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(currentRotation);
    ctx.drawImage(offscreenCanvasRef.current, -center, -center);
    ctx.restore();

    // 2. Gambar Ring Luar (Statis)
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    const ringGrad = ctx.createLinearGradient(0, 0, size, size);
    ringGrad.addColorStop(0, '#ffffff');
    ringGrad.addColorStop(0.5, '#cbd5e1');
    ringGrad.addColorStop(1, '#64748b');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 20;
    ctx.stroke();

    // 3. Center Hub (Statis)
    ctx.beginPath();
    ctx.arc(center, center, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
  };

  // Update cache saat data berubah
  useEffect(() => {
    renderOffscreenWheel();
    drawScene();
  }, [entries, theme]);

  // Handle animasi rotasi
  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();
    const duration = 5000;
    const startRotation = currentRotation;

    if (spinning) {
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        const ease = 1 - Math.pow(1 - t, 4);
        const nextRot = startRotation + (rotation * ease);
        
        setCurrentRotation(nextRot);

        // Sound logic
        if (entries.length > 0) {
            const segmentAngle = (2 * Math.PI) / entries.length;
            const normalizedRot = (nextRot % (2 * Math.PI));
            const activeIndex = Math.floor(((2 * Math.PI - normalizedRot) % (2 * Math.PI)) / segmentAngle);
            
            if (activeIndex !== lastTickIndex.current) {
              playTick();
              lastTickIndex.current = activeIndex;
            }
        }

        if (t < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          const segmentAngle = (2 * Math.PI) / entries.length;
          const finalIndex = Math.floor(((2 * Math.PI - (nextRot % (2 * Math.PI))) % (2 * Math.PI)) / segmentAngle);
          onSpinEnd(entries[finalIndex].text);
        }
      };
      animationFrame = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [spinning, rotation]);

  // Re-draw scene saat rotasi berubah
  useEffect(() => {
    drawScene();
  }, [currentRotation]);

  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto canvas-container">
      <div className="absolute top-1/2 -right-6 -translate-y-1/2 z-10">
        <div className="w-14 h-14 bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center rounded-2xl rotate-45 border-4 border-indigo-600">
            <div className="-rotate-45">
                <i className="fa-solid fa-chevron-left text-indigo-600 text-3xl"></i>
            </div>
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={1200} 
        className="w-full h-full rounded-full"
      />
    </div>
  );
};

export default Wheel;
