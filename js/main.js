document.addEventListener('DOMContentLoaded', () => {
  // 1. Calculadora Interativa
  const billInput = document.getElementById('bill-input');
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

  function updateCalculation() {
    const rawValue = parseFloat(billInput.value);
    const value = isNaN(rawValue) || rawValue < 0 ? 0 : rawValue;

    // 15% de desconto
    const monthlyDiscount = value * 0.15;
    const annualDiscount = monthlyDiscount * 12;

    resMonth.textContent = formatBRL(monthlyDiscount);
    resYear.textContent = formatBRL(annualDiscount);

    // Atualizar estado visual dos chips rápidos
    chipButtons.forEach(btn => {
      const btnVal = parseFloat(btn.getAttribute('data-val'));
      if (btnVal === value) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  billInput.addEventListener('input', updateCalculation);

  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      billInput.value = val;
      updateCalculation();
    });
  });

  // Executa cálculo inicial com R$ 200 (Economia mês R$ 30,00, ano R$ 360,00)
  updateCalculation();

  // 2. Acordeão de FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Fechar outros se desejar uma navegação limpa
      faqItems.forEach(i => {
        if (i !== item) {
          i.classList.remove('active');
          i.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
        }
      });
      // Alternar item atual
      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 3. Efeito de Scroll no Header
  const headerEl = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 15) {
      headerEl.classList.add('scrolled');
    } else {
      headerEl.classList.remove('scrolled');
    }
  });

  // 4. Modal e Toast
  const modal = document.getElementById('action-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const toast = document.getElementById('toast-element');
  const toastText = document.getElementById('toast-text');

  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  function openModal(titleText) {
    if (titleText) {
      document.getElementById('modal-heading').textContent = titleText;
    }
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Hero: rolagem suave até a calculadora mantendo abertura do link em nova aba
  const btnHeroSimulate = document.getElementById('btn-hero-simulate');
  if (btnHeroSimulate) {
    btnHeroSimulate.addEventListener('click', () => {
      const calcSection = document.getElementById('calculadora');
      if (calcSection) {
        calcSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Form submission mock
  window.handleSignupSubmit = function() {
    closeModal();
    showToast('Cadastro recebido! Nossa equipe entrará em contato para ativar seus créditos.');
    window.open('https://green.igreenenergy.com.br/?id=168451', '_blank', 'noopener');
  };
});
