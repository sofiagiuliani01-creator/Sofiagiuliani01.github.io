(() => {
  const header = document.querySelector('.ls-site-nav');
  if (!header) return;

  const toggle = header.querySelector('.ls-nav-toggle');
  const links = header.querySelector('.ls-nav-links');

  function setOpen(open) {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi menù' : 'Apri menù');
  }

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('is-open')));
  links.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target) && links.classList.contains('is-open')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !links.classList.contains('is-open')) return;
    setOpen(false);
    toggle.focus();
  });

  header.dataset.menuReady = '';
})();
