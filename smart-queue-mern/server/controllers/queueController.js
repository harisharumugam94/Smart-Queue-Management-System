const Ticket = require('../models/Ticket');
const { computeNextTicketNumber } = require('../utils/queueHelpers');

// GET /api/queue — the full current queue (waiting + serving), oldest first
exports.getQueue = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: { $ne: 'completed' } }).sort({
      ticketNumber: 1,
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/queue/join — customer joins the queue, gets the next ticket number
exports.joinQueue = async (req, res) => {
  try {
    const { customerName } = req.body;
    const lastTicket = await Ticket.findOne().sort({ ticketNumber: -1 });
    const nextNumber = computeNextTicketNumber(lastTicket);
    const ticket = await Ticket.create({
      ticketNumber: nextNumber,
      customerName: customerName || 'Guest',
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/queue/next — staff calls the next waiting ticket to "serving"
exports.callNext = async (req, res) => {
  try {
    // Mark any currently-serving ticket as completed first (one at a time).
    await Ticket.updateMany({ status: 'serving' }, { status: 'completed' });

    const next = await Ticket.findOneAndUpdate(
      { status: 'waiting' },
      { status: 'serving' },
      { sort: { ticketNumber: 1 }, new: true }
    );

    if (!next) return res.status(404).json({ message: 'Queue is empty' });
    res.json(next);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/queue/:id/complete — mark a specific ticket as completed
exports.completeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
