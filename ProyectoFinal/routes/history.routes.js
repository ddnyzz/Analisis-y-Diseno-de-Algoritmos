const router = require('express').Router();
const historyController = require('../controllers/history.controller');

router.get('/', historyController.listHistory);
router.delete('/', historyController.clearHistory);

module.exports = router;
