/* Gab & Sons — site interactions */
(function () {
  'use strict';

  /* ---------- Nav: scrolled state ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Nav: mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Hero entrance safety net ---------- */
  setTimeout(function () {
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('hero-done');
  }, 2600);

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  // Staggered cascade: each .reveal inside a .stagger container gets an
  // incremental delay so rows/grids animate in sequence rather than at once.
  document.querySelectorAll('.stagger').forEach(function (group) {
    var items = group.querySelectorAll('.reveal');
    items.forEach(function (el, i) {
      el.style.setProperty('--stagger-delay', Math.min(i, 5) * 90 + 'ms');
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    // Safety net: if the observer never fires (older browsers,
    // embedded webviews), reveal anything already on screen.
    setTimeout(function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      });
    }, 700);
    window.addEventListener('scroll', function fallbackReveal() {
      revealEls.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight - 40) el.classList.add('in');
      });
    }, { passive: true });
  }

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.getElementById('scrollProgress');
  var progressTicking = false;
  function updateProgress() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
    progressTicking = false;
  }
  if (progressBar) {
    updateProgress();
    window.addEventListener('scroll', function () {
      if (!progressTicking) {
        requestAnimationFrame(updateProgress);
        progressTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* ---------- Count-up stats ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var counters = document.querySelectorAll('.count');
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countIo.unobserve(entry.target);
        var el = entry.target;
        var match = el.textContent.match(/^(\D*)(\d+)(\D*)$/);
        if (!match) return; // not a simple prefix+number+suffix value (e.g. "24/7")
        var prefix = match[1], target = parseInt(match[2], 10), suffix = match[3];
        var start = performance.now();
        var duration = 1100;
        function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          el.textContent = prefix + Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIo.observe(el); });
  }

  /* ---------- Hero parallax ---------- */
  var heroBg = document.querySelector('.hero-bg');
  var heroSection = document.querySelector('.hero');
  if (heroBg && heroSection && !reduceMotion) {
    var parallaxTicking = false;
    function updateParallax() {
      var r = heroSection.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var shift = Math.max(-30, Math.min(30, window.scrollY * 0.12));
        heroBg.style.transform = 'translateY(' + shift + 'px)';
      }
      parallaxTicking = false;
    }
    updateParallax();
    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  /* ---------- Nav: highlight section in view ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sectionMap = navAnchors.reduce(function (map, a) {
    var id = a.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) map.push({ id: id, link: a, section: section });
    return map;
  }, []);
  if (sectionMap.length && 'IntersectionObserver' in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sectionMap.filter(function (m) { return m.section === entry.target; })[0];
        if (!match) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.classList.remove('active'); });
          match.link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sectionMap.forEach(function (m) { navIo.observe(m.section); });
  }

  /* ---------- Booking widget ---------- */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  var TIMES = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  var monthSel = document.getElementById('bkMonth');
  var daysWrap = document.getElementById('bkDays');
  var timesWrap = document.getElementById('bkTimes');
  var summary = document.getElementById('bkSummary');
  var form = document.getElementById('bookingForm');

  var now = new Date();
  var picked = { year: null, month: null, day: null, time: null };

  // Month options: current month + next 5
  for (var i = 0; i < 6; i++) {
    var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    var opt = document.createElement('option');
    opt.value = d.getFullYear() + '-' + d.getMonth();
    opt.textContent = MONTHS[d.getMonth()] + ' ' + d.getFullYear();
    monthSel.appendChild(opt);
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function renderDays() {
    var parts = monthSel.value.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    picked.year = year;
    picked.month = month;
    picked.day = null;
    daysWrap.innerHTML = '';
    var total = daysInMonth(year, month);
    var startDay = (year === now.getFullYear() && month === now.getMonth()) ? now.getDate() + 1 : 1;
    for (var day = startDay; day <= total; day++) {
      var date = new Date(year, month, day);
      if (date.getDay() === 0) continue; // closed Sundays
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', 'false');
      b.textContent = String(day);
      b.dataset.day = String(day);
      daysWrap.appendChild(b);
    }
    updateSummary();
  }

  function renderTimes() {
    timesWrap.innerHTML = '';
    TIMES.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', 'false');
      b.textContent = t;
      b.dataset.time = t;
      timesWrap.appendChild(b);
    });
  }

  function selectIn(wrap, target) {
    wrap.querySelectorAll('.slot').forEach(function (s) {
      s.setAttribute('aria-selected', 'false');
    });
    target.setAttribute('aria-selected', 'true');
  }

  daysWrap.addEventListener('click', function (e) {
    var b = e.target.closest('.slot');
    if (!b) return;
    selectIn(daysWrap, b);
    picked.day = parseInt(b.dataset.day, 10);
    updateSummary();
  });

  timesWrap.addEventListener('click', function (e) {
    var b = e.target.closest('.slot');
    if (!b) return;
    selectIn(timesWrap, b);
    picked.time = b.dataset.time;
    updateSummary();
  });

  monthSel.addEventListener('change', renderDays);

  function slotText() {
    if (picked.day === null || !picked.time) return null;
    return MONTHS[picked.month] + ' ' + picked.day + ', ' + picked.year + ' at ' + picked.time;
  }

  function updateSummary() {
    var t = slotText();
    summary.textContent = t
      ? 'Your 20-minute call: ' + t
      : 'Select a month, day, and time above.';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = slotText();
    if (!t) {
      summary.textContent = 'Please pick a day and a time first.';
      return;
    }
    var name = document.getElementById('bkName').value.trim();
    var biz = document.getElementById('bkBiz').value.trim();
    var email = document.getElementById('bkEmail').value.trim();
    var subject = 'Booking request — 20-minute call (' + t + ')';
    var body =
      'Hello Gab & Sons,\n\n' +
      'I would like to book a 20-minute call.\n\n' +
      'Preferred slot: ' + t + '\n' +
      'Name: ' + name + '\n' +
      (biz ? 'Business: ' + biz + '\n' : '') +
      'Email: ' + email + '\n\n' +
      'Talk soon!';
    window.location.href = 'mailto:gabsonswebdevelopment@gmail.com' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    summary.textContent = 'Request ready — sending via your email app. Slot: ' + t;
  });

  renderDays();
  renderTimes();

  /* ---------- Newsletter (mailto handoff) ---------- */
  var newsForm = document.getElementById('newsForm');
  var newsMsg = document.getElementById('newsMsg');
  newsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('newsEmail').value.trim();
    window.location.href = 'mailto:gabsonswebdevelopment@gmail.com' +
      '?subject=' + encodeURIComponent('Newsletter signup') +
      '&body=' + encodeURIComponent('Please add me to the Gab & Sons newsletter: ' + email);
    newsMsg.textContent = 'Thank you — confirm in your email app.';
  });

  /* ---------- Year ---------- */
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
