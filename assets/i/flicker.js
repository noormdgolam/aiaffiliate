/* Instrument II — The Flicker --------------------------------------- */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('flicker');

  var IMG_MS = 320;     // how long each version is shown
  var BLANK_MS = 130;   // the global disruption that defeats you
  var CYCLE = (IMG_MS + BLANK_MS) * 2;

  var PALETTE = [
    '#8a5a44', '#c08a3e', '#4f6d70', '#7d8471', '#a8503f', '#3f5a7a',
    '#b09a6b', '#6a5a7a', '#5d7a5f', '#96786a', '#4a4f57', '#c2b49a'
  ];
  var BG = '#08090a';
  var BLANK = '#4a4d52';

  var cv = document.getElementById('stage');
  var cvB = document.getElementById('stage-b');
  var ctx, ctxB, W, H;

  var rects = [];
  var target = null;
  var altColor = '';
  var running = false, solved = false;
  var t0 = 0, raf = null, rafB = null;

  var readout = document.getElementById('readout');
  var tick = document.getElementById('tick');

  /* ------------------------------------------------------------- scene */

  function buildScene(seed) {
    var rand = A.rng(seed);
    var cols = 7, rows = 5;
    var cw = W / cols, ch = H / rows;
    var out = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (rand() < 0.16) continue;                 // leave some cells empty
        var padX = cw * (0.05 + rand() * 0.12);
        var padY = ch * (0.06 + rand() * 0.14);
        var w = cw - padX * 2;
        var h = ch - padY * 2;
        // Occasionally let a block run into the next cell for variety.
        if (rand() < 0.18 && c < cols - 1) w += cw * 0.7;
        if (rand() < 0.12 && r < rows - 1) h += ch * 0.6;
        out.push({
          x: c * cw + padX,
          y: r * ch + padY,
          w: w, h: h,
          color: PALETTE[Math.floor(rand() * PALETTE.length)],
          area: w * h
        });
      }
    }

    // The changed element is deliberately one of the largest on screen.
    var big = out.slice().sort(function (a, b) { return b.area - a.area; });
    target = big[Math.floor(rand() * 4)];

    var idx = PALETTE.indexOf(target.color);
    var alt = (idx + 4 + Math.floor(rand() * 4)) % PALETTE.length;
    altColor = PALETTE[alt];

    return out;
  }

  function paint(context, useAlt, mark) {
    context.fillStyle = BG;
    context.fillRect(0, 0, W, H);

    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      context.fillStyle = (r === target && useAlt) ? altColor : r.color;
      context.fillRect(r.x, r.y, r.w, r.h);
    }

    if (mark) {
      context.strokeStyle = '#64d8bc';
      context.lineWidth = 3;
      context.setLineDash([7, 5]);
      context.strokeRect(target.x - 5, target.y - 5, target.w + 10, target.h + 10);
      context.setLineDash([]);
    }
  }

  function paintBlank(context) {
    context.fillStyle = BLANK;
    context.fillRect(0, 0, W, H);
  }

  /* --------------------------------------------------------------- loop */

  function frame() {
    if (!running) return;
    var elapsed = performance.now() - t0;
    var p = elapsed % CYCLE;

    if (p < IMG_MS) paint(ctx, false, false);
    else if (p < IMG_MS + BLANK_MS) paintBlank(ctx);
    else if (p < IMG_MS * 2 + BLANK_MS) paint(ctx, true, false);
    else paintBlank(ctx);

    var secs = elapsed / 1000;
    var cycles = Math.floor(elapsed / CYCLE);
    tick.textContent = secs.toFixed(1).padStart(4, '0') + ' s · ' + cycles + ' cycles';

    raf = requestAnimationFrame(frame);
  }

  function start() {
    solved = false;
    running = true;
    t0 = performance.now();
    readout.textContent = 'Alternating · find the change';
    document.getElementById('start').disabled = true;
    document.getElementById('give-up').disabled = false;
    frame();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  /* ------------------------------------------------------------ scoring */

  function conclude(found, elapsed, cycles) {
    stop();
    paint(ctx, false, true);
    readout.textContent = found ? 'Located' : 'Not located';
    document.getElementById('give-up').disabled = true;

    A.record('flicker', {
      detected: found,
      seconds: found ? +(elapsed / 1000).toFixed(1) : null,
      cycles: cycles
    });

    document.getElementById('r-outcome').textContent = found ? 'Found it' : 'Gave up';
    document.getElementById('r-time').textContent = found ? (elapsed / 1000).toFixed(1) + ' s' : '—';
    document.getElementById('r-cycles').textContent = cycles;

    var remark;
    if (!found) {
      remark = 'You looked at a block occupying a substantial fraction of the screen, ' +
        'changing colour every few hundred milliseconds, ' + A.times(cycles) + ' over, and did not ' +
        'see it. It was never obscured. It was never off-screen. It was in your visual field the ' +
        'entire time.';
    } else if (elapsed < 4000) {
      remark = 'You found it in ' + (elapsed / 1000).toFixed(1) + ' seconds — quick, and worth being ' +
        'precise about why. You did not perceive the change; you searched for it, item by item, until ' +
        'attention happened to land on the right one. That is the only method available to you here, ' +
        'and it is the method you were using all along.';
    } else {
      remark = 'It took you ' + (elapsed / 1000).toFixed(1) + ' seconds and ' + cycles +
        (cycles === 1 ? ' presentation' : ' presentations') +
        ' of a large object changing colour directly in front of your open eyes. ' +
        'Not a subtle object. Not a peripheral one.';
    }
    document.getElementById('r-remark').textContent = remark;
  }

  cv.addEventListener('click', function (ev) {
    if (!running || solved) return;
    var rect = cv.getBoundingClientRect();
    var x = (ev.clientX - rect.left) * (W / rect.width);
    var y = (ev.clientY - rect.top) * (H / rect.height);
    var hit = x >= target.x - 6 && x <= target.x + target.w + 6 &&
              y >= target.y - 6 && y <= target.y + target.h + 6;
    if (hit) {
      solved = true;
      var elapsed = performance.now() - t0;
      conclude(true, elapsed, Math.floor(elapsed / CYCLE));
      openReveal();
    } else {
      readout.textContent = 'Not that one · keep looking';
    }
  });

  document.getElementById('start').addEventListener('click', start);

  document.getElementById('give-up').addEventListener('click', function () {
    var elapsed = performance.now() - t0;
    conclude(false, elapsed, Math.floor(elapsed / CYCLE));
    openReveal();
  });

  /* ------------------------------------------------- control condition */

  function openReveal() {
    var block = document.getElementById('reveal-block');
    block.classList.add('active');
    ctxB = A.fitCanvas(cvB, W, H);

    var startB = performance.now();
    (function loopB() {
      var alt = Math.floor((performance.now() - startB) / 500) % 2 === 1;
      paint(ctxB, alt, false);
      rafB = requestAnimationFrame(loopB);
    })();

    block.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('to-finding').addEventListener('click', function () {
    if (rafB) cancelAnimationFrame(rafB);
    A.reveal('finding');
  });

  /* --------------------------------------------------------------- init */

  function measure() {
    var stage = cv.parentElement;
    W = Math.max(300, Math.min(stage.clientWidth, 860));
    H = Math.round(W * 0.58);
    ctx = A.fitCanvas(cv, W, H);
  }

  measure();
  rects = buildScene(Math.floor(Math.random() * 1e9));
  paint(ctx, false, false);
})();
