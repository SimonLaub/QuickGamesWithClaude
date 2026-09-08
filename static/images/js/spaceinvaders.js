window.Games = window.Games || {};

window.Games.spaceInvaders = (function () {
  const WIDTH = 640;
  const HEIGHT = 480;

  let ctx, canvas;
  let running = false;
  let rafId = null;
  let keys = {};

  let player, bullets, enemies, enemyBullets, score, lives, enemyDir, gameOver;

  function reset() {
    player = { x: WIDTH / 2 - 20, y: HEIGHT - 40, w: 40, h: 16, speed: 5, cooldown: 0 };
    bullets = [];
    enemyBullets = [];
    enemies = [];
    const cols = 8, rows = 4;
    const spacingX = 60, spacingY = 40;
    const offsetX = (WIDTH - cols * spacingX) / 2;
    const offsetY = 40;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: offsetX + c * spacingX,
          y: offsetY + r * spacingY,
          w: 30, h: 20,
          alive: true,
        });
      }
    }
    enemyDir = 1;
    score = 0;
    lives = 3;
    gameOver = false;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function update() {
    if (gameOver) return;

    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;
    player.x = Math.max(0, Math.min(WIDTH - player.w, player.x));

    if (keys['Space'] && player.cooldown <= 0) {
      bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 10 });
      player.cooldown = 10;
    }
    if (player.cooldown > 0) player.cooldown--;

    bullets.forEach(b => b.y -= 8);
    bullets = bullets.filter(b => b.y + b.h > 0);

    let hitEdge = false;
    enemies.forEach(en => {
      if (!en.alive) return;
      en.x += enemyDir * 1.2;
      if (en.x <= 0 || en.x + en.w >= WIDTH) hitEdge = true;
    });
    if (hitEdge) {
      enemyDir *= -1;
      enemies.forEach(en => { en.y += 16; });
    }

    enemies.forEach(en => {
      if (!en.alive) return;
      if (Math.random() < 0.002) {
        enemyBullets.push({ x: en.x + en.w / 2 - 2, y: en.y + en.h, w: 4, h: 10 });
      }
    });
    enemyBullets.forEach(b => b.y += 4);
    enemyBullets = enemyBullets.filter(b => b.y < HEIGHT);

    bullets.forEach(b => {
      enemies.forEach(en => {
        if (en.alive && rectsOverlap(b, en)) {
          en.alive = false;
          b.hit = true;
          score += 10;
        }
      });
    });
    bullets = bullets.filter(b => !b.hit);

    enemyBullets.forEach(b => {
      if (rectsOverlap(b, player)) {
        b.hit = true;
        lives -= 1;
      }
    });
    enemyBullets = enemyBullets.filter(b => !b.hit);

    if (lives <= 0) gameOver = true;
    if (enemies.some(en => en.alive && en.y + en.h >= player.y)) gameOver = true;
    if (enemies.every(en => !en.alive)) reset();
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = '#fff';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    ctx.fillStyle = '#f55';
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    ctx.fillStyle = '#5cf';
    enemies.forEach(en => { if (en.alive) ctx.fillRect(en.x, en.y, en.w, en.h); });

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Liv: ' + lives, WIDTH - 80, 20);

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '28px monospace';
      ctx.fillText('GAME OVER', WIDTH / 2 - 100, HEIGHT / 2);
      ctx.font = '16px monospace';
      ctx.fillText('Tryk R for at starte forfra', WIDTH / 2 - 110, HEIGHT / 2 + 30);
    }
  }

  function loop() {
    if (!running) return;
    if (gameOver && keys['KeyR']) reset();
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function onKeyDown(e) {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
  }
  function onKeyUp(e) {
    keys[e.code] = false;
  }

  function start(canvasEl) {
    canvas = canvasEl;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');
    keys = {};
    reset();
    running = true;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  return { start, stop, width: WIDTH, height: HEIGHT };
})();
