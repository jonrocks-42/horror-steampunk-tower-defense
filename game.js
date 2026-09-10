// Cogsworth's Nightmare - Horror Steampunk Tower Defense Game

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

class Enemy {
    constructor(path, type = 'basic') {
        this.path = path;
        this.pathIndex = 0;
        this.position = new Vector2(path[0].x, path[0].y);
        this.type = type;
        this.health = type === 'basic' ? 30 : type === 'armored' ? 60 : 20;
        this.maxHealth = this.health;
        this.speed = type === 'basic' ? 1 : type === 'armored' ? 0.5 : 1.5;
        this.radius = type === 'basic' ? 8 : type === 'armored' ? 12 : 6;
        this.color = type === 'basic' ? '#DC143C' : type === 'armored' ? '#8B0000' : '#FF6347';
    }

    update() {
        if (this.pathIndex >= this.path.length - 1) {
            return false; // Reached end
        }

        const targetPoint = this.path[this.pathIndex + 1];
        const direction = this.position.direction(targetPoint);
        this.position.x += direction.x * this.speed;
        this.position.y += direction.y * this.speed;

        if (this.position.distance(targetPoint) < this.speed) {
            this.pathIndex++;
        }

        return true;
    }

    draw(ctx) {
        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

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
        const barHeight = 3;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(this.position.x - barWidth / 2, this.position.y - this.radius - 8, barWidth, barHeight);
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(this.position.x - barWidth / 2, this.position.y - this.radius - 8, (this.health / this.maxHealth) * barWidth, barHeight);
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

class Projectile {
    constructor(x, y, target, damage, speed = 3) {
        this.position = new Vector2(x, y);
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.radius = 4;
        this.color = '#F5E6D3';
    }

    update() {
        if (!this.target || this.target.health <= 0) {
            return false;
        }

        const direction = this.position.direction(this.target.position);
        this.position.x += direction.x * this.speed;
        this.position.y += direction.y * this.speed;

        if (this.position.distance(this.target.position) < this.radius + this.target.radius) {
            return false; // Hit
        }

        return true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#DC143C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius + 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Tower {
    constructor(x, y, type = 'gun') {
        this.position = new Vector2(x, y);
        this.type = type;
        this.range = type === 'gun' ? 120 : type === 'tesla' ? 150 : 80;
        this.damage = type === 'gun' ? 15 : type === 'tesla' ? 10 : 25;
        this.fireRate = type === 'gun' ? 30 : type === 'tesla' ? 40 : 20;
        this.cost = type === 'gun' ? 50 : type === 'tesla' ? 75 : 40;
        this.cooldown = 0;
        this.radius = 16;
    }

    draw(ctx) {
        // Draw tower base
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw tower indicator
        ctx.strokeStyle = '#DC143C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw range indicator (faint)
        if (this.cooldown <= 0) {
            ctx.strokeStyle = '#F5E6D3';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw type indicator
        ctx.fillStyle = '#F5E6D3';
        ctx.font = 'bold 10px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let symbol = this.type === 'gun' ? '⚙' : this.type === 'tesla' ? '⚡' : '▲';
        ctx.fillText(symbol, this.position.x, this.position.y);
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
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

        // Game objects
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.path = this.generatePath();
        this.waveTimer = 0;
        this.waveDelay = 120;
        this.enemySpawnCounter = 0;
        this.enemiesPerWave = 5;
        this.waveActive = false;

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
            this.updateUI();
        } else {
            alert('Not enough gears!');
        }
    }

    handleResize() {
        this.width = this.canvas.width = window.innerWidth - 230;
        this.height = this.canvas.height = window.innerHeight - 20;
    }

    spawnWave() {
        if (!this.waveActive) {
            this.waveActive = true;
            this.enemySpawnCounter = 0;
        }
    }

    update() {
        if (this.gameOver) return;

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
                const types = ['basic', 'armored', 'fast'];
                const type = types[Math.floor(Math.random() * types.length)];
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
                    this.projectiles.push(new Projectile(tower.position.x, tower.position.y, target, tower.damage));
                    tower.shoot();
                }
            }
        });

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.update()) {
                projectile.target.takeDamage(projectile.damage);
                if (projectile.target.health <= 0) {
                    this.gears += 10;
                    this.steam += 5;
                    this.enemies = this.enemies.filter(e => e !== projectile.target);
                }
                return false;
            }
            return true;
        });

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

        // Draw path
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

        // Draw path outline for visibility
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

        // Draw cursor preview
        if (this.selectedTower) {
            const tower = new Tower(0, 0, this.selectedTower.split('-')[1]);
            const rect = this.canvas.getBoundingClientRect();
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
    }

    showGameOver() {
        const screen = document.getElementById('gameOverScreen');
        const title = document.getElementById('gameOverTitle');
        const stats = document.getElementById('gameOverStats');
        
        title.textContent = this.lives > 0 ? 'Victory!' : 'Defeat!';
        stats.textContent = `Wave Reached: ${this.wave}\nTowers Built: ${this.towers.length}\nEnemies Destroyed: ${(this.wave * this.enemiesPerWave) - this.enemies.length}`;
        
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
    new Game();
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

// Store game instance globally for mouse tracking
window.addEventListener('load', () => {
    window.game = new Game();
});
