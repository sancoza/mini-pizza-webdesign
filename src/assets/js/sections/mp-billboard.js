document.addEventListener('DOMContentLoaded', () => {
  const billboard = document.querySelector('.mp-billboard');

  // Ako postoji billboard – pokreni animaciju slika
  if (billboard) {
    // 1) Globalni sloj za slike
    let wrapper = billboard.querySelector('.image-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper';
      billboard.appendChild(wrapper);
    }

    const lines = Array.from(billboard.querySelectorAll('.mp-line'));

    // 2) Set za svaki red (alternacija TR+BL / TL+BR)
    const sets = lines.map((line, idx) => {
      const set = document.createElement('div');
      set.className = 'thumbnail-set';

      const odd = (idx % 2 === 0);
      const urls = {
        tl: line.dataset.imgTl,
        tr: line.dataset.imgTr,
        bl: line.dataset.imgBl,
        br: line.dataset.imgBr
      };

      const addThumb = (pos, url) => {
        if (!url) return;
        const t = document.createElement('div');
        t.className = 'thumb ' + pos;
        t.innerHTML = `<div class="imgbox"><img src="${url}" alt=""></div>`;
        set.appendChild(t);
      };

      if (odd) {
        addThumb('tr', urls.tr || urls.tl);
        addThumb('bl', urls.bl || urls.br);
      } else {
        addThumb('tl', urls.tl || urls.tr);
        addThumb('br', urls.br || urls.bl);
      }

      wrapper.appendChild(set);
      return set;
    });

    // 3) Aktivacija hovera
    function activate(i){
      lines.forEach((ln, j) => ln.classList.toggle('is-active', j === i));
      sets.forEach((s, j)   => s.classList.toggle('active-set', j === i));
    }
    if (lines.length) activate(0);

    lines.forEach((ln, i) => {
      ln.addEventListener('mouseenter', () => activate(i));
      ln.addEventListener('focus',      () => activate(i));
      ln.addEventListener('click',      () => activate(i));
    });

    // 4) Auto rotate (touch)
    let touchTimer;
    billboard.addEventListener('touchstart', () => {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(() => {
        const current = sets.findIndex(s => s.classList.contains('active-set'));
        activate((current + 1) % sets.length);
      }, 1500);
    }, {passive:true});
  }

  // 5) Smile konfete – GLOBAL (radi i u footeru)
  document.querySelectorAll('.smile-trigger').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        s.className = 'smile-particle';
        const img = document.createElement('img');
        img.src = './assets/img/logo.png'; // koristi isti logo
        img.alt = '';
        s.appendChild(img);
        s.style.setProperty('--dx', (Math.random()*200 - 100) + 'px');
        s.style.setProperty('--dy', (Math.random()*150 - 75) + 'px');
        btn.appendChild(s);
        setTimeout(() => s.remove(), 800);
      }
    });
  });
});
