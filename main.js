 // MENÙ MOBILE
const burger = document.querySelector('.burger');
const mainNav = document.querySelector('.main-nav');

if (burger && mainNav) {
  burger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
burger.classList.toggle("is-open");
  });
}

// STORYLINE / TIMELINE
const timelineEl = document.querySelector('[data-timeline]');
if (timelineEl) {
  const steps = Array.from(timelineEl.querySelectorAll('.timeline-step'));
  const activeLine = timelineEl.querySelector('.timeline-line-active');

  function updateActiveLine(index) {
    if (!activeLine || steps.length <= 1) return;
    const ratio = index / (steps.length - 1 || 1);
    // la linea va da 10% a 90% in base allo step
    const percent = 10 + ratio * 80;
    activeLine.style.height = percent + '%';
  }

  // stato iniziale: linea corta, niente highlight step-by-step
  updateActiveLine(0);

  if ('IntersectionObserver' in window) {
    const revealed = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        let maxIndex = -1;

        entries.forEach((entry) => {
          const step = entry.target;
          const index = steps.indexOf(step);

          if (entry.isIntersecting) {
            revealed.add(step);
            step.classList.add('is-revealed');
          }
        });

        // calcola l'ultimo step rivelato e allunga la linea in modo progressivo
        steps.forEach((s, i) => {
          if (revealed.has(s)) maxIndex = i;
        });

        if (maxIndex >= 0) updateActiveLine(maxIndex);
      },
      {
        root: null,
        threshold: 0.25,
      }
    );

    steps.forEach((step) => observer.observe(step));
  } else {
    // Browser vecchi: mostra tutto e linea piena
    steps.forEach((s) => s.classList.add('is-revealed'));
    updateActiveLine(steps.length - 1);
  }
}

