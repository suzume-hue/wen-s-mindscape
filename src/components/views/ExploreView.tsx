import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import WenCharacter from '@/components/WenCharacter';
import {
  CATEGORY_ORDER,
  CATEGORY_CSS_CLASSES,
  CATEGORY_BG_CLASSES,
  formatDimName,
  getScoreColor,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { Category, DimScore, VizData } from '@/lib/types';

type SortMode = 'category' | 'score_asc' | 'score_desc' | 'volatility';

interface ExploreViewProps {
  onSelectDimension: (dim: string) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onSelectDimension }) => {
  const [sort, setSort] = useState<SortMode>('category');
  const [vizData, setVizData] = useState<VizData | null>(null);

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  const dimScores = vizData?.dim_scores ?? {};

  const sortedDims = useMemo(() => {
    const entries = Object.entries(dimScores);
    switch (sort) {
      case 'score_asc':
        return [...entries].sort((a, b) => a[1].score - b[1].score);
      case 'score_desc':
        return [...entries].sort((a, b) => b[1].score - a[1].score);
      case 'volatility':
        return [...entries].sort((a, b) => b[1].std - a[1].std);
      case 'category':
      default: {
        const catOrder = Object.fromEntries(CATEGORY_ORDER.map((c, i) => [c, i]));
        return [...entries].sort((a, b) =>
          catOrder[a[1].category] - catOrder[b[1].category] || b[1].score - a[1].score
        );
      }
    }
  }, [dimScores, sort]);

  const grouped = useMemo(() => {
    if (sort !== 'category') return null;
    const groups: { cat: Category; dims: [string, DimScore][] }[] = [];
    let currentCat: Category | null = null;
    for (const entry of sortedDims as [string, DimScore][]) {
      if (entry[1].category !== currentCat) {
        currentCat = entry[1].category;
        groups.push({ cat: currentCat, dims: [] });
      }
      groups[groups.length - 1].dims.push(entry);
    }
    return groups;
  }, [sort, sortedDims]);

  const SORTS: { mode: SortMode; label: string }[] = [
    { mode: 'category', label: 'BY CATEGORY' },
    { mode: 'score_desc', label: 'BY SCORE ↓' },
    { mode: 'score_asc', label: 'BY SCORE ↑' },
    { mode: 'volatility', label: 'BY VOLATILITY' },
  ];

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="font-mono text-[11px] text-muted-foreground tracking-widest">
          BATTERY EXPLORER // {sortedDims.length || 32} DIMENSIONS // QWEN-0.5B
        </div>
        <div className="hidden lg:block">
          <WenCharacter size={60} expression="curious" activeCategory="personality" />
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {SORTS.map(s => (
          <button
            key={s.mode}
            data-interactive
            onClick={() => setSort(s.mode)}
            className={`font-mono text-[10px] px-3 py-1.5 rounded border transition-all cursor-pointer ${
              sort === s.mode
                ? 'border-wen-neon/40 text-wen-neon bg-wen-neon/[0.06]'
                : 'border-white/[0.07] text-muted-foreground hover:text-foreground hover:border-white/[0.14]'
            }`}
          >
            [{s.label}]
          </button>
        ))}
      </div>

      <LayoutGroup>
        {sort === 'category' && grouped ? (
          grouped.map(group => (
            <div key={group.cat} className="mb-6">
              <div className={`font-mono text-[10px] tracking-[0.2em] mb-3 ${CATEGORY_CSS_CLASSES[group.cat]}`}>
                ◆ {group.cat.toUpperCase()}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.dims.map(([dim, data]) => (
                  <DimCard key={dim} dim={dim} data={data} onClick={() => onSelectDimension(dim)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedDims.map(([dim, data]) => (
              <DimCard key={dim} dim={dim} data={data} onClick={() => onSelectDimension(dim)} />
            ))}
          </div>
        )}
      </LayoutGroup>
    </div>
  );
};

const DimCard: React.FC<{
  dim: string;
  data: DimScore;
  onClick: () => void;
}> = ({ dim, data, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const maxStd = 0.4;
  const fuzzyWidth = Math.max(4, (data.std / maxStd) * 16);

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      data-interactive
      className="bg-wen-surface border border-white/[0.07] rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg group relative overflow-hidden"
      style={{
        borderColor: hovered ? `${getScoreColor(data.score)}40` : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${CATEGORY_BG_CLASSES[data.category]}`} />
        <span className="font-display text-sm font-semibold text-foreground leading-tight">
          {formatDimName(dim)}
        </span>
      </div>

      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-2 relative">
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${data.score * 100}%`,
            backgroundColor: getScoreColor(data.score),
          }}
        >
          <div
            className="absolute right-0 top-0 bottom-0"
            style={{
              width: `${fuzzyWidth}px`,
              background: `linear-gradient(to right, ${getScoreColor(data.score)}, transparent)`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          ±{data.std.toFixed(3)}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          25 tests · 3 runs
        </span>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[9px] text-wen-neon"
          >
            ENTER →
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExploreView;
