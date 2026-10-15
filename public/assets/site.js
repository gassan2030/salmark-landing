(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Шапка темнеет после начала прокрутки; плавающая кнопка прячется у формы
  const bar = d.querySelector('.bar'), fab = d.querySelector('.fab'), form = d.getElementById('form');
  const onScroll = () => bar.classList.toggle('solid', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // Плавающая кнопка не нужна, пока на экране своя кнопка первого экрана или сама форма
  const own = [form, d.querySelector('.hero .acts, .page-hero .btn')].filter(Boolean), seen = new Set();
  if (fab && own.length) {
    const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); fab.classList.toggle('hide', seen.size > 0); });
    own.forEach(el => io.observe(el));
  }

  // Меню на телефоне
  const burger = d.querySelector('.burger');
  burger.addEventListener('click', () => {
    const open = root.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  d.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
    root.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false);
  }));

  // Появление блоков: показывает, что страница живая, и ведёт взгляд сверху вниз
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    d.querySelectorAll('.rv').forEach(el => io.observe(el));
  } else {
    root.classList.remove('js');
  }
  const hero = d.querySelector('.hero');
  if (hero) requestAnimationFrame(() => setTimeout(() => hero.classList.add('in'), 60));

  // Карточки проектов в первом экране чуть следуют за мышью — отклик на движение, только на компьютере
  const cards = d.querySelectorAll('.hero .card');
  if (cards.length && !reduce && matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    let raf = 0;
    hero.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        cards.forEach((c, i) => {
          const k = (i + 1) * 9;
          c.classList.add('moved');
          c.style.setProperty('--px', (x * k).toFixed(1) + 'px');
          c.style.setProperty('--py', (y * k).toFixed(1) + 'px');
        });
      });
    });
  }

  // Заявка: письмо уходит через FormSubmit, адрес владельца скрыт за кодом
  const f = d.getElementById('lead');
  if (f) {
    const st = d.getElementById('leadStatus');
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(f);
      const what = fd.getAll('what'); fd.delete('what');
      const data = Object.fromEntries(fd);
      data.what = what.join(', ') || '—';
      data.page = location.pathname;
      if (!data.contact || !data.contact.trim()) { st.textContent = 'Оставьте телефон или почту — иначе не сможем ответить.'; f.contact.focus(); return; }
      const btn = f.querySelector('button'); btn.disabled = true; st.textContent = 'Отправляем…';
      try {
        const r = await fetch('https://formsubmit.co/ajax/7230d32fc831cc8ed1e7004be2263034', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
        });
        const j = await r.json();
        if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || r.status);
        f.reset(); st.textContent = 'Спасибо! Заявка отправлена — скоро свяжемся.';
        if (window.ym && window.SALMARK_YM) ym(window.SALMARK_YM, 'reachGoal', 'lead');
      } catch (err) {
        st.textContent = 'Не отправилось. Проверьте интернет и попробуйте ещё раз.';
      } finally { btn.disabled = false; }
    });
  }
})();
