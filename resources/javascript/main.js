// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  /* 0) Header nav toggle — upgraded (overlay + focus trap + scroll lock) */
  const nav = document.querySelector('.site-nav');
  const toggleBtn = nav?.querySelector('.nav-toggle');
  const navList = nav?.querySelector('#primary-nav');

  if (nav && toggleBtn && navList) {
    // Create overlay once
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      document.body.appendChild(overlay);
    }

    const mq = window.matchMedia('(max-width: 900px)');
    let lastFocus = null;

    const isOpen = () => nav.classList.contains('open');

    const setAria = (open) => {
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        navList.removeAttribute('hidden');
        navList.setAttribute('aria-modal', 'true');
      } else {
        navList.setAttribute('hidden', '');
        navList.removeAttribute('aria-modal');
      }
    };

    const getFocusables = (root) =>
      Array.from(root.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

    const trapKeydown = (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); return closeMenu(); }
      if (e.key !== 'Tab') return;

      const f = getFocusables(navList);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    const openMenu = () => {
      if (isOpen()) return;
      lastFocus = document.activeElement;

      nav.classList.add('open');          // enables drawer animation via CSS
      overlay.classList.add('show');      // fades in overlay
      setAria(true);

      // Lock scroll
      document.documentElement.style.overflow = 'hidden';

      // Focus first menu item
      const f = getFocusables(navList);
      (f[0] || toggleBtn).focus();

      // Listeners
      overlay.addEventListener('click', closeMenu, { once: true });
      document.addEventListener('keydown', trapKeydown);
    };

    const closeMenu = () => {
      if (!isOpen()) return;
      nav.classList.remove('open');
      overlay.classList.remove('show');
      setAria(false);

      // Unlock scroll after overlay transition ends (or immediately if no transition)
      const onEnd = () => {
        document.documentElement.style.overflow = '';
        overlay.removeEventListener('transitionend', onEnd);
      };
      overlay.addEventListener('transitionend', onEnd);
      if (getComputedStyle(overlay).transitionDuration === '0s') onEnd();

      document.removeEventListener('keydown', trapKeydown);

      // Restore focus
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    // Start closed on mobile; visible on desktop
    const syncForViewport = () => {
      if (mq.matches) {         // mobile
        nav.classList.remove('open');
        overlay.classList.remove('show');
        setAria(false);
        document.documentElement.style.overflow = '';
        document.removeEventListener('keydown', trapKeydown);
      } else {                  // desktop
        nav.classList.remove('open');
        overlay.classList.remove('show');
        navList.removeAttribute('hidden'); // always visible on desktop
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
        document.removeEventListener('keydown', trapKeydown);
      }
    };

    // Toggle button
    toggleBtn.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()));

    // Close when a menu link is clicked on mobile
    navList.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && mq.matches) closeMenu();
    });

    mq.addEventListener?.('change', syncForViewport);
    syncForViewport();
  }

  /* 1) Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 2) Newsletter quick validation */
  const form = document.getElementById('newsletter-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      const email = form.querySelector('#email');
      if (!email || !email.checkValidity()) {
        e.preventDefault();
        status.textContent = 'Please enter a valid email address.';
        status.style.color = '#ffd9b0';
        email?.focus();
      } else {
        status.textContent = 'Thanks! Submitting…';
        status.style.color = '#fff';
      }
    });
  }

  /* 3) Universal Lightbox */
  const lbTargets = Array.from(
    document.querySelectorAll('.lightbox-trigger, .two-col img, .image-grid a')
  );

  if (lbTargets.length) {
    let overlay = document.getElementById('lightbox-overlay');
    let overlayImg = overlay ? overlay.querySelector('img') : null;
    let closeBtn = overlay ? overlay.querySelector('.close-btn') : null;

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

    if (overlay && overlayImg && closeBtn) {
      let lastFocus = null;

      function openLightbox(src, alt) {
        if (!src) return;
        lastFocus = document.activeElement;
        overlayImg.src = src;
        overlayImg.alt = alt || '';
        overlay.style.display = 'flex';
        overlay.setAttribute('data-open', 'true');
        document.documentElement.style.overflow = 'hidden';
        closeBtn.focus();
      }

      function closeLightbox() {
        overlay.style.display = 'none';
        overlay.removeAttribute('data-open');
        overlayImg.src = '';
        document.documentElement.style.overflow = '';
        lastFocus?.focus?.();
      }

      lbTargets.forEach(function (el) {
        if (el.hasAttribute('data-no-lightbox')) return;
        el.addEventListener('click', function (e) {
          const tag = el.tagName.toLowerCase();
          let src = '';
          let alt = '';
          if (tag === 'a') {
            e.preventDefault();
            const imgIn = el.querySelector('img');
            src = el.getAttribute('href');
            alt = (imgIn && imgIn.alt) || el.getAttribute('aria-label') || 'Image';
          } else if (tag === 'img') {
            src = el.getAttribute('src');
            alt = el.getAttribute('alt') || 'Image';
          }
          openLightbox(src, alt);
        });
      });

      closeBtn.addEventListener('click', closeLightbox);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') closeLightbox();
      });
    }
  }

  /* 4) Scrollspy (History page) */
  const subnav = document.querySelector('.subnav');
  if (subnav) {
    const links = Array.from(subnav.querySelectorAll('.subnav__link'));
    const targets = links
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const setActive = (id) => {
      links.forEach(a => {
        a.setAttribute('aria-current', a.getAttribute('href') === `#${id}` ? 'true' : 'false');
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });

    targets.forEach(sec => observer.observe(sec));

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
  }
});

/* 5) Sticky header shadow on scroll */
(function(){
  const header = document.querySelector('.site-header');
  if (!header) return;
  let last = 0, tick = false;
  function onScroll(){
    const y = window.scrollY || window.pageYOffset;
    if ((y > 8) !== (last > 8)) header.classList.toggle('is-scrolled', y > 8);
    last = y; tick = false;
  }
  window.addEventListener('scroll', function(){
    if (!tick){ tick = true; requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();
})();
