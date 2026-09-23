# 🐍 Snake React Game

A responsive, arcade-style Snake game built with modern React 19, TypeScript, and Vite.

---

## Project Overview

**Snake React Game** brings the classic retro arcade experience to the modern web. Built with React hooks and performant grid rendering, it features real-time collision detection, dynamic difficulty scaling, and high score tracking persisted locally.

---

## Features

- **Classic Grid Mechanics**: 20x20 tile board with non-overlapping food generation and boundary collision physics.
- **Multiple Difficulty Levels**:
  - **Easy**: Relaxed base pace with gentle speed increments.
  - **Normal**: Standard balanced progression.
  - **Hard**: Fast-paced reflexes with aggressive speed acceleration per apple eaten.
- **Persistent High Scores**: High scores tracked and stored separately per difficulty in browser `localStorage`.
- **Keyboard Controls**: Intuitive controls supporting standard `Arrow Keys` or `WASD` navigation, `Spacebar` pause/resume, and `Enter` quick restart.
- **Pure Client Execution**: Zero external runtime network dependencies; runs 100% offline.

---

## Prerequisites

- **Node.js**: `>= 18.0.0`
- **Package Manager**: `npm`, `pnpm`, or `yarn`

---

## Installation and Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## Usage & Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Up** | `ArrowUp` | `W` |
| **Move Down** | `ArrowDown` | `S` |
| **Move Left** | `ArrowLeft` | `A` |
| **Move Right** | `ArrowRight` | `D` |
| **Pause / Resume** | `Spacebar` | — |
| **Restart Game** | `Enter` | — |

---

## Defensive Security Architecture

- **Defensive LocalStorage Deserialization**: High scores are defensively validated and numeric-cast upon retrieval to guard against corrupted or tampered browser storage values.
- **DOM Injection Protection**: Dynamic board cells and HUD scores are rendered purely through typed React JSX elements without raw HTML insertion.
- **Boundary Validation**: Head movements and self-intersection tests are strictly guarded with multi-condition checks preventing memory index or state anomalies.

---

## License

Proprietary. All rights reserved. Not licensed for redistribution, public sublicensing, or resale.
