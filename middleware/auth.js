const config = require('../config/app');

// 管理员认证中间件
function requireAuth(req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }

  // 如果是API请求，返回401
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: '未授权访问' });
  }

  // 否则重定向到登录页面
  return res.redirect('/admin/login');
}

// 登录验证
function authenticate(username, password) {
  if (username === config.admin.username && password === config.admin.password) {
    return { username, isAdmin: true };
  }
  return null;
}

module.exports = { requireAuth, authenticate };
