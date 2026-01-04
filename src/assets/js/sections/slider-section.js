
/* ========= GSAP helper: horizontalLoop ========= */
function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
    }),
    length = items.length,
    startX = items[0].offsetLeft,
    times = [],
    widths = [],
    xPercents = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
    totalWidth, curX, distanceToStart, distanceToLoop, item, i;

  gsap.set(items, {
    xPercent: (i, el) => {
      let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
      xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
      return xPercents[i];
    }
  });
  gsap.set(items, { x: 0 });

  totalWidth = items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX
             + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX")
             + (parseFloat(config.paddingRight) || 0);

  for (i = 0; i < length; i++) {
    item = items[i];
    curX = xPercents[i] / 100 * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop  = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");

    tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100),
                  duration: distanceToLoop / pixelsPerSecond }, 0)
      .fromTo(item,
              { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) },
              { xPercent: xPercents[i],
                duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false },
              distanceToLoop / pixelsPerSecond)
      .add("label" + i, distanceToStart / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index, vars) {
    vars = vars || {};
    (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
    let newIndex = gsap.utils.wrap(0, length, index),
        time     = times[newIndex];

    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next     = vars => toIndex(curIndex + 1, vars);
  tl.previous = vars => toIndex(curIndex - 1, vars);
  tl.current  = () => curIndex;
  tl.toIndex  = (index, vars) => toIndex(index, vars);
  tl.times    = times;
  tl.progress(1, true).progress(0, true);
  if (config.reversed) { tl.vars.onReverseComplete(); tl.reverse(); }
  return tl;
}

/* ========= Integracija u slider ========= */
(() => {
  const viewport  = document.getElementById('pizzaViewport');
  const track     = document.getElementById('pizzaTrack');
  const slidesAll = Array.from(track.querySelectorAll('.slide'));
  const dotsBox   = document.getElementById('pizzaDots');
  const prevBtn   = document.querySelector('.control-bar .prev');
  const nextBtn   = document.querySelector('.control-bar .next');
  const filters   = document.querySelectorAll('.slider-filters .filter-pill');

  let filter = 'all';
  let loopTL = null;          // GSAP loop timeline za "all"
  let observer = null;        // GSAP Observer
  let localIndex = 0;         // indeks u ne-ALL režimu
  let visible = slidesAll.slice(); // trenutno vidljive li

  const gapPx = () => parseFloat(getComputedStyle(track).gap || 0);
  const slideW = () => {
    const s = visible[0] || track.querySelector('.slide');
    if (!s) return 300;
    const r = s.getBoundingClientRect();
    return r.width + gapPx();
  };

  /* ---------- Dots ----------- */
  function makeDots(count, active=0){
    dotsBox.innerHTML = '';
    for(let i=0;i<count;i++){
      const b = document.createElement('button');
      b.type='button';
      b.setAttribute('aria-label', `Go to slide ${i+1}`);
      if(i===active) b.setAttribute('aria-current','true');
      b.addEventListener('click', ()=> goTo(i));
      dotsBox.appendChild(b);
    }
  }
  function syncDots(i){
    dotsBox.querySelectorAll('button').forEach((b,idx)=>{
      if(idx===i) b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
  }

  /* ---------- Strelice (centralizovano) ----------- */
  function handlePrev(){ goTo('prev'); }
  function handleNext(){ goTo('next'); }

  // Jedna funkcija koja radi i za ALL i za filtrirano
  function goTo(target){
    if (filter === 'all' && loopTL) {
      // GSAP loop način
      if (target === 'prev') {
        loopTL.previous({duration:0.6, ease:'power2.out'});
        syncDots(loopTL.current());
      } else if (target === 'next') {
        loopTL.next({duration:0.6, ease:'power2.out'});
        syncDots(loopTL.current());
      } else if (typeof target === 'number') {
        loopTL.toIndex(target, {duration:0.6, ease:'power2.out'});
        syncDots(loopTL.current());
      }
      return;
    }

    // Klasičan (bez loopa)
    if (typeof target === 'number') {
      localIndex = Math.max(0, Math.min(target, visible.length - 1));
    } else if (target === 'prev') {
      localIndex = Math.max(0, localIndex - 1);
    } else if (target === 'next') {
      localIndex = Math.min(visible.length - 1, localIndex + 1);
    }
    track.style.transition = 'transform .4s ease';
    track.style.transform  = `translate3d(${-localIndex*slideW()}px,0,0)`;
    syncDots(localIndex);
  }

  /* ---------- Loop setup / teardown ----------- */
  function destroyLoop(){
    if(loopTL){ loopTL.kill(); loopTL = null; }
    if(observer){ observer.kill(); observer = null; }
    gsap.set(slidesAll, { clearProps: 'x,xPercent' });
    gsap.set(track, { clearProps: 'transform' });
  }

  function buildALL(){
    destroyLoop();

    // Vidljivi su svi (filter = all)
    visible = slidesAll.filter(li => li.style.display !== 'none');
    makeDots(visible.length, 0);

    // GSAP loop nad vidljivim li (seamless, bez klonova)
    loopTL = horizontalLoop(visible, {
      repeat: -1,
      speed: 0.9,
      snap: 1
    });
    // start “mirno”, pomera se na strelice/dots/wheel/touch
    loopTL.timeScale(0);

    // Observer za wheel/touch/pointer – ubrzaj pa lagano stani
    const slow = gsap.to(loopTL, { timeScale: 0, duration: 0.5, paused: true });
  if (typeof Observer !== "undefined") {
  observer = Observer.create({
    target: viewport,
    type: "wheel,touch,pointer",
    wheelSpeed: -1,
    onChange: self => {
      const s = Math.abs(self.deltaX) > Math.abs(self.deltaY) ? -self.deltaX : -self.deltaY;
      loopTL.timeScale(s);
      slow.restart();
    }
  });
} else {
  console.warn("GSAP Observer plugin nije učitan – preskačem observer.");
}

    // Strelice: vežu se na centralizovane handlere
    prevBtn?.removeEventListener('click', handlePrev);
    nextBtn?.removeEventListener('click', handleNext);
    prevBtn?.addEventListener('click', handlePrev);
    nextBtn?.addEventListener('click', handleNext);

    // Sync dots dok loop “teče”
    loopTL.eventCallback('onUpdate', () => syncDots(loopTL.current()));
  }

  function buildFiltered(cat){
    destroyLoop();
    filter = cat;

    // Pokaži/sakrij po kategoriji
    slidesAll.forEach(li=>{
      const cats = (li.dataset.cat || '').split(',').map(s => s.trim());
      li.style.display = (cat === 'all' || cats.includes(cat)) ? '' : 'none';
    });
    visible = slidesAll.filter(li => li.style.display !== 'none');

    // Centriranje ako sve staje u viewport
    requestAnimationFrame(()=>{
      const totalW = visible.length * slideW() - (visible.length ? gapPx() : 0);
      const centered = totalW <= viewport.clientWidth;
      track.classList.toggle('is-centered', centered);
      track.style.transition = '';
      track.style.transform  = 'translate3d(0,0,0)';
    });

    if (cat === 'all') {
      buildALL();
      return;
    }

    // “Normalno” listanje bez loop-a
    localIndex = 0;
    makeDots(visible.length, 0);
    syncDots(0);

    prevBtn?.removeEventListener('click', handlePrev);
    nextBtn?.removeEventListener('click', handleNext);
    prevBtn?.addEventListener('click', handlePrev);
    nextBtn?.addEventListener('click', handleNext);
  }

  // Klik na filtere
  filters.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filters.forEach(b=> b.classList.toggle('is-active', b===btn));
      filters.forEach(b=> b.setAttribute('aria-selected', b===btn ? 'true' : 'false'));
      buildFiltered(btn.dataset.filter || 'all');
    });
  });

  // INIT
  buildFiltered('all');

  // Resize
  window.addEventListener('resize', () => {
    setTimeout(() => {
      if (filter === 'all') {
        loopTL && syncDots(loopTL.current());
      } else {
        track.style.transition = '';
        track.style.transform  = `translate3d(${-localIndex*slideW()}px,0,0)`;
        syncDots(localIndex);
      }
    }, 120);
  });

})();

