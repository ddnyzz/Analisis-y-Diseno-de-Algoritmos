const { db } = require('../config/db');

function createRun(run) {
  const stmt = db.prepare(`
    INSERT INTO algorithm_runs (
      algorithm, origin_id, destination_id, weight_key, total_cost,
      visited_count, execution_ms, result_json
    ) VALUES (
      @algorithm, @originId, @destinationId, @weightKey, @totalCost,
      @visitedCount, @executionMs, @resultJson
    )
  `);

  const info = stmt.run({
    algorithm: run.algorithm,
    originId: run.originId || null,
    destinationId: run.destinationId || null,
    weightKey: run.weightKey || 'distance',
    totalCost: Number.isFinite(Number(run.totalCost)) ? Number(run.totalCost) : null,
    visitedCount: Number.isFinite(Number(run.visitedCount)) ? Number(run.visitedCount) : null,
    executionMs: Number.isFinite(Number(run.executionMs)) ? Number(run.executionMs) : null,
    resultJson: JSON.stringify(run.result || run)
  });

  return { id: info.lastInsertRowid, ...run };
}

function listRuns(limit = 20) {
  return db.prepare(`
    SELECT * FROM algorithm_runs
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `).all(limit).map((row) => ({
    id: row.id,
    algorithm: row.algorithm,
    originId: row.origin_id,
    destinationId: row.destination_id,
    weightKey: row.weight_key,
    totalCost: row.total_cost === null ? null : Number(row.total_cost),
    visitedCount: row.visited_count,
    executionMs: row.execution_ms === null ? null : Number(row.execution_ms),
    result: JSON.parse(row.result_json),
    createdAt: row.created_at
  }));
}

function clearRuns() {
  db.prepare('DELETE FROM algorithm_runs').run();
  return true;
}

module.exports = { createRun, listRuns, clearRuns };
