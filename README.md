# 🃏 Color Clash — Premium Animated Card Game

**Color Clash** is a modern, high-octane, beautifully animated card battle game inspired by classic UNO. Built with original branding, custom vector card artwork, intelligent heuristic bots, local pass-and-play multiplayer, procedural Web Audio sound synthesis, and real-time online room architecture.

---

## 🌟 Key Features

### 🎮 Game Modes
- **Solo vs Bots (Mode A)**:
  - Play against 1, 2, or 3 AI opponents.
  - Three distinct intelligence tiers:
    - **Easy**: Casual play with randomized legal decisions.
    - **Medium**: Analyzes color frequency in hand and reacts to low card count threats.
    - **Hard**: Full threat mitigation, strategic card hoarding, optimal Wild color selection, and active UNO call interception.
  - Animated bot thinking indicators with contextual status thoughts ("Thinking...", "Choosing color...").
- **Pass & Play Single-Device Multiplayer (Modes B, C, D)**:
  - Support for 2, 3, or 4 human players on the same desktop or mobile device.
  - Automatic hand concealment privacy shield between turns ("Pass device to Player X").
- **Realtime Online Multiplayer**:
  - Private rooms with 6-character room codes (`CLASH9`).
  - Ready indicators, player avatars, host match-start control.
  - Server-side validation ready with Supabase Realtime integration.

### 🎨 Visual & Motion Design
- **Custom Card Artwork**:
  - Original vector glyphs for Numbers (0–9), Skip (⊘), Reverse (⇄), Draw Two (+2), Wild, and Wild Draw Four (+4).
  - High-performance spring physics powered by Framer Motion.
  - Radial parabolic card fan layout with responsive mobile overlap management.
  - Center orbital play direction indicator (Clockwise / Counter-clockwise).
  - Dynamic ambient table glow reflecting the current active color.

### ♿ Accessibility & Comfort
- **Colorblind Mode**: Distinct geometric symbol overlays on all cards:
  - 🔴 Circle = Red
  - 🔺 Triangle = Blue
  - 🟩 Square = Green
  - ◆ Diamond = Yellow
  - ★ Star = Wild
- **Motion Controls**: Normal, Fast, and Reduced-motion modes.

### 🔊 Procedural Audio & Music Engine
- **100% Offline & Royalty-Free**: Built with the browser's native **Web Audio API**. Zero external audio file downloads or missing 404 network assets.
- **Unique Sound Effects**:
  - Crisp card plays, swooshing draws, laser skips, reverse chimes, double-punch Draw Twos, shimmering Wild chords, pulsing UNO alert sirens, and triumphant fanfare victories!
- **Procedural Ambient Arcade Music**:
  - Built-in polyphonic synthesizer playing warm chords, basslines, and gentle arpeggios at 120 BPM.
  - Independent sliders for Master, SFX, and Music volume with global mute.

### 🏆 Statistics & Career Achievements
- Win/loss record, win streaks, total cards played, and color affinity distribution.
- Unlockable achievements (*First Blood*, *On Fire*, *Wild Maestro*, *Uno Police*, *Card Shark*).

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand (persisted stores for Audio, Settings, and Stats)
- **Audio**: Web Audio API (procedural synthesis)
- **Confetti**: Canvas-Confetti
- **Testing**: Vitest
- **Backend / Realtime**: Supabase (`@supabase/supabase-js`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Automated Tests
```bash
npm run test
```
Executes the comprehensive Vitest suite covering standard 108 deck validation, color/symbol matching rules, turn progressions, reshuffle mechanics, and UNO penalty enforcement.

### 4. Production Build
```bash
npm run build
```
Generates optimized, code-split production bundles in `dist/`.

---

## 🌐 Supabase Realtime Setup (Optional for Online Matches)

Solo mode, bot matches, and pass-and-play work 100% out of the box with zero credentials. To enable live multiplayer across remote devices:

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Set your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 📜 Official UNO Rules Implemented

1. **Standard 108-Card Deck**:
   - 4 Colors: Red, Blue, Green, Yellow
   - 1 Zero per color (4 cards)
   - 2 each of 1–9 per color (72 cards)
   - 2 Skip cards per color (8 cards)
   - 2 Reverse cards per color (8 cards)
   - 2 Draw Two cards per color (8 cards)
   - 4 Wild cards
   - 4 Wild Draw Four cards
2. **Reverse in 2-Player Games**: Correctly acts as a Skip, giving the current player another immediate turn.
3. **Reshuffle**: When the draw pile is depleted, the discard pile (excluding the top active card) is automatically shuffled and recycled.
4. **UNO Call**: Players with 1 card must call UNO. Forgetting allows opponents to challenge and inflict a +2 penalty.
5. **Configurable House Rules**:
   - Draw-Card Stacking (+2 on +2, +4 on +4)
   - Seven-Zero Hand Swap & Rotation
   - Jump-In identical card plays
