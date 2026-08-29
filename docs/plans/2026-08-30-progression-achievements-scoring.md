# Progression, Achievements and Scoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不破坏 23 款游戏和现有本地存档的前提下，重做首页层级、每日目标、等级、成就与统一得分反馈。

**Architecture:** 保留 `xp` 作为 AI 辅助可消费货币，新增 `masteryXp` 作为不可消费的成长经验；所有游戏仍通过 `completeGame()` 汇入统一的分数、段位、星级、奖励与成就判定。成就定义和纯计算函数放在 `js/core.js`，页面事件与筛选逻辑放在 `js/bootstrap.js`，避免侵入各游戏文件。

**Tech Stack:** 原生 HTML、CSS、JavaScript、localStorage、浏览器回归测试。

---

### Task 1: 存档与纯计算层

**Files:** Modify `js/core.js`, `js/tests.js`.

1. 先测试分数段位、星级、等级阈值、每日跨天重置和成就条件。
2. 把存档升级至 v10，新增 `masteryXp`、`achievements`、`dailyDate`、`dailyRewardDate`。
3. 从旧 `history` 安全回填脑力经验，不修改用户现有可用 XP。
4. 实现 `scoreGrade()`、`scoreStars()`、`masteryLevel()`、`syncDailyProgress()` 和 `evaluateAchievements()`。

### Task 2: 统一结算与奖励

**Files:** Modify `js/core.js`, `css/styles.css`.

1. 将所有游戏的原始成绩统一限制为 0–999。
2. 结算时计算 S/A/B/C/D、1–5 星、可用 XP 奖励和脑力经验。
3. 每日完成第 4 局时只发放一次每日奖励。
4. 新成就自动解锁、记录时间并只发一次奖励。
5. 在结算页显示段位、星级、两类经验和新解锁成就。

### Task 3: 首页重构

**Files:** Modify `index.html`, `js/core.js`, `js/bootstrap.js`, `css/styles.css`.

1. 顶栏加入等级与可用 XP；Hero 加入脑力等级进度带。
2. 每日训练卡显示任务奖励、完成态和当日进度。
3. 能力概览改为带最佳分和训练次数的清晰指标。
4. 增加成就预览卡与查看全部入口。
5. 游戏库加入分类筛选和搜索，并显示每款历史最佳成绩。

### Task 4: 进度与个人页

**Files:** Modify `index.html`, `js/core.js`, `js/bootstrap.js`, `css/styles.css`.

1. 进度页加入平均分、最高段位、已探索游戏数、累计经验。
2. 历史记录显示段位和相对时间，最佳榜单显示星级。
3. 个人页展示等级进度、成就网格和锁定条件。
4. 重置数据时同步清除新字段并恢复测试用初始 XP。

### Task 5: 验证与发布

**Files:** Modify `README.md`.

1. 运行存档迁移和纯函数回归测试。
2. 在空白存档和带历史的旧存档下验证页面。
3. 在 390×844 与桌面视口检查首页、进度、个人页和结算页。
4. 验证筛选、搜索、跨天重置、每日奖励和成就只发一次。
5. 运行 23 个游戏入口回归、语法检查和 `git diff --check`，提交并部署。
