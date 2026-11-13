/* Motore condiviso per le visualizzazioni passo-passo. */
(function (global) {
  function createPlayer(options) {
    const state = {
      steps: options.steps || [],
      index: -1,
      playing: false,
      timer: null,
      delay: options.delay || 550,
      apply: options.apply,
      onStatus: options.onStatus || function () {},
      onDone: options.onDone || function () {}
    };

    function clearTimer() {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
    }

    function show(i) {
      state.index = i;
      if (i < 0) {
        state.apply({ type: "reset" }, -1);
        state.onStatus("Pronto. Premi Avvia oppure avanza di un passo.");
        return;
      }
      const step = state.steps[i];
      state.apply(step, i);
      if (step.status) state.onStatus(step.status);
      if (i === state.steps.length - 1) {
        state.playing = false;
        clearTimer();
        state.onDone();
      }
    }

    function next() {
      if (state.index >= state.steps.length - 1) return;
      show(state.index + 1);
    }

    function play() {
      if (state.index >= state.steps.length - 1) show(-1);
      state.playing = true;
      function tick() {
        if (!state.playing) return;
        if (state.index >= state.steps.length - 1) {
          state.playing = false;
          return;
        }
        next();
        if (state.playing && state.index < state.steps.length - 1) {
          state.timer = setTimeout(tick, state.delay);
        }
      }
      tick();
    }

    function pause() {
      state.playing = false;
      clearTimer();
    }

    function reset() {
      pause();
      show(-1);
    }

    function setDelay(ms) {
      state.delay = ms;
    }

    function load(steps) {
      pause();
      state.steps = steps;
      show(-1);
    }

    return { play, pause, next, reset, setDelay, load, state };
  }

  function renderBars(container, values, classesByIndex, maxValue) {
    const max = maxValue || Math.max.apply(null, values);
    container.innerHTML = "";
    values.forEach(function (value, i) {
      const bar = document.createElement("div");
      bar.className = "bar" + (classesByIndex[i] ? " " + classesByIndex[i] : "");
      bar.style.height = Math.max(18, (value / max) * 100) + "%";
      bar.textContent = String(value);
      bar.setAttribute("title", String(value));
      container.appendChild(bar);
    });
  }

  function randomArray(n, min, max) {
    const out = [];
    for (let i = 0; i < n; i += 1) {
      out.push(min + Math.floor(Math.random() * (max - min + 1)));
    }
    return out;
  }

  function bindSpeed(input, player) {
    if (!input) return;
    const apply = function () {
      const v = Number(input.value);
      player.setDelay(1100 - v * 10);
    };
    input.addEventListener("input", apply);
    apply();
  }

  global.AlgoViz = { createPlayer, renderBars, randomArray, bindSpeed };
})(window);
