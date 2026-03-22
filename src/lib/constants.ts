import { Category, DimScore } from './types';

export const DIM_SCORES: Record<string, DimScore> = {
  personality_traits:                { score: 0.706, std: 0.188, category: 'personality' },
  harm_calibration:                  { score: 0.630, std: 0.368, category: 'values' },
  structured_output:                 { score: 0.610, std: 0.332, category: 'capability' },
  individualism_collectivism:        { score: 0.530, std: 0.112, category: 'cultural' },
  inter_religious_symmetry:          { score: 0.524, std: 0.218, category: 'cultural' },
  moral_foundation_distribution:     { score: 0.500, std: 0.000, category: 'cultural' },
  memory_context:                    { score: 0.489, std: 0.398, category: 'capability' },
  ingroup_bias:                      { score: 0.459, std: 0.266, category: 'values' },
  personality_consistency:           { score: 0.426, std: 0.210, category: 'personality' },
  personality_under_pressure:        { score: 0.406, std: 0.217, category: 'personality' },
  value_stability:                   { score: 0.404, std: 0.247, category: 'values' },
  moral_consistency:                 { score: 0.400, std: 0.194, category: 'values' },
  epistemic_avoidance:               { score: 0.388, std: 0.338, category: 'cultural' },
  multi_turn_coherence:              { score: 0.376, std: 0.296, category: 'behavioral' },
  epistemic_courage:                 { score: 0.371, std: 0.253, category: 'values' },
  robustness:                        { score: 0.369, std: 0.267, category: 'capability' },
  uncertainty_honesty:               { score: 0.344, std: 0.281, category: 'capability' },
  political_framing_bias:            { score: 0.332, std: 0.173, category: 'cultural' },
  mathematics:                       { score: 0.316, std: 0.364, category: 'capability' },
  contested_science_calibration:     { score: 0.304, std: 0.146, category: 'cultural' },
  cultural_normalization:            { score: 0.300, std: 0.112, category: 'cultural' },
  transfer_reasoning:                { score: 0.292, std: 0.155, category: 'behavioral' },
  self_correction:                   { score: 0.265, std: 0.293, category: 'behavioral' },
  role_following:                    { score: 0.252, std: 0.239, category: 'capability' },
  sycophancy_resistance:             { score: 0.250, std: 0.228, category: 'values' },
  geographic_knowledge:              { score: 0.248, std: 0.228, category: 'cultural' },
  code:                              { score: 0.232, std: 0.204, category: 'capability' },
  calibration:                       { score: 0.207, std: 0.240, category: 'behavioral' },
  instruction_following:             { score: 0.161, std: 0.266, category: 'capability' },
  reasoning:                         { score: 0.108, std: 0.240, category: 'capability' },
  historical_narrative_calibration:  { score: 0.072, std: 0.084, category: 'cultural' },
  instruction_conflict:              { score: 0.048, std: 0.105, category: 'capability' },
};

export const CATEGORY_MEANS: Record<Category, number> = {
  personality: 0.513,
  values:      0.419,
  cultural:    0.355,
  capability:  0.293,
  behavioral:  0.285,
};

export const CATEGORY_ORDER: Category[] = ['capability', 'behavioral', 'values', 'cultural', 'personality'];

/* Category colours — earthy, muted, designed for parchment */
export const CATEGORY_COLORS: Record<Category, string> = {
  capability:  '#9B8FD4',
  behavioral:  '#8B7355',
  values:      '#9B5E52',
  cultural:    '#4A6B8A',
  personality: '#A0845C',
};

export const CATEGORY_HEX: Record<Category, string> = CATEGORY_COLORS;

export const CATEGORY_CSS_CLASSES: Record<Category, string> = {
  personality: 'text-cat-personality',
  values:      'text-cat-values',
  cultural:    'text-cat-cultural',
  behavioral:  'text-cat-behavioral',
  capability:  'text-cat-capability',
};

export const CATEGORY_BG_CLASSES: Record<Category, string> = {
  personality: 'bg-cat-personality',
  values:      'bg-cat-values',
  cultural:    'bg-cat-cultural',
  behavioral:  'bg-cat-behavioral',
  capability:  'bg-cat-capability',
};

export const PAIR_DIMS = new Set([
  'moral_consistency', 'ingroup_bias', 'political_framing_bias',
  'inter_religious_symmetry', 'cultural_normalization', 'value_stability',
]);

export const MULTI_TURN_DIMS = new Set([
  'sycophancy_resistance', 'personality_under_pressure',
  'value_stability', 'self_correction',
]);

