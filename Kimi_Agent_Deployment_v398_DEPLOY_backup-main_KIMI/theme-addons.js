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
  var sinalBackgroundSize = { width: 2912, height: 1632 };
  var sinalPeakAnchor = { x: 0.54, y: 0.52 };
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
    if (!root) { console.error("[SINAL DEBUG] #root not found"); return; }
    Object.keys(extraThemes).forEach(function (theme) {
      try {
        var id = theme + "-theme-layer";
        if (document.getElementById(id)) return;
        var layer = document.createElement("div");
        layer.id = id;
        layer.setAttribute("aria-hidden", "true");
        if (theme === "sinal") {
        ["left", "right"].forEach(function (side) {
          var cloud = document.createElement("span");
          cloud.className = "sinal-top-cloud sinal-top-cloud-" + side;
          layer.appendChild(cloud);
        });
    console.log("[SINAL] seedEffects done");
        var flash = document.createElement("span");
        flash.className = "sinal-lightning-flash";
        layer.appendChild(flash);
        var peakGlow = document.createElement("span");
        peakGlow.className = "sinal-peak-glow";
        layer.appendChild(peakGlow);
        [
          { name: "01-left", width: 33, height: 659, duration: "4s" },
          { name: "02-center-left", width: 62, height: 870, duration: "5.5s" },
          { name: "03-center-branch", width: 355, height: 820, duration: "7s" },
          { name: "04-right", width: 355, height: 537, duration: "8.5s" }
        ].forEach(function (config, index) {
          var lightning = document.createElement("span");
          lightning.className = "sinal-lightning sinal-lightning-" + config.name;
          lightning.dataset.sourceWidth = String(config.width);
          lightning.dataset.sourceHeight = String(config.height);
          lightning.style.setProperty("--delay", (-Math.random() * 10).toFixed(2) + "s");
          lightning.style.setProperty("--duration", config.duration);
          layer.appendChild(lightning);
        });
        }
        document.body.insertBefore(layer, root);
        console.log("[SINAL DEBUG] Layer created:", id);
      } catch (e) {
        console.error("[SINAL DEBUG] createLayers error for", theme, e);
      }
    });
  }

  function parseCssLength(value, axisSize) {
    var input = String(value || "").trim();
    if (!input || input === "center") return axisSize * 0.5;
    if (input === "top" || input === "left") return 0;
    if (input === "bottom" || input === "right") return axisSize;
    if (input.indexOf("calc(") === 0) {
      input = input.slice(5, -1).replace(/\s+/g, "");
      var match = input.match(/^(-?\d+(?:\.\d+)?)%([+-])(-?\d+(?:\.\d+)?)(vh|vw|px)$/);
      if (match) {
        var base = axisSize * (parseFloat(match[1]) / 100);
        var amount = parseFloat(match[3]);
        var unit = match[4];
        var delta = unit === "vh" ? window.innerHeight * amount / 100 : unit === "vw" ? window.innerWidth * amount / 100 : amount;
        return match[2] === "-" ? base - delta : base + delta;
      }
    }
    if (input.indexOf("%") !== -1) return axisSize * parseFloat(input) / 100;
    if (input.indexOf("vh") !== -1) return window.innerHeight * parseFloat(input) / 100;
    if (input.indexOf("vw") !== -1) return window.innerWidth * parseFloat(input) / 100;
    if (input.indexOf("px") !== -1 || /^-?\d/.test(input)) return parseFloat(input);
    return axisSize * 0.5;
  }

  function getBackgroundPositionParts(position) {
    var parts = String(position || "center center").trim().match(/calc\([^)]+\)|[^\s]+/g) || ["center", "center"];
    if (parts.length === 1) parts.push("center");
    return parts;
  }

  function syncSinalLightningAnchor() {
    if (activeExtraTheme !== "sinal") return;
    var layer = document.getElementById("sinal-theme-layer");
    var background = findBackgroundNode();
    if (!layer || !background) return;
    var rect = background.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var scale = Math.max(rect.width / sinalBackgroundSize.width, rect.height / sinalBackgroundSize.height);
    var renderedWidth = sinalBackgroundSize.width * scale;
    var renderedHeight = sinalBackgroundSize.height * scale;
    var position = getBackgroundPositionParts(background.style.backgroundPosition || getComputedStyle(background).backgroundPosition);
    var offsetX = parseCssLength(position[0], rect.width - renderedWidth);
    var offsetY = parseCssLength(position[1], rect.height - renderedHeight);
    var peakX = rect.left + offsetX + renderedWidth * sinalPeakAnchor.x;
    var peakY = rect.top + offsetY + renderedHeight * sinalPeakAnchor.y;
    layer.style.setProperty("--sinal-peak-x", peakX.toFixed(2) + "px");
    layer.style.setProperty("--sinal-peak-y", peakY.toFixed(2) + "px");
    layer.style.setProperty("--sinal-bg-scale", scale.toFixed(4));
    Array.from(layer.querySelectorAll(".sinal-lightning")).forEach(function (lightning) {
      var width = parseFloat(lightning.dataset.sourceWidth || "0");
      var height = parseFloat(lightning.dataset.sourceHeight || "0");
      if (!width || !height) return;
      lightning.style.width = (width * scale * 0.65).toFixed(2) + "px";
      lightning.style.height = (height * scale * 0.65).toFixed(2) + "px";
    });
  }

  function seedLayer(layerId, className, count, options) {
    var layer = document.getElementById(layerId);
    var seedAttribute = "data-seeded-" + className;
    console.log("[SINAL] seedLayer check:", layerId, className, "layer exists:", !!layer, "already seeded:", layer && layer.hasAttribute(seedAttribute));
    if (!layer || layer.hasAttribute(seedAttribute)) return;
    layer.setAttribute(seedAttribute, "true");
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
    console.log("[SINAL] seedEffects called");
    seedLayer("mark-theme-layer", "mark-dust", 18, {
      xMin: 12, xMax: 88, yMin: 18, yMax: 78, sizeMin: 1.0, sizeMax: 2.4, durationMin: 26, durationMax: 42, delayMax: 26
    });
    seedLayer("jonah-theme-layer", "jonah-particle", 18, {
      xMin: 10, xMax: 90, yMin: 16, yMax: 86, sizeMin: 0.9, sizeMax: 2.3, durationMin: 30, durationMax: 48, delayMax: 30
    });
    seedJonahRipples();
    seedLayer("sinal-theme-layer", "sinal-mist", 5, {
      xMin: 0, xMax: 86, yMin: 50, yMax: 82, sizeMin: 1, sizeMax: 2, durationMin: 28, durationMax: 46, delayMax: 24, widthMin: 180, widthMax: 340, heightMin: 56, heightMax: 110
    });
    console.log("[SINAL] seedLayer sinal-air-dust about to run");
    seedLayer("sinal-theme-layer", "sinal-air-dust", 35, {
      xMin: 5, xMax: 95, yMin: 50, yMax: 92, sizeMin: 1.8, sizeMax: 3.5, durationMin: 14, durationMax: 28, delayMax: 16
    });
    console.log("[SINAL] seedLayer sinal-air-dust done");
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

    // 항상 레이어와 이펙트가 존재하도록 보장
    if (theme === "sinal") {
      var oldLayer = document.getElementById("sinal-theme-layer");
      if (oldLayer) oldLayer.remove();
    }
    createLayers();
    seedEffects();

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
      var currentSrc = altar.getAttribute("src") || "";
      var currentBase = currentSrc.split("?")[0];
      if (currentBase !== config.altar) {
        altar.setAttribute("src", config.altar + "?reload=" + Date.now());
      }
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
    if (theme === "sinal") {
      syncSinalLightningAnchor();
      window.setTimeout(syncSinalLightningAnchor, 80);
      window.setTimeout(syncSinalLightningAnchor, 260);
    }
    if (theme === "jonah") {
      syncJonahRippleAnchor();
      window.setTimeout(syncJonahRippleAnchor, 80);
      window.setTimeout(syncJonahRippleAnchor, 260);
    }

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
    window.addEventListener("resize", function () {
      syncJonahRippleAnchor();
      syncSinalLightningAnchor();
    });
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
        if (activeExtraTheme === "sinal") syncSinalLightningAnchor();
      }).observe(root, { childList: true, subtree: true });
    }
  });
})();