// SMOOTH SCROLL PER I LINK CON #
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const offset = 72; // per non coprire con l'header
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    }
  });
});
// FAQ INTERATTIVE (ACCORDION)
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('[data-faq-item]');

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    // stato iniziale
    answer.style.maxHeight = '0px';
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // chiudi tutte
      faqItems.forEach((other) => {
        const otherBtn = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (!otherBtn || !otherAnswer) return;
        other.classList.remove('is-open');
        otherBtn.setAttribute('aria-expanded', 'false');
        otherAnswer.style.maxHeight = '0px';
      });

      // se prima era chiusa, apri questa
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});
// SEZIONE "LEONARDO È DIVERSO" - card attive in base allo scroll
/* ==========================================
   LEONARDO È DIVERSO – STACK MOBILE
   Card che sale, quella sopra va dietro
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const cards = gsap.utils.toArray('[data-different-card]');
  if (!cards.length) return;

  const mm = gsap.matchMedia();
  let diffTriggers = [];

  const clearTriggers = () => {
    diffTriggers.forEach(t => t.kill());
    diffTriggers = [];
  };

  // --- GESTIONE STATI (ATTIVA + DIETRO) ---
  const setStates = (activeIndex) => {
    cards.forEach((c, i) => {
      c.classList.remove('is-active', 'is-behind');

      if (i === activeIndex) {
        // nuova card che entra → sopra
        c.classList.add('is-active');
      } else if (i === activeIndex - 1) {
        // card precedente va dietro e si rimpicciolisce
        c.classList.add('is-behind');
      }
    });
  };

  // --- DESKTOP ---
  mm.add("(min-width: 901px)", () => {
    clearTriggers();
    setStates(0);

    cards.forEach((card, index) => {
      const trig = ScrollTrigger.create({
        trigger: card,
        start: "top center",
        end: "bottom center",
        onEnter: () => setStates(index),
        onEnterBack: () => setStates(index)
      });
      diffTriggers.push(trig);

      // Hover mantiene l’effetto
      card.addEventListener('mouseenter', () => setStates(index));
    });

    return () => clearTriggers();
  });

  // --- MOBILE ---
  mm.add("(max-width: 900px)", () => {
    clearTriggers();
    setStates(0);

    cards.forEach((card, index) => {
      const trig = ScrollTrigger.create({
        trigger: card,
        start: "top top+=300",
        end: "bottom top+=200",
        onEnter: () => setStates(index),
        onEnterBack: () => setStates(index)
      });

      diffTriggers.push(trig);
    });

    return () => clearTriggers();
  });
});
// CONSULENZA – Stepper pin + linea + step attivi
// CONSULENZA – Stepper pin (tutte le viewport, scroll della pagina)
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('consulenza-stepper-section');
  if (!section) return;

  const pin = section.querySelector('.consulenza-stepper-pin');
  const stepper = section.querySelector('[data-consulenza-stepper]');
  if (!pin || !stepper) return;

  const steps = Array.from(
    stepper.querySelectorAll('.consulenza-stepper-step')
  );
  const lineActive = stepper.querySelector('.consulenza-stepper-line-active');
  if (!steps.length || !lineActive) return;

  const headerOffset = 100;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const sectionTop = scrollY + rect.top;
    const sectionHeight = section.offsetHeight;
    const pinHeight = pin.offsetHeight;

    const startPin = sectionTop - headerOffset;
    const endPin = sectionTop + sectionHeight - pinHeight - headerOffset;

    const isMobile = window.innerWidth <= 760;

    // blocco pinnato
    if (isMobile) {
      pin.classList.remove('is-fixed');
    } else if (scrollY >= startPin && scrollY <= endPin) {
      pin.classList.add('is-fixed');
    } else {
      pin.classList.remove('is-fixed');
    }

    // progresso 0 → 1 lungo la sezione
    let progress;
    if (scrollY <= startPin) {
      progress = 0;
    } else if (scrollY >= endPin) {
      progress = 1;
    } else {
      progress = (scrollY - startPin) / (endPin - startPin);
    }

    // linea che si riempie
    lineActive.style.width = (progress * 100) + '%';

    // step che si accendono in sequenza
    const activeIndex = Math.min(
      steps.length - 1,
      Math.floor(progress * steps.length)
    );

    steps.forEach((step, index) => {
      step.classList.toggle('active', index <= activeIndex);
    });
  };

  // stato iniziale
  steps.forEach(step => step.classList.remove('active'));
  if (steps[0]) steps[0].classList.add('active');
  lineActive.style.width = '0%';

  update(); // prima chiamata

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
});
// ========== PAGE SLIDE TRANSITIONS TRA LE PAGINE ==========

(function () {
  const TRANSITION_DURATION = 450; // deve combaciare con il CSS (0.45s)

  // All'avvio: anima l'entrata della pagina
  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const main = document.querySelector('main');
    if (!main) return;

    // Aggiungo la classe di entrata
    body.classList.add('page-transition-in');

    // Rimuovo la classe dopo l'animazione così non rimane "appiccicata"
    main.addEventListener(
      'animationend',
      (e) => {
        if (e.animationName === 'pageSlideInRight') {
          body.classList.remove('page-transition-in');
        }
      },
      { once: true }
    );
  });

  // Helper: capisce se il link è interno al tuo sito
  function isInternalLink(anchor) {
    if (!anchor || !anchor.href) return false;

    try {
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return false;

      // se è solo un salto interno (#sezione) → niente transizione
      if (url.pathname === window.location.pathname) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  // Intercetta i click su TUTTO il body e filtra solo i link giusti
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Lascia stare:
    // - link con # (scroll interno)
    // - target _blank
    // - click con CTRL / CMD / SHIFT (nuova scheda)
    if (href.startsWith('#')) return;
    if (anchor.target === '_blank') return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (!isInternalLink(anchor)) return;

    // Ok, è un link interno verso un'altra pagina → transizione
    event.preventDefault();

    const body = document.body;
    const url = anchor.href;

    body.classList.add('page-transition-out');

    // Aspetto la fine dell'animazione e poi navigo
    setTimeout(() => {
      window.location.href = url;
    }, TRANSITION_DURATION - 50); // leggermente prima della fine per feeling più snappy
  });
})();
// ======================================================
// HOME MOBILE – GSAP: PARALLAX, SFONDI, ENTRATE SEZIONI
// (solo sotto i 900px, desktop invariato)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (!document.body.classList.contains('page-home')) return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(max-width: 900px)", () => {
    // ---------- 1) GESTIONE TEMA DI SFONDO PER SEZIONE ----------
    const setTheme = (name) => {
      const existing = Array.from(document.body.classList).filter(c =>
        c.startsWith('mobile-theme-')
      );
      existing.forEach(c => document.body.classList.remove(c));
      if (name) {
        document.body.classList.add('mobile-theme-' + name);
      }
    };

    const themedSections = document.querySelectorAll('[data-mobile-theme]');
    themedSections.forEach((section) => {
      const themeName = section.dataset.mobileTheme;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 65%',
        onEnter: () => setTheme(themeName),
        onEnterBack: () => setTheme(themeName),
      });
    });

    // tema iniziale
    setTheme('hero');

    // ---------- 2) HERO PARALLAX ----------
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroText = hero.querySelector('.hero-text');
      const heroMedia = hero.querySelector('.hero-media');

      if (heroMedia) {
        gsap.to(heroMedia, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (heroText) {
        gsap.from(heroText, {
          y: 24,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: hero,
            start: 'top 85%',
          },
        });
      }
    }

    // ---------- 3) TIMELINE: ENTRATA STEP ----------
// ---------- 3) TIMELINE: SOLO LA CARD ATTIVA È PIENA ----------
// STORYLINE / TIMELINE – mobile slider orizzontale con card attiva
const timelineEl = document.querySelector('[data-timeline]');

if (timelineEl) {
  const steps = Array.from(timelineEl.querySelectorAll('.timeline-step'));
  const activeLine = timelineEl.querySelector('.timeline-line-active');
  const stepsContainer = timelineEl.querySelector('.timeline-steps');

  if (!steps.length || !stepsContainer) {
    console.warn('Timeline: mancano step o container');
  } else {

    // attiva una card per indice e aggiorna eventuale linea
    const activateByIndex = (index) => {
      const clamped = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((s, i) => {
        s.classList.toggle('is-active', i === clamped);
      });

      if (activeLine && steps.length > 1) {
        const ratio = clamped / (steps.length - 1 || 1);
        const percent = 10 + ratio * 80; // 10% -> 90%
        activeLine.style.height = percent + '%';
      }
    };

    // ----- MOBILE: slider orizzontale -----
    const setupMobileSlider = () => {
      const updateActiveFromScroll = () => {
        const rect = stepsContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        let bestIndex = 0;
        let bestDist = Infinity;

        steps.forEach((step, index) => {
          const r = step.getBoundingClientRect();
          const stepCenter = r.left + r.width / 2;
          const dist = Math.abs(stepCenter - centerX);
          if (dist < bestDist) {
            bestDist = dist;
            bestIndex = index;
          }
        });

        activateByIndex(bestIndex);
      };

      // aggiorna su scroll orizzontale del container
      stepsContainer.addEventListener('scroll', updateActiveFromScroll, { passive: true });
      window.addEventListener('resize', updateActiveFromScroll);

      // prima chiamata
      updateActiveFromScroll();
    };

    // ----- DESKTOP: comportamento originale con IntersectionObserver -----
    const setupDesktopTimeline = () => {
      if (!('IntersectionObserver' in window)) {
        // fallback: tutte attive e linea piena
        steps.forEach((s) => s.classList.add('is-active'));
        activateByIndex(steps.length - 1);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const step = entry.target;
            const index = steps.indexOf(step);
            if (index >= 0) {
              activateByIndex(index);
            }
          });
        },
        {
          root: null,
          threshold: 0.5,
        }
      );

      steps.forEach((step) => observer.observe(step));
    };

    // switch tra mobile e desktop
    const initTimelineMode = () => {
      if (window.innerWidth <= 900) {
        setupMobileSlider();
      } else {
        setupDesktopTimeline();
      }
    };

    initTimelineMode();

    window.addEventListener('resize', () => {
      // opzionale: se cambi spesso dimensione, potresti voler re-inizializzare
      // qui si potrebbe fare un debounce, ma su mobile di solito non serve
    });
  }
}

    // ---------- 4) PROGRAMMI: SOLLEVAMENTO CARD ----------
    const planCards = gsap.utils.toArray('.plan-card');
    planCards.forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
      });

      gsap.to(card, {
        y: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });


    // ---------- 6) FAQ: ENTRATE MORBIDE ----------
    const faqItems = gsap.utils.toArray('.faq-item');
    faqItems.forEach((item) => {
      gsap.from(item, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 95%',
        },
      });
    });
  });
});
/* ================================================
   PARALLAX TOUCH REFLECTION — PREMIUM ONLY
   ================================================ */
