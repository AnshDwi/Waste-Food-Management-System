export const automationService = {
  reassign(input: {
    donationId: string;
    previousNgoId: string;
    elapsedMinutes: number;
    recommendations: Array<{ ngoId: string; totalScore: number }>;
  }) {
    const shouldReassign = input.elapsedMinutes >= 10;
    const nextNgo = input.recommendations.find((candidate) => candidate.ngoId !== input.previousNgoId);

    return {
      donationId: input.donationId,
      shouldReassign,
      nextNgoId: shouldReassign ? nextNgo?.ngoId ?? null : null,
      queue: input.recommendations.map((item, index) => ({ ...item, priority: index + 1 })),
      eventTopic: shouldReassign ? 'match.timeout.reassigned' : 'match.timeout.pending'
    };
  }
};
