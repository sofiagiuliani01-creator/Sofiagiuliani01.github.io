// HOME: header behavior
document.addEventListener('DOMContentLoaded', () => {
  const homeHeader = document.querySelector('.site-header-home');

  if (homeHeader) {
    const onScroll = () => {
      const y = window.scrollY;

      homeHeader.classList.toggle('is-scrolled', y > 24);
      homeHeader.classList.remove('is-hidden');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});

// MENÙ MOBILE
const burger = document.querySelector('.burger');
const mainNav = document.querySelector('.main-nav');

if (burger && mainNav) {
  const navLinks = Array.from(mainNav.querySelectorAll('a'));

  const setMenuState = (isOpen) => {
    mainNav.classList.toggle('open', isOpen);
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  };

  setMenuState(false);

  burger.addEventListener('click', () => {
    setMenuState(!mainNav.classList.contains('open'));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });
}

// ANIMAZIONI GENERICHE ON SCROLL
// Mostra tutti gli elementi marcati con data-animate (tra cui la CTA del questionario)
// aggiungendo la classe usata dal CSS per renderli visibili.
document.addEventListener('DOMContentLoaded', () => {
  const animatedItems = Array.from(document.querySelectorAll('[data-animate]'));
  if (!animatedItems.length) return;

  const showItem = (item) => item.classList.add('in-view');

  if (!('IntersectionObserver' in window)) {
    animatedItems.forEach(showItem);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showItem(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  animatedItems.forEach((item) => observer.observe(item));
});

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
    diffTriggers.forEach((t) => t.kill());
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
  mm.add('(min-width: 901px)', () => {
    clearTriggers();
    setStates(0);

    cards.forEach((card, index) => {
      const trig = ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setStates(index),
        onEnterBack: () => setStates(index),
      });
      diffTriggers.push(trig);

      // Hover mantiene l’effetto
      card.addEventListener('mouseenter', () => setStates(index));
    });

    return () => clearTriggers();
  });

  // --- MOBILE ---
  mm.add('(max-width: 900px)', () => {
    clearTriggers();
    setStates(0);

    cards.forEach((card, index) => {
      const trig = ScrollTrigger.create({
        trigger: card,
        start: 'top top+=300',
        end: 'bottom top+=200',
        onEnter: () => setStates(index),
        onEnterBack: () => setStates(index),
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
    setTheme('flow');
    // ---------- 2) TIMELINE: ENTRATA STEP ----------
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
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('#programmi .plan-card');

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
    card.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      updateReflection(card, t.clientX, t.clientY);
    });

    // MOUSE MOVE (utile per vedere l'effetto da desktop)
    card.addEventListener('mousemove', (e) => {
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

  const table = row.closest('.compare-table');
  const expanded = row.getAttribute('aria-expanded') === 'true';

  if (table) {
    table.querySelectorAll('.compare-row:not(.compare-row--head)').forEach((item) => {
      if (item === row) return;
      item.setAttribute('aria-expanded', 'false');
      item.classList.remove('is-open');

      const itemDetails = item.querySelector('.compare-details');
      if (itemDetails) itemDetails.hidden = true;
    });
  }

  row.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  row.classList.toggle('is-open', !expanded);

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

  let maxShiftX = 0;
  function measure() {
    const overflowShift = Math.max(0, marquee.scrollWidth - marquee.clientWidth);
    const fallbackShift = (window.innerWidth || 390) * 0.45;

    // Garantisce movimento anche quando il testo quasi combacia con la viewport.
    maxShiftX = Math.max(overflowShift, fallbackShift);
  }

  function compute(){
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const total = r.height + vh;
    const passed = (vh - r.top);
    const p = clamp01(passed / total);

    // move horizontally with scroll so the marquee tracks section progress
    const x = -p * maxShiftX;
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

/* === ZIP-135: Mobile compare segmented focus (Base/Premium) === */
document.addEventListener('click', (e) => {
  const headCell = e.target.closest && e.target.closest('#programmi .compare-row--head .compare-cell');
  if (!headCell) return;

  const table = headCell.closest('.compare-table');
  if (!table) return;

  const row = headCell.parentElement;
  const cells = Array.from(row.children);
  const idx = cells.indexOf(headCell);

  if (idx === 1) {
    table.classList.remove('focus-premium');
    table.classList.add('focus-base');
  } else if (idx === 2) {
    table.classList.remove('focus-base');
    table.classList.add('focus-premium');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('#programmi .mobile-compare .compare-table');
  if (table && !table.classList.contains('focus-base') && !table.classList.contains('focus-premium')) {
    table.classList.add('focus-premium');
  }
});

/* === ZIP-136: Mobile plan card switcher (Base / Premium) === */
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('#programmi [data-plan-switch]');
  if (!wrap) return;

  const tabs = Array.from(wrap.querySelectorAll('[data-plan-target]'));
  const cards = Array.from(wrap.querySelectorAll('[data-plan-card]'));

  const setActive = (target) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.planTarget === target;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    cards.forEach((card) => {
      const on = card.dataset.planCard === target;
      card.classList.toggle('is-active', on);
      card.hidden = !on;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      setActive(tab.dataset.planTarget);
    });
  });
});

/* === 2026-03 Home timeline: progressive line + card reveal by scroll === */
(function(){
  const section = document.querySelector('#come-funziona');
  const timeline = section && section.querySelector('.timeline[data-timeline]');
  const line = timeline && timeline.querySelector('.timeline-line-active');
  const steps = timeline ? Array.from(timeline.querySelectorAll('.timeline-step')) : [];
  if (!section || !timeline || !line || !steps.length) return;

  let raf = 0;

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function update(){
    const vh = window.innerHeight || 800;
    const triggerY = vh * 0.64;

    let activeIdx = 0;
    let progressed = 0;

    if (steps.length === 1){
      progressed = 1;
    } else {
      let segment = 0;
      for (let i = 0; i < steps.length - 1; i++) {
        const a = steps[i].getBoundingClientRect();
        const b = steps[i + 1].getBoundingClientRect();
        const ac = a.top + (a.height / 2);
        const bc = b.top + (b.height / 2);

        if (triggerY >= bc) {
          segment = i + 1;
          continue;
        }

        const span = Math.max(1, bc - ac);
        const part = clamp((triggerY - ac) / span, 0, 1);
        progressed = (i + part) / (steps.length - 1);
        break;
      }

      const lastStep = steps[steps.length - 1];
      const firstStep = steps[0];

      if (triggerY >= (lastStep.getBoundingClientRect().top + lastStep.getBoundingClientRect().height / 2)) {
        progressed = 1;
      } else if (triggerY <= (firstStep.getBoundingClientRect().top + firstStep.getBoundingClientRect().height / 2)) {
        progressed = 0;
      } else if (!progressed) {
        progressed = segment / (steps.length - 1);
      }

      activeIdx = Math.round(progressed * (steps.length - 1));
    }

    timeline.style.setProperty('--tl-progress', progressed.toFixed(4));

    steps.forEach((step, idx) => {
      const isVisible = idx <= activeIdx;
      step.classList.toggle('is-visible', isVisible);
      step.classList.toggle('is-active', idx === activeIdx);
      step.classList.toggle('is-revealed', isVisible);
    });
  }

  function onScroll(){
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();

/* === 2026-04 hard fix: home timeline single-line progressive animation === */
(function () {
  const section = document.querySelector('#come-funziona');
  const timeline = section && section.querySelector('.timeline[data-timeline]');
  const line = timeline && timeline.querySelector('.timeline-line-active');
  const steps = timeline ? Array.from(timeline.querySelectorAll('.timeline-step')) : [];
  if (!section || !timeline || !line || !steps.length) return;

  let raf = 0;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function progressByScroll() {
    const vh = window.innerHeight || 800;
    const triggerY = vh * 0.58;
    const lineBox = timeline.getBoundingClientRect();
    const stepBoxes = steps.map((step) => step.getBoundingClientRect());

    if (steps.length === 1) return { progress: 1, active: 0 };

    let active = 0;
    stepBoxes.forEach((box, index) => {
      if (box.top <= triggerY) active = index;
    });

    const firstBox = stepBoxes[0];
    const lastBox = stepBoxes[stepBoxes.length - 1];

    if (triggerY <= firstBox.top) return { progress: 0, active: 0 };
    if (triggerY >= lastBox.bottom) return { progress: 1, active: steps.length - 1 };

    const activeBox = stepBoxes[active];
    const activeCardEnd = Math.min(activeBox.bottom, lineBox.bottom);
    const rawProgress = (activeCardEnd - lineBox.top) / Math.max(1, lineBox.height);

    return {
      progress: clamp(rawProgress, 0, 1),
      active
    };
  }

  function paint() {
    const { progress, active } = progressByScroll();
    timeline.style.setProperty('--tl-progress', progress.toFixed(4));

    steps.forEach((step, idx) => {
      step.classList.toggle('is-visible', idx <= active);
      step.classList.toggle('is-revealed', idx <= active);
      step.classList.toggle('is-active', idx === active);
    });
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      paint();
    });
  }

  paint();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();

// HOME HERO — cinematic storyboard sequence (persistent text nodes)
window.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero-cinematic');
  if (!hero || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const stage = hero.querySelector('.hero-cinematic-stage');
  if (!stage) return;

  const clamp = gsap.utils.clamp(0, 1);
  const remap = (value, inMin, inMax) => clamp((value - inMin) / (inMax - inMin));
  const easeOut = gsap.parseEase('power2.out');
  const easeInOut = gsap.parseEase('power2.inOut');
  const narrativeMap = [
    { raw: 0, story: 0 },
    // ingresso prima frase
    { raw: 0.16, story: 0.2 },
    // pausa 1: "NON SONO SOLO UN PERSONAL TRAINER"
    { raw: 0.24, story: 0.2 },
    // transizione verso seconda frase
    { raw: 0.44, story: 0.52 },
    // pausa 2: "NON HAI BISOGNO SOLO DI UN NUTRIZIONISTA"
    { raw: 0.52, story: 0.52 },
    // merge + reveal logo
    { raw: 0.68, story: 0.76 },
    // pausa 3: reveal LS coaching
    { raw: 0.75, story: 0.76 },
    // chiusura e frase finale
    { raw: 0.92, story: 0.95 },
    { raw: 1, story: 1 }
  ];

  const mapNarrativeProgress = (rawProgress) => {
    const p = clamp(rawProgress);

    for (let i = 0; i < narrativeMap.length - 1; i += 1) {
      const current = narrativeMap[i];
      const next = narrativeMap[i + 1];

      if (p >= current.raw && p <= next.raw) {
        if (next.raw === current.raw) return next.story;
        const local = (p - current.raw) / (next.raw - current.raw);
        return gsap.utils.interpolate(current.story, next.story, local);
      }
    }

    return p <= 0 ? 0 : 1;
  };

  let cinematicProgressLocked = false;
  let autoAdvanceTween = null;
  let autoProgress = 0;
  const mergeAutoStart = 0.82;

  const renderCinematic = (cinematicProgress) => {
      autoProgress = cinematicProgress;

      const split = easeInOut(remap(cinematicProgress, 0.08, 0.58));
      const secondOpacity = easeOut(remap(cinematicProgress, 0.18, 0.29));
      const secondReveal = easeInOut(remap(cinematicProgress, 0.19, 0.33));
      const supportFade = easeInOut(remap(cinematicProgress, 0.54, 0.75));
      const lettersFocus = easeInOut(remap(cinematicProgress, 0.69, 0.87));
      const merge = easeInOut(remap(cinematicProgress, 0.82, 0.94));
      const sLetterMerge = easeOut(remap(cinematicProgress, 0.72, 0.88));
      const coaching = easeOut(remap(cinematicProgress, 0.88, 0.97));
      const sentenceExit = easeInOut(remap(cinematicProgress, 0.86, 0.95));
      const logoRise = easeInOut(remap(cinematicProgress, 0.84, 0.995));
      const logoScale = easeInOut(remap(cinematicProgress, 0.84, 0.995));
      const outroOpacity = easeOut(remap(cinematicProgress, 0.975, 1));
      const outroLift = easeInOut(remap(cinematicProgress, 0.975, 1));
      const pullerEnter = easeOut(remap(cinematicProgress, 0.12, 0.34));
      const pullerSettle = easeInOut(remap(cinematicProgress, 0.34, 0.58));

      const settle = easeInOut(remap(cinematicProgress, 0.64, 0.84));
      const aX = gsap.utils.interpolate(0, -3.2, split) + gsap.utils.interpolate(0, 2.1, settle);
      const aY = gsap.utils.interpolate(0, -8.1, split) + gsap.utils.interpolate(0, 5.2, settle);
      const bX = gsap.utils.interpolate(11.5, 0, secondReveal) + gsap.utils.interpolate(0, -2.8, settle);
      const bY = gsap.utils.interpolate(5.2, 10.2, split) + gsap.utils.interpolate(0, -5, settle);
      const pullerOpacity = 1;
      const pullerX = gsap.utils.interpolate(11.5, -10.5, pullerEnter) + gsap.utils.interpolate(0, 2.2, pullerSettle);
      const pullerY = gsap.utils.interpolate(1.4, -3.6, pullerEnter) + gsap.utils.interpolate(0, 2.2, pullerSettle);
      const pullerLean = gsap.utils.interpolate(-10, -4, pullerEnter) + gsap.utils.interpolate(0, 2.2, pullerSettle);
      const pullerTension = gsap.utils.interpolate(1.05, 1, pullerSettle);
      const walkDrive = easeInOut(remap(cinematicProgress, 0.12, 0.72));
      const walkEaseOut = easeInOut(remap(cinematicProgress, 0.68, 0.84));
      const walkPhase = walkDrive * Math.PI * 14.4;
      const stride = Math.sin(walkPhase);
      const counterStride = Math.sin(walkPhase + Math.PI);
      const bodyRhythm = Math.sin(walkPhase * 2);
      const strideMix = gsap.utils.interpolate(1.28, 0.52, walkEaseOut);
      const walkLegFront = 22.5 * stride * strideMix;
      const walkLegBack = 22.5 * counterStride * strideMix;
      const walkArmFront = -17 * stride * strideMix;
      const walkArmBack = -17 * counterStride * strideMix;
      const walkBob = -6.9 * Math.abs(bodyRhythm) * strideMix;
      const walkHipShift = 2.6 * stride * strideMix;
      const walkTorsoLean = gsap.utils.interpolate(-6.8, -2.6, walkEaseOut) + (0.8 * stride * strideMix);
      const ropeSag = gsap.utils.interpolate(0.45, 2.4, pullerSettle) + (1.1 - pullerTension) * 18;

      const aScale = gsap.utils.interpolate(1.045, 1, easeOut(remap(cinematicProgress, 0, 0.22)));
      const bScale = gsap.utils.interpolate(1.02, 1, easeOut(remap(cinematicProgress, 0.2, 0.45)));

      stage.style.setProperty('--split', `${split * 100}%`);
      stage.style.setProperty('--second-opacity', secondOpacity.toFixed(4));
      stage.style.setProperty('--second-reveal', secondReveal.toFixed(4));
      stage.style.setProperty('--support-fade', supportFade.toFixed(4));
      stage.style.setProperty('--letters-focus', lettersFocus.toFixed(4));
      stage.style.setProperty('--merge', merge.toFixed(4));
      stage.style.setProperty('--coaching', coaching.toFixed(4));
      stage.style.setProperty('--sentence-exit', sentenceExit.toFixed(4));
      stage.style.setProperty('--logo-rise', `${gsap.utils.interpolate(0, 38, logoRise).toFixed(3)}vh`);
      stage.style.setProperty('--logo-scale', gsap.utils.interpolate(1, 0.97, logoScale).toFixed(4));
      stage.style.setProperty('--outro-opacity', outroOpacity.toFixed(4));
      stage.style.setProperty('--outro-y', `${gsap.utils.interpolate(8.5, 0, outroLift).toFixed(3)}vh`);
      stage.style.setProperty('--a-scale', aScale.toFixed(4));
      stage.style.setProperty('--b-scale', bScale.toFixed(4));

      stage.style.setProperty('--a-x', aX.toFixed(3));
      stage.style.setProperty('--a-y', aY.toFixed(3));
      stage.style.setProperty('--b-x', bX.toFixed(3));
      stage.style.setProperty('--b-y', bY.toFixed(3));
      stage.style.setProperty('--puller-opacity', pullerOpacity.toFixed(4));
      stage.style.setProperty('--puller-x', pullerX.toFixed(3));
      stage.style.setProperty('--puller-y', pullerY.toFixed(3));
      stage.style.setProperty('--puller-lean', `${pullerLean.toFixed(3)}deg`);
      stage.style.setProperty('--puller-tension', pullerTension.toFixed(4));
      stage.style.setProperty('--walk-leg-front', `${walkLegFront.toFixed(3)}deg`);
      stage.style.setProperty('--walk-leg-back', `${walkLegBack.toFixed(3)}deg`);
      stage.style.setProperty('--walk-arm-front', `${walkArmFront.toFixed(3)}deg`);
      stage.style.setProperty('--walk-arm-back', `${walkArmBack.toFixed(3)}deg`);
      stage.style.setProperty('--walk-bob', `${walkBob.toFixed(3)}px`);
      stage.style.setProperty('--walk-hip-shift', `${walkHipShift.toFixed(3)}px`);
      stage.style.setProperty('--walk-torso-lean', `${walkTorsoLean.toFixed(3)}deg`);
      stage.style.setProperty('--rope-sag', `${ropeSag.toFixed(3)}px`);

      stage.style.setProperty('--l-merge-x', `${gsap.utils.interpolate(0, 2.45, merge).toFixed(3)}vw`);
      stage.style.setProperty('--s-merge-x', `${gsap.utils.interpolate(0, -2.95, sLetterMerge).toFixed(3)}vw`);
  };

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: ({ progress }) => {
      const cinematicProgress = mapNarrativeProgress(progress);
      if (!cinematicProgressLocked && cinematicProgress >= mergeAutoStart) {
        cinematicProgressLocked = true;
        if (autoAdvanceTween) autoAdvanceTween.kill();
        autoAdvanceTween = gsap.to({ value: cinematicProgress }, {
          value: 1,
          duration: 1.65,
          ease: 'power2.out',
          onUpdate() {
            renderCinematic(this.targets()[0].value);
          }
        });
        return;
      }

      if (cinematicProgressLocked) return;

      renderCinematic(cinematicProgress);
    }
  });
});

(function initRiveCharacterTimelineDirector() {
  document.addEventListener("DOMContentLoaded", () => {
    const section = document.getElementById("come-funziona");
    const layer = document.getElementById("riveCharacterLayer");
    const canvas = document.getElementById("riveCharacterCanvas");

    if (!section || !layer || !canvas) {
      console.warn("[RIVE] Mancano section/layer/canvas.");
      return;
    }

    if (!window.rive || !window.rive.Rive) {
      console.warn("[RIVE] Runtime Rive non trovato.");
      return;
    }

    if (!window.gsap) {
      console.warn("[RIVE] GSAP non trovato.");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeline = section.querySelector(".timeline[data-timeline]");
    const steps = timeline ? Array.from(timeline.querySelectorAll(".timeline-step")) : [];
    const cta = section.querySelector(".timeline-cta .btn, .timeline-cta a");

    if (!timeline || steps.length < 5 || !cta) {
      console.warn("[RIVE] Timeline, step o CTA non trovati.");
      return;
    }

    let riveInstance = null;
    let currentAnimation = null;
    let currentPhase = null;
    let activeMoveTween = null;
    let cardActionPlayback = null;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let lastScrollMoveAt = performance.now();

    const cardActions = ["card_1_action","working_at_desk","progress_monitor_card","optimize_results_card","healthy_lifestyle_card"];
    const cardActionDurations = {
      card_1_action: 2.10,
      working_at_desk: 3,
      progress_monitor_card: 4.19,
      optimize_results_card: 5,
      healthy_lifestyle_card: 5
    };
    const transitions = [null,"1_to_2","2_to_3","3_to_4","4_to_5"];
    const startTimelineName = "traction";
    const finalTimelineCandidates = ["last ", "last"];

    function getAvailableRiveAnimations() {
      if (!riveInstance) return [];
      const candidates = [
        riveInstance.animationNames,
        riveInstance.animations,
        riveInstance.contents?.animations
      ];

      for (const value of candidates) {
        const source = typeof value === "function" ? value.call(riveInstance) : value;
        const list = Array.isArray(source)
          ? source
          : source instanceof Set
            ? Array.from(source)
            : source && typeof source === "object"
              ? Object.values(source)
              : null;

        if (!Array.isArray(list)) continue;
        const names = list
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter(Boolean);
        if (names.length) return names;
      }

      return [];
    }

    function resolveRiveTimeline(preferredName, fallbackNames = []) {
      const available = getAvailableRiveAnimations();
      const names = [preferredName, ...fallbackNames].filter(Boolean);
      if (!available.length) return names[0];

      const exactMatch = names.find((name) => available.includes(name));
      if (exactMatch) return exactMatch;

      const normalizedNames = names.map((name) => name.trim().toLowerCase());
      const normalizedMatch = available.find((name) => normalizedNames.includes(String(name).trim().toLowerCase()));
      return normalizedMatch || names[0];
    }

    function getFinalTimelineName() {
      return resolveRiveTimeline(finalTimelineCandidates[0], finalTimelineCandidates.slice(1));
    }

    function getRiveAnimationTiming(name) {
      const fallback = { start: 0, duration: 1 };
      const animations = riveInstance?.contents?.animations;
      if (!Array.isArray(animations)) return fallback;

      const animation = animations.find((item) => item?.name === name);
      if (!animation) return fallback;

      const start = Number(animation?.workStart ?? animation?.startTime ?? 0);
      const end = Number(animation?.workEnd ?? animation?.endTime);
      const explicitDuration = Number(animation?.duration ?? animation?.animation?.duration);
      const rangedDuration = Number.isFinite(start) && Number.isFinite(end) ? end - start : NaN;
      const duration = Math.max(
        Number.isFinite(rangedDuration) ? rangedDuration : 0,
        Number.isFinite(explicitDuration) ? explicitDuration : 0
      );

      if (!Number.isFinite(duration) || duration <= 0) return fallback;

      return {
        start: Number.isFinite(start) && start > 0 ? start : 0,
        duration
      };
    }

    function getRiveAnimationDuration(name) {
      const resolvedName = resolveRiveTimeline(name);
      const fixedCardDuration = cardActionDurations[resolvedName] ?? cardActionDurations[name];
      if (Number.isFinite(fixedCardDuration) && fixedCardDuration > 0) return fixedCardDuration;
      return getRiveAnimationTiming(resolvedName).duration;
    }

    function getRiveScrubTime(name, progress) {
      const timing = getRiveAnimationTiming(name);
      return timing.start + (gsap.utils.clamp(0, 1, progress) * timing.duration);
    }

    function getLocalRect(el, container) { if (!el || !container) return null; const er = el.getBoundingClientRect(); const cr = container.getBoundingClientRect(); return { left: er.left - cr.left, top: er.top - cr.top, width: er.width, height: er.height, right: er.right - cr.left, bottom: er.bottom - cr.top }; }
    function getSlotForCard(card) { if (!card) return null; return (card.querySelector(".step-visual") || card.querySelector(".step-icon") || card.querySelector(".timeline-step-visual") || card.querySelector(".timeline-icon") || card.querySelector(".step-badge") || card.querySelector(".step-content")); }
    function showCharacter() { layer.classList.remove("is-hidden"); }
    function hideCharacter() { layer.classList.add("is-hidden"); }
    function setActiveSlotCard(index) { steps.forEach((step, i) => { step.classList.toggle("rive-slot-active", i === index); }); layer.classList.toggle("is-step-5", index === 4); layer.classList.remove("is-final-transition"); try { riveInstance?.resizeDrawingSurfaceToCanvas(); } catch (e) {} }
    function clearActiveSlotCards() { steps.forEach((step) => step.classList.remove("rive-slot-active")); layer.classList.remove("is-step-5"); }
    function setFinalTransitionMode(isFinal) { layer.classList.toggle("is-final-transition", Boolean(isFinal)); }
    function getBarAnchor() {
      const timelineRect = getLocalRect(timeline, section);
      const line = timeline.querySelector(".timeline-line");
      const lineRect = getLocalRect(line, section);
      const fallbackX = Math.max(40, section.clientWidth * 0.15);
      const x = lineRect ? lineRect.left + lineRect.width * 0.5 - layer.offsetWidth * 0.5 : fallbackX;
      const y = timelineRect ? Math.max(8, timelineRect.top - layer.offsetHeight * 0.42) : 8;
      return { x, y };
    }
    function getCardSlotAnchor(index) { const card = steps[index]; const slot = getSlotForCard(card); if (!card || !slot) { console.warn("[RIVE] Slot non trovato per card:", index + 1); return null; } const slotRect = getLocalRect(slot, section); if (!slotRect) return null; return { x: slotRect.left + slotRect.width * 0.5 - layer.offsetWidth * 0.5, y: slotRect.top + slotRect.height * 0.5 - layer.offsetHeight * 0.5 }; }
    function getCtaAnchor() {
      const rect = getLocalRect(cta, section);
      if (!rect) { console.warn("[RIVE] CTA non trovata."); return null; }
      return {
        x: rect.left + rect.width * 0.5 - layer.offsetWidth * 0.5,
        y: rect.top - layer.offsetHeight * 0.78
      };
    }
    function getViewportCenterTrigger(rect) { return rect.top + rect.height * 0.5; }
    function forceRiveTimeline(name, progress = 0, options = {}) {
      if (!riveInstance || !name) return;

      const resolvedName = resolveRiveTimeline(name);
      const clampedProgress = gsap.utils.clamp(0, 1, progress);
      const useNativePlayback = Boolean(options.nativePlayback);

      try {
        const isNewAnimation = currentAnimation !== resolvedName;

        if (isNewAnimation) {
          const previousAnimation = currentAnimation;

          if (typeof riveInstance.stop === "function" && currentAnimation) {
            riveInstance.stop(currentAnimation);
          }

          // Alcune timeline Rive lasciano elementi/stati visivi sul canvas.
          // Quando usciamo dalle card 04/05 resettiamo l'artboard prima di
          // agganciare la timeline successiva: questo evita che la card 04 resti
          // visibile dopo `optimize_results_card` e che `healthy_lifestyle_card`
          // continui a coprire la transizione finale `last ` verso la CTA.
          if ((previousAnimation === cardActions[3] || previousAnimation === cardActions[4]) && typeof riveInstance.reset === "function") {
            riveInstance.reset({ animations: resolvedName, autoplay: false });
          }

          currentAnimation = resolvedName;
        }

        if (useNativePlayback) {
          // Le action interne delle card devono girare alla velocità nativa di
          // Rive: le durate fornite sono la durata reale del clip, non un tempo
          // su cui riscalare/scrubbare metà timeline. Quando una card diventa
          // attiva avviamo quindi il clip e lo lasciamo scorrere normalmente,
          // senza pause/scrub frame-by-frame che possono farlo sembrare
          // rallentato o bloccarlo prima della fine.
          if (isNewAnimation && typeof riveInstance.play === "function") {
            riveInstance.play(resolvedName);
          }
          return;
        }

        if (typeof riveInstance.scrub === "function") {
          // In the canvas runtime, scrubbing is reliable only after the target
          // animation has been bound to the instance. Warm it up only when the
          // clip changes: replaying the same timeline on every frame makes the
          // character restart continuously, which shows up as blinking/stutter.
          if (isNewAnimation && typeof riveInstance.play === "function") {
            riveInstance.play(resolvedName);
          }
          riveInstance.scrub(resolvedName, getRiveScrubTime(resolvedName, clampedProgress));
          if (typeof riveInstance.pause === "function") riveInstance.pause(resolvedName);
          return;
        }

        if (typeof riveInstance.play === "function") {
          riveInstance.play(resolvedName);
        }
      } catch (error) {
        console.warn("[RIVE] Impossibile sincronizzare timeline:", resolvedName, error);
      }
    }

    function killActiveMotion() {
      if (activeMoveTween) {
        activeMoveTween.kill();
        activeMoveTween = null;
      }
      gsap.killTweensOf(layer);
    }

    function setLayerAt(point) {
      if (!point) return;
      killActiveMotion();
      gsap.set(layer, { x: point.x, y: point.y });
      try { riveInstance?.resizeDrawingSurfaceToCanvas(); } catch (e) {}
    }

    function lerpPoint(from, to, progress) {
      if (!from) return to;
      if (!to) return from;
      const p = gsap.utils.clamp(0, 1, progress);
      return {
        x: gsap.utils.interpolate(from.x, to.x, p),
        y: gsap.utils.interpolate(from.y, to.y, p)
      };
    }

    function getHybridCardActionProgress(state) {
      if (!state?.isCardAction || !state.animation) {
        cardActionPlayback = null;
        return state?.animationProgress ?? 0;
      }

      const resolvedName = resolveRiveTimeline(state.animation);
      const now = performance.now();
      const durationMs = Math.max(1, getRiveAnimationDuration(resolvedName) * 1000);

      if (!cardActionPlayback || cardActionPlayback.phase !== state.phase || cardActionPlayback.animation !== resolvedName) {
        cardActionPlayback = {
          phase: state.phase,
          animation: resolvedName,
          startedAt: now,
          durationMs,
          point: state.point,
          activeIndex: state.activeIndex
        };
      } else {
        cardActionPlayback.durationMs = durationMs;
        cardActionPlayback.point = state.point;
        cardActionPlayback.activeIndex = state.activeIndex;
      }

      const elapsedProgress = (now - cardActionPlayback.startedAt) / durationMs;

      // Le timeline interne alle card devono progredire a tempo reale con le
      // durate richieste (card_1_action 2.10s, working_at_desk 3s,
      // progress_monitor_card 4.19s, optimize_results_card 5s,
      // healthy_lifestyle_card 5s). Lo scroll decide quale card è attiva, ma
      // non può accelerare il playback della timeline interna della card.
      return gsap.utils.clamp(0, 1, elapsedProgress);
    }

    function getLockedCardActionState(candidateState) {
      if (!cardActionPlayback || candidateState?.phase === cardActionPlayback.phase) return candidateState;

      const elapsed = performance.now() - cardActionPlayback.startedAt;
      if (elapsed >= cardActionPlayback.durationMs) {
        cardActionPlayback = null;
        return candidateState;
      }

      // Se lo scroll passa oltre una card prima che la sua action sia finita,
      // manteniamo in scena quella card fino alla fine reale del clip Rive.
      // Così l'azione si vede completa alla velocità originale, invece di
      // tagliarsi a metà per entrare subito nella transizione successiva.
      return {
        phase: cardActionPlayback.phase,
        animation: cardActionPlayback.animation,
        animationProgress: elapsed / cardActionPlayback.durationMs,
        point: cardActionPlayback.point,
        activeIndex: cardActionPlayback.activeIndex,
        isCardAction: true
      };
    }

    function getScrollLinkedState() {
      const vh = window.innerHeight || 800;
      const sectionRect = section.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const stepRects = steps.map((step) => step.getBoundingClientRect());
      const screenCenterY = vh * 0.5;

      if (sectionRect.top > vh * 0.9 || ctaRect.bottom < vh * -0.12) {
        return { phase: "hidden", animation: null, point: null, activeIndex: null };
      }

      const anchors = [getBarAnchor(), ...steps.map((_, index) => getCardSlotAnchor(index)), getCtaAnchor()];
      const triggers = [
        sectionRect.top + vh * 0.14,
        ...stepRects.map(getViewportCenterTrigger),
        getViewportCenterTrigger(ctaRect)
      ].map((value, index, arr) => {
        if (index === 0) return value;
        return Math.max(value, arr[index - 1] + 1);
      });

      let segment = 0;
      while (segment < triggers.length - 1 && screenCenterY >= triggers[segment + 1]) segment += 1;

      const start = triggers[segment];
      const end = triggers[Math.min(segment + 1, triggers.length - 1)];
      const progress = end > start ? gsap.utils.clamp(0, 1, (screenCenterY - start) / (end - start)) : 1;

      if (segment === 0) {
        const point = lerpPoint(anchors[0], anchors[1], gsap.utils.clamp(0, 1, progress / 0.62));
        if (progress < 0.38) return { phase: "traction", animation: startTimelineName, animationProgress: progress / 0.38, point, activeIndex: null };
        if (progress < 0.62) return { phase: "jump_1_card", animation: "jump_1_card", animationProgress: (progress - 0.38) / 0.24, point, activeIndex: null };
        if (progress < 0.82) return { phase: "enter_to_1_card", animation: "enter_to_1_card", animationProgress: (progress - 0.62) / 0.20, point: anchors[1], activeIndex: null };
        return { phase: "card_1", animation: cardActions[0], animationProgress: (progress - 0.82) / 0.18, point: anchors[1], activeIndex: 0, isCardAction: true };
      }

      if (segment >= 5) {
        // Dopo la quinta card, `last` deve essere una transizione visibile
        // verso la CTA, non lo stato finale in cui il personaggio rimane
        // bloccato. Anticipiamo quindi l'uscita da healthy_lifestyle_card e
        // riserviamo la parte centrale del tratto Step 05 → CTA alla timeline
        // Rive `last`; terminata la transizione, lasciamo fermo il suo ultimo
        // frame senza riattivare healthy_lifestyle_card.
        const cardHoldEnd = 0.14;
        const lastTransitionEnd = 0.64;

        if (progress < cardHoldEnd) {
          return {
            phase: "card_5",
            animation: cardActions[4],
            animationProgress: progress / cardHoldEnd,
            point: anchors[5],
            activeIndex: 4,
            isCardAction: true
          };
        }

        const lastProgress = gsap.utils.clamp(0, 1, (progress - cardHoldEnd) / (lastTransitionEnd - cardHoldEnd));
        const point = lerpPoint(anchors[5], anchors[6], lastProgress);
        return {
          phase: progress < lastTransitionEnd ? "last_transition" : "last_transition_done",
          animation: getFinalTimelineName(),
          animationProgress: lastProgress,
          point,
          activeIndex: null
        };
      }

      const cardIndex = segment - 1;
      const nextCardIndex = segment;
      if (progress < 0.48) {
        return {
          phase: `card_${cardIndex + 1}`,
          animation: cardActions[cardIndex],
          animationProgress: progress / 0.48,
          point: anchors[segment],
          activeIndex: cardIndex,
          isCardAction: true
        };
      }
      if (progress < 0.78) {
        return { phase: `to_card_${nextCardIndex + 1}`, animation: transitions[nextCardIndex], animationProgress: (progress - 0.48) / 0.30, point: lerpPoint(anchors[segment], anchors[segment + 1], (progress - 0.48) / 0.30), activeIndex: null };
      }
      return {
        phase: `card_${nextCardIndex + 1}`,
        animation: cardActions[nextCardIndex],
        animationProgress: (progress - 0.78) / 0.22,
        point: anchors[segment + 1],
        activeIndex: nextCardIndex,
        isCardAction: true
      };
    }

    let raf = 0;
    function applyScrollLinkedState() {
      const state = getLockedCardActionState(getScrollLinkedState());
      if (state.phase === "hidden" || !state.point) {
        currentPhase = "hidden";
        clearActiveSlotCards();
        setFinalTransitionMode(false);
        hideCharacter();
        return;
      }

      showCharacter();
      currentPhase = state.phase;
      if (Number.isInteger(state.activeIndex)) setActiveSlotCard(state.activeIndex);
      else clearActiveSlotCards();
      setFinalTransitionMode(state.phase === "last_transition" || state.phase === "last_transition_done");
      const animationProgress = getHybridCardActionProgress(state);
      forceRiveTimeline(state.animation, animationProgress, { nativePlayback: Boolean(state.isCardAction) });
      setLayerAt(state.point);

      if (state.isCardAction && animationProgress < 1) {
        requestAnimationFrame(onScroll);
      }
    }

    function onScroll() {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      if (Math.abs(currentScrollY - lastScrollY) > 0.5) {
        lastScrollY = currentScrollY;
        lastScrollMoveAt = performance.now();
      }

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        applyScrollLinkedState();
      });
    }

    function startDirector() {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      applyScrollLinkedState();
    }

    try {
      riveInstance = new rive.Rive({
        src: "omino_def.riv", canvas, autoplay: false,
        onLoad: () => {
          console.log("[RIVE] loaded");

          try {
            riveInstance.resizeDrawingSurfaceToCanvas();
          } catch (error) {
            console.warn("[RIVE] resize failed", error);
          }

          startDirector();
        },
        onLoadError: (error) => { console.warn("[RIVE] errore caricamento omino_def.riv", error); }
      });
    } catch (error) { console.warn("[RIVE] errore inizializzazione", error); }
  });
})();
;

// CHI SONO: storytelling narrativo guidato dallo scroll
(() => {
  const page = document.querySelector('.page-chi-sono');
  if (!page) return;

  const story = document.querySelector('[data-about-story]');
  const chapters = Array.from(document.querySelectorAll('[data-story-chapter]'));
  const storyTitle = document.querySelector('[data-story-title]');
  const storyCaption = document.querySelector('[data-story-caption]');
  const storyMetricMain = document.querySelector('[data-story-metric-main]');
  const storyMetricFocus = document.querySelector('[data-story-metric-focus]');
  let activeChapterIndex = -1;
  let ticking = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const setActiveChapter = (index) => {
    if (!chapters.length || index === activeChapterIndex) return;
    activeChapterIndex = index;
    const activeChapter = chapters[index];

    page.style.setProperty('--story-active', String(index));
    chapters.forEach((chapter, chapterIndex) => {
      chapter.classList.toggle('is-active', chapterIndex === index);
    });

    if (storyTitle) storyTitle.textContent = activeChapter.dataset.title || activeChapter.querySelector('h2')?.textContent || '';
    if (storyCaption) storyCaption.textContent = activeChapter.dataset.caption || '';
    if (storyMetricMain) storyMetricMain.textContent = String(index + 1).padStart(2, '0');
    if (storyMetricFocus) storyMetricFocus.textContent = activeChapter.dataset.focus || 'Focus';
  };

  const updateAboutScroll = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const globalProgress = clamp(window.scrollY / maxScroll);
    page.style.setProperty('--about-scroll', globalProgress.toFixed(4));

    if (story && chapters.length) {
      const viewportAnchor = window.innerHeight * 0.52;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      let activeLocalProgress = 0;

      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const chapterProgress = clamp((viewportAnchor - rect.top) / Math.max(1, rect.height));
        chapter.style.setProperty('--chapter-progress', chapterProgress.toFixed(4));

        const chapterCenter = rect.top + rect.height / 2;
        const distance = Math.abs(chapterCenter - viewportAnchor);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
          activeLocalProgress = chapterProgress;
        }
      });

      page.style.setProperty('--story-local-progress', activeLocalProgress.toFixed(4));
      setActiveChapter(nearestIndex);
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateAboutScroll);
  };

  updateAboutScroll();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);

  const revealItems = Array.from(document.querySelectorAll('[data-about-reveal]'));
  if (!revealItems.length) return;

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealItems.forEach((item) => observer.observe(item));
})();

