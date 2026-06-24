const { pool } = require('../config/database');
const { daysAgoTimestamp, dateFromMillis } = require('../config/db-utils');
const cache = require('./cacheService');

class ServerService {
  // 获取服务器传送点（CMI 数据库中无 warps 表，返回空）
  async getWarps() {
    const cacheKey = 'warps_all';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // 尝试查询 warps 表（某些 CMI 配置可能有）
      const [rows] = await pool.query('SELECT * FROM warps ORDER BY name ASC').catch(() => [[]]);
      cache.set(cacheKey, rows, 300);
      return rows;
    } catch {
      // warps 表不存在，返回空数组
      cache.set(cacheKey, [], 300);
      return [];
    }
  }

  // 获取服务器统计信息
  async getServerStats() {
    const cacheKey = 'server_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [totalPlayers] = await pool.query('SELECT COUNT(*) as total FROM users');
      const [onlinePlayers] = await pool.query(
        'SELECT COUNT(*) as online FROM users WHERE LastLoginTime > LastLogoffTime'
      );

      // warps 和 homes 统计
      let totalWarps = 0;
      try {
        const [w] = await pool.query('SELECT COUNT(*) as total FROM warps');
        totalWarps = w[0].total;
      } catch { /* warps 表不存在 */ }

      const [totalHomes] = await pool.query(
        "SELECT COUNT(*) as total FROM users WHERE Homes IS NOT NULL AND Homes != ''"
      );

      const stats = {
        totalPlayers: totalPlayers[0].total,
        onlinePlayers: onlinePlayers[0].online,
        totalWarps,
        totalHomes: totalHomes[0].total
      };

      cache.set(cacheKey, stats, 60);
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
        'SELECT player_uuid as UUID, username as userName, LastLoginTime as lastOnline FROM users ORDER BY LastLoginTime DESC LIMIT ?',
        [limit]
      );

      cache.set(cacheKey, rows, 30);
      return rows;
    } catch (error) {
      throw new Error(`获取最近登录失败: ${error.message}`);
    }
  }

  // 获取新注册玩家（CMI 无 firstJoin 字段，使用首次登录时间近似）
  async getNewPlayers(days = 7, limit = 10) {
    const cacheKey = `new_players_${days}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const ago = daysAgoTimestamp(days);
      const [rows] = await pool.query(
        `SELECT player_uuid as UUID, username as userName, LastLoginTime as firstJoin
         FROM users WHERE LastLoginTime >= ${ago.sql}
         ORDER BY LastLoginTime DESC LIMIT ?`,
        [...ago.params, limit]
      );

      cache.set(cacheKey, rows, 300);
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
      const ago = daysAgoTimestamp(days);
      const dateExpr = dateFromMillis('LastLogoffTime');
      const [rows] = await pool.query(
        `SELECT
          ${dateExpr} as date,
          COUNT(*) as count
        FROM users
        WHERE LastLogoffTime >= ${ago.sql}
        GROUP BY ${dateExpr}
        ORDER BY date ASC`,
        ago.params
      );

      cache.set(cacheKey, rows, 300);
      return rows;
    } catch (error) {
      throw new Error(`获取活跃度统计失败: ${error.message}`);
    }
  }

  // 获取新玩家注册统计（按天，基于最后登录时间近似）
  async getNewPlayersStats(days = 30) {
    const cacheKey = `new_players_stats_${days}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const ago = daysAgoTimestamp(days);
      const dateExpr = dateFromMillis('LastLoginTime');
      const [rows] = await pool.query(
        `SELECT
          ${dateExpr} as date,
          COUNT(*) as count
        FROM users
        WHERE LastLoginTime >= ${ago.sql}
        GROUP BY ${dateExpr}
        ORDER BY date ASC`,
        ago.params
      );

      cache.set(cacheKey, rows, 300);
      return rows;
    } catch (error) {
      throw new Error(`获取新玩家统计失败: ${error.message}`);
    }
  }
}

module.exports = new ServerService();
