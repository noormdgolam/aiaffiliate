/* Instrument V — The Clock ------------------------------------------- */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('clock');

  var PERIOD = 2560;        // ms per revolution, as in Libet 1983
  var TRIALS = 5;
  var ARM_AFTER = 2600;     // one full revolution before a press counts

  var SIZE = 260;
  var cv = document.getElementById('dial');
  var ctx = A.fitCanvas(cv, SIZE, SIZE);

  var mode = 'idle';        // idle | running | reporting | done
  var t0 = 0, raf = null;
  var pressAngle = null;
  var trial = 0;
  var deltas = [];

  var readout = document.getElementById('readout');
  var hint = document.getElementById('hint');
  var beginBtn = document.getElementById('begin');
  var pressBtn = document.getElementById('press');
  var tally = document.getElementById('tally');

  var cx = SIZE / 2, cy = SIZE / 2, R = SIZE * 0.38;

  /* ---------------------------------------------------------- drawing */

  function drawFace() {
    ctx.fillStyle = '#08090a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.strokeStyle = '#26282c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Twelve marks, as on Libet's oscilloscope face.
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      var inner = R * (i % 3 === 0 ? 0.88 : 0.93);
      ctx.strokeStyle = i % 3 === 0 ? '#5c5850' : '#33363a';
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }

    ctx.fillStyle = '#33363a';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDot(angle, colour, radius) {
    var a = angle - Math.PI / 2;
    var x = cx + Math.cos(a) * R;
    var y = cy + Math.sin(a) * R;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, radius || 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function angleNow() {
    return ((performance.now() - t0) % PERIOD) / PERIOD * Math.PI * 2;
  }

  function frame() {
    if (mode !== 'running') return;
    drawFace();
    drawDot(angleNow(), '#64d8bc');

    var elapsed = performance.now() - t0;
    if (elapsed >= ARM_AFTER && pressBtn.disabled) {
      pressBtn.disabled = false;
      hint.textContent = 'Press whenever the impulse arrives — spacebar or the button';
      hint.style.color = 'var(--phosphor)';
    }
    raf = requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ trials */

  function beginTrial() {
    mode = 'running';
    pressAngle = null;
    t0 = performance.now();
    pressBtn.disabled = true;
    beginBtn.disabled = true;
    hint.style.color = '';
    hint.textContent = 'Let it complete one revolution first…';
    readout.textContent = 'Trial ' + (trial + 1) + ' / ' + TRIALS + ' · running';
    frame();
  }

  function doPress() {
    if (mode !== 'running' || pressBtn.disabled) return;
    pressAngle = angleNow();
    mode = 'reporting';
    if (raf) cancelAnimationFrame(raf);

    drawFace();
    drawDot(pressAngle, '#d9a441', 5);

    pressBtn.disabled = true;
    readout.textContent = 'Trial ' + (trial + 1) + ' / ' + TRIALS + ' · report W';
    hint.innerHTML = 'Click the dial where the dot was <em>when you first felt the urge</em>';
    hint.style.color = 'var(--amber)';
    cv.style.cursor = 'crosshair';
  }

  function reportW(ev) {
    if (mode !== 'reporting') return;
    var rect = cv.getBoundingClientRect();
    var x = (ev.clientX - rect.left) * (SIZE / rect.width) - cx;
    var y = (ev.clientY - rect.top) * (SIZE / rect.height) - cy;
    var wAngle = Math.atan2(y, x) + Math.PI / 2;
    if (wAngle < 0) wAngle += Math.PI * 2;

    // Shortest signed angular distance from the press to the report.
    var d = wAngle - pressAngle;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    var deltaMs = d / (Math.PI * 2) * PERIOD;   // negative = awareness before press

    deltas.push(deltaMs);
    trial++;

    drawFace();
    drawDot(pressAngle, '#d9a441', 5);
    drawDot(wAngle, '#e9e4d8', 5);

    tally.textContent = trial + ' of ' + TRIALS + ' recorded';
    cv.style.cursor = '';

    if (trial >= TRIALS) {
      mode = 'done';
      readout.textContent = 'Series complete';
      hint.textContent = 'Amber = the press. Bone = where you say awareness was.';
      hint.style.color = '';
      beginBtn.disabled = true;
      A.show('s-done');
      document.getElementById('s-done').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      mode = 'idle';
      beginBtn.disabled = false;
      beginBtn.textContent = 'Begin trial ' + (trial + 1);
      readout.textContent = 'Trial ' + (trial + 1) + ' / ' + TRIALS + ' · standing by';
      hint.textContent = 'Amber = the press. Bone = your reported awareness. Begin when ready.';
      hint.style.color = '';
    }
  }

  /* ---------------------------------------------------------- analysis */

  document.getElementById('analyse').addEventListener('click', function () {
    var n = deltas.length;
    var mean = deltas.reduce(function (a, b) { return a + b; }, 0) / n;
    var min = Math.min.apply(null, deltas);
    var max = Math.max.apply(null, deltas);
    var spread = max - min;

    A.record('clock', {
      trials: deltas.map(function (d) { return Math.round(d); }),
      meanMs: Math.round(mean),
      spreadMs: Math.round(spread)
    });

    document.getElementById('r-mean').textContent =
      (mean < 0 ? '−' : '+') + Math.abs(Math.round(mean)) + ' ms';
    document.getElementById('r-spread').textContent = Math.round(spread) + ' ms';
    document.getElementById('r-n').textContent = n;

    var remark;
    var m = Math.round(Math.abs(mean));
    if (mean < 0) {
      remark = 'You place the arrival of the intention ' + m + ' ms before the press itself, ' +
        'and your five reports differ from one another by as much as ' + Math.round(spread) +
        ' ms. Libet’s subjects averaged about 200 ms. Whatever number you produced, hold on to ' +
        'the second figure: that is the resolution of the instrument you were using, and the ' +
        'instrument was you.';
    } else {
      remark = 'You place your awareness of the intention ' + m + ' ms <em>after</em> the press — ' +
        'the movement first, the knowledge of wanting it second. That ordering is not a mistake ' +
        'to be corrected; several careful studies find exactly this, which is itself the point. ' +
        'Your reports also varied across trials by ' + Math.round(spread) + ' ms.';
    }
    document.getElementById('r-remark').innerHTML = remark;

    A.reveal('finding');
  });

  /* ------------------------------------------------------------ wiring */

  beginBtn.addEventListener('click', beginTrial);
  pressBtn.addEventListener('click', doPress);
  cv.addEventListener('click', reportW);

  document.addEventListener('keydown', function (ev) {
    if (ev.code === 'Space' || ev.key === ' ') {
      if (mode === 'running' && !pressBtn.disabled) {
        ev.preventDefault();
        doPress();
      } else if (mode === 'idle' && !beginBtn.disabled) {
        ev.preventDefault();
        beginTrial();
      }
    }
  });

  drawFace();
})();
