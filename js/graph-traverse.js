(function () {
  const root = document.getElementById("graph-viz");
  if (!root) return;

  const algo = root.getAttribute("data-algo"); // "bfs" | "dfs"
  const svg = document.getElementById("graph-svg");
  const statusEl = document.getElementById("viz-status");
  const frontierEl = document.getElementById("frontier");
  const playBtn = document.getElementById("btn-play");
  const pauseBtn = document.getElementById("btn-pause");
  const stepBtn = document.getElementById("btn-step");
  const resetBtn = document.getElementById("btn-reset");
  const speedEl = document.getElementById("speed");
  const startEl = document.getElementById("start-node");
  const modeEl = document.getElementById("mode");

  const ADJ = {
    A: ["B", "C"],
    B: ["A", "D", "E"],
    C: ["A", "E", "F"],
    D: ["B"],
    E: ["B", "C", "G"],
    F: ["C"],
    G: ["E"]
  };
  const POS = {
    A: [320, 46],
    B: [170, 130],
    C: [470, 130],
    D: [70, 230],
    E: [260, 240],
    F: [570, 230],
    G: [390, 310]
  };
  const NODES = Object.keys(ADJ);

  const svgNS = "http://www.w3.org/2000/svg";
  const edgeEls = {};
  const nodeEls = {};
  const labelEls = {};

  function edgeKey(u, v) {
    return u < v ? u + "-" + v : v + "-" + u;
  }

  function drawGraph() {
    svg.innerHTML = "";
    const seen = {};
    NODES.forEach(function (u) {
      ADJ[u].forEach(function (v) {
        const k = edgeKey(u, v);
        if (seen[k]) return;
        seen[k] = true;
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", POS[u][0]);
        line.setAttribute("y1", POS[u][1]);
        line.setAttribute("x2", POS[v][0]);
        line.setAttribute("y2", POS[v][1]);
        line.setAttribute("class", "graph-edge");
        svg.appendChild(line);
        edgeEls[k] = line;
      });
    });
    NODES.forEach(function (u) {
      const g = document.createElementNS(svgNS, "g");
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", POS[u][0]);
      c.setAttribute("cy", POS[u][1]);
      c.setAttribute("r", 22);
      c.setAttribute("class", "graph-node-disc");
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", POS[u][0]);
      t.setAttribute("y", POS[u][1] + 1);
      t.setAttribute("class", "graph-node-label");
      t.textContent = u;
      g.appendChild(c);
      g.appendChild(t);
      svg.appendChild(g);
      nodeEls[u] = c;
      labelEls[u] = t;
    });
  }

  function paint(step) {
    NODES.forEach(function (u) {
      nodeEls[u].setAttribute("class", "graph-node-disc");
      labelEls[u].setAttribute("class", "graph-node-label");
    });
    Object.keys(edgeEls).forEach(function (k) {
      edgeEls[k].setAttribute("class", "graph-edge");
    });
    if (!step || step.type === "reset") {
      renderFrontier([], algo === "bfs" ? "Coda" : "Pila");
      return;
    }
    (step.visited || []).forEach(function (u) {
      nodeEls[u].setAttribute("class", "graph-node-disc visited");
      labelEls[u].setAttribute("class", "graph-node-label on-dark");
    });
    (step.frontier || []).forEach(function (u) {
      if ((step.visited || []).indexOf(u) === -1) {
        nodeEls[u].setAttribute("class", "graph-node-disc queued");
        labelEls[u].setAttribute("class", "graph-node-label");
      }
    });
    if (step.current) {
      nodeEls[step.current].setAttribute("class", "graph-node-disc current");
      labelEls[step.current].setAttribute("class", "graph-node-label");
    }
    (step.treeEdges || []).forEach(function (e) {
      const el = edgeEls[edgeKey(e[0], e[1])];
      if (el) el.setAttribute("class", "graph-edge tree");
    });
    renderFrontier(step.frontier || [], step.frontierLabel || "");
  }

  function renderFrontier(items, label) {
    frontierEl.innerHTML = "";
    const title = document.createElement("strong");
    title.textContent = label + (label ? ": " : "");
    frontierEl.appendChild(title);
    if (!items.length) {
      const empty = document.createElement("span");
      empty.textContent = "vuota";
      frontierEl.appendChild(empty);
      return;
    }
    items.forEach(function (id, i) {
      const tok = document.createElement("span");
      tok.className = "tok" + (i === 0 ? " head" : "");
      tok.textContent = id;
      frontierEl.appendChild(tok);
    });
  }

  function buildBfsIter(start) {
    const steps = [];
    const visited = new Set([start]);
    const q = [start];
    const treeEdges = [];
    const parent = {};
    steps.push({
      type: "start",
      current: null,
      visited: [],
      frontier: q.slice(),
      frontierLabel: "Coda",
      treeEdges: [],
      status: "Inserisco " + start + " in coda e lo segno come scoperto. La BFS parte da qui."
    });
    while (q.length) {
      const u = q.shift();
      steps.push({
        type: "visit",
        current: u,
        visited: Array.from(visited),
        frontier: q.slice(),
        frontierLabel: "Coda",
        treeEdges: treeEdges.map(function (e) { return e.slice(); }),
        status: "Estraggo " + u + " dalla testa della coda e lo visito."
      });
      ADJ[u].forEach(function (v) {
        if (!visited.has(v)) {
          visited.add(v);
          parent[v] = u;
          q.push(v);
          treeEdges.push([u, v]);
          steps.push({
            type: "discover",
            current: u,
            visited: Array.from(visited),
            frontier: q.slice(),
            frontierLabel: "Coda",
            treeEdges: treeEdges.map(function (e) { return e.slice(); }),
            status: "Scopro " + v + " da " + u + " e lo metto in coda. Lo visiterò più tardi, dopo chi è già in fila."
          });
        }
      });
    }
    steps.push({
      type: "done",
      current: null,
      visited: Array.from(visited),
      frontier: [],
      frontierLabel: "Coda",
      treeEdges: treeEdges.map(function (e) { return e.slice(); }),
      status: "Coda vuota: la visita in ampiezza è finita. L'ordine rispetta la distanza da " + start + "."
    });
    return steps;
  }

  function buildBfsRec(start) {
    const steps = [];
    const visited = new Set([start]);
    const treeEdges = [];

    function level(nodes, depth) {
      if (!nodes.length) return;
      steps.push({
        type: "level",
        current: null,
        visited: Array.from(visited),
        frontier: nodes.slice(),
        frontierLabel: "Livello " + depth,
        treeEdges: treeEdges.map(function (e) { return e.slice(); }),
        status: "Livello " + depth + ": visito insieme i nodi " + nodes.join(", ") + "."
      });
      const next = [];
      nodes.forEach(function (u) {
        steps.push({
          type: "visit",
          current: u,
          visited: Array.from(visited),
          frontier: nodes.slice(),
          frontierLabel: "Livello " + depth,
          treeEdges: treeEdges.map(function (e) { return e.slice(); }),
          status: "Visito " + u + " (distanza " + depth + " da " + start + ")."
        });
        ADJ[u].forEach(function (v) {
          if (!visited.has(v)) {
            visited.add(v);
            next.push(v);
            treeEdges.push([u, v]);
            steps.push({
              type: "discover",
              current: u,
              visited: Array.from(visited),
              frontier: next.slice(),
              frontierLabel: "Prossimo livello",
              treeEdges: treeEdges.map(function (e) { return e.slice(); }),
              status: "Scopro " + v + " da " + u + ": andrà nel livello " + (depth + 1) + "."
            });
          }
        });
      });
      level(next, depth + 1);
    }

    steps.push({
      type: "start",
      current: null,
      visited: [],
      frontier: [start],
      frontierLabel: "Livello 0",
      treeEdges: [],
      status: "La variante ricorsiva passa il livello corrente come argomento. Parto da " + start + "."
    });
    level([start], 0);
    steps.push({
      type: "done",
      current: null,
      visited: Array.from(visited),
      frontier: [],
      frontierLabel: "Livello",
      treeEdges: treeEdges.map(function (e) { return e.slice(); }),
      status: "Nessun nodo nel livello successivo: la BFS ricorsiva termina. L'ordine è lo stesso della versione con coda."
    });
    return steps;
  }

  function buildDfsRec(start) {
    const steps = [];
    const visited = new Set();
    const treeEdges = [];
    const stack = [];

    function dfs(u) {
      visited.add(u);
      stack.push(u);
      steps.push({
        type: "visit",
        current: u,
        visited: Array.from(visited),
        frontier: stack.slice(),
        frontierLabel: "Pila di chiamate",
        treeEdges: treeEdges.map(function (e) { return e.slice(); }),
        status: "Entro in " + u + " e lo visito subito. Poi scendo sul primo vicino non ancora visitato."
      });
      ADJ[u].forEach(function (v) {
        if (!visited.has(v)) {
          treeEdges.push([u, v]);
          steps.push({
            type: "discover",
            current: u,
            visited: Array.from(visited),
            frontier: stack.concat([v]),
            frontierLabel: "Pila di chiamate",
            treeEdges: treeEdges.map(function (e) { return e.slice(); }),
            status: "Da " + u + " scendo su " + v + " (chiamata ricorsiva)."
          });
          dfs(v);
          steps.push({
            type: "back",
            current: u,
            visited: Array.from(visited),
            frontier: stack.slice(),
            frontierLabel: "Pila di chiamate",
            treeEdges: treeEdges.map(function (e) { return e.slice(); }),
            status: "Torno indietro a " + u + " e guardo se ha altri vicini da esplorare."
          });
        }
      });
      stack.pop();
    }

    steps.push({
      type: "start",
      current: null,
      visited: [],
      frontier: [start],
      frontierLabel: "Pila di chiamate",
      treeEdges: [],
      status: "DFS ricorsiva: la pila è quella delle chiamate. Parto da " + start + "."
    });
    dfs(start);
    steps.push({
      type: "done",
      current: null,
      visited: Array.from(visited),
      frontier: [],
      frontierLabel: "Pila di chiamate",
      treeEdges: treeEdges.map(function (e) { return e.slice(); }),
      status: "La pila è vuota: non restano rami da esplorare."
    });
    return steps;
  }

  function buildDfsIter(start) {
    const steps = [];
    const visited = new Set();
    const stack = [start];
    const treeEdges = [];
    const parent = {};
    steps.push({
      type: "start",
      current: null,
      visited: [],
      frontier: stack.slice(),
      frontierLabel: "Pila",
      treeEdges: [],
      status: "Metto " + start + " sulla pila esplicita. In iterativa la gestisci tu, non il runtime."
    });
    while (stack.length) {
      const u = stack.pop();
      if (visited.has(u)) {
        steps.push({
          type: "skip",
          current: u,
          visited: Array.from(visited),
          frontier: stack.slice(),
          frontierLabel: "Pila",
          treeEdges: treeEdges.map(function (e) { return e.slice(); }),
          status: u + " è già stato visitato: lo ignoro e passo al successivo in cima alla pila."
        });
        continue;
      }
      visited.add(u);
      if (parent[u]) treeEdges.push([parent[u], u]);
      steps.push({
        type: "visit",
        current: u,
        visited: Array.from(visited),
        frontier: stack.slice(),
        frontierLabel: "Pila",
        treeEdges: treeEdges.map(function (e) { return e.slice(); }),
        status: "Estraggo " + u + " dalla cima della pila e lo visito."
      });
      const neigh = ADJ[u].slice().reverse();
      neigh.forEach(function (v) {
        if (!visited.has(v)) {
          parent[v] = u;
          stack.push(v);
          steps.push({
            type: "push",
            current: u,
            visited: Array.from(visited),
            frontier: stack.slice(),
            frontierLabel: "Pila",
            treeEdges: treeEdges.map(function (e) { return e.slice(); }),
            status: "Inserisco " + v + " in pila (i vicini vanno in ordine inverso, per visitare prima quelli di sinistra come nella ricorsiva)."
          });
        }
      });
    }
    steps.push({
      type: "done",
      current: null,
      visited: Array.from(visited),
      frontier: [],
      frontierLabel: "Pila",
      treeEdges: treeEdges.map(function (e) { return e.slice(); }),
      status: "Pila vuota: la DFS iterativa è finita. L'ordine di visita è lo stesso della versione ricorsiva."
    });
    return steps;
  }

  function currentSteps() {
    const start = startEl.value || "A";
    const mode = modeEl.value;
    if (algo === "bfs") {
      return mode === "rec" ? buildBfsRec(start) : buildBfsIter(start);
    }
    return mode === "iter" ? buildDfsIter(start) : buildDfsRec(start);
  }

  function apply(step) {
    paint(step.type === "reset" ? { type: "reset" } : step);
  }

  drawGraph();
  const player = AlgoViz.createPlayer({
    steps: currentSteps(),
    delay: 750,
    apply: apply,
    onStatus: function (text) { statusEl.textContent = text; }
  });
  AlgoViz.bindSpeed(speedEl, player);
  player.reset();

  function reload() {
    player.load(currentSteps());
  }

  playBtn.addEventListener("click", function () { player.play(); });
  pauseBtn.addEventListener("click", function () { player.pause(); });
  stepBtn.addEventListener("click", function () { player.pause(); player.next(); });
  resetBtn.addEventListener("click", function () { player.reset(); });
  startEl.addEventListener("change", reload);
  modeEl.addEventListener("change", reload);
})();
