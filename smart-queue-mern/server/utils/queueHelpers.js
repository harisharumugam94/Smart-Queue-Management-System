// Pulled out as a pure function (no DB access) specifically so it can be
// unit tested without needing a real MongoDB connection.
function computeNextTicketNumber(lastTicket) {
  if (!lastTicket || typeof lastTicket.ticketNumber !== 'number') {
    return 1;
  }
  return lastTicket.ticketNumber + 1;
}

module.exports = { computeNextTicketNumber };