// COACHING PAGES – progress, picker and subtle card tilt
(() => {
  const initProgramEnhancements = () => {
    const progress = document.querySelector('.program-scroll-progress span');
    const programPage = document.body.classList.contains('page-program');

    if (progress && programPage) {
      const updateProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
      };
      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
    }

    document.querySelectorAll('[data-program-picker]').forEach((picker) => {
      const options = Array.from(picker.querySelectorAll('[data-program-option]'));
      const result = picker.querySelector('[data-program-result]');
      const templates = Array.from(picker.querySelectorAll('template[data-program-template]'));

      if (!options.length || !result || !templates.length) return;

      const renderOption = (key) => {
        const template = templates.find((item) => item.dataset.programTemplate === key);
        if (!template) return;

        result.style.animation = 'none';
        result.offsetHeight; // restart entrance animation for immediate visual feedback
        result.innerHTML = template.innerHTML;
        result.style.animation = '';

        options.forEach((option) => {
          const isActive = option.dataset.programOption === key;
          option.classList.toggle('is-active', isActive);
          option.setAttribute('aria-selected', String(isActive));
        });
      };

      options.forEach((option) => {
        option.setAttribute('role', 'tab');
        option.setAttribute('aria-selected', String(option.classList.contains('is-active')));
        option.addEventListener('click', () => renderOption(option.dataset.programOption));
      });
    });

    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('[data-tilt-card]').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${y * -7}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgramEnhancements);
  } else {
    initProgramEnhancements();
  }
})();

