const historyService = require('../services/history.service');

function listHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    res.json({ ok: true, data: historyService.listHistory(limit) });
  } catch (error) {
    next(error);
  }
}

function clearHistory(_req, res, next) {
  try {
    historyService.clearHistory();
    res.json({ ok: true, message: 'Historial eliminado.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listHistory, clearHistory };
