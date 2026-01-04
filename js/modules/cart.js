/* =========================================================
   MODULE: CART BADGE
   - Keeps a visible count on the cart icon
   - Persists to localStorage ("cartCount")
   - Public API: window.Cart.set(n), .inc(n), .clear()
   ========================================================= */
export function initCartBadge() {
  const countEl = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  if (!countEl || !cartBtn) return;

  const LS_KEY = 'cartCount';

  const read = () => {
    const raw = localStorage.getItem(LS_KEY);
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const write = (n) => localStorage.setItem(LS_KEY, String(n));

  const render = (n) => {
    countEl.textContent = String(n);
    cartBtn.setAttribute('aria-label', `Cart (${n} item${n === 1 ? '' : 's'})`);
  };

  // API
  function set(n) {
    const v = Math.max(0, Number.parseInt(n, 10) || 0);
    write(v); render(v);
  }
  function inc(delta = 1) {
    const v = Math.max(0, read() + (Number.parseInt(delta, 10) || 0));
    write(v); render(v);
  }
  function clear() { set(0); }

  // Init from storage
  render(read());

  // Expose small API for other modules / demo buttons
  window.Cart = { set, inc, clear };
}
