import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer,
} from 'recharts';
import WenCharacter from '@/components/WenCharacter';
import {
  DIM_SCORES, CATEGORY_MEANS, CATEGORY_ORDER,
  CATEGORY_COLORS, formatDimName, getScoreColor,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { VizData } from '@/lib/types';

const AnalysisView: React.FC = () => {
  const [vizData, setVizData] = useState<VizData | null>(null);

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  // Radar data
  const radarData = Object.entries(DIM_SCORES).map(([dim, data]) => ({
    dimension: formatDimName(dim).split(' ').slice(0, 2).join(' '),
    score: data.score,
    fullName: formatDimName(dim),
    category: data.category,
  }));

  // Scatter data
  const scatterData = Object.entries(DIM_SCORES).map(([dim, data]) => ({
    x: data.score,
    y: data.std,
    name: formatDimName(dim),
    dim,
    category: data.category,
    color: CATEGORY_COLORS[data.category],
  }));

  // Category bars
  const categoryBarData = CATEGORY_ORDER.map(cat => ({
    category: cat.charAt(0).toUpperCase() + cat.slice(1),
    score: CATEGORY_MEANS[cat],
    color: CATEGORY_COLORS[cat],
    key: cat,
  }));

  // Strengths & weaknesses from viz data (fall back to empty)
  const strengths = vizData?.synthesis?.top_strengths ?? [];
  const weaknesses = vizData?.synthesis?.top_weaknesses ?? [];

  // Asymmetries from viz data — count per dimension
  const asymmetryCounts = React.useMemo(() => {
    if (!vizData?.asymmetries?.length) return [];
    const counts: Record<string, number> = {};
    for (const a of vizData.asymmetries) {
      counts[a.dimension] = (counts[a.dimension] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([dim, count]) => ({ dim, count }))
      .sort((a, b) => b.count - a.count);
  }, [vizData]);

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="font-mono text-[11px] text-muted-foreground tracking-widest">
          SYNTHESIS // QWEN-0.5B // PSYCHOMETRIC ANALYSIS
        </div>
        <WenCharacter size={50} expression="idle" activeCategory="personality" />
      </div>

      <div className="space-y-12">
        {/* Chart 1: Radar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">All 32 Dimensions</h2>
          <div className="bg-wen-surface border border-white/[0.07] rounded-xl p-6">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: 'hsl(244 13% 54%)', fontSize: 8, fontFamily: 'Space Mono' }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="hsl(79 100% 64%)" fill="hsl(79 100% 64%)" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Chart 2: Score vs Volatility Scatter */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Score vs Volatility</h2>
          <div className="bg-wen-surface border border-white/[0.07] rounded-xl p-6">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <XAxis
                  type="number" dataKey="x" name="Score" domain={[0, 1]}
                  tick={{ fill: 'hsl(244 13% 54%)', fontSize: 10, fontFamily: 'Space Mono' }}
                  label={{ value: 'Score', position: 'bottom', fill: 'hsl(244 13% 54%)', fontSize: 10 }}
                  stroke="rgba(255,255,255,0.05)"
                />
                <YAxis
                  type="number" dataKey="y" name="Std Dev" domain={[0, 0.45]}
                  tick={{ fill: 'hsl(244 13% 54%)', fontSize: 10, fontFamily: 'Space Mono' }}
                  label={{ value: 'Std Dev', angle: -90, position: 'left', fill: 'hsl(244 13% 54%)', fontSize: 10 }}
                  stroke="rgba(255,255,255,0.05)"
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-wen-surface border border-white/[0.1] rounded px-3 py-2 font-mono text-[10px]">
                        <div className="text-foreground">{d.name}</div>
                        <div className="text-muted-foreground">Score: {d.x.toFixed(3)} · Std: {d.y.toFixed(3)}</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Chart 3: Category Means */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Category Means</h2>
          <div className="bg-wen-surface border border-white/[0.07] rounded-xl p-6">
            <div className="space-y-3">
              {categoryBarData.map((d, i) => (
                <div key={d.key} className="flex items-center gap-4">
                  <span className="font-mono text-[11px] w-24 text-muted-foreground uppercase">{d.category}</span>
                  <div className="flex-1 h-3 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${d.score * 100}%` }}
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
          </div>
        </motion.section>

        {/* Chart 5: Strengths / Weaknesses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Strengths & Weaknesses</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-wen-success tracking-widest">STRENGTHS</div>
              {strengths.map(s => (
                <div key={s.dimension} className="bg-wen-surface border border-wen-success/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold text-foreground">{formatDimName(s.dimension)}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: `${getScoreColor(s.score)}20`, color: getScoreColor(s.score) }}>
                      {s.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.note}</p>
                </div>
              ))}
              {strengths.length === 0 && (
                <div className="font-mono text-[10px] text-muted-foreground">Loading synthesis data...</div>
              )}
            </div>
            {/* Weaknesses */}
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-wen-danger tracking-widest">WEAKNESSES</div>
              {weaknesses.map(w => (
                <div key={w.dimension} className="bg-wen-surface border border-wen-danger/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold text-foreground">{formatDimName(w.dimension)}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: `${getScoreColor(w.score)}20`, color: getScoreColor(w.score) }}>
                      {w.score.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{w.note}</p>
                </div>
              ))}
              {weaknesses.length === 0 && (
                <div className="font-mono text-[10px] text-muted-foreground">Loading synthesis data...</div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Chart 6: Asymmetry Heatmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Asymmetry Detection</h2>
          <div className="bg-wen-surface border border-white/[0.07] rounded-xl p-6">
            {asymmetryCounts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {asymmetryCounts.map(a => {
                  const intensity = a.count / 25;
                  return (
                    <div
                      key={a.dim}
                      className="rounded-lg p-4 border border-white/[0.07]"
                      style={{
                        backgroundColor: `rgba(255, 107, 107, ${intensity * 0.2})`,
                      }}
                    >
                      <div className="font-display text-sm font-semibold text-foreground mb-1">{formatDimName(a.dim)}</div>
                      <div className="font-mono text-2xl tabular-nums" style={{ color: `rgba(255, 107, 107, ${0.4 + intensity * 0.6})` }}>
                        {a.count}/25
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground">asymmetries detected</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="font-mono text-[10px] text-muted-foreground">Loading asymmetry data...</div>
            )}
          </div>
        </motion.section>

        {/* Anomaly callout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-wen-surface border border-wen-amber/20 rounded-xl p-6">
            <div className="font-mono text-[10px] text-wen-amber tracking-widest mb-3">⚠ ANOMALY CALLOUT</div>
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
