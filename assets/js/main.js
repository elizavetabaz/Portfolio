(() => {
  "use strict";

  /* Mobile nav toggle */
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => mobileNav.classList.remove("is-open"));
    });
  }

  /* Scroll-triggered reveals, fire once */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* Magnetic hover: tilt/scale toward cursor, spring back on exit */
  function magnetize(el, { moveX = 9, moveY = 6, scale = 1.04 } = {}) {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transition = "transform 80ms linear, background 120ms ease, color 120ms ease";
      el.style.transform = `translate(${(dx * moveX).toFixed(2)}px, ${(dy * moveY).toFixed(2)}px) scale(${scale})`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 420ms cubic-bezier(0.22, 1.4, 0.36, 1), background 120ms ease, color 120ms ease";
      el.style.transform = "translate(0,0) scale(1)";
    });
  }

  document.querySelectorAll("[data-magnet]").forEach((el) => magnetize(el));

  /* Magnetic pills (About skills/tools): tilt + fill with accent color on hover */
  const PILL_COLORS = {
    pink: "oklch(0.63 0.29 350)",
    blue: "oklch(0.55 0.245 262)"
  };
  document.querySelectorAll("[data-magnet-pill]").forEach((el) => {
    const accent = PILL_COLORS[el.dataset.magnetPill] || PILL_COLORS.pink;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transition = "transform 80ms linear, background 120ms ease, color 120ms ease, border-color 120ms ease";
      el.style.transform = `translate(${(dx * 6).toFixed(2)}px, ${(dy * 5).toFixed(2)}px) scale(1.05)`;
      el.style.background = accent;
      el.style.borderColor = accent;
      el.style.color = "oklch(0.995 0.002 265)";
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 380ms cubic-bezier(0.22, 1.4, 0.36, 1), background 160ms ease, color 160ms ease, border-color 160ms ease";
      el.style.transform = "translate(0,0) scale(1)";
      el.style.background = "transparent";
      el.style.borderColor = accent;
      el.style.color = "oklch(0.32 0.045 265)";
    });
  });

  /* Magnetic cards ("What's actually broken") with shadow lift */
  document.querySelectorAll("[data-magnet-card]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transition = "transform 80ms linear, box-shadow 160ms ease";
      el.style.transform = `translate(${(dx * 8).toFixed(2)}px, ${(dy * 6).toFixed(2)}px) scale(1.02)`;
      el.style.boxShadow = "0 14px 34px oklch(0.28 0.045 265 / 0.12)";
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform 420ms cubic-bezier(0.22, 1.4, 0.36, 1), box-shadow 260ms ease";
      el.style.transform = "translate(0,0) scale(1)";
      el.style.boxShadow = "";
    });
  });

  /* Services tab panel: click to select, arrows to cycle, auto-advance every 4.5s */
  const tabRoot = document.querySelector("[data-service-tabs]");
  if (tabRoot) {
    const tabs = Array.from(tabRoot.querySelectorAll("[data-service-tab]"));
    const titleEl = document.querySelector("[data-service-title]");
    const bodyEl = document.querySelector("[data-service-body]");
    let active = tabs.findIndex((t) => t.classList.contains("is-active"));
    if (active < 0) active = 0;
    let timer = null;

    function render() {
      tabs.forEach((t, i) => {
        t.classList.toggle("is-active", i === active);
        t.setAttribute("aria-selected", i === active ? "true" : "false");
      });
      if (titleEl) titleEl.textContent = tabs[active].dataset.title;
      if (bodyEl) bodyEl.textContent = tabs[active].dataset.body;
    }

    function goTo(i) {
      active = (i + tabs.length) % tabs.length;
      render();
      restartAutoAdvance();
    }

    function restartAutoAdvance() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        active = (active + 1) % tabs.length;
        render();
      }, 4500);
    }

    tabs.forEach((t, i) => t.addEventListener("click", () => goTo(i)));

    const prevBtn = document.querySelector("[data-service-prev]");
    const nextBtn = document.querySelector("[data-service-next]");
    if (prevBtn) prevBtn.addEventListener("click", () => goTo(active - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(active + 1));

    render();
    restartAutoAdvance();
  }

  /* Insights filter pills: click a pill or a card's tag to filter the grid */
  const insightsGrid = document.querySelector("[data-insights-grid]");
  if (insightsGrid) {
    const filterPills = Array.from(document.querySelectorAll("[data-filter]"));
    const cards = Array.from(insightsGrid.querySelectorAll("[data-post-tags]"));
    const filterRow = document.querySelector("[data-filter-row]");

    function applyFilter(tag) {
      filterPills.forEach((p) => p.classList.toggle("is-active", p.dataset.filter === tag));
      cards.forEach((card) => {
        const tags = card.dataset.postTags.split(",");
        const show = tag === "All" || tags.includes(tag);
        card.style.display = show ? "" : "none";
      });
    }

    filterPills.forEach((pill) => {
      pill.addEventListener("click", () => applyFilter(pill.dataset.filter));
    });

    cards.forEach((card) => {
      card.querySelectorAll("[data-tag-link]").forEach((tagBtn) => {
        tagBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          applyFilter(tagBtn.dataset.tagLink);
          if (filterRow) filterRow.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    });
  }
})();
