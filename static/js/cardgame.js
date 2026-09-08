window.Games = window.Games || {};

window.Games.cardGame = (function () {
  const WIDTH = 640;
  const HEIGHT = 480;
  const COLS = 4;
  const ROWS = 4;
  const MARGIN = 20;
  const GAP = 12;
  const TOP_OFFSET = 40;
  const CARD_W = (WIDTH - MARGIN * 2 - GAP * (COLS - 1)) / COLS;
  const CARD_H = (HEIGHT - MARGIN * 2 - GAP * (ROWS - 1) - TOP_OFFSET) / ROWS;

  const SYMBOLS = ['★', '♥', '♦', '♣', '♠', '☀', '☾', '☂'];

  let ctx, canvas;
  let running = false;
  let rafId = null;
  let cards, first, second, moves, matches, lockInput, message;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function reset() {
    const symbols = SYMBOLS.slice(0, (COLS * ROWS) / 2);
    const deck = symbols.concat(symbols);
    shuffle(deck);
    cards = deck.map((sym, i) => ({
      symbol: sym,
      col: i % COLS,
      row: Math.floor(i / COLS),
      flipped: false,
      matched: false,
    }));
    first = null;
    second = null;
    moves = 0;
    matches = 0;
    lockInput = false;
    message = '';
  }

  function cardRect(card) {
    return {
      x: MARGIN + card.col * (CARD_W + GAP),
      y: MARGIN + TOP_OFFSET + card.row * (CARD_H + GAP),
      w: CARD_W,
      h: CARD_H,
    };
  }

  function onClick(e) {
    if (lockInput) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const card = cards.find(c => {
      if (c.matched || c.flipped) return false;
      const r = cardRect(c);
      return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    });
    if (!card) return;

    card.flipped = true;
    if (!first) {
      first = card;
      return;
    }
    second = card;
    moves++;

    if (first.symbol === second.symbol) {
      first.matched = true;
      second.matched = true;
      matches++;
      first = null;
      second = null;
      if (matches === cards.length / 2) {
        message = 'Færdig på ' + moves + ' forsøg!';
      }
    } else {
      lockInput = true;
      setTimeout(() => {
        first.flipped = false;
        second.flipped = false;
        first = null;
        second = null;
        lockInput = false;
      }, 600);
    }
  }

  function onKeyDown(e) {
    if (e.code === 'KeyR') reset();
  }

  function draw() {
    ctx.fillStyle = '#123';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Forsøg: ' + moves, 10, 24);
    ctx.fillText('Par fundet: ' + matches + '/' + (cards.length / 2), 150, 24);

    cards.forEach(card => {
      const r = cardRect(card);
      if (card.matched || card.flipped) {
        ctx.fillStyle = card.matched ? '#2a5' : '#456';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#fff';
        ctx.font = Math.floor(CARD_H * 0.5) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.symbol, r.x + r.w / 2, r.y + r.h / 2);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      } else {
        ctx.fillStyle = '#89c';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    });

    if (message) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(message, WIDTH / 2, HEIGHT / 2);
      ctx.font = '16px monospace';
      ctx.fillText('Tryk R for at starte forfra', WIDTH / 2, HEIGHT / 2 + 30);
      ctx.textAlign = 'start';
    }
  }

  function loop() {
    if (!running) return;
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start(canvasEl) {
    canvas = canvasEl;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');
    reset();
    running = true;
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    canvas.removeEventListener('click', onClick);
    window.removeEventListener('keydown', onKeyDown);
  }

  return { start, stop, width: WIDTH, height: HEIGHT };
})();
