const { pool } = require('../config/database');
const { daysAgoTimestamp } = require('../config/db-utils');
const { parseHomes, parseIps } = require('../config/sqlite-schema');
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
        'SELECT * FROM users ORDER BY LastLogoffTime DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
      const total = countResult[0].total;

      const players = rows.map(r => this._normalizePlayer(r));

      const result = {
        players,
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
        'SELECT * FROM users WHERE player_uuid = ?',
        [uuid]
      );

      if (rows.length === 0) return null;

      const player = this._normalizePlayer(rows[0], true);
      cache.set(cacheKey, player, 120);
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
        "SELECT * FROM users WHERE username LIKE ? OR nickname LIKE ? OR DisplayName LIKE ? ORDER BY LastLogoffTime DESC LIMIT 50",
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );

      const players = rows.map(r => this._normalizePlayer(r));
      cache.set(cacheKey, players, 30);
      return players;
    } catch (error) {
      throw new Error(`搜索玩家失败: ${error.message}`);
    }
  }

  // 获取在线玩家（基于最后登录/登出时间判断）
  async getOnlinePlayers() {
    const cacheKey = 'players_online';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // 最后登录时间 > 最后登出时间，视为在线
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE LastLoginTime > LastLogoffTime ORDER BY LastLoginTime DESC'
      );

      const players = rows.map(r => this._normalizePlayer(r));
      cache.set(cacheKey, players, 10);
      return players;
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
      const [totalPlayers] = await pool.query('SELECT COUNT(*) as total FROM users');
      const [onlinePlayers] = await pool.query(
        'SELECT COUNT(*) as online FROM users WHERE LastLoginTime > LastLogoffTime'
      );
      const ago = daysAgoTimestamp(7);
      const [newPlayers] = await pool.query(
        `SELECT COUNT(*) as new FROM users WHERE LastLoginTime >= ${ago.sql}`,
        ago.params
      );

      const stats = {
        total: totalPlayers[0].total,
        online: onlinePlayers[0].online,
        newThisWeek: newPlayers[0].new
      };

      cache.set(cacheKey, stats, 60);
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
        'SELECT player_uuid, username, TotalPlayTime, LastLoginTime, LastLogoffTime FROM users ORDER BY TotalPlayTime DESC LIMIT ?',
        [limit]
      );

      const result = rows.map(r => ({
        UUID: r.player_uuid,
        userName: r.username,
        playTime: r.TotalPlayTime,
        lastOnline: r.LastLogoffTime,
        online: (r.LastLoginTime || 0) > (r.LastLogoffTime || 0)
      }));

      cache.set(cacheKey, result, 300);
      return result;
    } catch (error) {
      throw new Error(`获取游戏时长排行失败: ${error.message}`);
    }
  }

  /**
   * 标准化玩家数据（CMI 字段 -> 程序通用格式）
   */
  _normalizePlayer(row, detail = false) {
    const player = {
      UUID: row.player_uuid,
      userName: row.username,
      nickname: row.nickname,
      displayName: row.DisplayName,
      lastOnline: row.LastLogoffTime || row.LastLoginTime,
      lastLogin: row.LastLoginTime,
      playTime: row.TotalPlayTime,
      online: (row.LastLoginTime || 0) > (row.LastLogoffTime || 0),
      rank: row.Rank,
      balance: row.Balance
    };

    if (detail) {
      const ipInfo = parseIps(row.Ips);
      player.ip = ipInfo.latest;
      player.ipHistory = ipInfo.all;
      player.homes = parseHomes(row.Homes);
      player.notes = row.Notes;
      player.BannedUntil = row.BannedUntil;
      player.BannedAt = row.BannedAt;
      player.BannedBy = row.BannedBy;
      player.BanReason = row.BanReason;
      player.Muted = row.Muted;
      player.Jail = row.Jail;
      player.JailedUntil = row.JailedUntil;
      player.JailReason = row.JailReason;
    }

    return player;
  }
}

module.exports = new PlayerService();
