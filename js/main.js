/**
 * main.js — Kai & Sharihan's Wedding Site
 *
 * 1. Fade-in animation via IntersectionObserver — adds/removes
 *    .is-visible on .fade-in and .fade-in-children elements so
 *    animations replay every time a section enters the viewport.
 *
 * 2. Scroll hint — hides the bottom-right arrow once the user
 *    has scrolled past the invite section.
 *
 * 3. Page dots — bottom-centre indicator that highlights the
 *    current section. Dots are also clickable for navigation.
 *
 * 4. Typewriter — types the invite intro lines character by
 *    character on first load.
 *
 * Progressive enhancement — the site is fully functional without
 * this file (see <noscript> fallback in index.html).
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. Fade-in via IntersectionObserver
  ---------------------------------------------------------- */
  const FADE_TARGETS = '.fade-in, .fade-in-children';
  const THRESHOLD    = 0.15;

  function initFadeIn() {
    const elements = document.querySelectorAll(FADE_TARGETS);
    if (!elements.length) return;

    // No IntersectionObserver support — make everything visible immediately
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Use .phone-card as the root so intersection is relative to the
    // actual scroll container rather than the viewport (fixes delayed
    // fade-in during scroll-snap on mobile).
    var root = document.querySelector('.phone-card');

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: THRESHOLD, root: root }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ----------------------------------------------------------
     2. Hide scroll hint once invite section leaves the viewport
  ---------------------------------------------------------- */
  function initScrollHint() {
    const hint   = document.querySelector('.scroll-hint');
    const invite = document.getElementById('invite');
    if (!hint || !invite || !('IntersectionObserver' in window)) return;

    var root = document.querySelector('.phone-card');

    const observer = new IntersectionObserver(
      function (entries) {
        // When invite section is no longer intersecting, hide the hint
        hint.classList.toggle('is-hidden', !entries[0].isIntersecting);
      },
      { threshold: 0.1, root: root }
    );

    observer.observe(invite);
  }

  /* ----------------------------------------------------------
     3. Page dots — highlight active section + click-to-navigate
  ---------------------------------------------------------- */
  function initPageDots() {
    var dots     = document.querySelectorAll('.page-dot');
    var sections = document.querySelectorAll('.section');
    var card     = document.querySelector('.phone-card');
    if (!dots.length || !sections.length || !card) return;
    if (!('IntersectionObserver' in window)) return;

    // Map section IDs to their corresponding dot button
    var dotMap = {};
    dots.forEach(function (dot) {
      dotMap[dot.getAttribute('data-target')] = dot;
    });

    // Observe each section — when >50% visible, mark its dot active
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var dot = dotMap[entry.target.id];
          if (!dot) return;
          if (entry.isIntersecting) {
            dots.forEach(function (d) { d.classList.remove('is-active'); });
            dot.classList.add('is-active');
          }
        });
      },
      { root: card, threshold: 0.5 }
    );

    sections.forEach(function (sec) { observer.observe(sec); });

    // Click handler — smooth-scroll to the target section
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = document.getElementById(dot.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ----------------------------------------------------------
     4. Typewriter — type invite intro lines character by character
     ~50ms per character, 400ms pause between lines.
     After typing completes, the venue info fade-in is triggered.
  ---------------------------------------------------------- */
  var CHAR_DELAY    = 50;   // ms between characters
  var LINE_PAUSE    = 400;  // ms pause between lines
  var START_DELAY   = 500;  // ms before first line starts typing

  function initTypewriter() {
    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Gather elements in sequence order
    var elements = Array.prototype.slice.call(
      document.querySelectorAll('[data-typewriter]')
    ).sort(function (a, b) {
      return Number(a.getAttribute('data-typewriter')) - Number(b.getAttribute('data-typewriter'));
    });

    if (!elements.length) return;

    // Store original text, clear elements, mark as ready
    var lines = elements.map(function (el) {
      var text = el.textContent.trim();
      el.textContent = '';
      el.classList.add('typewriter-ready');
      return { el: el, text: text, index: 0 };
    });

    // Type a single line, resolve when done
    function typeLine(line) {
      return new Promise(function (resolve) {
        line.el.classList.remove('typewriter-ready');
        line.el.classList.add('typewriter-typing');

        function typeNext() {
          if (line.index < line.text.length) {
            line.el.textContent += line.text.charAt(line.index);
            line.index++;
            setTimeout(typeNext, CHAR_DELAY);
          } else {
            resolve();
          }
        }
        typeNext();
      });
    }

    // Sequence: wait → type line 1 → pause → type line 2 → show venue info
    function runSequence(i) {
      if (i >= lines.length) {
        // All lines typed — fade in venue info
        var venueInfo = document.querySelector('#invite .invite-bottom');
        if (venueInfo) {
          setTimeout(function () {
            venueInfo.classList.add('is-visible');
          }, 300);
        }
        return;
      }
      typeLine(lines[i]).then(function () {
        setTimeout(function () { runSequence(i + 1); }, LINE_PAUSE);
      });
    }

    setTimeout(function () { runSequence(0); }, START_DELAY);
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFadeIn();
      initScrollHint();
      initPageDots();
      initTypewriter();
    });
  } else {
    initFadeIn();
    initScrollHint();
    initPageDots();
    initTypewriter();
  }

})();
