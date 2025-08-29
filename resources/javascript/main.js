document.addEventListener('DOMContentLoaded', () => {
  /* ---------------------------------
   * 1) Footer year
   * --------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ---------------------------------
 * 2) Accessible nav toggle (resilient)
 *    - finds button by #navToggle or .nav-toggle
 *    - creates scrim if missing
 * --------------------------------- */
(function () {
  var body   = document.body;
  var toggle = document.getElementById('navToggle') || document.querySelector('.nav-toggle');
  var menu   = document.getElementById('primary-nav');
  if (!toggle || !menu) return;

  // Ensure we have a scrim; create one if missing
  var scrim = document.getElementById('scrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.id = 'scrim';
    scrim.className = 'scrim';
    scrim.hidden = true;
    // place right after the header if possible, else append to body
    var header = document.querySelector('.site-header');
    (header && header.parentNode ? header.parentNode.insertBefore(scrim, header.nextSibling) : body.appendChild(scrim));
  }

  // Initial state
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  menu.hidden  = true;
  scrim.hidden = true;

  function openMenu() {
    body.classList.add('nav-open', 'no-scroll');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    menu.hidden  = false;
    scrim.hidden = false;
    var first = menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu() {
    body.classList.remove('nav-open', 'no-scroll');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.hidden  = true;
    scrim.hidden = true;
    if (document.activeElement && menu.contains(document.activeElement)) {
      toggle.focus({ preventScroll: true });
    }
  }

  function isOpen() { return body.classList.contains('nav-open'); }

  // Toggle
  toggle.addEventListener('click', function () {
    isOpen() ? closeMenu() : openMenu();
  }, { passive: true });

  // Scrim closes
  scrim.addEventListener('click', closeMenu);

  // Close on any menu link click
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) closeMenu();
  });

  // ESC closes
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  // Debug helper (comment out when done)
  // console.log('Nav ready:', {toggle, menu, scrim});
})();

  /* ---------------------------------
   * 3) Newsletter quick validation
   * --------------------------------- */
  var form = document.getElementById('newsletter-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      var email = form.querySelector('#email');
      if (!email || !email.checkValidity()) {
        e.preventDefault();
        status.textContent = 'Please enter a valid email address.';
        status.style.color = '#ffd9b0';
        if (email) email.focus();
      } else {
        status.textContent = 'Thanks! Submitting…';
        status.style.color = '#fff';
      }
    });
  }

  /* ---------------------------------
   * 4) Universal Lightbox
   *    Works for:
   *     - <a class="lightbox-trigger" href="full.jpg"><img ...></a>
   *     - Any .two-col img (Get Involved)
   *     - Any .image-grid a (Wildlife galleries)
   * --------------------------------- */

  // Build a list of clickable targets
  var lbTargets = Array.prototype.slice.call(
    document.querySelectorAll(
      '.lightbox-trigger, .two-col img, .image-grid a'
    )
  );

  if (!lbTargets.length) return; // nothing to do on this page

  // Reuse overlay if present; otherwise create one
  var overlay = document.getElementById('lightbox-overlay');
  var overlayImg = overlay ? overlay.querySelector('img') : null;
  var closeBtn = overlay ? overlay.querySelector('.close-btn') : null;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="close-btn" aria-label="Close image view">✕ Close</button>' +
      '<img src="" alt="">';
    document.body.appendChild(overlay);
    overlayImg = overlay.querySelector('img');
    closeBtn = overlay.querySelector('.close-btn');
  }

  if (!overlay || !overlayImg || !closeBtn) return;

  var lastFocus = null;

  function openLightbox(src, alt) {
    if (!src) return;
    lastFocus = document.activeElement;
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.style.display = 'flex';
    overlay.setAttribute('data-open', 'true');
    document.documentElement.style.overflow = 'hidden'; // lock scroll
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.style.display = 'none';
    overlay.removeAttribute('data-open');
    overlayImg.src = '';
    document.documentElement.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  // Click handlers (works for links and plain imgs)
  lbTargets.forEach(function (el) {
    // Skip if explicitly disabled
    if (el.hasAttribute('data-no-lightbox')) return;

    el.addEventListener('click', function (e) {
      var tag = el.tagName.toLowerCase();
      var src = '';
      var alt = '';

      if (tag === 'a') {
        e.preventDefault();
        var imgIn = el.querySelector('img');
        src = el.getAttribute('href');
        alt = (imgIn && imgIn.alt) || el.getAttribute('aria-label') || 'Image';
      } else if (tag === 'img') {
        src = el.getAttribute('src');
        alt = el.getAttribute('alt') || 'Image';
      }
      openLightbox(src, alt);
    });
  });

  // Close interactions
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') {
      closeLightbox();
    }
  });
});

// Sticky header shadow on scroll
var header = document.querySelector('.site-header');
if (header){
  var last = 0;
  var tick = false;
  var onScroll = function(){
    var y = window.scrollY || window.pageYOffset;
    if ((y > 8) !== (last > 8)) header.classList.toggle('is-scrolled', y > 8);
    last = y;
    tick = false;
  };
  window.addEventListener('scroll', function(){
    if (!tick){ tick = true; requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();
}

// --- Scrollspy for local subnav on the History page ---
document.addEventListener('DOMContentLoaded', () => {
  const subnav = document.querySelector('.subnav');
  if (!subnav) return;

  const links = Array.from(subnav.querySelectorAll('.subnav__link'));
  const targets = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  // Clear all active states
  const setActive = (id) => {
    links.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === `#${id}` ? 'true' : 'false'));
  };

  // Use IntersectionObserver to detect current section
  const observer = new IntersectionObserver((entries) => {
    // Choose the entry closest to the top
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (visible) setActive(visible.target.id);
  }, {
    rootMargin: '-35% 0px -55% 0px', // middle-ish of the viewport
    threshold: 0.01
  });

  targets.forEach(sec => observer.observe(sec));

  // Smooth scroll for subnav clicks (native in most browsers, but enforce)
  subnav.addEventListener('click', (e) => {
    const a = e.target.closest('a.subnav__link');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(target.id);
    history.replaceState(null, '', a.getAttribute('href'));
  });
});