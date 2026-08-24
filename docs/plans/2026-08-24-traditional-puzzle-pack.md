# Traditional Puzzle Pack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 依次新增数桥、摩天楼、星星战役、推箱子和美术馆五款可分级、可辅助、移动端可玩的传统益智游戏。

**Architecture:** 每款游戏位于一个独立 `js/games/*.js` 经典脚本，通过 `registerGame` 注册。生成器输出答案、初始状态和签名；逻辑题由对应求解器限制搜索到两个答案以确认唯一性，移动题从合法反向动作生成并保留解路。公共存档只增加各游戏近期签名数组，不把游戏实现写回核心文件。

**Tech Stack:** 原生 HTML、CSS、JavaScript、localStorage、浏览器回归测试。

---

### Task 1: 数桥

**Files:** Create `js/games/hashi.js`; modify `js/tests.js`, `js/core.js`, `index.html`, `css/styles.css`.

1. 先测试桥数统计、交叉检测、连通检测和生成题可还原。
2. 从连通的水平/垂直岛屿网络生成 5 档题目，边权为 1–2。
3. 实现点选两岛连桥、撤销、查错和 AI 一步。
4. 在 390×844 下验证最高难度同屏操作。

### Task 2: 摩天楼

**Files:** Create `js/games/skyscrapers.js`; modify `js/tests.js`, `js/core.js`, `index.html`, `css/styles.css`.

1. 测试可见楼数、拉丁方阵和题目答案一致性。
2. 生成 4×4 至 7×7 拉丁方阵，按难度隐藏外圈线索并加入必要起始数。
3. 实现数字键盘、候选、查错、撤销和 AI 一步。
4. 验证横纵不重复和四向可见数规则。

### Task 3: 星星战役

**Files:** Create `js/games/star-battle.js`; modify `js/tests.js`, `js/core.js`, `index.html`, `css/styles.css`.

1. 测试星星互不接触、行列配额和区域配额。
2. 从合法星位生成连通区域，提供 6×6 至 10×10 分级题盘。
3. 实现星标、排除标记、撤销、查错和 AI 一步。
4. 验证每个关卡至少有一组完整合法答案。

### Task 4: 推箱子

**Files:** Create `js/games/sokoban.js`; modify `js/tests.js`, `js/core.js`, `index.html`, `css/styles.css`.

1. 测试移动、推箱、墙体阻挡和完成判定。
2. 从箱子已在目标位的状态执行合法反向拉动生成关卡，保存反向解路。
3. 实现方向键、滑动、撤销、重开和 AI 一步。
4. 验证所有箱子都能到达目标且移动端无滚动手势冲突。

### Task 5: 美术馆

**Files:** Create `js/games/akari.js`; modify `js/tests.js`, `js/core.js`, `index.html`, `css/styles.css`.

1. 测试照明射线、灯泡冲突、数字墙相邻灯数和完成判定。
2. 生成分级墙体布局与合法灯位，并用起始锁定格消除歧义。
3. 实现灯泡、排除标记、撤销、查错和 AI 一步。
4. 验证所有白格照亮、灯泡互不可见、数字墙满足约束。

### Task 6: 整体接入与交付

**Files:** Modify `README.md`, `js/core.js`, `index.html`, `js/tests.js`, `css/styles.css`.

1. 存档版本升级并为五款游戏各保留最近 80 个签名。
2. 更新游戏总数、README 游戏清单和生成机制说明。
3. 运行 JavaScript 语法、浏览器回归、全部卡片启动与小屏布局检查。
4. `git diff --check` 后提交、推送并验证线上脚本可访问。
