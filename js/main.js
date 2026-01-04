/* =========================================================
   MINI PIZZA™ THEME - MAIN SCRIPT
   Description:
   Initializes global modules and section-specific scripts.
   ========================================================= */

// --- Global Modules ---
import { initNav } from './modules/nav.js';
import { initCartBadge } from './modules/cart.js';

// --- Section Scripts ---
import './sections/hero-pack.js';
import './sections/mp-billboard.js';
import './sections/slider-section.js';
import './sections/discount-section.js';
import './sections/aboutus-section.js';
import './sections/social-media-section.js';

// --- page-specific scripts ---
import './pages/blogs-page.js';

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCartBadge();
});
