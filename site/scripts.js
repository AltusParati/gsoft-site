const root = document.documentElement;
root.classList.add("js-ready");

const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeButtons = document.querySelectorAll("[data-theme-toggle]");
const yearElement = document.getElementById("year");
const topbarShell = document.querySelector(".topbar-shell");
const menuToggle = document.querySelector("[data-menu-toggle]");
const revealItems = document.querySelectorAll("[data-reveal]");
const topbarLinks = document.querySelectorAll(".topbar-tools a");
const tabLinks = Array.from(document.querySelectorAll("[data-tab-link]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const storageKey = "gsoft-theme";
const pageLanguage = root.lang === "en" ? "en" : "tr";

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
  updateThemeUi(theme);
};

const setMenuState = (isOpen) => {
  if (!topbarShell || !menuToggle) {
    return;
  }

  topbarShell.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
};

const setActiveTab = (panelId) => {
  if (!panelId) {
    return;
  }

  tabLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${panelId}`;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "true" : "false");
  });
};

const syncActiveTabWithHash = () => {
  const currentHash = window.location.hash.replace("#", "");
  const matchedPanel = tabPanels.find((panel) => panel.id === currentHash);

  if (matchedPanel) {
    setActiveTab(matchedPanel.id);
    return;
  }

  setActiveTab(tabPanels[0]?.id);
};

applyTheme(getPreferredTheme());
setMenuState(false);
syncActiveTabWithHash();

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

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    setMenuState(!topbarShell?.classList.contains("menu-open"));
  });
}

topbarLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

tabLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    setActiveTab(targetId);
  });
});

window.addEventListener("hashchange", syncActiveTabWithHash);

const desktopMenu = window.matchMedia("(min-width: 861px)");

if (typeof desktopMenu.addEventListener === "function") {
  desktopMenu.addEventListener("change", (event) => {
    if (event.matches) {
      setMenuState(false);
    }
  });
} else if (typeof desktopMenu.addListener === "function") {
  desktopMenu.addListener((event) => {
    if (event.matches) {
      setMenuState(false);
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

if ("IntersectionObserver" in window && tabPanels.length > 0) {
  const tabObserver = new IntersectionObserver(
    (entries) => {
      const visiblePanel = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visiblePanel) {
        setActiveTab(visiblePanel.target.id);
      }
    },
    {
      threshold: [0.25, 0.45, 0.7],
      rootMargin: "-18% 0px -45% 0px",
    }
  );

  tabPanels.forEach((panel) => tabObserver.observe(panel));
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
