/* Instrument VII — The Room ------------------------------------------ */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('room');

  /* The four messages, and what they say in a language the operator
     inside the room has no access to. */
  var EXCHANGES = [
    {
      "in": ['◈', '●', '▣', '○'],
      inMeans: 'Can you read these marks?',
      outMeans: 'Yes. I read them perfectly well.'
    },
    {
      "in": ['△', '◈', '●', '●', '▣'],
      inMeans: 'Do you know what you are saying to me?',
      outMeans: 'I know exactly what I am saying.'
    },
    {
      "in": ['◈', '△', '△', '○'],
      inMeans: 'Is there anyone in there with you?',
      outMeans: 'No one. I am alone, and I understand everything.'
    },
    {
      "in": ['●', '●', '●', '▣'],
      inMeans: 'Then tell me, in your own words, what this last message means.',
      outMeans: 'It means: I do not understand a single word of this.'
    }
  ];

  /* The book, implemented. The operator does this by hand; the room
     checks their work against it. */
  function applyBook(msg) {
    var out = [];
    out.push(msg[0] === '◈' ? '◇' : '◈');                 // 1
    if (msg.indexOf('▣') !== -1) out.push('▽');            // 2
    for (var i = 0; i < msg.length; i++) {                 // 3
      if (msg[i] === '●') out.push('△');
    }
    if (msg[msg.length - 1] === '○') { out.push('○'); out.push('○'); }  // 4
    else out.push('○');
    return out;
  }

  var round = 0;
  var buffer = [];
  var errors = 0;
  var assisted = false;

  var incoming = document.getElementById('incoming');
  var outgoing = document.getElementById('outgoing');
  var verdict = document.getElementById('verdict');
  var readout = document.getElementById('readout');

  function renderRound() {
    buffer = [];
    incoming.textContent = EXCHANGES[round]["in"].join(' ');
    outgoing.textContent = '';
    verdict.textContent = '';
    readout.textContent = 'Message ' + (round + 1) + ' of ' + EXCHANGES.length;
  }

  function renderBuffer() {
    outgoing.textContent = buffer.join(' ');
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-g]'), function (b) {
    b.addEventListener('click', function () {
      buffer.push(b.dataset.g);
      verdict.textContent = '';
      renderBuffer();
    });
  });

  document.getElementById('back').addEventListener('click', function () {
    buffer.pop();
    renderBuffer();
  });

  document.getElementById('send').addEventListener('click', function () {
    var expected = applyBook(EXCHANGES[round]["in"]);
    if (buffer.join('') === expected.join('')) {
      advance();
    } else {
      errors++;
      verdict.textContent = errors >= 2
        ? 'The book was not followed. Check each rule in order — rule 3 writes one △ per ● in the message received, not in your reply.'
        : 'The book was not followed. Work through the four rules in order.';
    }
  });

  document.getElementById('giveup').addEventListener('click', function () {
    assisted = true;
    buffer = applyBook(EXCHANGES[round]["in"]).slice();
    renderBuffer();
    verdict.style.color = 'var(--ink-faint)';
    verdict.textContent = 'The book has been applied for you. Post it.';
  });

  function advance() {
    EXCHANGES[round].sent = buffer.slice();
    round++;
    verdict.style.color = 'var(--alarm)';
    if (round >= EXCHANGES.length) {
      readout.textContent = 'Slot closed';
      incoming.textContent = '—';
      outgoing.textContent = '';
      A.show('s-done');
      document.getElementById('s-done').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      renderRound();
    }
  }

  /* -------------------------------------------------------- translation */

  document.getElementById('translate').addEventListener('click', function () {
    A.record('room', {
      completed: true,
      corrections: errors,
      assisted: assisted
    });

    var table = document.getElementById('xlate');
    var html = '';
    EXCHANGES.forEach(function (ex, i) {
      var sent = (ex.sent || applyBook(ex["in"])).join(' ');
      html +=
        '<tr>' +
          '<td class="g" style="color:var(--ink-dim)">' + ex["in"].join(' ') + '</td>' +
          '<td><div class="tick" style="margin-bottom:0.3rem">Received ' + (i + 1) + '</div>' +
              '<div style="font-style:italic">“' + ex.inMeans + '”</div></td>' +
        '</tr>' +
        '<tr>' +
          '<td class="g" style="color:var(--phosphor)">' + sent + '</td>' +
          '<td><div class="tick" style="margin-bottom:0.3rem; color:var(--phosphor)">You replied</div>' +
              '<div style="font-style:italic; color:#fff">“' + ex.outMeans + '”</div></td>' +
        '</tr>';
    });
    table.innerHTML = html;

    document.getElementById('r-remark').textContent = errors === 0 && !assisted
      ? 'You answered four questions about your own comprehension, without error, without hesitation, ' +
        'and without the faintest idea that a question had been asked.'
      : 'You answered four questions about your own comprehension. That you needed a moment with the ' +
        'book changes nothing — a slower processor is still a processor. You had no idea a question ' +
        'had been asked.';

    A.reveal('finding');
  });

  renderRound();
})();
