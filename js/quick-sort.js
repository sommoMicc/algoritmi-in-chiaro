(function () {
  const barsEl = document.getElementById("bars");
  const statusEl = document.getElementById("viz-status");
  const playBtn = document.getElementById("btn-play");
  const pauseBtn = document.getElementById("btn-pause");
  const stepBtn = document.getElementById("btn-step");
  const resetBtn = document.getElementById("btn-reset");
  const randomBtn = document.getElementById("btn-random");
  const speedEl = document.getElementById("speed");
  if (!barsEl) return;

  let source = [7, 2, 9, 4, 1, 8, 5, 3];

  function buildSteps(arr) {
    const a = arr.slice();
    const steps = [];
    const done = {};

    function partition(lo, hi) {
      const pivot = a[hi];
      steps.push({
        type: "pivot",
        array: a.slice(),
        lo: lo,
        hi: hi,
        pivot: hi,
        done: Object.assign({}, done),
        status: "Scelgo come pivot il valore " + pivot + " (ultima posizione dell'intervallo)."
      });
      let i = lo;
      for (let j = lo; j < hi; j += 1) {
        steps.push({
          type: "compare",
          array: a.slice(),
          lo: lo,
          hi: hi,
          pivot: hi,
          i: i,
          k: j,
          done: Object.assign({}, done),
          status: "Confronto " + a[j] + " con il pivot " + pivot + "."
        });
        if (a[j] < pivot) {
          if (i !== j) {
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
            steps.push({
              type: "swap",
              array: a.slice(),
              lo: lo,
              hi: hi,
              pivot: hi,
              i: i,
              k: j,
              done: Object.assign({}, done),
              status: a[i] + " è minore del pivot: lo sposto a sinistra (scambio con la posizione " + i + ")."
            });
          } else {
            steps.push({
              type: "keep",
              array: a.slice(),
              lo: lo,
              hi: hi,
              pivot: hi,
              i: i,
              k: j,
              done: Object.assign({}, done),
              status: a[j] + " è già nella parte sinistra, resto così."
            });
          }
          i += 1;
        }
      }
      const tmp = a[i];
      a[i] = a[hi];
      a[hi] = tmp;
      steps.push({
        type: "place",
        array: a.slice(),
        lo: lo,
        hi: hi,
        pivot: i,
        done: Object.assign({}, done),
        status: "Il pivot " + a[i] + " va in posizione definitiva " + i + ": a sinistra i minori, a destra i maggiori."
      });
      return i;
    }

    function quick(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) {
        done[lo] = true;
        steps.push({
          type: "single",
          array: a.slice(),
          lo: lo,
          hi: hi,
          done: Object.assign({}, done),
          status: "Un solo elemento in posizione " + lo + ": è già a posto."
        });
        return;
      }
      const p = partition(lo, hi);
      done[p] = true;
      quick(lo, p - 1);
      quick(p + 1, hi);
    }

    quick(0, a.length - 1);
    steps.push({
      type: "done",
      array: a.slice(),
      done: a.reduce(function (acc, _, i) { acc[i] = true; return acc; }, {}),
      status: "Quick Sort completato."
    });
    return steps;
  }

  function apply(step) {
    const values = step.type === "reset" ? source : step.array;
    const classes = {};
    if (step.type === "reset") {
      AlgoViz.renderBars(barsEl, values, classes);
      return;
    }
    if (typeof step.lo === "number") {
      for (let i = step.lo; i <= step.hi; i += 1) classes[i] = "active-range";
    }
    if (step.done) {
      Object.keys(step.done).forEach(function (k) {
        if (step.done[k]) classes[k] = "sorted";
      });
    }
    if (typeof step.pivot === "number") classes[step.pivot] = "pivot";
    if (step.type === "compare" || step.type === "keep") {
      classes[step.k] = "compare";
    }
    if (step.type === "swap") {
      classes[step.i] = "swap";
      classes[step.k] = "swap";
    }
    if (step.type === "place") classes[step.pivot] = "sorted";
    if (step.type === "done") {
      values.forEach(function (_, i) { classes[i] = "sorted"; });
    }
    AlgoViz.renderBars(barsEl, values, classes);
  }

  const player = AlgoViz.createPlayer({
    steps: buildSteps(source),
    delay: 600,
    apply: apply,
    onStatus: function (text) { statusEl.textContent = text; }
  });

  AlgoViz.bindSpeed(speedEl, player);
  player.reset();

  playBtn.addEventListener("click", function () { player.play(); });
  pauseBtn.addEventListener("click", function () { player.pause(); });
  stepBtn.addEventListener("click", function () { player.pause(); player.next(); });
  resetBtn.addEventListener("click", function () { player.reset(); });
  randomBtn.addEventListener("click", function () {
    source = AlgoViz.randomArray(8, 1, 12);
    player.load(buildSteps(source));
  });
})();
