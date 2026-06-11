document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-questionnaire-form]');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('[data-questionnaire-step]'));
  const labels = Array.from(document.querySelectorAll('[data-step-label]'));
  const progressBar = document.querySelector('[data-progress-bar]');
  const progressText = document.querySelector('[data-progress-text]');
  const prevBtn = form.querySelector('[data-prev-step]');
  const nextBtn = form.querySelector('[data-next-step]');
  const submitBtn = form.querySelector('[data-submit-quiz]');
  const resultSection = document.querySelector('[data-result-section]');
  const resultTitle = document.querySelector('[data-result-title]');
  const resultSummary = document.querySelector('[data-result-summary]');
  const resultReasons = document.querySelector('[data-result-reasons]');
  const planLink = document.querySelector('[data-plan-link]');
  const contactLink = document.querySelector('[data-contact-link]');
  const emailInput = document.querySelector('[data-result-email]');
  let currentStep = 0;
  let lastResult = null;

  const plans = {
    base: {
      title: 'Coaching Base: allenamento personalizzato e sostenibile',
      page: 'coaching-base.html',
      summary: 'Le tue risposte indicano che hai soprattutto bisogno di una struttura di allenamento chiara: esercizi scelti bene, progressioni, feedback tecnico e monitoraggio senza aggiungere complessità nutrizionali non necessarie.',
    },
    premium: {
      title: 'Coaching Premium: allenamento + nutrizione integrata',
      page: 'coaching-premium.html',
      summary: 'Le tue risposte mostrano che il risultato dipende molto anche da gestione alimentare, carboidrati, fame, pasti fuori, recupero e aderenza. Per questo il percorso più indicato è quello che integra allenamento e nutrizione.',
    },
  };

  function showStep(index) {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.classList.toggle('is-active', stepIndex === currentStep);
    });
    labels.forEach((label, labelIndex) => {
      label.classList.toggle('is-active', labelIndex === currentStep);
      label.classList.toggle('is-complete', labelIndex < currentStep);
    });
    const progress = ((currentStep + 1) / steps.length) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `Sezione ${currentStep + 1} di ${steps.length}`;
    if (prevBtn) prevBtn.hidden = currentStep === 0;
    if (nextBtn) nextBtn.hidden = currentStep === steps.length - 1;
    if (submitBtn) submitBtn.hidden = currentStep !== steps.length - 1;
  }

  function validateCurrentStep() {
    const requiredNames = new Set(
      Array.from(steps[currentStep].querySelectorAll('input[required]')).map((input) => input.name)
    );

    for (const name of requiredNames) {
      const checked = steps[currentStep].querySelector(`input[name="${name}"]:checked`);
      if (!checked) {
        const first = steps[currentStep].querySelector(`input[name="${name}"]`);
        if (first) {
          first.focus({ preventScroll: true });
          first.closest('.question-block')?.classList.add('needs-answer');
          first.closest('.question-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    }
    return true;
  }

  function getCheckedAnswers() {
    return Array.from(form.querySelectorAll('input[type="radio"]:checked'));
  }

  function scoreAnswers() {
    let base = 0;
    let premium = 0;
    const reasons = [];
    const answers = getCheckedAnswers();

    answers.forEach((answer) => {
      base += Number(answer.dataset.base || 0);
      premium += Number(answer.dataset.premium || 0);
    });

    const byName = (name) => answers.find((answer) => answer.name === name)?.value || '';

    if (/Dimagrimento|Ricomposizione/.test(byName('goal'))) {
      reasons.push('Il tuo obiettivo richiede coerenza tra allenamento, introito energetico e gestione della settimana: non basta cambiare esercizi se alimentazione e recupero restano casuali.');
    }
    if (/taglio|dosarli/.test(byName('carbs'))) {
      reasons.push('La gestione dei carboidrati è un segnale importante: tagliarli troppo o non saperli distribuire può aumentare fame, cali di energia e perdita di aderenza.');
    }
    if (/controllo|confondono/.test(byName('social'))) {
      reasons.push('Weekend, cene fuori e vita sociale vanno pianificati: se diventano il punto in cui “salta tutto”, una strategia nutrizionale è molto utile.');
    }
    if (/Fame|instabili/.test(byName('energy'))) {
      reasons.push('Fame, energia e recupero instabili possono limitare performance e costanza: integrarli nel piano aiuta a rendere il percorso più sostenibile.');
    }
    if (/Allenamento con feedback|Non prioritaria|Regolare/.test(`${byName('support')} ${byName('nutritionNeed')} ${byName('protein')}`)) {
      reasons.push('Hai già alcuni punti alimentari stabili: il lavoro può concentrarsi soprattutto su allenamento, progressioni, tecnica e monitoraggio.');
    }
    if (/limitano|fastidio/.test(byName('limits'))) {
      reasons.push('La presenza di fastidi o dubbi tecnici rende utile un piano adattato, con esercizi scelti in base a ciò che puoi fare davvero.');
    }

    const result = premium >= base + 4 ? 'premium' : 'base';
    return {
      key: result,
      base,
      premium,
      reasons: reasons.slice(0, 5),
    };
  }

  function renderResult(result) {
    const plan = plans[result.key];
    lastResult = result;
    if (!resultSection || !resultTitle || !resultSummary || !resultReasons || !planLink) return;

    resultTitle.textContent = plan.title;
    resultSummary.textContent = plan.summary;
    resultReasons.innerHTML = '';

    const fallbackReasons = result.key === 'premium'
      ? [
          'Dalle risposte emerge che allenamento e nutrizione sono collegati al tuo risultato: conviene lavorare su entrambi nello stesso percorso.',
          'Il Premium permette di trasformare indicazioni alimentari, check e aggiustamenti in un sistema semplice da seguire.',
        ]
      : [
          'Dalle risposte emerge che la priorità è avere una scheda personalizzata, progressioni chiare e feedback senza complicare troppo la nutrizione.',
          'Il Base è il punto di partenza più pulito se la tua alimentazione è già abbastanza gestibile.',
        ];

    (result.reasons.length ? result.reasons : fallbackReasons).forEach((reason) => {
      const li = document.createElement('li');
      li.textContent = reason;
      resultReasons.appendChild(li);
    });

    planLink.href = plan.page;
    planLink.textContent = result.key === 'premium' ? 'Vedi Coaching Premium' : 'Vedi Coaching Base';
    updateContactLink();
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateContactLink() {
    if (!contactLink || !lastResult) return;
    const plan = plans[lastResult.key];
    const email = emailInput?.value.trim() || '';
    const subject = encodeURIComponent(`Consulenza gratuita - risultato questionario: ${plan.title}`);
    const body = encodeURIComponent([
      'Ciao Leonardo,',
      '',
      `ho compilato il questionario e il risultato consigliato è: ${plan.title}.`,
      email ? `La mia email è: ${email}.` : '',
      '',
      'Vorrei essere ricontattato/a per una consulenza gratuita.',
    ].filter(Boolean).join('\n'));
    contactLink.href = 'index.html#contatti';
    contactLink.dataset.subject = subject;
    contactLink.dataset.body = body;
  }

  form.addEventListener('change', (event) => {
    event.target.closest('.question-block')?.classList.remove('needs-answer');
  });

  nextBtn?.addEventListener('click', () => {
    if (!validateCurrentStep()) return;
    showStep(currentStep + 1);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  prevBtn?.addEventListener('click', () => {
    showStep(currentStep - 1);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    renderResult(scoreAnswers());
  });

  contactLink?.addEventListener('click', () => {
    if (!lastResult) return;
    const plan = plans[lastResult.key];
    const email = emailInput?.value.trim() || '';
    const payload = {
      email,
      obiettivo: plan.title,
      messaggio: [
        `Ho compilato il questionario e il risultato consigliato è: ${plan.title}.`,
        'Vorrei essere ricontattato/a per una consulenza gratuita.',
      ].join('\n')
    };
    try {
      sessionStorage.setItem('lsQuestionarioLead', JSON.stringify(payload));
    } catch (error) {
      // Se il browser blocca lo storage, il link porta comunque al form contatti.
    }
  });

  emailInput?.addEventListener('input', updateContactLink);
  showStep(0);
});
