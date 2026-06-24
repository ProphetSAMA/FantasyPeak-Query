/**
 * SQLite 数据库表结构
 * 直接读取 CMI 原始数据库，无需建表
 * 表结构由 CMI 插件自行管理
 */

// CMI 数据库中的真实表名和字段映射
const CMI_TABLES = {
  users: 'users',
  playtime: 'playtime',
  playtimereward: 'playtimereward',
  inventories: 'inventories'
};

// 字段映射（程序字段 -> CMI 字段）
const FIELDS = {
  uuid: 'player_uuid',
  username: 'username',
  nickname: 'nickname',
  displayName: 'DisplayName',
  lastLogin: 'LastLoginTime',
  lastLogoff: 'LastLogoffTime',
  totalPlayTime: 'TotalPlayTime',
  homes: 'Homes',
  ips: 'Ips',
  bannedUntil: 'BannedUntil',
  bannedAt: 'BannedAt',
  bannedBy: 'BannedBy',
  banReason: 'BanReason',
  muted: 'Muted',
  jail: 'Jail',
  jailedUntil: 'JailedUntil',
  jailReason: 'JailReason',
  rank: 'Rank',
  balance: 'Balance',
  notes: 'Notes'
};

/**
 * 初始化数据库（CMI 数据库已由插件创建，无需建表）
 * @param {import('sql.js').Database} db
 */
function initSchema(db) {
  // 验证 users 表存在
  const result = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  );
  if (result.length === 0 || result[0].values.length === 0) {
    console.warn('⚠️  未找到 CMI users 表，请确认数据库路径正确');
  }
}

/**
 * 解析 Homes 字段
 * 格式: "name%%world:x:y:z:yaw:pitch" 或多个家用 ";;" 分隔
 * @param {string} homesStr
 * @returns {Array<{name, world, x, y, z, yaw, pitch}>}
 */
function parseHomes(homesStr) {
  if (!homesStr) return [];
  return homesStr.split(';;').filter(Boolean).map(entry => {
    const parts = entry.split('%%');
    const name = parts[0] || 'Home';
    const coords = (parts[1] || '').split(':');
    return {
      name,
      world: coords[0] || '',
      x: parseFloat(coords[1]) || 0,
      y: parseFloat(coords[2]) || 0,
      z: parseFloat(coords[3]) || 0,
      yaw: parseFloat(coords[4]) || 0,
      pitch: parseFloat(coords[5]) || 0
    };
  });
}

/**
 * 解析 Ips 字段
 * 格式: "ip%%count;ip%%count;..." (第一个是最新的)
 * @param {string} ipsStr
 * @returns {{latest: string, all: Array<{ip, count}>}}
 */
function parseIps(ipsStr) {
  if (!ipsStr) return { latest: '', all: [] };
  const entries = ipsStr.split(';').filter(Boolean).map(entry => {
    const parts = entry.split('%%');
    return { ip: parts[0], count: parseInt(parts[1]) || 0 };
  });
  return {
    latest: entries.length > 0 ? entries[0].ip : '',
    all: entries
  };
}

module.exports = {
  initSchema,
  CMI_TABLES,
  FIELDS,
  parseHomes,
  parseIps
};
