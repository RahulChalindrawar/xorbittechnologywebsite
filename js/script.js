/* X-Orbit Technology — vanilla JS, no dependencies. */
(() => {
  'use strict';
  /* ===== CONFIG: edit these two lines ===== */
  const FORM_ENDPOINT = '';                    // e.g. 'https://formspree.io/f/xxxxxxx' (leave '' to use mailto)
  const MAIL_TO = 'hr@xorbittechnology.com';     // used when FORM_ENDPOINT is empty
  /* ======================================== */
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hdr = $('#hdr'), bar = $('#progress'), topBtn = $('#top');
  $('#yr').textContent = new Date().getFullYear();

  /* scroll: header state, progress bar, back-to-top, timeline (one rAF-throttled handler) */
  const steps = $('#steps'), stepEls = $$('.step');
  let tick = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    hdr.classList.toggle('scrolled', y > 30);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    topBtn.classList.toggle('show', y > 700);
    const r = steps.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .75 - r.top) / (r.height + innerHeight * .1)));
    steps.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach((s, i) => s.classList.toggle('on', p >= i / (stepEls.length - 1) - .02 && p > 0));
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -40px' });
  $$('.rv').forEach(el => io.observe(el));

  /* active nav link */
  const links = $$('.menu a'), secs = links.map(a => $(a.getAttribute('href')));
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => s && so.observe(s));

  /* mobile menu */
  const burger = $('#burger'), menu = $('#menu');
  const setMenu = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); burger.focus(); } });

  /* desktop-only effects */
  if (fine && !reduce) {
    const orbit = $('#orbit'); let tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    const loop = () => { cx += (tx - cx) * .08; cy += (ty - cy) * .08; orbit.style.transform = `translate3d(${cx}px,${cy}px,0)`; if (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) requestAnimationFrame(loop); else run = false; };
    addEventListener('mousemove', e => { tx = (e.clientX / innerWidth - .5) * -28; ty = (e.clientY / innerHeight - .5) * -28; if (!run) { run = true; requestAnimationFrame(loop); } }, { passive: true });
    $$('.card').forEach(c => c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }));
    $$('.mag').forEach(b => { b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; }); b.addEventListener('pointerleave', () => b.style.transform = ''); });
  }

  /* "Explore Service" preselects the form option */
  $$('[data-service]').forEach(a => a.addEventListener('click', () => { const s = $('#service'); [...s.options].forEach(o => { if (o.text === a.dataset.service) s.value = o.value || o.text; }); }));

  /* contact form: validation + Formspree/mailto */
  const form = $('#form'), status = $('#status');
  const rules = { name: v => v.trim().length > 1 || 'Enter your full name.', email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email, like name@company.com.', msg: v => v.trim().length >= 20 || 'Describe your project in at least 20 characters.' };
  const ids = { name: 'name', email: 'email', msg: 'msg' };
  const check = k => { const i = $('#' + ids[k]), r = rules[k](i.value); $('#e-' + k).textContent = r === true ? '' : r; i.setAttribute('aria-invalid', r !== true); i.setAttribute('aria-describedby', 'e-' + k); return r === true; };
  Object.keys(ids).forEach(k => $('#' + ids[k]).addEventListener('blur', () => check(k)));
  form.addEventListener('submit', async e => {
    e.preventDefault(); status.className = '';
    const ok = Object.keys(ids).map(check).every(Boolean);
    if (!ok) { status.textContent = 'Please fix the highlighted fields.'; status.className = 'bad'; $('[aria-invalid=true]').focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    if (d._gotcha) return;
    if (FORM_ENDPOINT) {
      try {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!r.ok) throw 0;
        form.reset(); status.textContent = 'Thank you. Your message was sent and we will reply by email.'; status.className = 'ok';
      } catch { status.textContent = 'Message could not be sent. Please try again or email us directly.'; status.className = 'bad'; }
    } else {
      const body = `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company || '-'}\nService: ${d.service}\n\n${d.message}`;
      location.href = `mailto:${MAIL_TO}?subject=${encodeURIComponent('Project enquiry from ' + d.name)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Your email app should open with the message ready to send.'; status.className = 'ok';
    }
  });
})();
