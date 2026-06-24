# Minecraft CMI 数据查询系统

一个基于 Node.js + Express 的 Minecraft 服务器数据查询系统，支持 **MySQL** 和 **SQLite** 双数据库后端，直接读取 CMI 插件的真实数据库。

## ✨ 功能特性

### 核心功能
- 🎮 **玩家信息查询** - 查看玩家在线状态、游戏时长、家位置等
- 🚫 **封禁信息查询** - 查看封禁和禁言记录
- 📊 **数据可视化** - 服务器统计和玩家活跃度图表
- 🔐 **管理后台** - 管理员可以管理玩家和封禁信息
- 🔌 **RESTful API** - 提供完整的 API 接口

### 新增功能
- 🗺️ **传送点展示** - 查看服务器所有传送点及坐标
- 🏆 **游戏时长排行榜** - 玩家游戏时长排名
- 📈 **活跃度统计** - 30天活跃玩家和新注册玩家图表
- 🌙 **深色模式** - 支持深色/浅色主题切换
- 🔍 **搜索自动完成** - 搜索框实时搜索建议
- 📍 **面包屑导航** - 清晰的页面层级导航
- 🔔 **Toast 通知** - 优雅的消息提示系统
- ⬆️ **返回顶部** - 快速回到页面顶部

### UI/UX 改进
- 🎨 **Minecraft 风格主题** - 像素风格视觉元素
- ✨ **动画效果** - 卡片入场动画、悬停效果
- 📱 **响应式设计** - 完美适配移动端
- 🎯 **深色模式** - 自动适应系统主题或手动切换
- 🖼️ **懒加载** - 图片懒加载优化性能

## 技术栈

- **后端**: Node.js 18+ + Express 4
- **数据库**: MySQL 5.7+ / SQLite（通过 sql.js，直接读取 CMI 原始数据库）
- **数据库适配层**: 自研 `DatabaseAdapter` 统一 MySQL/SQLite 查询接口
- **模板引擎**: EJS
- **UI 框架**: Tailwind CSS (CDN)
- **图表**: Chart.js
- **缓存**: Node-Cache
- **安全**: Helmet + express-rate-limit + express-validator

## 📦 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd FantasyPeak-Query
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
# 数据库类型: mysql 或 sqlite（默认 sqlite）
DB_TYPE=sqlite

# ---- MySQL 配置（DB_TYPE=mysql 时生效）----
DB_HOST=localhost
DB_USER=your_cmi_user
DB_PASSWORD=your_password
DB_NAME=your_cmi_database
DB_PORT=3306

# ---- SQLite 配置（DB_TYPE=sqlite 时生效）----
# 指向 CMI 插件的 cmi.sqlite.db 文件路径
SQLITE_PATH=./data/minecraft.db

# 应用配置
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret

# 管理员配置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

# 缓存配置
CACHE_TTL=300
CACHE_CHECK_PERIOD=600
```

> **💡 提示**: SQLite 模式下无需安装 MySQL，直接读取 CMI 插件的 `cmi.sqlite.db` 文件即可。将 CMI 数据库文件放到 `data/` 目录下，或通过 `SQLITE_PATH` 指定完整路径。

### 4. 测试数据库连接

```bash
npm run test:db
```

### 5. 启动应用

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

访问 http://localhost:3000 查看应用。

## 📁 项目结构

```
FantasyPeak-Query/
├── config/              # 配置文件
│   ├── database.js      # 数据库统一适配器（MySQL/SQLite 双后端）
│   ├── db-utils.js      # 数据库兼容工具（跨库 SQL 表达式）
│   ├── sqlite-schema.js # CMI SQLite 表结构定义与字段解析
│   └── app.js           # 应用全局配置
├── middleware/           # 中间件层
│   ├── auth.js          # 管理员认证中间件
│   └── security.js      # 安全验证中间件
├── routes/              # 路由层
│   ├── index.js         # 首页及新页面路由
│   ├── player.js        # 玩家相关路由
│   ├── ban.js           # 封禁相关路由
│   ├── admin.js         # 管理后台路由
│   └── api.js           # RESTful API 路由
├── services/            # 业务逻辑层
│   ├── playerService.js # 玩家数据服务
│   ├── banService.js    # 封禁数据服务
│   ├── serverService.js # 服务器数据服务
│   └── cacheService.js  # 缓存管理服务
├── views/               # 视图模板层
│   ├── partials/        # 公共组件
│   │   ├── header.ejs   # 页头（导航栏）
│   │   ├── footer.ejs   # 页脚
│   │   └── pagination.ejs # 分页组件
│   ├── admin/           # 管理后台视图
│   │   ├── login.ejs    # 登录页
│   │   ├── dashboard.ejs # 仪表盘
│   │   ├── players.ejs  # 玩家管理
│   │   └── bans.ejs     # 封禁管理
│   ├── index.ejs        # 首页
│   ├── players.ejs      # 玩家列表
│   ├── player.ejs       # 玩家详情
│   ├── bans.ejs         # 封禁列表
│   ├── mutes.ejs        # 禁言列表
│   ├── warps.ejs        # 传送点页面
│   ├── playtime.ejs     # 游戏时长排行榜
│   ├── activity.ejs     # 活跃度统计
│   └── error.ejs        # 错误页面
├── data/                # SQLite 数据库文件目录（gitignore）
├── public/              # 静态资源
│   ├── css/
│   │   ├── custom.css   # 自定义样式
│   │   └── animations.css # 动画样式
│   └── js/
│       └── app.js       # 前端脚本
├── app.js               # 应用入口
├── test-db.js           # 数据库测试脚本
├── package.json         # 项目依赖配置
├── .env.example         # 环境变量示例
└── .gitignore           # Git 忽略配置
```

## 🔌 API 接口

### 玩家相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats` | 获取服务器统计 |
| GET | `/api/players` | 获取玩家列表（分页） |
| GET | `/api/players/online` | 获取在线玩家 |
| GET | `/api/players/search?keyword=xxx` | 搜索玩家 |
| GET | `/api/players/:uuid` | 获取玩家详情 |
| GET | `/api/playtime-top` | 获取游戏时长排行 |

