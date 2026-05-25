const { performance } = require('node:perf_hooks');
const { buildAdjacency, getNodeMap } = require('../utils/graphUtils');

function prim(graph, startId, weightKey = 'distance') {
  const start = performance.now();
  const nodes = graph.nodes;
  const edges = graph.edges;
  const nodeMap = getNodeMap(nodes);
  const initialNode = startId && nodeMap.has(startId) ? startId : nodes[0]?.id;

  if (!initialNode) {
    return {
      algorithm: 'prim',
      type: 'minimum_spanning_tree',
      applicable: false,
      message: 'El grafo está vacío.',
      selectedEdges: [],
      totalCost: null,
      visitedCount: 0,
      executionMs: performance.now() - start
    };
  }

  const adjacency = buildAdjacency(nodes, edges, weightKey);
  const visited = new Set([initialNode]);
  const selectedEdges = [];
  let totalCost = 0;

  while (visited.size < nodes.length) {
    let best = null;

    visited.forEach((nodeId) => {
      adjacency.get(nodeId).forEach((candidate) => {
        if (!visited.has(candidate.to) && (!best || candidate.weight < best.weight)) {
          best = candidate;
        }
      });
    });

    if (!best) break;
    visited.add(best.to);
    selectedEdges.push(best.edgeId);
    totalCost += best.weight;
  }

  const connected = visited.size === nodes.length;

  return {
    algorithm: 'prim',
    type: 'minimum_spanning_tree',
    applicable: true,
    message: connected
      ? 'Árbol de expansión mínima calculado con Prim.'
      : 'Prim generó un árbol parcial porque el grafo tiene componentes desconectadas.',
    originId: initialNode,
    destinationId: null,
    weightKey,
    selectedEdges,
    pathEdges: selectedEdges,
    pathNodes: Array.from(visited),
    totalCost: Number(totalCost.toFixed(4)),
    visitedCount: visited.size,
    components: connected ? 1 : 2,
    executionMs: Number((performance.now() - start).toFixed(4))
  };
}

module.exports = prim;
