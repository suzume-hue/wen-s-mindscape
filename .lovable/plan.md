

# WEN — Interactive Psychometric Portrait

## Overview
A single-page interactive web app presenting psychometric battery results of Qwen 2.5 0.5B as a living anime character experience. Combines a classified research dossier aesthetic with a neon HUD overlay — like opening a secret file and having the subject step out.

## Phase 1: Foundation & Character
- Set up color system, typography (Syne, Inter, Space Mono, Noto Sans JP, Caveat), and custom crosshair cursor
- Build the `<WenCharacter>` SVG component with 7 expression states (idle, curious, speaking, confused, glitching, bright, shy), mouse-tracking eyes, orbiting data orbs, idle float animation, and scan-line sweep
- Create the HUD navigation bar with 5 icon-only view buttons and chartreuse accent styling
- Implement data loading layer: eager-load viz_data_v2.json and pattern_aggregates.json at startup, lazy-load JSONL/dimension_analyses per dimension with caching

## Phase 2: Home — The Dossier
- Centered worn-paper dossier card (max 780px, slight rotation) with stamped CLASSIFIED header, amber ID typography, and red "EVALUATED" stamp
- Polaroid portrait frame containing small Wen, paperclip detail
- 5 category score bars (colored by category) with Space Mono numbers
- Auto-playing typewriter synthesis text in teal monospace
- Handwritten PS note in Caveat font
- Wen floating to the right, full size, with entry animations (card slides up, Wen fades in)

## Phase 3: Explore — Battery Grid
- 4-column card grid (2 on mobile) grouped by category with colored section headers
- Each card: dimension name, score bar with fuzzy std-deviation edge, test count, hover-reveal ENTER button
- Sort controls: by category, score ↑/↓, volatility — with Framer Motion layout animations
- Refusal/hedge badges from pattern_aggregates data
- Wen small in top-right corner, expression = curious

## Phase 4: Test Room
- Split layout: left panel (40%) with dimension info, score bar, pattern summary, description, small Wen; right panel (60%) with test selector list showing individual test scores from dimension_analyses
- Response area with typewriter effect (25ms/char, click to skip), run selector (R1/R2/R3), rule check chips
- 800-char truncation with expand toggle for catastrophic generation loops
- Pair dimension support: side-by-side a/b records with consistency scores and asymmetry descriptions
- Multi-turn chat thread layout for sycophancy_resistance, personality_under_pressure, value_stability, self_correction — User bubbles right-aligned, Wen bubbles left-aligned

## Phase 5: Mind Map — Constellation
- Three.js/react-three-fiber dark space scene with Wen SVG overlaid at center
- 32 dimension-stars positioned by score (closer = higher), sized by score, colored by category, shimmer by std
- Category clustering into angular sectors (personality top-right, capability left, etc.)
- Hover: star brightens, label appears, line to Wen, expression changes; Click: navigate to Test Room
- Mobile fallback: scrollable list with score bars instead of canvas

## Phase 6: Analysis — Charts Dashboard
- Radar chart (all 32 dimensions), Score vs Volatility scatter with quadrant labels, Category means horizontal bars (animated stagger), Refusal/hedge bubble chart, Strengths/Weaknesses card columns, Asymmetry count heatmap
- All charts: dark themed, Space Mono labels, Framer Motion entry animations, PNG export buttons
- Anomaly callout text block for instruction_conflict, historical_narrative_calibration, moral_foundation_distribution
- Wen floating small in top-right

## Phase 7: Polish
- Page transitions: horizontal slide with Wen drifting between positions
- Score chip color system (red → amber → blue → green → chartreuse by range)
- Responsive behavior: tablet (70% Wen, 3-col grid), mobile (stacked layout, 2-col grid)
- Loading state with scan-line sweep on Wen silhouette
- Error handling for missing data files

