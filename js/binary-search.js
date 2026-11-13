(function () {
  const cellsEl = document.getElementById("cells");
  const statusEl = document.getElementById("viz-status");
  const playBtn = document.getElementById("btn-play");
  const pauseBtn = document.getElementById("btn-pause");
  const stepBtn = document.getElementById("btn-step");
  const resetBtn = document.getElementById("btn-reset");
  const targetEl = document.getElementById("target");
  const speedEl = document.getElementById("speed");
  if (!cellsEl) return;

  const source = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];

  function buildSteps(arr, target) {
    const steps = [];
    let low = 0;
    let high = arr.length - 1;
    steps.push({
      type: "start",
      low: low,
      high: high,
      mid: null,
      target: target,
      status: "Cerco " + target + " nell'array ordinato. L'intervallo iniziale è l'intero array."
    });
    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2);
      steps.push({
        type: "mid",
        low: low,
        high: high,
        mid: mid,
        target: target,
        status: "Il punto medio è l'indice " + mid + ", valore " + arr[mid] + "."
      });
      if (arr[mid] === target) {
        steps.push({
          type: "found",
          low: mid,
          high: mid,
          mid: mid,
          found: mid,
          target: target,
          status: "Trovato: " + target + " si trova all'indice " + mid + "."
        });
        return steps;
      }
      if (arr[mid] < target) {
        steps.push({
          type: "right",
          low: low,
          high: high,
          mid: mid,
          discardTo: mid,
          target: target,
          status: arr[mid] + " è minore di " + target + ": scarto la metà sinistra e sposto low a " + (mid + 1) + "."
        });
        low = mid + 1;
      } else {
        steps.push({
          type: "left",
          low: low,
          high: high,
          mid: mid,
          discardFrom: mid,
          target: target,
          status: arr[mid] + " è maggiore di " + target + ": scarto la metà destra e sposto high a " + (mid - 1) + "."
        });
        high = mid - 1;
      }
    }
    steps.push({
      type: "missing",
      low: low,
      high: high,
      mid: null,
      target: target,
      status: target + " non è presente nell'array. L'algoritmo termina correttamente."
    });
    return steps;
  }

  function render(step) {
    cellsEl.innerHTML = "";
    source.forEach(function (value, i) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = String(value);
      if (!step || step.type === "reset") {
        cellsEl.appendChild(cell);
        return;
      }
      if (step.type === "missing") {
        cell.classList.add("discard");
      } else {
        if (typeof step.low === "number" && i < step.low) cell.classList.add("discard");
        if (typeof step.high === "number" && i > step.high) cell.classList.add("discard");
      }
      if (step.type === "found" && i === step.found) {
        cell.classList.remove("discard");
        cell.classList.add("found");
      } else if (step.mid === i && step.type !== "found") {
        cell.classList.add("mid");
      }
      const labels = [];
      if (step.low === i) labels.push("low");
      if (step.mid === i) labels.push("mid");
      if (step.high === i) labels.push("high");
      if (labels.length) {
        const ptr = document.createElement("span");
        ptr.className = "ptr";
        ptr.textContent = labels.join(" · ");
        cell.appendChild(ptr);
      }
      cellsEl.appendChild(cell);
    });
  }

  function apply(step) {
    if (step.type === "reset") {
      render({ type: "reset" });
      return;
    }
    render(step);
  }

  function currentTarget() {
    const n = Number(targetEl.value);
    return Number.isFinite(n) ? n : 23;
  }

  const player = AlgoViz.createPlayer({
    steps: buildSteps(source, currentTarget()),
    delay: 800,
    apply: apply,
    onStatus: function (text) { statusEl.textContent = text; }
  });

  AlgoViz.bindSpeed(speedEl, player);
  player.reset();

  playBtn.addEventListener("click", function () { player.play(); });
  pauseBtn.addEventListener("click", function () { player.pause(); });
  stepBtn.addEventListener("click", function () { player.pause(); player.next(); });
  resetBtn.addEventListener("click", function () {
    player.load(buildSteps(source, currentTarget()));
  });
  targetEl.addEventListener("change", function () {
    player.load(buildSteps(source, currentTarget()));
  });
})();
