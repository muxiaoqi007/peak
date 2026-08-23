# 游戏模块化重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将单文件应用拆分为 HTML 外壳、公共核心、独立样式、15 个游戏脚本和独立测试脚本，同时保持功能、存档和直接打开体验不变。

**Architecture:** 使用按顺序加载的经典浏览器脚本而非 ES Modules，确保 `file://` 环境无需本地服务器也能运行。`js/core.js` 负责进度、通用 UI、公共工具和游戏完成流程；`js/games/*.js` 每个文件只包含一款游戏；`js/bootstrap.js` 在所有游戏载入后绑定入口；`js/tests.js` 提供回归测试。

**Tech Stack:** 原生 HTML、CSS、经典 JavaScript、localStorage、Chrome CDP 回归测试。

---

### Task 1: 建立目录和样式边界

**Files:**
- Create: `css/styles.css`
- Modify: `index.html`

**Steps:**

1. 将内联 `<style>` 原样迁移到 `css/styles.css`。
2. 在 `index.html` 用 `<link rel="stylesheet">` 引入样式。
3. 直接以 `file://` 打开，确认页面首屏样式完整。

### Task 2: 提取公共运行时

**Files:**
- Create: `js/core.js`
- Create: `js/bootstrap.js`
- Modify: `index.html`

**Steps:**

1. 将游戏清单、存档迁移、报告、Toast、共享 DOM 状态放入 `core.js`。
2. 将 `completeGame`、`prepareGeneric`、`shuffle`、`seededRandom` 放入公共核心。
3. 将导航、游戏启动映射、键盘事件和关闭弹窗绑定放入最后加载的 `bootstrap.js`。
4. 验证旧 localStorage 存档可读取。

### Task 3: 每款游戏独立文件

**Files:**
- Create: `js/games/number.js`
- Create: `js/games/color.js`
- Create: `js/games/math.js`
- Create: `js/games/path.js`
- Create: `js/games/sudoku.js`
- Create: `js/games/2048.js`
- Create: `js/games/sliding.js`
- Create: `js/games/huarong.js`
- Create: `js/games/mines.js`
- Create: `js/games/memory.js`
- Create: `js/games/hanoi.js`
- Create: `js/games/one-stroke.js`
- Create: `js/games/race.js`
- Create: `js/games/castle.js`
- Create: `js/games/nonogram.js`

**Steps:**

1. 按现有函数边界逐款迁移，保持源码逻辑不变。
2. 确认每个游戏文件只暴露其启动函数和必要的测试纯函数。
3. 在 `index.html` 中按依赖顺序加载全部脚本。
4. 检查源码，确保任一游戏文件故障不会改变其他游戏源码。

### Task 4: 独立测试入口和文档

**Files:**
- Create: `js/tests.js`
- Modify: `README.md`

**Steps:**

1. 将 `window.MindPeakTests` 从产品逻辑中移至 `tests.js`。
2. README 增加目录结构和新增游戏步骤。
3. 添加结构检查：HTML 不含内联脚本/样式，15 个游戏文件均被加载。

### Task 5: 全量回归与部署

**Files:**
- Test: all files above

**Steps:**

1. 对全部 JavaScript 文件运行语法检查。
2. 在浏览器运行现有 24 项测试。
3. 逐一点击 15 张游戏卡，确认每款能打开且能返回主页。
4. 在 390×844 视口复测城堡拼图和数织一屏布局。
5. 提交、推送并确认 Vercel 部署包含模块化目录。
