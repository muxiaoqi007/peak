# 逻辑矩阵 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新增支持多档难度、唯一解随机生成、触屏排除标记和积分提示的逻辑矩阵游戏。

**Architecture:** 游戏作为独立经典脚本 `js/games/logic-grid.js` 注册到现有游戏注册表。生成器先随机创建人物与多个属性的一一对应答案，再从真实线索池中选择能持续缩小候选集合的线索，直到求解器确认唯一解；最近关卡签名写入现有进度数据避免重复。

**Tech Stack:** 原生 JavaScript、CSS Grid、localStorage、现有游戏注册与浏览器测试框架。

---

### Task 1: 注册游戏与存档迁移

**Files:**
- Modify: `js/core.js`
- Modify: `index.html`
- Create: `js/games/logic-grid.js`

**Steps:**

1. 将游戏总数更新为 16，并在 `GAMES` 注册逻辑矩阵卡片。
2. 将进度版本升级到 6，新增 `seen.logicGrid`，兼容旧存档。
3. 在独立脚本中调用 `registerGame('logic-grid', openLogicGrid)`。

### Task 2: 候选解与唯一线索生成器

**Files:**
- Modify: `js/games/logic-grid.js`
- Modify: `js/tests.js`

**Steps:**

1. 枚举每个属性类别相对人物的排列组合。
2. 实现人物等于、人物不等于、跨属性相邻和跨属性排除线索。
3. 从完整候选集合开始，逐步选择能减少候选数量的真实线索，直至只剩一个答案。
4. 添加候选匹配、唯一解和关卡签名测试。

### Task 3: 难度与教程

**Files:**
- Modify: `js/games/logic-grid.js`

**Steps:**

1. 提供入门 3 人双属性、标准 4 人双属性、进阶 4 人三属性、困难 5 人三属性。
2. 增加教程，解释 ✓ 表示确定、× 表示排除以及一一对应规则。
3. 显示自然语言线索和当前剩余未确定关联数。

### Task 4: 触屏矩阵交互

**Files:**
- Modify: `css/styles.css`
- Modify: `js/games/logic-grid.js`

**Steps:**

1. 每次仅显示一个属性矩阵，通过标签切换，避免 5×5 三属性挤出屏幕。
2. 支持“确定”和“排除”工具；确定一格时自动排除同行同列的冲突格。
3. 加入撤销、提交答案、35 XP 提示、换题和返回主页。
4. 完成后记录难度、线索数量和用时。

### Task 5: 回归与部署

**Files:**
- Modify: `README.md`
- Test: `js/tests.js`

**Steps:**

1. 运行全部脚本语法检查和浏览器回归测试。
2. 对四档难度分别生成关卡并确认唯一解。
3. 在 390×844 视口验证 5×5 矩阵、线索、操作栏均在弹窗内。
4. 推送 GitHub 并确认 Vercel 更新。
