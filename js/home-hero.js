(function () {
  const barsEl = document.getElementById("hero-bars");
  if (!barsEl || !window.AlgoViz) return;
  let values = [4, 9, 2, 7, 1, 6, 3, 8];

  function bubbleSteps(arr) {
    const a = arr.slice();
    const steps = [];
    const n = a.length;
    for (let i = 0; i < n - 1; i += 1) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j += 1) {
        steps.push({ type: "compare", array: a.slice(), i: j, k: j + 1, sortedFrom: n - i });
        if (a[j] > a[j + 1]) {
          const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = true;
          steps.push({ type: "swap", array: a.slice(), i: j, k: j + 1, sortedFrom: n - i });
        }
      }
      if (!swapped) break;
    }
    steps.push({ type: "done", array: a.slice() });
    return steps;
  }

  function apply(step) {
    const vals = step.type === "reset" ? values : step.array;
    const classes = {};
    if (step.type === "compare") { classes[step.i] = "compare"; classes[step.k] = "compare"; }
    if (step.type === "swap") { classes[step.i] = "swap"; classes[step.k] = "swap"; }
    if (typeof step.sortedFrom === "number") {
      for (let i = step.sortedFrom; i < vals.length; i += 1) classes[i] = "sorted";
    }
    if (step.type === "done") vals.forEach(function (_, i) { classes[i] = "sorted"; });
    AlgoViz.renderBars(barsEl, vals, classes);
  }

  const player = AlgoViz.createPlayer({
    steps: bubbleSteps(values),
    delay: 420,
    apply: apply,
    onStatus: function () {},
    onDone: function () {
      setTimeout(function () {
        values = AlgoViz.randomArray(8, 1, 10);
        player.load(bubbleSteps(values));
        player.play();
      }, 1200);
    }
  });
  player.reset();
  player.play();
})();
