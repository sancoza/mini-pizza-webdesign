/* GSAP ScrollTrigger setup for the vertical timeline */
window.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const section  = document.querySelector('#about-timeline');
  if (!section) return;

  const railLine = section.querySelector('.tl-rail__line');
  const years    = Array.from(section.querySelectorAll('.tl-year'));
  const items    = Array.from(section.querySelectorAll('.tl-item'));

  /* Pin entire section while we scroll through it */
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${section.scrollHeight - window.innerHeight + 400}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1
  });

  /* Progress on the dotted rail (scaled via CSS var) */
  const railProxy = { p: 0 };
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => {
      railProxy.p = self.progress;
      railLine.style.setProperty('--rail-progress', railProxy.p.toFixed(4));
    }
  });

  /* Enter animations for each item (image + text) */
  items.forEach((item) => {
    const media = item.querySelector('.tl-media');
    const text  = item.querySelector('.tl-text');
    const fromX = item.classList.contains('tl-item--alt') ? 60 : -60;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(media, { y: 30, x: fromX, opacity: 0 }, { y: 0, x: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
      .fromTo(text,  { y: 20, x: -fromX, opacity: 0 }, { y: 0, x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.35');

    ScrollTrigger.create({
      trigger: item,
      start: 'top 70%',
      onEnter: () => {
        item.style.opacity = 1;
        tl.play();
        const year = item.dataset.year;
        years.forEach(li => li.classList.toggle('is-active', li.textContent.trim().includes(year)));
      },
      onEnterBack: () => {
        item.style.opacity = 1;
        tl.play(0);
        const year = item.dataset.year;
        years.forEach(li => li.classList.toggle('is-active', li.textContent.trim().includes(year)));
      }
    });
  });

  /* Click a year to smooth-scroll to that item (native smooth scroll) */
  years.forEach(li => {
    li.addEventListener('click', () => {
      const sel = li.getAttribute('data-target');
      const target = document.querySelector(sel);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* Light parallax on images */
  items.forEach(item => {
    const img = item.querySelector('.tl-media img');
    if (!img) return;
    gsap.to(img, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: item,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.2
      }
    });
  });
});
