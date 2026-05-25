const { performance } = require('node:perf_hooks');
const { edgeWeight } = require('../utils/graphUtils');

class DisjointSet {
  constructor(items) {
    this.parent = new Map(items.map((item) => [item, item]));
    this.rank = new Map(items.map((item) => [item, 0]));
  }

  find(item) {
    const parent = this.parent.get(item);
    if (parent !== item) {
      this.parent.set(item, this.find(parent));
    }
    return this.parent.get(item);
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false;

    const rankA = this.rank.get(rootA);
    const rankB = this.rank.get(rootB);

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    return true;
  }

  countComponents() {
    const roots = new Set();
    this.parent.forEach((_value, key) => roots.add(this.find(key)));
    return roots.size;
  }
}

function kruskal(graph, weightKey = 'distance') {
  const start = performance.now();
  const nodes = graph.nodes;
  const edges = graph.edges;

  if (nodes.length === 0) {
    return {
      algorithm: 'kruskal',
      type: 'minimum_spanning_tree',
      applicable: false,
      message: 'El grafo está vacío.',
      selectedEdges: [],
      totalCost: null,
      visitedCount: 0,
      executionMs: performance.now() - start
    };
  }

  const nodeIds = nodes.map((node) => node.id);
  const disjointSet = new DisjointSet(nodeIds);
  const sortedEdges = [...edges].sort((a, b) => edgeWeight(a, weightKey) - edgeWeight(b, weightKey));
  const selectedEdges = [];
  let totalCost = 0;

  sortedEdges.forEach((edge) => {
    if (disjointSet.union(edge.sourceId, edge.targetId)) {
      selectedEdges.push(edge.id);
      totalCost += edgeWeight(edge, weightKey);
    }
  });

  const components = disjointSet.countComponents();

  return {
    algorithm: 'kruskal',
    type: 'minimum_spanning_tree',
    applicable: true,
    message: components === 1
      ? 'Árbol de expansión mínima calculado con Kruskal.'
      : `Kruskal generó un bosque mínimo con ${components} componentes.`,
    originId: null,
    destinationId: null,
    weightKey,
    selectedEdges,
    pathEdges: selectedEdges,
    pathNodes: nodeIds,
    totalCost: Number(totalCost.toFixed(4)),
    visitedCount: nodeIds.length,
    components,
    executionMs: Number((performance.now() - start).toFixed(4))
  };
}

module.exports = kruskal;
