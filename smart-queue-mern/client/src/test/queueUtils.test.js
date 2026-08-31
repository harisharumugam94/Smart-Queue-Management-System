import { describe, it, expect } from 'vitest';
import { getNowServing } from '../queueUtils';

describe('getNowServing', () => {
    it('returns undefined for an empty queue', () => {
        expect(getNowServing([])).toBeUndefined();
    });

    it('returns undefined when nothing is being served', () => {
        const queue = [{ ticketNumber: 1, status: 'waiting' }];
        expect(getNowServing(queue)).toBeUndefined();
    });

    it('returns the ticket with status "serving"', () => {
        const queue = [
            { ticketNumber: 1, status: 'completed' },
            { ticketNumber: 2, status: 'serving' },
            { ticketNumber: 3, status: 'waiting' },
        ];
        expect(getNowServing(queue)).toEqual({ ticketNumber: 2, status: 'serving' });
    });

    it('handles non-array input gracefully', () => {
        expect(getNowServing(null)).toBeUndefined();
        expect(getNowServing(undefined)).toBeUndefined();
    });
});