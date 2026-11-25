(() => {
  const page = document.querySelector('.base-page');
  const motion = matchMedia('(prefers-reduced-motion: no-preference)');
  const journey = page.querySelector('[data-base-journey]');
  const steps = [...journey.querySelectorAll('.base-step')];
  const markers = steps.map(step => step.querySelector('.base-step-marker'));

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
    const centers = markers.map(marker => {
      const box = marker.getBoundingClientRect();
      return box.top + box.height / 2;
    });
    const first = centers[0];
    const length = centers[centers.length - 1] - first;
    const readingLine = innerHeight * .62;
    const progress = Math.max(0, Math.min(1, (readingLine - first) / length));
    const active = centers.findLastIndex(center => center <= readingLine);

    journey.style.setProperty('--base-rail-length', `${length}px`);
    journey.style.setProperty('--base-rail-progress', progress);
    steps.forEach((step, index) => step.classList.toggle('is-active', index === active));
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
