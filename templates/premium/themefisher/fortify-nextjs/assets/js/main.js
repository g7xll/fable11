/* =========================================================
   FORTIFY — Main JS
   ========================================================= */

(function () {
  'use strict';

  // ── Navbar Scroll Effect ────────────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile Nav Toggle ──────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Scroll Animations ──────────────────────────────────
  const fadeEls = document.querySelectorAll('[data-fade]');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => observer.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ── FAQ Accordion ──────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── Pricing Toggle ─────────────────────────────────────
  const pricingToggle = document.getElementById('pricing-toggle');
  if (pricingToggle) {
    const monthlyPrices = document.querySelectorAll('[data-monthly]');
    const yearlyPrices = document.querySelectorAll('[data-yearly]');
    const monthlyLabel = document.querySelector('.toggle-label-monthly');
    const yearlyLabel = document.querySelector('.toggle-label-yearly');

    pricingToggle.addEventListener('change', () => {
      const isYearly = pricingToggle.checked;
      monthlyPrices.forEach(el => el.style.display = isYearly ? 'none' : 'inline');
      yearlyPrices.forEach(el => el.style.display = isYearly ? 'inline' : 'none');
      if (monthlyLabel) monthlyLabel.style.opacity = isYearly ? '0.5' : '1';
      if (yearlyLabel) yearlyLabel.style.opacity = isYearly ? '1' : '0.5';
    });
  }

  // ── Smooth scroll for anchor links ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Counter Animation ──────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.getAttribute('data-count');
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1500;
          const start = performance.now();
          const isFloat = target.includes('.');
          const end = parseFloat(target);

          const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = end * eased;
            el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  // ── Active nav link ───────────────────────────────────
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.replace(/\/$/, '').replace('.html', '');
    if (currentPath.endsWith(linkPath) || (currentPath.endsWith('index') && linkPath === '/index')) {
      link.classList.add('active');
    }
  });

  // ── Open first FAQ by default ─────────────────────────
  const firstFaq = document.querySelector('.faq-item');
  if (firstFaq) firstFaq.classList.add('open');

})();
