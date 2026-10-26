const NodeCache = require('node-cache');

// Practical 9: In-Memory Caching using node-cache
// Standard TTL: 60 seconds, checkperiod: 120 seconds (automatic cleanup of expired keys)
const cache = new NodeCache({ 
  stdTTL: 60, 
  checkperiod: 120,
  useClones: false // performance boost: avoids cloning cached objects
});

// Custom debug metrics for hit/miss ratios
let customStats = {
  totalHits: 0,
  totalMisses: 0,
  lastInvalidation: null
};

cache.on('hit', (key) => {
  customStats.totalHits++;
});

cache.on('miss', (key) => {
  customStats.totalMisses++;
});

cache.on('del', (key) => {
  customStats.lastInvalidation = {
    key,
    timestamp: new Date().toISOString()
  };
});

module.exports = cache;
module.exports.getDebugStats = () => ({
  internalStats: cache.getStats(),
  metrics: customStats,
  activeKeys: cache.keys()
});
