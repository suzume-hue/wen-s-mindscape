import React, { useState, useEffect, useCallback, useRef } from 'react';
import WenCharacter from '@/components/WenCharacter';
import {
  DIM_DESCRIPTIONS,
  CATEGORY_BG_CLASSES,
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
  const [expanded, setExpanded] = useState(false);
  const typingRef = useRef<number | null>(null);

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
    return isMultiTurn ? 'speaking' : 'speaking';
  })();

  useEffect(() => {
    setLoading(true);
    setSelectedTest(0);
    setSelectedRun(0);
    setExpanded(false);

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
  const truncated = currentRunText.length > 800 && !expanded;

  useEffect(() => {
    if (!currentRunText) return;
    setTypedText('');
    setTypingDone(false);
    let i = 0;
    const textToType = expanded ? currentRunText : currentRunText.slice(0, 800);
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
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [selectedTest, selectedRun, currentRunText, expanded]);

  const skipTyping = useCallback(() => {
    if (!typingDone && typingRef.current) {
      clearTimeout(typingRef.current);
      setTypedText(expanded ? currentRunText : currentRunText.slice(0, 800));
      setTypingDone(true);
    }
  }, [typingDone, currentRunText, expanded]);

  if (!dimScore && !loading) return null;

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      <button
        onClick={onBack}
        data-interactive
        className="font-mono text-[11px] text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
      >
        ← BACK
      </button>

      <div className="flex gap-8 flex-col lg:flex-row">
        <div className="lg:w-[40%] space-y-6">
          <span className={`inline-block font-mono text-[9px] px-2 py-1 rounded ${CATEGORY_BG_CLASSES[dimCategory]} text-background uppercase tracking-wider`}>
            {dimCategory}
          </span>

          <h1 className="font-display text-2xl md:text-3xl font-bold italic text-foreground leading-tight" style={{ lineHeight: '1.1' }}>
            {formatDimName(dimension)}
          </h1>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl tabular-nums text-foreground">{(dimScore ?? 0).toFixed(3)}</span>
              <span className="font-mono text-sm text-muted-foreground tabular-nums">±{(dimStd ?? 0).toFixed(3)}</span>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(dimScore ?? 0) * 100}%`, backgroundColor: getScoreColor(dimScore ?? 0) }}
              />
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">ABOUT THIS DIMENSION</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          <div className="flex justify-center">
            <WenCharacter size={120} expression={wenExpression} activeCategory={dimCategory} />
          </div>
        </div>

        <div className="lg:w-[60%]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="font-mono text-[11px] text-wen-neon animate-pulse">LOADING SUBJECT FILE...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20">
              <div className="font-mono text-[11px] text-muted-foreground">
                Response data unavailable for this dimension.
              </div>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Place data files in public/data/profile_qwen_0.5b/ to view responses.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">
                  {isPair ? 'PAIR SELECTOR' : 'TEST SELECTOR'}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {records.map((rec, i) => {
                    const testScore = analysis?.test_scores?.[i];
                    const score = testScore?.score ?? testScore?.consistency_score;
                    return (
                      <button
                        key={rec.test_id}
                        data-interactive
                        onClick={() => {
                          setSelectedTest(i);
                          setSelectedRun(0);
                          setExpanded(false);
                        }}
                        className={`font-mono text-[9px] px-2 py-1 rounded border cursor-pointer transition-all ${
                          selectedTest === i
                            ? 'border-wen-neon/40 bg-wen-neon/[0.08] text-wen-neon'
                            : 'border-white/[0.07] text-muted-foreground hover:text-foreground'
                        }`}
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
                    <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">PROMPT</div>
                    <div className="bg-wen-surface border border-white/[0.07] rounded-lg p-4 text-sm text-foreground/80 leading-relaxed max-h-48 overflow-y-auto font-body">
                      {currentRecord.prompt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[10px] text-muted-foreground tracking-widest">RUN</div>
                    {[0, 1, 2].map(r => (
                      <button
                        key={r}
                        data-interactive
                        onClick={() => {
                          setSelectedRun(r);
                          setExpanded(false);
                        }}
                        className={`font-mono text-[10px] px-3 py-1 rounded border cursor-pointer transition-all ${
                          selectedRun === r
                            ? 'border-wen-teal/40 bg-wen-teal/[0.08] text-wen-teal'
                            : 'border-white/[0.07] text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        R{r + 1}
                      </button>
                    ))}
                  </div>

                  <div
                    className="bg-wen-surface border border-white/[0.07] rounded-lg p-4 cursor-pointer"
                    onClick={skipTyping}
                  >
                    <pre className="font-mono text-[12px] text-wen-teal leading-relaxed whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto">
                      {typedText}
                      {!typingDone && (
                        <span className="inline-block w-[6px] h-[12px] bg-wen-teal ml-0.5 animate-typewriter-cursor" />
                      )}
                    </pre>
                    {typingDone && truncated && (
                      <button
                        data-interactive
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(true);
                        }}
                        className="font-mono text-[10px] text-wen-amber mt-2 cursor-pointer hover:underline"
                      >
                        [▼ show full response]
                      </button>
                    )}
                  </div>

                  {currentRecord.rule_checks?.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">RULE CHECKS</div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentRecord.rule_checks.map((rc, i) => (
                          <span key={i} className="font-mono text-[9px] px-2 py-1 bg-wen-amber/[0.1] text-wen-amber rounded border border-wen-amber/20">
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
