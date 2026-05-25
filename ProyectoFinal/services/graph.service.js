const graphModel = require('../models/graph.model');
const AppError = require('../utils/AppError');

function validateGraphPayload(nodes, edges) {
  if (!Array.isArray(nodes) || nodes.length < 2) {
    throw new AppError('El grafo debe incluir al menos dos nodos.', 422);
  }

  if (!Array.isArray(edges) || edges.length < 1) {
    throw new AppError('El grafo debe incluir al menos una arista.', 422);
  }

  const ids = new Set();
  nodes.forEach((node) => {
    if (!node.id || !node.name) {
      throw new AppError('Cada nodo debe incluir id y name.', 422, { node });
    }
    if (ids.has(String(node.id))) {
      throw new AppError(`Nodo duplicado: ${node.id}.`, 422);
    }
    ids.add(String(node.id));
    if (!Number.isFinite(Number(node.lat)) || !Number.isFinite(Number(node.lng))) {
      throw new AppError(`Coordenadas inválidas en el nodo ${node.id}.`, 422);
    }
  });

  const edgeIds = new Set();
  edges.forEach((edge) => {
    if (!edge.id || !edge.sourceId || !edge.targetId) {
      throw new AppError('Cada arista debe incluir id, sourceId y targetId.', 422, { edge });
    }
    if (edgeIds.has(String(edge.id))) {
      throw new AppError(`Arista duplicada: ${edge.id}.`, 422);
    }
    edgeIds.add(String(edge.id));
    if (!ids.has(String(edge.sourceId)) || !ids.has(String(edge.targetId))) {
      throw new AppError(`La arista ${edge.id} referencia nodos no registrados.`, 422);
    }
    ['distance', 'time', 'cost'].forEach((key) => {
      const value = Number(edge[key]);
      if (!Number.isFinite(value) || value < 0) {
        throw new AppError(`Peso ${key} inválido en la arista ${edge.id}.`, 422);
      }
    });
  });
}

function getGraph() {
  return graphModel.getGraph();
}

function importGraph(payload) {
  validateGraphPayload(payload.nodes, payload.edges);
  return graphModel.replaceGraph(payload.nodes, payload.edges);
}

module.exports = { getGraph, importGraph };
