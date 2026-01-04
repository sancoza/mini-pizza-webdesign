(function(){
  const wrap = document.getElementById('discountGrid');
  const cards = [...wrap.querySelectorAll('.discount-card')];
  const spread = 60, step = 8, scale = 1.07;

  function loadGSAP(){
    return new Promise(r=>{
      if(window.gsap) return r();
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
      s.onload=r; document.head.appendChild(s);
    });
  }

  function activate(card){
    const i = cards.indexOf(card);
    cards.forEach((c,j)=>{
      const diff = j - i;
      const move = diff * (spread + step * Math.abs(diff));
      const tilt = c.dataset.tilt || 0;
      if(c===card){
        gsap.to(c,{duration:.6,scale:scale,rotate:0,x:0,zIndex:10,ease:'expo.out'});
      }else{
        gsap.to(c,{duration:.6,scale:.98,rotate:tilt,x:move,zIndex:1,ease:'expo.out'});
      }
    });
  }

  function reset(){
    cards.forEach(c=>{
      const t = c.dataset.tilt || 0;
      gsap.to(c,{duration:.5,scale:1,rotate:t,x:0,rotateX:0,rotateY:0,zIndex:''});
    });
  }

  function parallax(e,card){
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width;
    const py=(e.clientY-r.top)/r.height;
    gsap.to(card,{rotateY:(px-.5)*12,rotateX:(.5-py)*10,duration:.25,ease:'power2.out'});
  }

  loadGSAP().then(()=>{
    cards.forEach(c=>{
      const bg=c.querySelector('.discount-bg');
      const src=c.dataset.bg;
      if(src) bg.style.backgroundImage=`url(${src})`;
      c.addEventListener('mouseenter',()=>activate(c));
      c.addEventListener('mousemove',e=>parallax(e,c));
      c.addEventListener('mouseleave',reset);
    });
  });
})();
document.querySelectorAll('.discount-card').forEach(card => {
  const url = card.dataset.bg;
  if (!url) return;

  // setuj glavnu pozadinu (ako već nije postavljena negde drugde)
  const bg = card.querySelector('.discount-bg');
  if (bg && !bg.style.backgroundImage) {
    bg.style.backgroundImage = `url("${url}")`;
  }

  // napravi ili nađi ugaoni thumbnail
  let thumb = card.querySelector('.corner-thumb');
  if (!thumb) {
    thumb = document.createElement('div');
    thumb.className = 'corner-thumb';
    card.appendChild(thumb);
  }
  thumb.style.backgroundImage = `url("${url}")`;
});