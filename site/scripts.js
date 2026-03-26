const root = document.documentElement;
root.classList.add("js-ready");

const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeButtons = document.querySelectorAll("[data-theme-toggle]");
const themedLogoImages = document.querySelectorAll("[data-themed-logo]");
const yearElement = document.getElementById("year");
const topbarShell = document.querySelector(".topbar-shell");
const revealItems = document.querySelectorAll("[data-reveal]");
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
