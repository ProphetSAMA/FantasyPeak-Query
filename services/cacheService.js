const NodeCache = require('node-cache');
const config = require('../config/app');

const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkPeriod,
  useClones: false
});

module.exports = {
  get(key) {
    return cache.get(key);
  },

  set(key, value, ttl) {
    return cache.set(key, value, ttl);
  },

  del(key) {
    return cache.del(key);
  },

  flush() {
    return cache.flushAll();
  },

  getStats() {
    return cache.getStats();
  }
};
