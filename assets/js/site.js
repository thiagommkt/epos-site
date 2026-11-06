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
  document.querySelectorAll('.vid[data-yt],.vid[data-drive]').forEach(function (box) {
    var btn = box.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      var dr = box.getAttribute('data-drive');
      f.src = dr ? 'https://drive.google.com/file/d/' + dr + '/preview' : 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt') + '?autoplay=1&rel=0';
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

/* cookies: Pixel e posts do Instagram sempre ligados; o aviso só informa e lembra que já foi visto. */
(function () {
  var box = document.getElementById('cookies');
  var KEY = 'epos_cookies';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function apply() {
    if (window.eposPixel) window.eposPixel();
    document.querySelectorAll('.ig[data-ig]').forEach(function (el) {
      if (el.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.instagram.com/p/' + el.getAttribute('data-ig') + '/embed/';
      f.title = el.getAttribute('data-title') || 'Publicação no Instagram';
      f.loading = 'lazy'; f.scrolling = 'no'; f.setAttribute('allowtransparency', 'true');
      el.innerHTML = ''; el.appendChild(f);
    });
  }
  apply();
  if (!box) return;
  if (!get()) box.hidden = false;
  box.addEventListener('click', function (e) {
    if (!e.target.closest('[data-ck]')) return;
    set('ok'); box.hidden = true;
  });
  document.querySelectorAll('[data-cookies-open]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); box.hidden = false; });
  });
})();

/* Rastreamento no nosso banco (lp_events, lp_slug 'site'; 03/11/2026): visitas, páginas, até onde leram a home, cliques, tempo e origem.
   Nada disso vai à Meta. O quadro do quiz e os botões do diagnóstico levam o mesmo identificador (?sid=): site → raio-X → lead é a mesma pessoa.
   ?equipe=1 marca o aparelho como equipe (as visitas dele ficam fora da conta no painel). */
(function () {
  if (navigator.webdriver) return;   // auditoria automática não conta
  var SB_URL = 'https://phszzzwqkujmmfregtsj.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3p6endxa3VqbW1mcmVndHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg0NzgsImV4cCI6MjA5MDgzNDQ3OH0.E8WPvaVQuemNIbL5SeHqpX1Kv-00E7tK6l8fzPxqeJA';
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var sid = ler('_lp_sid');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(sid || '')) {
    sid = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    gravar('_lp_sid', sid);
  }
  var p = new URLSearchParams(location.search);
  var LIM = { utm_source: 100, utm_medium: 100, utm_campaign: 200, utm_content: 200, utm_term: 200, utm_id: 40, ad_id: 40, adset_id: 40, placement: 60 };
  var utms = {};
  Object.keys(LIM).forEach(function (k) { var v = p.get(k); if (v) utms[k] = v.slice(0, LIM[k]); });
  var caminho = (location.pathname || '/').slice(0, 40);

  function track(tipo, extra) {
    var body = { lp_slug: 'site', event_type: tipo, session_id: sid, referrer: (document.referrer || '').slice(0, 490) };
    Object.keys(utms).forEach(function (k) { body[k] = utms[k]; });
    Object.keys(extra || {}).forEach(function (k) { body[k] = extra[k]; });
    try {
      fetch(SB_URL + '/rest/v1/lp_events', { method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'apikey': SB_ANON, 'Authorization': 'Bearer ' + SB_ANON },
        body: JSON.stringify(body) }).catch(function () {});
    } catch (e) {}
  }

  // aparelho da equipe: marca uma vez por identificador
  if (p.get('equipe') === '1') {
    gravar('_epos_equipe', '1');
    try { p.delete('equipe'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p.toString() : '') + location.hash); } catch (e) {}
    var aviso = document.createElement('div');
    aviso.textContent = 'Este aparelho foi marcado como equipe. As visitas dele ficam fora da conta do painel.';
    aviso.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;padding:12px 16px;background:#1a1033;color:#fff;font:500 14px/1.4 system-ui,sans-serif;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.3);text-align:center';
    document.body.appendChild(aviso);
    setTimeout(function () { aviso.remove(); }, 6000);
  }
  if (ler('_epos_equipe') === '1' && ler('_epos_equipe_sid') !== sid) { track('equipe', { step_name: 'site' }); gravar('_epos_equipe_sid', sid); }

  track('pageview', { step_name: caminho, answer: (document.title || '').slice(0, 280),
    user_agent: (navigator.userAgent || '').slice(0, 390), viewport: (window.innerWidth + 'x' + window.innerHeight).slice(0, 20) });

  // quiz: o quadro da home e os botões do diagnóstico levam o identificador da visita
  function comSid(url) {
    try {
      var u = new URL(url, location.href);
      if (u.hostname === 'lp.eposmktfilmsia.com.br' && /quiz-epos\.html$/.test(u.pathname)) { u.searchParams.set('sid', sid); return u.toString(); }
    } catch (e) {}
    return null;
  }
  document.querySelectorAll('a[href*="quiz-epos.html"]').forEach(function (a) { var n = comSid(a.getAttribute('href')); if (n) a.setAttribute('href', n); });
  var qf = document.querySelector('.quiz iframe');
  if (qf) { var nq = comSid(qf.getAttribute('src')); if (nq) qf.setAttribute('src', nq); }

  // até onde leram: seções da home (pela ordem) e o rodapé de qualquer página
  var HOME = ['abertura', 'ferramentas', 'agencias', 'sistema', 'clientes', 'como-trabalhamos', 'historia', 'regioes', 'diagnostico'];
  if ('IntersectionObserver' in window) {
    var vistos = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.getAttribute('data-trk-k');
        io.unobserve(e.target);
        if (vistos[k]) return;
        vistos[k] = 1;
        if (k === 'fim') track('step_view', { step_name: 'fim', answer: caminho });
        else track('step_view', { step_name: k.slice(0, 40), step_index: +e.target.getAttribute('data-trk-i'), answer: caminho });
      });
    }, { threshold: 0.2 });
    var main = document.getElementById('main');
    if (caminho === '/' && main) {
      [].slice.call(main.children).filter(function (el) { return el.tagName === 'SECTION'; }).forEach(function (sec, i) {
        sec.setAttribute('data-trk-k', sec.getAttribute('data-trk') || HOME[i] || ('secao-' + (i + 1)));
        sec.setAttribute('data-trk-i', i);
        io.observe(sec);
      });
    }
    var rodape = document.querySelector('footer');
    if (rodape) { rodape.setAttribute('data-trk-k', 'fim'); io.observe(rodape); }
  }

  // cliques que levam para fora da página: diagnóstico, WhatsApp, telefone, e-mail, redes
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var tipo = /quiz-epos\.html|#diagnostico$/.test(h) ? 'diagnostico'
      : /wa\.me|whatsapp\.com/.test(h) ? 'whatsapp'
      : /^tel:/.test(h) ? 'telefone'
      : /^mailto:/.test(h) ? 'email'
      : /instagram\.com/.test(h) ? 'instagram'
      : /youtube\.com|youtu\.be/.test(h) ? 'youtube'
      : /metodo\.html/.test(h) ? 'metodo'
      : /behance\.net/.test(h) ? 'behance'
      : (/^https?:/.test(h) && a.host !== location.host) ? 'link-externo' : null;
    if (tipo) track('cta_click', { step_name: tipo, answer: caminho });
  }, true);

  // tempo na página (só enquanto visível)
  var t0 = Date.now(), visivel = 0, mandou = false;
  function enviarTempo() {
    if (mandou) return; mandou = true;
    var d = Math.round(visivel / 1000);
    if (d >= 2) track('time_spent', { step_name: caminho, duration_s: Math.min(d, 7200) });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { visivel += Date.now() - t0; enviarTempo(); } else t0 = Date.now();
  });
  window.addEventListener('pagehide', function () { if (document.visibilityState !== 'hidden') visivel += Date.now() - t0; enviarTempo(); });
})();
