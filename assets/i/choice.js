/* Instrument III — The Preference ------------------------------------ */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('choice');

  var TRIALS = 5;
  var SWAP_ON = [1, 3];        // zero-indexed trials where the choice is substituted

  var PROMPTS = [
    'Which of these two forms do you find more agreeable?',
    'Which of these would you rather have on the wall of a room you work in?',
    'Which of these seems more finished to you?',
    'Which would you choose to represent something of your own?',
    'Which of these do you trust more?'
  ];

  var trials = [];
  var current = 0;

  for (var t = 0; t < TRIALS; t++) {
    trials.push({
      seeds: [Math.floor(Math.random() * 1e9), Math.floor(Math.random() * 1e9)],
      swap: SWAP_ON.indexOf(t) !== -1,
      picked: null,
      shown: null,
      why: '',
      objected: false
    });
  }

  var readout = document.getElementById('readout');
  var why = document.getElementById('why');
  var recordBtn = document.getElementById('record');

  function sigilSize() {
    var panel = document.querySelector('.panel').clientWidth;
    return Math.max(140, Math.min(210, Math.floor((panel - 100) / 2)));
  }

  function renderChoice() {
    var tr = trials[current];
    var size = sigilSize();
    document.getElementById('choose-prompt').textContent = PROMPTS[current % PROMPTS.length];
    drawSigil(document.getElementById('opt-a'), tr.seeds[0], size);
    drawSigil(document.getElementById('opt-b'), tr.seeds[1], size);
    readout.textContent = 'Trial ' + (current + 1) + ' / ' + TRIALS + ' · select';
    A.show('s-choose');
  }

  function pick(index) {
    var tr = trials[current];
    tr.picked = index;
    tr.shown = tr.swap ? (1 - index) : index;

    readout.textContent = 'Trial ' + (current + 1) + ' / ' + TRIALS + ' · recording';
    why.value = '';
    recordBtn.disabled = true;

    // A short interval, framed as the instrument writing to its record.
    A.show('s-justify');
    var canvas = document.getElementById('opt-chosen');
    var size = Math.max(150, Math.min(220, sigilSize() + 10));
    drawSigil(canvas, tr.seeds[tr.shown], size);
    why.focus();
  }

  function advance() {
    current++;
    if (current >= TRIALS) {
      readout.textContent = 'Array complete';
      A.show('s-done');
    } else {
      renderChoice();
    }
  }

  /* ------------------------------------------------------------ wiring */

  document.getElementById('begin').addEventListener('click', renderChoice);

  Array.prototype.forEach.call(document.querySelectorAll('[data-pick]'), function (b) {
    b.addEventListener('click', function () { pick(parseInt(b.dataset.pick, 10)); });
  });
  document.getElementById('opt-a').addEventListener('click', function () { pick(0); });
  document.getElementById('opt-b').addEventListener('click', function () { pick(1); });

  why.addEventListener('input', function () {
    recordBtn.disabled = why.value.trim().length < 3;
  });

  recordBtn.addEventListener('click', function () {
    trials[current].why = why.value.trim();
    advance();
  });

  document.getElementById('object').addEventListener('click', function () {
    trials[current].objected = true;
    trials[current].why = why.value.trim();
    advance();
  });

  /* ---------------------------------------------------------- analysis */

  document.getElementById('analyse').addEventListener('click', function () {
    var swaps = 0, detected = 0, falseAlarms = 0;

    trials.forEach(function (tr) {
      if (tr.swap) {
        swaps++;
        if (tr.objected) detected++;
      } else if (tr.objected) {
        falseAlarms++;
      }
    });

    A.record('choice', {
      swaps: swaps,
      detected: detected,
      falseAlarms: falseAlarms,
      confabulated: swaps - detected,
      quotes: trials.filter(function (x) { return x.swap && !x.objected && x.why; })
                    .map(function (x) { return x.why; })
    });

    document.getElementById('r-swaps').textContent = swaps;
    document.getElementById('r-detected').textContent = detected + ' / ' + swaps;
    document.getElementById('r-false').textContent = falseAlarms;

    buildTranscript();

    var verdict;
    var missed = swaps - detected;
    if (missed === 0) {
      verdict = 'You caught both substitutions, which puts you in the minority — roughly a quarter ' +
        'of people do, and it is easier here than in the original experiments, because abstract ' +
        'figures on a screen invite the kind of careful looking that a supermarket does not. ' +
        'The finding below still holds, and there is a sharper version of it for you: the reasons ' +
        'you gave on the three unmanipulated trials were produced by the same machinery. ' +
        'Detecting the swap tells you the machinery can be caught. It does not tell you it was ' +
        'telling the truth the rest of the time.';
    } else if (missed === 1) {
      verdict = 'One substitution went through. Read your own sentence for it above, and note that ' +
        'nothing about writing it felt like invention.';
    } else {
      verdict = 'Both substitutions went through unchallenged, and you wrote a reason for each. ' +
        'Read them again above. They are your words, in your voice, about a preference that was ' +
        'the opposite of the one you had a few seconds earlier.';
    }
    document.getElementById('r-verdict').textContent = verdict;

    A.reveal('finding');
  });

  function buildTranscript() {
    var host = document.getElementById('transcript');
    host.innerHTML = '';

    trials.forEach(function (tr, i) {
      var panel = document.createElement('div');
      panel.className = 'panel';

      var status = tr.swap
        ? (tr.objected ? 'Substituted · detected' : 'Substituted · undetected')
        : 'Unaltered';

      panel.innerHTML =
        '<div class="panel-bar"><span>Trial ' + (i + 1) + '</span>' +
        '<span class="readout" style="color:' +
          (tr.swap ? (tr.objected ? 'var(--phosphor)' : 'var(--alarm)') : 'var(--ink-faint)') +
        '">' + status + '</span></div>' +
        '<div class="panel-body"><div class="tri"></div></div>';

      host.appendChild(panel);

      var body = panel.querySelector('.tri');
      body.style.cssText = 'display:flex; gap:1.4rem; align-items:center; flex-wrap:wrap; justify-content:center';

      var cell = function (label, seed, tone) {
        var wrap = document.createElement('div');
        wrap.style.cssText = 'text-align:center';
        var cv = document.createElement('canvas');
        wrap.appendChild(cv);
        var cap = document.createElement('div');
        cap.className = 'tick';
        cap.style.cssText = 'margin-top:0.6rem; color:' + tone;
        cap.textContent = label;
        wrap.appendChild(cap);
        body.appendChild(wrap);
        drawSigil(cv, seed, 108);
      };

      cell('You chose', tr.seeds[tr.picked], 'var(--ink-dim)');
      if (tr.swap) cell('You were shown', tr.seeds[tr.shown], 'var(--alarm)');

      if (tr.why) {
        var q = document.createElement('div');
        q.style.cssText = 'flex:1 1 16rem; min-width:14rem; font-style:italic; color:var(--ink); ' +
          'border-left:1px solid var(--rule-bright); padding-left:1.1rem';
        q.textContent = '“' + tr.why + '”';
        body.appendChild(q);
      }
    });
  }
})();
