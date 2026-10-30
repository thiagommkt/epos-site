/* Epos site — menu móvel, revelar ao rolar, vídeo YouTube sob demanda, filtros do portfólio */
(function () {
  document.documentElement.classList.add('js');

  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      nav.style.top = document.querySelector('.hd').getBoundingClientRect().bottom + 'px';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // vídeo do YouTube só carrega no clique (página leve)
  document.querySelectorAll('.vid[data-yt]').forEach(function (box) {
    var btn = box.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt') + '?autoplay=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.title = btn.getAttribute('aria-label') || 'Vídeo';
      box.innerHTML = '';
      box.appendChild(f);
    });
  });

  // diagnóstico embutido: o quiz informa a própria altura; só aceitamos a mensagem do iframe da página
  var quiz = document.querySelector('.quiz iframe');
  if (quiz) {
    var quizOrigin = new URL(quiz.getAttribute('src'), location.href).origin;
    window.addEventListener('message', function (e) {
      if (e.origin !== quizOrigin || e.source !== quiz.contentWindow) return;
      var d = e.data;
      if (d && d.tipo === 'epos-quiz' && d.etapa === 'altura' && d.h > 300) {
        quiz.style.height = Math.min(Math.ceil(d.h) + 4, 1400) + 'px';
      }
    });
  }

  // filtros do portfólio (pilar e segmento)
  var bar = document.querySelector('[data-filters]');
  if (bar) {
    var cards = document.querySelectorAll('[data-pilares]');
    var state = { pilar: '', segmento: '' };
    bar.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-k]');
      if (!b) return;
      state[b.dataset.k] = b.dataset.v;
      bar.querySelectorAll('button[data-k="' + b.dataset.k + '"]').forEach(function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      cards.forEach(function (c) {
        var okP = !state.pilar || c.dataset.pilares.split(' ').indexOf(state.pilar) > -1;
        var okS = !state.segmento || c.dataset.segmento === state.segmento;
        c.hidden = !(okP && okS);
      });
    });
  }
})();

/* lightbox da galeria */
(function () {
  var gal = document.querySelector('[data-gal]');
  if (!gal) return;
  var links = [].slice.call(gal.querySelectorAll('a'));
  var lb = document.createElement('div');
  lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Galeria de fotos');
  lb.innerHTML = '<button class="x" aria-label="Fechar">×</button><button class="pv" aria-label="Anterior">‹</button><img alt=""><button class="nx" aria-label="Próxima">›</button><div class="ct"></div>';
  document.body.appendChild(lb);
  var img = lb.querySelector('img'), ct = lb.querySelector('.ct'), i = 0;
  function show(n) {
    i = (n + links.length) % links.length;
    img.src = links[i].href; img.alt = links[i].querySelector('img').alt;
    ct.textContent = (i + 1) + ' / ' + links.length;
  }
  function open(n) { show(n); lb.classList.add('on'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }
  function close() { lb.classList.remove('on'); document.body.style.overflow = ''; img.removeAttribute('src'); }
  links.forEach(function (a, n) { a.addEventListener('click', function (e) { e.preventDefault(); open(n); }); });
  lb.querySelector('.x').onclick = close;
  lb.querySelector('.pv').onclick = function () { show(i - 1); };
  lb.querySelector('.nx').onclick = function () { show(i + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(i - 1); else if (e.key === 'ArrowRight') show(i + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
})();

/* cookies: "all" liga Pixel e posts do Instagram; "ess" só o essencial. Escolha fica no navegador. */
(function () {
  var box = document.getElementById('cookies');
  if (!box) return;
  var KEY = 'epos_cookies';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function apply(v) {
    if (v !== 'all') return;
    if (window.eposPixel) window.eposPixel();
    document.querySelectorAll('.ig[data-ig]').forEach(function (el) {
      if (el.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.instagram.com/p/' + el.getAttribute('data-ig') + '/embed/';
      f.title = 'Carrossel do Farias & Moura no Instagram';
      f.loading = 'lazy'; f.scrolling = 'no'; f.setAttribute('allowtransparency', 'true');
      el.innerHTML = ''; el.appendChild(f);
    });
  }
  var cur = get();
  if (cur) apply(cur); else box.hidden = false;
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ck]');
    if (!b) return;
    var v = b.getAttribute('data-ck'); set(v); box.hidden = true;
    if (v === 'all') apply('all'); else if (cur === 'all') location.reload();
    cur = v;
  });
  document.querySelectorAll('[data-cookies-open]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); box.hidden = false; });
  });
})();
