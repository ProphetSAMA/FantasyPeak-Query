const express = require('express');
const router = express.Router();
const { requireAuth, authenticate } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/security');
const playerService = require('../services/playerService');
const banService = require('../services/banService');
const serverService = require('../services/serverService');
const cache = require('../services/cacheService');

// 登录页面
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: '管理员登录', error: null });
});

// 登录处理
router.post('/login', validationRules.login, handleValidationErrors, (req, res) => {
  const { username, password } = req.body;
  const user = authenticate(username, password);

  if (!user) {
    return res.render('admin/login', {
      title: '管理员登录',
      error: '用户名或密码错误'
    });
  }

  req.session.user = user;
  res.redirect('/admin');
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// 管理后台首页
router.get('/', requireAuth, async (req, res) => {
  try {
    const [playerStats, banStats, serverStats, cacheStats] = await Promise.all([
      playerService.getPlayerStats(),
      banService.getBanStats(),
      serverService.getServerStats(),
      Promise.resolve(cache.getStats())
    ]);

    res.render('admin/dashboard', {
      title: '管理后台',
      playerStats,
      banStats,
      serverStats,
      cacheStats
    });
  } catch (error) {
    console.error('管理后台加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载管理后台失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// 玩家管理
router.get('/players', requireAuth, validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await playerService.getAllPlayers(page, limit);

    res.render('admin/players', {
      title: '玩家管理',
      players: result.players,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('玩家管理页面加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载玩家管理页面失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// 封禁管理
router.get('/bans', requireAuth, validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await banService.getAllBans(page, limit);

    res.render('admin/bans', {
      title: '封禁管理',
      bans: result.bans,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('封禁管理页面加载失败:', error);
    res.render('error', {
      title: '错误',
      message: '加载封禁管理页面失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// 清除缓存
router.post('/cache/clear', requireAuth, (req, res) => {
  try {
    cache.flush();
    res.json({ success: true, message: '缓存已清除' });
  } catch (error) {
    console.error('清除缓存失败:', error);
    res.status(500).json({ success: false, message: '清除缓存失败' });
  }
});

module.exports = router;
