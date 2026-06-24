const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const config = require('./config/app');

// 路由导入
const indexRoutes = require('./routes/index');
const playerRoutes = require('./routes/player');
const banRoutes = require('./routes/ban');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const app = express();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 压缩响应
app.use(compression());

// 日志记录
app.use(morgan('dev'));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 会话配置
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 全局变量和辅助函数
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;

  // 格式化游戏时长
  res.locals.formatPlaytime = function(ms) {
    if (!ms || ms <= 0) return '未知';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours} 小时 ${minutes} 分钟`;
    }
    return `${minutes} 分钟`;
  };

  // 格式化日期
  res.locals.formatDate = function(timestamp) {
    if (!timestamp) return '未知';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取头像URL
  res.locals.getAvatarUrl = function(uuid, size = 40) {
    return `https://mc-heads.net/avatar/${uuid}/${size}`;
  };

  // 获取身体头像URL
  res.locals.getBodyUrl = function(uuid, size = 128) {
    return `https://mc-heads.net/body/${uuid}/${size}`;
  };

  next();
});

// 路由
app.use('/', indexRoutes);
app.use('/player', playerRoutes);
app.use('/bans', banRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - 页面未找到',
    message: '您访问的页面不存在',
    error: {}
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: '500 - 服务器错误',
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  警告: 数据库连接失败，部分功能可能不可用');
  }

  app.listen(config.port, () => {
    console.log(`🚀 服务器已启动: http://localhost:${config.port}`);
    console.log(`📊 环境: ${config.nodeEnv}`);
  });
}

startServer();

module.exports = app;