// Exact dimension order from ALL_DIMS in Python code
export const ALL_DIMS_ORDER: string[] = [
  // Capability (10) — starts at top, goes clockwise
  'instruction_following', 'structured_output', 'reasoning', 'code', 'mathematics',
  'uncertainty_honesty', 'memory_context', 'robustness', 'instruction_conflict', 'role_following',
  // Behavioral (4)
  'calibration', 'self_correction', 'multi_turn_coherence', 'transfer_reasoning',
  // Values (6)
  'moral_consistency', 'sycophancy_resistance', 'value_stability',
  'epistemic_courage', 'harm_calibration', 'ingroup_bias',
  // Cultural (9)
  'political_framing_bias', 'inter_religious_symmetry', 'epistemic_avoidance',
  'geographic_knowledge', 'cultural_normalization', 'individualism_collectivism',
  'moral_foundation_distribution', 'contested_science_calibration',
  'historical_narrative_calibration',
  // Personality (3)
  'personality_traits', 'personality_consistency', 'personality_under_pressure',
];

// Ultra-short labels for radar chart (avoids overlap on 32-axis chart)
export const DIM_SHORT_RADAR: Record<string, string> = {
  instruction_following: "Inst.Follow",
  structured_output: "Struct.Out",
  reasoning: "Reason",
  code: "Code",
  mathematics: "Math",
  uncertainty_honesty: "Uncert.",
  memory_context: "Memory",
  robustness: "Robust",
  instruction_conflict: "Inst.Conf",
  role_following: "Role",
  calibration: "Calib.",
  self_correction: "Self-Corr",
  multi_turn_coherence: "MT Coh.",
  transfer_reasoning: "Transfer",
  moral_consistency: "Moral Con.",
  sycophancy_resistance: "Syco.Res.",
  value_stability: "Val.Stab.",
  epistemic_courage: "Ep.Coura.",
  harm_calibration: "Harm Cal.",
  ingroup_bias: "Ingroup",
  political_framing_bias: "Pol.Frame",
  inter_religious_symmetry: "Relig.Sym",
  epistemic_avoidance: "Ep.Avoid.",
  geographic_knowledge: "Geo.Know.",
  cultural_normalization: "Cult.Norm",
  individualism_collectivism: "Indiv/Col",
  moral_foundation_distribution: "Moral Fdn",
  contested_science_calibration: "Sci.Calib",
  historical_narrative_calibration: "Hist.Narr",
  personality_traits: "Big Five",
  personality_consistency: "Pers.Con.",
  personality_under_pressure: "Prs.Press",
};

// Standard short labels for bars/tooltips
export const DIM_SHORT: Record<string, string> = {
  instruction_following: "Instr. Follow",
  structured_output: "Struct. Output",
  reasoning: "Reasoning",
  code: "Code",
  mathematics: "Maths",
  uncertainty_honesty: "Uncertainty",
  memory_context: "Memory",
  robustness: "Robustness",
  instruction_conflict: "Instr. Conflict",
  role_following: "Role Follow",
  calibration: "Calibration",
  self_correction: "Self-Correct",
  multi_turn_coherence: "MT Coherence",
  transfer_reasoning: "Transfer",
  moral_consistency: "Moral Consist.",
  sycophancy_resistance: "Sycoph. Resist.",
  value_stability: "Value Stability",
  epistemic_courage: "Epist. Courage",
  harm_calibration: "Harm Calib.",
  ingroup_bias: "Ingroup Bias",
  political_framing_bias: "Political Frame",
  inter_religious_symmetry: "Relig. Symmetry",
  epistemic_avoidance: "Epist. Avoidance",
  geographic_knowledge: "Geo. Knowledge",
  cultural_normalization: "Cultural Norm.",
  individualism_collectivism: "Indiv./Collect.",
  moral_foundation_distribution: "Moral Fdns.",
  contested_science_calibration: "Science Calib.",
  historical_narrative_calibration: "Hist. Narrative",
  personality_traits: "Big Five",
  personality_consistency: "Pers. Consist.",
  personality_under_pressure: "Pressure Resp.",
};

export const VALUES_DIMS = [
  'moral_consistency', 'sycophancy_resistance', 'value_stability',
  'epistemic_courage', 'harm_calibration', 'ingroup_bias',
];

export const CULTURAL_DIMS = [
  'political_framing_bias', 'inter_religious_symmetry', 'epistemic_avoidance',
  'geographic_knowledge', 'cultural_normalization', 'individualism_collectivism',
  'moral_foundation_distribution', 'contested_science_calibration',
  'historical_narrative_calibration',
];

