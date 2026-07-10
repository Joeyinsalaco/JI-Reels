const toggle=document.getElementById('menuToggle');const links=document.getElementById('navLinks');if(toggle&&links){toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':''});links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false');document.body.style.overflow=''}))}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const intro=document.querySelector('.intro-scroll');if(intro&&!reduced&&innerWidth>900){const update=()=>{const rect=intro.getBoundingClientRect();const max=intro.offsetHeight-innerHeight;const p=Math.min(1,Math.max(0,-rect.top/Math.max(1,max)));document.documentElement.style.setProperty('--intro-p',p.toFixed(3))};update();addEventListener('scroll',update,{passive:true});addEventListener('resize',update)}
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