// QUESTIONARIO: precompila il form contatti se l'utente arriva dal risultato
// del questionario percorso ideale.
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  let payload = null;
  try {
    payload = JSON.parse(sessionStorage.getItem('lsQuestionarioLead') || 'null');
  } catch (error) {
    payload = null;
  }

  if (!payload) return;

  const email = contactForm.querySelector('#email');
  const obiettivo = contactForm.querySelector('#obiettivo');
  const messaggio = contactForm.querySelector('#messaggio');

  if (email && payload.email) email.value = payload.email;
  if (obiettivo && payload.obiettivo) obiettivo.value = payload.obiettivo;
  if (messaggio && payload.messaggio) messaggio.value = payload.messaggio;

  try {
    sessionStorage.removeItem('lsQuestionarioLead');
  } catch (error) {
    // Nessuna azione necessaria: la precompilazione è solo un supporto UX.
  }
});

/* === 2026-06 fix: timeline progress reaches every card and final step === */
(function () {
  const section = document.querySelector('#come-funziona');
  const timeline = section && section.querySelector('.timeline[data-timeline]');
  const steps = timeline ? Array.from(timeline.querySelectorAll('.timeline-step')) : [];
  const lineBase = timeline && (timeline.querySelector('.timeline-line-base') || timeline.querySelector('.timeline-line'));
  if (!section || !timeline || !steps.length || !lineBase) return;

  let raf = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function getStepMetrics() {
    return steps.map((step) => step.getBoundingClientRect());
  }

  function paintTimeline() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
    const triggerY = viewportHeight * 0.58;
    const stepBoxes = getStepMetrics();
    const firstTop = stepBoxes[0].top;
    const lastBottom = stepBoxes[stepBoxes.length - 1].bottom;
    const span = Math.max(1, lastBottom - firstTop);
    const progress = steps.length === 1 ? 1 : clamp((triggerY - firstTop) / span, 0, 1);

    let activeIndex = 0;
    stepBoxes.forEach((box, index) => {
      const cardProgress = clamp((triggerY - box.top) / Math.max(1, box.height), 0, 1);
      if (cardProgress >= 0.5) activeIndex = index;
    });

    timeline.style.setProperty('--tl-progress', progress.toFixed(4));

    steps.forEach((step, index) => {
      const isPassed = index <= activeIndex;
      step.classList.toggle('is-visible', isPassed);
      step.classList.toggle('is-revealed', isPassed);
      step.classList.toggle('is-active', index === activeIndex);
    });
  }

  function schedulePaint() {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      paintTimeline();
    });
  }

  paintTimeline();
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('resize', schedulePaint, { passive: true });
  window.addEventListener('load', schedulePaint, { once: true });
})();
