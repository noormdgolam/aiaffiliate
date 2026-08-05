/* Generative forms ---------------------------------------------------
   Deterministic line-figures drawn from an integer seed. They exist to
   be preferred without being memorable: distinct enough to choose
   between, abstract enough that no verbal handle attaches to them.
   -------------------------------------------------------------------- */

(function (global) {
  'use strict';

  function drawSigil(canvas, seed, size) {
    var A = global.Apparatus;
    var ctx = A.fitCanvas(canvas, size, size);
    var rand = A.rng(seed);

    var cx = size / 2, cy = size / 2;
    var R = size * 0.34;

    ctx.fillStyle = '#08090a';
    ctx.fillRect(0, 0, size, size);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    /* Bounding ring. */
    ctx.strokeStyle = 'rgba(233,228,216,0.13)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.32, 0, Math.PI * 2);
    ctx.stroke();

    /* Node positions, jittered off a regular polygon. */
    var n = 5 + Math.floor(rand() * 5);
    var offset = rand() * Math.PI * 2;
    var nodes = [];
    for (var i = 0; i < n; i++) {
      var a = offset + (i * Math.PI * 2) / n + (rand() - 0.5) * 0.3;
      var rr = R * (0.72 + rand() * 0.42);
      nodes.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, a: a, r: rr });
    }

    /* Chords. */
    var chords = 3 + Math.floor(rand() * 4);
    ctx.strokeStyle = 'rgba(233,228,216,0.62)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (var c = 0; c < chords; c++) {
      var p = nodes[Math.floor(rand() * n)];
      var q = nodes[Math.floor(rand() * n)];
      if (p === q) continue;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
    }
    ctx.stroke();

    /* Concentric partial arcs. */
    var arcs = 2 + Math.floor(rand() * 3);
    ctx.strokeStyle = 'rgba(100,216,188,0.75)';
    ctx.lineWidth = 1.6;
    for (var k = 0; k < arcs; k++) {
      var ar = R * (0.34 + rand() * 0.92);
      var start = rand() * Math.PI * 2;
      var sweep = 0.5 + rand() * 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy, ar, start, start + sweep);
      ctx.stroke();
    }

    /* Radial spokes from the centre to a few nodes. */
    ctx.strokeStyle = 'rgba(233,228,216,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var s = 0; s < n; s++) {
      if (rand() < 0.5) continue;
      ctx.moveTo(cx, cy);
      ctx.lineTo(nodes[s].x, nodes[s].y);
    }
    ctx.stroke();

    /* Nodes. */
    for (var m = 0; m < n; m++) {
      var filled = rand() < 0.45;
      var rad = filled ? 3.1 : 4.2;
      ctx.beginPath();
      ctx.arc(nodes[m].x, nodes[m].y, rad, 0, Math.PI * 2);
      if (filled) {
        ctx.fillStyle = '#e9e4d8';
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(233,228,216,0.8)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    /* Centre mark. */
    ctx.fillStyle = '#64d8bc';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  global.drawSigil = drawSigil;
})(window);
