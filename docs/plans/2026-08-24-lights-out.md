# 开关灯 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新增 3×3 至 7×7、保证可解、按最短解分级且支持触屏与积分辅助的开关灯游戏。

**Architecture:** 游戏位于独立脚本 `js/games/lights-out.js`。生成器从全灭状态施加合法点击得到可解棋盘，再由逐行追灯求解器枚举首行方案并返回最短解；仅接受符合难度步数区间且近期未出现的棋盘。

**Tech Stack:** 原生 JavaScript、CSS Grid、localStorage、现有游戏注册与浏览器测试框架。

---

### Task 1: 注册与进度迁移

**Files:**
- Modify: `index.html`
- Modify: `js/core.js`
- Create: `js/games/lights-out.js`

**Steps:**

1. 增加第 17 款游戏卡片和独立脚本加载。
2. 进度版本升级为 7，新增 `seen.lightsOut` 并兼容旧存档。
3. 通过 `registerGame('lights-out', openLightsOut)` 注册入口。

### Task 2: 棋盘变换与最短解求解器

**Files:**
- Modify: `js/games/lights-out.js`
- Modify: `js/tests.js`

**Steps:**

1. 实现点击格子时切换自身及上下左右的纯函数。
2. 枚举首行点击组合，逐行追灯，筛选能关闭全部灯的方案。
3. 返回点击次数最少的方案，并增加“求解后全灭”测试。

### Task 3: 难度生成器

**Files:**
- Modify: `js/games/lights-out.js`

**Steps:**

1. 提供 3×3、4×4、5×5、6×6、7×7 五档难度。
2. 从全灭棋盘随机点击生成，求出最短解并按步数区间验收。
3. 保存最近 80 个棋盘签名，避免重复关卡。

### Task 4: 游戏交互与响应式布局

**Files:**
- Modify: `css/styles.css`
- Modify: `js/games/lights-out.js`

**Steps:**

1. 渲染会发光的自适应棋盘，并清楚展示点击影响范围。
2. 支持触屏点击、撤销、重开本局、换题和返回主页。
3. 增加 25 XP 智能一步，调用当前状态的最短解。
4. 增加教程和完成后的步数、最少步数、用时统计。

### Task 5: 回归和部署

**Files:**
- Modify: `README.md`
- Test: `js/tests.js`

**Steps:**

1. 对全部脚本运行语法检查和浏览器测试。
2. 验证五档关卡全部可解并符合最短步数区间。
3. 在 390×844 视口检查 7×7 棋盘和全部操作按钮。
4. 推送 GitHub 并确认 Vercel 更新。
