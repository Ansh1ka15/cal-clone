const router = require('express').Router();
const ctrl = require('../controllers/scheduleController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);
router.post('/:id/duplicate', ctrl.duplicate);

module.exports = router;
