const { pool } = require('../config/database');
const cache = require('./cacheService');

class PlayerService {
  // 获取所有玩家列表
  async getAllPlayers(page = 1, limit = 20) {
    const cacheKey = `players_all_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_users ORDER BY lastOnline DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM cmi_users');
      const total = countResult[0].total;

      const result = {
        players: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      cache.set(cacheKey, result, 60); // 缓存60秒
      return result;
    } catch (error) {
      throw new Error(`获取玩家列表失败: ${error.message}`);
    }
  }

  // 根据UUID获取玩家信息
  async getPlayerByUUID(uuid) {
    const cacheKey = `player_${uuid}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_users WHERE UUID = ?',
        [uuid]
      );

      if (rows.length === 0) {
        return null;
      }

      const player = rows[0];

      // 获取玩家的家位置
      const [homes] = await pool.query(
        'SELECT * FROM cmi_homes WHERE UUID = ?',
        [uuid]
      );

      player.homes = homes;

      cache.set(cacheKey, player, 120); // 缓存120秒
      return player;
    } catch (error) {
      throw new Error(`获取玩家信息失败: ${error.message}`);
    }
  }

  // 根据用户名搜索玩家
  async searchPlayers(keyword) {
    const cacheKey = `search_${keyword}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_users WHERE userName LIKE ? ORDER BY lastOnline DESC LIMIT 50',
        [`%${keyword}%`]
      );

      cache.set(cacheKey, rows, 30); // 缓存30秒
      return rows;
    } catch (error) {
      throw new Error(`搜索玩家失败: ${error.message}`);
    }
  }

  // 获取在线玩家
  async getOnlinePlayers() {
    const cacheKey = 'players_online';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_users WHERE online = 1 ORDER BY lastOnline DESC'
      );

      cache.set(cacheKey, rows, 10); // 缓存10秒
      return rows;
    } catch (error) {
      throw new Error(`获取在线玩家失败: ${error.message}`);
    }
  }

  // 获取玩家统计信息
  async getPlayerStats() {
    const cacheKey = 'player_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [totalPlayers] = await pool.query('SELECT COUNT(*) as total FROM cmi_users');
      const [onlinePlayers] = await pool.query('SELECT COUNT(*) as online FROM cmi_users WHERE online = 1');
      const [newPlayers] = await pool.query(
        'SELECT COUNT(*) as new FROM cmi_users WHERE firstJoin >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );

      const stats = {
        total: totalPlayers[0].total,
        online: onlinePlayers[0].online,
        newThisWeek: newPlayers[0].new
      };

      cache.set(cacheKey, stats, 60); // 缓存60秒
      return stats;
    } catch (error) {
      throw new Error(`获取玩家统计失败: ${error.message}`);
    }
  }

  // 获取玩家游戏时长排行
  async getPlaytimeTop(limit = 10) {
    const cacheKey = `playtime_top_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT userName, playTime, lastOnline FROM cmi_users ORDER BY playTime DESC LIMIT ?',
        [limit]
      );

      cache.set(cacheKey, rows, 300); // 缓存5分钟
      return rows;
    } catch (error) {
      throw new Error(`获取游戏时长排行失败: ${error.message}`);
    }
  }
}

module.exports = new PlayerService();
