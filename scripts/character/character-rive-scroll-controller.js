(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('#come-funziona');
    const timeline = section && section.querySelector('[data-timeline]');
    const steps = timeline ? Array.from(timeline.querySelectorAll('.timeline-step')) : [];

    if (!section || !timeline || !steps.length || !window.gsap || !window.ScrollTrigger || !window.rive) return;

    gsap.registerPlugin(ScrollTrigger);

    const RIVE_FILE = 'omino%207.riv';
    const MOBILE_BREAKPOINT = 900;
    const TRANSITION_DURATION = 1.15;
    const transitionNames = ['traction', 'jump_1_card', 'enter_to_1_card', '1_to_2', '2_to_3', '3_to_4', '4_to_5', 'last'];
    const cardAnimationNames = ['card_1_action', 'card_1_action', 'progress_monitor_card', 'optimize_results_card', 'healthy_lifestyle_card'];

    const layer = document.createElement('div');
    layer.className = 'character-canvas-layer character-rive-layer is-hidden';
    layer.setAttribute('aria-hidden', 'true');

    const wrap = document.createElement('div');
    wrap.className = 'character-canvas-wrap character-rive-wrap';

    const canvas = document.createElement('canvas');
    canvas.className = 'character-canvas character-rive-canvas';

    wrap.appendChild(canvas);
    layer.appendChild(wrap);
    document.body.appendChild(layer);

    let riveInstance = null;
    let activeAnimation = '';
    let activeCardIndex = -1;
    let cardPlayTimer = 0;
    let lastScrollY = window.scrollY || window.pageYOffset;
    let lastScrollTs = performance.now();
    let scrollSpeed = 0;

    const normalizeAnimation = (name) => {
      if (!riveInstance || !Array.isArray(riveInstance.animationNames)) return name;
      return riveInstance.animationNames.find((animationName) => animationName === name)
        || riveInstance.animationNames.find((animationName) => animationName.trim() === name)
        || riveInstance.animationNames.find((animationName) => animationName.toLowerCase().trim() === name.toLowerCase())
        || name;
    };

    const setSize = () => {
      const width = window.innerWidth <= MOBILE_BREAKPOINT ? 132 : 190;
      wrap.style.width = `${width}px`;
      canvas.width = Math.round(width * Math.min(window.devicePixelRatio || 1, 2));
      canvas.height = Math.round(width * 1.8 * Math.min(window.devicePixelRatio || 1, 2));
    };

    const centerCharacter = () => {
      wrap.style.transform = 'translate3d(calc(50vw - 50%), calc(50vh - 50%), 0)';
    };

    const safePause = () => {
      if (!riveInstance || typeof riveInstance.pause !== 'function') return;
      try { riveInstance.pause(); } catch (_) {}
    };

    const playAnimation = (name, { reset = false } = {}) => {
      if (!riveInstance || !name) return;
      const normalizedName = normalizeAnimation(name);
      if (activeAnimation === normalizedName && !reset) return;
      activeAnimation = normalizedName;
      if (reset && typeof riveInstance.reset === 'function') {
        try { riveInstance.reset({ animations: normalizedName }); } catch (_) {}
      }
      try {
        if (typeof riveInstance.play === 'function') riveInstance.play(normalizedName);
      } catch (_) {}
    };

    const scrubAnimation = (name, progress, assumedDuration) => {
      if (!riveInstance || !name) return;
      const normalizedName = normalizeAnimation(name);
      const clamped = gsap.utils.clamp(0, 1, progress);
      activeAnimation = normalizedName;
      try {
        if (typeof riveInstance.scrub === 'function') {
          riveInstance.scrub(normalizedName, clamped * assumedDuration);
          safePause();
        } else {
          playAnimation(normalizedName);
        }
      } catch (_) {
        playAnimation(normalizedName);
      }
    };

    const playCardAnimation = (index, { force = false } = {}) => {
      const animationName = cardAnimationNames[index];
      if (!animationName) return;
      if (!force && activeCardIndex === index && activeAnimation === normalizeAnimation(animationName)) return;
      const isNewCard = activeCardIndex !== index;
      activeCardIndex = index;
      playAnimation(animationName, { reset: isNewCard || force });
    };

    const updateScrollSpeed = () => {
      const now = performance.now();
      const y = window.scrollY || window.pageYOffset;
      const dt = Math.max(16, now - lastScrollTs);
      scrollSpeed = Math.abs(y - lastScrollY) / dt;
      lastScrollY = y;
      lastScrollTs = now;
      window.clearTimeout(cardPlayTimer);
      cardPlayTimer = window.setTimeout(() => {
        if (activeCardIndex >= 0) playCardAnimation(activeCardIndex, { force: true });
      }, scrollSpeed > 2.2 ? 180 : 80);
    };

    setSize();
    centerCharacter();

    riveInstance = new window.rive.Rive({
      src: RIVE_FILE,
      canvas,
      autoplay: false,
      layout: new window.rive.Layout({ fit: window.rive.Fit.Contain, alignment: window.rive.Alignment.Center }),
      onLoad: () => {
        layer.classList.remove('is-hidden');
        if (typeof riveInstance.resizeDrawingSurfaceToCanvas === 'function') riveInstance.resizeDrawingSurfaceToCanvas();
        scrubAnimation('traction', 0, TRANSITION_DURATION);
        ScrollTrigger.refresh();
      }
    });

    window.addEventListener('scroll', updateScrollSpeed, { passive: true });
    window.addEventListener('resize', () => {
      setSize();
      centerCharacter();
      if (riveInstance && typeof riveInstance.resizeDrawingSurfaceToCanvas === 'function') riveInstance.resizeDrawingSurfaceToCanvas();
      ScrollTrigger.refresh();
    }, { passive: true });

    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top center',
      scrub: true,
      onUpdate: (self) => scrubAnimation('traction', self.progress, TRANSITION_DURATION),
      onEnter: () => layer.classList.remove('is-hidden'),
      onEnterBack: () => layer.classList.remove('is-hidden')
    });

    ScrollTrigger.create({
      trigger: steps[0],
      start: 'top 86%',
      end: 'top 68%',
      scrub: true,
      onUpdate: (self) => scrubAnimation('jump_1_card', self.progress, TRANSITION_DURATION)
    });

    ScrollTrigger.create({
      trigger: steps[0],
      start: 'top 68%',
      end: 'top center',
      scrub: true,
      onUpdate: (self) => scrubAnimation('enter_to_1_card', self.progress, TRANSITION_DURATION)
    });

    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => playCardAnimation(index, { force: true }),
        onEnterBack: () => playCardAnimation(index, { force: true })
      });

      const nextTransition = transitionNames[index + 3];
      if (index < steps.length - 1 && nextTransition) {
        ScrollTrigger.create({
          trigger: step,
          start: 'bottom 64%',
          end: 'bottom 36%',
          scrub: true,
          onUpdate: (self) => scrubAnimation(nextTransition, self.progress, TRANSITION_DURATION)
        });
      }
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'bottom 70%',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => scrubAnimation('last', self.progress, TRANSITION_DURATION)
    });
  });
})();
