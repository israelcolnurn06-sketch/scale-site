/* iScale Marketing premium site. Dependency-free. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Nav state + scroll progress ---------- */
  var nav = document.querySelector('[data-nav]');
  var bar = document.querySelector('[data-progress]');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 24);
    lastY = y;
    var max = doc.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal, [data-split]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  }

  /* ---------- Live clock in the hero (real local time) ---------- */
  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var tick = function () {
      var d = new Date(), h = d.getHours(), m = d.getMinutes();
      clock.textContent = ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM');
    };
    tick(); setInterval(tick, 15000);
  }

  /* ---------- Spotlit particle fields (hero + marked sections) ---------- */
  var MX = -1, MY = -1;
  if (fine) window.addEventListener('pointermove', function (e) { MX = e.clientX; MY = e.clientY; }, { passive: true });
  function makeField(cv, isHero) {
    var ctx = cv.getContext('2d'), host = cv.parentElement;
    var W, H, DPR, t = Math.random() * 10, lx = 0.62, ly = 0.45, mx = 0.62, my = 0.45, inside = false, scrollK = 0, visible = true, rect = null;
    var N = isHero ? 260 : 190, P = [];
    for (var i = 0; i < N; i++) P.push({ x: Math.random(), y: Math.random(), vx: 0, vy: 0, ox: Math.random(), oy: Math.random() });
    function size() { DPR = Math.min(window.devicePixelRatio || 1, 2); W = host.clientWidth || window.innerWidth; H = host.clientHeight || window.innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); rect = null; }
    size(); window.addEventListener('resize', size); window.addEventListener('load', size);
    if (!fine) setInterval(function () { lx = 0.3 + Math.random() * 0.5; ly = 0.25 + Math.random() * 0.5; }, 2600);
    window.addEventListener('scroll', function () { rect = null; if (isHero) scrollK = Math.min(1, window.scrollY / (window.innerHeight * 0.9)); }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(host);
    function frame() {
      if (!visible) { requestAnimationFrame(frame); return; }
      if (fine && MX >= 0) { if (!rect) rect = host.getBoundingClientRect(); lx = (MX - rect.left) / rect.width; ly = (MY - rect.top) / rect.height; inside = ly >= -0.2 && ly <= 1.2; }
      t += 0.012; mx += (lx - mx) * 0.08; my += (ly - my) * 0.08;
      ctx.clearRect(0, 0, W, H);
      var fade = isHero ? 1 - scrollK * 0.8 : 0.85, cx = mx * W, cy = my * H;
      P.forEach(function (p) {
        var px = p.x * W, py = p.y * H, dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1;
        var push = (inside || !fine) ? Math.max(0, 120 - d) / 120 : 0;
        p.vx += (dx / d) * push * 0.8 + (p.ox - p.x) * 0.9; p.vy += (dy / d) * push * 0.8 + (p.oy - p.y) * 0.9;
        p.vx *= 0.9; p.vy *= 0.9;
        p.x += p.vx / W * 4 + Math.sin(t + p.oy * 9) * 0.0003; p.y += p.vy / H * 4 + Math.cos(t + p.ox * 9) * 0.0003;
      });
      ctx.lineWidth = 1;
      for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
        var a = P[i], b = P[j], ddx = (a.x - b.x) * W, ddy = (a.y - b.y) * H, d2 = ddx * ddx + ddy * ddy;
        if (d2 < 80 * 80) {
          var qx = (a.x + b.x) / 2 * W, qy = (a.y + b.y) / 2 * H, lit = Math.max(0.05, 1 - Math.hypot(qx - cx, qy - cy) / 380);
          ctx.strokeStyle = 'rgba(226,180,90,' + (lit * 0.26 * (1 - d2 / 6400) * fade).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke();
        }
      }
      P.forEach(function (p) {
        var lit = Math.max(0.1, 1 - Math.hypot(p.x * W - cx, p.y * H - cy) / 380);
        ctx.fillStyle = 'rgba(245,210,130,' + (lit * 0.75 * fade).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 1 + lit * 1.4, 0, 7); ctx.fill();
      });
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 380);
      g.addColorStop(0, 'rgba(226,180,90,' + (0.16 * fade).toFixed(2) + ')'); g.addColorStop(0.4, 'rgba(226,180,90,' + (0.05 * fade).toFixed(2) + ')'); g.addColorStop(1, 'rgba(226,180,90,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) {
    var heroCv = document.querySelector('[data-signal]'); if (heroCv) makeField(heroCv, true);
    document.querySelectorAll('[data-field]').forEach(function (cv) { makeField(cv, false); });
  }

  /* ---------- Transcript: lines type in when visible ---------- */
  var tr = document.querySelector('[data-transcript]');
  if (tr && 'IntersectionObserver' in window) {
    var lines = Array.prototype.slice.call(tr.children);
    lines.forEach(function (l) { l.classList.add('is-wait'); });
    var tio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      tio.disconnect();
      lines.forEach(function (l, i) { setTimeout(function () { l.classList.remove('is-wait'); l.classList.add('is-in'); }, reduce ? 0 : 500 + i * 900); });
    }, { threshold: 0.4 });
    tio.observe(tr);
  }

  /* ---------- One call: sticky phone follows the active step ---------- */
  var steps = document.querySelectorAll('[data-step]');
  var cTime = document.querySelector('[data-call-time]'), cState = document.querySelector('[data-call-state]'), cSub = document.querySelector('[data-call-sub]');
  var phone = document.querySelector('.phone');
  if (steps.length && 'IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        steps.forEach(function (s) { s.classList.remove('is-active'); });
        en.target.classList.add('is-active');
        cTime.textContent = en.target.getAttribute('data-time');
        cState.textContent = en.target.getAttribute('data-state');
        cSub.innerHTML = en.target.getAttribute('data-sub');
        phone.setAttribute('data-stage', Array.prototype.indexOf.call(steps, en.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach(function (s) { sio.observe(s); });
  }

  /* ---------- Magnetic buttons (desktop only, subtle) ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px,' + (dy * 8).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('[data-menu]'), menuEl = document.getElementById('mmenu');
  if (menuBtn && menuEl) {
    var closeMenu = function () { menuBtn.setAttribute('aria-expanded', 'false'); menuEl.hidden = true; doc.classList.remove('menu-open'); };
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      menuBtn.setAttribute('aria-expanded', String(open)); menuEl.hidden = !open; doc.classList.toggle('menu-open', open);
    });
    menuEl.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) closeMenu(); });
  }
})();
