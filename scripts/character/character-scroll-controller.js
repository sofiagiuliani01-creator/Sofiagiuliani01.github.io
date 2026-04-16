(function () {
  window.addEventListener('DOMContentLoaded', async () => {
    const hero = document.querySelector('.hero-cinematic');
    const timelineSection = document.querySelector('#come-funziona');
    const timeline = timelineSection && timelineSection.querySelector('[data-timeline]');
    const steps = timeline ? Array.from(timeline.querySelectorAll('.timeline-step')) : [];
    const startMarker = hero && hero.querySelector('[data-character-start]');
    const jumpStartMarker = hero && hero.querySelector('[data-character-jump-start]');

    if (!hero || !timelineSection || !timeline || !steps.length || !startMarker || !jumpStartMarker) return;
    if (!window.gsap || !window.ScrollTrigger || !window.MotionPathPlugin) return;

    const config = window.CharacterSequenceConfig;
    if (!config || !window.CharacterPreloadManager || !window.CharacterCanvasRenderer || !window.CharacterAnimationManager) return;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const preloadManager = new window.CharacterPreloadManager(config);
    const renderer = new window.CharacterCanvasRenderer();
    const animationManager = new window.CharacterAnimationManager({
      config,
      preloadManager,
      renderer
    });

    // Preload iniziale: pullup + transizione + prima card per ridurre hitching.
    await preloadManager.warmup(['pullup', 'jump', 'land', 'card-1']);

    const allCards = Object.values(config.cardMap);
    preloadManager.warmup(allCards);

    const characterState = { x: -9999, y: -9999, rotation: 0, scale: 1 };
    let jumpTween = null;
    let timelineDriftActive = false;

    const setCharacterSize = () => {
      const width = window.innerWidth <= config.responsive.mobileBreakpoint
        ? config.responsive.mobileWidth
        : config.responsive.desktopWidth;
      renderer.setSize(width);
    };

    const pointFromElement = (element, width, height) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - width * 0.5,
        y: rect.top - height * 0.82
      };
    };

    const getTimelineLandingPoint = () => {
      const line = timeline.querySelector('.timeline-line-base');
      const targetStep = steps[0];
      if (!line || !targetStep) return { x: 80, y: window.innerHeight * 0.48 };

      const lineRect = line.getBoundingClientRect();
      const stepRect = targetStep.getBoundingClientRect();
      return {
        x: lineRect.left - renderer.logicalWidth * 0.6,
        y: Math.min(stepRect.top + 40, window.innerHeight * 0.72)
      };
    };

    const applyState = () => renderer.setPosition(characterState);

    const placeInHero = () => {
      const point = pointFromElement(startMarker, renderer.logicalWidth, renderer.logicalHeight);
      characterState.x = point.x;
      characterState.y = point.y;
      characterState.rotation = 0;
      characterState.scale = 1;
      applyState();
    };

    const runJump = () => {
      if (jumpTween) jumpTween.kill();
      timelineDriftActive = true;

      const start = pointFromElement(jumpStartMarker, renderer.logicalWidth, renderer.logicalHeight);
      const end = getTimelineLandingPoint();
      const isMobile = window.innerWidth <= config.responsive.mobileBreakpoint;
      const arcLift = isMobile ? 130 : 210;
      const control = {
        x: start.x + (end.x - start.x) * (isMobile ? 0.45 : 0.42),
        y: Math.min(start.y, end.y) - arcLift
      };

      characterState.x = start.x;
      characterState.y = start.y;
      characterState.rotation = 0;
      applyState();

      animationManager.play('jump', {
        reset: true,
        onComplete: () => {
          animationManager.play('land', {
            reset: true,
            onComplete: () => {
              animationManager.play('card-1', { reset: true });
            }
          });
        }
      });

      jumpTween = gsap.to(characterState, {
        duration: 0.78,
        ease: 'power2.inOut',
        motionPath: {
          path: [start, control, end],
          curviness: 1.15,
          autoRotate: false
        },
        onUpdate: applyState
      });
    };

    const activateTimelineAnimation = (index) => {
      const sequence = config.cardMap[index];
      if (!sequence) return;
      animationManager.play(sequence, { reset: false });
    };

    setCharacterSize();
    renderer.setVisible(true);
    placeInHero();
    animationManager.play('pullup', { reset: true });

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom 32%',
      onEnter: () => {
        timelineDriftActive = false;
        placeInHero();
        animationManager.play('pullup', { reset: false });
      },
      onEnterBack: () => {
        timelineDriftActive = false;
        placeInHero();
        animationManager.play('pullup', { reset: false });
      },
      onLeave: runJump,
      onLeaveBack: () => {
        timelineDriftActive = false;
        if (jumpTween) jumpTween.kill();
        placeInHero();
        animationManager.play('pullup', { reset: true });
      }
    });

    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 58%',
        end: 'bottom 42%',
        onEnter: () => activateTimelineAnimation(index),
        onEnterBack: () => activateTimelineAnimation(index)
      });
    });

    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'top 92%',
      end: 'bottom 10%',
      onUpdate: (self) => {
        if (!timelineDriftActive) return;
        const p = self.progress;
        const target = getTimelineLandingPoint();
        if (p > 0.02) {
          const driftY = p * 120;
          gsap.to(characterState, {
            x: target.x,
            y: target.y + driftY,
            rotation: 0,
            duration: 0.26,
            overwrite: 'auto',
            onUpdate: applyState
          });
        }
      }
    });

    const onResize = () => {
      setCharacterSize();
      placeInHero();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', onResize, { passive: true });

    ScrollTrigger.addEventListener('refreshInit', () => {
      setCharacterSize();
    });
  });
})();
