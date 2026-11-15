# FC 27 — THE NEXT GENERATION OF FOOTBALL
### AAA WebGL 3D Football Simulation Engine

Inspired by modern AAA sports titles (such as EA Sports FC), **FC 27** delivers an original, high-performance, interactive 3D football experience built natively for modern web browsers.

---

## 🎮 Key Features & Game Modes

### 1. Main Menu Presentation
- **3D Stadium Backdrop**: Real-time rendering of Grand Apex Arena under night floodlights with atmospheric dust particles, volumetric lighting, and camera orbit.
- **Dynamic Sports Typography**: EA FC-inspired Volt Green accents (`#00ff87`), glassmorphism cards, and live ticker alerts.
- **Synthesized Stadium Ambience**: Procedural crowd murmur, reverb whistle, and punchy UI sounds powered by the **Web Audio API**.
- **Every Menu Mode Functional**:
  1. **Kick Off** (Exhibition matches)
  2. **Career Mode** (Manager signing ceremonies, press conferences, board objectives)
  3. **Tournament** (Continental Champions Cup 8-team knockout bracket)
  4. **Training Arena** (1v1 goalkeeper practice, curved free kicks, penalty shootout)
  5. **Team Management** (FUT-style squad builder, tactical pitch board, chemistry, bench swaps)
  6. **Settings** (Camera angles, sound volume, graphics quality, controls guide)
  7. **About FC 27** (Engine specs and credits)

---

### 2. 3D Stadium & Visual Architecture (`Three.js`)
- **Detailed 105m × 68m Pitch**: High-resolution procedural grass canvas with mowed lawn stripes, touchlines, penalty boxes, 6-yard boxes, penalty arcs, and corner arcs.
- **Physical Goalposts & 3D Nets**: White metallic posts and crossbars with realistic crossbar bounce reflections and sagging 3D goal nets.
- **Animated LED Perimeter Hoardings**: Real-time moving sponsor signage (*VOLT ENERGY*, *CYBERBOOST*, *AURA SPORTS*, *NEXUS PAY*, *HYPERBOOTS*, *ORBIT AIRWAYS*).
- **Grandstand Seating & Crowds**: Tiered spectator seating with color-coordinated crowd blocks.
- **Corner Flags with Wind Physics**: Fluttering cloth animation.
- **Dynamic Broadcast Camera System**:
  - `TV Broadcast`: Dynamic side tracking with zoom-in inside the penalty boxes.
  - `Tele 3D`: Elevated tactical overview.
  - `End-to-End`: Behind-the-goal vertical field of view.
  - `Pro Cam`: Third-person view following the active player.
  - `Cinematic Orbit & Goal Celebration`: Dramatic close-ups and replay camera angles.

---

### 3. Gameplay Mechanics & Physics Engine
- **3D Ball Aerodynamics**: Substepped gravity, air drag, turf rolling friction, bounce restitution, and goalpost/crossbar collisions with metallic ping audio. Pitch markings align with the goal frames, and a goal counts only after the whole ball crosses the line inside the posts and beneath the bar.
- **Broadcast Commentary**: Spoken match calls with readable on-screen captions for play, saves, goals, and woodwork.
- **Touchline Match Management**: Live substitutions (five per match), a rolling action replay, provisional and full-time Player of the Match ratings, and pause-menu camera/audio settings.
- **Goalkeepers & Goals**: Distinct keeper kits and gloves, predicted diving saves, open goal mouths, and individual net panels.
- **Procedural Player Graphics**: Original 3D footballers with team kits, shirt numbers, varied hair, facial details, and player-scale proportions.
- **Ball Skills & Striking**:
  - **Ground Pass** (`J`): Weighted distribution to a targeted teammate.
  - **Through Ball** (`I`): Threading passes into running space behind defensive lines.
  - **Shoot with Power Gauge** (`K` or `Space`): Hold to charge shot power.
  - **Lofted Cross / Lob** (`L`): High arcing crosses over defender heads.
  - **Skill Move** (`F`): Feint and burst past a nearby defender while carrying the ball.
  - **Tackling** (`J` while defending, or `E`): Standing and sliding tackles.
  - **Player Switching** (`Q` or `Tab`): Instantly switch to teammate nearest to the ball.
  - **Sprint & Stamina**: Left Shift sprint with active stamina depletion and recovery.
- **Goalkeeper AI**:
  - Lateral positioning along goal line based on ball trajectory.
  - Dynamic diving saves (diving low/high, parrying shots wide, catching loose balls).
- **Officiating & Rules**: Out-of-bounds detection, goal verification, scoreboard updates, half-time and full-time whistles.

---

### 4. Ultimate Squad Builder (FUT Style)
- Tactical pitch representation with interactive cards for Starting XI (GK, RB, CB, LB, CDM, CM, CAM, RW, LW, ST).
- Formations: **4-3-3 Attack**, **4-2-3-1 Wide**, **4-4-2 Flat**, **3-5-2 Wingbacks**.
- Full 33/33 chemistry gauge and squad overall rating calculations.
- Substitutes bench with one-click swap mechanics.
- In-depth player inspection card featuring **PAC**, **SHO**, **PAS**, **DRI**, **DEF**, **PHY** attributes and PlayStyle badges.

---

### 5. Career Mode & Presentation Cutscenes
- **Cinematic Signing Scene**: Manager and newly signed superstar holding up the club kit with camera flashbulbs flashing at the stadium.
- **Interactive Press Conference**: Journalists ask tactical questions affecting Team Morale and Board Confidence.
- **Office Hub**: Next fixtures, transfer budget tracking, and board objectives.

---

## 🕹 Controls Reference

| Action | Keyboard | Gamepad (Xbox / PS) |
|---|---|---|
| **Move Player** | `W` `A` `S` `D` or Arrow Keys | Left Analog Stick / D-Pad |
| **Sprint** | `Left Shift` | `RT` / `R2` |
| **Ground Pass / Standing Tackle** | `J` | `A` / `✕` |
| **Shoot (Charge)** | Hold `K` or `Space` | `B` / `○` |
| **Through Ball** | `I` | `Y` / `△` |
| **Lob / Cross / Slide Tackle** | `L` / `E` | `X` / `□` (contextual) |
| **Skill Move** | `F` | `RB` / `R1` |
| **Switch Player** | `Q` or `Tab` | `LB` / `L1` |
| **Pause Match** | `ESC` | `Start` / `Options` |

---

## 🚀 How to Run the Game

1. **Option A (Double-Click)**:
   - Double-click **`run_game.bat`** in the project folder. It starts the local server and opens `http://localhost:3000` automatically in your default browser.

2. **Option B (Node.js)**:
   ```bash
   node server.js
   ```
   Open `http://localhost:3000` in Google Chrome, Microsoft Edge, Firefox, or Safari.

---
*FC 27 Studio — Engineered with Three.js, WebGL, and Web Audio API.*
