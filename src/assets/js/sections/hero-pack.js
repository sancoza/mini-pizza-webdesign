/* =========================================================
   HERO PACK – PRODUCT PICKER & HYBRID SELECT (Fixed)
   ========================================================= */

const mqDesktop = window.matchMedia("(min-width: 521px)");
const HY_ATTR   = "data-hybrid";
let openPopup   = null;

function enhanceSelect(label){
  if (label.__hy) return;
  const native = label.querySelector("select");
  if (!native) return;

  const wrap = document.createElement("div");
  wrap.className = "hyselect";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hyselect__btn";
  const currentText = () => native.options[native.selectedIndex]?.text || "Select option";
  btn.innerHTML = `<span class="hyselect__label">${currentText()}</span><span class="hyselect__chev">▾</span>`;

  const panel = document.createElement("div");
  panel.className = "hyselect__panel";

  [...native.options].forEach((opt, i) => {
    const item = document.createElement("div");
    item.className = "hyselect__opt";
    item.textContent = opt.text;
    if (i === native.selectedIndex) item.setAttribute("aria-selected", "true");
    item.addEventListener("click", () => {
      native.selectedIndex = i;
      native.dispatchEvent(new Event("change", { bubbles: true }));
      btn.querySelector(".hyselect__label").textContent = opt.text;
      panel.querySelectorAll(".hyselect__opt").forEach((el, idx) => {
        el.toggleAttribute("aria-selected", idx === i);
      });
      closePopup(wrap);
    });
    panel.appendChild(item);
  });

  wrap.appendChild(btn);
  wrap.appendChild(panel);
  label.appendChild(wrap);

  function open(){
    if (openPopup && openPopup !== wrap) closePopup(openPopup);
    wrap.classList.add("is-open");
    openPopup = wrap;
    setTimeout(() => document.addEventListener("click", onDocClick, { once: true }), 0);
  }
  function close(){ closePopup(wrap); }
  function onDocClick(e){
    if (!wrap.contains(e.target)) close();
    else document.addEventListener("click", onDocClick, { once: true });
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    wrap.classList.contains("is-open") ? close() : open();
  });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  native.addEventListener("change", () => {
    btn.querySelector(".hyselect__label").textContent = currentText();
    panel.querySelectorAll(".hyselect__opt").forEach((el, idx) => {
      el.toggleAttribute("aria-selected", idx === native.selectedIndex);
    });
  });

  label.__hy = { wrap, btn, panel, native };
}

function destroySelect(label){
  if (!label.__hy) return;
  const { wrap } = label.__hy;
  if (openPopup === wrap) openPopup = null;
  wrap.remove();
  delete label.__hy;
}
function closePopup(wrap){
  wrap.classList.remove("is-open");
  if (openPopup === wrap) openPopup = null;
}
function initHybrid(){
  const labels = document.querySelectorAll(`label.custom-select[${HY_ATTR}]`);
  if (mqDesktop.matches) labels.forEach(enhanceSelect);
  else labels.forEach(destroySelect);
}

initHybrid();
mqDesktop.addEventListener("change", initHybrid);


