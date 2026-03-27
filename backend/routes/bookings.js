const router = require('express').Router();
const ctrl = require('../controllers/bookingController');

router.get('/', ctrl.getAll);
router.get('/slots', ctrl.getAvailableSlots);
router.post('/', ctrl.create);
router.patch('/:id/cancel', ctrl.cancel);
router.patch('/:id/reschedule', ctrl.reschedule);

module.exports = router;
