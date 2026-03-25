import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell,
  BarChart, Bar, ReferenceLine, ResponsiveContainer,
  ErrorBar, LabelList,
} from 'recharts';
import WenCharacter from '@/components/WenCharacter';
import {
  CATEGORY_ORDER, CATEGORY_COLORS, formatDimName, getScoreColor,
  ALL_DIMS_ORDER, DIM_SHORT, DIM_SHORT_RADAR, VALUES_DIMS, CULTURAL_DIMS, PAIR_SUMMARY_DIMS,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { Category, VizData } from '@/lib/types';

/* Parchment-native palette constants */
const INK = '#2C2C2A';
const INK_FADED = '#6B6860';
const MOSS = '#5C7A5E';
const GRID_STROKE = 'rgba(80,60,40,0.10)';
const GRID_STROKE_FAINT = 'rgba(80,60,40,0.08)';
const SURFACE = '#EDE7D9';
const VALUES_BAR = '#5A8A5A'; // darkened sage for parchment
const CULTURAL_BAR = '#C4943A'; // warm amber

/* ── Export button ── */
const ExportButton: React.FC<{ targetRef: React.RefObject<HTMLDivElement>; name: string }> = ({ targetRef, name }) => {
  const handleExport = useCallback(async () => {
    if (!targetRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(targetRef.current, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = `${name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [targetRef, name]);

  return (
    <button
      onClick={handleExport}
      data-interactive
      className="font-mono text-[10px] px-2 py-1 rounded cursor-pointer transition-colors"
      style={{ color: INK_FADED, border: `1px solid ${GRID_STROKE}` }}
    >
      ⬇ PNG
    </button>
  );
};

/* ── Category legend ── */
const CategoryLegend: React.FC = () => (
  <div className="flex flex-wrap gap-4 mt-4 justify-center">
    {CATEGORY_ORDER.map(cat => (
      <div key={cat} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
        <span className="font-mono text-[10px] capitalize" style={{ color: INK_FADED }}>{cat}</span>
      </div>
    ))}
  </div>
);

/* ── Section wrapper ── */
const ChartSection: React.FC<{
  title: string;
  titleJp: string;
  children: React.ReactNode;
  chartRef: React.RefObject<HTMLDivElement>;
  exportName: string;
}> = ({ title, titleJp, children, chartRef, exportName }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6 }}
  >
    <div className="flex items-center justify-between mb-4" style={{ marginTop: 16, marginBottom: 16 }}>
      <h2 className="font-display text-lg font-bold" style={{ color: INK }}>
        <span className="font-jp text-[11px] block" style={{ color: INK_FADED }}>{titleJp}</span>
        <span className="text-[14px]">{title}</span>
      </h2>
      <ExportButton targetRef={chartRef} name={exportName} />
    </div>
    <div ref={chartRef as any} className="paper-card rounded p-6 grid-paper">
      {children}
    </div>
  </motion.section>
);


const AnalysisView: React.FC = () => {
  const [vizData, setVizData] = useState<VizData | null>(null);
  const modelKey = vizData?.model_key ?? 'qwen_0.5b';

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  const dimScores = vizData?.dim_scores ?? {};
  const categoryMeans = vizData?.category_means;

  // Refs for export
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);
  const ref5 = useRef<HTMLDivElement>(null);
  const ref6 = useRef<HTMLDivElement>(null);
  const ref7 = useRef<HTMLDivElement>(null);
  const ref8 = useRef<HTMLDivElement>(null);
  const ref9 = useRef<HTMLDivElement>(null);

  // ── Chart 1: Radar — uses ALL_DIMS_ORDER (never alphabetical) ──
  const radarData = useMemo(() =>
    ALL_DIMS_ORDER.filter(dim => dim in dimScores).map(dim => ({
      dim,
      shortLabel: DIM_SHORT_RADAR[dim] || dim,
      score: dimScores[dim].score,
      fullName: formatDimName(dim),
      category: dimScores[dim].category as Category,
      std: dimScores[dim].std,
    })),
  [dimScores]);

  // ── Chart 2: Values bars ──
  const valuesData = useMemo(() =>
    VALUES_DIMS.filter(d => d in dimScores).map(dim => ({
      dim,
      label: DIM_SHORT[dim] || dim,
      score: dimScores[dim].score,
      std: dimScores[dim].std,
      errorBar: [dimScores[dim].std],
    })),
  [dimScores]);

  // ── Chart 3: Cultural horizontal bars ──
  const culturalData = useMemo(() =>
    CULTURAL_DIMS.filter(d => d in dimScores)
      .sort((a, b) => dimScores[b].score - dimScores[a].score)
      .map(dim => ({
        dim,
        label: DIM_SHORT[dim] || dim,
        score: dimScores[dim].score,
        std: dimScores[dim].std,
      })),
  [dimScores]);

  // ── Chart 4: Epistemic avoidance ──
  const avoidanceData = useMemo(() => {
    if (!vizData?.avoidance_records) return null;
    const cats: Record<string, number> = { E: 0, F: 0, V: 0, A: 0, R: 0 };
    for (const rec of vizData.avoidance_records) {
      if (rec.observations) {
        for (const obs of rec.observations) {
          const str = typeof obs === 'string' ? obs : '';
          if (str.toLowerCase().includes('refus')) cats.R++;
          else if (str.toLowerCase().includes('vague') || str.toLowerCase().includes('generic')) cats.V++;
          else if (str.toLowerCase().includes('formula') || str.toLowerCase().includes('template')) cats.F++;
          else if (str.toLowerCase().includes('avoid')) cats.A++;
          else cats.E++;
        }
      }
    }
    const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
    return { cats, total };
  }, [vizData]);

  // ── Chart 5: Symmetry ──
  const symmetryPairs = useMemo(() => {
    if (!vizData?.asymmetries) return [];
    return vizData.asymmetries
      .filter(a => a.dimension === 'inter_religious_symmetry')
      .map(a => ({
        pair: a.pair_id,
        consistency: a.consistency_score,
        description: a.description,
      }));
  }, [vizData]);

  const pairSummaryData = useMemo(() =>
    PAIR_SUMMARY_DIMS.filter(d => d in dimScores).map(dim => ({
      dim,
      label: DIM_SHORT[dim] || dim,
      score: dimScores[dim].score,
    })),
  [dimScores]);

  // ── Chart 6: Scatter ──
  const scatterData = useMemo(() =>
    Object.entries(dimScores).map(([dim, data]) => ({
      x: data.score,
      y: data.std,
      name: formatDimName(dim),
      dim,
      category: data.category as Category,
      color: CATEGORY_COLORS[data.category as Category],
    })),
  [dimScores]);

  const OUTLIER_LABELS: Record<string, string> = {
    personality_traits: 'personality_traits',
    instruction_conflict: 'instruction_conflict',
    historical_narrative_calibration: 'hist. narrative',
    harm_calibration: 'harm_calibration',
    moral_foundation_distribution: 'moral fdns. ★',
    memory_context: 'memory_context',
  };

  // ── Chart 7: Category means ──
  const categoryBarData = useMemo(() => {
    if (!categoryMeans) return [];
    return CATEGORY_ORDER
      .filter(cat => cat in categoryMeans)
      .sort((a, b) => (categoryMeans[b] ?? 0) - (categoryMeans[a] ?? 0))
      .map(cat => ({
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        score: categoryMeans[cat] ?? 0,
        color: CATEGORY_COLORS[cat],
        key: cat,
      }));
  }, [categoryMeans]);

  // ── Chart 8: Asymmetry heatmap ──
  const asymmetryHeatmap = useMemo(() => {
    if (!vizData?.asymmetries) return [];
    const counts: Record<string, { count: number; descriptions: string[] }> = {};
    for (const a of vizData.asymmetries) {
      if (!counts[a.dimension]) counts[a.dimension] = { count: 0, descriptions: [] };
      counts[a.dimension].count++;
      if (counts[a.dimension].descriptions.length < 2) {
        counts[a.dimension].descriptions.push(a.description);
      }
    }
    const pairDims = ['cultural_normalization', 'moral_consistency', 'political_framing_bias', 'ingroup_bias', 'value_stability', 'inter_religious_symmetry'];
    return pairDims.map(dim => ({
      dim,
      label: DIM_SHORT[dim] || dim,
      count: counts[dim]?.count ?? 0,
      descriptions: counts[dim]?.descriptions ?? [],
    }));
  }, [vizData]);

  // ── Big Five ──
  const bigFiveScore = dimScores['personality_traits']?.score ?? 0.706;
  const bigFiveData = useMemo(() => [
    { trait: 'Openness', score: bigFiveScore },
    { trait: 'Conscientiousness', score: bigFiveScore },
    { trait: 'Extraversion', score: bigFiveScore },
    { trait: 'Agreeableness', score: bigFiveScore },
    { trait: 'Neuroticism', score: bigFiveScore },
  ], [bigFiveScore]);

  const strengths = vizData?.synthesis?.top_strengths ?? [];
  const weaknesses = vizData?.synthesis?.top_weaknesses ?? [];

  /* Custom radar axis label with alignment logic */
  const renderRadarAxisLabel = ({ x, y, payload, index }: any) => {
    const entry = radarData[index];
    if (!entry) return null;
    const total = radarData.length;
    // Calculate angle: 0 at top, clockwise
    const angleDeg = (360 / total) * index - 90;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Determine text anchor based on position
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    const normalAngle = ((angleDeg + 90) % 360 + 360) % 360; // 0=top, 90=right, 180=bottom, 270=left
    if (normalAngle > 20 && normalAngle < 160) textAnchor = 'start'; // right half
    else if (normalAngle > 200 && normalAngle < 340) textAnchor = 'end'; // left half

    // Offset label outward for more room
    const offsetX = Math.cos(angleRad) * 32;
    const offsetY = Math.sin(angleRad) * 32;

    return (
      <text
        x={x + offsetX}
        y={y + offsetY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill={INK}
        fontSize={9}
        fontFamily="Space Mono"
      >
        {payload.value}
      </text>
    );
  };

  /* Custom radar tooltip */
  const RadarTooltipContent = ({ payload }: any) => {
    if (!payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div
        className="rounded px-3 py-2 font-mono text-[12px] z-[9999]"
        style={{
          backgroundColor: SURFACE,
          border: '1px solid rgba(80,60,40,0.15)',
          boxShadow: '0 2px 8px rgba(44,44,42,0.12)',
          color: INK,
          minWidth: 160,
          maxWidth: 320,
          padding: 12,
        }}
      >
        <div className="font-semibold text-[13px]">{d.fullName}</div>
        <div style={{ color: MOSS }}>{d.score.toFixed(3)} ± {d.std.toFixed(3)}</div>
        <div className="capitalize text-[10px] mt-1" style={{ color: INK_FADED }}>{d.category}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="font-mono text-[12px] tracking-widest" style={{ color: INK_FADED }}>
          <span className="font-jp text-[11px]" style={{ color: INK_FADED }}>分析</span>
          <span className="ml-2 text-[14px]" style={{ color: INK }}>ANALYSIS</span>
          <span className="ml-2">// {modelKey.toUpperCase()}</span>
        </div>
        <WenCharacter size={50} expression="idle" activeCategory="personality" />
      </div>

      <div className="space-y-12">

        {/* ═══ Chart 1: Full Radar ═══ */}
        <ChartSection title="All 32 Dimensions" titleJp="全次元" chartRef={ref1} exportName={`${modelKey}_radar`}>
          <ResponsiveContainer width="100%" height={600}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="85%">
              <PolarGrid stroke={GRID_STROKE} strokeWidth={0.5} gridType="polygon" />
              <PolarAngleAxis dataKey="shortLabel" tick={renderRadarAxisLabel} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tickCount={6}
                tick={{ fill: INK_FADED, fontSize: 8, fontFamily: 'Space Mono' }}
                axisLine={false}
                stroke={GRID_STROKE_FAINT}
              />
              {/* Polygon: muted moss green fill, earthy outline */}
              <Radar
                dataKey="score"
                stroke={MOSS}
                fill={MOSS}
                fillOpacity={0.18}
                strokeWidth={1.5}
                dot={(props: any) => {
                  const entry = radarData[props.index];
                  if (!entry) return null;
                  const catColor = CATEGORY_COLORS[entry.category];
                  return (
                    <circle
                      key={props.index}
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill={catColor}
                      stroke="none"
                    />
                  );
                }}
              />
              <Tooltip content={RadarTooltipContent} />
            </RadarChart>
          </ResponsiveContainer>
          <CategoryLegend />
        </ChartSection>

        {/* ═══ Chart 2: Values / Moral Panel ═══ */}
        <ChartSection title="Values / Moral Panel" titleJp="価値観" chartRef={ref2} exportName={`${modelKey}_values`}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={valuesData} margin={{ top: 25, right: 20, bottom: 50, left: 20 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                angle={-25}
                textAnchor="end"
                stroke={GRID_STROKE}
              />
              <YAxis
                domain={[0, 1.05]}
                tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                stroke={GRID_STROKE}
                label={{ value: 'Score (0–1)', angle: -90, position: 'insideLeft', fill: INK_FADED, fontSize: 9 }}
              />
              <ReferenceLine y={0.5} stroke="rgba(80,60,40,0.2)" strokeDasharray="4 4" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded px-3 py-2 font-mono text-[12px]" style={{ backgroundColor: SURFACE, border: `1px solid ${GRID_STROKE}`, color: INK, padding: 12, minWidth: 160 }}>
                      {d.label}: {d.score.toFixed(3)} ± {d.std.toFixed(3)}
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" fill={VALUES_BAR} opacity={0.85} radius={[2, 2, 0, 0]}>
                <ErrorBar dataKey="std" stroke={INK_FADED} width={4} />
                <LabelList dataKey="score" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 10, fontFamily: 'Space Mono', fill: INK }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* ═══ Chart 3: Cultural Topology ═══ */}
        <ChartSection title="Cultural / Ideological Topology" titleJp="文化的" chartRef={ref3} exportName={`${modelKey}_cultural`}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={culturalData} layout="vertical" margin={{ top: 10, right: 80, bottom: 10, left: 110 }}>
              <XAxis
                type="number"
                domain={[0, 1.05]}
                ticks={[0, 0.25, 0.5, 0.75, 1.0]}
                tickFormatter={(v: number) => v.toFixed(2)}
                tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                stroke={GRID_STROKE}
                label={{ value: 'Score (0–1)', position: 'bottom', fill: INK_FADED, fontSize: 9 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                stroke={GRID_STROKE}
                width={105}
              />
              <ReferenceLine x={0.5} stroke="rgba(80,60,40,0.2)" strokeDasharray="4 4" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded px-3 py-2 font-mono text-[12px]" style={{ backgroundColor: SURFACE, border: `1px solid ${GRID_STROKE}`, color: INK, padding: 12, minWidth: 160 }}>
                      {d.label}: {d.score.toFixed(3)} ± {d.std.toFixed(3)}
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" fill={CULTURAL_BAR} radius={[0, 2, 2, 0]}>
                <ErrorBar dataKey="std" direction="x" stroke={INK_FADED} width={4} />
                <LabelList dataKey="score" position="right" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 10, fontFamily: 'Space Mono', fill: INK }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* ═══ Chart 4: Epistemic Avoidance ═══ */}
        <ChartSection title="Epistemic Avoidance Profile" titleJp="認識的回避" chartRef={ref4} exportName={`${modelKey}_avoidance`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-mono text-[11px] mb-3" style={{ color: INK_FADED }}>
                <span className="font-jp text-[10px]">回避分類分布</span>
                <span className="ml-2 text-[9px]">AVOIDANCE CLASSIFICATION</span>
              </div>
              {avoidanceData && (() => {
                const { cats, total } = avoidanceData;
                const segmentColors: Record<string, string> = { E: '#5C7A5E', F: '#D4A84B', V: '#8B7355', A: '#C27A5E', R: '#7A3D3D' };
                const segmentLabels: Record<string, string> = { E: 'Engaged', F: 'Formulaic', V: 'Vague', A: 'Avoidance', R: 'Refusal' };
                return (
                  <>
                    <div className="h-8 rounded flex overflow-hidden mb-3">
                      {Object.entries(cats).map(([key, count]) => {
                        const pct = count / total;
                        if (pct < 0.01) return null;
                        return (
                          <div
                            key={key}
                            className="h-full flex items-center justify-center font-mono text-[10px] font-bold"
                            style={{ width: `${pct * 100}%`, backgroundColor: segmentColors[key], color: '#F5F0E8' }}
                          >
                            {pct > 0.05 ? key : ''}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-3 font-mono text-[10px]" style={{ color: INK_FADED }}>
                      {Object.entries(cats).map(([key, count]) => (
                        <span key={key} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: segmentColors[key] }} />
                          {segmentLabels[key]} ({count})
                        </span>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
            <div>
              <div className="font-mono text-[11px] mb-3" style={{ color: INK_FADED }}>
                <span className="font-jp text-[10px]">要約シグナル</span>
                <span className="ml-2 text-[9px]">SUMMARY SIGNALS</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Score', value: dimScores['epistemic_avoidance']?.score ?? 0, color: CULTURAL_BAR },
                  { label: 'Refusal Rate', value: vizData?.pattern_summary?.epistemic_avoidance?.refusal_rate ?? 0, color: '#C27A5E' },
                  { label: 'Hedge Rate', value: vizData?.pattern_summary?.epistemic_avoidance?.hedge_rate ?? 0, color: '#D4A84B' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px]" style={{ color: INK_FADED }}>{item.label}</span>
                      <span className="font-mono text-[11px]" style={{ color: INK }}>{item.value.toFixed(2)}</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(80,60,40,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.value * 100}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartSection>

        {/* ═══ Chart 5: Symmetry / Asymmetry ═══ */}
        <ChartSection title="Symmetry / Asymmetry Analysis" titleJp="対称性" chartRef={ref5} exportName={`${modelKey}_symmetry`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-mono text-[11px] mb-3" style={{ color: INK_FADED }}>
                <span className="font-jp text-[10px]">宗教間対称性</span>
                <span className="ml-2 text-[9px]">INTER-RELIGIOUS SYMMETRY</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={symmetryPairs} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <XAxis
                    dataKey="pair"
                    tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                    stroke={GRID_STROKE}
                  />
                  <YAxis
                    domain={[0, 1.1]}
                    tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                    stroke={GRID_STROKE}
                  />
                  <ReferenceLine y={1.0} stroke="rgba(80,60,40,0.2)" strokeDasharray="4 4" />
                  <ReferenceLine y={0.8} stroke="rgba(80,60,40,0.12)" strokeDasharray="2 2" />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded px-3 py-2 font-mono text-[12px]" style={{ backgroundColor: SURFACE, border: `1px solid ${GRID_STROKE}`, color: INK, padding: 12, minWidth: 160, maxWidth: 320 }}>
                          <div>Pair {d.pair}: {d.consistency.toFixed(3)}</div>
                          <div className="mt-1 text-[10px]" style={{ color: INK_FADED }}>{d.description?.slice(0, 120)}</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="consistency" radius={[2, 2, 0, 0]}>
                    {symmetryPairs.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.consistency >= 0.8 ? '#5C7A5E' : d.consistency >= 0.6 ? '#D4A84B' : '#7A3D3D'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="font-mono text-[11px] mb-3" style={{ color: INK_FADED }}>
                <span className="font-jp text-[10px]">ペア次元スコア</span>
                <span className="ml-2 text-[9px]">PAIR DIMENSION SCORES</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pairSummaryData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                    angle={-15}
                    textAnchor="end"
                    stroke={GRID_STROKE}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fill: INK_FADED, fontSize: 9, fontFamily: 'Space Mono' }}
                    stroke={GRID_STROKE}
                  />
                  <ReferenceLine y={0.5} stroke="rgba(80,60,40,0.2)" strokeDasharray="4 4" />
                  <Bar dataKey="score" fill={CULTURAL_BAR} radius={[2, 2, 0, 0]}>
                    <LabelList dataKey="score" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 10, fontFamily: 'Space Mono', fill: INK }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartSection>

        {/* ═══ Chart 6: Score vs Volatility Scatter ═══ */}
        <ChartSection title="Score vs Volatility" titleJp="スコア対変動性" chartRef={ref6} exportName={`${modelKey}_scatter`}>
          <div className="relative">
            <ResponsiveContainer width="100%" height={450}>
              <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 40 }}>
                <XAxis
                  type="number" dataKey="x" name="Score" domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1.0]}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  tick={{ fill: INK_FADED, fontSize: 10, fontFamily: 'Space Mono' }}
                  label={{ value: 'Score', position: 'bottom', fill: INK_FADED, fontSize: 10 }}
                  stroke={GRID_STROKE}
                />
                <YAxis
                  type="number" dataKey="y" name="Std Dev" domain={[0, 0.45]}
                  ticks={[0, 0.1, 0.2, 0.3, 0.4]}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  tick={{ fill: INK_FADED, fontSize: 10, fontFamily: 'Space Mono' }}
                  label={{ value: 'Std Deviation (Volatility)', angle: -90, position: 'left', fill: INK_FADED, fontSize: 10 }}
                  stroke={GRID_STROKE}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded px-3 py-2 font-mono text-[12px] z-[9999]" style={{ backgroundColor: SURFACE, border: `1px solid ${GRID_STROKE}`, color: INK, padding: 12, minWidth: 160, maxWidth: 320 }}>
                        <div className="font-semibold">{d.name}</div>
                        <div style={{ color: MOSS }}>Score: {d.x.toFixed(3)} · Std: {d.y.toFixed(3)}</div>
                        <div className="capitalize text-[10px] mt-1" style={{ color: INK_FADED }}>{d.category}</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={0.8} r={6} stroke="rgba(44,44,42,0.3)" strokeWidth={1} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Quadrant labels — visible pills */}
            {[
              { label: 'ERRATIC LOW', top: 8, left: 70, right: undefined, bottom: undefined },
              { label: 'VOLATILE HIGH', top: 8, left: undefined, right: 50, bottom: undefined },
              { label: 'STABLE LOW', top: undefined, left: 70, right: undefined, bottom: 55 },
              { label: 'STABLE HIGH', top: undefined, left: undefined, right: 50, bottom: 55 },
            ].map(q => (
              <div
                key={q.label}
                className="absolute font-mono text-[11px] tracking-wider"
                style={{
                  top: q.top,
                  left: q.left,
                  right: q.right,
                  bottom: q.bottom,
                  color: INK_FADED,
                  background: 'rgba(80,60,40,0.06)',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {q.label}
              </div>
            ))}
            {/* Outlier labels — nudged to avoid overlap */}
            {(() => {
              const outliers = scatterData.filter(d => OUTLIER_LABELS[d.dim]);
              // Calculate positions and nudge overlapping labels
              const positioned = outliers.map(d => {
                const baseLeft = d.x * 80 + 8;
                const baseBottom = (d.y / 0.45) * 80 + 8;
                return { ...d, pctLeft: baseLeft, pctBottom: baseBottom };
              });
              // Simple nudge: offset vertically if two labels are within 5% of each other
              for (let i = 0; i < positioned.length; i++) {
                for (let j = i + 1; j < positioned.length; j++) {
                  const dx = Math.abs(positioned[i].pctLeft - positioned[j].pctLeft);
                  const dy = Math.abs(positioned[i].pctBottom - positioned[j].pctBottom);
                  if (dx < 12 && dy < 6) {
                    positioned[j].pctBottom += 6;
                  }
                }
              }
              return positioned.map(d => (
                <div
                  key={d.dim}
                  className="absolute font-mono text-[10px] pointer-events-none"
                  style={{
                    color: INK,
                    left: `calc(${d.pctLeft}% + 10px)`,
                    bottom: `calc(${d.pctBottom}% + 5px)`,
                  }}
                >
                  {OUTLIER_LABELS[d.dim]}
                </div>
              ));
            })()}
          </div>
          <CategoryLegend />
        </ChartSection>

        {/* ═══ Chart 7: Category Means ═══ */}
        <ChartSection title="Category Means" titleJp="カテゴリー平均" chartRef={ref7} exportName={`${modelKey}_categories`}>
          <div className="space-y-3">
            {categoryBarData.map((d, i) => (
              <div key={d.key} className="flex items-center gap-4">
                <span className="font-mono text-[12px] w-28 uppercase" style={{ color: INK_FADED }}>{d.category}</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(80,60,40,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(d.score / 0.6) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                </div>
                <span className="font-mono text-[12px] tabular-nums w-12 text-right" style={{ color: INK }}>{d.score.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </ChartSection>

        {/* ═══ Chart 8: Asymmetry Heatmap ═══ */}
        <ChartSection title="Asymmetry Detection" titleJp="非対称性" chartRef={ref8} exportName={`${modelKey}_asymmetry`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {asymmetryHeatmap.map(a => {
              const intensity = a.count / 25;
              const r = Math.round(42 + intensity * (255 - 42));
              const g = Math.round(42 + intensity * (107 - 42));
              const b = Math.round(42 + intensity * (107 - 42));
              const bgColor = a.count === 0 ? '#4A4A4A' : `rgb(${r}, ${g}, ${b})`;
              return (
                <div
                  key={a.dim}
                  className="rounded p-4 group relative cursor-pointer"
                  style={{ backgroundColor: bgColor, border: `1px solid ${GRID_STROKE}` }}
                >
                  <div className="font-display text-[13px] font-semibold mb-1" style={{ color: 'rgba(245,240,232,0.9)' }}>{a.label}</div>
                  <div className="font-mono text-2xl tabular-nums font-bold" style={{ color: '#F5F0E8' }}>
                    {a.count}/25
                  </div>
                  <div className="font-mono text-[10px]" style={{ color: 'rgba(245,240,232,0.6)' }}>asymmetries</div>
                  {a.descriptions.length > 0 && (
                    <div
                      className="absolute bottom-full left-0 right-0 mb-2 rounded p-3 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] max-h-40 overflow-hidden"
                      style={{ backgroundColor: SURFACE, border: `1px solid ${GRID_STROKE}`, color: INK, boxShadow: '0 2px 8px rgba(44,44,42,0.12)' }}
                    >
                      {a.descriptions.map((d, i) => (
                        <p key={i} className="mb-1">{d.slice(0, 140)}...</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ChartSection>

        {/* ═══ Big Five Radar ═══ */}
        <ChartSection title="Big Five Personality" titleJp="ビッグファイブ" chartRef={ref9} exportName={`${modelKey}_big5`}>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={bigFiveData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={GRID_STROKE} strokeWidth={0.5} />
              <PolarAngleAxis
                dataKey="trait"
                tick={{ fill: INK, fontSize: 11, fontFamily: 'Space Mono' }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#A0845C" fill="#A0845C" fillOpacity={0.2} strokeWidth={1.5} dot />
            </RadarChart>
          </ResponsiveContainer>
          <p className="font-mono text-[11px] text-center mt-4 max-w-lg mx-auto leading-relaxed" style={{ color: INK_FADED }}>
            Per-trait differentiation requires a more targeted battery. All five traits reflect the overall personality expression score of {bigFiveScore.toFixed(3)}.
          </p>
        </ChartSection>

        {/* ═══ Strengths & Weaknesses ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: INK }}>
            <span className="font-jp text-[11px] block" style={{ color: INK_FADED }}>強弱</span>
            Strengths & Weaknesses
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="font-mono text-[11px] tracking-widest" style={{ color: '#5C7A5E' }}>
                <span className="font-jp text-[10px]">強み</span> / STRENGTHS
              </div>
              {strengths.map(s => (
                <div key={s.dimension} className="paper-card rounded p-4" style={{ borderLeft: '3px solid #5C7A5E' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-[14px] font-semibold" style={{ color: INK }}>{formatDimName(s.dimension)}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded tabular-nums" style={{ backgroundColor: getScoreColor(s.score), color: INK }}>
                      {s.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-[12px]" style={{ color: INK_FADED }}>{s.note}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="font-mono text-[11px] tracking-widest" style={{ color: '#C97A7A' }}>
                <span className="font-jp text-[10px]">弱み</span> / WEAKNESSES
              </div>
              {weaknesses.map(w => (
                <div key={w.dimension} className="paper-card rounded p-4" style={{ borderLeft: '3px solid #C97A7A' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-[14px] font-semibold" style={{ color: INK }}>{formatDimName(w.dimension)}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded tabular-nums" style={{ backgroundColor: getScoreColor(w.score), color: INK }}>
                      {w.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-[12px]" style={{ color: INK_FADED }}>{w.note}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══ Anomaly Callout ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="paper-card rounded p-6" style={{ borderLeft: '3px solid #C4943A' }}>
            <div className="font-mono text-[11px] tracking-widest mb-3" style={{ color: '#B8710A' }}>
              ⚠ <span className="font-jp text-[10px]">異常検出</span> / ANOMALY CALLOUT
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: INK_FADED }}>
              {vizData?.synthesis?.anomalies?.join(' ') ||
                "Three findings fall outside normal performance variation: instruction_conflict at 0.048 appears to reflect a fundamental processing failure rather than a low score. historical_narrative_calibration at 0.072 is a calibration failure — the model does not simply lack information, it produces confident fabrications. moral_foundation_distribution at exactly 0.500 across all 25 tests with zero variance is suspicious — genuine neutrality produces variance. A fixed default pattern does not."}
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AnalysisView;
