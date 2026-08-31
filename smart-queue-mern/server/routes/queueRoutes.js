const express = require('express');
const router = express.Router();
const {
  getQueue,
  joinQueue,
  callNext,
  completeTicket,
} = require('../controllers/queueController');

router.get('/', getQueue);
router.post('/join', joinQueue);
router.put('/next', callNext);
router.put('/:id/complete', completeTicket);

module.exports = router;
