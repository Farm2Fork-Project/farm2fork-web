import type { PriceSuggestion } from '@/lib/api/contracts';

/** Treat API data as untrusted: older services may omit the review flag. */
export function canApplyQuality(value: unknown, crop: string): boolean {
  if (!value || typeof value !== 'object') return false;
  const q = value as Record<string, unknown>;
  return q.needsReview === false && q.reviewReason === null && q.suggestedListingGrade === q.modelGrade && q.lowConfidence === false && q.cropSupported === true &&
    q.modelStatus === 'trained' && q.crop === crop && ['A', 'B', 'C'].includes(String(q.modelGrade)) &&
    ['A', 'B', 'C'].includes(String(q.suggestedListingGrade)) &&
    typeof q.confidenceScore === 'number' && Number.isFinite(q.confidenceScore) && q.confidenceScore >= .7 && q.confidenceScore <= 1 &&
    typeof q.photoSimilarity === 'number' && Number.isFinite(q.photoSimilarity) && q.photoSimilarity >= 0 && q.photoSimilarity <= 1;
}

export function isOfficialWholesale(value: unknown, unit: string): value is PriceSuggestion {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  const strings = ['predictionId', 'modelVersion', 'commodity', 'marketScope', 'source', 'sourceUrl'];
  if (strings.some(k => typeof p[k] !== 'string' || !(p[k] as string).trim())) return false;
  if (typeof p.observedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.observedOn)) return false;
  const date = new Date(p.observedOn + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== p.observedOn || p.observedOn > new Date().toISOString().slice(0, 10)) return false;
  try { const url = new URL(p.sourceUrl as string); if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) return false; } catch { return false; }
  return p.method === 'official_wholesale' && p.currency === 'PKR' && p.unit === unit &&
    typeof p.marketCount === 'number' && Number.isInteger(p.marketCount) && p.marketCount > 0 &&
    typeof p.predictedMinPrice === 'number' && Number.isFinite(p.predictedMinPrice) && p.predictedMinPrice > 0 &&
    typeof p.predictedMaxPrice === 'number' && Number.isFinite(p.predictedMaxPrice) && p.predictedMaxPrice >= p.predictedMinPrice;
}
