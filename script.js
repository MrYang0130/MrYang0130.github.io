(function () {
  "use strict";

  // Keep the top navigation in sync with the section currently in view.
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = navLinks
    .map(function (link) {
      const target = link.getAttribute("href");
      const section = target ? document.querySelector(target) : null;
      return section ? { id: target.slice(1), section: section } : null;
    })
    .filter(Boolean);

  const header = document.querySelector(".site-header");
  let activeSection = "";
  let scrollFrame = 0;

  function getActivationLine() {
    if (!header) {
      return 28;
    }

    const headerStyle = window.getComputedStyle(header);
    const headerHeight =
      headerStyle.position === "sticky" ? header.getBoundingClientRect().height : 0;

    // A section becomes active when its top reaches the area just below the
    // sticky header. Using a small line instead of a percentage of the
    // viewport prevents short sections from being skipped.
    return headerHeight + 28;
  }

  function updateActiveSection() {
    if (sections.length) {
      const activationLine = getActivationLine();
      let nextSection = sections[0].id;

      sections.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= activationLine) {
          nextSection = item.id;
        }
      });

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        nextSection = sections[sections.length - 1].id;
      }

      if (nextSection !== activeSection) {
        activeSection = nextSection;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + activeSection) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }
    }

    scrollFrame = 0;
  }

  function onScroll() {
    if (!scrollFrame) {
      scrollFrame = window.requestAnimationFrame(updateActiveSection);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateActiveSection();

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
})();
