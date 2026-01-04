
  const marquee = document.querySelector('.insta-marquee');
  const track   = document.getElementById('instaTrack');

  // Dupliraj sadržaj jednom (SET B) radi glatkog -50% loopa
  track.innerHTML += track.innerHTML;

  // Pauza na touch
  marquee.addEventListener('touchstart', () => {
    track.style.animationPlayState = 'paused';
  }, {passive:true});
  marquee.addEventListener('touchend', () => {
    track.style.animationPlayState = 'running';
  });

  // (opciono) prekini link na desktopu ako želiš samo demo:
  // document.querySelectorAll('.insta-card').forEach(a => a.addEventListener('click', e => e.preventDefault()));

