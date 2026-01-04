/*
  ABOUT-US – pure JS
  - Desktop: pilovi (levo/desno) + glavna kartica (menja se po tabu)
  - Mobile: accordion (otvara/zatvara)
  - Sinhronizacija: desktop <-> mobile
*/
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // Templates
  const tLatest  = $('#panel-latest');
  const tUpdates = $('#panel-updates');
  const tProduct = $('#panel-product');

  // DESKTOP refs
  const desktopRow   = $('.about-us-desktop .about-us-row');
  const leftCol      = $('.about-us-pills-left', desktopRow);
  const rightCol     = $('.about-us-pills-right', desktopRow);
  const card         = $('.about-us-card', desktopRow);
  const cardImg      = $('.about-us-media img', card);
  const cardDate     = $('.about-us-date', card);
  const cardH        = $('.about-us-h', card);
  const cardText     = $('.about-us-p', card);
  const cardLink     = $('.about-us-readmore', card);

  const src          = $('.about-us-tab-source');
  const pillLatest   = $('#tab-latest', src);
  const pillUpdates  = '#tab-updates';
  const pillProduct  = '#tab-product';

  const pillUpdEl    = $(pillUpdates, src);
  const pillProdEl   = $(pillProduct, src);

  function applyTemplate(t){
    if(!t) return;
    cardImg.src = t.dataset.img;
    cardImg.alt = t.dataset.alt || '';
    cardDate.textContent = t.dataset.date || '';
    cardH.innerHTML = t.dataset.title || '';
    cardText.textContent = t.dataset.text || '';
    cardLink.href = t.dataset.link || '#';
  }

  function setSelected(btn){
    [pillLatest, pillUpdEl, pillProdEl].forEach(b=>{
      b.setAttribute('aria-selected', b===btn ? 'true' : 'false');
    });
  }

  // Desktop state (kao na Brar’s): levo/desno raspored po aktivnoj
  function setStateDesktop(activeBtn){
    leftCol.innerHTML=''; rightCol.innerHTML='';

    if(activeBtn===pillLatest){
      leftCol.appendChild(pillLatest);
      rightCol.appendChild(pillUpdEl);
      rightCol.appendChild(pillProdEl);
      applyTemplate(tLatest);
      card.style.setProperty('--about-us-card', pillLatest.dataset.color || '#f2bc0b');
      syncMobileFromDesktop('panel-latest');
    }else if(activeBtn===pillUpdEl){
      leftCol.appendChild(pillLatest);
      leftCol.appendChild(pillUpdEl);
      rightCol.appendChild(pillProdEl);
      applyTemplate(tUpdates);
      card.style.setProperty('--about-us-card', pillUpdEl.dataset.color || '#FF4900;');
      syncMobileFromDesktop('panel-updates');
    }else{
      leftCol.appendChild(pillLatest);
      leftCol.appendChild(pillUpdEl);
      leftCol.appendChild(pillProdEl);
      applyTemplate(tProduct);
      card.style.setProperty('--about-us-card', pillProdEl.dataset.color || '#ff6a00;');
      syncMobileFromDesktop('panel-product');
    }
    setSelected(activeBtn);
  }

  // Init desktop default: latest aktivan
  if (leftCol && rightCol) {
    leftCol.appendChild(pillLatest);
    rightCol.appendChild(pillUpdEl);
    rightCol.appendChild(pillProdEl);
    applyTemplate(tLatest);
    setSelected(pillLatest);

    [pillLatest, pillUpdEl, pillProdEl].forEach(btn=>{
      btn.addEventListener('click', ()=> setStateDesktop(btn));
      // A11y: Enter/Space
      btn.addEventListener('keydown', (e)=>{
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); setStateDesktop(btn); }
      });
    });
  }

  // MOBILE accordion
  const accItems = $$('.about-us-mobile .about-us-acc-item');
  function fillAcc(item){
    const id = item.dataset.panel;
    const t  = $('#'+id);
    if(!t) return;
    item.querySelector('.about-us-acc-img').src   = t.dataset.img;
    item.querySelector('.about-us-acc-img').alt   = t.dataset.alt || '';
    item.querySelector('.about-us-acc-date').textContent   = t.dataset.date || '';
    item.querySelector('.about-us-acc-title').innerHTML    = t.dataset.title || '';
    item.querySelector('.about-us-acc-text').textContent   = t.dataset.text || '';
    item.querySelector('.about-us-acc-link').href          = t.dataset.link || '#';
  }
  accItems.forEach(fillAcc);

  function openAcc(item){
    accItems.forEach(i=>{
      const panel=i.querySelector('.about-us-acc-panel');
      const open=i===item;
      i.classList.toggle('is-open', open);
      panel.hidden = !open;
    });
  }

  accItems.forEach(item=>{
    const btn = item.querySelector('.about-us-acc-toggle');
    btn.addEventListener('click', ()=>{
      openAcc(item);
      syncDesktopFromMobile(item.dataset.panel, item.dataset.color);
    });
    // A11y toggle keys
    btn.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); btn.click(); }
    });
  });
  if (accItems[0]) openAcc(accItems[0]); // open first by default

  // SYNC helpers
  function syncMobileFromDesktop(panelId){
    const target = accItems.find(i=>i.dataset.panel===panelId);
    if(target) openAcc(target);
  }
  function syncDesktopFromMobile(panelId, color){
    const btn = panelId==='panel-latest' ? pillLatest
              : panelId==='panel-updates' ? pillUpdEl
              : pillProdEl;
    if(btn){
      setStateDesktop(btn);
      // osiguraj boju iako je desktop sakriven – zadrži var za sledeći prikaz
      if(color){ document.documentElement.style.setProperty('--about-us-card', color); }
    }
  }
})();

(function(){
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  const src        = $('.about-us-tab-source');
  const pillLatest = $('#tab-latest', src);
  const pillUpdEl  = $('#tab-updates', src);
  const pillProdEl = $('#tab-product', src);

  const leftCol  = $('.about-us-pills-left');
  const rightCol = $('.about-us-pills-right');

  // ako se iz bilo kog razloga nisu već pomerili, nateraj ih sada
  function ensurePillsMounted(){
    if (pillLatest && !pillLatest.parentElement.classList.contains('about-us-pills-left')){
      leftCol.appendChild(pillLatest);
    }
    if (pillUpdEl && !pillUpdEl.isConnected)   rightCol.appendChild(pillUpdEl);
    else if (pillUpdEl && pillUpdEl.parentElement!==rightCol) {
      rightCol.appendChild(pillUpdEl);
    }
    if (pillProdEl && !pillProdEl.isConnected) rightCol.appendChild(pillProdEl);
    else if (pillProdEl && pillProdEl.parentElement!==rightCol) {
      rightCol.appendChild(pillProdEl);
    }
  }

  // pozovi odmah i još jednom kada se sve učita (za slučaj kasnog CSS-a)
  ensurePillsMounted();
  window.addEventListener('load', ensurePillsMounted);
})();