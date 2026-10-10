(() => {
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = themeToggle?.querySelector("i");
  const themeLabel = themeToggle?.querySelector(".theme-toggle-label");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNavigation = document.querySelector("#main-navigation");

  if (!themeToggle || !themeIcon || !themeLabel || !menuToggle || !mainNavigation) {
    throw new Error("Portfolio controls are missing; interactive features could not be initialized.");
  }

  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  let savedTheme = null;
  let hasThemePreference = false;

  try {
    savedTheme = localStorage.getItem("portfolio-theme");
    hasThemePreference = savedTheme === "dark" || savedTheme === "light";
  } catch (error) {
    console.warn("Theme preference could not be loaded from local storage.", error);
  }

  function setTheme(theme, savePreference = false) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    themeIcon.className = `fa-solid ${isDark ? "fa-sun" : "fa-moon"}`;

    if (savePreference) {
      hasThemePreference = true;
      try {
        localStorage.setItem("portfolio-theme", theme);
      } catch (error) {
        console.warn("Theme preference could not be saved to local storage.", error);
      }
    }
  }

  setTheme(hasThemePreference ? savedTheme : (colorScheme.matches ? "dark" : "light"));
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
  });

  colorScheme.addEventListener("change", (event) => {
    if (!hasThemePreference) setTheme(event.matches ? "dark" : "light");
  });

  function setNavigationOpen(isOpen) {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    menuToggle.innerHTML = `<i class="fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}" aria-hidden="true"></i>`;
    mainNavigation.classList.toggle("is-open", isOpen);
  }

  menuToggle.addEventListener("click", () => {
    setNavigationOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mainNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setNavigationOpen(false);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      event.target instanceof Node &&
      !mainNavigation.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setNavigationOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setNavigationOpen(false);
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 600 && menuToggle.getAttribute("aria-expanded") === "true") {
      setNavigationOpen(false);
    }
  });

  const navigationLinks = [...mainNavigation.querySelectorAll('a[href^="#"]')];
  const navigationTargets = navigationLinks
    .map((link) => ({
      link,
      target: document.querySelector(link.getAttribute("href"))
    }))
    .filter((item) => item.target);
  let scrollUpdateScheduled = false;

  function updateActiveNavigation() {
    const header = document.querySelector(".reference-header");
    const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
    const activationLine = headerBottom + 64;
    let currentTarget = navigationTargets[0]?.target ?? null;
    let currentTargetTop = Number.NEGATIVE_INFINITY;

    for (const item of navigationTargets) {
      const targetTop = item.target.getBoundingClientRect().top;
      if (targetTop <= activationLine && targetTop > currentTargetTop) {
        currentTarget = item.target;
        currentTargetTop = targetTop;
      }
    }

    const isAtPageEnd =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (isAtPageEnd) {
      for (const item of navigationTargets) {
        const bounds = item.target.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > headerBottom) {
          currentTarget = item.target;
        }
      }
    }

    for (const item of navigationTargets) {
      if (item.target === currentTarget) {
        item.link.setAttribute("aria-current", "location");
      } else {
        item.link.removeAttribute("aria-current");
      }
    }
  }

  function scheduleActiveNavigationUpdate() {
    if (scrollUpdateScheduled) return;

    scrollUpdateScheduled = true;
    window.requestAnimationFrame(() => {
      updateActiveNavigation();
      scrollUpdateScheduled = false;
    });
  }

  window.addEventListener("scroll", scheduleActiveNavigationUpdate, { passive: true });
  window.addEventListener("resize", scheduleActiveNavigationUpdate);
  window.addEventListener("hashchange", scheduleActiveNavigationUpdate);
  updateActiveNavigation();
})();