# MindPeak Brain Training App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an original mobile-first brain-training web app with four cognitive exercises, four traditional puzzle games, daily workouts, adaptive difficulty, and progress reporting.

**Architecture:** Start with a dependency-free single-page prototype so game mechanics and product flow can be validated immediately. Keep game state, scoring, and persistence behind small JavaScript modules, then migrate the validated experience to a component framework and backend without changing the rules. Store anonymous progress locally in the MVP; introduce accounts only after the core loop is proven.

**Tech Stack:** Semantic HTML, CSS design tokens, vanilla JavaScript, Web Storage, browser-native test harness initially; React/TypeScript and Supabase in the production phase.

---

## Product boundaries

- Use an original name, visual identity, copy, icons, sounds, question sets, and level layouts.
- Reproduce the category-level product model, not Peak's protected assets or exact screens.
- Design for touch first, keyboard second, and desktop preview third.
- Treat cognitive scores as entertainment and practice feedback, not medical assessment.

## Milestone 1: Foundation and vertical slice

### Task 1: Create the app shell and design system

**Files:**
- Create: `index.html`

**Steps:**
1. Define the six palette tokens and responsive layout primitives.
2. Add the home dashboard, daily workout card, category overview, game library, and bottom navigation.
3. Add accessible focus states, reduced-motion handling, and mobile reflow.
4. Open `index.html` and verify there is no horizontal overflow at 390px and 1280px.

### Task 2: Define game and progress data

**Files:**
- Modify: `index.html`

**Steps:**
1. Define metadata for eight games: four training games and four classics.
2. Create a versioned local progress schema.
3. Add safe load/save helpers with malformed-storage fallback.
4. Verify a refresh retains streak, XP, and best scores.

### Task 3: Implement Number Flash

**Files:**
- Modify: `index.html`

**Steps:**
1. Add states for ready, memorizing, answering, feedback, and results.
2. Generate digit sequences without leading zeroes.
3. Scale sequence length after correct answers and end after three mistakes.
4. Calculate score from accuracy, difficulty, and response time.
5. Persist the best score and completed-session count.
6. Verify keyboard entry, touch keypad entry, backspace, submit, replay, and exit.

### Task 4: Add an internal smoke-test harness

**Files:**
- Modify: `index.html`

**Steps:**
1. Test sequence length and leading-zero rules.
2. Test score monotonicity as difficulty rises.
3. Test progress migration and malformed-storage fallback.
4. Run tests from the browser console with `MindPeakTests.run()` and expect all checks to pass.

## Milestone 2: Four cognitive exercises

### Task 5: Implement Color Conflict

**Files:**
- Modify: `index.html`

**Steps:**
1. Add congruent and incongruent trials with balanced sampling.
2. Require the player to choose ink color rather than word meaning.
3. Add a 45-second session, combo multiplier, and response-time scoring.
4. Add deterministic unit tests for trial generation and score calculation.

### Task 6: Implement Rapid Math

**Files:**
- Modify: `index.html`

**Steps:**
1. Generate addition and subtraction questions, then unlock multiplication.
2. Balance true and false statements without negative beginner answers.
3. Add a 60-second session and adaptive operand ranges.
4. Test generators across 1,000 seeded samples.

### Task 7: Implement Path Recall

**Files:**
- Modify: `index.html`

**Steps:**
1. Generate solvable grid paths and briefly reveal them.
2. Accept touch and keyboard path reconstruction.
3. Scale grid size and path length independently.
4. Test path continuity, bounds, and solvability.

## Milestone 3: Four classic games

### Task 8: Implement Sudoku

**Files:**
- Create: `src/games/sudoku.ts`
- Test: `tests/sudoku.test.ts`

**Steps:**
1. Write failing tests for row, column, and box validity.
2. Implement seeded puzzle loading before adding generation.
3. Add notes, conflict highlighting, undo, timer, and hints.
4. Test completion and invalid-board rejection.