/* ================================================
   PARALLAX TOUCH REFLECTION — BASE + PREMIUM
   ================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#programmi .plan-card");

  if (!cards.length) return;

  const updateReflection = (card, x, y) => {
    const rect = card.getBoundingClientRect();
    const mx = ((x - rect.left) / rect.width) * 100;
    const my = ((y - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${mx}%`);
    card.style.setProperty("--my", `${my}%`);
  };

  cards.forEach((card) => {
    // TOUCH MOVE
    card.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      updateReflection(card, t.clientX, t.clientY);
    });

    // MOUSE MOVE (utile per vedere l'effetto da desktop)
    card.addEventListener("mousemove", (e) => {
      updateReflection(card, e.clientX, e.clientY);
    });
  });
});


// COACHING BASE – toggle prezzo (Base vs Base + lezione)
document.addEventListener('DOMContentLoaded', () => {
  // solo nella pagina Coaching Base
  if (!document.body.classList.contains('page-program-base')) return;

  const priceCard = document.querySelector('.program-price-card');
  if (!priceCard) return;

  const buttons = priceCard.querySelectorAll('.program-price-toggle-btn');
  const panels = priceCard.querySelectorAll('.program-price-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.priceTarget;
      if (!target) return;

      // aggiorna bottoni
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // mostra solo il pannello giusto
      panels.forEach(panel => {
        const panelName = panel.dataset.pricePanel;
        panel.classList.toggle('is-active', panelName === target);
      });
    });
  });
});


// CONSULENZA – toggle confronto (Percorso con me vs Soluzioni classiche)
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-consulenza')) return;

  const wrap = document.querySelector('[data-comparison-toggle]');
  if (!wrap) return;

  const buttons = wrap.querySelectorAll('.comparison-toggle-btn');
  const panels = wrap.querySelectorAll('.comparison-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.comparisonTarget;
      if (!target) return;

      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      panels.forEach(panel => {
        panel.classList.toggle('is-active', panel.dataset.comparisonPanel === target);
      });
    });
  });
});


/* === COMPARE ROW TOGGLE (Home mobile programs) === */
document.addEventListener('click', (e) => {
  const row = e.target.closest && e.target.closest('#programmi .compare-row:not(.compare-row--head)');
  if (!row) return;

  const expanded = row.getAttribute('aria-expanded') === 'true';
  row.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  const details = row.querySelector('.compare-details');
  if (details) details.hidden = expanded;
});


