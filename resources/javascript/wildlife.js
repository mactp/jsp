// resources/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------
   * 1) Footer year
   * ------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------
   * 2) Accessible nav toggle
   * ------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('primary-nav');

  if (toggle && menu) {
    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) closeMenu();
    });
  }

  /* ------------------------------
   * 3) Newsletter quick validation
   * ------------------------------ */
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

  /* ------------------------------
   * 4) Unified Lightbox
   *    Works for:
   *    a) <a class="lightbox-trigger" href="full.jpg"><img …></a>
   *    b) Any .two-col img (click to open)
   * ------------------------------ */

  // Reuse overlay if present; otherwise create one.
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

  // If key pieces aren’t available, bail without errors.
  if (!overlay || !overlayImg || !closeBtn) return;

  function openLightbox(src, alt) {
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
  }

  closeBtn.addEventListener('click', closeLightbox);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') {
      closeLightbox();
    }
  });

  // a) Links with .lightbox-trigger
  var lbLinks = document.querySelectorAll('.lightbox-trigger');
  lbLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var img = a.querySelector('img');
      var alt = (img && img.alt) || a.getAttribute('aria-label') || 'Image';
      openLightbox(a.href, alt);
    });
  });

  // b) Standalone images in two-col sections
  var twoColImgs = document.querySelectorAll('.two-col img');
  twoColImgs.forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img.src, img.alt);
    });
  });
});

  const closeLightbox = () => {
    (overlay as HTMLElement).style.display = 'none';
    overlay.removeAttribute('data-open');
    overlayImg!.src = '';
    document.documentElement.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeLightbox);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') {
      closeLightbox();
    }
  });

  // a) Links with .lightbox-trigger
  document.querySelectorAll<HTMLAnchorElement>('.lightbox-trigger').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const img = a.querySelector('img');
      openLightbox(a.href, img?.alt || a.getAttribute('aria-label') || 'Image');
    });
  });

  // b) Standalone images in two-col sections
  document.querySelectorAll<HTMLImageElement>('.two-col img').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
});