export type CandidateNgo = {
  id: string;
  capacity: number;
  distanceKm: number;
  acceptsFoodType: boolean;
};

export const scoreNgo = (candidate: CandidateNgo, quantity: number, minutesToExpiry: number) => {
  const urgencyWeight = minutesToExpiry <= 180 ? 0.45 : 0.25;
  const distanceWeight = 0.35;
  const capacityWeight = 0.2;

  const urgencyScore = Math.max(0, 1 - minutesToExpiry / 720);
  const distanceScore = Math.max(0, 1 - candidate.distanceKm / 30);
  const capacityScore = Math.min(1, candidate.capacity / Math.max(quantity, 1));
  const preferenceBonus = candidate.acceptsFoodType ? 0.1 : -0.15;

  return Number((urgencyScore * urgencyWeight + distanceScore * distanceWeight + capacityScore * capacityWeight + preferenceBonus).toFixed(4));
};

export const matchingService = {
  recommend(input: { quantity: number; minutesToExpiry: number; candidates: CandidateNgo[] }) {
    return input.candidates
      .map((candidate) => ({
        ngoId: candidate.id,
        score: scoreNgo(candidate, input.quantity, input.minutesToExpiry),
        distanceKm: candidate.distanceKm,
        urgency: input.minutesToExpiry
      }))
      .sort((a, b) => b.score - a.score);
  }
};
