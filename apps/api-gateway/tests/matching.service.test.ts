import { matchingService } from '../src/modules/matching/matching.service.js';

describe('matchingService', () => {
  it('sorts ngos by highest score first', () => {
    const recommendations = matchingService.recommend({
      quantity: 100,
      minutesToExpiry: 120,
      candidates: [
        { id: 'ngo_far', capacity: 90, distanceKm: 18, acceptsFoodType: true },
        { id: 'ngo_near', capacity: 120, distanceKm: 4, acceptsFoodType: true }
      ]
    });

    expect(recommendations[0]?.ngoId).toBe('ngo_near');
  });
});