### 封禁相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/bans` | 获取封禁列表（分页） |
| GET | `/api/bans/stats` | 获取封禁统计 |
| GET | `/api/bans/search?keyword=xxx` | 搜索封禁记录 |

### 其他

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/warps` | 获取传送点列表 |
| GET | `/api/recent-logins` | 获取最近登录 |
| GET | `/api/new-players` | 获取新玩家 |
| GET | `/api/activity` | 获取活跃度统计 |

## 🎨 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 首页仪表盘 |
| `/player` | 玩家列表 |
| `/player/search?keyword=xxx` | 玩家搜索 |
| `/player/:uuid` | 玩家详情 |
| `/bans` | 封禁记录 |
| `/bans/mutes` | 禁言记录 |
| `/warps` | 传送点展示 |
| `/playtime` | 游戏时长排行榜 |
| `/activity` | 活跃度统计 |
| `/admin` | 管理后台 |
| `/admin/login` | 管理员登录 |

## 🔒 安全特性

- ✅ SQL 注入防护（参数化查询）
- ✅ XSS 防护（EJS 自动转义 + Helmet CSP）
- ✅ CSRF 防护
- ✅ 速率限制（100次/15分钟）
- ✅ 安全头（Helmet）
- ✅ 会话安全（httpOnly + secure）
- ✅ 输入验证（express-validator）
- ✅ SQLite 默认只读模式（防止意外修改 CMI 数据）

## 🚀 部署建议

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start app.js --name FantasyPeak-Query

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs minecraft-query

# 监控
pm2 monit
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

## ❓ 常见问题

### Q: 数据库连接失败？

A: 请检查：
1. `.env` 文件中的数据库配置是否正确
2. **MySQL 模式**: MySQL 服务是否运行，数据库用户是否有访问权限
3. **SQLite 模式**: `SQLITE_PATH` 路径是否正确指向 CMI 的 `cmi.sqlite.db` 文件
4. CMI 插件是否已创建数据库表

### Q: 如何修改管理员密码？

A: 编辑 `.env` 文件中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`，然后重启应用。

### Q: 如何清除缓存？

A: 访问管理后台，点击"清除缓存"按钮，或重启应用。

### Q: 如何切换深色模式？

A: 点击导航栏右侧的月亮/太阳图标即可切换主题，主题偏好会自动保存。

### Q: 传送点页面显示"没有传送点"？

A: 请确认 CMI 插件的 `cmi_warps` 表中有数据。

### Q: SQLite 模式下如何获取 CMI 数据库文件？

A: CMI 插件的数据库文件位于 Minecraft 服务器的 `plugins/CMI/cmi.sqlite.db`。将该文件复制到项目的 `data/` 目录下，或在 `.env` 中通过 `SQLITE_PATH` 指定完整路径。

### Q: 如何在 MySQL 和 SQLite 之间切换？

A: 修改 `.env` 文件中的 `DB_TYPE` 值为 `mysql` 或 `sqlite`，然后重启应用即可。

## 📝 更新日志

### v3.0.0 (2026-06-24)
- 🗄️ **新增 SQLite 支持** - 通过 sql.js 直接读取 CMI 原始数据库，无需安装 MySQL
- 🔧 **数据库统一适配层** - `DatabaseAdapter` 提供 MySQL/SQLite 一致的 `query()` 接口
- 🔧 **跨库 SQL 兼容工具** - `db-utils.js` 封装日期函数、时间戳等跨库差异
- 📋 **CMI 真实表结构适配** - `sqlite-schema.js` 定义 CMI 表名/字段映射及 Homes、IPs 解析
- 📝 **环境变量扩展** - 新增 `DB_TYPE`、`SQLITE_PATH`、`SQLITE_READONLY` 配置项
- 📦 **新增 sql.js 依赖** - SQLite WebAssembly 驱动

### v2.0.0 (2026-06-24)
- ✨ 新增传送点展示页面
- ✨ 新增游戏时长排行榜
- ✨ 新增活跃度统计图表（Chart.js）
- ✨ 新增深色模式支持
- ✨ 新增搜索自动完成
- ✨ 新增面包屑导航
- ✨ 新增 Toast 通知系统
- ✨ 新增返回顶部按钮
- 🎨 Minecraft 风格视觉主题
- 🎨 卡片动画效果
- 🎨 渐变色统计卡片
- 🔧 提取分页为公共组件
- 🔧 添加 EJS 辅助函数
- 🔧 修复 UUID 验证
- 📱 改进响应式设计

### v1.0.0 (2026-06-23)
- 🎉 初始版本发布
- 玩家查询功能
- 封禁/禁言查询功能
- 管理后台
- RESTful API

## 📄 许可证

MIT License
