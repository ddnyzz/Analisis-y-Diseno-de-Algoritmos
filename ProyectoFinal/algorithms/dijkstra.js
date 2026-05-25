const { performance } = require('node:perf_hooks');
const { buildAdjacency, getNodeMap } = require('../utils/graphUtils');

function extractMin(queue, distances) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  queue.forEach((nodeId, index) => {
    if (distances.get(nodeId) < bestDistance) {
      bestDistance = distances.get(nodeId);
      bestIndex = index;
    }
  });
  return queue.splice(bestIndex, 1)[0];
}

function dijkstra(graph, originId, destinationId, weightKey = 'distance') {
  const start = performance.now();
  const nodes = graph.nodes;
  const edges = graph.edges;
  const nodeMap = getNodeMap(nodes);

  if (!nodeMap.has(originId) || !nodeMap.has(destinationId)) {
    return {
      algorithm: 'dijkstra',
      type: 'shortest_path',
      applicable: false,
      message: 'Origen o destino inexistente en el grafo.',
      pathNodes: [],
      pathEdges: [],
      totalCost: null,
      visitedCount: 0,
      executionMs: performance.now() - start
    };
  }

  const adjacency = buildAdjacency(nodes, edges, weightKey);
  const distances = new Map(nodes.map((node) => [node.id, Infinity]));
  const previousNode = new Map();
  const previousEdge = new Map();
  const queue = nodes.map((node) => node.id);
  const visited = new Set();
  distances.set(originId, 0);

  while (queue.length > 0) {
    const current = extractMin(queue, distances);
    const currentDistance = distances.get(current);

    if (currentDistance === Infinity) break;
    visited.add(current);
    if (current === destinationId) break;

    adjacency.get(current).forEach((item) => {
      const alternative = currentDistance + item.weight;
      if (alternative < distances.get(item.to)) {
        distances.set(item.to, alternative);
        previousNode.set(item.to, current);
        previousEdge.set(item.to, item.edgeId);
      }
    });
  }

  if (distances.get(destinationId) === Infinity) {
    return {
      algorithm: 'dijkstra',
      type: 'shortest_path',
      applicable: true,
      message: 'No existe ruta entre el origen y el destino seleccionados.',
      pathNodes: [],
      pathEdges: [],
      totalCost: null,
      visitedCount: visited.size,
      executionMs: performance.now() - start
    };
  }

  const pathNodes = [];
  const pathEdges = [];
  let cursor = destinationId;
  while (cursor) {
    pathNodes.unshift(cursor);
    if (previousEdge.has(cursor)) {
      pathEdges.unshift(previousEdge.get(cursor));
    }
    cursor = previousNode.get(cursor);
  }

  return {
    algorithm: 'dijkstra',
    type: 'shortest_path',
    applicable: true,
    message: 'Ruta mínima calculada correctamente.',
    originId,
    destinationId,
    weightKey,
    pathNodes,
    pathEdges,
    selectedEdges: pathEdges,
    totalCost: Number(distances.get(destinationId).toFixed(4)),
    visitedCount: visited.size,
    executionMs: Number((performance.now() - start).toFixed(4))
  };
}

module.exports = dijkstra;
