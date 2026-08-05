/* Instrument IV — The Heap ------------------------------------------- */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('sorites');

  var START = 800;
  var MAX = 800;

  var count = START;
  var phase = 'down';
  var thresholdDown = null, thresholdUp = null, grainAnswer = null;

  var cv = document.getElementById('pile');
  var ctx, W, H;

  /* Each grain gets a fixed position inside a unit mound. Drawing the
     first n of them and scaling the mound by sqrt(n) makes the pile grow
     and shrink coherently instead of reshuffling on every step. */
  var grains = (function () {
    var rand = A.rng(20250805);
    var out = [];
    for (var i = 0; i < MAX; i++) {
      var v = 1 - Math.sqrt(rand());          // denser toward the base
      var span = 1 - v;
      var u = (rand() * 2 - 1) * span;
      out.push({ u: u, v: v, tone: rand() });
    }
    return out;
  })();

  var TONES = ['#c2b49a', '#b3a488', '#d3c7b0', '#a3947a', '#cdc0a6'];

  function measure() {
    var stage = cv.parentElement;
    W = Math.max(300, Math.min(stage.clientWidth, 760));
    H = 292;
    ctx = A.fitCanvas(cv, W, H);
  }

  function draw() {
    ctx.fillStyle = '#08090a';
    ctx.fillRect(0, 0, W, H);

    var baseY = H - 46;

    // ground line
    ctx.strokeStyle = '#26282c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.08, baseY + 0.5);
    ctx.lineTo(W * 0.92, baseY + 0.5);
    ctx.stroke();

    var n = Math.max(0, count);
    if (n > 0) {
      var scale = Math.sqrt(n / MAX);
      var halfW = W * 0.29 * scale;
      var height = 186 * scale;
      // A very small pile still needs to be visible, not sub-pixel.
      halfW = Math.max(halfW, 3.0 * Math.sqrt(n));
      height = Math.max(height, 2.4 * Math.sqrt(n));

      for (var i = 0; i < n; i++) {
        var g = grains[i];
        var x = W / 2 + g.u * halfW;
        var y = baseY - g.v * height - 1.6;
        ctx.fillStyle = TONES[Math.floor(g.tone * TONES.length)];
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // count caption under the pile
    ctx.fillStyle = '#625d55';
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(n + (n === 1 ? ' GRAIN' : ' GRAINS'), W / 2, baseY + 26);
  }

  function setCount(n) {
    count = Math.max(0, Math.min(MAX, n));
    document.getElementById('count-out').textContent =
      count + (count === 1 ? ' grain' : ' grains');
    draw();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-delta]'), function (b) {
    b.addEventListener('click', function () {
      setCount(count + parseInt(b.dataset.delta, 10));
    });
  });

  /* ---------------------------------------------------------- passes */

  document.getElementById('declare-down').addEventListener('click', function () {
    thresholdDown = count;
    phase = 'up';
    document.getElementById('controls-down').style.display = 'none';
    document.getElementById('controls-up').style.display = 'flex';
    document.getElementById('pass-label').textContent = 'Apparatus IV — pass 2, ascending';
    setCount(1);
    cv.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('declare-up').addEventListener('click', function () {
    thresholdUp = count;
    document.getElementById('controls-up').style.display = 'none';
    document.getElementById('pass-label').textContent = 'Apparatus IV — passes complete';

    document.getElementById('grain-q').innerHTML =
      'You judged that a pile stops being a heap somewhere around <strong>' + thresholdDown +
      '</strong> grains, and starts being one around <strong>' + thresholdUp + '</strong>. ' +
      'So consider a pile of exactly ' + Math.max(2, thresholdDown) + ' grains, and take away one grain. ' +
      'Just one. <em>Can the removal of a single grain of sand turn a heap into something that is not a heap?</em>';

    A.show('s-grain');
    document.getElementById('s-grain').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* --------------------------------------------------------- analysis */

  function conclude(answer) {
    grainAnswer = answer;
    var gap = Math.abs(thresholdUp - thresholdDown);

    A.record('sorites', {
      down: thresholdDown,
      up: thresholdUp,
      gap: gap,
      singleGrainDecides: answer
    });

    document.getElementById('r-down').textContent = thresholdDown + ' grains';
    document.getElementById('r-up').textContent = thresholdUp + ' grains';
    document.getElementById('r-gap').textContent = gap + ' grains';

    var hyst;
    if (gap === 0) {
      hyst = 'Your two thresholds landed on the same number, which is unusual and worth ' +
        'crediting — though notice what it took: you were holding the first answer in mind ' +
        'while producing the second. The word did not supply the number. You did, and then ' +
        'you matched it.';
    } else if (thresholdUp > thresholdDown) {
      hyst = 'The same pile, the same eyes, the same word, minutes apart — and the boundary moved by ' +
        gap + ' grains depending on which direction you approached it from. Going down, you held ' +
        'on to “heap” until ' + thresholdDown + '. Coming up, you withheld it until ' + thresholdUp +
        '. Between those two numbers lies a range of piles that are heaps or not heaps according ' +
        'to nothing but the order in which you happened to see them.';
    } else {
      hyst = 'Your boundary moved by ' + gap + ' grains between the two passes, and in the less ' +
        'common direction — you were readier to grant “heap” while building than to withdraw it ' +
        'while dismantling. The direction matters less than the fact of the gap: between ' +
        thresholdUp + ' and ' + thresholdDown + ' grains lies a band of piles whose status depends ' +
        'on nothing but the route you took to them.';
    }
    document.getElementById('r-hyst').textContent = hyst;

    var contra;
    if (answer === false) {
      contra = 'And then you said that no single grain ever decides it — which is the honest answer, ' +
        'and which contradicts what you did five minutes ago. If no single grain decides, then the ' +
        'pile at ' + thresholdDown + ' and the pile at ' + thresholdDown + '−1 are on the same side ' +
        'of the line, and so are their neighbours, all the way down to one grain. You have already ' +
        'refused that conclusion. You are holding both.';
    } else {
      contra = 'You bit the bullet: some single grain does decide it. Then say which one. Not ' +
        'roughly — exactly. There is a specific integer at which a pile of sand ceases to be a ' +
        'heap, a grain whose removal you could film, and neither you nor anyone who has ever used ' +
        'the word can name it. That is a strange sort of fact for a word you learned as a toddler.';
    }
    document.getElementById('r-contra').textContent = contra;

    A.reveal('finding');
  }

  document.getElementById('grain-yes').addEventListener('click', function () { conclude(true); });
  document.getElementById('grain-no').addEventListener('click', function () { conclude(false); });

  window.addEventListener('resize', function () { measure(); draw(); });
  measure();
  setCount(START);
})();
