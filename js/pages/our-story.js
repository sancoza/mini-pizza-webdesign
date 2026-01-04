document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('.timeline-row');
  if (!rows.length) return;

  const supportsIO = 'IntersectionObserver' in window;
  if (!supportsIO) {
    // Fallback: sve odmah vidljivo
    rows.forEach(r => r.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // Ušao u viewport → upali animaciju
        el.classList.add('in');
      } else {
        // Izašao iz viewporta → ugasi da bi se ponovo animiralo pri povratku
        el.classList.remove('in');
      }
    });
  }, {
    threshold: 0.45,                 // ~45% reda mora biti vidljivo
    rootMargin: '-10% 0px -10% 0px'  // malo tampona gore/dole
  });

  rows.forEach(r => io.observe(r));
});
