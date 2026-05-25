const graphService = require('../services/graph.service');

function getGraph(_req, res, next) {
  try {
    res.json({ ok: true, data: graphService.getGraph() });
  } catch (error) {
    next(error);
  }
}

function importGraph(req, res, next) {
  try {
    const graph = graphService.importGraph(req.body);
    res.json({ ok: true, message: 'Grafo importado correctamente.', data: graph });
  } catch (error) {
    next(error);
  }
}

module.exports = { getGraph, importGraph };
