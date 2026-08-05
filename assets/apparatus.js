/* ------------------------------------------------------------------
   APPARATUS — shared state, registry, and small utilities.

   Everything the apparatus learns about a visitor is written to
   localStorage on their own machine and nowhere else. There is no
   server, no analytics, no network call anywhere in this project.
   The ledger page can erase all of it in one action.
   ------------------------------------------------------------------ */

(function (global) {
  'use strict';

  var KEY = 'apparatus.v1';

  /* ------------------------------------------------------- the registry */

  var INSTRUMENTS = [
    { id: 'blind-spot', num: 'I',   name: 'The Blind Spot',
      question: 'Is what you see a recording of the world?',
      file: 'instruments/blind-spot.html' },
    { id: 'flicker',    num: 'II',  name: 'The Flicker',
      question: 'How much of the scene are you actually holding?',
      file: 'instruments/flicker.html' },
    { id: 'choice',     num: 'III', name: 'The Preference',
      question: 'Do you know why you want what you want?',
      file: 'instruments/choice.html' },
    { id: 'sorites',    num: 'IV',  name: 'The Heap',
      question: 'Where exactly do your concepts end?',
      file: 'instruments/sorites.html' },
    { id: 'clock',      num: 'V',   name: 'The Clock',
      question: 'When does a decision become yours?',
      file: 'instruments/clock.html' },
    { id: 'frame',      num: 'VI',  name: 'The Frame',
      question: 'Are your values yours, or the sentence’s?',
      file: 'instruments/frame.html' },
    { id: 'room',       num: 'VII', name: 'The Room',
      question: 'Can you mean something you do not understand?',
      file: 'instruments/room.html' }
  ];

  /* ---------------------------------------------------------- storage */

  function readAll() {
    try {
      var raw = global.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeAll(data) {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function record(id, result) {
    var all = readAll();
    result.at = Date.now();
    all[id] = result;
    writeAll(all);
    return result;
  }

  function result(id) {
    return readAll()[id] || null;
  }

  function erase() {
    try { global.localStorage.removeItem(KEY); } catch (e) {}
  }

  function completedCount() {
    var all = readAll(), n = 0;
    INSTRUMENTS.forEach(function (ins) { if (all[ins.id]) n++; });
    return n;
  }

  /* ------------------------------------------------------------- chrome */

  function masthead(currentId) {
    var el = document.querySelector('[data-masthead]');
    if (!el) return;
    var root = el.getAttribute('data-root') || '';
    el.innerHTML =
      '<a class="wordmark" href="' + root + 'index.html">Apparatus</a>' +
      '<nav>' +
        '<a href="' + root + 'index.html"' + (currentId === 'index' ? ' aria-current="page"' : '') + '>Instruments</a>' +
        '<a href="' + root + 'ledger.html"' + (currentId === 'ledger' ? ' aria-current="page"' : '') + '>Ledger</a>' +
        '<a href="' + root + 'about.html"' + (currentId === 'about' ? ' aria-current="page"' : '') + '>Method</a>' +
      '</nav>';
  }

  /* Renders the previous/next navigation at the foot of an instrument. */
  function pager(currentId) {
    var el = document.querySelector('[data-pager]');
    if (!el) return;
    var i = INSTRUMENTS.findIndex(function (x) { return x.id === currentId; });
    var next = INSTRUMENTS[i + 1];
    var html = '<a class="back" href="../index.html">← All instruments</a>';
    if (next) {
      html += '<a href="' + next.id + '.html">' + next.num + '. ' + next.name + ' →</a>';
    } else {
      html += '<a href="../ledger.html">Read the ledger →</a>';
    }
    el.innerHTML = html;
  }

  function init(currentId) {
    masthead(currentId);
    pager(currentId);
  }

  /* ------------------------------------------------------------ helpers */

  /* Deterministic PRNG (mulberry32) so generated forms are reproducible
     from a seed — the same sigil renders identically on every visit. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rand) {
    var a = arr.slice(), r = rand || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Sizes a canvas for the device pixel ratio and returns its context
     already scaled, so all drawing code can work in CSS pixels. */
  function fitCanvas(canvas, w, h) {
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function ms(n) {
    if (n == null || isNaN(n)) return '—';
    return Math.round(n) + ' ms';
  }

  /* "once", "twice", "seventeen times" — the portrait is prose, and
     "1 times" would give the game away faster than anything in it. */
  function times(n) {
    if (n === 1) return 'once';
    if (n === 2) return 'twice';
    return n + ' times';
  }

  function show(stepId) {
    var steps = document.querySelectorAll('.step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle('active', steps[i].id === stepId);
    }
    var target = document.getElementById(stepId);
    if (target) {
      var top = target.getBoundingClientRect().top + global.scrollY - 80;
      if (top < global.scrollY) global.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  /* Reveals the FINDING section and scrolls it into view. */
  function reveal(id) {
    var el = document.getElementById(id || 'finding');
    if (!el) return;
    el.hidden = false;
    requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  global.Apparatus = {
    INSTRUMENTS: INSTRUMENTS,
    readAll: readAll,
    record: record,
    result: result,
    erase: erase,
    completedCount: completedCount,
    init: init,
    rng: rng,
    shuffle: shuffle,
    fitCanvas: fitCanvas,
    ms: ms,
    times: times,
    show: show,
    reveal: reveal
  };
})(window);
