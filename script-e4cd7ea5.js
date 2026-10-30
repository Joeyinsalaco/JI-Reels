const toggle=document.getElementById('menuToggle');const links=document.getElementById('navLinks');if(toggle&&links){toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false');document.body.style.overflow=''}))}
(() => {
  const root = document.documentElement;
  const intro = document.querySelector('.intro-scroll');
  if (!intro) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      root.style.setProperty('--intro-p','0');
      intro.classList.remove('intro-complete');
      return;
    }
    const rect = intro.getBoundingClientRect();
    const viewport = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const distance = Math.max(1, rect.height - viewport);
    const progress = Math.min(1, Math.max(0, -rect.top / distance));
    root.style.setProperty('--intro-p', progress.toFixed(4));
    intro.classList.toggle('intro-complete', progress > 0.965);
  };
  const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
  update();
  addEventListener('scroll', requestUpdate, {passive:true});
  addEventListener('resize', requestUpdate, {passive:true});
  addEventListener('orientationchange', requestUpdate, {passive:true});
  addEventListener('pageshow', requestUpdate);
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', requestUpdate, {passive:true});
    visualViewport.addEventListener('scroll', requestUpdate, {passive:true});
  }
  if ('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(intro);
})();
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.13,rootMargin:'0px 0px -4%'});document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=`${Math.min((i%4)*90,270)}ms`;io.observe(el)});
document.querySelectorAll('.faq-item').forEach(item=>{const q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');q?.addEventListener('click',()=>{const was=item.classList.contains('open');document.querySelectorAll('.faq-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight='';o.querySelector('.faq-q').setAttribute('aria-expanded','false')});if(!was){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';q.setAttribute('aria-expanded','true')}})});


// Subtle cinematic transitions between internal pages.
document.body.classList.add('page-entering');

window.addEventListener('pageshow', () => {
  document.body.classList.remove('page-leaving');
});

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');

    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const destination = new URL(link.href, window.location.href);

    if (destination.origin !== window.location.origin) return;

    event.preventDefault();
    document.body.classList.add('page-leaving');

    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 240);
  });
});








// Compact blue-glow reveal for Featured Reels.
(() => {
  const items = document.querySelectorAll('.blue-glow-reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const siblings = [...entry.target.parentElement.querySelectorAll('.blue-glow-reveal')];
      const index = siblings.indexOf(entry.target);

      window.setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, Math.max(0, index) * 130);

      obs.unobserve(entry.target);
    });
  }, {
    threshold:0.2,
    rootMargin:'0px 0px -8% 0px'
  });

  items.forEach(item => observer.observe(item));
})();





// Simple permanent header behavior.
(() => {
  const header = document.querySelector('header');
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive:true });
})();

(() => {
 const h=document.querySelector('header');
 if(!h)return;
 const u=()=>h.classList.toggle('scrolled',window.scrollY>30);
 u(); addEventListener('scroll',u,{passive:true});
})();


// Touch devices do not have hover. Give interactive cards the same polish
// when they enter the center of the mobile viewport.
(() => {
  if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  const cards = document.querySelectorAll('.price-card,.reel-card,.actor-card,.about-photo');
  if (!cards.length || !('IntersectionObserver' in window)) return;
  const mobileCardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('mobile-active', entry.isIntersecting);
    });
  }, { threshold:0.58, rootMargin:'-8% 0px -8% 0px' });
  cards.forEach(card => mobileCardObserver.observe(card));
})();
