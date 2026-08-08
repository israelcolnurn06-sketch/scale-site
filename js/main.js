// Iscale: shared site behavior. No build step, no frameworks.
(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Scroll-spy nav (highlights Services / Packages / Agency
     while scrolling the one-page layout; only runs on pages that have
     both the sections and the nav links) ---------- */
  var spySections = ['services', 'packages', 'agency']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var spyLinks = document.querySelectorAll('[data-scrollspy] a[data-section]');
  if (spySections.length && spyLinks.length && 'IntersectionObserver' in window) {
    var setActive = function (id) {
      spyLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-section') === id);
      });
    };
    var spyIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    spySections.forEach(function (el) { spyIo.observe(el); });
  }

  /* ---------- Booking widget (visual scheduler + real form delivery) ----------
     No scheduling backend is connected yet (no live calendar availability),
     but submissions are delivered via Web3Forms straight to the inbox tied
     to the access_key in contact.html, so the form is genuinely functional.
     To go live with real availability, swap this block for a Calendly (or
     similar) embed and delete the calendar/time markup it replaces. */
  var calRoot = document.querySelector('[data-booking]');
  if (calRoot) {
    var monthLabel = calRoot.querySelector('[data-cal-month]');
    var grid = calRoot.querySelector('[data-cal-grid]');
    var prevBtn = calRoot.querySelector('[data-cal-prev]');
    var nextBtn = calRoot.querySelector('[data-cal-next]');
    var timeGrid = calRoot.querySelector('[data-time-grid]');
    var selectedDateEl = calRoot.querySelector('[data-selected-date]');
    var selectedTimeEl = calRoot.querySelector('[data-selected-time]');
    var submitBtn = calRoot.querySelector('[data-booking-submit]');
    var statusEl = calRoot.querySelector('[data-form-status]');

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    var selectedDate = null;
    var selectedTime = null;
    var slots = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'];

    function isWeekend(d) { var day = d.getDay(); return day === 0 || day === 6; }

    function renderCalendar() {
      var y = viewDate.getFullYear(), m = viewDate.getMonth();
      monthLabel.textContent = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      grid.innerHTML = '';
      ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(function (d) {
        var el = document.createElement('div');
        el.className = 'dow';
        el.textContent = d;
        grid.appendChild(el);
      });
      var firstDay = new Date(y, m, 1).getDay();
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      for (var i = 0; i < firstDay; i++) {
        grid.appendChild(document.createElement('div'));
      }
      for (var day = 1; day <= daysInMonth; day++) {
        var d = new Date(y, m, day);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal-day';
        btn.textContent = String(day);
        var disabled = d < today || isWeekend(d);
        btn.disabled = disabled;
        btn.setAttribute('aria-pressed', selectedDate && d.getTime() === selectedDate.getTime() ? 'true' : 'false');
        if (!disabled) {
          btn.addEventListener('click', function (dateVal) {
            return function () {
              selectedDate = dateVal;
              selectedTime = null;
              renderCalendar();
              renderTimes();
              updateSummary();
            };
          }(d));
        }
        grid.appendChild(btn);
      }
    }

    function renderTimes() {
      timeGrid.innerHTML = '';
      slots.forEach(function (slot) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.textContent = slot;
        btn.setAttribute('aria-pressed', selectedTime === slot ? 'true' : 'false');
        btn.addEventListener('click', function () {
          selectedTime = slot;
          renderTimes();
          updateSummary();
        });
        timeGrid.appendChild(btn);
      });
    }

    function updateSummary() {
      var ready = selectedDate && selectedTime;
      if (selectedDateEl) {
        selectedDateEl.textContent = selectedDate
          ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
          : 'Not selected yet';
      }
      if (selectedTimeEl) selectedTimeEl.textContent = selectedTime || 'Not selected yet';
      if (submitBtn) submitBtn.disabled = !ready;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      renderCalendar();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      renderCalendar();
    });

    renderCalendar();
    renderTimes();
    updateSummary();

    var form = calRoot.matches('[data-booking-form]') ? calRoot : calRoot.querySelector('[data-booking-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!selectedDate || !selectedTime) return;
        if (form.querySelector('[name="botcheck"]').checked) return; // honeypot tripped

        var name = form.querySelector('[name="name"]').value.trim();
        var email = form.querySelector('[name="email"]').value.trim();
        var notes = form.querySelector('[name="notes"]').value.trim();
        var accessKey = form.querySelector('[name="access_key"]').value.trim();
        var dateStr = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        var payload = {
          access_key: accessKey,
          subject: 'Strategy call request: ' + name + ', ' + dateStr + ' at ' + selectedTime,
          from_name: name,
          email: email,
          requested_date: dateStr,
          requested_time: selectedTime,
          message: notes || '(nothing entered)'
        };

        function showStatus(text) {
          if (!statusEl) return;
          statusEl.textContent = text;
          statusEl.classList.add('is-visible');
        }

        function mailtoFallbackLink() {
          var bodyLines = [
            'Name: ' + name,
            'Email: ' + email,
            'Requested date: ' + dateStr,
            'Requested time: ' + selectedTime,
            '',
            'What they want to discuss:',
            notes || '(nothing entered)'
          ];
          return 'mailto:iscalemarketing@gmail.com'
            + '?subject=' + encodeURIComponent(payload.subject)
            + '&body=' + encodeURIComponent(bodyLines.join('\n'));
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        showStatus('Sending your request...');

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
          .then(function (result) {
            if (result.ok && result.data && result.data.success) {
              showStatus('Request sent for ' + dateStr + ' at ' + selectedTime + '. We\'ll confirm by email shortly.');
              form.reset();
              selectedDate = null;
              selectedTime = null;
              renderCalendar();
              renderTimes();
              updateSummary();
              submitBtn.textContent = 'Schedule Meeting';
            } else {
              throw new Error((result.data && result.data.message) || 'Submission failed');
            }
          })
          .catch(function () {
            statusEl.innerHTML = 'Something went wrong sending that automatically. <a href="' + mailtoFallbackLink() + '">Click here to send it by email instead</a>.';
            statusEl.classList.add('is-visible');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Schedule Meeting';
          });
      });
    }
  }
})();
