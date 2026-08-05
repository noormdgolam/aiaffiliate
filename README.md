# Apparatus

**Seven instruments for examining yourself.**

Philosophy of mind, performed rather than argued. Each of the seven pages is a
working procedure: you operate it, it operates on you, and it returns a result
about *you* rather than about anybody's theory.

| № | Instrument | The question it puts |
|---|------------|----------------------|
| I | The Blind Spot | Is what you see a recording of the world? |
| II | The Flicker | How much of the scene are you actually holding? |
| III | The Preference | Do you know why you want what you want? |
| IV | The Heap | Where exactly do your concepts end? |
| V | The Clock | When does a decision become yours? |
| VI | The Frame | Are your values yours, or the sentence's? |
| VII | The Room | Can you mean something you do not understand? |

The **ledger** then assembles every observation into a portrait of the reader —
built from behaviour, by something with no access to their inner life — and
makes the one argument the whole apparatus exists to make.

Each instrument reconstructs a real result: perceptual filling-in
(Ramachandran & Gregory 1991), change blindness (Rensink, O'Regan & Clark 1997),
choice blindness (Johansson et al. 2005), the sorites paradox (Eubulides;
Williamson 1994), Libet's clock (Libet et al. 1983, with Schurger et al. 2012),
framing effects (Tversky & Kahneman 1981), and Searle's Chinese Room (1980).
Where the interpretation is contested, the objections are on the page rather
than buried. Full citations are in `about.html`.

## Running it

There is no build step and no dependency. Open `index.html`, or serve the
directory:

```sh
python3 -m http.server 8000
```

It works offline, from a file:// URL, and from a USB stick on a machine that has
never been online.

## Privacy

No server, no database, no account, no cookie, no analytics, no third-party
request. The site makes **no network calls of any kind** after the page loads —
there is not even an image file or a web font.

Results are written to `localStorage` under one key, `apparatus.v1`, on the
visitor's own device, so the ledger can assemble them across pages. The erase
button on the ledger removes that key entirely.

## A disclosed deception

Instrument III (`instruments/choice.html`) substitutes the visitor's choice on
two of five trials and invites them to justify a preference they did not
express. This is the choice-blindness paradigm, and it does not work if
announced in full beforehand. The page warns that *something* will be done, and
discloses precisely what within about ninety seconds. Nothing typed there leaves
the browser.

## Structure

```
index.html              entry and instrument index
ledger.html             assembled portrait and closing argument
about.html              method, caveats, and sources
instruments/*.html      one file per instrument
assets/apparatus.css    design system
assets/apparatus.js     state, registry, shared utilities
assets/ledger.js        portrait assembly
assets/i/*.js           one script per instrument
```

Everything visual is drawn to `<canvas>` at runtime; the project contains no
images. Type is set in system serif and monospace.

The per-instrument scripts are short and readable on purpose. If you want to
know exactly what an instrument does to you before running it, read its script —
that is the intended use.
