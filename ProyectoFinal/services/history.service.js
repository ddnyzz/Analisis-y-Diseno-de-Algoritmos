const historyModel = require('../models/history.model');

function listHistory(limit) {
  return historyModel.listRuns(limit);
}

function clearHistory() {
  return historyModel.clearRuns();
}

module.exports = { listHistory, clearHistory };
