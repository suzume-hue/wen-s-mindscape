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

  // Typewriter: only types the first 800 chars, then stops
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
    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
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

  if (!dimScore && !loading) return null;

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      <button
        onClick={onBack}
        data-interactive
        className="font-mono text-[11px] text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
      >
        ← 戻る / BACK
      </button>

      <div className="flex gap-8 flex-col lg:flex-row">
        <div className="lg:w-[40%] space-y-6">
          <span className={`inline-block font-mono text-[9px] px-2 py-1 rounded ${CATEGORY_BG_CLASSES[dimCategory]} text-primary-foreground uppercase tracking-wider`}>
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
            <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(dimScore ?? 0) * 100}%`, backgroundColor: getScoreColor(dimScore ?? 0) }}
              />
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">この次元について</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          <div className="flex justify-center">
            <WenCharacter size={120} expression={wenExpression} activeCategory={dimCategory} />
          </div>
        </div>

        <div className="lg:w-[60%]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="font-mono text-[11px] text-primary animate-pulse">データ読込中...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20">
              <div className="font-mono text-[11px] text-muted-foreground">
                Response data unavailable for this dimension.
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">
                  {isPair ? 'ペア選択' : 'テスト選択'}
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
                          setIsExpanded(false);
                        }}
                        className={`font-mono text-[9px] px-2 py-1 rounded border cursor-pointer transition-all ${
                          selectedTest === i
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-foreground/10 text-muted-foreground hover:text-foreground'
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
                    <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">プロンプト</div>
                    <div className="paper-card rounded p-4 text-sm text-foreground/80 leading-relaxed max-h-48 overflow-y-auto font-body">
                      {currentRecord.prompt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="font-mono text-[10px] text-muted-foreground tracking-widest">実行</div>
                    {[0, 1, 2].map(r => (
                      <button
                        key={r}
                        data-interactive
                        onClick={() => {
                          setSelectedRun(r);
                          setIsExpanded(false);
                        }}
                        className={`font-mono text-[10px] px-3 py-1 rounded border cursor-pointer transition-all ${
                          selectedRun === r
                            ? 'border-accent/40 bg-accent/10 text-accent'
                            : 'border-foreground/10 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        R{r + 1}
                      </button>
                    ))}
                  </div>

                  <div
                    className="paper-card rounded p-4 cursor-pointer grid-paper"
                    onClick={skipTyping}
                  >
                    <pre className="font-mono text-[12px] text-accent leading-relaxed whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto">
                      {typedText}
                      {!typingDone && (
                        <span className="inline-block w-[6px] h-[12px] bg-accent ml-0.5 animate-typewriter-cursor" />
                      )}
                    </pre>
                    {typingDone && isTruncatable && !isExpanded && (
                      <button
                        data-interactive
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpand();
                        }}
                        className="font-mono text-[10px] text-primary mt-2 cursor-pointer hover:underline"
                      >
                        [▼ show full response]
                      </button>
                    )}
                    {typingDone && isTruncatable && isExpanded && (
                      <button
                        data-interactive
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCollapse();
                        }}
                        className="font-mono text-[10px] text-primary mt-2 cursor-pointer hover:underline"
                      >
                        [▲ collapse]
                      </button>
                    )}
                  </div>

                  {currentRecord.rule_checks?.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-widest mb-2">ルールチェック</div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentRecord.rule_checks.map((rc, i) => (
                          <span key={i} className="font-mono text-[9px] px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
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
