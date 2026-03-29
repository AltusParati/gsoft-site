const root = document.documentElement;
root.classList.add("js-ready");

const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeButtons = document.querySelectorAll("[data-theme-toggle]");
const themedLogoImages = document.querySelectorAll("[data-themed-logo]");
const galleryShots = document.querySelectorAll("[data-gallery-shot]");
const yearElement = document.getElementById("year");
const topbarShell = document.querySelector(".topbar-shell");
const ambientLayer = document.querySelector(".ambient-layer");
const revealItems = document.querySelectorAll("[data-reveal]");
const progressBlocks = document.querySelectorAll("[data-progress-target]");
const storageKey = "gsoft-theme";
const pageLanguage = root.lang === "en" ? "en" : "tr";
const desktopLiveCodeQuery = window.matchMedia("(min-width: 861px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const liveCodeTimers = new Set();
let liveCodeLayer = null;

const liveCodeSnippets = [
  'const sector = world.revive("north-marsh");',
  "cache.merge(packet.shadowMap);",
  "if (signal.latency < 18) route.open();",
  'archive.note("unused-biome", ghostFrame);',
  "renderLoop.commit({ delta, haze: true });",
  "node.pipeline.attach(syncBeacon);",
  'const drift = scanner.trace("quiet-harbor");',
  "stack.spawn(frame => frame.cooldown -= 1);",
  "if (build.flags.includes('beta')) ship.prewarm();",
  "sector.mesh.reseed({ reeds: 12, fog: 3 });",
  "db.signal('mirror.route');",
  "packet.retry ??= 2;",
  "const shell = cache.acquire('afterglow');",
  "world.cells[7].status = 'warming';",
  "releaseMap.queue('ghost-port');",
  "hooks.afterPaint(pushTelemetry);",
  "scheduler.defer(syncViewport, 14);",
  "if (rift.open) fragments.flush();",
];

const liveCodePanels = [
  {
    label: "ghost.cache",
    accent: "#4ed0dc",
    top: "6%",
    left: "4vw",
    width: "20.5rem",
    rotate: "-5deg",
    rotateAlt: "-2deg",
    shift: "-18px",
    duration: "24s",
  },
  {
    label: "sector.loop",
    accent: "#78aef7",
    top: "18%",
    right: "4vw",
    width: "19.75rem",
    rotate: "4deg",
    rotateAlt: "1deg",
    shift: "16px",
    duration: "27s",
  },
  {
    label: "sync.frame",
    accent: "#4ed0dc",
    top: "35%",
    left: "7vw",
    width: "21rem",
    rotate: "-3deg",
    rotateAlt: "0deg",
    shift: "-14px",
    duration: "26s",
  },
  {
    label: "build.trace",
    accent: "#f2a56d",
    top: "51%",
    right: "7vw",
    width: "18.75rem",
    rotate: "5deg",
    rotateAlt: "2deg",
    shift: "18px",
    duration: "29s",
  },
  {
    label: "archive.route",
    accent: "#7ea5ff",
    top: "68%",
    left: "12vw",
    width: "20rem",
    rotate: "-4deg",
    rotateAlt: "-1deg",
    shift: "-16px",
    duration: "25s",
  },
  {
    label: "release.map",
    accent: "#4ed0dc",
    top: "83%",
    right: "10vw",
    width: "19rem",
    rotate: "3deg",
    rotateAlt: "0deg",
    shift: "12px",
    duration: "30s",
  },
];

const themeCopy = {
  tr: {
    light: "Görünüm: Açık",
    dark: "Görünüm: Koyu",
    switchToLight: "Açık moda geç",
    switchToDark: "Koyu moda geç",
  },
  en: {
    light: "Theme: Light",
    dark: "Theme: Dark",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
};

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

const readStoredTheme = () => {
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
  } catch {
    return null;
  }
};

const getPreferredTheme = () => {
  const storedTheme = readStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const bindThemedLogoFallbacks = () => {
  themedLogoImages.forEach((image) => {
    if (image.dataset.logoFallbackBound === "true") {
      return;
    }

    image.dataset.logoFallbackBound = "true";
    image.addEventListener("error", () => {
      const lightLogo = image.dataset.logoLight;
      if (lightLogo && image.getAttribute("src") !== lightLogo) {
        image.setAttribute("src", lightLogo);
      }
    });
  });
};

const updateThemeLogos = (theme) => {
  themedLogoImages.forEach((image) => {
    const lightLogo = image.dataset.logoLight;
    const darkLogo = image.dataset.logoDark;
    const nextLogo = theme === "dark" ? darkLogo : lightLogo;

    if (nextLogo && image.getAttribute("src") !== nextLogo) {
      image.setAttribute("src", nextLogo);
    }
  });
};

const updateThemeUi = (theme) => {
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "dark" ? "#101b29" : "#e7eef6");
  }

  themeButtons.forEach((button) => {
    const labels = themeCopy[pageLanguage];
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    button.setAttribute("aria-label", theme === "dark" ? labels.switchToLight : labels.switchToDark);

    const label = button.querySelector("[data-theme-label]");
    if (label) {
      label.textContent = theme === "dark" ? labels.dark : labels.light;
    }
  });
};

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  updateThemeLogos(theme);
  updateThemeUi(theme);
};

