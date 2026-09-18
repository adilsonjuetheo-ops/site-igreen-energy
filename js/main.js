/* iGreen Energy — interações da landing page */

// Percentual de desconto usado na calculadora e nas mensagens.
const DISCOUNT_RATE = 0.15;

// Número que recebe os leads do formulário.
const LEAD_WHATSAPP = '5533997315900';

// Medição de audiência (GA4). Basta preencher o ID no formato "G-XXXXXXXXXX".
// Enquanto estiver vazio, nenhum script de terceiro é carregado e nenhum cookie
// é criado — que é exatamente o que privacidade.html declara hoje. Ao ativar,
// atualizar a seção 5 daquela página ANTES de publicar.
const GA_MEASUREMENT_ID = '';

/**
 * Registra um evento de conversão. Vira uma função vazia enquanto não houver
 * ID configurado, então os pontos de medição já podem ficar espalhados pelo
 * código sem efeito nenhum.
 */
function track(eventName, params) {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params || {});
}

function loadAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

document.addEventListener('DOMContentLoaded', () => {
  loadAnalytics();

  /* ---------------------------------------------------------------
   * 1. Calculadora Interativa
   * ------------------------------------------------------------- */
  const billInput = document.getElementById('bill-input');
  const billSlider = document.getElementById('bill-slider');
  const resMonth = document.getElementById('res-month');
  const resYear = document.getElementById('res-year');
  const chipButtons = document.querySelectorAll('.chip-btn');

  function formatBRL(amount) {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Valor atual da conta informado na calculadora, para reaproveitar no formulário.
  function currentBillValue() {
    const raw = parseFloat(billInput.value);
    return isNaN(raw) || raw < 0 ? 0 : raw;
  }

  // Deixa o slider refletindo o valor do campo. O campo aceita qualquer número;
  // o slider tem um teto, então acima dele ele simplesmente encosta no fim —
  // sem alterar o valor informado, que continua valendo para o cálculo.
  function syncSlider(value) {
    if (!billSlider) return;

    const min = parseFloat(billSlider.min);
    const max = parseFloat(billSlider.max);
    const clamped = Math.min(Math.max(value, min), max);

    billSlider.value = clamped;
    // Pinta o trecho já percorrido do trilho (ver --fill em styles.css).
    billSlider.style.setProperty('--fill', ((clamped - min) / (max - min)) * 100 + '%');
  }

  function updateCalculation() {
    const value = currentBillValue();
    const monthlyDiscount = value * DISCOUNT_RATE;

    syncSlider(value);

    resMonth.textContent = formatBRL(monthlyDiscount);
    resYear.textContent = formatBRL(monthlyDiscount * 12);

    // Destaca o resultado brevemente para sinalizar que o número mudou.
    [resMonth, resYear].forEach(el => {
      el.classList.remove('is-updating');
      // Força o reinício da animação mesmo em alterações consecutivas.
      void el.offsetWidth;
      el.classList.add('is-updating');
    });

    chipButtons.forEach(btn => {
      const btnVal = parseFloat(btn.getAttribute('data-val'));
      btn.classList.toggle('active', btnVal === value);
      btn.setAttribute('aria-pressed', btnVal === value ? 'true' : 'false');
    });
  }

  let calcTracked = false;
  billInput.addEventListener('input', () => {
    updateCalculation();
    if (!calcTracked) {
      calcTracked = true;
      track('usou_calculadora');
    }
  });

  if (billSlider) {
    billSlider.addEventListener('input', () => {
      billInput.value = billSlider.value;
      updateCalculation();
      if (!calcTracked) {
        calcTracked = true;
        track('usou_calculadora');
      }
    });
  }

  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      billInput.value = btn.getAttribute('data-val');
      updateCalculation();
    });
  });

  updateCalculation();

  /* ---------------------------------------------------------------
   * 2. Acordeão de FAQ
   * ------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------------------
   * 3. Efeito de Scroll no Header
   * ------------------------------------------------------------- */
  const headerEl = document.getElementById('header');
  window.addEventListener('scroll', () => {
    headerEl.classList.toggle('scrolled', window.scrollY > 15);
  }, { passive: true });

  /* ---------------------------------------------------------------
   * 4. Modal de cadastro
   * ------------------------------------------------------------- */
  const modal = document.getElementById('action-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalHeading = document.getElementById('modal-heading');
  const toast = document.getElementById('toast-element');
  const toastText = document.getElementById('toast-text');
  const signupForm = document.getElementById('signup-form');

  // Elemento que abriu o modal, para devolver o foco ao fechar.
  let lastFocusedEl = null;
  let toastTimer = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
  }

  function openModal(titleText, trigger) {
    lastFocusedEl = trigger || document.activeElement;
    if (titleText) modalHeading.textContent = titleText;

    modal.classList.add('open');
    modal.removeAttribute('aria-hidden');
    // Impede que o fundo role enquanto o modal está aberto.
    document.body.classList.add('modal-open');

    // Fechado, o modal tem visibility: hidden, e focus() é ignorado em elemento
    // invisível. Adicionar a classe não recalcula o estilo na hora, então sem
    // esta leitura — que força o recálculo — o foco caía no body e o teclado
    // começava a navegação fora do modal. requestAnimationFrame não resolve:
    // o callback ainda roda antes do recálculo de estilo do quadro.
    void modal.offsetHeight;

    const first = modal.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  modalCloseBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    // Focus trap: mantém o Tab circulando dentro do modal.
    if (e.key === 'Tab') {
      const items = Array.from(modal.querySelectorAll(FOCUSABLE))
        .filter(el => el.offsetParent !== null);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Os CTAs marcados com data-open-modal abrem o formulário em vez de sair do
  // site. O href original continua no HTML como fallback caso o JS não carregue.
  document.querySelectorAll('[data-open-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(el.getAttribute('data-modal-title'), el);
      track('abriu_formulario', { origem: el.id || 'sem-id' });
    });
  });

  /* ---------------------------------------------------------------
   * 5. Envio do formulário para o WhatsApp
   * ------------------------------------------------------------- */
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('modal-name').value.trim();
    const phone = document.getElementById('modal-phone').value.trim();
    const stateEl = document.getElementById('modal-state');
    const distributor = stateEl.options[stateEl.selectedIndex].text;

    const bill = currentBillValue();

    const lines = [
      'Olá! Quero meu desconto na conta de energia pela iGreen.',
      '',
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      `Distribuidora: ${distributor}`
    ];

    // Só cita a simulação se a pessoa realmente informou um valor.
    if (bill > 0) {
      lines.push(`Conta hoje: ${formatBRL(bill)}/mês`);
      lines.push(`Economia simulada: ${formatBRL(bill * DISCOUNT_RATE)}/mês`);
    }

    const url = `https://wa.me/${LEAD_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;

    track('gerou_lead', {
      distribuidora: distributor,
      valor_conta: bill,
      simulou: bill > 0
    });

    closeModal();
    showToast('Abrindo o WhatsApp com seus dados. É só enviar a mensagem!');
    signupForm.reset();

    window.open(url, '_blank', 'noopener');
  });

  // Cliques diretos no WhatsApp (botão flutuante, rodapé, CTA final), que são
  // conversões que não passam pelo formulário.
  document.querySelectorAll('a[href*="wa.me/"]').forEach(el => {
    el.addEventListener('click', () => {
      track('clicou_whatsapp', { origem: el.className || 'sem-classe' });
    });
  });

  /* ---------------------------------------------------------------
   * Vídeo institucional
   * ------------------------------------------------------------- */
  const video = document.getElementById('video-institucional');
  if (video) {
    // Só o primeiro play conta, senão pausar e retomar inflaria a métrica.
    let playRegistrado = false;
    video.addEventListener('play', () => {
      if (playRegistrado) return;
      playRegistrado = true;
      track('deu_play_video');
    });

    // Marcos de audiência: mostram quem assistiu de verdade, não só quem clicou.
    const marcos = [25, 50, 75, 100];
    const vistos = new Set();
    video.addEventListener('timeupdate', () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      marcos.forEach(m => {
        if (pct >= m && !vistos.has(m)) {
          vistos.add(m);
          track('video_progresso', { percentual: m });
        }
      });
    });
  }

  // Entradas no grupo da comunidade. O seletor de clicou_whatsapp não pega
  // estas, porque ele procura por "wa.me/" e o convite de grupo usa
  // chat.whatsapp.com.
  document.querySelectorAll('a[href*="chat.whatsapp.com"]').forEach(el => {
    el.addEventListener('click', () => {
      track('clicou_comunidade', { origem: el.id || 'sem-id' });
    });
  });

  // Saídas para o iGreen Club, que é um funil separado do cadastro.
  document.querySelectorAll('a[href*="club.igreenenergy.com.br"]').forEach(el => {
    el.addEventListener('click', () => {
      track('clicou_club', { origem: el.id || 'sem-id' });
    });
  });

  // Saídas diretas para o cadastro no site do parceiro, sem passar pelo
  // formulário. Só conta os links que realmente navegam: nos CTAs que abrem o
  // modal o mesmo href existe apenas como fallback e o clique é interceptado.
  document.querySelectorAll('a[href*="green.igreenenergy.com.br"]:not([data-open-modal])').forEach(el => {
    el.addEventListener('click', () => {
      track('clicou_cadastro_direto', { origem: el.id || 'sem-id' });
    });
  });

  /* ---------------------------------------------------------------
   * 6. Rolagem suave do CTA do hero até a calculadora
   * ------------------------------------------------------------- */
  const btnHeroSimulate = document.getElementById('btn-hero-simulate');
  if (btnHeroSimulate) {
    btnHeroSimulate.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
      // Deixa o campo pronto para digitação depois da rolagem.
      setTimeout(() => billInput.focus({ preventScroll: true }), 600);
    });
  }

  /* ---------------------------------------------------------------
   * 7. Revelação das seções ao rolar
   * ------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Sem animação: tudo já entra visível.
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ---------------------------------------------------------------
   * 8. Contagem dos números da faixa de estatísticas
   *
   * O texto final já está no HTML, então sem JS — ou sob
   * prefers-reduced-motion — a faixa aparece exatamente como hoje.
   * A animação só entra quando a seção chega na tela, e cada número
   * conta uma vez só.
   * ------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
    function runCounter(el) {
      const target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;

      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1100;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic: arranca rápido e assenta no valor final sem freada seca.
        const eased = 1 - Math.pow(1 - progress, 3);

        el.innerHTML = prefix + Math.round(eased * target).toLocaleString('pt-BR') + suffix;

        if (progress < 1) requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        runCounter(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }
});
