const graphModel = require('../models/graph.model');
const dijkstra = require('../algorithms/dijkstra');
const prim = require('../algorithms/prim');
const kruskal = require('../algorithms/kruskal');
const historyModel = require('../models/history.model');
const { normalizeWeightKey } = require('../utils/graphUtils');
const AppError = require('../utils/AppError');

function runAlgorithm({ algorithm, originId, destinationId, weightKey }) {
  const graph = graphModel.getGraph();
  const selectedWeightKey = normalizeWeightKey(weightKey);
  const selectedAlgorithm = String(algorithm || '').toLowerCase();
  let result;

  if (selectedAlgorithm === 'dijkstra') {
    if (!originId || !destinationId) {
      throw new AppError('Dijkstra requiere origen y destino.', 422);
    }
    result = dijkstra(graph, originId, destinationId, selectedWeightKey);
  } else if (selectedAlgorithm === 'prim') {
    result = prim(graph, originId, selectedWeightKey);
  } else if (selectedAlgorithm === 'kruskal') {
    result = kruskal(graph, selectedWeightKey);
  } else {
    throw new AppError('Algoritmo no soportado. Usa dijkstra, prim o kruskal.', 422);
  }

  historyModel.createRun({
    algorithm: result.algorithm,
    originId: result.originId || originId || null,
    destinationId: result.destinationId || destinationId || null,
    weightKey: selectedWeightKey,
    totalCost: result.totalCost,
    visitedCount: result.visitedCount,
    executionMs: result.executionMs,
    result
  });

  return { result, graph };
}

module.exports = { runAlgorithm };
