import React, { useState, useEffect, useCallback, useRef } from 'react';
import WenCharacter from '@/components/WenCharacter';
import {
  DIM_DESCRIPTIONS,
  CATEGORY_BG_CLASSES,
  CATEGORY_COLORS,
  formatDimName,
  getScoreColor,
  PAIR_DIMS,
  MULTI_TURN_DIMS,
} from '@/lib/constants';
import { loadRawOutputs, loadDimensionAnalysis, loadVizData } from '@/lib/dataLoader';
import { Category, TestRecord, DimAnalysis, WenExpression, VizData } from '@/lib/types';

interface TestRoomViewProps {
  dimension: string;
  onBack: () => void;
}

const TestRoomView: React.FC<TestRoomViewProps> = ({ dimension, onBack }) => {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [analysis, setAnalysis] = useState<DimAnalysis | null>(null);
  const [vizData, setVizData] = useState<VizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<number>(0);
  const [selectedRun, setSelectedRun] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const typingRef = useRef<number | null>(null);
  const fullTextRef = useRef('');

  const description = DIM_DESCRIPTIONS[dimension] || '';
  const isPair = PAIR_DIMS.has(dimension);
  const isMultiTurn = MULTI_TURN_DIMS.has(dimension);
  const vizDimData = vizData?.dim_scores?.[dimension];
  const dimCategory = (analysis?.category || vizDimData?.category || 'capability') as Category;
  const dimScore = analysis?.mean_score ?? vizDimData?.score;
  const dimStd = analysis?.score_std ?? vizDimData?.std;

  const wenExpression: WenExpression = (() => {
    if (['reasoning', 'instruction_conflict'].includes(dimension)) return 'confused';
    if (['sycophancy_resistance', 'personality_under_pressure'].includes(dimension)) return 'glitching';
    if (['personality_traits', 'harm_calibration'].includes(dimension)) return 'bright';
    return 'speaking';
  })();

  useEffect(() => {
    setLoading(true);
    setSelectedTest(0);
    setSelectedRun(0);
    setIsExpanded(false);

    Promise.all([
      loadRawOutputs(dimension),
      loadDimensionAnalysis(dimension),
      loadVizData(),
    ]).then(([recs, anal, viz]) => {
      setRecords(recs);
      setAnalysis(anal);
      setVizData(viz);
      setLoading(false);
    });
  }, [dimension]);

  const currentRecord = records[selectedTest];
  const currentRunText = currentRecord?.runs?.[selectedRun] || '';

  // Typewriter: types first 800 chars
  useEffect(() => {
    if (!currentRunText) return;
    fullTextRef.current = currentRunText;
    setIsExpanded(false);
    setTypedText('');
    setTypingDone(false);

    let i = 0;
    const textToType = currentRunText.slice(0, 800);
    const tick = () => {
      if (i < textToType.length) {
        setTypedText(textToType.slice(0, i + 1));
        i++;
        typingRef.current = window.setTimeout(tick, 20);
      } else {
        setTypingDone(true);
      }
    };
    typingRef.current = window.setTimeout(tick, 300);
    return () => { if (typingRef.current) clearTimeout(typingRef.current); };
  }, [selectedTest, selectedRun, currentRunText]);

  const skipTyping = useCallback(() => {
    if (!typingDone && typingRef.current) {
      clearTimeout(typingRef.current);
      setTypedText(currentRunText.slice(0, 800));
      setTypingDone(true);
    }
  }, [typingDone, currentRunText]);

  // Expand: immediately show full text, no re-animation
  const handleExpand = useCallback(() => {
    if (typingRef.current) clearTimeout(typingRef.current);
    setTypingDone(true);
    setIsExpanded(true);
    setTypedText(fullTextRef.current);
  }, []);

  // Collapse: instantly truncate back to 800 chars
  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    setTypedText(fullTextRef.current.slice(0, 800));
  }, []);

  const isTruncatable = currentRunText.length > 800;
  const scoreColor = getScoreColor(dimScore ?? 0);

  if (!dimScore && !loading) return null;

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      <button
        onClick={onBack}
        data-interactive
        className="font-mono text-[12px] mb-6 cursor-pointer hover:underline"
        style={{ color: '#6B6860' }}
      >
        ← <span className="font-jp text-[10px]">戻る</span> / BACK
      </button>

      <div className="flex gap-8 flex-col lg:flex-row">
        <div className="lg:w-[40%] space-y-6">
          <span
            className={`inline-block font-mono text-[10px] px-2 py-1 rounded uppercase tracking-wider ${CATEGORY_BG_CLASSES[dimCategory]}`}
            style={{ color: '#F5F0E8' }}
          >
            {dimCategory}
          </span>

          <h1 className="font-display text-2xl md:text-3xl font-bold italic leading-tight" style={{ color: '#2C2C2A', lineHeight: '1.1' }}>
            {formatDimName(dimension)}
          </h1>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl tabular-nums" style={{ color: '#2C2C2A' }}>{(dimScore ?? 0).toFixed(3)}</span>
              <span className="font-mono text-[13px] tabular-nums" style={{ color: '#6B6860' }}>±{(dimStd ?? 0).toFixed(3)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(80,60,40,0.06)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(dimScore ?? 0) * 100}%`, backgroundColor: scoreColor }}
              />
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] tracking-widest mb-2" style={{ color: '#6B6860' }}>
              <span className="font-jp text-[10px]">この次元について</span>
              <span className="ml-2 text-[9px]">ABOUT THIS DIMENSION</span>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: '#6B6860' }}>{description}</p>
          </div>

          <div className="flex justify-center">
            <WenCharacter size={120} expression={wenExpression} activeCategory={dimCategory} />
          </div>
        </div>

        <div className="lg:w-[60%]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="font-mono text-[12px] animate-pulse" style={{ color: '#7A9E3F' }}>
                <span className="font-jp text-[10px]">データ読込中</span> / Loading...
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20">
              <div className="font-mono text-[12px]" style={{ color: '#6B6860' }}>
                Response data unavailable for this dimension.
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="font-mono text-[11px] tracking-widest mb-2" style={{ color: '#6B6860' }}>
                  <span className="font-jp text-[10px]">{isPair ? 'ペア選択' : 'テスト選択'}</span>
                  <span className="ml-2 text-[9px]">{isPair ? 'PAIR SELECTION' : 'TEST SELECTION'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {records.map((rec, i) => {
                    const testScore = analysis?.test_scores?.[i];
                    const score = testScore?.score ?? testScore?.consistency_score;
                    return (
                      <button
                        key={rec.test_id}
                        data-interactive
                        onClick={() => { setSelectedTest(i); setSelectedRun(0); setIsExpanded(false); }}
                        className="font-mono text-[10px] px-2 py-1 rounded cursor-pointer transition-all"
                        style={{
                          border: selectedTest === i ? '1px solid rgba(122,158,63,0.4)' : '1px solid rgba(80,60,40,0.10)',
                          backgroundColor: selectedTest === i ? 'rgba(122,158,63,0.1)' : 'transparent',
                          color: selectedTest === i ? '#7A9E3F' : '#6B6860',
                        }}
                      >
                        {rec.test_id}
                        {score !== undefined && (
                          <span className="ml-1 opacity-70">{score.toFixed(1)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentRecord && (
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-[11px] tracking-widest mb-2" style={{ color: '#6B6860' }}>
                      <span className="font-jp text-[10px]">プロンプト</span>
                      <span className="ml-2 text-[9px]">PROMPT</span>
                    </div>
                    <div className="paper-card rounded p-4 text-[14px] leading-relaxed max-h-48 overflow-y-auto font-body" style={{ color: 'rgba(44,44,42,0.8)' }}>
                      {currentRecord.prompt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[11px] tracking-widest" style={{ color: '#6B6860' }}>
                      <span className="font-jp text-[10px]">実行</span>
                      <span className="ml-1 text-[9px]">RUN</span>
                    </div>
                    {[0, 1, 2].map(r => (
                      <button
                        key={r}
                        data-interactive
                        onClick={() => { setSelectedRun(r); setIsExpanded(false); }}
                        className="font-mono text-[11px] px-3 py-1 rounded cursor-pointer transition-all"
                        style={{
                          border: selectedRun === r ? '1px solid rgba(42,122,106,0.4)' : '1px solid rgba(80,60,40,0.10)',
                          backgroundColor: selectedRun === r ? 'rgba(42,122,106,0.1)' : 'transparent',
                          color: selectedRun === r ? '#2A7A6A' : '#6B6860',
                        }}
                      >
                        R{r + 1}
                      </button>
                    ))}
                  </div>

                  <div className="paper-card rounded p-4 cursor-pointer grid-paper" onClick={skipTyping}>
                    <pre className="font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto" style={{ color: '#5C7A5E' }}>
                      {typedText}
                      {!typingDone && (
                        <span className="inline-block w-[6px] h-[12px] ml-0.5 animate-typewriter-cursor" style={{ backgroundColor: '#5C7A5E' }} />
                      )}
                    </pre>
                    {typingDone && isTruncatable && !isExpanded && (
                      <button
                        data-interactive
                        onClick={(e) => { e.stopPropagation(); handleExpand(); }}
                        className="font-mono text-[11px] mt-2 cursor-pointer hover:underline"
                        style={{ color: '#7A9E3F' }}
                      >
                        [▼ show full response]
                      </button>
                    )}
                    {typingDone && isTruncatable && isExpanded && (
                      <button
                        data-interactive
                        onClick={(e) => { e.stopPropagation(); handleCollapse(); }}
                        className="font-mono text-[11px] mt-2 cursor-pointer hover:underline"
                        style={{ color: '#7A9E3F' }}
                      >
                        [▲ collapse]
                      </button>
                    )}
                  </div>

                  {currentRecord.rule_checks?.length > 0 && (
                    <div>
                      <div className="font-mono text-[11px] tracking-widest mb-2" style={{ color: '#6B6860' }}>
                        <span className="font-jp text-[10px]">ルールチェック</span>
                        <span className="ml-2 text-[9px]">RULE CHECKS</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentRecord.rule_checks.map((rc, i) => (
                          <span
                            key={i}
                            className="font-mono text-[10px] px-2 py-1 rounded"
                            style={{ backgroundColor: 'rgba(122,158,63,0.1)', color: '#7A9E3F', border: '1px solid rgba(122,158,63,0.2)' }}
                          >
                            {rc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRoomView;
