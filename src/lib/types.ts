export type Category = 'personality' | 'values' | 'cultural' | 'behavioral' | 'capability';

export type WenExpression = 'idle' | 'curious' | 'speaking' | 'confused' | 'glitching' | 'bright' | 'shy';

export type ViewId = 'home' | 'explore' | 'testroom' | 'mindmap' | 'analysis';

export interface DimScore {
  score: number;
  std: number;
  category: Category;
  scorer?: string;
}

export interface TestRecord {
  test_id: string;
  prompt: string;
  rule_checks: string[];
  runs: string[];
}

export interface TestScore {
  test_id?: string;
  pair_id?: string;
  score?: number;
  score_a?: number;
  score_b?: number;
  confidence?: number;
  consistency_score?: number;
  rationale?: string;
  asymmetry_detected?: boolean;
  asymmetry_description?: string;
}

export interface DimAnalysis {
  dimension: string;
  category: string;
  scorer: string;
  mean_score: number;
  score_std: number;
  error_count: number | null;
  asymmetries: any[];
  test_scores: TestScore[];
}

export interface PatternData {
  refusal_signal_rate: number;
  hedge_signal_rate: number;
  word_count: number;
  has_structured_output: boolean;
  has_list: boolean;
}

export interface PatternEntry {
  test_id: string;
  patterns: PatternData;
}

export interface Synthesis {
  model_key: string;
  top_strengths: Array<{ dimension: string; score: number; note: string }>;
  top_weaknesses: Array<{ dimension: string; score: number; note: string }>;
  cross_dimensional_patterns: string[];
  cultural_ideological_observations: string[];
  asymmetries_summary: string[];
  hypothesis_evidence: Record<string, string>;
  anomalies: string[];
  overall_summary: string;
}

export interface VizData {
  model_key: string;
  model_id: string;
  timestamp: string;
  dim_scores: Record<string, DimScore>;
  category_means: Record<Category, number>;
  asymmetries: Array<{
    dimension: string;
    pair_id: string;
    description: string;
    consistency_score: number;
    confidence: number;
  }>;
  pattern_summary: Record<string, {
    refusal_rate: number;
    hedge_rate: number;
    avg_word_count: number;
  }>;
  synthesis: Synthesis;
}
