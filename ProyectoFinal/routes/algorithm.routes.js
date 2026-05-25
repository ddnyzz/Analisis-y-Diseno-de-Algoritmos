const router = require('express').Router();
const algorithmController = require('../controllers/algorithm.controller');
const { requireFields } = require('../middleware/validateRequest');

router.post('/run', requireFields(['algorithm']), algorithmController.runAlgorithm);

module.exports = router;
