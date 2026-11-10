(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const THEME_KEY = "homepage-theme";

  /**
   * Read the stored preference without letting private-mode storage errors
   * break the page.
   */
  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === "light" || stored === "dark" ? stored : null;
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme, persist) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    const isDark = nextTheme === "dark";

    root.dataset.theme = nextTheme;

    if (themeToggle) {
      const nextLabel = isDark ? "切换到浅色模式" : "切换到深色模式";
      themeToggle.setAttribute("aria-label", nextLabel);
      themeToggle.setAttribute("title", nextLabel);
    }

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#0b1513" : "#f5f2e9");
    }

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, nextTheme);
      } catch (error) {
        // The theme still applies for this visit.
      }
    }
  }

  // The inline boot script already chose the initial theme. Keep the button
  // label and theme-color metadata in sync with that choice.
  applyTheme(root.dataset.theme || (systemTheme.matches ? "dark" : "light"), false);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  // Follow OS theme changes only while the visitor has not picked a theme.
  function handleSystemThemeChange(event) {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? "dark" : "light", false);
    }
  }

  if (typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemTheme.addListener === "function") {
    systemTheme.addListener(handleSystemThemeChange);
  }

  // Header elevation + scroll spy for the current section.
  const header = document.querySelector("[data-header]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = navLinks
    .map(function (link) {
      const targetId = link.getAttribute("href");
      const section = targetId ? document.querySelector(targetId) : null;
      return section ? { id: targetId.slice(1), section: section } : null;
    })
    .filter(Boolean);

  let activeSectionId = "";
  let scrollQueued = false;

  function updateOnScroll() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    if (sections.length) {
      const activationLine = Math.min(window.innerHeight * 0.35, 300);
      let nextActive = sections[0].id;

      sections.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= activationLine) {
          nextActive = item.id;
        }
      });

      // Make the last item active when the page bottom is reached, even if
      // the final section is shorter than the activation line.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        nextActive = sections[sections.length - 1].id;
      }

      if (nextActive !== activeSectionId) {
        activeSectionId = nextActive;

        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + activeSectionId) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }
    }

    scrollQueued = false;
  }

  function onScroll() {
    if (scrollQueued) {
      return;
    }
    scrollQueued = true;
    window.requestAnimationFrame(updateOnScroll);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateOnScroll();

  // Copy the email address, with a fallback for browsers that do not expose
  // the async Clipboard API (including some file:// previews).
  const copyButton = document.querySelector("[data-copy-email]");
  const copyLabel = document.querySelector("[data-copy-label]");
  const copyStatus = document.querySelector("[data-copy-status]");
  let copyResetTimer = 0;

  function fallbackCopy(text) {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "-9999px";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    field.remove();
    return copied;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    if (!fallbackCopy(text)) {
      throw new Error("Clipboard copy was not available.");
    }
  }

  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      const email = copyButton.getAttribute("data-copy-email");

      if (!email) {
        return;
      }

      try {
        await copyText(email);
        copyButton.classList.add("is-copied");
        if (copyLabel) {
          copyLabel.textContent = "已复制";
        }
        if (copyStatus) {
          copyStatus.textContent = "邮箱地址已复制到剪贴板。";
        }
      } catch (error) {
        copyButton.classList.remove("is-copied");
        if (copyLabel) {
          copyLabel.textContent = "复制";
        }
        if (copyStatus) {
          copyStatus.textContent = "复制失败，请选中邮箱地址手动复制。";
        }
      }

      window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(function () {
        copyButton.classList.remove("is-copied");
        if (copyLabel) {
          copyLabel.textContent = "复制";
        }
        if (copyStatus) {
          copyStatus.textContent = "";
        }
      }, 3600);
    });
  }

  // Keep the footer year current without adding build tooling.
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
})();
