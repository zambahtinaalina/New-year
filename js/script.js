
(function () {
  const canvas = document.getElementById('snow');
  if (!canvas) return;

  // Дублируем на всякий случай inline-стилем (чтобы никакой CSS не перебил)
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';

  const ctx = canvas.getContext('2d', { alpha: true });

  let w = 0, h = 0, flakes = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function rnd(min, max){ return Math.random() * (max - min) + min; }

  function resize() {
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeFlake() {
    return {
      x: rnd(0, w),
      y: rnd(-h, 0),
      r: rnd(0.8, 3.0),
      vx: rnd(-0.4, 0.4),
      vy: rnd(0.7, 2.3),
      a: rnd(0.35, 0.9),
      phase: rnd(0, Math.PI * 2),
      sway: rnd(0.6, 2.0),
    };
  }

  function init() {
    const count = Math.min(200, Math.floor(w / 7)); // не грузим мобилки
    flakes = Array.from({ length: count }, makeFlake);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let f of flakes) {
      f.phase += 0.012 * f.sway;
      f.x += f.vx + Math.sin(f.phase) * 0.35;
      f.y += f.vy;

      if (f.y > h + 10) { f.y = -10; f.x = rnd(0, w); }
      if (f.x > w + 10) f.x = -10;
      if (f.x < -10) f.x = w + 10;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${f.a})`;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 1) Рисуем на rAF (плавно)
  let rafId = 0;
  function rafLoop() {
    draw();
    rafId = requestAnimationFrame(rafLoop);
  }

  // 2) И параллельно лёгкий таймер (на случай “заморозки” во время скролла)
  let timerId = 0;
  function startTimerFallback() {
    if (timerId) return;
    timerId = setInterval(draw, 40); // 25fps — достаточно для снега
  }
  function stopTimerFallback() {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = 0;
  }

  resize();
  init();
  rafLoop();
  startTimerFallback();

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });

  // если вкладка неактивна — не жрём ресурсы
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      stopTimerFallback();
    } else {
      if (!rafId) rafLoop();
      startTimerFallback();
    }
  });
})();
  