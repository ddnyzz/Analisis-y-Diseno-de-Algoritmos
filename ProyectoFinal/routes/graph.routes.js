const router = require('express').Router();
const graphController = require('../controllers/graph.controller');

router.get('/', graphController.getGraph);
router.post('/import', graphController.importGraph);

module.exports = router;
