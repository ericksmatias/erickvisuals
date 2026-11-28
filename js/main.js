/* =========================================================
   Erick Matias, Portfólio · animações (GSAP + ScrollTrigger + Lenis)
   ========================================================= */
(function () {
  'use strict';

  // A preferência do sistema por menos movimento só desliga o scroll suave e os efeitos pesados.
  // As animações de entrada continuam ativas (antes elas sumiam e a página parecia "já pronta").
  var reducedOS = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reduced = false;
  var touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var lite = touch || reducedOS || window.matchMedia('(max-width: 900px)').matches; // celular: animações mais leves
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  if (!window.gsap || !window.ScrollTrigger) {
    // sem GSAP: mostra tudo e sai
    document.body.classList.remove('is-loading');
    var pl = $('#preloader'); if (pl) pl.style.display = 'none';
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true }); // barra do Safari não recalcula tudo
  // Se a aba ficar parada/suspensa, o GSAP não pode "pular" o tempo: mantém o padrão (corta saltos grandes).
  gsap.ticker.lagSmoothing(500, 33);

  /* ---------- scroll suave (Lenis) ---------- */
  var lenis = null;
  if (!reducedOS && !touch && window.Lenis) { // no toque o scroll nativo do iOS é mais suave
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    lenis.stop(); // liberado quando o preloader terminar
  }
  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- utilitário: separar em palavras (com máscara) ---------- */
  function splitWords(el, mask) {
    if (el.dataset.split) return $$('.wi', el);
    el.dataset.split = '1';
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = mask === false ? 'sw' : 'w';
            var i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
            if (mask === false) { w.appendChild(i); } else { w.appendChild(i); }
            frag.appendChild(w); out.push(i);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') { walk(n); }
      });
    })(el);
    return out;
  }

  /* ---------- marquees infinitos ---------- */
  $$('[data-marquee]').forEach(function (m) {
    var track = $('.ticker-track, .marquee-track', m);
    if (!track) return;
    var base = Array.prototype.slice.call(track.children);
    var guard = 0;
    while (track.scrollWidth < m.clientWidth && guard++ < 6) {
      base.forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
    }
    var twin = track.cloneNode(true); twin.setAttribute('aria-hidden', 'true');
    m.appendChild(twin);
    var speed = parseFloat(m.dataset.speed || 40);
    var w = track.scrollWidth;
    var dur = Math.max(12, w / speed);
    track.style.setProperty('--dur', dur + 's'); twin.style.setProperty('--dur', dur + 's');
  });

  /* ---------- menu ---------- */
  var menu = $('#menu'), menuBtn = $('#menuBtn'), nav = $('#nav');
  var menuTl = null;
  function buildMenu() {
    menuTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.inOut' } });
    menuTl.set(menu, { autoAlpha: 1 })
      .fromTo($('.menu-bg'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .8 })
      .fromTo($$('.menu-link .roll'), { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .05, ease: 'power4.out' }, '-=.35')
      .fromTo($$('.menu-title, .menu-side-link, .menu-side-text'), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .05, ease: 'power3.out' }, '-=.6');
  }
  buildMenu();
  var menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) { nav.classList.remove('hide'); menuTl.timeScale(1).play(); }
    else { menuTl.timeScale(1.6).reverse(); }
  }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });

  /* links âncora */
  $$('[data-menu-link], a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      var go = function () { id === '#top' ? (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: 'smooth' })) : scrollToTarget(target); };
      if (menuOpen) { setMenu(false); setTimeout(go, 450); } else go();
    });
  });

  /* nav: esconde ao rolar para baixo, mostra ao subir */
  var lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      nav.classList.toggle('scrolled', y > 40);
      if (!menuOpen) nav.classList.toggle('hide', y > 480 && self.direction === 1);
      lastY = y;
    }
  });

  /* botão flutuante aparece depois do hero */
  var floatBtn = $('#floatBtn');
  if (floatBtn) {
    ScrollTrigger.create({
      trigger: '#hero', start: 'bottom 40%', end: 'max',
      onEnter: function () { gsap.to(floatBtn, { y: 0, autoAlpha: 1, duration: .7, ease: 'power3.out' }); },
      onLeaveBack: function () { gsap.to(floatBtn, { y: 140, autoAlpha: 0, duration: .5, ease: 'power3.in' }); }
    });
    ScrollTrigger.create({
      trigger: '#contato', start: 'top 85%', end: 'max',
      onEnter: function () { gsap.to(floatBtn, { y: 140, autoAlpha: 0, duration: .4 }); },
      onLeaveBack: function () { gsap.to(floatBtn, { y: 0, autoAlpha: 1, duration: .5 }); }
    });
  }

  /* ---------- estados iniciais do hero ---------- */
  var heroTitle = $('[data-hero="title"]');
  var heroWords = splitWords(heroTitle);
  if (!reduced) {
    gsap.set(heroWords, { yPercent: 115 });
    gsap.set($$('[data-hero="fade"]'), { autoAlpha: 0, y: 30 });
    if (lite) gsap.set($('[data-hero="media"]'), { autoAlpha: 0 });
    else gsap.set($('[data-hero="media"]'), { clipPath: 'inset(8% 6% 8% 6% round 28px)', scale: 1.08 });
    gsap.set('.nav-pill', { yPercent: -160, autoAlpha: 0 });
  }

  function heroIntro() {
    document.body.classList.remove('is-loading');
    if (lenis) lenis.start();
    if (reduced) { ScrollTrigger.refresh(); return; }
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' }, onComplete: function () { ScrollTrigger.refresh(); } });
    if (lite) tl.to($('[data-hero="media"]'), { autoAlpha: 1, duration: 1, ease: 'power2.out' });
    else tl.to($('[data-hero="media"]'), { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, duration: 1.6, ease: 'expo.out' });
    tl
      .to('.nav-pill', { yPercent: 0, autoAlpha: 1, duration: 1, ease: 'expo.out' }, .3)
      .to(heroWords, { yPercent: 0, duration: 1.2, stagger: .07 }, .35)
      .to($$('[data-hero="fade"]'), { autoAlpha: 1, y: 0, duration: 1, stagger: .12 }, .75);
  }

  /* ---------- tela de entrada: spinner branco na logo (~1s) ---------- */
  var pl = $('#preloader'), plT0 = performance.now(), started = false;
  function startSite() {
    if (started) return; started = true;
    var wait = Math.max(0, 1000 - (performance.now() - plT0));
    setTimeout(function () {
      if (pl) gsap.to(pl, { autoAlpha: 0, duration: .45, ease: 'power2.out', onComplete: function () { pl.remove(); } });
      heroIntro();
    }, wait);
  }
  if (document.readyState === 'complete') startSite();
  else { window.addEventListener('load', startSite); setTimeout(startSite, 2600); }

  /* ---------- logo 3D do hero (carrega depois, só em aparelhos capazes) ---------- */
  (function hero3d() {
    var box = $('#hero3d'); if (!box) return;
    var weak = reducedOS ||
      (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      (navigator.connection && (navigator.connection.saveData || /(^|-)2g$/.test(navigator.connection.effectiveType || '')));
    if (weak) return; // fica a logo PNG girando em CSS (leve)
    function build() {
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', 'assets/Logoglb.glb');
      mv.setAttribute('alt', '');
      mv.setAttribute('orientation', '160deg 0deg 90deg');
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', '0');
      mv.setAttribute('rotation-per-second', '45deg');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('disable-zoom', '');
      mv.setAttribute('disable-pan', '');
      mv.setAttribute('disable-tap', '');
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('shadow-intensity', '0');
      mv.setAttribute('exposure', '1.8');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('tone-mapping', 'neutral');
      mv.setAttribute('camera-orbit', '0deg 78deg auto');
      mv.addEventListener('load', function () { box.classList.add('is-ready'); });
      box.appendChild(mv);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          var on = en[0].isIntersecting; box.classList.toggle('off', !on);
          if (on) mv.setAttribute('auto-rotate', ''); else mv.removeAttribute('auto-rotate');
        }, { threshold: 0.05 }).observe(box);
      }
    }
    function load() {
      var sc = document.createElement('script'); sc.type = 'module'; sc.src = 'js/vendor/model-viewer.min.js';
      sc.onerror = function () { /* mantém a logo PNG */ };
      document.head.appendChild(sc);
      customElements.whenDefined('model-viewer').then(build);
    }
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 900); };
    window.addEventListener('load', function () { idle(load, { timeout: 3000 }); }, { once: true });
  })();

  /* ---------- hero: parallax no scroll ---------- */
  if (!reduced && !lite) {
    gsap.to('.hero-video', { yPercent: 12, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-inner', { yPercent: -10, autoAlpha: .15, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'center top', end: 'bottom top', scrub: true } });
  }

  /* ---------- animações de entrada por seção ---------- */
  if (!reduced) {
    // captions: linha desenha + texto entra
    $$('[data-anim="caption"]').forEach(function (el) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%' } });
      tl.fromTo(el, { '--lp': 0 }, { '--lp': 1, duration: 1.3, ease: 'power3.inOut' })
        .from($('.caption-icon', el), { scale: 0, rotate: -180, duration: .8, ease: 'back.out(2)' }, 0)
        .from($('.caption-text', el), { x: -16, autoAlpha: 0, duration: .8, ease: 'power3.out' }, .1)
        .from($('.section-tag', el), { autoAlpha: 0, x: 16, duration: .8, ease: 'power3.out' }, .2);
    });

    // títulos: palavras sobem
    $$('[data-anim="title"]').forEach(function (el) {
      var w = splitWords(el);
      gsap.fromTo(w, { yPercent: 115 }, { yPercent: 0, duration: 1.15, stagger: .06, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // texto grande: palavras acendem conforme a rolagem
    $$('[data-anim="words"]').forEach(function (el) {
      var w = splitWords(el, false);
      gsap.set(w, { opacity: .16 });
      gsap.to(w, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true } });
    });

    // fade-up genérico
    $$('[data-anim="fade-up"]').forEach(function (el) {
      gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // grupos com stagger
    $$('[data-anim="stagger"]').forEach(function (el) {
      gsap.from(el.children, { y: 70, autoAlpha: 0, duration: 1.1, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
  }

  /* ---------- contadores ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count);
    if (reduced) { el.textContent = end; return; }
    var o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: function () { gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } }); }
    });
  });

  /* ---------- timeline ---------- */
  var tline = $('.timeline-line');
  if (tline) {
    if (reduced) { tline.style.transform = 'scaleY(1)'; }
    else gsap.to(tline, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 75%', scrub: true } });
  }

  /* ---------- projetos: cards empilhados ---------- */
  var cards = $$('.project-card');
  if (!reduced) {
    cards.forEach(function (card, i) {
      var inner = $('.project-card-inner', card);
      var img = $('.project-card-image img', card);
      // entrada
      gsap.from(inner, { autoAlpha: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 92%' } });
      gsap.from($('.project-card-left', card).children, { y: 40, autoAlpha: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%' } });
      // parallax da imagem
      if (img && !lite) gsap.fromTo(img, { yPercent: -2.5 }, { yPercent: 2.5, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
      // card anterior recua quando o próximo chega
      // (só em telas maiores, no celular os cards rolam normalmente, sem empilhar)
      var next = cards[i + 1];
      if (next && window.matchMedia('(min-width: 641px)').matches) {
        gsap.to(inner, {
          scale: .92, y: -14, filter: 'brightness(.45)', ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 75%', end: 'top 12%', scrub: true }
        });
      }
    });
  }

  /* ---------- serviços: entram deslizando dos lados ---------- */
  if (!reduced) {
    $$('.service-card').forEach(function (card) {
      var dir = card.dataset.slide === 'left' ? 1 : -1;
      if (lite) { gsap.from(card, { y: 40, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 92%', once: true } }); return; }
      gsap.fromTo(card, { xPercent: dir * 14, autoAlpha: 0 }, {
        xPercent: 0, autoAlpha: 1, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 48%', scrub: .6 }
      });
    });
  }

  /* ---------- barras e donut ---------- */
  $$('.bar-track i').forEach(function (b) {
    var w = b.dataset.w + '%';
    if (reduced) { b.style.width = w; return; }
    gsap.to(b, { width: w, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 94%' } });
  });
  (function donut() {
    var C = 2 * Math.PI * 70;
    $$('.donut-seg').forEach(function (s) {
      var pct = parseFloat(s.dataset.pct), off = parseFloat(s.dataset.offset);
      var len = C * pct / 100;
      s.style.strokeDasharray = len + ' ' + (C - len);
      s.style.strokeDashoffset = -(C * off / 100);
      if (reduced) return;
      gsap.from(s, { strokeDasharray: '0 ' + C, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.donut', start: 'top 85%' } });
    });
  })();

  /* ---------- bento: brilho que segue o mouse ---------- */
  if (!touch) {
    $$('.bento-card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---------- FAQ ---------- */
  $$('.faq-item').forEach(function (item) {
    var btn = $('.faq-q', item), a = $('.faq-a', item);
    if (item.classList.contains('open')) a.style.height = 'auto';
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      $$('.faq-item.open').forEach(function (o) {
        if (o === item) return;
        o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false');
        gsap.to($('.faq-a', o), { height: 0, duration: .6, ease: 'power3.inOut' });
      });
      item.classList.toggle('open', !open); btn.setAttribute('aria-expanded', String(!open));
      gsap.to(a, { height: open ? 0 : 'auto', duration: .6, ease: 'power3.inOut', onComplete: function () { ScrollTrigger.refresh(); } });
    });
  });

  /* ---------- localização: mapa entra com fade ---------- */
  var mapEl = $('#mapWrap');
  if (mapEl && !reduced) {
    gsap.from(mapEl, { autoAlpha: 0, y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: mapEl, start: 'top 90%', once: true } });
  }

  /* ---------- footer: título em palavras ---------- */
  // (usa data-anim="title" acima)

  /* ---------- cursor customizado ---------- */
  if (!touch && $('#cursor')) {
    var cur = $('#cursor'), mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; cur.classList.add('on'); });
    gsap.ticker.add(function () {
      cx += (mx - cx) * .18; cy += (my - cy) * .18;
      cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
    });
    $$('a, button, .project-card, .bento-card, .counter-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('grow'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('grow'); });
    });
  }

  /* ---------- botões "em breve" (sem link) e copiar link ---------- */
  $$('[data-soon]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); });
  });
  var copyBtn = $('#copyLink'), toast = $('#toast'), toastT;
  function showToast(msg) {
    if (!toast) return; toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var url = location.href.split('#')[0];
    function fallback() {
      var t = document.createElement('textarea'); t.value = url; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); showToast(ok ? 'Link copiado!' : 'Não consegui copiar');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(function () { showToast('Link copiado!'); }, fallback);
    else fallback();
  });

  /* ---------- recalcula posições (com debounce) quando algo carrega ---------- */
  var rt;
  function softRefresh() { clearTimeout(rt); rt = setTimeout(function () { if (!document.hidden) ScrollTrigger.refresh(); }, 250); }
  $$('img[loading="lazy"]').forEach(function (img) { if (!img.complete) img.addEventListener('load', softRefresh, { once: true }); });

  /* ---------- recalcula posições depois que tudo carregou ---------- */
  window.addEventListener('load', function () { setTimeout(softRefresh, 300); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) ScrollTrigger.update(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(softRefresh);
})();
