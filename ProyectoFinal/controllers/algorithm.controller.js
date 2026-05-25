const algorithmService = require('../services/algorithm.service');

function runAlgorithm(req, res, next) {
  try {
    const data = algorithmService.runAlgorithm(req.body);
    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { runAlgorithm };
