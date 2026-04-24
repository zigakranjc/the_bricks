<div align="center">

# 🎮 THE ICE BRICKS
*A browser-based brick breaker game featuring power-ups, progression rewards, and dynamic canvas rendering.*

</div>

---

## Project Overview

**Brick Breaker** is a browser-based arcade game where the player controls a paddle to keep a ball in play and destroy all bricks. Features a power-up system, progressive background changes, sound effects, and a custom SweetAlert2 game over screen.

## Project Structure
project/
├── index.html
├── style.css
├── js/
│   ├── script.js
│   ├── sweetAlert.js
│   └── jquery.js
└── assets/
├── img/
└── sound/

## Technical Features

- **Canvas Rendering:** HTML5 Canvas API for real-time 2D graphics and ball physics
- **Collision System:** Circle-to-rectangle distance-based collision detection
- **Power-up System:** Falling power-up widens the paddle with a countdown timer
- **Progression Rewards:** Background and images update every 10 bricks destroyed
- **Audio Integration:** Sound effects for hits, milestones, and power-ups

## File Descriptions

| File/Folder | Description |
|---|---|
| `index.html` | Document structure, canvas element, and library links |
| `style.css` | Layout, animations, and button styling |
| `js/script.js` | Game loop, physics, and collision detection |
| `js/sweetAlert.js` | Game over and win pop-ups |
| `assets/img/` | All game images and backgrounds |
| `assets/sound/` | All sound effects |

## Dependencies

- **jQuery** — DOM manipulation and event handling
- **SweetAlert2** — Stylized game over and win alerts

## How to Run

1. Clone the repository
2. Preserve the folder structure so asset paths remain valid
3. Open `index.html` in any modern browser
4. Click **Play** or press **Space** to start

---

<div align="center">
Developed by Žiga Kranjc — 4. Rb
</div>
