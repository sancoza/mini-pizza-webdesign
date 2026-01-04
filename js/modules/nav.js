/* =========================================================
   MODULE: NAVIGATION / DRAWER (matches current HTML)
   ========================================================= */
export function initNav() {
  const body     = document.body;
  const toggle   = document.getElementById('navToggle');
  const overlay  = document.getElementById('overlay');
  const drawer   = document.getElementById('drawer');
  const closeBtn = document.getElementById('closeDrawer');

  if (!toggle || !overlay || !drawer) return;

  const openMenu = () => {
    toggle.classList.add('is-active');
    drawer.classList.add('active');
    overlay.classList.add('active');
    overlay.hidden = false;

    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');

    body.classList.add('no-scroll');
  };

  const closeMenu = () => {
    toggle.classList.remove('is-active');
    drawer.classList.remove('active');
    overlay.classList.remove('active');

    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');

    body.classList.remove('no-scroll');
    // sačekaj animaciju overlaya
    setTimeout(() => {
      if (!overlay.classList.contains('active')) overlay.hidden = true;
    }, 250);
  };

  toggle.addEventListener('click', () => {
    drawer.classList.contains('active') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}
