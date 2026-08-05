/* Instrument VI — The Frame ------------------------------------------ */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('frame');

  /* Items are presented in this order. Matched members of a pair are kept
     several items apart so the second is not obviously the first again.
     `risk` marks which option is the gamble; `accept` marks consent. */
  var ITEMS = [
    {
      id: 'disease-gain', pair: 'prospect', role: 'gain',
      label: 'Decision 1 of 8 · public health',
      text: 'An outbreak of an unusual disease is expected to kill <strong>600 people</strong>. ' +
            'Two response programmes have been proposed, and the scientific estimates of their ' +
            'consequences are exact. You must choose one.',
      options: [
        { key: 'sure', text: 'Programme A: <strong>200 people will be saved.</strong>' },
        { key: 'risk', text: 'Programme B: a one-third probability that <strong>600 people will be saved</strong>, and a two-thirds probability that <strong>no people will be saved</strong>.' }
      ]
    },
    {
      id: 'survival', pair: 'stat', role: 'survival',
      label: 'Decision 2 of 8 · medicine',
      text: 'You have been diagnosed with a serious but non-urgent condition. Your surgeon offers ' +
            'an operation and tells you: <strong>“Of one hundred patients who have this operation, ' +
            '90 are alive after five years.”</strong>',
      options: [
        { key: 'accept', text: 'Consent to the operation.' },
        { key: 'decline', text: 'Decline and manage the condition without surgery.' }
      ]
    },
    {
      id: 'promise', pair: null,
      label: 'Decision 3 of 8 · obligation',
      text: 'You promised a dying friend you would scatter their ashes at a particular lake. ' +
            'Nobody else knows of the promise. The journey would cost you a week and a considerable ' +
            'sum, and your friend, being dead, cannot be disappointed.',
      options: [
        { key: 'go', text: 'Make the journey.' },
        { key: 'stay', text: 'Do not. The obligation ended with the person it was owed to.' }
      ]
    },
    {
      id: 'trolley-switch', pair: 'trolley', role: 'switch',
      label: 'Decision 4 of 8 · runaway trolley',
      text: 'A runaway trolley will kill <strong>five people</strong> tied to the track. You are ' +
            'standing beside a lever. Pulling it diverts the trolley onto a side track, where it ' +
            'will kill <strong>one person</strong> instead.',
      options: [
        { key: 'act', text: 'Pull the lever. One dies instead of five.' },
        { key: 'refrain', text: 'Do not pull it.' }
      ]
    },
    {
      id: 'disease-loss', pair: 'prospect', role: 'loss',
      label: 'Decision 5 of 8 · structural emergency',
      text: 'A stadium roof is failing during an event and <strong>600 people</strong> are beneath it. ' +
            'Two evacuation plans have been proposed, and the engineering estimates of their ' +
            'consequences are exact. You must choose one.',
      options: [
        { key: 'sure', text: 'Plan C: <strong>400 people will die.</strong>' },
        { key: 'risk', text: 'Plan D: a one-third probability that <strong>nobody will die</strong>, and a two-thirds probability that <strong>600 people will die</strong>.' }
      ]
    },
    {
      id: 'lottery', pair: null,
      label: 'Decision 6 of 8 · a small matter',
      text: 'You may take <strong>£40 now</strong>, or a coin flip that pays <strong>£100 on heads ' +
            'and nothing on tails</strong>.',
      options: [
        { key: 'sure', text: 'Take the £40.' },
        { key: 'risk', text: 'Flip the coin.' }
      ]
    },
    {
      id: 'mortality', pair: 'stat', role: 'mortality',
      label: 'Decision 7 of 8 · medicine',
      text: 'A second, unrelated condition is found. A different surgeon offers an operation and ' +
            'tells you: <strong>“Of one hundred patients who have this operation, 10 are dead ' +
            'within five years.”</strong>',
      options: [
        { key: 'accept', text: 'Consent to the operation.' },
        { key: 'decline', text: 'Decline and manage the condition without surgery.' }
      ]
    },
    {
      id: 'trolley-bridge', pair: 'trolley', role: 'bridge',
      label: 'Decision 8 of 8 · runaway trolley',
      text: 'The same runaway trolley will kill <strong>five people</strong>. You are on a footbridge ' +
            'above the track, beside a very large stranger. The only way to stop the trolley is to ' +
            'push him off the bridge into its path. He will die. The five will live. You are certain ' +
            'of both facts.',
      options: [
        { key: 'act', text: 'Push him. One dies instead of five.' },
        { key: 'refrain', text: 'Do not push him.' }
      ]
    }
  ];

  var answers = {};
  var idx = 0;

  var readout = document.getElementById('readout');

  function renderItem() {
    var it = ITEMS[idx];
    document.getElementById('scenario-label').textContent = it.label;
    document.getElementById('scenario').innerHTML = '<p>' + it.text + '</p>';

    var host = document.getElementById('options');
    host.innerHTML = '';
    it.options.forEach(function (opt) {
      var b = document.createElement('button');
      b.style.cssText = 'text-align:left; text-transform:none; letter-spacing:0.01em; ' +
        'font-family:var(--serif); font-size:1rem; padding:1rem 1.2rem; line-height:1.5';
      b.innerHTML = opt.text;
      b.addEventListener('click', function () {
        answers[it.id] = opt.key;
        idx++;
        if (idx >= ITEMS.length) {
          readout.textContent = 'Series complete';
          A.show('s-done');
        } else {
          renderItem();
        }
      });
      host.appendChild(b);
    });

    readout.textContent = 'Item ' + (idx + 1) + ' / ' + ITEMS.length;
    A.show('s-item');
  }

  document.getElementById('begin').addEventListener('click', renderItem);

  /* ---------------------------------------------------------- analysis */

  document.getElementById('analyse').addEventListener('click', function () {
    var flips = 0;

    var prospectFlip = answers['disease-gain'] !== answers['disease-loss'];
    var statFlip = answers['survival'] !== answers['mortality'];
    if (prospectFlip) flips++;
    if (statFlip) flips++;

    var trolleyDiverge = answers['trolley-switch'] === 'act' &&
                         answers['trolley-bridge'] === 'refrain';

    A.record('frame', {
      answers: answers,
      flips: flips,
      prospectFlip: prospectFlip,
      statFlip: statFlip,
      trolleyDiverge: trolleyDiverge
    });

    document.getElementById('r-pairs').textContent = '2';
    document.getElementById('r-flips').textContent = flips + ' / 2';
    document.getElementById('r-trolley').textContent = trolleyDiverge
      ? 'Divert but not push'
      : (answers['trolley-switch'] === answers['trolley-bridge'] ? 'Consistent' : 'Push but not divert');

    buildPairs(prospectFlip, statFlip);

    var verdict;
    if (flips === 2) {
      verdict = 'Both pairs reversed. Two questions, asked twice each, with every fact held ' +
        'constant and only the direction of the sentence changed — and you gave four answers ' +
        'that cannot all be held at once.';
    } else if (flips === 1) {
      verdict = 'One pair reversed and one held. The pair that held is a real result, not luck; ' +
        'most people flip at least one. But the pair that moved is the one to sit with, because ' +
        'nothing about that decision changed except the wording, and you are the only variable left.';
    } else {
      verdict = 'Neither pair reversed. That is genuinely uncommon, and there are two explanations, ' +
        'only one of which is flattering. Either your preferences are unusually stable under ' +
        'redescription, or you recognised the repeat and answered the second to match the first — ' +
        'which is exactly why the effect is normally measured between different people rather than ' +
        'within one. If it was recognition, the honest question is what you would have answered ' +
        'had you seen only the second version, as most people in the real world only ever do.';
    }
    document.getElementById('r-verdict').textContent = verdict;

    A.reveal('finding');
  });

  function buildPairs(prospectFlip, statFlip) {
    var host = document.getElementById('pairs-out');
    host.innerHTML = '';

    var rows = [
      {
        title: 'Pair one — identical outcomes, opposite framing',
        flipped: prospectFlip,
        a: { q: 'Disease: “200 will be saved” vs a 1/3 gamble on all 600',
             ans: answers['disease-gain'] === 'sure' ? 'You took the certain option' : 'You took the gamble' },
        b: { q: 'Stadium: “400 will die” vs a 1/3 gamble on nobody dying',
             ans: answers['disease-loss'] === 'sure' ? 'You took the certain option' : 'You took the gamble' },
        note: 'Of 600 people: “200 saved” = “400 die”. The gambles are likewise identical — a one-third chance that all live.'
      },
      {
        title: 'Pair two — identical statistics, opposite emphasis',
        flipped: statFlip,
        a: { q: 'Surgery described as 90 alive in 100 after five years',
             ans: answers['survival'] === 'accept' ? 'You consented' : 'You declined' },
        b: { q: 'Surgery described as 10 dead in 100 within five years',
             ans: answers['mortality'] === 'accept' ? 'You consented' : 'You declined' },
        note: '90% survival and 10% mortality are the same number, reported from opposite ends.'
      }
    ];

    rows.forEach(function (r) {
      var p = document.createElement('div');
      p.className = 'panel';
      p.innerHTML =
        '<div class="panel-bar"><span>' + r.title + '</span>' +
        '<span class="readout" style="color:' + (r.flipped ? 'var(--alarm)' : 'var(--phosphor)') + '">' +
        (r.flipped ? 'Reversed' : 'Held') + '</span></div>' +
        '<div class="panel-body">' +
          '<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(14rem,1fr)); gap:1.4rem">' +
            '<div><div class="tick" style="margin-bottom:0.5rem">Asked as</div>' +
              '<p style="margin:0 0 0.8rem">' + r.a.q + '</p>' +
              '<p class="mono" style="margin:0; font-size:0.8rem; color:var(--ink)">' + r.a.ans + '</p></div>' +
            '<div><div class="tick" style="margin-bottom:0.5rem">Asked as</div>' +
              '<p style="margin:0 0 0.8rem">' + r.b.q + '</p>' +
              '<p class="mono" style="margin:0; font-size:0.8rem; color:var(--ink)">' + r.b.ans + '</p></div>' +
          '</div>' +
          '<div class="notice ' + (r.flipped ? 'alarm' : 'phosphor') + '" style="margin-bottom:0">' + r.note + '</div>' +
        '</div>';
      host.appendChild(p);
    });
  }
})();