### Task 9: Implement 2048

**Files:**
- Create: `src/games/game2048.ts`
- Test: `tests/game2048.test.ts`

**Steps:**
1. Test compress, merge-once, score, spawn, and game-over rules.
2. Implement pure board transformations.
3. Add swipe and arrow-key input plus undo-one-move.
4. Persist best tile and best score.

### Task 10: Implement sliding puzzle

**Files:**
- Create: `src/games/sliding-puzzle.ts`
- Test: `tests/sliding-puzzle.test.ts`

**Steps:**
1. Test legal moves and solvable shuffle parity.
2. Implement 3×3 and 4×4 boards.
3. Add move count, timer, restart, and best records.

### Task 11: Implement Minesweeper

**Files:**
- Create: `src/games/minesweeper.ts`
- Test: `tests/minesweeper.test.ts`

**Steps:**
1. Test safe first click, adjacency counts, flood reveal, flags, win, and loss.
2. Implement beginner, intermediate, and expert layouts.
3. Add long-press flagging and accessible cell labels.

## Milestone 4: Daily training and insights

### Task 12: Build the workout scheduler

**Files:**
- Create: `src/domain/workouts.ts`
- Test: `tests/workouts.test.ts`

**Steps:**
1. Select one game from each under-trained skill category.
2. Prevent the same daily set on consecutive days.
3. Resume interrupted sessions safely.
4. Award XP once per completed daily workout.

### Task 13: Build adaptive difficulty and normalized scores

**Files:**
- Create: `src/domain/scoring.ts`
- Test: `tests/scoring.test.ts`

**Steps:**
1. Normalize raw results into 0–100 category scores.
2. Adjust difficulty only after a minimum evidence window.
3. Cap daily movement to prevent volatile score jumps.
4. Explain every score using accuracy, speed, and level contributions.

### Task 14: Build progress reports

**Files:**
- Create: `src/screens/progress.tsx`
- Test: `tests/progress.test.tsx`

**Steps:**
1. Add seven-day and thirty-day category trends.
2. Add personal-best and consistency summaries.
3. Add a category radar chart with an accessible tabular alternative.
4. Verify empty, sparse, and complete histories.

## Milestone 5: Productionization

### Task 15: Migrate to React and TypeScript

**Files:**
- Create: `package.json`
- Create: `src/main.tsx`
- Create: `src/app.tsx`

**Steps:**
1. Scaffold Vite with strict TypeScript.
2. Move each game engine into pure tested modules.
3. Move screens into lazy-loaded routes.
4. Add Vitest, Testing Library, and Playwright.
5. Preserve the prototype's local progress through a schema migration.

### Task 16: Add accounts and cloud sync

**Files:**
- Create: `src/services/auth.ts`
- Create: `src/services/progress.ts`
- Create: `supabase/migrations/001_initial.sql`

**Steps:**
1. Add email magic-link and guest modes.
2. Define row-level security for user-owned sessions and profiles.
3. Merge guest progress after sign-in without duplication.
4. Add export and account-deletion flows.

### Task 17: Add Pro entitlements

**Files:**
- Create: `src/domain/entitlements.ts`
- Test: `tests/entitlements.test.ts`

**Steps:**
1. Keep the daily workout and rotating classics free.
2. Gate advanced reports, unlimited play, and extra difficulty packs.
3. Enforce entitlements on the server and reflect them in the UI.
4. Test expiry, renewal, cancellation, and offline grace periods.

## Release checklist

1. Run unit, component, and end-to-end tests.
2. Test VoiceOver/TalkBack labels and keyboard-only operation.
3. Verify 60 fps interaction on a mid-range phone.
4. Verify all generated boards are solvable and all sessions can exit safely.
5. Add privacy policy, terms, subscription disclosure, and non-medical disclaimer.
6. Run an originality review against Peak screenshots before release.
