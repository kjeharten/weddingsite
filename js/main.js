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

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFadeIn();
      initScrollHint();
      initPageDots();
    });
  } else {
    initFadeIn();
    initScrollHint();
    initPageDots();
  }

})();
