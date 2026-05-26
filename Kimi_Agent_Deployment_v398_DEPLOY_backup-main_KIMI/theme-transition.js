(function () {
  "use strict";

  var BASE_THEME_ALTARS = {
    "사막의 제단": "assets/g_dessert.webp",
    "겟세마네 동산": "assets/g_dessert.webp",
    "어두운 밤": "assets/b_night.webp",
    "여름 녹음": "assets/b_woods.webp",
    "마가 다락방": "assets/b_mark.webp",
    "요나의 고래뱃속": "assets/b_jonah.webp",
    "모세의 시내산": "assets/b_sinal.webp"
  };
  var BASE_THEME_BACKGROUNDS = {
    "사막의 제단": {
      image: "assets/back_dessert.webp",
      color: "#b77c61",
      position: "center"
    },
    "겟세마네 동산": {
      image: "assets/back_gathe3.webp",
      color: "#000000",
      position: "center 25%"
    },
    "어두운 밤": {
      image: "assets/back_night.webp",
      color: "#000114",
      position: "center"
    },
    "여름 녹음": {
      image: "assets/back_woods7.webp",
      color: "#091c1f",
      position: "center 70%"
    },
    "마가 다락방": {
      image: "assets/back_mark.webp",
      color: "#3e2b21",
      position: "center 52%"
    },
    "요나의 고래뱃속": {
      image: "assets/back_jonah.webp",
      color: "#000204",
      position: "center calc(50% - 8vh)"
    },
    "모세의 시내산": {
      image: "assets/back_sinal.webp",
      color: "#536a83",
      position: "center calc(50% - 30vh)"
    }
  };
  var BASE_THEME_LABELS = Object.keys(BASE_THEME_ALTARS);
  var currentActiveTheme = "";
  var fadeTimer = 0;

  function clearAllThemeState() {
    var oldTheme = currentActiveTheme;
    
    // 모든 테마 CSS 클래스 제거
    [
      "codex-theme-desert",
      "codex-theme-gethsemane",
      "codex-theme-night",
      "codex-theme-summer",
      "codex-theme-mark",
      "codex-theme-jonah",
      "codex-theme-sinal"
    ].forEach(function (className) {
      document.documentElement.classList.remove(className);
      document.body.classList.remove(className);
    });

    // 모든 데이터 속성 제거
    document.body.removeAttribute("data-extra-theme");
    document.body.removeAttribute("data-theme");
    document.body.removeAttribute("data-codex-theme-background");
    
    // 배경 스타일 초기화
    var background = findBackgroundNode();
    if (background) {
      background.removeAttribute("data-codex-theme-background");
      background.style.removeProperty("background-image");
      background.style.removeProperty("background-position");
      background.style.removeProperty("background-color");
      background.style.removeProperty("opacity");
    }

    return oldTheme;
  }

  function text(node) {
    return (node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function ensureOverlay() {
    if (document.getElementById("codex-theme-transition")) return;
    var overlay = document.createElement("div");
    overlay.id = "codex-theme-transition";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  function startFade() {
    ensureOverlay();
    document.body.classList.remove("codex-theme-transitioning");
    void document.body.offsetWidth;
    document.body.classList.add("codex-theme-transitioning");
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(function () {
      document.body.classList.remove("codex-theme-transitioning");
    }, 1900);
  }

  function findThemeFromButton(button) {
    var label = text(button);
    return BASE_THEME_LABELS.find(function (themeName) {
      return label.indexOf(themeName) !== -1;
    }) || "";
  }

  function resetBaseAltar(themeName) {
    var src = BASE_THEME_ALTARS[themeName];
    if (!src) return;
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    markAltarStage();
    var currentSrc = altar.getAttribute("src") || "";
    var currentBase = currentSrc.split("?")[0];
    if (currentBase !== src) {
      altar.setAttribute("src", src + "?reload=" + Date.now());
    }
    sanitizeAltarStyles(altar);
    updateAltarFilter(themeName);
  }

  function updateAltarFilter(themeName) {
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    altar.style.removeProperty("filter");
  }

  function sanitizeAltarStyles(altar) {
    if (!altar) return;
    [
      "width",
      "max-width",
      "height",
      "max-height",
      "min-width",
      "min-height",
      "margin",
      "margin-left",
      "margin-right",
      "top",
      "right",
      "bottom",
      "left",
      "translate",
      "transform",
      "scale",
      "transition",
      "animation",
      "opacity",
      "filter"
    ].forEach(function (property) {
      if (altar.style.getPropertyValue(property)) {
        altar.style.removeProperty(property);
      }
    });
  }

  function markAltarStage() {
    var altar = document.querySelector('img[alt="altar"]');
    if (!altar) return;
    var node = altar.parentElement;
    while (node && node.id !== "root") {
      var className = typeof node.className === "string" ? node.className : "";
      if (className.indexOf("left-1/2") !== -1 && className.indexOf("z-10") !== -1) {
        node.classList.add("codex-altar-stage");
        return;
      }
      node = node.parentElement;
    }
  }

  function updateFooterThemeLabel(themeName) {
    BASE_THEME_LABELS.forEach(function (oldName) {
      Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
        if (node.closest && node.closest("button")) return;
        if (node.childElementCount) return;
        if (text(node) === oldName && node.textContent !== themeName) {
          node.textContent = themeName;
        }
      });
    });
  }

  function findBackgroundNode() {
    return Array.from(document.querySelectorAll("#root div")).find(function (node) {
      var style = node.style || {};
      return style.backgroundImage && style.backgroundSize === "cover";
    }) || null;
  }

  function applyBaseVisuals(themeName, options) {
    var config = BASE_THEME_BACKGROUNDS[themeName];
    if (!config) return;
    document.body.removeAttribute("data-extra-theme");
    document.body.dataset.currentTheme = themeName;
    document.body.style.backgroundColor = config.color;
    if (!options || !options.silent) {
      document.dispatchEvent(new CustomEvent("codex-extra-theme-change", { detail: { theme: "base" } }));
    }

    var background = findBackgroundNode();
    if (background) {
      background.style.backgroundImage = 'url("' + config.image + '")';
      background.style.backgroundPosition = config.position;
      background.style.backgroundColor = config.color;
      background.style.backgroundSize = "cover";
      background.style.backgroundRepeat = "no-repeat";
      background.style.opacity = "1";
    }
    resetBaseAltar(themeName);
    updateFooterThemeLabel(themeName);
  }

  var ALTAR_RELOAD_SOURCES = new Set([
    "assets/g_dessert.webp",
    "assets/b_night.webp",
    "assets/b_woods.webp",
    "assets/b_mark.webp",
    "assets/b_jonah.webp",
    "assets/b_sinal.webp"
  ]);

  function reloadAltarSrc(altar) {
    if (!altar) return;
    var src = altar.getAttribute("src") || "";
    var base = src.split("?")[0];
    if (!ALTAR_RELOAD_SOURCES.has(base)) return;
    if (/\breload=/.test(src)) return;
    altar.setAttribute("src", base + "?reload=" + Date.now());
  }

  function bindAltarSrcObserver() {
    sanitizeAltarStyles(document.querySelector('img[alt="altar"]'));
    reloadAltarSrc(document.querySelector('img[alt="altar"]'));
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "src") {
          var target = mutation.target;
          if (target.matches && target.matches('img[alt="altar"]')) {
            reloadAltarSrc(target);
          }
        }
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          var styleTarget = mutation.target;
          if (styleTarget.matches && styleTarget.matches('img[alt="altar"]')) {
            sanitizeAltarStyles(styleTarget);
          }
        }
        if (mutation.type === "childList") {
          Array.from(mutation.addedNodes).forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('img[alt="altar"]')) {
              sanitizeAltarStyles(node);
              reloadAltarSrc(node);
            }
            Array.from(node.querySelectorAll ? node.querySelectorAll('img[alt="altar"]') : []).forEach(function (altar) {
              sanitizeAltarStyles(altar);
              reloadAltarSrc(altar);
            });
          });
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "style"]
    });
  }

  function preloadAltarImages() {
    Object.keys(BASE_THEME_ALTARS).forEach(function (themeName) {
      var src = BASE_THEME_ALTARS[themeName];
      var image = new Image();
      image.src = src + "?reload=" + Date.now();
    });
  }

  function markCurrentTheme() {
    var footerTheme = "";
    Array.from(document.querySelectorAll("#root span, #root div")).forEach(function (node) {
      if (node.closest && node.closest("button")) return;
      var value = text(node);
      if (BASE_THEME_LABELS.indexOf(value) !== -1) footerTheme = value;
    });
    var themeClasses = [
      "codex-theme-desert",
      "codex-theme-gethsemane",
      "codex-theme-night",
      "codex-theme-summer",
      "codex-theme-mark",
      "codex-theme-jonah",
      "codex-theme-sinal"
    ];
    var classByTheme = {
      "사막의 제단": "codex-theme-desert",
      "겟세마네 동산": "codex-theme-gethsemane",
      "어두운 밤": "codex-theme-night",
      "여름 녹음": "codex-theme-summer",
      "마가 다락방": "codex-theme-mark",
      "요나의 고래뱃속": "codex-theme-jonah",
      "모세의 시내산": "codex-theme-sinal"
    };
    var expectedClass = classByTheme[footerTheme];
    var currentClass = themeClasses.find(function (c) { return document.body.classList.contains(c); });

    if (currentClass === expectedClass) {
      if (expectedClass && document.body.dataset.currentTheme !== footerTheme) {
        document.body.dataset.currentTheme = footerTheme;
      } else if (!expectedClass && document.body.hasAttribute("data-current-theme")) {
        document.body.removeAttribute("data-current-theme");
      }
      return;
    }

    themeClasses.forEach(function (className) {
      document.body.classList.remove(className);
    });

    if (expectedClass) {
      document.body.classList.add(expectedClass);
      document.body.dataset.currentTheme = footerTheme;
    } else {
      document.body.removeAttribute("data-current-theme");
    }
  }

  function scheduleBaseReset(themeName) {
    [80, 260].forEach(function (delay) {
      window.setTimeout(function () {
        resetBaseAltar(themeName);
        markCurrentTheme();
      }, delay);
    });
  }

  function start() {
    ensureOverlay();
    preloadAltarImages();
    bindAltarSrcObserver();
    markAltarStage();
    markCurrentTheme();

    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!button) return;
      var themeName = findThemeFromButton(button);
      if (!themeName) return;

      startFade();
      if (BASE_THEME_ALTARS[themeName]) {
        applyBaseVisuals(themeName);
        scheduleBaseReset(themeName);
      } else {
        window.setTimeout(markCurrentTheme, 900);
      }

      window.setTimeout(function () {
        var currentTheme = document.body.dataset.currentTheme;
        if (currentTheme) updateAltarFilter(currentTheme);
      }, 100);
    }, true);

    document.addEventListener("codex-extra-theme-change", startFade);

    new MutationObserver(function () {
      markAltarStage();
      markCurrentTheme();
    }).observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
