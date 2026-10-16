/* =========================================================================
   FX : tout ce qui est purement visuel (aucune logique métier / données).
   - ambiance (aurore) qui change selon le chapitre visible
   - parallaxe du héros, en-tête qui se condense, apparitions au scroll
   - neige légère, étoile filante, tap sur le ciel
   - illustrations météo animées (SVG)
   ========================================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Habillage éditorial des jours (présentation seulement) ---------- */
  window.DAY_ART = {
    '2027-01-26': { img: './pont-continents', t: 'Atterrissage', e: 'sur une autre planète', p: 'Le rift entre deux continents, des fumerolles, un tunnel de lave : l’Islande se présente.' },
    '2027-01-27': { img: './skogafoss', t: 'Cascades', e: 'et sable noir', p: 'Des murs d’eau, une arche plantée dans la mer et des colonnes de basalte.' },
    '2027-01-28': { img: './fjadrargljufur', t: 'Canyons', e: 'et mousse de lave', p: 'Un océan de lave pétrifiée, un canyon vertigineux, puis le pied des glaciers.' },
    '2027-01-29': { img: './jokulsarlon', t: 'Les icebergs', e: 'de Jökulsárlón', p: 'Des blocs de glace bleue qui dérivent, des phoques, et la plage des diamants.' },
    '2027-01-30': { img: './ice-cave', t: 'Sous la glace', e: 'un anniversaire à part', p: 'Une cathédrale bleue sous le glacier, puis la route vers l’ouest.' },
    '2027-01-31': { img: './geysir', t: 'Geysers', e: 'et eaux chaudes', p: 'Le Cercle d’Or, une faille entre deux plaques, et des bains fumants à la nuit tombée.' },
    '2027-02-01': { img: './harpa', t: 'Dernier cratère', e: 'premier souvenir', p: 'Kerið, Reykjavík et son port, puis le SUV rendu et une dernière nuit à l’aéroport.' }
  };

  /* ---------- Toast ---------- */
  var toastTimer;
  window.showToast = function (html) {
    var t = $('#toast');
    if (!t) return;
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  };

  /* ---------- En-tête condensé + parallaxe (une seule boucle rAF) ---------- */
  var topbar = $('#topbar');
  var hero = $('#hero');
  var heroParts = hero ? $$('[data-depth]', hero) : [];
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (topbar) topbar.classList.toggle('scrolled', y > 40);
      document.body.classList.toggle('scrolled', y > 90);
      if (hero && !reduce && y < window.innerHeight * 1.2) {
        for (var i = 0; i < heroParts.length; i++) {
          var d = parseFloat(heroParts[i].dataset.depth) || 0;
          heroParts[i].style.transform = 'translate3d(0,' + (y * d).toFixed(1) + 'px,0)';
        }
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Apparitions au scroll (y compris pour le contenu injecté en JS) ---------- */
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }) : null;

  function scanReveals() {
    $$('.reveal:not([data-r])').forEach(function (el) {
      el.setAttribute('data-r', '1');
      if (revealIO) revealIO.observe(el); else el.classList.add('in');
    });
  }
  var scanTimer;
  new MutationObserver(function () {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scanReveals, 30);
  }).observe(document.body, { childList: true, subtree: true });
  scanReveals();

  /* ---------- Ambiance : l'aurore change de couleur selon le chapitre ---------- */
  if ('IntersectionObserver' in window) {
    var moodIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) document.body.dataset.mood = e.target.dataset.mood;
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-mood]').forEach(function (el) { moodIO.observe(el); });
  }

  /* ---------- Neige douce (canvas fixe, très léger) ---------- */
  (function snow() {
    var c = $('#snow');
    if (!c || reduce) return;
    var ctx = c.getContext('2d');
    var W, H, flakes = [], N = window.innerWidth < 600 ? 46 : 90, running = true;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = c.width = window.innerWidth * dpr;
      H = c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + 'px';
      c.style.height = window.innerHeight + 'px';
    }
    size();
    window.addEventListener('resize', size);
    for (var i = 0; i < N; i++) {
      flakes.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.8 + 0.6,
        v: Math.random() * 0.00035 + 0.00012,
        s: Math.random() * Math.PI * 2,
        a: Math.random() * 0.5 + 0.25
      });
    }
    var t = 0;
    function frame() {
      if (!running) return;
      t += 0.01;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.v * 16;
        f.x += Math.sin(t + f.s) * 0.0004;
        if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(235,247,255,' + f.a + ')';
        ctx.arc(f.x * W, f.y * H, f.r * (W / window.innerWidth), 0, 6.283);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) frame();
    });
  })();

  /* ---------- Étoile filante ---------- */
  (function shooting() {
    var s = $('#shootingStar');
    if (!s || reduce) return;
    function go() {
      s.style.top = (6 + Math.random() * 30) + '%';
      s.style.left = (30 + Math.random() * 60) + '%';
      s.classList.remove('go');
      void s.offsetWidth;
      s.classList.add('go');
      setTimeout(go, 9000 + Math.random() * 9000);
    }
    setTimeout(go, 2500);
  })();

  /* ---------- Toucher le ciel : l'aurore s'embrase ---------- */
  var phrases = [
    '<b>Kp 7</b> · le ciel s’embrase',
    '<b>Gleðilegt ferðalag !</b> · bon voyage',
    '<b>Þetta reddast</b> · ça finira par s’arranger',
    '<b>Norðurljós</b> · les lumières du nord',
    '<b>Skál !</b> · à nous deux'
  ];
  var pi = 0;
  var sky = $('#hero');
  if (sky) {
    sky.addEventListener('click', function (e) {
      if (e.target.closest('a,button,select,input')) return;
      document.body.classList.add('aurora-burst');
      clearTimeout(window.__burstT);
      window.__burstT = setTimeout(function () { document.body.classList.remove('aurora-burst'); }, 3200);
      if (navigator.vibrate) navigator.vibrate(12);
      window.showToast(phrases[pi++ % phrases.length]);
    });
  }

  /* ---------- Tiroirs : chaque chapitre se plie / se déplie ---------- */
  var chapters = $$('.chapter');
  var drawerState = {};
  try { drawerState = JSON.parse(localStorage.getItem('islande-drawers') || '{}'); } catch (e) {}
  function saveDrawers() { try { localStorage.setItem('islande-drawers', JSON.stringify(drawerState)); } catch (e) {} }
  var CHEV = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var ANIM = reduce ? 0 : 520;

  function hasContent(nodes) {
    return nodes.some(function (n) { return n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()); });
  }

  function buildDrawer(sec) {
    var head = $('.chap-head', sec);
    if (!head || !sec.id) return;
    var wrap = head.parentElement;
    var drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = sec.id + '-drawer';
    var inner = document.createElement('div');
    inner.className = 'drawer-in';
    drawer.appendChild(inner);

    // 1) ce qui suit le titre, dans le même bloc
    var rest = [], n = head.nextSibling;
    while (n) { rest.push(n); n = n.nextSibling; }
    if (hasContent(rest)) {
      var w2 = document.createElement('div');
      w2.className = wrap.className;
      rest.forEach(function (x) { w2.appendChild(x); });
      inner.appendChild(w2);
    }
    // 2) ce qui suit ce bloc dans la section (liste des jours, cartes, etc.)
    var after = [];
    n = wrap.nextSibling;
    while (n) { after.push(n); n = n.nextSibling; }
    after.forEach(function (x) { inner.appendChild(x); });
    sec.appendChild(drawer);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'drawer-toggle';
    btn.setAttribute('aria-controls', drawer.id);
    btn.innerHTML = '<span class="dt-label"></span>' + CHEV;
    head.appendChild(btn);
    head.classList.add('drawer-head');
    head.addEventListener('click', function (e) {
      if (e.target.closest('a,input,select,textarea')) return;
      setOpen(sec, !sec.classList.contains('open'));
    });
    sec._btn = btn; sec._drawer = drawer; sec._head = head;
    syncAria(sec);
  }

  function syncAria(sec) {
    var open = sec.classList.contains('open');
    if (!sec._btn) return;
    sec._btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    sec._btn.querySelector('.dt-label').textContent = open ? 'Replier' : 'Déplier';
    if ('inert' in sec._drawer) sec._drawer.inert = !open;
  }

  function setOpen(sec, open, instant) {
    if (!sec._drawer || open === sec.classList.contains('open')) return 0;
    clearTimeout(sec._t);
    if (open) {
      sec.classList.add('open');
      if (instant || !ANIM) { sec.classList.add('settled'); }
      else {
        sec._t = setTimeout(function () {
          sec.classList.add('settled');
          window.dispatchEvent(new Event('resize')); // la carte se recalcule
        }, ANIM);
      }
    } else {
      var top = sec._head.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: window.scrollY + top - 70, behavior: 'auto' });
      sec.classList.remove('settled');
      void sec.offsetHeight;
      sec.classList.remove('open');
    }
    drawerState[sec.id] = open ? 1 : 0;
    saveDrawers();
    syncAria(sec);
    syncAll();
    return instant ? 0 : ANIM;
  }

  // Ouvre le chapitre qui contient l'élément demandé (par son id) ; renvoie le délai à attendre avant de scroller
  window.openChapter = function (id) {
    var el = document.getElementById(id);
    var sec = el && el.closest('.chapter');
    if (!sec || sec.classList.contains('open')) return 0;
    return setOpen(sec, true);
  };

  chapters.forEach(buildDrawer);
  chapters.forEach(function (sec) { if (drawerState[sec.id]) { sec.classList.add('open', 'settled'); syncAria(sec); } });

  // Bouton "Tout déplier / Tout replier"
  var allBtn = null;
  function syncAll() {
    if (!allBtn) return;
    var all = chapters.every(function (s) { return s.classList.contains('open'); });
    allBtn.textContent = all ? 'Tout replier' : 'Tout déplier';
    allBtn._all = all;
  }
  if (chapters[0]) {
    var bar = document.createElement('div');
    bar.className = 'wrap drawer-all';
    allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'drawer-toggle';
    bar.appendChild(allBtn);
    chapters[0].parentNode.insertBefore(bar, chapters[0]);
    allBtn.addEventListener('click', function () {
      var target = !allBtn._all;
      chapters.forEach(function (s) { setOpen(s, target); });
    });
    syncAll();
  }

  // Lien direct (#day-…) : on ouvre le bon tiroir au chargement
  if (location.hash.length > 1) window.openChapter(decodeURIComponent(location.hash.slice(1)));

  /* ---------- Menu : défilement doux vers le chapitre (ouvre le tiroir si besoin) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id && document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var wait = window.openChapter(id);
    setTimeout(function () {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, wait);
  });

  /* ---------- Illustrations météo animées ---------- */
  var CLOUD = 'M22 58c-9 0-14-6-14-13 0-6 4-11 10-12 1-10 9-16 18-16 8 0 14 4 17 10 1-.3 3-.5 4-.5 8 0 13 6 13 13s-5 14-13 14z';
  var cloud = function (cls, fill) {
    return '<path class="' + cls + '" d="' + CLOUD + '" fill="url(#' + (fill || 'gCloud') + ')"/>';
  };
  var sunCore = function (x, y, s) {
    var rays = '';
    for (var i = 0; i < 8; i++) {
      rays += '<line x1="40" y1="6" x2="40" y2="14" transform="rotate(' + i * 45 + ' 40 40)"/>';
    }
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<g class="w-rays" stroke="#ffd27a" stroke-width="3" stroke-linecap="round">' + rays + '</g>' +
      '<circle class="w-sun" cx="40" cy="40" r="15" fill="url(#gSun)"/></g>';
  };
  var ART = {
    sun: sunCore(0, 0, 1),
    partly: sunCore(-8, -8, .78) + '<g class="w-drift">' + cloud('', 'gCloud') + '</g>',
    cloud: '<g class="w-drift2" opacity=".55" transform="translate(-4 -8) scale(.8)">' + cloud('', 'gCloudDark') + '</g>' +
      '<g class="w-drift">' + cloud('', 'gCloud') + '</g>',
    fog: '<g class="w-drift2" opacity=".9">' + cloud('', 'gCloudDark') + '</g>' +
      '<g stroke="#cfe4f2" stroke-width="3.2" stroke-linecap="round" opacity=".85">' +
      '<line class="w-fog a" x1="14" y1="62" x2="56" y2="62"/><line class="w-fog b" x1="24" y1="70" x2="68" y2="70"/></g>',
    rain: '<g class="w-drift2">' + cloud('', 'gCloudDark') + '</g>' +
      '<g stroke="#7cc7ff" stroke-width="3" stroke-linecap="round">' +
      '<line class="w-drop d1" x1="26" y1="62" x2="23" y2="70"/><line class="w-drop d2" x1="40" y1="62" x2="37" y2="70"/>' +
      '<line class="w-drop d3" x1="54" y1="62" x2="51" y2="70"/></g>',
    snow: '<g class="w-drift2">' + cloud('', 'gCloud') + '</g>' +
      '<g fill="#fff"><circle class="w-flake f1" cx="26" cy="64" r="2.6"/><circle class="w-flake f2" cx="40" cy="64" r="2.2"/>' +
      '<circle class="w-flake f3" cx="54" cy="64" r="2.8"/><circle class="w-flake f4" cx="33" cy="64" r="1.8"/></g>',
    storm: '<g class="w-drift2">' + cloud('', 'gCloudDark') + '</g>' +
      '<polygon class="w-bolt" points="42,56 32,72 40,72 36,84 52,64 43,64 48,56" fill="#ffe14d"/>'
  };
  window.getWeatherKind = function (code) {
    if (code === 0) return 'sun';
    if (code === 1 || code === 2) return 'partly';
    if (code === 3) return 'cloud';
    if (code === 45 || code === 48) return 'fog';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].indexOf(code) > -1) return 'rain';
    if ([71, 73, 75, 77, 85, 86].indexOf(code) > -1) return 'snow';
    if ([95, 96, 99].indexOf(code) > -1) return 'storm';
    return 'partly';
  };
  window.weatherArt = function (kind) {
    return '<svg class="w-art" viewBox="0 0 80 80" aria-hidden="true">' + (ART[kind] || ART.partly) + '</svg>';
  };
})();
