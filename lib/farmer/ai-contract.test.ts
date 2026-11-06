import { expect, test } from 'vitest';
import { canApplyQuality, isOfficialWholesale } from './ai-contract';
const quality = { reviewReason: null, needsReview: false, lowConfidence: false, cropSupported: true, modelStatus: 'trained', crop: 'mango', modelGrade: 'B', suggestedListingGrade: 'B', confidenceScore: 0.9, photoSimilarity: 0.8 };
test('quality requires every independent safety gate', () => {
 expect(canApplyQuality(quality, 'mango')).toBe(true);
 for (const patch of [{ reviewReason: undefined }, { reviewReason: "unfamiliar_photo" }, { suggestedListingGrade: "A" }, { needsReview: undefined }, { needsReview: true }, { lowConfidence: undefined }, { confidenceScore: .69 }, { confidenceScore: NaN }, { modelStatus: 'untrained' }, { photoSimilarity: null }, { photoSimilarity: NaN }, { photoSimilarity: 2 }, { cropSupported: false }, { modelGrade: 'D' }, { suggestedListingGrade: 'D' }]) expect(canApplyQuality({ ...quality, ...patch }, 'mango')).toBe(false);
 expect(canApplyQuality(quality, 'rice')).toBe(false);
});
const price = { method: 'official_wholesale', predictedMinPrice: 10, predictedMaxPrice: 20, unit: 'kg', currency: 'PKR', predictionId: 'p', modelVersion: 'v', commodity: 'Mango', observedOn: '2026-06-01', marketScope: 'Punjab', marketCount: 2, source: 'AMIS', sourceUrl: 'https://amis.pk' };
test('price requires valid date and complete official provenance', () => {
 expect(isOfficialWholesale(price, 'kg')).toBe(true);
 for (const patch of [{ observedOn: '2099-01-01' }, { observedOn: '2026-02-30' }, { observedOn: '' }, { source: '' }, { marketCount: 0 }, { predictedMaxPrice: 5 }, { currency: 'USD' }, { method: 'rule_based' }, { sourceUrl: 'javascript:alert(1)' }]) expect(isOfficialWholesale({ ...price, ...patch }, 'kg')).toBe(false);
 expect(isOfficialWholesale(price, 'ton')).toBe(false);
});
