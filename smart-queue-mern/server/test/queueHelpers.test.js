const test = require('node:test');
const assert = require('node:assert');
const { computeNextTicketNumber } = require('../utils/queueHelpers');

test('returns 1 when there is no last ticket', () => {
  assert.strictEqual(computeNextTicketNumber(null), 1);
  assert.strictEqual(computeNextTicketNumber(undefined), 1);
});

test('returns lastTicket.ticketNumber + 1 when a last ticket exists', () => {
  assert.strictEqual(computeNextTicketNumber({ ticketNumber: 1 }), 2);
  assert.strictEqual(computeNextTicketNumber({ ticketNumber: 41 }), 42);
});

test('treats a malformed ticket (no ticketNumber) as if there were none', () => {
  assert.strictEqual(computeNextTicketNumber({}), 1);
});
