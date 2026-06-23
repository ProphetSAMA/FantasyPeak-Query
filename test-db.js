require('dotenv').config();
const { testConnection, pool } = require('./config/database');

async function main() {
  console.log('🔍 测试数据库连接...\n');

  // 测试连接
  const connected = await testConnection();
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

    // 检查cmi_users表结构
    console.log('\n📋 cmi_users 表结构:');
    const [columns] = await pool.query('DESCRIBE cmi_users');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(可空)' : '(非空)'}`);
    });

    // 检查玩家数量
    const [playerCount] = await pool.query('SELECT COUNT(*) as count FROM cmi_users');
    console.log(`\n👥 玩家总数: ${playerCount[0].count}`);

    // 检查在线玩家
    const [onlineCount] = await pool.query('SELECT COUNT(*) as count FROM cmi_users WHERE online = 1');
    console.log(`🟢 在线玩家: ${onlineCount[0].count}`);

    // 检查封禁表
    try {
      const [banCount] = await pool.query('SELECT COUNT(*) as count FROM cmi_bans');
      console.log(`🚫 封禁记录: ${banCount[0].count}`);
    } catch (e) {
      console.log('⚠️  cmi_bans 表不存在或无法访问');
    }

    // 检查禁言表
    try {
      const [muteCount] = await pool.query('SELECT COUNT(*) as count FROM cmi_mute');
      console.log(`🔇 禁言记录: ${muteCount[0].count}`);
    } catch (e) {
      console.log('⚠️  cmi_mute 表不存在或无法访问');
    }

    console.log('\n✅ 数据库测试完成！');

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await pool.end();
  }
}

main();
