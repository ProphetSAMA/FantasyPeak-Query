/**
 * 数据库统一适配器
 * 支持 MySQL 和 SQLite（via sql.js），提供一致的异步 query() 接口
 */
const DB_TYPE = process.env.DB_TYPE || 'mysql';

class DatabaseAdapter {
  constructor(type) {
    this.type = type;
    this.db = null;    // sql.js Database 实例
    this.pool = null;  // mysql2 连接池
  }

  async init() {
    if (this.type === 'sqlite') {
      await this._initSQLite();
    } else {
      this._initMySQL();
    }
  }

  // MySQL 初始化
  _initMySQL() {
    const mysql = require('mysql2/promise');
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'cmi_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cmi_database',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }

  // SQLite 初始化（sql.js，只读模式打开 CMI 数据库）
  async _initSQLite() {
    const initSqlJs = require('sql.js');
    const fs = require('fs');
    const path = require('path');

    const SQL = await initSqlJs();

    // CMI 数据库路径：优先使用 SQLITE_PATH，否则使用默认 CMI 路径
    const defaultCmiPath = path.join('D:', '1.19-10.8', '1.19', 'plugins', 'CMI', 'cmi.sqlite.db');
    const dbPath = process.env.SQLITE_PATH || defaultCmiPath;

    if (!fs.existsSync(dbPath)) {
      throw new Error(`SQLite 数据库文件不存在: ${dbPath}\n请在 .env 中设置 SQLITE_PATH 指向 CMI 的 cmi.sqlite.db 文件`);
    }

    const dbBuffer = fs.readFileSync(dbPath);
    this.db = new SQL.Database(dbBuffer);
    this._dbPath = dbPath;
    this._readOnly = process.env.SQLITE_READONLY !== 'false'; // 默认只读

    // 验证表存在
    const { initSchema } = require('./sqlite-schema');
    initSchema(this.db);

    console.log(`📁 SQLite 数据库: ${dbPath}`);
  }

  /**
   * 统一查询接口，返回 [rows, fields] 格式（与 mysql2 一致）
   * @param {string} sql
   * @param {Array} params
   * @returns {Promise<[Array, Array]>}
   */
  async query(sql, params = []) {
    if (this.type === 'sqlite') {
      return this._querySQLite(sql, params);
    }
    return this.pool.query(sql, params);
  }

  _querySQLite(sql, params) {
    const trimmed = sql.trim().toUpperCase();

    // SHOW TABLES → 查询 sqlite_master
    if (trimmed === 'SHOW TABLES') {
      const stmt = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );
      const rows = [];
      while (stmt.step()) {
        const obj = stmt.getAsObject();
        rows.push(obj);
      }
      stmt.free();
      return [rows, []];
    }

    // DESCRIBE table → PRAGMA table_info
    if (trimmed.startsWith('DESCRIBE ')) {
      const tableName = sql.trim().slice(9).trim();
      const stmt = this.db.prepare(`PRAGMA table_info(${tableName})`);
      const rows = [];
      while (stmt.step()) {
        const c = stmt.getAsObject();
        rows.push({
          Field: c.name,
          Type: c.type,
          Null: c.notnull ? 'NO' : 'YES',
          Key: c.pk ? 'PRI' : '',
          Default: c.dflt_value
        });
      }
      stmt.free();
      return [rows, []];
    }

    // SELECT 及其他查询
    const stmt = this.db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return [rows, []];
  }

  async testConnection() {
    try {
      if (this.type === 'sqlite') {
        this.db.exec('SELECT 1');
      } else {
        const conn = await this.pool.getConnection();
        conn.release();
      }
      console.log(`✅ 数据库连接成功 (${this.type})`);
      return true;
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
  }

  async close() {
    if (this.type === 'sqlite' && this.db) {
      this.db.close();
    } else if (this.pool) {
      await this.pool.end();
    }
  }
}

const adapter = new DatabaseAdapter(DB_TYPE);

module.exports = {
  pool: adapter,
  adapter,
  DB_TYPE,
  initDatabase: () => adapter.init(),
  testConnection: () => adapter.testConnection()
};
