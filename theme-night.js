(function () {
  "use strict";

  var NIGHT_BG = "#000114";
  var ACTIVE_CLASS = "night-theme-active";
  var ALTAR_MIN = "500px";
  var ALTAR_MAX = "860px";
  var ALTAR_ASPECT = "2084 / 718";
  var NIGHT_BACKGROUND = "assets/back_night.webp";
  var NIGHT_ALTAR = "assets/b_night.webp";

  function isNightBackgroundUrl(value) {
    return (value || "").indexOf("back_night") !== -1;
  }

  function isNightAltar(node) {
    return ((node && node.getAttribute("src")) || "").indexOf("b_night") !== -1;
  }

  function isNightActive() {
    if (document.body.classList.contains(ACTIVE_CLASS)) return true;
    if (document.body.classList.contains("codex-theme-night")) return true;
    if (document.body.dataset.currentTheme === "어두운 밤") return true;
    if (document.querySelector('#root div[style*="back_night"]')) return true;
    if (document.querySelector('img[src*="b_night"]')) return true;
    return false;
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      return isNightBackgroundUrl((node.style && node.style.backgroundImage) || "");
    }) || null;
  }

  function stabilizeAltar(altar) {
    if (!altar) return;
    if (!isNightAltar(altar)) {
      altar.setAttribute("src", NIGHT_ALTAR);
    }
    altar.style.display = "block";
    altar.style.opacity = "1";
    altar.style.visibility = "visible";
    altar.style.position = "relative";
    altar.style.zIndex = "100";
    altar.style.width = "100%";
    altar.style.minWidth = ALTAR_MIN;
    altar.style.maxWidth = ALTAR_MAX;
    altar.style.height = "auto";
    altar.style.aspectRatio = ALTAR_ASPECT;
    altar.style.objectFit = "contain";
    altar.style.objectPosition = "center bottom";
    altar.style.background = "transparent";
    altar.style.removeProperty("-webkit-mask-image");
    altar.style.removeProperty("mask-image");
    altar.style.removeProperty("max-height");
  }

  function stabilizeStage() {
    Array.from(document.querySelectorAll('div[class*="left-1/2"][class*="z-10"]')).forEach(function (node) {
      if (!node.querySelector('img[alt="altar"]')) return;
      node.style.width = "clamp(" + ALTAR_MIN + ", 85vw, " + ALTAR_MAX + ")";
      node.style.minWidth = ALTAR_MIN;
      node.style.maxWidth = ALTAR_MAX;
      node.style.overflow = "visible";
      node.style.zIndex = "30";
    });
  }

  function setNightMode(on) {
    document.documentElement.classList.toggle(ACTIVE_CLASS, on);
    document.body.classList.toggle(ACTIVE_CLASS, on);
    if (!on) {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      return;
    }
    document.documentElement.style.backgroundColor = NIGHT_BG;
    document.body.style.backgroundColor = NIGHT_BG;
  }

  function applyNightVisuals() {
    var on = isNightActive();
    setNightMode(on);
    if (!on) return;

    var rootShell = document.querySelector("#root > div");
    if (rootShell) rootShell.style.backgroundColor = NIGHT_BG;

    var background = findBackgroundNode();
    if (background) {
      if (!isNightBackgroundUrl(background.style.backgroundImage)) {
        background.style.backgroundImage = 'url("' + NIGHT_BACKGROUND + '")';
      }
      background.style.backgroundColor = NIGHT_BG;
      background.style.backgroundSize = "cover";
      background.style.backgroundPosition = "center center";
      background.style.backgroundRepeat = "no-repeat";
    }

    var front = document.querySelector(".night-front-gradient");
    if (front) front.style.display = "none";

    stabilizeStage();
    Array.from(document.querySelectorAll('img[alt="altar"]')).forEach(stabilizeAltar);
  }

  function start() {
    applyNightVisuals();

    document.addEventListener("click", function () {
      [0, 80, 260, 700].forEach(function (delay) {
        window.setTimeout(applyNightVisuals, delay);
      });
    }, true);

    var root = document.getElementById("root");
    if (root) {
      new MutationObserver(function () {
        applyNightVisuals();
      }).observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "src", "class"]
      });
    }

    new MutationObserver(function () {
      applyNightVisuals();
    }).observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-current-theme"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
