# Minecraft CMI 数据查询系统

一个基于 Node.js + Express + MySQL 的 Minecraft 服务器数据查询系统，用于查询 CMI 插件的数据库。

## 功能特性

- 🎮 **玩家信息查询** - 查看玩家在线状态、游戏时长、家位置等
- 🚫 **封禁信息查询** - 查看封禁和禁言记录
- 📊 **数据可视化** - 服务器统计和玩家活跃度图表
- 🔐 **管理后台** - 管理员可以管理玩家和封禁信息
- 🔌 **RESTful API** - 提供完整的 API 接口
- 🎨 **现代化 UI** - 使用 Tailwind CSS 构建的响应式界面

## 技术栈

- **后端**: Node.js + Express
- **数据库**: MySQL (CMI 插件数据库)
- **模板引擎**: EJS
- **UI 框架**: Tailwind CSS
- **缓存**: Node-Cache

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd minecraft-query
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并编辑配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=your_cmi_user
DB_PASSWORD=your_password
DB_NAME=your_cmi_database
DB_PORT=3306

# 应用配置
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret

# 管理员配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### 4. 测试数据库连接

```bash
npm run test:db
```

### 5. 启动应用

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
minecraft-query/
├── config/              # 配置文件
│   ├── database.js      # 数据库配置
│   └── app.js           # 应用配置
├── middleware/           # 中间件
│   ├── auth.js          # 认证中间件
│   └── security.js      # 安全中间件
├── routes/              # 路由
│   ├── index.js         # 首页路由
│   ├── player.js        # 玩家路由
│   ├── ban.js           # 封禁路由
│   ├── admin.js         # 管理路由
│   └── api.js           # API 路由
├── services/            # 服务层
│   ├── playerService.js # 玩家数据服务
│   ├── banService.js    # 封禁数据服务
│   ├── serverService.js # 服务器数据服务
│   └── cacheService.js  # 缓存服务
├── views/               # 视图模板
│   ├── partials/        # 公共模板
│   ├── admin/           # 管理后台视图
│   └── *.ejs            # 页面模板
├── public/              # 静态资源
├── app.js               # 应用入口
└── package.json         # 项目配置
```

## API 接口

### 玩家相关

- `GET /api/stats` - 获取服务器统计
- `GET /api/players` - 获取玩家列表
- `GET /api/players/online` - 获取在线玩家
- `GET /api/players/search?keyword=xxx` - 搜索玩家
- `GET /api/players/:uuid` - 获取玩家详情

### 封禁相关

- `GET /api/bans` - 获取封禁列表
- `GET /api/bans/stats` - 获取封禁统计
- `GET /api/bans/search?keyword=xxx` - 搜索封禁记录

### 其他

- `GET /api/warps` - 获取传送点列表
- `GET /api/recent-logins` - 获取最近登录
- `GET /api/new-players` - 获取新玩家
- `GET /api/activity` - 获取活跃度统计
- `GET /api/playtime-top` - 获取游戏时长排行

## 安全特性

- ✅ SQL 注入防护（参数化查询）
- ✅ XSS 防护（EJS 自动转义 + Helmet）
- ✅ CSRF 防护
- ✅ 速率限制
- ✅ 安全头（Helmet）
- ✅ 会话安全

## 部署建议

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name minecraft-query

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs minecraft-query
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 常见问题

### Q: 数据库连接失败？

A: 请检查：
1. `.env` 文件中的数据库配置是否正确
2. MySQL 服务是否运行
3. 数据库用户是否有访问权限
4. CMI 插件是否已创建数据库表

### Q: 如何修改管理员密码？

A: 编辑 `.env` 文件中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，然后重启应用。

### Q: 如何清除缓存？

A: 访问管理后台，点击"清除缓存"按钮，或重启应用。

## 许可证

MIT License
