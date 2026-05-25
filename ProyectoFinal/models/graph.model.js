const { db } = require('../config/db');

function mapNode(row) {
  return {
    id: row.id,
    name: row.name,
    lat: Number(row.lat),
    lng: Number(row.lng),
    type: row.type,
    description: row.description || ''
  };
}

function mapEdge(row) {
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    distance: Number(row.distance),
    time: Number(row.time),
    cost: Number(row.cost),
    bidirectional: Number(row.bidirectional),
    label: row.label || ''
  };
}

function getNodes() {
  return db.prepare('SELECT * FROM nodes ORDER BY id ASC').all().map(mapNode);
}

function getEdges() {
  return db.prepare('SELECT * FROM edges ORDER BY id ASC').all().map(mapEdge);
}

function getGraph() {
  return {
    nodes: getNodes(),
    edges: getEdges()
  };
}

function replaceGraph(nodes, edges) {
  const trx = db.transaction(() => {
    db.prepare('DELETE FROM edges').run();
    db.prepare('DELETE FROM nodes').run();

    const insertNode = db.prepare(`
      INSERT INTO nodes (id, name, lat, lng, type, description)
      VALUES (@id, @name, @lat, @lng, @type, @description)
    `);

    const insertEdge = db.prepare(`
      INSERT INTO edges (id, source_id, target_id, distance, time, cost, bidirectional, label)
      VALUES (@id, @sourceId, @targetId, @distance, @time, @cost, @bidirectional, @label)
    `);

    nodes.forEach((node) => insertNode.run({
      id: String(node.id),
      name: String(node.name || node.id),
      lat: Number(node.lat),
      lng: Number(node.lng),
      type: String(node.type || 'waypoint'),
      description: String(node.description || '')
    }));

    edges.forEach((edge) => insertEdge.run({
      id: String(edge.id),
      sourceId: String(edge.sourceId),
      targetId: String(edge.targetId),
      distance: Number(edge.distance),
      time: Number(edge.time ?? edge.distance),
      cost: Number(edge.cost ?? edge.distance),
      bidirectional: Number(edge.bidirectional ?? 1),
      label: String(edge.label || '')
    }));
  });

  trx();
  return getGraph();
}

module.exports = {
  getGraph,
  getNodes,
  getEdges,
  replaceGraph
};
