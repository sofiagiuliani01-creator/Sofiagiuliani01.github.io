document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('[data-reviews-track]');
  const prevBtn = document.querySelector('[data-reviews-prev]');
  const nextBtn = document.querySelector('[data-reviews-next]');

  if (!track || !prevBtn || !nextBtn) return;

  const getScrollAmount = () => {
    const firstCard = track.querySelector('.trustpilot-card');
    if (!firstCard) return 420;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0');
    return firstCard.getBoundingClientRect().width + gap;
  };

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });
});
