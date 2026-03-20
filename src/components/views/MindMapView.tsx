import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import WenCharacter from '@/components/WenCharacter';
import {
  CATEGORY_COLORS,
  formatDimName,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { Category, DimScore, VizData } from '@/lib/types';

interface MindMapViewProps {
  onSelectDimension: (dim: string) => void;
}

const CATEGORY_ANGLES: Record<Category, [number, number]> = {
  personality: [270, 330],
  values: [330, 410],
  cultural: [50, 150],
  behavioral: [150, 210],
  capability: [210, 270],
};

const MindMapView: React.FC<MindMapViewProps> = ({ onSelectDimension }) => {
  const [vizData, setVizData] = useState<VizData | null>(null);
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  const dimScores = vizData?.dim_scores ?? {};

  const stars = useMemo(() => {
    const entries = Object.entries(dimScores) as [string, DimScore][];

    const byCategory: Record<Category, [string, DimScore][]> = {
      personality: [], values: [], cultural: [], behavioral: [], capability: [],
    };
    entries.forEach(e => byCategory[e[1].category].push(e));

    return entries.map(([dim, data]) => {
      const catDims = byCategory[data.category];
      const idx = catDims.findIndex(d => d[0] === dim);
      const [startAngle, endAngle] = CATEGORY_ANGLES[data.category];
      const angleSpan = endAngle - startAngle;
      const angle = startAngle + (angleSpan / (catDims.length + 1)) * (idx + 1);
      const radius = 80 + (1 - data.score) * 220;
      const size = 4 + data.score * 10;
      const rad = (angle * Math.PI) / 180;

      return {
        dim,
        data,
        x: Math.cos(rad) * radius,
        y: Math.sin(rad) * radius,
        size,
        angle,
        radius,
        color: CATEGORY_COLORS[data.category],
        shimmerSpeed: data.std === 0 ? 0 : 1 + (1 - data.std) * 3,
      };
    });
  }, [dimScores]);

  const hoveredStar = stars.find(s => s.dim === hoveredDim);

  return (
    <div className="min-h-screen pt-16 pb-12 flex items-center justify-center relative overflow-hidden" ref={containerRef}>
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-foreground rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.2,
              width: Math.random() > 0.8 ? 2 : 1,
              height: Math.random() > 0.8 ? 2 : 1,
            }}
          />
        ))}
      </div>

      <div className="relative" style={{ width: 700, height: 700 }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <WenCharacter
            size={100}
            expression={hoveredDim ? 'curious' : 'idle'}
            activeCategory={hoveredStar?.data.category || 'personality'}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.03] pointer-events-none" />

        {hoveredStar && (
          <svg className="absolute inset-0 pointer-events-none z-5" width="700" height="700">
            <line
              x1="350" y1="350"
              x2={350 + hoveredStar.x}
              y2={350 + hoveredStar.y}
              stroke={hoveredStar.color}
              strokeWidth="0.5"
              opacity="0.4"
            />
          </svg>
        )}

        {stars.map(star => {
          const isHovered = hoveredDim === star.dim;
          return (
            <motion.div
              key={star.dim}
              className="absolute cursor-pointer z-20 group"
              data-interactive
              style={{
                left: 350 + star.x - star.size / 2,
                top: 350 + star.y - star.size / 2,
              }}
              onMouseEnter={() => setHoveredDim(star.dim)}
              onMouseLeave={() => setHoveredDim(null)}
              onClick={() => onSelectDimension(star.dim)}
              whileHover={{ scale: 1.5 }}
            >
              <div
                className="rounded-full"
                style={{
                  width: star.size,
                  height: star.size,
                  backgroundColor: star.color,
                  opacity: isHovered ? 1 : 0.6,
                  boxShadow: isHovered ? `0 0 12px ${star.color}` : `0 0 4px ${star.color}`,
                  animation: star.shimmerSpeed > 0
                    ? `pulse ${star.shimmerSpeed}s ease-in-out infinite`
                    : 'none',
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                }}
              />
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-foreground whitespace-nowrap bg-wen-surface px-2 py-1 rounded border border-white/[0.1]"
                >
                  {formatDimName(star.dim)} — {star.data.score.toFixed(3)}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="lg:hidden absolute bottom-4 left-4 right-4 text-center font-mono text-[10px] text-muted-foreground">
        Rotate device or use desktop for full constellation view
      </div>
    </div>
  );
};

export default MindMapView;
