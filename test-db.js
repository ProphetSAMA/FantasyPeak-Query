require('dotenv').config();
const { pool, initDatabase, DB_TYPE } = require('./config/database');

async function main() {
  console.log(`🔍 测试数据库连接 (${DB_TYPE})...\n`);

  await initDatabase();

  const connected = await pool.testConnection();
  if (!connected) {
    console.error('❌ 无法连接到数据库，请检查配置');
    process.exit(1);
  }

  console.log('\n📊 检查数据库表...\n');

  try {
    // 检查表是否存在
    const [tables] = await pool.query('SHOW TABLES');
    console.log('数据库中的表:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // 检查 users 表结构
    console.log('\n📋 users 表结构:');
    const [columns] = await pool.query('DESCRIBE users');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });

    // 检查玩家数量
    const [playerCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 玩家总数: ${playerCount[0].count}`);

    // 检查在线玩家（最后登录 > 最后登出）
    const [onlineCount] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE LastLoginTime > LastLogoffTime'
    );
    console.log(`🟢 在线玩家: ${onlineCount[0].count}`);

    // 检查封禁
    const [banCount] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE BannedUntil IS NOT NULL AND BannedUntil > 0'
    );
    console.log(`🚫 封禁玩家: ${banCount[0].count}`);

    // 检查监禁
    const [jailCount] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE Jail IS NOT NULL AND Jail != ''"
    );
    console.log(`🔒 监禁玩家: ${jailCount[0].count}`);

    // 检查有家的玩家
    const [homeCount] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE Homes IS NOT NULL AND Homes != ''"
    );
    console.log(`🏠 有家的玩家: ${homeCount[0].count}`);

    // 样本数据
    console.log('\n📋 最近登录玩家样本:');
    const [recent] = await pool.query(
      'SELECT username, player_uuid, LastLoginTime, TotalPlayTime FROM users ORDER BY LastLoginTime DESC LIMIT 5'
    );
    recent.forEach(r => {
      const lastLogin = r.LastLoginTime ? new Date(r.LastLoginTime).toLocaleString('zh-CN') : '未知';
      const playHours = r.TotalPlayTime ? Math.round(r.TotalPlayTime / 3600000) : 0;
      console.log(`  ${r.username} (${r.player_uuid}) - 最后登录: ${lastLogin} - 游戏时长: ${playHours}h`);
    });

    console.log('\n✅ 数据库测试完成！');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await pool.close();
  }
}

main();
