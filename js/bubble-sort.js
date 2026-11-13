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

  let source = [7, 3, 9, 2, 5, 1, 8, 4];

  function buildSteps(arr) {
    const a = arr.slice();
    const steps = [];
    const n = a.length;
    for (let i = 0; i < n - 1; i += 1) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j += 1) {
        steps.push({
          type: "compare",
          array: a.slice(),
          i: j,
          k: j + 1,
          sortedFrom: n - i,
          status: "Confronto " + a[j] + " e " + a[j + 1] + "."
        });
        if (a[j] > a[j + 1]) {
          const tmp = a[j];
          a[j] = a[j + 1];
          a[j + 1] = tmp;
          swapped = true;
          steps.push({
            type: "swap",
            array: a.slice(),
            i: j,
            k: j + 1,
            sortedFrom: n - i,
            status: "Sono fuori ordine: scambio " + a[j + 1] + " e " + a[j] + "."
          });
        }
      }
      steps.push({
        type: "mark",
        array: a.slice(),
        sortedFrom: n - i - 1,
        status: "Il valore " + a[n - 1 - i] + " è arrivato in posizione definitiva."
      });
      if (!swapped) {
        steps.push({
          type: "early",
          array: a.slice(),
          sortedFrom: 0,
          status: "Nessuno scambio in questo giro: l'array è già ordinato. Uscita anticipata."
        });
        break;
      }
    }
    steps.push({
      type: "done",
      array: a.slice(),
      sortedFrom: 0,
      status: "Ordinamento completato."
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
    if (typeof step.sortedFrom === "number") {
      for (let i = step.sortedFrom; i < values.length; i += 1) classes[i] = "sorted";
    }
    if (step.type === "compare") {
      classes[step.i] = "compare";
      classes[step.k] = "compare";
    }
    if (step.type === "swap") {
      classes[step.i] = "swap";
      classes[step.k] = "swap";
    }
    if (step.type === "done" || step.type === "early") {
      values.forEach(function (_, i) { classes[i] = "sorted"; });
    }
    AlgoViz.renderBars(barsEl, values, classes);
  }

  const player = AlgoViz.createPlayer({
    steps: buildSteps(source),
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
