import { fraudService } from '../src/modules/fraud/fraud.service.js';

describe('fraudService', () => {
  it('flags suspicious patterns for manual review', () => {
    const result = fraudService.evaluate({
      repeatedImages: 4,
      requestVelocity: 24,
      failedHandOffs: 2,
      geoMismatchKm: 40
    });

    expect(result.recommendManualReview).toBe(true);
    expect(result.ruleHits).toContain('DUPLICATE_IMAGE_REUSE');
  });
});
