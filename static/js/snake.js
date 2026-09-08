window.Games = window.Games || {};

window.Games.snake = (function () {
  const COLS = 32;
  const ROWS = 24;
  const CELL = 20;
  const WIDTH = COLS * CELL;
  const HEIGHT = ROWS * CELL;
  const STEP_MS = 100;

  let ctx, canvas;
  let running = false;
  let rafId = null;
  let lastTime = 0;
  let acc = 0;

  let snake, dir, nextDir, food, score, gameOver;

  function reset() {
    snake = [{ x: 10, y: 12 }, { x: 9, y: 12 }, { x: 8, y: 12 }];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    gameOver = false;
    placeFood();
  }

  function placeFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function step() {
    if (gameOver) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      gameOver = true;
      return;
    }
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
    } else {
      snake.pop();
    }
  }

  function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#e33';
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#6f6' : '#3c3';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Score: ' + score, 10, 20);

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

  function loop(time) {
    if (!running) return;
    const dt = time - lastTime;
    lastTime = time;
    acc += dt;
    while (acc >= STEP_MS) {
      step();
      acc -= STEP_MS;
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function onKeyDown(e) {
    const dirMap = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const nd = dirMap[e.code];
    if (nd) {
      e.preventDefault();
      if (!(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
    }
    if (e.code === 'KeyR' && gameOver) reset();
  }

  function start(canvasEl) {
    canvas = canvasEl;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');
    reset();
    running = true;
    lastTime = performance.now();
    acc = 0;
    window.addEventListener('keydown', onKeyDown);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('keydown', onKeyDown);
  }

  return { start, stop, width: WIDTH, height: HEIGHT };
})();
