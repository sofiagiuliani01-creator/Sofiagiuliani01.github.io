(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('#come-funziona');
    const steps = section ? Array.from(section.querySelectorAll('.timeline-step')) : [];
    if (!section || !steps.length || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cardLoops = [];

    steps.forEach((step, index) => {
      const svg = step.querySelector('[data-step-svg]');
      if (!svg) return;

      gsap.set(svg, { transformOrigin: '50% 50%', opacity: index === 0 ? 1 : 0.62, scale: index === 0 ? 1 : 0.94 });
      gsap.set(svg.querySelectorAll('.svg-line'), { transformOrigin: '0% 50%', scaleX: 0.38 });
      gsap.set(svg.querySelector('.svg-transition-path'), { strokeDashoffset: 0 });
      gsap.set(svg.querySelector('.svg-runner'), { transformOrigin: '50% 50%' });

      if (reduceMotion) return;

      const loop = gsap.timeline({ paused: true, repeat: -1, defaults: { ease: 'sine.inOut' } })
        .to(svg.querySelector('.svg-orbit'), { rotation: 360, transformOrigin: '160px 176px', duration: 5.5 }, 0)
        .to(svg.querySelector('.svg-runner'), { scale: 1.28, yoyo: true, repeat: 5, duration: 0.55 }, 0)
        .to(svg.querySelector('.svg-line-a'), { scaleX: 1, yoyo: true, repeat: 3, duration: 0.9 }, 0.1)
        .to(svg.querySelector('.svg-line-b'), { scaleX: 0.86, yoyo: true, repeat: 3, duration: 0.9 }, 0.25)
        .to(svg.querySelector('.svg-line-c'), { scaleX: 0.72, yoyo: true, repeat: 3, duration: 0.9 }, 0.4)
        .to(svg.querySelector('.svg-pulse'), { scale: 1.45, opacity: 0.38, yoyo: true, repeat: 5, duration: 0.55 }, 0);
      cardLoops[index] = loop;
    });

    const activate = (activeIndex) => {
      cardLoops.forEach((loop, index) => {
        if (!loop) return;
        if (index === activeIndex) loop.play();
        else loop.pause(0);
      });
    };

    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 58%',
        end: 'bottom 42%',
        onEnter: () => activate(index),
        onEnterBack: () => activate(index)
      });

      const next = steps[index + 1];
      const currentSvg = step.querySelector('[data-step-svg]');
      const nextSvg = next && next.querySelector('[data-step-svg]');
      if (!nextSvg || !currentSvg || reduceMotion) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: 'bottom 72%',
          end: 'bottom 38%',
          scrub: true
        },
        defaults: { ease: 'power2.inOut' }
      })
        .to(currentSvg, { opacity: 0.45, scale: 0.9, x: -18, filter: 'blur(2px)', duration: 1 }, 0)
        .fromTo(nextSvg, { opacity: 0.4, scale: 0.9, x: 22, filter: 'blur(3px)' }, { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)', duration: 1 }, 0)
        .to(currentSvg.querySelector('.svg-transition-path'), { strokeDashoffset: -520, duration: 1 }, 0)
        .fromTo(nextSvg.querySelector('.svg-transition-path'), { strokeDashoffset: 520 }, { strokeDashoffset: 0, duration: 1 }, 0)
        .fromTo(nextSvg.querySelectorAll('.svg-line'), { scaleX: 0.15 }, { scaleX: 1, stagger: 0.08, duration: 0.8 }, 0.18);
    });

    activate(0);
  });
})();
