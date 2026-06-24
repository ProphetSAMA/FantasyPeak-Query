/**
 * 数据库兼容工具
 * 提供 MySQL / SQLite 通用的 SQL 表达式
 */
const { DB_TYPE } = require('./database');
const isSQLite = DB_TYPE === 'sqlite';

module.exports = {
  DB_TYPE,
  isSQLite,

  /**
   * N天前的时间戳（毫秒），用于 WHERE firstJoin >= ? 或 firstJoin >= DATE_SUB(...)
   * MySQL: UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ? DAY)) * 1000
   * SQLite: (strftime('%s', 'now', '-' || ? || ' days') * 1000)
   * 返回 sql 片段和参数值
   */
  daysAgoTimestamp(days) {
    if (isSQLite) {
      return {
        sql: `(strftime('%s', 'now', '-' || ? || ' days') * 1000)`,
        params: [days]
      };
    }
    return {
      sql: `UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL ? DAY)) * 1000`,
      params: [days]
    };
  },

  /**
   * N天前的日期字符串，用于 firstJoin >= DATE_SUB(NOW(), INTERVAL ? DAY)
   * MySQL: DATE_SUB(NOW(), INTERVAL ? DAY)
   * SQLite: datetime('now', '-' || ? || ' days')
   */
  daysAgoDatetime(days) {
    if (isSQLite) {
      return {
        sql: `datetime('now', '-' || ? || ' days')`,
        params: [days]
      };
    }
    return {
      sql: `DATE_SUB(NOW(), INTERVAL ? DAY)`,
      params: [days]
    };
  },

  /**
   * 当前 Unix 时间戳（秒）
   * MySQL: UNIX_TIMESTAMP()
   * SQLite: strftime('%s', 'now')
   */
  unixTimestamp() {
    return isSQLite ? `strftime('%s', 'now')` : `UNIX_TIMESTAMP()`;
  },

  /**
   * 将毫秒时间戳转为日期字符串
   * MySQL: DATE(FROM_UNIXTIME(col / 1000))
   * SQLite: date(col / 1000, 'unixepoch')
   */
  dateFromMillis(col) {
    if (isSQLite) {
      return `date(${col} / 1000, 'unixepoch')`;
    }
    return `DATE(FROM_UNIXTIME(${col} / 1000))`;
  }
};
