export const fraudService = {
  evaluate(input: {
    repeatedImages: number;
    requestVelocity: number;
    failedHandOffs: number;
    geoMismatchKm: number;
  }) {
    const ruleHits = [
      input.repeatedImages > 2 ? 'DUPLICATE_IMAGE_REUSE' : null,
      input.requestVelocity > 20 ? 'ABNORMAL_REQUEST_VELOCITY' : null,
      input.failedHandOffs > 3 ? 'REPEATED_HANDOFF_FAILURE' : null,
      input.geoMismatchKm > 30 ? 'IMPOSSIBLE_LOCATION_PATTERN' : null
    ].filter(Boolean) as string[];

    const anomalyScore = Number(Math.min(
      0.99,
      input.repeatedImages * 0.12 +
      input.requestVelocity * 0.02 +
      input.failedHandOffs * 0.1 +
      input.geoMismatchKm * 0.01
    ).toFixed(2));

    return {
      anomalyScore,
      severity: anomalyScore > 0.8 ? 'HIGH' : anomalyScore > 0.45 ? 'MEDIUM' : 'LOW',
      ruleHits,
      recommendManualReview: anomalyScore >= 0.55 || ruleHits.length >= 2
    };
  }
};
