const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');
const banService = require('../services/banService');
const serverService = require('../services/serverService');
const { validationRules, handleValidationErrors } = require('../middleware/security');

// API: 获取服务器统计
router.get('/stats', async (req, res) => {
  try {
    const stats = await serverService.getServerStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('API获取服务器统计失败:', error);
    res.status(500).json({ success: false, error: '获取服务器统计失败' });
  }
});

// API: 获取在线玩家
router.get('/players/online', async (req, res) => {
  try {
    const players = await playerService.getOnlinePlayers();
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('API获取在线玩家失败:', error);
    res.status(500).json({ success: false, error: '获取在线玩家失败' });
  }
});

// API: 获取玩家列表
router.get('/players', validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await playerService.getAllPlayers(page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('API获取玩家列表失败:', error);
    res.status(500).json({ success: false, error: '获取玩家列表失败' });
  }
});

// API: 搜索玩家
router.get('/players/search', validationRules.searchPlayer, handleValidationErrors, async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const players = await playerService.searchPlayers(keyword);
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('API搜索玩家失败:', error);
    res.status(500).json({ success: false, error: '搜索玩家失败' });
  }
});

// API: 获取玩家详情
router.get('/players/:uuid', validationRules.uuid, handleValidationErrors, async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const player = await playerService.getPlayerByUUID(uuid);

    if (!player) {
      return res.status(404).json({ success: false, error: '未找到该玩家' });
    }

    res.json({ success: true, data: player });
  } catch (error) {
    console.error('API获取玩家详情失败:', error);
    res.status(500).json({ success: false, error: '获取玩家详情失败' });
  }
});

// API: 获取封禁列表
router.get('/bans', validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await banService.getAllBans(page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('API获取封禁列表失败:', error);
    res.status(500).json({ success: false, error: '获取封禁列表失败' });
  }
});

// API: 搜索封禁记录
router.get('/bans/search', validationRules.searchPlayer, handleValidationErrors, async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const bans = await banService.searchBans(keyword);
    res.json({ success: true, data: bans });
  } catch (error) {
    console.error('API搜索封禁记录失败:', error);
    res.status(500).json({ success: false, error: '搜索封禁记录失败' });
  }
});

// API: 获取封禁统计
router.get('/bans/stats', async (req, res) => {
  try {
    const stats = await banService.getBanStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('API获取封禁统计失败:', error);
    res.status(500).json({ success: false, error: '获取封禁统计失败' });
  }
});

// API: 获取传送点列表
router.get('/warps', async (req, res) => {
  try {
    const warps = await serverService.getWarps();
    res.json({ success: true, data: warps });
  } catch (error) {
    console.error('API获取传送点失败:', error);
    res.status(500).json({ success: false, error: '获取传送点失败' });
  }
});

// API: 获取最近登录
router.get('/recent-logins', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const logins = await serverService.getRecentLogins(limit);
    res.json({ success: true, data: logins });
  } catch (error) {
    console.error('API获取最近登录失败:', error);
    res.status(500).json({ success: false, error: '获取最近登录失败' });
  }
});

// API: 获取新玩家
router.get('/new-players', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 10;
    const players = await serverService.getNewPlayers(days, limit);
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('API获取新玩家失败:', error);
    res.status(500).json({ success: false, error: '获取新玩家失败' });
  }
});

// API: 获取活跃度统计
router.get('/activity', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = await serverService.getActivityStats(days);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('API获取活跃度统计失败:', error);
    res.status(500).json({ success: false, error: '获取活跃度统计失败' });
  }
});

// API: 获取游戏时长排行
router.get('/playtime-top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const players = await playerService.getPlaytimeTop(limit);
    res.json({ success: true, data: players });
  } catch (error) {
    console.error('API获取游戏时长排行失败:', error);
    res.status(500).json({ success: false, error: '获取游戏时长排行失败' });
  }
});

module.exports = router;
