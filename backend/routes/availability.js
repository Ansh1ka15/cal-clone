const router = require('express').Router();
const ctrl = require('../controllers/availabilityController');

router.get('/', ctrl.get);
router.post('/', ctrl.create);
router.put('/', ctrl.update);

module.exports = router;
