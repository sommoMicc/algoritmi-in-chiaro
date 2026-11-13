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

  let source = [6, 1, 8, 3, 7, 2, 5, 4];

  function buildSteps(arr) {
    const a = arr.slice();
    const steps = [];

    function mergeSort(lo, hi) {
      if (lo >= hi) return;
      const mid = Math.floor((lo + hi) / 2);
      steps.push({
        type: "divide",
        array: a.slice(),
        lo: lo,
        mid: mid,
        hi: hi,
        status: "Divido l'intervallo [" + lo + ", " + hi + "] a metà (punto " + mid + ")."
      });
      mergeSort(lo, mid);
      mergeSort(mid + 1, hi);

      const tmp = [];
      let i = lo;
      let j = mid + 1;
      while (i <= mid && j <= hi) {
        steps.push({
          type: "compare",
          array: a.slice(),
          lo: lo,
          hi: hi,
          i: i,
          k: j,
          status: "Unione: confronto " + a[i] + " e " + a[j] + " e prendo il più piccolo."
        });
        if (a[i] <= a[j]) tmp.push(a[i++]);
        else tmp.push(a[j++]);
      }
      while (i <= mid) tmp.push(a[i++]);
      while (j <= hi) tmp.push(a[j++]);
      for (let t = 0; t < tmp.length; t += 1) {
        a[lo + t] = tmp[t];
        steps.push({
          type: "write",
          array: a.slice(),
          lo: lo,
          hi: hi,
          i: lo + t,
          status: "Scrivo " + tmp[t] + " in posizione " + (lo + t) + "."
        });
      }
      steps.push({
        type: "merged",
        array: a.slice(),
        lo: lo,
        hi: hi,
        status: "Sotto-array da " + lo + " a " + hi + " unito e ordinato."
      });
    }

    mergeSort(0, a.length - 1);
    steps.push({
      type: "done",
      array: a.slice(),
      status: "Merge Sort completato: tutto l'array è ordinato."
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
      if (typeof step.mid === "number") {
        for (let i = step.lo; i <= step.mid; i += 1) classes[i] = "range-l";
        for (let i = step.mid + 1; i <= step.hi; i += 1) classes[i] = "range-r";
      }
    }
    if (step.type === "compare") {
      classes[step.i] = "compare";
      classes[step.k] = "compare";
    }
    if (step.type === "write") classes[step.i] = "write";
    if (step.type === "merged") {
      for (let i = step.lo; i <= step.hi; i += 1) classes[i] = "sorted";
    }
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
