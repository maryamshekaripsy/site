(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navPanel = document.querySelector('#mainNav');
  const backToTop = document.querySelector('#backToTop');
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#formStatus');
  const privacy = document.querySelector('#privacy');
  const privacyError = document.querySelector('#privacyError');

  // Mobile navigation
  if (menuToggle && navPanel) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navPanel.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
    });
    navPanel.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        navPanel.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'باز کردن منو');
      });
    });
    document.addEventListener('click', event => {
      if (!navPanel.contains(event.target) && !menuToggle.contains(event.target)) {
        navPanel.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Header and back-to-top state
  const onScroll = () => {
    const y = window.scrollY || 0;
    header?.classList.toggle('scrolled', y > 12);
    backToTop?.classList.toggle('visible', y > 450);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Reveal content as it enters the viewport
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Lightweight accessible FAQ accordion: one open at a time
  document.querySelectorAll('[data-faq]').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-faq');
      const target = document.getElementById(targetId);
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('[data-faq]').forEach(otherButton => {
        const other = document.getElementById(otherButton.getAttribute('data-faq'));
        otherButton.setAttribute('aria-expanded', 'false');
        otherButton.classList.add('collapsed');
        if (other) { other.hidden = true; other.classList.add('is-closed'); }
      });
      if (!wasOpen && target) {
        button.setAttribute('aria-expanded', 'true');
        button.classList.remove('collapsed');
        target.hidden = false;
        target.classList.remove('is-closed');
      }
    });
  });

  // Persian and Latin digits are accepted for telephone input.
  const toEnglishDigits = value => value
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

  const isValidPhone = value => {
    const digits = toEnglishDigits(value).replace(/[\s()-]/g, '');
    return /^(\+98|0098|0)?9\d{9}$/.test(digits) || /^\+?[0-9]{8,15}$/.test(digits);
  };

  const setFieldState = (field, valid) => {
    field.classList.toggle('is-invalid', !valid);
    field.setAttribute('aria-invalid', String(!valid));
  };

  form?.addEventListener('submit', event => {
    event.preventDefault();
    status.hidden = true;
    status.className = 'form-status';

    const fullName = form.elements.fullName;
    const phone = form.elements.phone;
    const service = form.elements.service;
    const contactMethod = form.elements.contactMethod;
    const nameValid = fullName.value.trim().length >= 3;
    const phoneValid = isValidPhone(phone.value.trim());
    const serviceValid = Boolean(service.value);
    const methodValid = Boolean(contactMethod.value);

    setFieldState(fullName, nameValid);
    setFieldState(phone, phoneValid);
    setFieldState(service, serviceValid);
    setFieldState(contactMethod, methodValid);
    privacyError.hidden = privacy.checked;

    if (!nameValid || !phoneValid || !serviceValid || !methodValid || !privacy.checked) {
      const firstInvalid = form.querySelector('.is-invalid');
      firstInvalid?.focus();
      status.textContent = 'لطفاً موارد مشخص‌شده را بررسی و تکمیل کنید.';
      status.classList.add('warning');
      status.hidden = false;
      return;
    }

    // Static demo only: no data is transmitted or stored.
    const requestPreview = {
      fullName: fullName.value.trim(),
      phone: phone.value.trim(),
      service: service.value,
      contactMethod: contactMethod.value,
      message: form.elements.message.value.trim()
    };
    console.info('درخواست آزمایشی فرم (ارسال نشده است):', requestPreview);
    status.textContent = 'اطلاعات فرم از نظر اولیه معتبر است؛ اما سایت هنوز به سرور متصل نیست و درخواست شما ارسال یا ذخیره نشده است. برای دریافت واقعی درخواست‌ها، فرم را به PHP یا API متصل کنید.';
    status.classList.add('success');
    status.hidden = false;
  });

  form?.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) {
        const valid = field.name === 'phone' ? isValidPhone(field.value.trim())
          : field.name === 'fullName' ? field.value.trim().length >= 3
          : Boolean(field.value);
        setFieldState(field, valid);
      }
      if (field === privacy && privacy.checked) privacyError.hidden = true;
    });
    field.addEventListener('change', () => {
      if (field.classList.contains('is-invalid')) setFieldState(field, Boolean(field.value));
      if (field === privacy && privacy.checked) privacyError.hidden = true;
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date());
})();
