const { pool } = require('../config/database');
const cache = require('./cacheService');

class BanService {
  // 获取所有封禁记录
  async getAllBans(page = 1, limit = 20) {
    const cacheKey = `bans_all_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_bans ORDER BY banTime DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM cmi_bans');
      const total = countResult[0].total;

      const result = {
        bans: rows,
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
      throw new Error(`获取封禁列表失败: ${error.message}`);
    }
  }

  // 根据UUID获取玩家的封禁记录
  async getBansByUUID(uuid) {
    const cacheKey = `bans_${uuid}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_bans WHERE UUID = ? ORDER BY banTime DESC',
        [uuid]
      );

      cache.set(cacheKey, rows, 120); // 缓存120秒
      return rows;
    } catch (error) {
      throw new Error(`获取玩家封禁记录失败: ${error.message}`);
    }
  }

  // 获取禁言记录
  async getAllMutes(page = 1, limit = 20) {
    const cacheKey = `mutes_all_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_mute ORDER BY muteTime DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM cmi_mute');
      const total = countResult[0].total;

      const result = {
        mutes: rows,
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
      throw new Error(`获取禁言列表失败: ${error.message}`);
    }
  }

  // 根据UUID获取玩家的禁言记录
  async getMutesByUUID(uuid) {
    const cacheKey = `mutes_${uuid}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM cmi_mute WHERE UUID = ? ORDER BY muteTime DESC',
        [uuid]
      );

      cache.set(cacheKey, rows, 120); // 缓存120秒
      return rows;
    } catch (error) {
      throw new Error(`获取玩家禁言记录失败: ${error.message}`);
    }
  }

  // 获取封禁统计信息
  async getBanStats() {
    const cacheKey = 'ban_stats';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [totalBans] = await pool.query('SELECT COUNT(*) as total FROM cmi_bans');
      const [activeBans] = await pool.query(
        'SELECT COUNT(*) as active FROM cmi_bans WHERE banTime + duration > UNIX_TIMESTAMP() * 1000 OR duration = -1'
      );
      const [totalMutes] = await pool.query('SELECT COUNT(*) as total FROM cmi_mute');
      const [activeMutes] = await pool.query(
        'SELECT COUNT(*) as active FROM cmi_mute WHERE muteTime + duration > UNIX_TIMESTAMP() * 1000 OR duration = -1'
      );

      const stats = {
        totalBans: totalBans[0].total,
        activeBans: activeBans[0].active,
        totalMutes: totalMutes[0].total,
        activeMutes: activeMutes[0].active
      };

      cache.set(cacheKey, stats, 60); // 缓存60秒
      return stats;
    } catch (error) {
      throw new Error(`获取封禁统计失败: ${error.message}`);
    }
  }

  // 搜索封禁记录
  async searchBans(keyword) {
    const cacheKey = `search_bans_${keyword}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const [rows] = await pool.query(
        `SELECT * FROM cmi_bans
         WHERE UUID IN (SELECT UUID FROM cmi_users WHERE userName LIKE ?)
         OR bannedBy LIKE ?
         OR reason LIKE ?
         ORDER BY banTime DESC LIMIT 50`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );

      cache.set(cacheKey, rows, 30); // 缓存30秒
      return rows;
    } catch (error) {
      throw new Error(`搜索封禁记录失败: ${error.message}`);
    }
  }
}

module.exports = new BanService();
