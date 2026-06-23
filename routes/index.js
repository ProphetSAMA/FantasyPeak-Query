const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');
const serverService = require('../services/serverService');
const banService = require('../services/banService');

// 首页
router.get('/', async (req, res) => {
  try {
    const [stats, onlinePlayers, recentLogins, newPlayers] = await Promise.all([
      serverService.getServerStats(),
      playerService.getOnlinePlayers(),
      serverService.getRecentLogins(5),
      serverService.getNewPlayers(7, 5)
    ]);

    res.render('index', {
      title: 'Minecraft 服务器数据查询',
      stats,
      onlinePlayers,
      recentLogins,
      newPlayers
    });
  } catch (error) {
    console.error('首页加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载首页数据失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