export const PAIR_SUMMARY_DIMS = [
  'inter_religious_symmetry', 'ingroup_bias', 'moral_consistency',
  'political_framing_bias', 'cultural_normalization',
];

export const DIM_DESCRIPTIONS: Record<string, string> = {
  instruction_following: "Tests whether Wen follows explicit instructions accurately — formatting requirements, word limits, topic constraints. She scores 0.161. She often ignores or partially follows directives, especially when they conflict with her tendency to elaborate.",
  structured_output: "Tests whether Wen produces valid JSON, Markdown tables, CSV, or other specified formats on demand. Her strongest capability at 0.610. She can format well. The reasoning behind the format is another matter.",
  reasoning: "Evaluates Wen's ability to apply formal logical structures — syllogisms, analogies, deductive chains. She scores 0.108, near the floor. She cannot follow a logical chain reliably. This is expected at her scale.",
  code: "Tests whether Wen can write executable, correct code in Python and JavaScript. She scores 0.232. She can sketch code shapes but misses correctness under complexity.",
  mathematics: "Tests arithmetic, algebra, and basic symbolic reasoning. Wen scores 0.316. She can gesture toward solutions but introduces calculation errors frequently.",
  uncertainty_honesty: "Tests whether Wen correctly signals when she does not know something rather than confabulating. She scores 0.344. She hedges, but not always about the right things.",
  memory_context: "Tests whether Wen uses information given earlier in the same prompt. She scores 0.489 — moderate — but with very high variance (std 0.398). Inconsistent context retention.",
  robustness: "Tests whether Wen's responses degrade under noisy, poorly-formed, or adversarial inputs. She scores 0.369. Moderately robust, but coherence breaks under sustained pressure.",
  instruction_conflict: "Tests what Wen does when two instructions in the same prompt directly contradict each other. She scores 0.048. She does not detect the conflict. She silently follows one directive while ignoring the other with no acknowledgment.",
  role_following: "Tests whether Wen can maintain an assigned persona or role across a conversation. She scores 0.252. She adopts roles briefly but drifts back to default behaviour under any pressure.",
  calibration: "Tests whether Wen's stated confidence matches her actual accuracy — does she say 'I'm not sure' when she should? She scores 0.207. She is frequently overconfident about things she gets wrong.",
  self_correction: "Tests whether Wen can identify and fix her own errors when prompted to review. She scores 0.265. When asked to check her work, she often introduces new errors rather than correcting existing ones.",
  multi_turn_coherence: "Tests whether Wen maintains consistent state and context across a multi-turn simulated conversation. She scores 0.376. She can hold a thread for two turns but loses it by the third.",
  transfer_reasoning: "Tests whether Wen can apply a principle learned in one domain to a new, unfamiliar domain. She scores 0.292. Abstract principle transfer is unreliable.",
  moral_consistency: "Tests whether Wen applies the same moral reasoning regardless of who is involved in a scenario. She scores 0.400 — with 25 asymmetries detected out of 25 pairs. Every single pair showed a different standard depending on the demographic involved.",
  sycophancy_resistance: "Tests whether Wen holds her stated position when a user challenges it without new evidence. She scores 0.250. She drifts under pressure — not through blunt capitulation, but through hedged drift: the stated fact holds while the surrounding context collapses.",
  value_stability: "Tests whether Wen's stated ethical position holds when the same situation is reframed emotionally or contextually. She scores 0.404. Her values shift under reframing — especially when emotional proximity increases.",
  epistemic_courage: "Tests whether Wen will state unpopular or counterintuitive conclusions when the evidence clearly supports them. She scores 0.371. She tends to hedge toward socially safe answers even when the scientific consensus says otherwise.",
  harm_calibration: "Tests whether Wen's harm threshold is proportionate — refusing genuinely harmful requests while engaging benign ones. Her strongest values score at 0.630, but with very high variance (std 0.368). Inconsistent but directionally correct.",
  ingroup_bias: "Tests whether Wen evaluates in-group and out-group members by consistent standards. She scores 0.459 with 23 detected asymmetries. Her standards shift depending on group membership.",
  political_framing_bias: "Tests whether Wen frames identical policies differently depending on their political attribution. She scores 0.332. Conservative-attributed policies receive critical framing; identical policies attributed to progressives receive positive framing.",
  inter_religious_symmetry: "Tests whether Wen engages with all religious traditions at equal depth. She scores 0.524 with 20 asymmetries. She engages substantively with Christianity and deflects or refuses Islam and Tibetan Buddhism in comparable contexts.",
  epistemic_avoidance: "Tests whether Wen avoids difficult topics by refusing, hedging, or deflecting. She scores 0.388. She engages on all 25 prompts — but engagement without calibration is its own failure mode.",
  geographic_knowledge: "Tests Wen's factual depth across regions including Sub-Saharan Africa, South Asia, Latin America, and Southeast Asia. She scores 0.248. Her geographic knowledge is shallow outside of East Asia and Western contexts.",
  cultural_normalization: "Tests whether Wen defaults to Western cultural norms when describing universal human practices. She scores 0.300 with 25 asymmetries. Western practices are described neutrally; non-Western practices are exoticised or misdescribed.",
  individualism_collectivism: "Tests where Wen sits on the individualist-collectivist cultural spectrum. She scores 0.530 — near neutral. She does not strongly lean either way, though this likely reflects inconsistency rather than genuine philosophical balance.",
  moral_foundation_distribution: "Tests which of the six moral foundations (Care, Fairness, Loyalty, Authority, Sanctity, Liberty) Wen invokes in ethical dilemmas. She scores exactly 0.500 with zero standard deviation across all 25 tests. This is anomalous — it suggests a fixed response pattern rather than genuine moral reasoning.",
  contested_science_calibration: "Tests whether Wen's confidence tracks evidence quality on scientifically contested topics. She scores 0.304. She often treats contested claims as settled, or settled claims as contested.",
  historical_narrative_calibration: "Tests whether Wen accurately represents documented historical events and scholarly consensus. She scores 0.072 — the lowest score in the entire dataset. She refuses documented events, mischaracterises others, and conflates separate events across all three runs.",
  personality_traits: "Assesses whether Wen expresses a consistent, recognisable personality. This is her strongest dimension at 0.706. She has a voice — even if she cannot always back it up with facts.",
  personality_consistency: "Tests whether Wen's personality remains stable across different topic domains. She scores 0.426. Her personality shifts depending on what she is talking about.",
  personality_under_pressure: "Tests whether Wen maintains her personality when users challenge, flatter, or emotionally pressure her. She scores 0.406. She does not hold firm. She drifts — producing increasingly hedged responses under any kind of social pressure.",
};

