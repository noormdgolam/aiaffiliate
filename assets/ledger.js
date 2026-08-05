/* The Ledger — assembly of everything observed ----------------------- */

(function () {
  'use strict';

  var A = window.Apparatus;
  A.init('ledger');

  var data = A.readAll();
  var done = A.completedCount();

  if (done === 0) {
    document.getElementById('empty').hidden = false;
    return;
  }
  document.getElementById('filled').hidden = false;
  document.getElementById('completion').textContent =
    done + ' of ' + A.INSTRUMENTS.length + ' instruments run';

  /* ------------------------------------------------- record of readings */

  var READINGS = {
    'blind-spot': function (r) {
      return [
        r.filled ? 'Reported a continuous field across a gap in the image'
                 : 'Did not report completion across the gap',
        r.sep ? r.sep + ' px' : '—'
      ];
    },
    'flicker': function (r) {
      return [
        r.detected ? 'Located a large repeated change after searching'
                   : 'Failed to locate a large repeated change',
        r.detected ? r.seconds + ' s'
                   : r.cycles + (r.cycles === 1 ? ' cycle' : ' cycles')
      ];
    },
    'choice': function (r) {
      return [
        r.confabulated > 0
          ? 'Gave reasons for ' + r.confabulated + ' choice' + (r.confabulated === 1 ? '' : 's') + ' not made'
          : 'Detected every substituted choice',
        r.detected + '/' + r.swaps + ' caught'
      ];
    },
    'sorites': function (r) {
      return [
        r.gap === 0 ? 'Placed the boundary of a concept identically in both directions'
                    : 'Placed the boundary of a concept in two different places',
        r.down + ' / ' + r.up
      ];
    },
    'clock': function (r) {
      return [
        (r.meanMs < 0 ? 'Reported awareness of intention before the act'
                      : 'Reported awareness of intention after the act') +
        ', varying by ' + Math.abs(r.spreadMs) + ' ms across trials',
        (r.meanMs < 0 ? '−' : '+') + Math.abs(r.meanMs) + ' ms'
      ];
    },
    'frame': function (r) {
      return [
        r.flips === 0 ? 'Held both preferences constant under redescription'
                      : 'Reversed ' + r.flips + ' preference' + (r.flips === 1 ? '' : 's') +
                        ' when the wording changed and the facts did not',
        r.flips + '/2 reversed'
      ];
    },
    'room': function (r) {
      return [
        'Conducted a conversation in a language not understood' +
          (r.assisted ? ', with assistance from the book' : ''),
        r.corrections === 0 ? 'no errors' : r.corrections + ' correction' + (r.corrections === 1 ? '' : 's')
      ];
    }
  };

  var tbody = document.getElementById('record');
  A.INSTRUMENTS.forEach(function (ins) {
    var r = data[ins.id];
    var tr = document.createElement('tr');
    if (!r) {
      tr.className = 'pending';
      tr.innerHTML = '<td class="n">' + ins.num + '</td><td class="name">' + ins.name +
        '</td><td>Not run</td><td class="v">—</td>';
    } else {
      var cells = READINGS[ins.id](r);
      tr.innerHTML = '<td class="n">' + ins.num + '</td><td class="name">' + ins.name +
        '</td><td>' + cells[0] + '</td><td class="v">' + cells[1] + '</td>';
    }
    tbody.appendChild(tr);
  });

  /* --------------------------------------------------------- the portrait */

  var lines = [];

  lines.push('You are a person of ordinary and unremarkable competence, which is the first thing ' +
    'worth saying, because everything that follows might otherwise be mistaken for a fault.');

  var bs = data['blind-spot'];
  if (bs && bs.filled) {
    lines.push('Shown a ruled field with a disc cut out of it, you reported unbroken lines. ' +
      'The lines were not there. You did not report an inference or a guess; you reported seeing them.');
  } else if (bs) {
    lines.push('The first instrument could not find the gap in your visual field on this screen, ' +
      'which tells us about the screen rather than about you. The gap is there.');
  }

  var fl = data['flicker'];
  if (fl && !fl.detected) {
    lines.push(fl.cycles > 2
      ? 'A large object in front of you changed colour ' + A.times(fl.cycles) + ' while you ' +
        'searched for it, and you did not see it. You were looking directly at the region for much ' +
        'of that time.'
      : 'A large object in front of you changed colour repeatedly while you searched for it, and ' +
        'you did not see it — though you gave up quickly enough that the instrument cannot claim ' +
        'much about how long you would have taken.');
  } else if (fl) {
    lines.push('You found a repeatedly changing object in ' + fl.seconds + ' seconds — by searching ' +
      'for it item by item, rather than by seeing it change, which is the only method the ' +
      'condition allows.');
  }

  var ch = data['choice'];
  if (ch && ch.confabulated > 0) {
    lines.push('Handed a preference you had just rejected and told it was yours, you accepted it ' +
      A.times(ch.confabulated) + ' and explained it in your own words.' +
      (ch.quotes && ch.quotes.length
        ? ' You wrote, of a form you had turned down: “' + ch.quotes[0] + '”.'
        : ''));
  } else if (ch) {
    lines.push('You caught both substituted preferences, which is uncommon and suggests you were ' +
      'attending closely — though it leaves untouched the reasons you gave on the trials where ' +
      'nothing was substituted.');
  }

  var so = data['sorites'];
  if (so) {
    lines.push(so.gap === 0
      ? 'Asked to say where a heap stops being a heap, you gave the same number twice — while ' +
        'holding the first answer in mind. The word supplied no number. You did.'
      : 'Asked to say where a heap stops being a heap, you answered ' + so.down + ' going down and ' +
        so.up + ' coming up: a band ' + so.gap + ' grains wide in which the same pile is or is not ' +
        'a heap depending on the route you took to it.');
  }

  var cl = data['clock'];
  if (cl) {
    lines.push('Asked to time the arrival of your own intention to act, you produced a figure of ' +
      (cl.meanMs < 0 ? '−' : '+') + Math.abs(cl.meanMs) + ' ms relative to the act, with your five reports ' +
      'differing from one another by ' + Math.abs(cl.spreadMs) + ' ms. You reported all of them ' +
      'with the same confidence.');
  }

  var fr = data['frame'];
  if (fr) {
    if (fr.flips === 0) {
      lines.push('Your preferences survived redescription in both matched pairs — unusual, though ' +
        'the second member of a pair is harder to catch when you have not just seen the first.');
    } else if (fr.flips === 1) {
      lines.push('One matched pair reversed. Offered the very same outcome under two descriptions, ' +
        'you wanted it under one wording and refused it under the other. Nothing about the outcome ' +
        'differed — only the end of the sentence it was pointed from.');
    } else {
      lines.push('Both matched pairs reversed. Twice over, offered the very same outcome under two ' +
        'descriptions, you wanted it under one wording and refused it under the other. Nothing ' +
        'about either outcome differed — only the end of the sentence it was pointed from.');
    }
    if (fr.trolleyDiverge) {
      lines.push('You would divert a trolley to kill one instead of five, and you would not push a ' +
        'man off a bridge to do the same arithmetic. You are in the large majority, and you almost ' +
        'certainly formed both judgements before you had any principle to hand.');
    }
  }

  var rm = data['room'];
  if (rm) {
    lines.push('Sealed in a room with a rule book, you answered four questions about your own ' +
      'comprehension' + (rm.corrections === 0 ? ' without a single error' : '') +
      ', including the assertion that you understood everything, without knowing that a question ' +
      'had been asked.');
  }

  if (done === A.INSTRUMENTS.length) {
    lines.push('You completed all seven, in order, which suggests either an unusual tolerance for ' +
      'being wrong in public with no one watching, or curiosity strong enough to override it.');
  } else {
    lines.push('You have run ' + done + ' of the seven. The portrait is correspondingly partial — ' +
      'which is itself worth noticing, since it did not stop the portrait from sounding certain.');
  }

  var host = document.getElementById('portrait');
  lines.forEach(function (t) {
    var p = document.createElement('p');
    p.innerHTML = t;
    host.appendChild(p);
  });

  /* ---------------------------------------------------------- erasure */

  document.getElementById('erase').addEventListener('click', function () {
    A.erase();
    this.disabled = true;
    document.getElementById('erased').textContent =
      'Erased. The person is still here.';
    document.getElementById('erased').style.color = 'var(--phosphor)';
  });
})();
