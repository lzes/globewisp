# MEM//ATLAS

一个用于记录个人环球旅行记忆的互动相册：通过世界地图展示到访国家，通过国家节点浏览对应照片，并用静态或动态航线还原飞行轨迹。

## 功能

- 交互式世界地图与到访国家高亮
- 点击国家进入对应旅行相册
- 静态 / 动态全球航线切换
- 飞行日志、里程与目的地信息
- 响应式科技感界面
- GitHub Pages 自动部署

## 本地开发

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 构建

```bash
# Sites / Cloudflare Worker 兼容构建
npm run build

# GitHub Pages 静态构建
GITHUB_ACTIONS=true \
NEXT_PUBLIC_BASE_PATH=/globewisp \
NEXT_PUBLIC_SITE_URL=https://lzes.github.io/globewisp \
npm run build:pages
```

GitHub Pages 构建结果位于 `out/`，推送到 `main` 后会由 GitHub Actions 自动发布。

## 自定义旅行数据

国家、城市、航线与相册内容集中在 `app/page.tsx`：

- `countries`：到访国家、坐标、相册照片与旅行记录
- `routes`：飞行起点、终点和航线代码

照片资源位于 `public/photos/`。