/* === TIMELINE SCROLL OBSERVER === */
document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.timeline');
  const items = document.querySelectorAll('.timeline-item');

  if (!timeline || !items.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        timeline.classList.add('is-visible');
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.25 });

  items.forEach(i => obs.observe(i));
});


/* === ZIP-51 TIMELINE REVEAL (override any leftover active state) === */
document.addEventListener('DOMContentLoaded', () => {
  const timelineEl = document.querySelector('[data-timeline]');
  if (!timelineEl) return;

  const steps = Array.from(timelineEl.querySelectorAll('.timeline-step'));
  const activeLine = timelineEl.querySelector('.timeline-line-active');

  // remove any previous active highlighting
  steps.forEach(s => s.classList.remove('is-active'));

  const updateLine = (idx) => {
    if (!activeLine || steps.length <= 1) return;
    const ratio = idx / (steps.length - 1 || 1);
    const percent = 6 + ratio * 88; // from 6% to 94%
    activeLine.style.height = percent + '%';
  };
  updateLine(0);

  if (!('IntersectionObserver' in window)) {
    steps.forEach(s => s.classList.add('is-revealed'));
    updateLine(steps.length - 1);
    return;
  }

  const revealed = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const step = entry.target;
      revealed.add(step);
      step.classList.add('is-revealed');
    });

    let max = -1;
    steps.forEach((s, i) => { if (revealed.has(s)) max = i; });
    if (max >= 0) updateLine(max);
  }, { threshold: 0.35 });

  steps.forEach(s => io.observe(s));
});


