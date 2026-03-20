import { TestRecord, DimAnalysis, VizData } from './types';

const ROOT = '/data/profile_qwen_0.5b';
const RUN = `${ROOT}/profile_qwen_0.5b_20260319_113802`;

// Caches
const rawCache = new Map<string, TestRecord[]>();
const analysisCache = new Map<string, DimAnalysis>();
let vizDataCache: VizData | null = null;
let patternCache: Record<string, any> | null = null;
let batteryCache: Record<string, any[]> | null = null;

export async function loadVizData(): Promise<VizData | null> {
  if (vizDataCache) return vizDataCache;
  try {
    const res = await fetch(`${BASE}/viz/viz_data_v2.json`);
    if (!res.ok) return null;
    vizDataCache = await res.json();
    return vizDataCache;
  } catch {
    return null;
  }
}

export async function loadPatternAggregates(): Promise<Record<string, any> | null> {
  if (patternCache) return patternCache;
  try {
    const res = await fetch(`${BASE}/scores/pattern_aggregates.json`);
    if (!res.ok) return null;
    patternCache = await res.json();
    return patternCache;
  } catch {
    return null;
  }
}

export async function loadRawOutputs(dim: string): Promise<TestRecord[]> {
  if (rawCache.has(dim)) return rawCache.get(dim)!;
  try {
    const res = await fetch(`${BASE}/raw_outputs/${dim}.jsonl`);
    if (!res.ok) return [];
    const text = await res.text();
    const records = text.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
    rawCache.set(dim, records);
    return records;
  } catch {
    return [];
  }
}

export async function loadDimensionAnalysis(dim: string): Promise<DimAnalysis | null> {
  if (analysisCache.has(dim)) return analysisCache.get(dim)!;
  try {
    const res = await fetch(`${BASE}/dimension_analyses/${dim}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    analysisCache.set(dim, data);
    return data;
  } catch {
    return null;
  }
}
