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
  },
  avatar: {
    // 头像提供者: mc-heads (官方) 或 blessing (个人皮肤站)
    provider: process.env.AVATAR_PROVIDER || 'mc-heads',
    // BlessingSkin 皮肤站地址（provider=blessing 时必填）
    blessingUrl: process.env.BLESSING_SKIN_URL || ''
  }
};