/* === ZIP-52 TIMELINE: SLOW LINE + ACTIVE ON REVEALED === */
document.addEventListener('DOMContentLoaded', () => {
  const timelineEl = document.querySelector('[data-timeline]');
  if (!timelineEl) return;

  const steps = Array.from(timelineEl.querySelectorAll('.timeline-step'));
  const activeLine = timelineEl.querySelector('.timeline-line-active');
  if (!steps.length) return;

  // helper: animate line height smoothly
  let animId = null;
  const animateLineTo = (targetPct, duration=1400) => {
    if (!activeLine) return;
    if (animId) cancelAnimationFrame(animId);

    const start = performance.now();
    const from = parseFloat(activeLine.style.height || '0') || 0;
    const to = targetPct;

    const ease = (t) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(p);
      activeLine.style.height = v + '%';
      if (p < 1) animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
  };

  const targetForIndex = (idx) => {
    if (!activeLine || steps.length <= 1) return 0;
    const ratio = idx / (steps.length - 1 || 1);
    return 6 + ratio * 88;
  };

  // init
  animateLineTo(targetForIndex(0), 900);

  if (!('IntersectionObserver' in window)) {
    steps.forEach(s => { s.classList.add('is-revealed'); s.classList.add('is-active'); });
    animateLineTo(targetForIndex(steps.length - 1), 1400);
    return;
  }

  const revealed = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const step = entry.target;
      revealed.add(step);
      step.classList.add('is-revealed');
      step.classList.add('is-active');
    });

    let max = -1;
    steps.forEach((s, i) => { if (revealed.has(s)) max = i; });
    if (max >= 0) animateLineTo(targetForIndex(max), 1500);
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  steps.forEach(s => io.observe(s));
});


/* === ZIP-55 THEIA PARALLAX (Desktop 3 columns: up/down/up) === */
(() => {
  const section = document.querySelector('#leonardo-diverso');
  const colsWrap = section && section.querySelector('[data-theia-parallax="cols"]');
  if (!section || !colsWrap) return;

  const col1 = colsWrap.querySelector('.diff-col-1');
  const col2 = colsWrap.querySelector('.diff-col-2');
  const col3 = colsWrap.querySelector('.diff-col-3');
  if (!col1 || !col2 || !col3) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.matchMedia && window.matchMedia('(min-width: 981px)').matches;

  if (prefersReduced || !isDesktop()) return;

  let ticking = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function update(){
    ticking = false;
    if (!isDesktop()) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;

    // progress from 0 to 1 as section passes through viewport
    const total = rect.height + vh;
    const passed = vh - rect.top;
    const p = clamp(passed / total, 0, 1);

    // amplitude in px (subtle like Theia)
    const amp = 90;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const e = ease(p);

    // col1 up, col2 down, col3 up
    col1.style.setProperty('--diffShift', `${-amp * e}px`);
    col2.style.setProperty('--diffShift', `${ amp * e}px`);
    col3.style.setProperty('--diffShift', `${-amp * e}px`);
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* === ZIP-56 THEIA PARALLAX (3 cols) — keep all cards visible === */
(() => {
  const wrap = document.querySelector('#leonardo-diverso .diff-cols[data-theia-parallax="cols"]');
  if (!wrap) return;

  const mq = window.matchMedia('(min-width: 981px)');
  const cols = [
    wrap.querySelector('.diff-col-1'),
    wrap.querySelector('.diff-col-2'),
    wrap.querySelector('.diff-col-3')
  ].filter(Boolean);

  const steps = Array.from(wrap.querySelectorAll('.different-item'));
  const amp = 90; // subtle premium

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function tick(){
    if (!mq.matches) return;

    const section = document.querySelector('#leonardo-diverso');
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;

    // progress through section
    const total = r.height + vh;
    const passed = (vh - r.top);
    const p = clamp01(passed / total);

    const shift = (p - 0.5) * 2 * amp; // -amp..+amp

    // col1 up, col2 down, col3 up
    const s1 = -shift;
    const s2 = shift;
    const s3 = -shift;

    const c1 = wrap.querySelector('.diff-col-1');
    const c2 = wrap.querySelector('.diff-col-2');
    const c3 = wrap.querySelector('.diff-col-3');
    if (c1) c1.style.setProperty('--diffShift', s1.toFixed(2) + 'px');
    if (c2) c2.style.setProperty('--diffShift', s2.toFixed(2) + 'px');
    if (c3) c3.style.setProperty('--diffShift', s3.toFixed(2) + 'px');

    // keep is-active for appeared (all visible): set active by progress
    const activeIdx = Math.round(p * (steps.length - 1));
    steps.forEach((el,i)=> el.classList.toggle('is-active', i===activeIdx));
  }

  let raf = 0;
  function onScroll(){
    if (raf) return;
    raf = requestAnimationFrame(()=>{ raf=0; tick(); });
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  tick();
})();


/* === ZIP-57 PARALLAX (Theia columns) === */
(() => {
  const grid = document.querySelector('#leonardo-diverso .theia-diff-grid[data-theia-parallax="cols"]');
  if (!grid) return;

  const mq = window.matchMedia('(min-width: 981px)');
  const amp = 90; // a bit more like Theia, still safe

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function compute(){
    if (!mq.matches) return;
    const section = document.querySelector('#leonardo-diverso');
    if (!section) return;

    const r = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;

    const total = r.height + vh;
    const passed = (vh - r.top);
    const p = clamp01(passed / total);

    // subtle -amp..+amp drift through the section
    const shift = (p - 0.5) * 2 * amp;
    grid.style.setProperty('--diffShift', shift.toFixed(2) + 'px');

    // keep an "active" card based on progress (all visible)
    const cards = Array.from(grid.querySelectorAll('.different-item'));
    if (cards.length){
      const idx = Math.round(p * (cards.length - 1));
      cards.forEach((el,i)=> el.classList.toggle('is-active', i===idx));
    }
  }

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(()=>{ raf=0; compute(); });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  compute();
})();

/* === ZIP-65 TITLE SCROLL (Leonardo è diverso) === */
(() => {
  const section = document.querySelector('#leonardo-diverso');
  if (!section) return;

  const title = section.querySelector('[data-scroll-title="leonardo"]') || section.querySelector('.different-left h2, .different-left h1, .different-left h3');
  if (!title) return;

  const mq = window.matchMedia('(min-width: 981px)');
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function compute(){
    if (!mq.matches){ title.style.transform = ''; return; }
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;

    // progress through section
    const total = r.height + vh;
    const passed = (vh - r.top);
    const p = clamp01(passed / total);

    // noticeable scroll-linked drift: +28px to -28px
    const y = (p - 0.5) * 2 * -28;
    title.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  }

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; compute(); });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  compute();
})();


/* === ZIP-66 MARQUEE SCROLL (Leonardo è diverso) === */
(() => {
  const section = document.querySelector('#leonardo-diverso');
  const marquee = section && section.querySelector('.marquee');
  if (!section || !marquee) return;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  let maxShift = 0;
  function measure(){
    // shift about half of the marquee width (it usually contains duplicate text)
    maxShift = Math.max(0, (marquee.scrollWidth / 2) - (marquee.clientWidth / 2));
  }

  function compute(){
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const total = r.height + vh;
    const passed = (vh - r.top);
    const p = clamp01(passed / total);

    // move left as you scroll down; stays fixed if you stop scrolling
    const x = -p * maxShift;
    marquee.style.setProperty('--marqueeX', x.toFixed(2) + 'px');
  }

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; compute(); });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); });
  // initial
  measure();
  compute();
})();



