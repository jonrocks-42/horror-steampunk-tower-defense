// Cogsworth's Nightmare - Enhanced Horror Steampunk Tower Defense Game

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    direction(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        return new Vector2(dx / length, dy / length);
    }
}

class Particle {
    constructor(x, y, vx, vy, color, life = 30) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = 3;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.life--;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Enemy {
    constructor(path, type = 'basic') {
        this.path = path;
        this.pathIndex = 0;
        this.position = new Vector2(path[0].x, path[0].y);
        this.type = type;
        
        // Enhanced enemy properties
        const stats = {
            basic: { health: 30, speed: 1, radius: 8, color: '#DC143C', armor: 0, bounty: 10 },
            armored: { health: 60, speed: 0.5, radius: 12, color: '#8B0000', armor: 5, bounty: 25 },
            fast: { health: 20, speed: 1.8, radius: 6, color: '#FF6347', armor: 0, bounty: 15 },
            elite: { health: 90, speed: 0.7, radius: 14, color: '#4B0000', armor: 8, bounty: 50 },
            spectral: { health: 25, speed: 1.2, radius: 7, color: '#DC143C', armor: 0, bounty: 20 }
        };

        const stat = stats[type] || stats.basic;
        this.health = stat.health;
        this.maxHealth = stat.health;
        this.speed = stat.speed;
        this.radius = stat.radius;
        this.color = stat.color;
        this.armor = stat.armor;
        this.bounty = stat.bounty;
        
        this.rotation = 0;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05;
        this.stunTime = 0;
    }

    update() {
        if (this.stunTime > 0) {
            this.stunTime--;
            return true;
        }

        if (this.pathIndex >= this.path.length - 1) {
            return false;
        }

        const targetPoint = this.path[this.pathIndex + 1];
        const direction = this.position.direction(targetPoint);
        
        const actualSpeed = this.speed * (this.stunTime > 0 ? 0 : 1);
        this.position.x += direction.x * actualSpeed;
        this.position.y += direction.y * actualSpeed;

        if (this.position.distance(targetPoint) < actualSpeed) {
            this.pathIndex++;
        }

        this.rotation += 0.1;
        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        // Draw outer shell
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw gear details
        ctx.strokeStyle = '#F5E6D3';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * (this.radius - 2);
            const y = Math.sin(angle) * (this.radius - 2);
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw center cog
        ctx.fillStyle = '#F5E6D3';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw eye glow for spectral type
        if (this.type === 'spectral') {
            ctx.fillStyle = '#FF0000';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(-this.radius * 0.3, -this.radius * 0.2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.radius * 0.3, -this.radius * 0.2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();

        // Draw glow
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw health bar
        const barWidth = this.radius * 2;
        const barHeight = 4;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(this.position.x - barWidth / 2, this.position.y - this.radius - 10, barWidth, barHeight);
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(this.position.x - barWidth / 2, this.position.y - this.radius - 10, (this.health / this.maxHealth) * barWidth, barHeight);

        // Draw armor indicator if present
        if (this.armor > 0) {
            ctx.fillStyle = '#D2B48C';
            ctx.font = 'bold 8px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚔', this.position.x, this.position.y - this.radius - 16);
        }
    }

    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.armor);
        this.health -= actualDamage;
        return this.health <= 0;
    }

    stun(duration) {
        this.stunTime = duration;
    }
}

class Projectile {
    constructor(x, y, target, damage, speed = 3, type = 'bullet') {
        this.position = new Vector2(x, y);
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.radius = 4;
        this.color = '#F5E6D3';
        this.type = type;
        this.trail = [];
        this.rotation = 0;
    }

    update() {
        if (!this.target || this.target.health <= 0) {
            return false;
        }

        const direction = this.position.direction(this.target.position);
        this.position.x += direction.x * this.speed;
        this.position.y += direction.y * this.speed;

        // Add trail
        this.trail.push(new Vector2(this.position.x, this.position.y));
        if (this.trail.length > 8) this.trail.shift();

        this.rotation += 0.2;

        if (this.position.distance(this.target.position) < this.radius + this.target.radius) {
            return false;
        }

        return true;
    }

