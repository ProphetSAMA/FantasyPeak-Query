require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600
  }
};
