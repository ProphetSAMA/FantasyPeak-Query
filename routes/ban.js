const express = require('express');
const router = express.Router();
const banService = require('../services/banService');
const { validationRules, handleValidationErrors } = require('../middleware/security');

// 封禁列表页
router.get('/', validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [bansResult, stats] = await Promise.all([
      banService.getAllBans(page, limit),
      banService.getBanStats()
    ]);

    res.render('bans', {
      title: '封禁记录',
      bans: bansResult.bans,
      pagination: bansResult.pagination,
      stats,
      keyword: ''
    });
  } catch (error) {
    console.error('获取封禁列表失败:', error);
    res.render('error', {
      title: '错误',
      message: '获取封禁列表失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// 禁言列表页
router.get('/mutes', validationRules.pagination, handleValidationErrors, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await banService.getAllMutes(page, limit);

    res.render('mutes', {
      title: '禁言记录',
      mutes: result.mutes,
      pagination: result.pagination,
      keyword: ''
    });
  } catch (error) {
    console.error('获取禁言列表失败:', error);
    res.render('error', {
      title: '错误',
      message: '获取禁言列表失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// 搜索封禁记录
router.get('/search', validationRules.searchPlayer, handleValidationErrors, async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const bans = await banService.searchBans(keyword);

    res.render('bans', {
      title: `封禁搜索结果: ${keyword}`,
      bans,
      pagination: null,
      stats: null,
      keyword
    });
  } catch (error) {
    console.error('搜索封禁记录失败:', error);
    res.render('error', {
      title: '错误',
      message: '搜索封禁记录失败',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
