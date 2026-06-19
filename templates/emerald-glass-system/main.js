// Emerald Glass — interactions

// reveal-on-scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// animate analysis progress bars when in view
const barWrap = document.querySelector('.analysis');
if (barWrap) {
  const bo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        barWrap.querySelectorAll('.bar i').forEach((bar) => {
          bar.style.width = bar.dataset.w;
        });
        bo.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  bo.observe(barWrap);
}

// nav background solidifies on scroll
const navInner = document.querySelector('.nav-inner');
const onScroll = () => {
  if (window.scrollY > 40) {
    navInner.style.background = 'rgba(8,8,8,0.8)';
  } else {
    navInner.style.background = 'rgba(10,10,10,0.55)';
  }
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
