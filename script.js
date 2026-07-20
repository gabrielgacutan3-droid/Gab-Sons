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

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
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
