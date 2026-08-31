import { describe, it, expect } from 'vitest';
import { computeNextTicketNumber } from '../utils/queueHelpers.js';

describe('computeNextTicketNumber', () => {
    it('returns 1 when there is no last ticket', () => {
        expect(computeNextTicketNumber(null)).toBe(1);
        expect(computeNextTicketNumber(undefined)).toBe(1);
    });

    it('returns lastTicket.ticketNumber + 1 when a last ticket exists', () => {
        const lastTicket = { ticketNumber: 42 };
        expect(computeNextTicketNumber(lastTicket)).toBe(43);
    });

    it('treats a malformed ticket (no ticketNumber) as if there were none', () => {
        expect(computeNextTicketNumber({})).toBe(1);
        expect(computeNextTicketNumber({ someField: 'value' })).toBe(1);
    });
});