/* =========================================================
   Everything below needs DOM elements → run after DOM ready
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const priceEl   = document.getElementById("totalPrice");     // optional (may not exist)
  const priceBtn  = document.getElementById("priceBtn");       // inside button
  const addBtn    = document.getElementById("addToCart");

  const sizeBtn12 = document.getElementById("sizeOption12");
  const sizeBtn6  = document.getElementById("sizeOption6");
  const allSizeBtns = [sizeBtn12, sizeBtn6];

  const selectFront   = document.getElementById("pizzaSelectFront");
  const selectBack    = document.getElementById("pizzaSelectBack");

  const visual        = document.getElementById("packVisual");
  const prodShotFront = document.getElementById("productShotFront");
  const prodImgFront  = document.getElementById("productImgFront");
  const prodShotBack  = document.getElementById("productShotBack");
  const prodImgBack   = document.getElementById("productImgBack");

  let currentPieces = 12;

  // Helpers
  const getName = (opt) =>
    opt?.dataset.name ||
    (opt?.value ? opt.value.charAt(0).toUpperCase() + opt.value.slice(1) : opt?.textContent || "");

  const getPriceForPieces = (opt, pieces) =>
    pieces === 6
      ? Number(opt?.dataset.p6  || opt?.dataset.p12 || 0)
      : Number(opt?.dataset.p12 || 0);

  const formatLabel = (name, price) => (price > 0 ? `${name} — $${price}` : name);

  const getPrice = (select) => {
    const opt = select?.selectedOptions?.[0];
    return getPriceForPieces(opt, currentPieces);
  };

  function updatePrice() {
    const total = (getPrice(selectFront) || 0) + (getPrice(selectBack) || 0);
    const formatted = `$${total.toFixed(2)}`;
    if (priceEl)  priceEl.textContent = formatted;
    if (priceBtn) priceBtn.textContent = formatted;

    // Optional: reflect pieces in button label
    if (addBtn && addBtn.firstChild) {
      addBtn.firstChild.nodeValue = `Add ${currentPieces} pcs — `;
    }
  }

  function updateSelectLabels(select) {
    if (!select) return;
    for (const opt of select.options) {
      if (!opt.value) continue;
      const name  = getName(opt);
      const price = getPriceForPieces(opt, currentPieces);
      opt.textContent = formatLabel(name, price);
    }
  }
  function updateMenuLabels(){
    updateSelectLabels(selectFront);
    updateSelectLabels(selectBack);
  }

  function setShot(select, imgEl, shotEl, flag) {
    if (!select || !imgEl || !shotEl) return;
    const opt = select.selectedOptions[0];
    const url = opt?.dataset?.img || "";
    const alt = opt?.dataset?.name || opt?.value || "";
    if (url) {
      imgEl.src = url; imgEl.alt = alt;
      shotEl.classList.add("is-visible");
      visual?.classList.add(flag);
    } else {
      shotEl.classList.remove("is-visible");
      imgEl.removeAttribute("src"); imgEl.alt = "";
      visual?.classList.remove(flag);
    }
  }
  function updateProductShots() {
    setShot(selectFront, prodImgFront, prodShotFront, "has-front");
    setShot(selectBack,  prodImgBack,  prodShotBack,  "has-back");
  }

  function updateHybridPanels() {
    document.querySelectorAll("label.custom-select[data-hybrid]").forEach((label) => {
      const native = label.querySelector("select");
      const hy = label.__hy;
      if (!native || !hy || !hy.panel) return;

      const items = hy.panel.querySelectorAll(".hyselect__opt");
      items.forEach((item, idx) => {
        const opt = native.options[idx];
        if (!opt) return;
        if (!opt.value) { item.textContent = opt.textContent; return; }
        const name  = getName(opt);
        const price = getPriceForPieces(opt, currentPieces);
        item.textContent = formatLabel(name, price);
      });

      const sel = native.selectedOptions[0];
      if (sel) {
        const name  = getName(sel);
        const price = getPriceForPieces(sel, currentPieces);
        hy.btn.querySelector(".hyselect__label").textContent = formatLabel(name, price);
      }
    });
  }

  // Size buttons (moved inside so functions are in scope)
  function onSizeSelect(btn) {
    allSizeBtns.forEach((b) => b?.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentPieces = parseInt(btn.dataset.pieces || "12", 10) || 12;
    updateMenuLabels();
    updateHybridPanels();
    updateProductShots();
    updatePrice();
  }
  sizeBtn12?.addEventListener("click", () => onSizeSelect(sizeBtn12));
  sizeBtn6?.addEventListener("click",  () => onSizeSelect(sizeBtn6));

  // Select change
  selectFront?.addEventListener("change", () => { updateHybridPanels(); updateProductShots(); updatePrice(); });
  selectBack ?.addEventListener("change", () => { updateHybridPanels(); updateProductShots(); updatePrice(); });

  // Initial render
  updateMenuLabels();
  updateHybridPanels();
  updateProductShots();
  updatePrice();

  // Add to cart (demo)
  addBtn?.addEventListener("click", () => {
    const chosen = [
      selectFront?.selectedOptions?.[0]?.textContent || "(none)",
      selectBack ?.selectedOptions?.[0]?.textContent || "(none)",
    ].join(", ");
    alert(`Added pack (${currentPieces} pieces)\nFlavors: ${chosen}\nTotal: ${priceBtn ? priceBtn.textContent : '$0.00'}`);
  });
});
