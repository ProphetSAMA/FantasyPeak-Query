const { pool } = require('../config/database');
const { unixTimestamp } = require('../config/db-utils');
const cache = require('./cacheService');

class BanService {
  // 获取所有封禁记录（从 users 表中读取 BannedUntil > 0 的玩家）
  async getAllBans(page = 1, limit = 20) {
    const cacheKey = `bans_all_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;

    try {
      // CMI 中封禁数据存在 users 表的字段里
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM users WHERE BannedUntil IS NOT NULL AND BannedUntil > 0'
      );
      const total = countResult[0].total;

      const [rows] = await pool.query(
        `SELECT player_uuid as UUID, username as userName, BannedAt as banTime,
                BannedUntil, BannedBy as bannedBy, BanReason as reason
         FROM users
         WHERE BannedUntil IS NOT NULL AND BannedUntil > 0
         ORDER BY BannedAt DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      // 补充 duration 字段（CMI 中用 BannedUntil 直接表示到期时间）
      const bans = rows.map(r => ({
        UUID: r.UUID,
        userName: r.userName,
        banTime: r.banTime,
        duration: r.BannedUntil === -1 ? -1 : (r.BannedUntil - r.banTime),
        reason: r.reason || '',
        bannedBy: r.bannedBy || ''
      }));

      const result = {
        bans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      cache.set(cacheKey, result, 60);
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
        `SELECT BannedAt as banTime, BannedUntil, BannedBy as bannedBy, BanReason as reason
         FROM users WHERE player_uuid = ? AND BannedUntil IS NOT NULL AND BannedUntil > 0`,
        [uuid]
      );

      const bans = rows.map(r => ({
        banTime: r.banTime,
        duration: r.BannedUntil === -1 ? -1 : (r.BannedUntil - r.banTime),
        reason: r.reason || '',
        bannedBy: r.bannedBy || ''
      }));

      cache.set(cacheKey, bans, 120);
      return bans;
    } catch (error) {
      throw new Error(`获取玩家封禁记录失败: ${error.message}`);
    }
  }

  // 获取禁言记录（CMI 中 Muted 字段存储在 users 表）
  async getAllMutes(page = 1, limit = 20) {
    const cacheKey = `mutes_all_${page}_${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;

    try {
      const [countResult] = await pool.query(
        "SELECT COUNT(*) as total FROM users WHERE Muted IS NOT NULL AND Muted != '' AND Muted != 'false'"
      );
      const total = countResult[0].total;

      const [rows] = await pool.query(
        `SELECT player_uuid as UUID, username as userName, Muted
         FROM users
         WHERE Muted IS NOT NULL AND Muted != '' AND Muted != 'false'
         ORDER BY LastLogoffTime DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const mutes = rows.map(r => this._parseMute(r));

      const result = {
        mutes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      cache.set(cacheKey, result, 60);
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
        "SELECT Muted FROM users WHERE player_uuid = ? AND Muted IS NOT NULL AND Muted != '' AND Muted != 'false'",
        [uuid]
      );

      const mutes = rows.map(r => this._parseMute(r));
      cache.set(cacheKey, mutes, 120);
      return mutes;
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
      const now = Date.now();

      const [totalBans] = await pool.query(
        'SELECT COUNT(*) as total FROM users WHERE BannedUntil IS NOT NULL AND BannedUntil > 0'
      );
      const [activeBans] = await pool.query(
        `SELECT COUNT(*) as active FROM users WHERE (BannedUntil > ? OR BannedUntil = -1) AND BannedUntil IS NOT NULL AND BannedUntil > 0`,
        [now]
      );
      const [totalMutes] = await pool.query(
        "SELECT COUNT(*) as total FROM users WHERE Muted IS NOT NULL AND Muted != '' AND Muted != 'false'"
      );
      const [jailed] = await pool.query(
        "SELECT COUNT(*) as active FROM users WHERE Jail IS NOT NULL AND Jail != ''"
      );

      const stats = {
        totalBans: totalBans[0].total,
        activeBans: activeBans[0].active,
        totalMutes: totalMutes[0].total,
        activeMutes: jailed[0].active  // 复用字段，表示监禁数
      };

      cache.set(cacheKey, stats, 60);
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
        `SELECT player_uuid as UUID, username as userName, BannedAt as banTime,
                BannedUntil, BannedBy as bannedBy, BanReason as reason
         FROM users
         WHERE (BannedUntil IS NOT NULL AND BannedUntil > 0)
           AND (username LIKE ? OR BannedBy LIKE ? OR BanReason LIKE ?)
         ORDER BY BannedAt DESC LIMIT 50`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );

      const bans = rows.map(r => ({
        UUID: r.UUID,
        userName: r.userName,
        banTime: r.banTime,
        duration: r.BannedUntil === -1 ? -1 : (r.BannedUntil - r.banTime),
        reason: r.reason || '',
        bannedBy: r.bannedBy || ''
      }));

      cache.set(cacheKey, bans, 30);
      return bans;
    } catch (error) {
      throw new Error(`搜索封禁记录失败: ${error.message}`);
    }
  }

  /**
   * 解析 Muted 字段（可能是 JSON、时间戳或简单标记）
   */
  _parseMute(row) {
    let muteTime = null;
    let duration = null;
    let reason = '';
    let mutedBy = '';

    try {
      // 尝试解析 JSON 格式
      const data = typeof row.Muted === 'string' ? JSON.parse(row.Muted) : row.Muted;
      if (typeof data === 'object' && data !== null) {
        muteTime = data.time || data.muteTime || null;
        duration = data.duration || null;
        reason = data.reason || '';
        mutedBy = data.by || data.mutedBy || '';
      }
    } catch {
      // 非 JSON，作为时间戳或简单标记
      muteTime = parseInt(row.Muted) || null;
    }

    return {
      UUID: row.UUID,
      userName: row.userName || row.UUID,
      muteTime,
      duration,
      reason,
      mutedBy
    };
  }
}

module.exports = new BanService();