/* === ZIP-68 TIMELINE SCROLL REVEAL (UP/DOWN) === */
(() => {
  const steps = document.querySelectorAll('#come-funziona .timeline-step');
  if (!steps.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
      } else {
        e.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.4 });

  steps.forEach(s => obs.observe(s));
})();


/* === ZIP-68 SCROLL DIR (Timeline appear on down, soften on up) === */
(() => {
  const section = document.querySelector('#come-funziona');
  if (!section) return;

  let lastY = window.scrollY || 0;
  let dir = 'down';

  const setDir = () => {
    const y = window.scrollY || 0;
    const nextDir = y > lastY ? 'down' : y < lastY ? 'up' : dir;
    if (nextDir !== dir) {
      dir = nextDir;
    }
    lastY = y;
  };

  window.addEventListener('scroll', setDir, { passive: true });
  setDir();
})();










/* === ZIP-73 TIMELINE (Theia-like, stable both directions) === */
(() => {
  const section = document.querySelector('#come-funziona');
  const timeline = section && section.querySelector('.timeline[data-timeline]');
  const lineBase = timeline && timeline.querySelector('.timeline-line-base');
  const steps = timeline ? Array.from(timeline.querySelectorAll('.timeline-step')) : [];
  if (!section || !timeline || !lineBase || steps.length === 0) return;

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const vh = () => (window.innerHeight || 800);

  // thresholds: step becomes active when its top crosses enterY; revert when it crosses leaveY (hysteresis)
  const enterY = () => vh() * 0.62;
  const leaveY = () => vh() * 0.70;

  let active = 0;

  function computeActive(){
    // determine if we should move forward/backward based on current active step position
    const r = steps[active].getBoundingClientRect();

    // move forward if next exists and next has entered
    if (active < steps.length - 1){
      const rn = steps[active + 1].getBoundingClientRect();
      if (rn.top < enterY()) active += 1;
    }
    // move backward if current moved below leave threshold (scrolling up) and previous exists
    if (active > 0){
      if (r.top > leaveY()) active -= 1;
    }
  }

  function progressToActive(){
    const base = lineBase.getBoundingClientRect();
    const badge = steps[active].querySelector('.step-badge') || steps[active];
    const b = badge.getBoundingClientRect();
    const y = (b.top + b.height/2) - base.top;
    return clamp01(y / Math.max(1, base.height));
  }

  function render(){
    computeActive();
    const p = progressToActive();
    timeline.style.setProperty('--tl-progress', p.toFixed(4));

    // visibility: keep all <= active visible, hide below
    steps.forEach((el,i)=>{
      el.classList.toggle('is-visible', i <= active);
      el.classList.toggle('is-active', i === active);
    });
  }

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(()=>{ raf=0; render(); });
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', () => { render(); }, { passive:true });

  // init
  steps.forEach((el,i)=> el.classList.toggle('is-visible', i===0));
  timeline.style.setProperty('--tl-progress', '0.08');
  render();
})();


