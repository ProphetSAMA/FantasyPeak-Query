const { pool } = require('../config/database');
const cache = require('./cacheService');

class ServerService {
  // 获取服务器传送点
  async getWarps() {
    const cacheKey = 'warps_all';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query('SELECT * FROM cmi_warps ORDER BY name ASC');

      cache.set(cacheKey, rows, 300); // 缓存5分钟
      return rows;
    } catch (error) {
      throw new Error(`获取传送点失败: ${error.message}`);
    }
  }

  // 获取服务器统计信息
  async getServerStats() {
    const cacheKey = 'server_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [totalPlayers] = await pool.query('SELECT COUNT(*) as total FROM cmi_users');
      const [onlinePlayers] = await pool.query('SELECT COUNT(*) as online FROM cmi_users WHERE online = 1');
      const [totalWarps] = await pool.query('SELECT COUNT(*) as total FROM cmi_warps');
      const [totalHomes] = await pool.query('SELECT COUNT(*) as total FROM cmi_homes');

      const stats = {
        totalPlayers: totalPlayers[0].total,
        onlinePlayers: onlinePlayers[0].online,
        totalWarps: totalWarps[0].total,
        totalHomes: totalHomes[0].total
      };

      cache.set(cacheKey, stats, 60); // 缓存60秒
      return stats;
    } catch (error) {
      throw new Error(`获取服务器统计失败: ${error.message}`);
    }
  }

  // 获取最近登录的玩家
  async getRecentLogins(limit = 10) {
    const cacheKey = `recent_logins_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT userName, lastOnline FROM cmi_users ORDER BY lastOnline DESC LIMIT ?',
        [limit]
      );

      cache.set(cacheKey, rows, 30); // 缓存30秒
      return rows;
    } catch (error) {
      throw new Error(`获取最近登录失败: ${error.message}`);
    }
  }

  // 获取新注册玩家
  async getNewPlayers(days = 7, limit = 10) {
    const cacheKey = `new_players_${days}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT userName, firstJoin FROM cmi_users WHERE firstJoin >= DATE_SUB(NOW(), INTERVAL ? DAY) ORDER BY firstJoin DESC LIMIT ?',
        [days, limit]
      );

      cache.set(cacheKey, rows, 300); // 缓存5分钟
      return rows;
    } catch (error) {
      throw new Error(`获取新玩家失败: ${error.message}`);
    }
  }

  // 获取玩家活跃度统计（按天）
  async getActivityStats(days = 7) {
    const cacheKey = `activity_stats_${days}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        `SELECT
          DATE(FROM_UNIXTIME(lastOnline / 1000)) as date,
          COUNT(*) as count
        FROM cmi_users
        WHERE lastOnline >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ? DAY)) * 1000
        GROUP BY DATE(FROM_UNIXTIME(lastOnline / 1000))
        ORDER BY date ASC`,
        [days]
      );

      cache.set(cacheKey, rows, 300); // 缓存5分钟
      return rows;
    } catch (error) {
      throw new Error(`获取活跃度统计失败: ${error.message}`);
    }
  }

  // 获取新玩家注册统计（按天）
  async getNewPlayersStats(days = 30) {
    const cacheKey = `new_players_stats_${days}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        `SELECT
          DATE(FROM_UNIXTIME(firstJoin / 1000)) as date,
          COUNT(*) as count
        FROM cmi_users
        WHERE firstJoin >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ? DAY)) * 1000
        GROUP BY DATE(FROM_UNIXTIME(firstJoin / 1000))
        ORDER BY date ASC`,
        [days]
      );

      cache.set(cacheKey, rows, 300); // 缓存5分钟
      return rows;
    } catch (error) {
      throw new Error(`获取新玩家统计失败: ${error.message}`);
    }
  }
}

module.exports = new ServerService();
