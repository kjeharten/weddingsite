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
      { threshold: THRESHOLD }
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

    const observer = new IntersectionObserver(
      function (entries) {
        // When invite section is no longer intersecting, hide the hint
        hint.classList.toggle('is-hidden', !entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(invite);
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFadeIn();
      initScrollHint();
    });
  } else {
    initFadeIn();
    initScrollHint();
  }

})();