bindThemedLogoFallbacks();
applyTheme(getPreferredTheme());

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // Ignore storage issues and still apply the theme for the current session.
    }

    applyTheme(nextTheme);
  });
});

const updateTopbarState = () => {
  if (!topbarShell) {
    return;
  }

  topbarShell.classList.toggle("is-scrolled", window.scrollY > 8);
};

updateTopbarState();
window.addEventListener("scroll", updateTopbarState, { passive: true });

galleryShots.forEach((shot) => {
  const frame = shot.closest(".gallery-preview");
  if (!frame) {
    return;
  }

  const markLoaded = () => {
    frame.classList.add("has-image");
    shot.style.display = "block";
  };

  const markMissing = () => {
    shot.style.display = "none";
    frame.classList.remove("has-image");
  };

  if (shot.complete) {
    if (shot.naturalWidth > 0) {
      markLoaded();
    } else {
      markMissing();
    }
    return;
  }

  shot.addEventListener("load", markLoaded, { once: true });
  shot.addEventListener("error", markMissing, { once: true });
});

const queueLiveCodeTask = (callback, delay) => {
  const id = window.setTimeout(() => {
    liveCodeTimers.delete(id);
    callback();
  }, delay);

  liveCodeTimers.add(id);
  return id;
};

const clearLiveCodeLayer = () => {
  liveCodeTimers.forEach((id) => window.clearTimeout(id));
  liveCodeTimers.clear();

  if (liveCodeLayer) {
    liveCodeLayer.remove();
    liveCodeLayer = null;
  }
};

const pickLiveCodeSnippet = () => liveCodeSnippets[Math.floor(Math.random() * liveCodeSnippets.length)];

const typeLiveCodeLine = (line, text, index, onDone) => {
  if (!document.body.contains(line)) {
    return;
  }

  if (index === 0) {
    line.textContent = "";
    line.classList.add("is-typing");
  }

  line.textContent = text.slice(0, index + 1);

  if (index + 1 < text.length) {
    queueLiveCodeTask(
      () => typeLiveCodeLine(line, text, index + 1, onDone),
      18 + Math.random() * 26
    );
    return;
  }

  queueLiveCodeTask(() => {
    line.classList.remove("is-typing");
    onDone();
  }, 640 + Math.random() * 420);
};

const runLiveCodePanel = (panel, seed = 0) => {
  const lines = Array.from(panel.querySelectorAll(".live-code-line"));
  let cursor = seed;

  lines.forEach((line, index) => {
    line.textContent = liveCodeSnippets[(seed + index) % liveCodeSnippets.length];
  });

  const loop = () => {
    if (!document.body.contains(panel)) {
      return;
    }

    const line = lines[cursor % lines.length];
    typeLiveCodeLine(line, pickLiveCodeSnippet(), 0, () => {
      cursor += 1;
      queueLiveCodeTask(loop, 260 + Math.random() * 520);
    });
  };

  queueLiveCodeTask(loop, 360 + seed * 180);
};

