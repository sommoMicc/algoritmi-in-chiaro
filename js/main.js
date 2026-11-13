(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".code-tabs").forEach(function (tabs) {
    const buttons = tabs.querySelectorAll(".tablist button");
    const panels = tabs.querySelectorAll("pre");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const lang = btn.getAttribute("data-lang");
        buttons.forEach(function (b) {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute("data-lang") !== lang;
        });
      });
    });
  });
})();
