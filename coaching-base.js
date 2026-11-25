(() => {
  const page = document.querySelector('.base-page');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const journey = page.querySelector('[data-base-tabs]');
  const tablist = journey.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

  function selectTab(active, animate = false) {
    tabs.forEach((tab, index) => {
      const selected = index === active;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
      panels[index].classList.toggle('is-switching', selected && animate);
    });
  }

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => selectTab(index, true));
    tab.addEventListener('keydown', event => {
      const next = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectTab(next, true);
      tabs[next].focus();
    });
  });
  selectTab(0);
  tablist.hidden = false;

  const app = page.querySelector('[data-base-app]');
  const preview = app.querySelector('img');
  app.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
    if (!detail.open || preview.getAttribute('src') === detail.dataset.image) return;
    preview.src = detail.dataset.image;
    preview.alt = detail.dataset.alt;
    preview.classList.remove('is-switching');
    requestAnimationFrame(() => requestAnimationFrame(() => preview.classList.add('is-switching')));
  }));

  const reviews = page.querySelector('[data-base-reviews]');
  const controls = page.querySelector('[data-base-review-controls]');
  const previous = controls.querySelector('[data-base-prev]');
  const next = controls.querySelector('[data-base-next]');
  function updateReviews() {
    const end = reviews.scrollWidth - reviews.clientWidth;
    controls.hidden = end < 2;
    previous.disabled = reviews.scrollLeft <= 2;
    next.disabled = reviews.scrollLeft >= end - 2;
  }
  function slide(direction) {
    const card = reviews.firstElementChild;
    const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(reviews).columnGap);
    reviews.scrollBy({ left: direction * distance, behavior: motion.matches ? 'smooth' : 'instant' });
  }
  previous.addEventListener('click', () => slide(-1));
  next.addEventListener('click', () => slide(1));
  reviews.addEventListener('scroll', updateReviews, { passive: true });
  addEventListener('resize', updateReviews);
  updateReviews();

  const hero = page.querySelector('.base-hero');
  const art = hero.querySelector('.base-hero-visual');
  const dock = page.querySelector('.base-dock');
  if (!('IntersectionObserver' in window)) return;
  page.classList.add('base-motion');
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    });
  }, { threshold: .08 });
  page.querySelectorAll('[data-base-reveal]').forEach(element => reveal.observe(element));

  let frame;
  function updateScroll() {
    frame = null;
    const bounds = hero.getBoundingClientRect();
    dock.hidden = bounds.bottom > innerHeight * .65;
    if (motion.matches) art.style.setProperty('--base-art-offset', `${Math.min(20, Math.max(0, -bounds.top * .08))}px`);
  }
  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll);
  updateScroll();
})();
