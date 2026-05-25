const router = require('express').Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'GeoRutas GraphGPS', timestamp: new Date().toISOString() });
});

module.exports = router;
