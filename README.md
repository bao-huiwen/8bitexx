# 八字修仙人生

一个纯前端网页游戏，使用 React + Vite 开发，可部署到 GitHub Pages，无后端，使用 localStorage 本地存档。

## 功能

- 八字录入：姓名、出生日期、出生时间、未知时辰折中处理
- 四柱计算：年柱、月柱、日柱、时柱
- 五行统计：木、火、土、金、水比例展示
- 灵根生成：天灵根、双灵根、三灵根、杂灵根
- 命格生成：根据五行强弱生成命格与补缺提示
- 十二地支章节：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
- 五档选择：大凶、小凶、平、小吉、大吉
- 属性系统：性格、决策力、生命力、气运、心魔
- 结局系统：死亡、入魔、凡人、练气、筑基
- 开局免责声明
- 截图下载
- 分享：支持 Web Share API，其他浏览器复制分享文案
- 本地存档：localStorage

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

### 方式一：GitHub Actions 自动部署

1. 新建 GitHub 仓库。
2. 上传本项目所有文件。
3. 进入仓库 Settings -> Pages。
4. Source 选择 `GitHub Actions`。
5. 推送到 `main` 或 `master` 分支后自动部署。

### 方式二：gh-pages 分支部署

如果你的仓库是项目页，建议构建时指定仓库名：

```bash
VITE_BASE=/你的仓库名/ npm run build
npm run deploy
```

## 算法说明

本项目为传统文化主题游戏，不是专业命理工具。四柱计算采用游戏化近似算法：

- 年柱：以立春近似 2 月 4 日换年。
- 月柱：以十二节气起月的近似日期计算。
- 日柱：使用甲子日基准近似推算。
- 时柱：按传统十二时辰划分；未知时辰时对五行做均衡折中。

如需商业级严肃命理排盘，应接入精确天文节气、历法转换与专业校验表。

## 目录结构

```text
bazi-xiuxian/
├── .github/workflows/deploy.yml
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── FUNCTION_CHECKLIST.md
├── SELF_TEST_REPORT.md
└── src/
    ├── main.jsx
    ├── bazi.js
    └── style.css
```
