const { body, query, validationResult } = require('express-validator');

// 验证规则
const validationRules = {
  // 玩家搜索验证
  searchPlayer: [
    query('keyword')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('搜索关键词长度必须在1-50之间')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('搜索关键词只能包含字母、数字和下划线')
  ],

  // UUID验证
  uuid: [
    query('uuid')
      .trim()
      .matches(/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i)
      .withMessage('无效的UUID格式')
  ],

  // 分页验证
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是大于0的整数'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须在1-100之间')
  ],

  // 登录验证
  login: [
    body('username')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('用户名长度必须在1-50之间'),
    body('password')
      .isLength({ min: 1, max: 100 })
      .withMessage('密码长度必须在1-100之间')
  ]
};

// 验证结果处理
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 如果是API请求，返回JSON
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({ errors: errors.array() });
    }
    // 否则渲染错误页面
    return res.status(400).render('error', {
      title: '参数错误',
      message: errors.array().map(e => e.msg).join(', '),
      error: {}
    });
  }
  next();
}

// XSS防护 - 清理HTML标签
function sanitizeHTML(str) {
  if (!str) return str;
  return str.replace(/[<>]/g, '');
}

module.exports = { validationRules, handleValidationErrors, sanitizeHTML };
