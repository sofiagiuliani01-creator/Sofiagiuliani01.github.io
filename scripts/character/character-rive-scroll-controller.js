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
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const normalizeAnimation = (instance, name) => {
      if (!instance || !Array.isArray(instance.animationNames)) return name;
      return instance.animationNames.find((animationName) => animationName === name)
        || instance.animationNames.find((animationName) => animationName.trim() === name)
        || instance.animationNames.find((animationName) => animationName.toLowerCase().trim() === name.toLowerCase())
        || name;
    };

    const resizeCanvasToDisplaySize = (canvas, ratio = 1.55) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round((rect.height || rect.width * ratio) * dpr));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    };

    const makeRive = ({ canvas, autoplay = false, animation = null, onLoad = null }) => {
      resizeCanvasToDisplaySize(canvas);
      let instance = null;
      instance = new window.rive.Rive({
        src: RIVE_FILE,
        canvas,
        autoplay,
        animations: animation || undefined,
        layout: new window.rive.Layout({ fit: window.rive.Fit.Contain, alignment: window.rive.Alignment.Center }),
        onLoad: () => {
          if (instance && typeof instance.resizeDrawingSurfaceToCanvas === 'function') instance.resizeDrawingSurfaceToCanvas();
          if (typeof onLoad === 'function') onLoad(instance);
        }
      });
      return instance;
    };

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
    const cardInstances = [];

    const setSize = () => {
      const width = window.innerWidth <= MOBILE_BREAKPOINT ? 132 : 190;
      wrap.style.width = `${width}px`;
      resizeCanvasToDisplaySize(canvas, 1.8);
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
      const normalizedName = normalizeAnimation(riveInstance, name);
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
      const normalizedName = normalizeAnimation(riveInstance, name);
      const clamped = gsap.utils.clamp(0, 1, progress);
      activeAnimation = normalizedName;
      try {
        if (typeof riveInstance.scrub === 'function') {
          riveInstance.scrub(normalizedName, clamped * assumedDuration);
          safePause();
        } else {
          playAnimation(normalizedName, { reset: clamped < 0.04 });
        }
      } catch (_) {
        playAnimation(normalizedName);
      }
    };

    const playCardAnimation = (index, { force = false } = {}) => {
      const card = cardInstances[index];
      const animationName = cardAnimationNames[index];
      if (!card || !card.instance || !animationName) return;
      if (!force && activeCardIndex === index) return;
      activeCardIndex = index;
      cardInstances.forEach((item, itemIndex) => {
        item.el.classList.toggle('is-rive-active', itemIndex === index);
        if (itemIndex !== index && item.instance && typeof item.instance.pause === 'function') {
          try { item.instance.pause(); } catch (_) {}
        }
      });
      const normalizedName = normalizeAnimation(card.instance, animationName);
      try {
        if (typeof card.instance.reset === 'function') card.instance.reset({ animations: normalizedName });
        if (typeof card.instance.play === 'function') card.instance.play(normalizedName);
      } catch (_) {}
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

    document.querySelectorAll('[data-rive-card]').forEach((el) => {
      const index = Number(el.getAttribute('data-rive-card'));
      const cardCanvas = el.querySelector('[data-rive-card-canvas]');
      const animation = cardAnimationNames[index];
      if (!cardCanvas || !animation) return;
      const item = { el, canvas: cardCanvas, instance: null };
      cardInstances[index] = item;
      item.instance = makeRive({
        canvas: cardCanvas,
        autoplay: !reduceMotion && index === 0,
        animation,
        onLoad: (instance) => {
          if (index === 0) playCardAnimation(0, { force: true });
          if (instance && typeof instance.resizeDrawingSurfaceToCanvas === 'function') instance.resizeDrawingSurfaceToCanvas();
        }
      });
    });

    setSize();
    centerCharacter();

    riveInstance = makeRive({
      canvas,
      autoplay: false,
      onLoad: () => {
        layer.classList.remove('is-hidden');
        scrubAnimation('traction', 0, TRANSITION_DURATION);
        ScrollTrigger.refresh();
      }
    });

    window.addEventListener('scroll', updateScrollSpeed, { passive: true });
    window.addEventListener('resize', () => {
      setSize();
      centerCharacter();
      cardInstances.forEach((item) => {
        if (!item) return;
        resizeCanvasToDisplaySize(item.canvas);
        if (item.instance && typeof item.instance.resizeDrawingSurfaceToCanvas === 'function') item.instance.resizeDrawingSurfaceToCanvas();
      });
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

    ScrollTrigger.create({ trigger: steps[0], start: 'top 86%', end: 'top 68%', scrub: true, onUpdate: (self) => scrubAnimation('jump_1_card', self.progress, TRANSITION_DURATION) });
    ScrollTrigger.create({ trigger: steps[0], start: 'top 68%', end: 'top center', scrub: true, onUpdate: (self) => scrubAnimation('enter_to_1_card', self.progress, TRANSITION_DURATION) });

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

    ScrollTrigger.create({ trigger: section, start: 'bottom 70%', end: 'bottom top', scrub: true, onUpdate: (self) => scrubAnimation('last', self.progress, TRANSITION_DURATION) });
  });
})();
