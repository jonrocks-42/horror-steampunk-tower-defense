# 🎮 Cogsworth's Nightmare - Horror Steampunk Tower Defense

A browser-based tower defense game with a dark steampunk horror aesthetic. Defend against waves of mechanical nightmares using strategically placed automated defense systems.

## 🎨 Design Principles

**Three-Color Palette:** Red (#DC143C / #8B0000), Black (#1a1a1a), and Cream (#F5E6D3)
- Creates a cohesive horror steampunk atmosphere
- Maintains visual clarity and accessibility
- Evokes Victorian-era industrial dread

**Steampunk Theme:** 
- Gears and steam as primary resources
- Mechanical enemies with cogs and pistons
- Brass and iron defense towers
- Clockwork aesthetic throughout

**Horror Elements:**
- Creeping dread through ambient design
- Grotesque mechanical creatures
- High-stakes wave survival
- Dark, ominous environments

## 🎮 Gameplay

### Objective
Survive increasingly difficult waves of horrific mechanical creatures by building and upgrading defense towers along the path.

### Controls
- **Click on canvas** to place towers
- **Select tower type** from the menu on the right
- **Monitor resources** in the top bar

### Resources

**Gears** 💰
- Primary currency for building towers
- Earned by defeating enemies
- Starting amount: 100

**Steam** 🌫️
- Secondary resource for future upgrades
- Earned alongside gears from enemy defeats
- Starting amount: 50

**Lives** ❤️
- Number of enemies allowed to escape
- Starting lives: 20
- Game ends when lives reach 0

### Tower Types

#### Gun Turret ⚙️
- **Cost:** 50 Gears
- **Damage:** 15
- **Range:** 120 pixels
- **Fire Rate:** Fast (30 frames)
- Best for consistent, reliable damage

#### Tesla Coil ⚡
- **Cost:** 75 Gears
- **Damage:** 10
- **Range:** 150 pixels (longest range)
- **Fire Rate:** Slow (40 frames)
- Best for controlling large groups

#### Spike Trap ▲
- **Cost:** 40 Gears
- **Damage:** 25 (highest damage)
- **Range:** 80 pixels (shortest range)
- **Fire Rate:** Medium (20 frames)
- Best for high-damage single targets

### Enemy Types

**Basic Crawler** 🔴
- Standard enemy
- 30 Health
- Normal speed
- Most common

**Armored Behemoth** 🔺
- Heavily armored threat
- 60 Health (double damage)
- Slow speed
- Rare, dangerous

**Fast Wraith** ⚡
- Quick mechanical spirit
- 20 Health (fragile)
- Very fast
- Difficult to track

### Wave Progression
- Each wave spawns 5 enemies initially
- Waves increase by 2 enemies each time
- Enemies spawn at regular intervals during the wave
- Complete a wave to earn bonus Gears and Steam
- Next wave begins automatically after delay

## 🚀 How to Play

1. **Open** `index.html` in a web browser
2. **Select a tower type** from the right panel
3. **Click on the canvas** to place towers along the enemy path
4. **Watch the enemies** travel down the path
5. **Your towers automatically target** enemies in range
6. **Survive all waves** to win!

### Tips & Strategies

- **Plan ahead:** Place towers to cover the entire path
- **Mix tower types:** Combine different towers for better coverage
- **Resource management:** Don't spend all gears early; save for later waves
- **Range awareness:** Watch the range indicators when placing towers
- **Early defense:** Place towers quickly before the first wave spawns

## 📊 Game Statistics

Track your performance:
- Current wave number
- Gears and Steam collected
- Remaining lives
- Game over screen shows:
  - Final wave reached
  - Total towers built
  - Enemies destroyed

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (ES6+)
- **CSS3** for UI styling
- **No external dependencies** (pure implementation)

### File Structure
```
├── index.html      # Main game page
├── styles.css      # Three-color themed styling
├── game.js         # Core game logic and classes
└── README.md       # This file
```

### Key Classes

- **Game:** Main game loop and state management
- **Tower:** Defense structure with targeting logic
- **Enemy:** AI-controlled adversaries following the path
- **Projectile:** Bullets/energy shots from towers
- **Vector2:** 2D math utilities for positioning

## 🎯 Future Enhancements

Potential features for expansion:
- [ ] Tower upgrade system (using Steam)
- [ ] Special abilities and power-ups
- [ ] Boss enemies at wave milestones
- [ ] Sound effects and atmospheric audio
- [ ] Particle effects for explosions
- [ ] Multiple maps with different paths
- [ ] Difficulty settings
- [ ] Leaderboard/score persistence
- [ ] Tower selling and repositioning
- [ ] Enemy status effects (poison, slow)

## 📜 License

This project is open source and available for modification and distribution.

## 🎭 Game Feel

The game creates an atmosphere of dread and tension:
- Ominous dark backgrounds with glowing red accents
- Grotesque mechanical enemy designs
- Satisfying tower-placement feedback
- Escalating challenge as waves progress
- The constant threat of enemies breaking through your defenses

Survive Cogsworth's Nightmare... if you can.

---

**Play now by opening `index.html` in your browser!**
