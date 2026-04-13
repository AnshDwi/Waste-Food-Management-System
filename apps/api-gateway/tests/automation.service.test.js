import { automationService } from '../src/modules/automation/automation.service.js';
describe('automationService', () => {
    it('reassigns to the next ngo when sla expires', () => {
        const result = automationService.reassign({
            donationId: 'don_1',
            previousNgoId: 'ngo_a',
            elapsedMinutes: 12,
            recommendations: [
                { ngoId: 'ngo_a', totalScore: 0.92 },
                { ngoId: 'ngo_b', totalScore: 0.84 }
            ]
        });
        expect(result.shouldReassign).toBe(true);
        expect(result.nextNgoId).toBe('ngo_b');
    });
});
