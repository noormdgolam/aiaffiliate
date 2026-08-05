/* Instrument I — The Blind Spot ------------------------------------- */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('blind-spot');

  var W = 0, H = 300;
  var eye = 'right';          // the eye left uncovered
  var sep = 230;              // px between fixation cross and target
  var state = { vanished: null, filled: null, sep: null };

  var cvA = document.getElementById('stage');
  var cvB = document.getElementById('stage-b');
  var ctxA, ctxB;

  var INK = '#e9e4d8';
  var BG = '#08090a';
  var PHOS = '#64d8bc';

  function measure() {
    var stage = cvA.parentElement;
    W = Math.max(320, Math.min(stage.clientWidth, 900));
    ctxA = A.fitCanvas(cvA, W, H);
    if (cvB) ctxB = A.fitCanvas(cvB, W, H);
  }

  /* For the right eye the blind spot lies to the RIGHT of fixation, so the
     cross goes left and the target goes right. Mirrored for the left eye. */
  function geometry() {
    var dir = (eye === 'right') ? 1 : -1;
    var cx = W / 2, cy = H / 2;
    return {
      crossX: cx - dir * sep / 2,
      targetX: cx + dir * sep / 2,
      y: cy
    };
  }

  function drawCross(ctx, x, y) {
    ctx.strokeStyle = PHOS;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y);
    ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9);
    ctx.stroke();
  }

  /* Stage 1: a plain disc that will disappear. */
  function drawLocate() {
    var g = geometry();
    ctxA.fillStyle = BG;
    ctxA.fillRect(0, 0, W, H);

    drawCross(ctxA, g.crossX, g.y);

    ctxA.fillStyle = INK;
    ctxA.beginPath();
    ctxA.arc(g.targetX, g.y, 15, 0, Math.PI * 2);
    ctxA.fill();
  }

  /* Stage 2: a ruled field with a disc of it removed. If the removed disc
     lands on the blind spot, the ruling is perceived as continuous. */
  function drawComplete() {
    if (!ctxB) return;
    var g = geometry();

    ctxB.fillStyle = BG;
    ctxB.fillRect(0, 0, W, H);

    ctxB.strokeStyle = '#5d6672';
    ctxB.lineWidth = 3;
    ctxB.beginPath();
    for (var y = 14; y < H; y += 18) {
      ctxB.moveTo(0, y);
      ctxB.lineTo(W, y);
    }
    ctxB.stroke();

    // Punch the hole.
    ctxB.fillStyle = BG;
    ctxB.beginPath();
    ctxB.arc(g.targetX, g.y, 26, 0, Math.PI * 2);
    ctxB.fill();

    drawCross(ctxB, g.crossX, g.y);
  }

  function redraw() {
    drawLocate();
    drawComplete();
  }

  /* ------------------------------------------------------------ controls */

  var sepInput = document.getElementById('sep');
  var sepVal = document.getElementById('sep-val');

  sepInput.addEventListener('input', function () {
    sep = parseInt(sepInput.value, 10);
    sepVal.textContent = sep;
    redraw();
  });

  document.getElementById('eye-toggle').addEventListener('click', function () {
    eye = (eye === 'right') ? 'left' : 'right';
    this.textContent = 'Switch to ' + (eye === 'right' ? 'left' : 'right') + ' eye';
    document.getElementById('cover-eye').textContent = (eye === 'right') ? 'left' : 'right';
    document.getElementById('use-eye').textContent = eye;
    document.getElementById('target-side').textContent = (eye === 'right') ? 'right' : 'left';
    redraw();
  });

  function toStage2(didVanish) {
    state.vanished = didVanish;
    state.sep = didVanish ? sep : null;
    state.eye = eye;
    document.getElementById('readout').textContent = 'Stage 1 complete';
    document.getElementById('stage2').classList.add('active');
    measure();
    redraw();
    document.getElementById('stage2').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('vanished').addEventListener('click', function () { toStage2(true); });
  document.getElementById('failed').addEventListener('click', function () { toStage2(false); });

  function finish(filled) {
    state.filled = filled;
    A.record('blind-spot', state);

    document.getElementById('r-eye').textContent =
      state.eye === 'right' ? 'Right (left covered)' : 'Left (right covered)';
    document.getElementById('r-sep').textContent =
      state.sep ? state.sep + ' px' : 'not located';
    document.getElementById('r-fill').textContent =
      filled ? 'Yes — lines completed' : 'No — hole remained visible';

    if (!filled) {
      var n = document.createElement('div');
      n.className = 'notice';
      n.innerHTML = 'The effect is finicky: it needs a fixed gaze, an arm’s length of ' +
        'distance, and the right separation. If it did not work for you, the argument ' +
        'below is unaffected — the anatomy is not in question. The hole is there whether ' +
        'or not this screen managed to find it.';
      document.querySelector('#finding .prose').insertBefore(
        n, document.querySelector('#finding .prose').children[2]);
    }
    A.reveal('finding');
  }

  document.getElementById('saw-lines').addEventListener('click', function () { finish(true); });
  document.getElementById('saw-hole').addEventListener('click', function () { finish(false); });

  window.addEventListener('resize', function () { measure(); redraw(); });
  measure();
  redraw();
})();
