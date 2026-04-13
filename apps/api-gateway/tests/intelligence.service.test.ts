import { intelligenceService } from '../src/modules/intelligence/intelligence.service.js';

describe('intelligenceService', () => {
  it('ranks ngos using enterprise scoring signals', () => {
    const ranked = intelligenceService.rankNgos({
      expiryMinutes: 90,
      quantity: 120,
      candidates: [
        { id: 'ngo_a', distanceKm: 3, avgResponseMinutes: 7, acceptanceRate: 0.95 },
        { id: 'ngo_b', distanceKm: 14, avgResponseMinutes: 28, acceptanceRate: 0.72 }
      ]
    });

    expect(ranked[0]?.ngoId).toBe('ngo_a');
    expect(ranked[0]?.featureContribution.acceptanceScore).toBeGreaterThan(ranked[1]?.featureContribution.acceptanceScore ?? 0);
  });
});