/* === ZIP-75 TOPSTEPS highlight (sync with timeline active) === */
(() => {
  const section = document.querySelector('#come-funziona');
  const timeline = section && section.querySelector('.timeline[data-timeline]');
  const top = timeline && timeline.querySelector('.timeline-topsteps');
  if (!section || !timeline || !top) return;

  const buttons = Array.from(top.querySelectorAll('.topstep'));
  const steps = Array.from(timeline.querySelectorAll('.timeline-step'));

  function sync(){
    const activeEl = timeline.querySelector('.timeline-step.is-active');
    if (!activeEl) return;
    const idx = steps.indexOf(activeEl);
    if (idx < 0) return;
    buttons.forEach((b,i)=> b.classList.toggle('is-active', i===idx));
  }

  // sync on scroll (lightweight)
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(()=>{ raf=0; sync(); });
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  sync();
})();
























/* === ZIP-92 MOBILE LEONARDO STACK (vars-driven, correct sizing)
   Fixes: old CSS had opacity/transform !important blocking JS. We now drive via CSS vars. */
(() => {
  const section = document.querySelector('#leonardo-diverso');
  if (!section) return;

  const mq = window.matchMedia('(max-width: 980px)');
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  function build(){
    if (!mq.matches) return false;
    if (section.querySelector('.theia-mobile-stack')) return true;

    const right = section.querySelector('.different-right');
    if (!right) return false;

    // Grab all cards inside the section (even if split in columns)
    const cards = Array.from(right.querySelectorAll('.theia-diff-card'));
    if (cards.length < 2) return false;

    const stack = document.createElement('div');
    stack.className = 'theia-mobile-stack';

    const sticky = document.createElement('div');
    sticky.className = 'stack-sticky';

    const wrap = document.createElement('div');
    wrap.className = 'stack-cards';

    sticky.appendChild(wrap);
    stack.appendChild(sticky);

    right.insertBefore(stack, right.firstChild);

    cards.forEach((c,i) => {
      c.style.zIndex = String(1000 + i);
      c.style.setProperty('--zi', String(1000 + i));
      // reset any old pinned styles that could mess with sizing
      c.style.removeProperty('min-height');
      c.style.removeProperty('height');
      c.style.removeProperty('top');
      c.style.removeProperty('position');
      wrap.appendChild(c);
    });

    // Remove desktop grid columns
    right.querySelectorAll('.theia-col').forEach(el => el.remove());
    const grid = right.querySelector('.theia-diff-grid');
    if (grid) grid.remove();

    // Create scroll length: each card ~1.05vh segment
    stack.style.height = `calc(${cards.length} * 105vh)`;
    return true;
  }

  function setCardVars(card, {opacity=1, transform='translate3d(0,0,0) scale(1)', filter='none', shadow='0 18px 60px rgba(0,0,0,0.28)'}){
    card.style.setProperty('--cardOpacity', String(opacity));
    card.style.setProperty('--cardTransform', transform);
    card.style.setProperty('--cardFilter', filter);
    card.style.setProperty('--cardShadow', shadow);
  }

  function update(){
    if (!mq.matches) return;
    const stack = section.querySelector('.theia-mobile-stack');
    if (!stack) return;

    const cards = Array.from(stack.querySelectorAll('.theia-diff-card'));
    if (cards.length === 0) return;

    const rect = stack.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const segment = vh * 1.05;

    const y = -rect.top;
    const prog = y / segment;
    const total = cards.length;

    let idx = Math.floor(prog);
    idx = Math.max(0, Math.min(total - 1, idx));
    const tRaw = prog - idx; // 0..1
    const overlapStart = 0.32;
    const t = clamp01((tRaw - overlapStart) / (1 - overlapStart));

    // Hide all by default
    for (let i=0; i<total; i++){
      const c = cards[i];
      c.style.pointerEvents = 'none';
      setCardVars(c, {
        opacity: 0,
        transform: 'translate3d(0,0,0) scale(0.35)',
        filter: 'brightness(0.78) saturate(0.9)',
        shadow: '0 24px 70px rgba(0,0,0,0.55)'
      });
    }

    // Current card full
    const cur = cards[idx];
    cur.style.pointerEvents = 'auto';
    setCardVars(cur, {
      opacity: 1,
      transform: 'translate3d(0,0,0) scale(1)',
      filter: 'none',
      shadow: '0 18px 60px rgba(0,0,0,0.28)'
    });

    // Next rises from below
    const next = cards[idx+1];
    if (next){
      const yPct = (1 - t) * 105; // start below and rise
      setCardVars(next, {
        opacity: 0.75 + t*0.25,
        transform: `translate3d(0, ${Math.max(0, yPct)}%, 0) scale(1)`,
        filter: 'none',
        shadow: '0 18px 60px rgba(0,0,0,0.28)'
      });

      // As soon as overlap starts, current shrinks/darkens/fades to disappear
      const eased = Math.pow(t, 1.08);
      const scale = 1 - eased * 0.62;
      const op = 1 - eased * 1.12;
      const s = Math.max(0.35, scale);
      const o = Math.max(0, op);

      setCardVars(cur, {
        opacity: o,
        transform: `translate3d(0,0,0) scale(${s})`,
        filter: `brightness(${0.92 - eased*0.22}) saturate(${0.98 - eased*0.10})`,
        shadow: `0 ${24 + eased*18}px ${70 + eased*40}px rgba(0,0,0,${0.55 + eased*0.18})`
      });
    }
  }

  let raf=0;
  const onScroll=()=>{
    if (!mq.matches) return;
    if (raf) return;
    raf=requestAnimationFrame(()=>{ raf=0; update(); });
  };

  const onInit=()=>{
    if (!mq.matches) return;
    build();
    update();
  };

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onInit, {passive:true});
  mq.addEventListener?.('change', onInit);

  onInit();
})();


// ZIP-99 mobile scroll-linked timeline line (continuous)
// Desktop remains step-based via IntersectionObserver; on mobile we smoothly map scroll progress -> line height.
(function(){
  const tl = document.querySelector('[data-timeline]');
  if (!tl) return;

  const activeLine = tl.querySelector('.timeline-line-active');
  if (!activeLine) return;

  const mq = window.matchMedia('(max-width: 980px)');
  let ticking = false;

  function compute(){
    if (!mq.matches) return;

    const rect = tl.getBoundingClientRect();
    const vh = window.innerHeight || 800;

    // Start when timeline enters viewport, finish when it is about to leave
    const start = vh * 0.25;             // trigger a bit after top
    const end = vh * 0.85;               // keep growing until near bottom

    const progress = (start - rect.top) / (rect.height - (end - start));
    const p = Math.max(0, Math.min(1, progress));

    // Same 10% -> 90% mapping used elsewhere
    const percent = 10 + p * 80;
    activeLine.style.height = percent + '%';
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      compute();
    });
  }

  compute();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', compute);

  mq.addEventListener ? mq.addEventListener('change', compute) : mq.addListener(compute);
})();
