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
      newPlayers,
      breadcrumbs: []
    });
  } catch (error) {
    console.error('首页加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载首页数据失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

// 传送点页面
router.get('/warps', async (req, res) => {
  try {
    const warps = await serverService.getWarps();

    res.render('warps', {
      title: '传送点',
      warps,
      breadcrumbs: [
        { label: '首页', url: '/' },
        { label: '传送点' }
      ]
    });
  } catch (error) {
    console.error('传送点页面加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载传送点数据失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

// 游戏时长排行榜
router.get('/playtime', async (req, res) => {
  try {
    const players = await playerService.getPlaytimeTop(50);

    res.render('playtime', {
      title: '游戏时长排行榜',
      players,
      breadcrumbs: [
        { label: '首页', url: '/' },
        { label: '游戏时长排行榜' }
      ]
    });
  } catch (error) {
    console.error('游戏时长排行榜加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载游戏时长数据失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

// 活跃度统计页面
router.get('/activity', async (req, res) => {
  try {
    const activityData = await serverService.getActivityStats(30);
    const newPlayersData = await serverService.getNewPlayersStats(30);

    res.render('activity', {
      title: '活跃度统计',
      activityData: JSON.stringify(activityData),
      newPlayersData: JSON.stringify(newPlayersData),
      breadcrumbs: [
        { label: '首页', url: '/' },
        { label: '活跃度统计' }
      ]
    });
  } catch (error) {
    console.error('活跃度统计加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载活跃度数据失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

module.exports = router;
