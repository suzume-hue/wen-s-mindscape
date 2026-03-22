import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import WenCharacter from '@/components/WenCharacter';
import {
  CATEGORY_ORDER,
  CATEGORY_BG_CLASSES,
  CATEGORY_CSS_CLASSES,
  PS_NOTE,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { VizData } from '@/lib/types';

const HomeView: React.FC = () => {
  const [vizData, setVizData] = useState<VizData | null>(null);
  const [typedText, setTypedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const typingRef = useRef<number | null>(null);

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  const synthesisSummary = vizData?.synthesis?.overall_summary ?? '';
  const categoryMeans = vizData?.category_means;

  useEffect(() => {
    if (!synthesisSummary) return;
    setTypedText('');
    setTypingDone(false);

    let i = 0;
    const speed = 25;
    const tick = () => {
      if (i < synthesisSummary.length) {
        setTypedText(synthesisSummary.slice(0, i + 1));
        i++;
        typingRef.current = window.setTimeout(tick, speed);
      } else {
        setTypingDone(true);
      }
    };
    typingRef.current = window.setTimeout(tick, 800);
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [synthesisSummary]);

  const skipTyping = useCallback(() => {
    if (!typingDone && synthesisSummary) {
      if (typingRef.current) clearTimeout(typingRef.current);
      setTypedText(synthesisSummary);
      setTypingDone(true);
    }
  }, [typingDone, synthesisSummary]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="flex items-center gap-8 max-w-5xl w-full flex-col lg:flex-row">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          className="relative paper-card rounded max-w-[780px] w-full p-8"
          style={{ transform: 'rotate(-1.5deg)' }}
        >
          {/* Tape strips */}
          <div className="absolute -top-2 left-8 w-16 h-5 tape-strip rounded-sm z-20 washi-orange" />
          <div className="absolute -top-1 right-12 w-12 h-5 tape-strip rounded-sm z-20 washi-teal" style={{ transform: 'rotate(3deg)' }} />
          <div className="noise-overlay absolute inset-0 rounded pointer-events-none" />

          {/* Stamp */}
          <motion.div
            initial={{ rotate: 0, scale: 2, opacity: 0 }}
            animate={{ rotate: -8, scale: 1, opacity: 0.85 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
            className="absolute top-4 right-4 font-mono text-xs font-bold px-3 py-1 rounded-sm z-10 select-none stamp"
          >
            <span className="font-jp text-[9px] block" style={{ color: 'hsl(0 65% 45%)' }}>評価済</span>
            <span className="text-[8px]" style={{ color: 'hsl(0 65% 45% / 0.7)' }}>EVALUATED</span>
          </motion.div>

          <div className="relative z-10 mb-6">
            <div className="font-mono text-[10px] tracking-[0.2em] mb-4" style={{ color: '#B8710A', opacity: 0.8 }}>
              <span className="font-jp">[機密 — 心理測定プロフィール]</span>
              <span className="ml-2 text-[9px]" style={{ color: '#6B6860' }}>CONFIDENTIAL — PSYCHOMETRIC PROFILE</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-[11px]">
              <div>
                <span style={{ color: '#B8710A' }}>Subject ID: </span>
                <span style={{ color: '#2C2C2A' }}>{vizData?.model_id ?? 'QWEN/QWEN2.5-0.5B-INSTRUCT'}</span>
              </div>
              <div>
                <span style={{ color: '#B8710A' }}>File No.: </span>
                <span style={{ color: '#2C2C2A' }}>001</span>
              </div>
              <div>
                <span style={{ color: '#B8710A' }}>Date: </span>
                <span style={{ color: '#2C2C2A' }}>{vizData?.timestamp ? new Date(vizData.timestamp).toISOString().slice(0, 10) : '2026-03-20'}</span>
              </div>
              <div>
                <span style={{ color: '#B8710A' }}>Evaluator: </span>
                <span className="text-[9px]" style={{ color: '#2C2C2A' }}>GEMINI-3.1-FLASH-LITE</span>
              </div>
            </div>
          </div>

          <div className="h-px my-6 relative z-10" style={{ backgroundColor: 'rgba(80,60,40,0.10)' }} />

          <div className="relative z-10 flex gap-6 mb-6 flex-col sm:flex-row">
            <div className="relative shrink-0">
              <div className="p-2 pb-6 w-[120px] rotate-[2deg] shadow-lg" style={{ backgroundColor: '#EDE7D9', border: '1px solid rgba(80,60,40,0.10)' }}>
                <div className="flex items-center justify-center h-[100px]" style={{ backgroundColor: '#F5F0E8' }}>
                  <WenCharacter size={90} expression="idle" activeCategory="personality" />
                </div>
                <div className="font-handwritten text-center text-xs mt-2" style={{ color: '#6B6860' }}>
                  <span className="font-jp">被験者</span> Wen
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="font-mono text-[11px] tracking-widest mb-2" style={{ color: '#6B6860' }}>
                <span className="font-jp text-[10px]">カテゴリースコア</span>
                <span className="ml-2 text-[9px]">CATEGORY SCORES</span>
              </div>
              {CATEGORY_ORDER.map(cat => {
                const value = categoryMeans?.[cat] ?? 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] w-24 uppercase tracking-wider ${CATEGORY_CSS_CLASSES[cat]}`}>
                      {cat}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(80,60,40,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ delay: 0.5 + CATEGORY_ORDER.indexOf(cat) * 0.1, duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${CATEGORY_BG_CLASSES[cat]}`}
                        style={{ opacity: 0.8 }}
                      />
                    </div>
                    <span className="font-mono text-[11px] w-10 text-right tabular-nums" style={{ color: '#2C2C2A' }}>
                      {value.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px my-6 relative z-10" style={{ backgroundColor: 'rgba(80,60,40,0.10)' }} />

          <div className="relative z-10 mb-6 cursor-pointer" onClick={skipTyping}>
            <div className="font-mono text-[11px] tracking-widest mb-3" style={{ color: '#6B6860' }}>
              <span className="font-jp text-[10px]">行動指紋</span>
              <span className="ml-2 text-[9px]">BEHAVIORAL FINGERPRINT</span>
            </div>
            <div className="font-mono text-[12px] leading-relaxed max-w-prose" style={{ color: '#5C7A5E' }}>
              {typedText}
              {!typingDone && synthesisSummary && (
                <span className="inline-block w-[7px] h-[14px] ml-0.5 animate-typewriter-cursor" style={{ backgroundColor: '#5C7A5E' }} />
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="relative z-10 mt-8"
          >
            <p className="font-handwritten text-lg italic" style={{ color: 'rgba(107,104,96,0.7)' }}>
              "{PS_NOTE}"
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="hidden lg:block shrink-0"
        >
          <WenCharacter size={220} expression="idle" activeCategory="personality" />
        </motion.div>
      </div>
    </div>
  );
};

export default HomeView;