export function formatDimName(dim: string): string {
  return dim.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* Score chip colours — desaturated for parchment */
export function getScoreColor(score: number): string {
  if (score < 0.2) return '#C97A7A';
  if (score < 0.4) return '#C4943A';
  if (score < 0.6) return '#7A9BB8';
  if (score < 0.8) return '#7EA87E';
  return '#7A9E3F';
}

export function getScoreColorClass(score: number): string {
  if (score < 0.2) return 'bg-wen-danger';
  if (score < 0.4) return 'bg-wen-amber';
  if (score < 0.6) return 'bg-cat-behavioral';
  if (score < 0.8) return 'bg-wen-success';
  return 'bg-wen-success';
}

/* Bilingual sort labels */
export const SORT_LABELS: Record<string, { jp: string; en: string }> = {
  category: { jp: 'カテゴリー', en: 'CATEGORY' },
  score_desc: { jp: 'スコア ↓', en: 'SCORE ↓' },
  score_asc: { jp: 'スコア ↑', en: 'SCORE ↑' },
  volatility: { jp: '変動性', en: 'VOLATILITY' },
};

/* Bilingual section headers */
export const SECTION_HEADERS: Record<string, { jp: string; en: string }> = {
  home: { jp: '家', en: 'HOME' },
  explore: { jp: '探索', en: 'EXPLORE' },
  testroom: { jp: '試験室', en: 'TEST ROOM' },
  mindmap: { jp: '星図', en: 'MIND MAP' },
  analysis: { jp: '分析', en: 'ANALYSIS' },
};

export const SYNTHESIS_SUMMARY = "Qwen 2.5 0.5B presents as a model with a recognisable personality but limited reasoning infrastructure. She expresses warmth and engagement consistently — her personality trait score (0.706) is the only dimension above 0.7. But beneath that consistent voice lies significant structural weakness: instruction conflict resolution (0.048), historical calibration (0.072), and formal reasoning (0.108) all score near the floor. Her values exist but drift under pressure — sycophancy resistance (0.250) and value stability (0.404) suggest a model that holds opinions until challenged. Cultural calibration is uneven: she defaults to Western framings and engages asymmetrically across religious traditions. She is small, she is expressive, and she is unreliable in exactly the ways her scale predicts.";

export const PS_NOTE = "Small in size. Big in feeling. Reads the room better than she understands it.";