const createLiveCodePanel = (config) => {
  const panel = document.createElement("div");
  panel.className = "live-code-panel";
  panel.style.setProperty("--panel-accent", config.accent);
  panel.style.setProperty("--panel-rotate", config.rotate);
  panel.style.setProperty("--panel-rotate-alt", config.rotateAlt);
  panel.style.setProperty("--panel-shift", config.shift);
  panel.style.setProperty("--panel-duration", config.duration);
  panel.style.width = config.width;
  panel.style.top = config.top;

  if (config.left) {
    panel.style.left = config.left;
  }

  if (config.right) {
    panel.style.right = config.right;
  }

  const bar = document.createElement("div");
  bar.className = "live-code-bar";

  const dots = document.createElement("span");
  dots.className = "live-code-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";

  const label = document.createElement("span");
  label.className = "live-code-label";
  label.textContent = config.label;

  bar.append(dots, label);

  const body = document.createElement("div");
  body.className = "live-code-body";

  for (let index = 0; index < 7; index += 1) {
    const line = document.createElement("span");
    line.className = "live-code-line";
    body.appendChild(line);
  }

  panel.append(bar, body);
  return panel;
};

const updateLiveCodeGeometry = () => {
  if (!liveCodeLayer) {
    return;
  }

  const pageHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    window.innerHeight
  );

  liveCodeLayer.style.height = `${pageHeight}px`;
};

const initLiveCodeLayer = () => {
  if (!ambientLayer || !desktopLiveCodeQuery.matches || reducedMotionQuery.matches) {
    return;
  }

  if (liveCodeLayer) {
    updateLiveCodeGeometry();
    return;
  }

  liveCodeLayer = document.createElement("div");
  liveCodeLayer.className = "live-code-layer";
  liveCodeLayer.setAttribute("aria-hidden", "true");

  liveCodePanels.forEach((config, index) => {
    const panel = createLiveCodePanel(config);
    liveCodeLayer.appendChild(panel);
    runLiveCodePanel(panel, index + 1);
  });

  document.body.appendChild(liveCodeLayer);
  updateLiveCodeGeometry();
};

const syncLiveCodeLayer = () => {
  if (!ambientLayer) {
    clearLiveCodeLayer();
    return;
  }

  if (desktopLiveCodeQuery.matches && !reducedMotionQuery.matches) {
    initLiveCodeLayer();
    return;
  }

  clearLiveCodeLayer();
};

syncLiveCodeLayer();

if (typeof desktopLiveCodeQuery.addEventListener === "function") {
  desktopLiveCodeQuery.addEventListener("change", syncLiveCodeLayer);
}

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", syncLiveCodeLayer);
}

window.addEventListener("resize", syncLiveCodeLayer, { passive: true });
window.addEventListener("load", syncLiveCodeLayer);

const animateProgressBlock = (block) => {
  if (block.dataset.progressAnimated === "true") {
    return;
  }

  block.dataset.progressAnimated = "true";

  const target = Math.max(0, Math.min(100, Number(block.dataset.progressTarget) || 0));
  const fill = block.querySelector("[data-progress-fill]");
  const value = block.querySelector("[data-progress-value]");
  const duration = 1400;
  const start = performance.now();

  const tick = (timestamp) => {
    const elapsed = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const current = Math.round(target * eased);

    if (fill) {
      fill.style.width = `${current}%`;
    }

    if (value) {
      value.textContent = `${current}%`;
    }

    if (elapsed < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window && progressBlocks.length > 0) {
  const progressObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateProgressBlock(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.35,
    }
  );

  progressBlocks.forEach((block) => progressObserver.observe(block));
} else {
  progressBlocks.forEach((block) => animateProgressBlock(block));
}

if ("IntersectionObserver" in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
