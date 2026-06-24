const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');
const banService = require('../services/banService');
const { validationRules, handleValidationErrors } = require('../middleware/security');

// 玩家列表页
router.get('/', validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await playerService.getAllPlayers(page, limit);

    res.render('players', {
      title: '玩家列表',
      players: result.players,
      pagination: result.pagination,
      keyword: '',
      breadcrumbs: [
        { label: '首页', url: '/' },
        { label: '玩家列表' }
      ]
    });
  } catch (error) {
    console.error('获取玩家列表失败:', error);
    res.render('error', {
      title: '错误',
      message: '获取玩家列表失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

// 玩家搜索
router.get('/search', validationRules.searchPlayer, handleValidationErrors, async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const players = await playerService.searchPlayers(keyword);

    res.render('players', {
      title: `搜索结果: ${keyword}`,
      players,
      pagination: null,
      keyword,
      breadcrumbs: [
        { label: '首页', url: '/' },
        { label: '玩家列表', url: '/player' },
        { label: `搜索: ${keyword}` }
      ]
    });
  } catch (error) {
    console.error('搜索玩家失败:', error);
    res.render('error', {
      title: '错误',
      message: '搜索玩家失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

// 玩家详情页
router.get('/:uuid', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const [player, bans, mutes] = await Promise.all([
      playerService.getPlayerByUUID(uuid),
      banService.getBansByUUID(uuid),
      banService.getMutesByUUID(uuid)
    ]);

    if (!player) {
      return res.status(404).render('error', {
        title: '404 - 玩家未找到',
        message: '未找到该玩家',
        error: {},
        breadcrumbs: [{ label: '首页', url: '/' }, { label: '玩家列表', url: '/player' }, { label: '未找到' }]
      });
    }

    res.render('player', {
      title: player.userName,
      player,
      bans,
      mutes,
      breadcrumbs: [
        { label: '首页', url: '/' },
        { label: '玩家列表', url: '/player' },
        { label: player.userName }
      ]
    });
  } catch (error) {
    console.error('获取玩家详情失败:', error);
    res.render('error', {
      title: '错误',
      message: '获取玩家详情失败',
      error: process.env.NODE_ENV === 'development' ? error : {},
      breadcrumbs: [{ label: '首页', url: '/' }, { label: '错误' }]
    });
  }
});

module.exports = router;
