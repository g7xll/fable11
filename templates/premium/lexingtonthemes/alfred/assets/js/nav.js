// Alfred - Shared navigation behavior
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');

  // Mobile hamburger toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open', !isOpen);
      if (menuIcon) menuIcon.classList.toggle('hidden', !isOpen);
      if (closeIcon) closeIcon.classList.toggle('hidden', isOpen);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        if (menuIcon) menuIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      }
    });
  }

  // Dropdown toggles
  document.querySelectorAll('.dropdown-toggle').forEach(btn => {
    const menuId = btn.dataset.menuButton;
    const menu = document.getElementById(menuId);
    if (!menu) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = menu.classList.contains('open');
      // close all
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
      document.querySelectorAll('.flyout-menu').forEach(m => m.classList.remove('open'));
      if (!wasOpen) menu.classList.add('open');
    });
  });

  // Flyout submenu
  document.querySelectorAll('[data-flyout]').forEach(btn => {
    const targetId = btn.dataset.flyout;
    const target = document.getElementById(targetId);
    if (!target) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = target.classList.contains('open');
      document.querySelectorAll('.flyout-menu').forEach(m => m.classList.remove('open'));
      if (!wasOpen) target.classList.add('open');
    });
  });

  // Click outside closes all
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown-toggle') && !e.target.closest('.dropdown-menu') && !e.target.closest('[data-flyout]') && !e.target.closest('.flyout-menu')) {
      document.querySelectorAll('.dropdown-menu, .flyout-menu').forEach(m => m.classList.remove('open'));
    }
  });

  // Tab system (green features section)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // Keen Slider initialization (if present)
  if (typeof KeenSlider !== 'undefined') {
    document.querySelectorAll('.keen-slider').forEach(el => {
      new KeenSlider(el, { loop: true });
    });
  }
});