    draw(ctx) {
        // Draw trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        if (this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw projectile
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        if (this.type === 'bullet') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#DC143C';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'tesla') {
            // Draw lightning bolt shape
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -this.radius * 2);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(-this.radius * 0.5, this.radius);
            ctx.lineTo(this.radius, this.radius * 0.5);
            ctx.lineTo(this.radius * 0.5, -this.radius);
            ctx.lineTo(0, -this.radius * 2);
            ctx.stroke();
        } else if (this.type === 'spike') {
            // Draw spike
            ctx.fillStyle = '#8B0000';
            ctx.beginPath();
            ctx.moveTo(0, -this.radius * 2);
            ctx.lineTo(-this.radius, this.radius * 1.5);
            ctx.lineTo(this.radius, this.radius * 1.5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

class Tower {
    constructor(x, y, type = 'gun') {
        this.position = new Vector2(x, y);
        this.type = type;
        
        const stats = {
            gun: { range: 120, damage: 15, fireRate: 30, cost: 50 },
            tesla: { range: 150, damage: 10, fireRate: 40, cost: 75 },
            spike: { range: 80, damage: 25, fireRate: 20, cost: 40 }
        };

        const stat = stats[type] || stats.gun;
        this.range = stat.range;
        this.damage = stat.damage;
        this.fireRate = stat.fireRate;
        this.cost = stat.cost;
        this.cooldown = 0;
        this.radius = 16;
        this.level = 1;
        this.kills = 0;
        this.rotation = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Draw tower base
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw rotating turret
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(-4, -this.radius - 4, 8, this.radius + 4);

        ctx.restore();

        // Draw tower indicator
        ctx.strokeStyle = '#DC143C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw level indicator
        ctx.fillStyle = '#F5E6D3';
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let symbol = this.type === 'gun' ? '⚙' : this.type === 'tesla' ? '⚡' : '▲';
        ctx.fillText(symbol, this.position.x, this.position.y);

        // Draw range indicator (faint)
        if (this.cooldown <= 0) {
            ctx.strokeStyle = '#F5E6D3';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        this.rotation += 0.02;
    }

    canShoot() {
        return this.cooldown <= 0;
    }

    shoot() {
        this.cooldown = this.fireRate;
    }

    getTargetsInRange(enemies) {
        return enemies.filter(enemy => 
            this.position.distance(enemy.position) < this.range
        );
    }

    upgrade() {
        this.level++;
        this.damage *= 1.2;
        this.fireRate = Math.max(5, this.fireRate - 2);
        this.range *= 1.15;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = window.innerWidth - 230;
        this.height = this.canvas.height = window.innerHeight - 20;

        // Game state
        this.gears = 100;
        this.steam = 50;
        this.lives = 20;
        this.wave = 1;
        this.gameOver = false;
        this.selectedTower = null;
        this.score = 0;

        // Game objects
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.path = this.generatePath();
        this.waveTimer = 0;
        this.waveDelay = 120;
        this.enemySpawnCounter = 0;
        this.enemiesPerWave = 5;
        this.waveActive = false;
        this.frameCount = 0;

        this.setupEventListeners();
        this.gameLoop();
    }

    generatePath() {
        return [
            new Vector2(0, this.height / 2),
            new Vector2(this.width * 0.25, this.height * 0.3),
            new Vector2(this.width * 0.5, this.height * 0.7),
            new Vector2(this.width * 0.75, this.height * 0.2),
            new Vector2(this.width, this.height / 2)
        ];
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedTower = e.target.dataset.tower;
                document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
        document.getElementById('restartBtn').addEventListener('click', () => location.reload());
        window.addEventListener('resize', () => this.handleResize());
    }

    handleCanvasClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!this.selectedTower) {
            alert('Select a tower first!');
            return;
        }

        const towerTypes = { gun: 'gun', tesla: 'tesla', spike: 'spike' };
        const tower = new Tower(x, y, towerTypes[this.selectedTower]);

        if (this.gears >= tower.cost) {
            this.towers.push(tower);
            this.gears -= tower.cost;
            this.createExplosion(x, y, '#DC143C', 10);
            this.updateUI();
        } else {
            alert('Not enough gears!');
        }
    }

    handleResize() {
        this.width = this.canvas.width = window.innerWidth - 230;
        this.height = this.canvas.height = window.innerHeight - 20;
    }

    createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            this.particles.push(new Particle(x, y, vx, vy, color, 30));
        }
    }

    spawnWave() {
        if (!this.waveActive) {
            this.waveActive = true;
            this.enemySpawnCounter = 0;
        }
    }

    update() {
        if (this.gameOver) return;

        this.frameCount++;

        // Wave management
        if (!this.waveActive) {
            this.waveTimer++;
            if (this.waveTimer >= this.waveDelay) {
                this.spawnWave();
                this.waveTimer = 0;
            }
        }

        // Spawn enemies
        if (this.waveActive && this.enemySpawnCounter < this.enemiesPerWave) {
            if (this.waveTimer % 30 === 0) {
                const types = ['basic', 'armored', 'fast', 'spectral'];
                let type = types[Math.floor(Math.random() * types.length)];
                
                // Elite enemies on later waves
                if (this.wave > 5 && Math.random() < 0.2) {
                    type = 'elite';
                }
                
                this.enemies.push(new Enemy(this.path, type));
                this.enemySpawnCounter++;
            }
            this.waveTimer++;
        }

        if (this.waveActive && this.enemies.length === 0 && this.enemySpawnCounter >= this.enemiesPerWave) {
            this.waveActive = false;
            this.waveTimer = 0;
            this.wave++;
            this.enemiesPerWave += 2;
            this.gears += 50;
            this.steam += 20;
        }

        // Update towers
        this.towers.forEach(tower => tower.update());

        // Update and draw enemies
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.update()) {
                this.lives--;
                this.createExplosion(enemy.position.x, enemy.position.y, '#FF6347', 15);
                return false;
            }
            return true;
        });

        // Tower targeting and shooting
        this.towers.forEach(tower => {
            if (tower.canShoot()) {
                const targets = tower.getTargetsInRange(this.enemies);
                if (targets.length > 0) {
                    const target = targets[0];
                    const projectileType = tower.type === 'gun' ? 'bullet' : tower.type === 'tesla' ? 'tesla' : 'spike';
                    this.projectiles.push(new Projectile(tower.position.x, tower.position.y, target, tower.damage, 3, projectileType));
                    tower.shoot();
                }
            }
        });

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.update()) {
                const killed = projectile.target.takeDamage(projectile.damage);
                
                this.createExplosion(projectile.target.position.x, projectile.target.position.y, '#FFD700', 8);
                
                if (killed) {
                    this.gears += projectile.target.bounty;
                    this.steam += Math.floor(projectile.target.bounty / 2);
                    this.score += projectile.target.bounty;
                    
                    // Find tower that fired this projectile and increment kills
                    for (let tower of this.towers) {
                        if (tower.position.distance(projectile.position) < tower.range) {
                            tower.kills++;
                            break;
                        }
                    }
                    
                    this.enemies = this.enemies.filter(e => e !== projectile.target);
                }
                return false;
            }
            return true;
        });

        // Update particles
        this.particles = this.particles.filter(p => p.update());

        if (this.lives <= 0) {
            this.gameOver = true;
            this.showGameOver();
        }

        this.updateUI();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw animated background grid
        this.ctx.strokeStyle = '#8B0000';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.05;
        const gridSize = 40;
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;

        // Draw path with glow
        this.ctx.shadowColor = '#DC143C';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = '#D2B48C';
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        this.ctx.shadowColor = 'transparent';

        // Draw path outline
        this.ctx.strokeStyle = '#8B0000';
        this.ctx.lineWidth = 42;
        this.ctx.globalAlpha = 0.2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;

        // Draw towers
        this.towers.forEach(tower => tower.draw(this.ctx));

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw projectiles
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw cursor preview
        if (this.selectedTower) {
            const towerMap = { 'tower-gun': 'gun', 'tower-tesla': 'tesla', 'tower-spike': 'spike' };
            const towerType = towerMap[this.selectedTower] || 'gun';
            const tower = new Tower(0, 0, towerType);
            tower.position.x = this.lastMouseX || this.width / 2;
            tower.position.y = this.lastMouseY || this.height / 2;
            this.ctx.globalAlpha = 0.5;
            tower.draw(this.ctx);
            this.ctx.globalAlpha = 1;
        }
    }

    updateUI() {
        document.getElementById('gearCount').textContent = Math.floor(this.gears);
        document.getElementById('steamCount').textContent = Math.floor(this.steam);
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('waveNumber').textContent = this.wave;
        document.getElementById('score').textContent = this.score;
    }

    showGameOver() {
        const screen = document.getElementById('gameOverScreen');
        const title = document.getElementById('gameOverTitle');
        const stats = document.getElementById('gameOverStats');
        
        title.textContent = this.lives > 0 ? 'Victory!' : 'Defeat!';
        stats.textContent = `Score: ${this.score}\nWave Reached: ${this.wave}\nTowers Built: ${this.towers.length}\nEnemies Destroyed: ${(this.wave * this.enemiesPerWave) - this.enemies.length}`;
        
        screen.classList.remove('hidden');
    }

    gameLoop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }
}

// Start game
window.addEventListener('load', () => {
    window.game = new Game();
});

// Track mouse for cursor preview
document.addEventListener('mousemove', (e) => {
    const game = window.game;
    if (game) {
        const rect = game.canvas.getBoundingClientRect();
        game.lastMouseX = e.clientX - rect.left;
        game.lastMouseY = e.clientY - rect.top;
    }
});
