(function () {
  "use strict";

  var extraThemes = {
    mark: {
      label: "마가 다락방",
      bg: "assets/back_mark.webp",
      altar: "assets/b_mark.webp",
      color: "#3e2b21",
      position: "center 52%"
    },
    jonah: {
      label: "요나의 고래뱃속",
      bg: "assets/back_jonah.webp",
      altar: "assets/b_jonah.webp",
      color: "#000204",
      position: "center calc(50% - 8vh)"
    },
    sinal: {
      label: "모세의 시내산",
      bg: "assets/back_sinal.webp",
      altar: "assets/b_sinal.webp",
      color: "#536a83",
      position: "center calc(50% - 30vh)"
    }
  };

  var baseThemeLabels = ["사막의 제단", "겟세마네 동산", "어두운 밤", "여름 녹음"];
  var activeExtraTheme = "";
  var seeded = false;
  var themeClassByExtraTheme = {
    mark: "codex-theme-mark",
    jonah: "codex-theme-jonah",
    sinal: "codex-theme-sinal"
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function getText(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function findBackgroundNode() {
    var marked = document.querySelector('[data-codex-theme-background="true"]');
    if (marked) return marked;
    var nodes = Array.from(document.querySelectorAll("#root div"));
    return nodes.find(function (node) {
      var bg = node.style && node.style.backgroundImage;
      return bg && bg.indexOf("assets/back_") !== -1;
    }) || nodes.find(function (node) {
      var style = node.style || {};
      return style.backgroundSize === "cover" || style.backgroundPosition;
    }) || null;
  }

  function createLayers() {
    var root = document.getElementById("root");
    if (!root) return;
    Object.keys(extraThemes).forEach(function (theme) {
      var id = theme + "-theme-layer";
      if (document.getElementById(id)) return;
      var layer = document.createElement("div");
      layer.id = id;
      layer.setAttribute("aria-hidden", "true");
      if (theme === "sinal") {
        var lightning = document.createElement("span");
        lightning.className = "sinal-lightning";
        layer.appendChild(lightning);
      }
      document.body.insertBefore(layer, root);
    });
  }

  function seedLayer(layerId, className, count, options) {
    var layer = document.getElementById(layerId);
    if (!layer || layer.dataset.seeded === "true") return;
    layer.dataset.seeded = "true";
    for (var i = 0; i < count; i += 1) {
      var dot = document.createElement("span");
      dot.className = className;
      dot.style.setProperty("--x", (options.xMin + Math.random() * (options.xMax - options.xMin)).toFixed(2) + "%");
      dot.style.setProperty("--y", (options.yMin + Math.random() * (options.yMax - options.yMin)).toFixed(2) + "%");
      dot.style.setProperty("--size", (options.sizeMin + Math.random() * (options.sizeMax - options.sizeMin)).toFixed(2) + "px");
      dot.style.setProperty("--duration", (options.durationMin + Math.random() * (options.durationMax - options.durationMin)).toFixed(2) + "s");
      dot.style.setProperty("--delay", (-Math.random() * options.delayMax).toFixed(2) + "s");
      if (options.widthMin) dot.style.setProperty("--w", (options.widthMin + Math.random() * (options.widthMax - options.widthMin)).toFixed(2) + "px");
      if (options.heightMin) dot.style.setProperty("--h", (options.heightMin + Math.random() * (options.heightMax - options.heightMin)).toFixed(2) + "px");
      layer.appendChild(dot);
    }
  }

  function seedJonahRipples() {
    var layer = document.getElementById("jonah-theme-layer");
    if (!layer || layer.dataset.ripplesSeeded === "true") return;
    layer.dataset.ripplesSeeded = "true";
    [
      { x: "0px", y: "0px", w: "420px", h: "82px", r: "-17deg", sx: "1.72", o: "0.12", dx: "-54px", dy: "24px", dr: "-5deg", d: "18s", delay: "-4s" },
      { x: "0px", y: "0px", w: "560px", h: "106px", r: "-11deg", sx: "1.95", o: "0.10", dx: "42px", dy: "18px", dr: "4deg", d: "23s", delay: "-11s" },
      { x: "0px", y: "0px", w: "640px", h: "124px", r: "-22deg", sx: "2.12", o: "0.09", dx: "-72px", dy: "32px", dr: "-6deg", d: "27s", delay: "-17s" },
      { x: "0px", y: "0px", w: "500px", h: "98px", r: "9deg", sx: "1.62", o: "0.08", dx: "62px", dy: "-8px", dr: "5deg", d: "25s", delay: "-7s" },
      { x: "0px", y: "0px", w: "780px", h: "148px", r: "-7deg", sx: "2.28", o: "0.07", dx: "28px", dy: "38px", dr: "3deg", d: "31s", delay: "-21s" }
    ].forEach(function (config) {
      var ripple = document.createElement("span");
      ripple.className = "jonah-depth-ripple";
      ripple.style.setProperty("--x", config.x);
      ripple.style.setProperty("--y", config.y);
      ripple.style.setProperty("--w", config.w);
      ripple.style.setProperty("--h", config.h);
      ripple.style.setProperty("--r", config.r);
      ripple.style.setProperty("--sx", config.sx);
      ripple.style.setProperty("--o", config.o);
      ripple.style.setProperty("--dx", config.dx);
      ripple.style.setProperty("--dy", config.dy);
      ripple.style.setProperty("--dr", config.dr);
      ripple.style.setProperty("--duration", config.d);
      ripple.style.setProperty("--delay", config.delay);
      layer.appendChild(ripple);
    });
  }

  function syncJonahRippleAnchor() {
    var layer = document.getElementById("jonah-theme-layer");
    var altar = document.querySelector('img[alt="altar"]');
    if (!layer || !altar) return;
    var rect = altar.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    layer.style.setProperty("--altar-x", (rect.left + rect.width / 2).toFixed(2) + "px");
    layer.style.setProperty("--altar-y", (rect.top + rect.height * 0.38).toFixed(2) + "px");
  }

  function isPrayerActive() {
    return Array.from(document.querySelectorAll("button")).some(function (button) {
      var label = getText(button);
      return label.indexOf("기도 중") !== -1 || label.indexOf("기도중") !== -1;
    });
  }

  function syncPrayerState() {
    document.body.dataset.prayerState = isPrayerActive() ? "praying" : "waiting";
  }

  function seedEffects() {
    if (seeded) return;
    seeded = true;
    seedLayer("mark-theme-layer", "mark-dust", 24, {
      xMin: 12, xMax: 88, yMin: 18, yMax: 78, sizeMin: 1.4, sizeMax: 3.3, durationMin: 9, durationMax: 16, delayMax: 10
    });
    seedLayer("jonah-theme-layer", "jonah-particle", 28, {
      xMin: 10, xMax: 90, yMin: 16, yMax: 86, sizeMin: 1.5, sizeMax: 4.2, durationMin: 11, durationMax: 21, delayMax: 14
    });
    seedJonahRipples();
    seedLayer("sinal-theme-layer", "sinal-mist", 5, {
      xMin: 0, xMax: 86, yMin: 50, yMax: 82, sizeMin: 1, sizeMax: 2, durationMin: 15, durationMax: 26, delayMax: 12, widthMin: 180, widthMax: 340, heightMin: 56, heightMax: 110
    });
  }

  function updateThemeLabels(label) {
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      if (!node.childElementCount && /^(사막의 제단|겟세마네 동산|어두운 밤|여름 녹음|마가 다락방|요나의 고래뱃속|모세의 시내산)$/.test(getText(node))) {
        node.textContent = label;
      }
    });
  }

  function updateMenuActive(theme) {
    Array.from(document.querySelectorAll("button[data-codex-theme]")).forEach(function (button) {
      button.classList.toggle("codex-theme-active", button.dataset.codexTheme === theme);
      button.toggleAttribute("aria-current", button.dataset.codexTheme === theme);
    });
    if (!theme) return;
    Array.from(document.querySelectorAll("button")).forEach(function (button) {
      if (button.dataset.codexTheme) return;
      var label = getText(button);
      if (!baseThemeLabels.some(function (themeLabel) { return label.indexOf(themeLabel) !== -1; })) return;
      button.classList.remove("bg-white/20", "text-amber-300");
      button.classList.add("text-white/70", "hover:bg-white/10", "hover:text-white");
      Array.from(button.querySelectorAll("div")).forEach(function (node) {
        var className = typeof node.className === "string" ? node.className : "";
        if (className.indexOf("bg-amber-400") !== -1) node.remove();
      });
    });
  }

  function markExtraThemeClass(theme) {
    Object.keys(themeClassByExtraTheme).forEach(function (key) {
      document.body.classList.toggle(themeClassByExtraTheme[key], key === theme);
    });
  }

  function closeThemeMenuSoon(sourceButton) {
    var menu = sourceButton && sourceButton.parentElement;
    var wrapper = menu && menu.parentElement;
    if (!wrapper) return;
    var toggle = Array.from(wrapper.children).find(function (node) {
      return node.tagName === "BUTTON" && !node.dataset.codexTheme && getText(node).length === 0;
    });
    if (!toggle) return;
    window.setTimeout(function () {
      toggle.click();
    }, 40);
  }

  function applyExtraTheme(theme) {
    var config = extraThemes[theme];
    if (!config) return;
    activeExtraTheme = theme;
    document.body.dataset.theme = theme;
    document.body.dataset.currentTheme = config.label;
    document.body.removeAttribute("data-extra-theme");
    markExtraThemeClass(theme);
    document.body.style.backgroundColor = config.color;

    var background = findBackgroundNode();
    if (background) {
      background.dataset.codexThemeBackground = "true";
      background.style.backgroundImage = 'url("' + config.bg + '")';
      background.style.backgroundPosition = config.position;
      background.style.backgroundColor = config.color;
      background.style.opacity = "1";
    }

    var altar = document.querySelector('img[alt="altar"]');
    if (altar) {
      var reloadSrc = config.altar + "?reload=" + Date.now();
      if (altar.getAttribute("src") !== reloadSrc) altar.setAttribute("src", reloadSrc);
      altar.style.removeProperty("transform");
      altar.style.removeProperty("filter");
      altar.style.removeProperty("width");
      altar.style.removeProperty("max-width");
      altar.style.removeProperty("height");
      altar.style.removeProperty("max-height");
      altar.style.removeProperty("margin-left");
      altar.style.removeProperty("margin-right");
      altar.style.removeProperty("transition");
      altar.style.removeProperty("animation");
    }

    updateThemeLabels(config.label);
    updateMenuActive(theme);
    syncPrayerState();
    if (theme === "jonah") {
      syncJonahRippleAnchor();
      window.setTimeout(syncJonahRippleAnchor, 80);
      window.setTimeout(syncJonahRippleAnchor, 260);
    }
    window.setTimeout(function () {
      if (activeExtraTheme === theme) applyExtraTheme(theme);
    }, 160);
  }

  function clearExtraThemeSoon() {
    activeExtraTheme = "";
    updateMenuActive("");
    markExtraThemeClass("");
    document.body.removeAttribute("data-theme");
    document.body.style.backgroundColor = "";
    window.setTimeout(function () {
      var background = document.querySelector('[data-codex-theme-background="true"]');
      if (background) {
        background.removeAttribute("data-codex-theme-background");
        background.style.removeProperty("background-image");
        background.style.removeProperty("background-position");
        background.style.removeProperty("background-color");
        background.style.removeProperty("opacity");
      }
      var altar = document.querySelector('img[alt="altar"]');
      if (altar) {
        altar.style.removeProperty("filter");
        altar.style.removeProperty("width");
        altar.style.removeProperty("max-width");
        altar.style.removeProperty("margin-left");
        altar.style.removeProperty("margin-right");
      }
    }, 40);
  }

  function makeThemeButton(theme) {
    var config = extraThemes[theme];
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.codexTheme = theme;
    button.className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white";
    button.innerHTML = '<span style="width:16px;text-align:center;opacity:.78">✦</span><span>' + config.label + '</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      applyExtraTheme(theme);
      document.dispatchEvent(new CustomEvent("codex-bgm-theme-change", { detail: { theme: theme } }));
      closeThemeMenuSoon(button);
    });
    return button;
  }

  function injectMenuButtons() {
    var desertButton = Array.from(document.querySelectorAll("button")).find(function (button) {
      return getText(button).indexOf("사막의 제단") !== -1;
    });
    if (!desertButton || !desertButton.parentElement) return;
    var menu = desertButton.parentElement;
    Object.keys(extraThemes).forEach(function (theme) {
      if (!menu.querySelector('[data-codex-theme="' + theme + '"]')) {
        menu.appendChild(makeThemeButton(theme));
      }
    });
    updateMenuActive(activeExtraTheme);
  }

  function scheduleMenuInjection() {
    [40, 160, 420, 900].forEach(function (delay) {
      window.setTimeout(injectMenuButtons, delay);
    });
  }

  ready(function () {
    createLayers();
    seedEffects();
    syncJonahRippleAnchor();
    syncPrayerState();
    window.addEventListener("resize", syncJonahRippleAnchor);
    scheduleMenuInjection();
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var label = getText(button);
      if (baseThemeLabels.some(function (themeLabel) { return label.indexOf(themeLabel) !== -1; })) {
        clearExtraThemeSoon();
      }
      if (label.length < 2 || label === "CCM") {
        scheduleMenuInjection();
      }
      window.setTimeout(syncPrayerState, 40);
      window.setTimeout(syncPrayerState, 240);
    });
    var root = document.getElementById("root");
    if (root) {
      new MutationObserver(function () {
        syncPrayerState();
        updateMenuActive(activeExtraTheme);
        if (activeExtraTheme === "jonah") syncJonahRippleAnchor();
      }).observe(root, { childList: true, subtree: true, characterData: true });
    }
  });
})();
