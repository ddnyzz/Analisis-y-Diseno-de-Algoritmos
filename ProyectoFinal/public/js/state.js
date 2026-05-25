export const state = {
  graph: { nodes: [], edges: [] },
  originId: null,
  destinationId: null,
  algorithm: 'dijkstra',
  weightKey: 'distance',
  showWeights: true,
  showGraph: true,
  result: null,
  history: [],
  routeCoordinates: []
};

export function nodeById(id) {
  return state.graph.nodes.find((node) => node.id === id) || null;
}

export function edgeById(id) {
  return state.graph.edges.find((edge) => edge.id === id) || null;
}

export function setSelection(kind, nodeId) {
  if (kind === 'origin') {
    state.originId = nodeId;
    if (state.destinationId === nodeId) state.destinationId = null;
  }
  if (kind === 'destination') {
    state.destinationId = nodeId;
    if (state.originId === nodeId) state.originId = null;
  }
}

export function resetSelection() {
  state.originId = null;
  state.destinationId = null;
  state.result = null;
  state.routeCoordinates = [];
}
