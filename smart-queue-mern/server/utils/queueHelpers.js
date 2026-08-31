function computeNextTicketNumber(lastTicket) {
    if (!lastTicket || typeof lastTicket.ticketNumber !== 'number') {
        return 1;
    }
    return lastTicket.ticketNumber + 1;
}

export { computeNextTicketNumber };