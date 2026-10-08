/* YUNTRIA.IA — interacciones. JavaScript puro, sin dependencias. */
(function () {
  'use strict';
  var WA = '51926998623';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mqDesktop = window.matchMedia('(min-width: 980px)');

  /* ----- Menú móvil y desplegables ----- */
  var toggle = $('.nav-toggle'), nav = $('#nav');
  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open && !mqDesktop.matches ? 'hidden' : '';
  }
  if (toggle) toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  function closeDropdowns(except) {
    $$('.dd-toggle').forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      $('#' + b.getAttribute('aria-controls')).classList.remove('open');
    });
  }
  $$('.dd-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dd = $('#' + btn.getAttribute('aria-controls'));
      var open = !dd.classList.contains('open');
      closeDropdowns(btn);
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dd')) closeDropdowns();
    if (nav && nav.classList.contains('open') && e.target.closest('#nav a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDropdowns(); setNav(false); }
  });
  mqDesktop.addEventListener && mqDesktop.addEventListener('change', function () { setNav(false); });

  /* ----- Aparición al hacer scroll ----- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.setProperty('--d', (i % 4) * 70 + 'ms');
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ----- FAQ: un solo ítem abierto a la vez dentro de cada grupo ----- */
  $$('.faq').forEach(function (group) {
    $$('details', group).forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) $$('details', group).forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ----- Analytics: evento al hacer clic en CTAs de WhatsApp ----- */
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { link_url: a.href, page_path: location.pathname });
    });
  });

  /* ----- Blog: búsqueda, categorías y paginación ----- */
  var grid = $('#post-grid');
  if (grid) {
    var cards = $$('.post-card', grid), perPage = parseInt(grid.dataset.perPage, 10) || 9;
    var pag = $('#pagination'), search = $('#blog-search'), empty = $('#blog-empty');
    var state = { q: '', cat: '', page: 1 };
    var params = new URLSearchParams(location.search);
    state.page = Math.max(1, parseInt(params.get('page'), 10) || 1);
    state.cat = params.get('cat') || '';
    state.q = params.get('q') || '';
    if (search) search.value = state.q;

    function render(push) {
      var q = state.q.trim().toLowerCase();
      var match = cards.filter(function (c) {
        return (!state.cat || c.dataset.cat === state.cat) && (!q || c.dataset.title.indexOf(q) > -1);
      });
      var pages = Math.max(1, Math.ceil(match.length / perPage));
      state.page = Math.min(state.page, pages);
      var start = (state.page - 1) * perPage;
      cards.forEach(function (c) { c.hidden = true; });
      match.slice(start, start + perPage).forEach(function (c) { c.hidden = false; c.classList.add('in'); });
      if (empty) empty.hidden = match.length > 0;
      $$('#cat-list button').forEach(function (b) { b.classList.toggle('active', b.dataset.cat === state.cat); });
      pag.innerHTML = '';
      if (pages > 1) {
        for (var p = 1; p <= pages; p++) {
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = p; b.dataset.page = p;
          b.setAttribute('aria-label', 'Página ' + p);
          if (p === state.page) b.setAttribute('aria-current', 'page');
          pag.appendChild(b);
        }
      }
      if (push) {
        var u = new URLSearchParams();
        if (state.q) u.set('q', state.q);
        if (state.cat) u.set('cat', state.cat);
        if (state.page > 1) u.set('page', state.page);
        history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      }
    }
    if (search) search.addEventListener('input', function () { state.q = search.value; state.page = 1; render(true); });
    $('#cat-list').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.cat = b.dataset.cat; state.page = 1; render(true);
    });
    pag.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.page = parseInt(b.dataset.page, 10); render(true);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    render(false);
  }

  /* ----- Newsletter: valida el correo y continúa por WhatsApp ----- */
  var nl = $('#newsletter');
  if (nl) nl.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#nl-email').value.trim(), msg = $('#nl-msg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.className = 'form-msg err'; msg.textContent = 'Ingresa un correo válido.'; return;
    }
    msg.className = 'form-msg ok'; msg.textContent = 'Casi listo: confirma tu suscripción en WhatsApp.';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola YUNTRIA.IA, quiero suscribirme al Newsletter IA con el correo ' + email), '_blank', 'noopener');
  });

  /* ----- Chat demo interactivo (página Chatbot WhatsApp) ----- */
  var chat = $('#chat-demo');
  if (chat) {
    var body = $('#chat-body'), actions = $('#chat-actions'), timers = [];
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function later(fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }
    function add(text, who) {
      var m = document.createElement('div');
      m.className = 'msg ' + who; m.textContent = text;
      body.appendChild(m); body.scrollTop = body.scrollHeight;
    }
    function typing(ms, then) {
      var t = document.createElement('div');
      t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(t); body.scrollTop = body.scrollHeight;
      later(function () { t.remove(); then(); }, ms);
    }
    function bot(text, then) { typing(800, function () { add(text, 'bot'); if (then) then(); }); }
    function choices(list) {
      actions.innerHTML = '';
      list.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.textContent = c.label;
        b.addEventListener('click', function () { actions.innerHTML = ''; add(c.label, 'user'); c.next(c.label); });
        actions.appendChild(b);
      });
    }
    function start() {
      timers.forEach(clearTimeout); timers = [];
      body.innerHTML = ''; actions.innerHTML = '';
      later(function () {
        add('Hola, quisiera una cita para esta semana.', 'user');
        bot('¡Hola! Soy el Asistente IA. Tengo estos horarios disponibles para mañana:', function () {
          choices([10, 14, 16].map(function (h) {
            var label = h === 16 ? '16:30' : h + ':00';
            return { label: label, next: function (l) { confirmSlot(l); } };
          }));
        });
      }, 400);
    }
    function confirmSlot(l) {
      bot('Perfecto, tu cita quedó confirmada para mañana a las ' + l + '. Te enviaré un recordatorio 1 hora antes. ✅', function () {
        choices([
          { label: '¿Cuánto cuesta la consulta?', next: price },
          { label: 'Gracias, es todo', next: bye },
        ]);
      });
    }
    function price() {
      bot('La primera consulta es de S/ 80 e incluye evaluación inicial. (Precio de ejemplo para la demostración).', function () {
        choices([{ label: 'Gracias, es todo', next: bye }]);
      });
    }
    function bye() {
      bot('¡A ti! Así atendería tu chatbot, las 24 horas, sin que tu equipo intervenga.', function () {
        choices([{ label: 'Reiniciar demo', next: start }]);
      });
    }
    $('.chat-reset', chat).addEventListener('click', start);
    start();
  }
})();
