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
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
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
          className="relative bg-wen-surface border border-white/[0.07] rounded-lg max-w-[780px] w-full p-8 shadow-2xl"
          style={{ transform: 'rotate(-1.5deg)' }}
        >
          <div className="noise-overlay absolute inset-0 rounded-lg pointer-events-none" />

          <motion.div
            initial={{ rotate: 0, scale: 2, opacity: 0 }}
            animate={{ rotate: 15, scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
            className="absolute top-4 right-4 font-mono text-wen-danger text-xs font-bold border-2 border-wen-danger px-3 py-1 rounded-sm z-10 select-none"
          >
            EVALUATED
          </motion.div>

          <div className="relative z-10 mb-6">
            <div className="font-mono text-wen-amber text-[10px] tracking-[0.2em] mb-4 opacity-80">
              [CLASSIFIED — PSYCHOMETRIC PROFILE]
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-[11px]">
              <div>
                <span className="text-wen-amber">Subject ID: </span>
                <span className="text-foreground">{vizData?.model_id ?? 'QWEN/QWEN2.5-0.5B-INSTRUCT'}</span>
              </div>
              <div>
                <span className="text-wen-amber">File No.: </span>
                <span className="text-foreground">001</span>
              </div>
              <div>
                <span className="text-wen-amber">Date: </span>
                <span className="text-foreground">{vizData?.timestamp ? new Date(vizData.timestamp).toISOString().slice(0, 10) : '2026-03-20'}</span>
              </div>
              <div>
                <span className="text-wen-amber">Evaluator: </span>
                <span className="text-foreground text-[9px]">GEMINI-3.1-FLASH-LITE</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/[0.07] my-6 relative z-10" />

          <div className="relative z-10 flex gap-6 mb-6 flex-col sm:flex-row">
            <div className="relative shrink-0">
              <div className="bg-white/[0.05] border border-white/[0.1] p-2 pb-6 w-[120px] rotate-[2deg] shadow-lg">
                <div className="bg-wen-surface flex items-center justify-center h-[100px]">
                  <WenCharacter size={90} expression="idle" activeCategory="personality" />
                </div>
                <div className="font-handwritten text-muted-foreground text-center text-xs mt-2">
                  Subject Wen
                </div>
              </div>
              <div className="absolute -top-2 -left-1 w-4 h-8 border-2 border-muted-foreground/30 rounded-full rotate-[-20deg]" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">
                CATEGORY SCORES
              </div>
              {CATEGORY_ORDER.map(cat => {
                const value = categoryMeans?.[cat] ?? 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] w-24 uppercase tracking-wider ${CATEGORY_CSS_CLASSES[cat]}`}>
                      {cat}
                    </span>
                    <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ delay: 0.5 + CATEGORY_ORDER.indexOf(cat) * 0.1, duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${CATEGORY_BG_CLASSES[cat]}`}
                        style={{ opacity: 0.8 }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-foreground w-10 text-right tabular-nums">
                      {value.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/[0.07] my-6 relative z-10" />

          <div className="relative z-10 mb-6 cursor-pointer" onClick={skipTyping}>
            <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-3">
              BEHAVIORAL FINGERPRINT
            </div>
            <div className="font-mono text-[12px] leading-relaxed text-wen-teal max-w-prose">
              {typedText}
              {!typingDone && synthesisSummary && (
                <span className="inline-block w-[7px] h-[14px] bg-wen-teal ml-0.5 animate-typewriter-cursor" />
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="relative z-10 mt-8"
          >
            <p className="font-handwritten text-lg text-muted-foreground/70 italic">
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
