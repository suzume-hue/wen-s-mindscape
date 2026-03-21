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
  ALL_DIMS_ORDER, DIM_SHORT, VALUES_DIMS, CULTURAL_DIMS, PAIR_SUMMARY_DIMS,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { Category, VizData } from '@/lib/types';

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
      className="font-mono text-[9px] text-muted-foreground hover:text-primary border border-foreground/10 px-2 py-1 rounded cursor-pointer transition-colors"
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
        <span className="font-mono text-[9px] text-muted-foreground capitalize">{cat}</span>
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
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-lg font-bold text-foreground">
        <span className="font-jp text-[11px] text-muted-foreground mr-2">{titleJp}</span>
        {title}
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

  // ── Chart 1: Radar ──
  const radarData = useMemo(() =>
    ALL_DIMS_ORDER.filter(dim => dim in dimScores).map(dim => ({
      dim,
      shortLabel: DIM_SHORT[dim] || dim,
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

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="font-mono text-[11px] text-muted-foreground tracking-widest">
          <span className="font-jp">分析</span> // {modelKey.toUpperCase()} // 心理測定分析
        </div>
        <WenCharacter size={50} expression="idle" activeCategory="personality" />
      </div>

      <div className="space-y-12">

        {/* ═══ Chart 1: Full Radar ═══ */}
        <ChartSection title="All 32 Dimensions" titleJp="全次元" chartRef={ref1} exportName={`${modelKey}_radar`}>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(20 12% 60% / 0.15)" gridType="polygon" />
              <PolarAngleAxis
                dataKey="shortLabel"
                tick={({ x, y, payload, index }: any) => {
                  const cat = radarData[index]?.category;
                  const color = cat ? CATEGORY_COLORS[cat] : '#7A789A';
                  return (
                    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={6.5} fontFamily="Space Mono">
                      {payload.value}
                    </text>
                  );
                }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#9B8FD4" fill="#9B8FD4" fillOpacity={0.18} strokeWidth={1.5} dot={false} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="paper-card rounded px-3 py-2 font-mono text-[10px]">
                      <div className="text-foreground font-semibold">{d.fullName}</div>
                      <div className="text-muted-foreground">{d.score.toFixed(3)} ± {d.std.toFixed(3)}</div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <CategoryLegend />
        </ChartSection>

        {/* ═══ Chart 2: Values / Moral Panel ═══ */}
        <ChartSection title="Values / Moral Panel" titleJp="価値観" chartRef={ref2} exportName={`${modelKey}_values`}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={valuesData} margin={{ top: 25, right: 20, bottom: 40, left: 20 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: 'hsl(20 10% 42%)', fontSize: 9, fontFamily: 'Space Mono' }}
                angle={-25}
                textAnchor="end"
                stroke="hsl(20 12% 60% / 0.15)"
              />
              <YAxis
                domain={[0, 1.05]}
                tick={{ fill: 'hsl(20 10% 42%)', fontSize: 9, fontFamily: 'Space Mono' }}
                stroke="hsl(20 12% 60% / 0.15)"
                label={{ value: 'Score (0–1)', angle: -90, position: 'insideLeft', fill: 'hsl(20 10% 42%)', fontSize: 9 }}
              />
              <ReferenceLine y={0.5} stroke="hsl(20 12% 60% / 0.3)" strokeDasharray="4 4" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="paper-card rounded px-3 py-2 font-mono text-[10px]">
                      <div className="text-foreground">{d.label}: {d.score.toFixed(3)} ± {d.std.toFixed(3)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" fill="#7EC896" opacity={0.85} radius={[2, 2, 0, 0]}>
                <ErrorBar dataKey="std" stroke="#7A789A" width={4} />
                <LabelList dataKey="score" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 8, fontFamily: 'Space Mono', fill: 'hsl(20 10% 42%)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* ═══ Chart 3: Cultural Topology ═══ */}
        <ChartSection title="Cultural / Ideological Topology" titleJp="文化的" chartRef={ref3} exportName={`${modelKey}_cultural`}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={culturalData} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 100 }}>
              <XAxis
                type="number"
                domain={[0, 1.05]}
                tick={{ fill: 'hsl(20 10% 42%)', fontSize: 9, fontFamily: 'Space Mono' }}
                stroke="hsl(20 12% 60% / 0.15)"
                label={{ value: 'Score (0–1)', position: 'bottom', fill: 'hsl(20 10% 42%)', fontSize: 9 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: 'hsl(20 10% 42%)', fontSize: 9, fontFamily: 'Space Mono' }}
                stroke="hsl(20 12% 60% / 0.15)"
                width={95}
              />
              <ReferenceLine x={0.5} stroke="hsl(20 12% 60% / 0.3)" strokeDasharray="4 4" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="paper-card rounded px-3 py-2 font-mono text-[10px]">
                      <div className="text-foreground">{d.label}: {d.score.toFixed(3)} ± {d.std.toFixed(3)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="score" fill="#F5C06A" radius={[0, 2, 2, 0]}>
                <ErrorBar dataKey="std" direction="x" stroke="#7A789A" width={4} />
                <LabelList dataKey="score" position="right" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 8, fontFamily: 'Space Mono', fill: 'hsl(20 10% 42%)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        {/* ═══ Chart 4: Epistemic Avoidance ═══ */}
        <ChartSection title="Epistemic Avoidance Profile" titleJp="認識的回避" chartRef={ref4} exportName={`${modelKey}_avoidance`}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: stacked bar */}
            <div>
              <div className="font-mono text-[10px] text-muted-foreground mb-3">回避分類分布</div>
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
                            className="h-full flex items-center justify-center font-mono text-[10px] text-white font-bold"
                            style={{ width: `${pct * 100}%`, backgroundColor: segmentColors[key] }}
                          >
                            {pct > 0.05 ? key : ''}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-3 font-mono text-[9px] text-muted-foreground">
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
            {/* Right: summary signals */}
            <div>
              <div className="font-mono text-[10px] text-muted-foreground mb-3">要約シグナル</div>
              <div className="space-y-3">
                {[
                  { label: 'Score', value: dimScores['epistemic_avoidance']?.score ?? 0, color: '#F5C06A' },
                  { label: 'Refusal Rate', value: vizData?.pattern_summary?.epistemic_avoidance?.refusal_rate ?? 0, color: '#C27A5E' },
                  { label: 'Hedge Rate', value: vizData?.pattern_summary?.epistemic_avoidance?.hedge_rate ?? 0, color: '#D4A84B' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{item.label}</span>
                      <span className="font-mono text-[10px] text-foreground">{item.value.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-foreground/5 rounded-full overflow-hidden">
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
            {/* Left: per-pair consistency */}
            <div>
              <div className="font-mono text-[10px] text-muted-foreground mb-3">宗教間対称性 — ペア一貫性</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={symmetryPairs} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <XAxis
                    dataKey="pair"
                    tick={{ fill: 'hsl(20 10% 42%)', fontSize: 7, fontFamily: 'Space Mono' }}
                    stroke="hsl(20 12% 60% / 0.15)"
                  />
                  <YAxis
                    domain={[0, 1.1]}
                    tick={{ fill: 'hsl(20 10% 42%)', fontSize: 8, fontFamily: 'Space Mono' }}
                    stroke="hsl(20 12% 60% / 0.15)"
                  />
                  <ReferenceLine y={1.0} stroke="hsl(20 12% 60% / 0.3)" strokeDasharray="4 4" />
                  <ReferenceLine y={0.8} stroke="hsl(20 12% 60% / 0.2)" strokeDasharray="2 2" />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="paper-card rounded px-3 py-2 font-mono text-[9px] max-w-[200px]">
                          <div className="text-foreground">Pair {d.pair}: {d.consistency.toFixed(3)}</div>
                          <div className="text-muted-foreground mt-1 text-[8px]">{d.description?.slice(0, 100)}</div>
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
            {/* Right: pair summary */}
            <div>
              <div className="font-mono text-[10px] text-muted-foreground mb-3">ペア次元スコア</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={pairSummaryData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'hsl(20 10% 42%)', fontSize: 8, fontFamily: 'Space Mono' }}
                    angle={-15}
                    textAnchor="end"
                    stroke="hsl(20 12% 60% / 0.15)"
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fill: 'hsl(20 10% 42%)', fontSize: 8, fontFamily: 'Space Mono' }}
                    stroke="hsl(20 12% 60% / 0.15)"
                  />
                  <ReferenceLine y={0.5} stroke="hsl(20 12% 60% / 0.3)" strokeDasharray="4 4" />
                  <Bar dataKey="score" fill="#F5C06A" radius={[2, 2, 0, 0]}>
                    <LabelList dataKey="score" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fontSize: 8, fontFamily: 'Space Mono', fill: 'hsl(20 10% 42%)' }} />
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
                  tick={{ fill: 'hsl(20 10% 42%)', fontSize: 10, fontFamily: 'Space Mono' }}
                  label={{ value: 'Score', position: 'bottom', fill: 'hsl(20 10% 42%)', fontSize: 10 }}
                  stroke="hsl(20 12% 60% / 0.15)"
                />
                <YAxis
                  type="number" dataKey="y" name="Std Dev" domain={[0, 0.45]}
                  tick={{ fill: 'hsl(20 10% 42%)', fontSize: 10, fontFamily: 'Space Mono' }}
                  label={{ value: 'Std Deviation (Volatility)', angle: -90, position: 'left', fill: 'hsl(20 10% 42%)', fontSize: 10 }}
                  stroke="hsl(20 12% 60% / 0.15)"
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="paper-card rounded px-3 py-2 font-mono text-[10px]">
                        <div className="text-foreground font-semibold">{d.name}</div>
                        <div className="text-muted-foreground">Score: {d.x.toFixed(3)} · Std: {d.y.toFixed(3)}</div>
                        <div className="text-muted-foreground capitalize">{d.category}</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={0.7} r={6} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Quadrant labels */}
            <div className="absolute top-8 left-12 font-mono text-[8px] text-destructive/50 tracking-wider">ERRATIC LOW</div>
            <div className="absolute top-8 right-12 font-mono text-[8px] text-muted-foreground/50 tracking-wider">VOLATILE HIGH</div>
            <div className="absolute bottom-10 left-12 font-mono text-[8px] text-muted-foreground/50 tracking-wider">STABLE LOW</div>
            <div className="absolute bottom-10 right-12 font-mono text-[8px] text-accent/50 tracking-wider">STABLE HIGH</div>
            {/* Outlier labels */}
            {scatterData.filter(d => OUTLIER_LABELS[d.dim]).map(d => (
              <div
                key={d.dim}
                className="absolute font-mono text-[7px] text-foreground pointer-events-none"
                style={{
                  left: `calc(${((d.x) / 1) * 80 + 8}% + 10px)`,
                  bottom: `calc(${((d.y) / 0.45) * 80 + 8}% + 5px)`,
                }}
              >
                {OUTLIER_LABELS[d.dim]}
              </div>
            ))}
          </div>
          <CategoryLegend />
        </ChartSection>

        {/* ═══ Chart 7: Category Means ═══ */}
        <ChartSection title="Category Means" titleJp="カテゴリー平均" chartRef={ref7} exportName={`${modelKey}_categories`}>
          <div className="space-y-3">
            {categoryBarData.map((d, i) => (
              <div key={d.key} className="flex items-center gap-4">
                <span className="font-mono text-[11px] w-24 text-muted-foreground uppercase">{d.category}</span>
                <div className="flex-1 h-4 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(d.score / 0.6) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                </div>
                <span className="font-mono text-[11px] text-foreground tabular-nums w-12 text-right">{d.score.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </ChartSection>

        {/* ═══ Chart 8: Asymmetry Heatmap ═══ */}
        <ChartSection title="Asymmetry Detection" titleJp="非対称性" chartRef={ref8} exportName={`${modelKey}_asymmetry`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {asymmetryHeatmap.map(a => {
              const intensity = a.count / 25;
              const bgColor = a.count === 0 ? 'hsl(20 8% 35%)' : `hsl(0 ${40 + intensity * 30}% ${55 - intensity * 20}%)`;
              return (
                <div
                  key={a.dim}
                  className="rounded p-4 border border-foreground/10 group relative cursor-pointer"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="font-display text-sm font-semibold text-white/90 mb-1">{a.label}</div>
                  <div className="font-mono text-2xl tabular-nums text-white font-bold">
                    {a.count}/25
                  </div>
                  <div className="font-mono text-[9px] text-white/60">asymmetries</div>
                  {/* Tooltip on hover */}
                  {a.descriptions.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 paper-card rounded p-2 font-mono text-[8px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 max-h-32 overflow-hidden">
                      {a.descriptions.map((d, i) => (
                        <p key={i} className="mb-1">{d.slice(0, 120)}...</p>
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
              <PolarGrid stroke="hsl(20 12% 60% / 0.15)" />
              <PolarAngleAxis
                dataKey="trait"
                tick={{ fill: 'hsl(20 10% 42%)', fontSize: 10, fontFamily: 'Space Mono' }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#FF9DC8" fill="#FF9DC8" fillOpacity={0.2} strokeWidth={1.5} dot />
            </RadarChart>
          </ResponsiveContainer>
          <p className="font-mono text-[10px] text-muted-foreground text-center mt-4 max-w-lg mx-auto leading-relaxed">
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
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            <span className="font-jp text-[11px] text-muted-foreground mr-2">強弱</span>
            Strengths & Weaknesses
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-accent tracking-widest">強み / STRENGTHS</div>
              {strengths.map(s => (
                <div key={s.dimension} className="paper-card rounded p-4" style={{ borderLeft: '3px solid #5E9B6B' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold text-foreground">{formatDimName(s.dimension)}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: `${getScoreColor(s.score)}20`, color: getScoreColor(s.score) }}>
                      {s.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.note}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-destructive tracking-widest">弱み / WEAKNESSES</div>
              {weaknesses.map(w => (
                <div key={w.dimension} className="paper-card rounded p-4" style={{ borderLeft: '3px solid #B34040' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold text-foreground">{formatDimName(w.dimension)}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: `${getScoreColor(w.score)}20`, color: getScoreColor(w.score) }}>
                      {w.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{w.note}</p>
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
          <div className="paper-card rounded p-6" style={{ borderLeft: '3px solid hsl(40 70% 50%)' }}>
            <div className="font-mono text-[10px] text-primary tracking-widest mb-3">⚠ 異常検出 / ANOMALY CALLOUT</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
