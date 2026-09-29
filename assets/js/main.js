/* Site behaviour: nav toggle, theme toggle, lightbox, filters, current year. No dependencies. */
(function () {
  // ----- Theme toggle (remembers choice in localStorage; falls back to OS preference) -----
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) {}
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ----- Mobile nav -----
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) { if (e.target.tagName === 'A') links.classList.remove('open'); });
  }

  // ----- Highlight current page in nav -----
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) a.setAttribute('aria-current', 'page');
  });

  // ----- Lightbox for any <img data-lightbox> (grouped by data-lightbox value) -----
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="icon-btn close" aria-label="Close">&#10005;</button>' +
    '<button class="icon-btn prev" aria-label="Previous">&#8249;</button>' +
    '<img alt="">' +
    '<button class="icon-btn next" aria-label="Next">&#8250;</button>' +
    '<div class="cap"></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.cap');
  var group = [], idx = 0;

  function show(i) {
    idx = (i + group.length) % group.length;
    var el = group[idx];
    lbImg.src = el.getAttribute('data-full') || el.src;
    lbImg.alt = el.alt || '';
    var cap = el.getAttribute('data-caption');
    if (!cap) {
      var fc = el.closest('figure') && el.closest('figure').querySelector('figcaption');
      cap = fc ? fc.textContent : (el.alt || '');
    }
    lbCap.textContent = cap;
    lb.querySelector('.prev').style.display = lb.querySelector('.next').style.display = group.length > 1 ? '' : 'none';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; }

  document.addEventListener('click', function (e) {
    var img = e.target.closest('img[data-lightbox]');
    if (!img) return;
    var key = img.getAttribute('data-lightbox');
    group = Array.prototype.slice.call(document.querySelectorAll('img[data-lightbox="' + key + '"]'))
      .filter(function (el) { return !el.closest('[data-hidden="true"]'); });
    show(group.indexOf(img));
  });
  lb.querySelector('.close').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // ----- Tag filters: <div class="filters"><button data-filter="all|tag">…  items carry data-tags="a b c" -----
  document.querySelectorAll('.filters').forEach(function (bar) {
    var scope = bar.getAttribute('data-scope');
    var items = document.querySelectorAll(scope ? scope + ' [data-tags]' : '[data-tags]');
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filter]');
      if (!b) return;
      bar.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      var f = b.getAttribute('data-filter');
      items.forEach(function (it) {
        var tags = (it.getAttribute('data-tags') || '').split(/\s+/);
        it.setAttribute('data-hidden', (f === 'all' || tags.indexOf(f) !== -1) ? 'false' : 'true');
      });
    });
  });

  // ----- Auto-advancing slideshow: <div class="slider" data-interval="4500"> <div class="slides"> <figure class="slide">… -----
  document.querySelectorAll('.slider').forEach(function (sl) {
    var slides = sl.querySelectorAll('.slide');
    if (slides.length < 2) { if (slides[0]) slides[0].classList.add('active'); return; }
    var i = 0, timer = null, interval = parseInt(sl.getAttribute('data-interval') || '4500', 10);
    var dots = document.createElement('div'); dots.className = 'dots';
    var count = document.createElement('span'); count.className = 'count';
    slides.forEach(function (_, k) {
      var b = document.createElement('button'); b.setAttribute('aria-label', 'Slide ' + (k + 1));
      b.addEventListener('click', function () { go(k); restart(); }); dots.appendChild(b);
    });
    var prev = document.createElement('button'); prev.className = 'ctrl prev'; prev.innerHTML = '&#8249;'; prev.setAttribute('aria-label', 'Previous figure');
    var next = document.createElement('button'); next.className = 'ctrl next'; next.innerHTML = '&#8250;'; next.setAttribute('aria-label', 'Next figure');
    prev.addEventListener('click', function () { go(i - 1); restart(); });
    next.addEventListener('click', function () { go(i + 1); restart(); });
    sl.appendChild(prev); sl.appendChild(next); sl.appendChild(dots); sl.appendChild(count);
    function go(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle('active', j === i); });
      dots.querySelectorAll('button').forEach(function (b, j) { b.classList.toggle('active', j === i); });
      count.textContent = (i + 1) + ' / ' + slides.length;
    }
    function start() { if (!timer) timer = setInterval(function () { go(i + 1); }, interval); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }
    sl.addEventListener('mouseenter', stop);
    sl.addEventListener('mouseleave', start);
    go(0);
    if (!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) start();
    // Pause when the lightbox is open (user is inspecting a figure)
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') start(); });
  });

  // ----- Footer year -----
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
