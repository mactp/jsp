// main.js
document.addEventListener('DOMContentLoaded', () => {

  /* 0) Mobile nav toggle — matches body.nav-open / .scrim in styles.css */
  const toggleBtn = document.querySelector('.nav-toggle');
  const navList   = document.getElementById('primary-nav');
  const scrim     = document.querySelector('.scrim');
  const body      = document.body;
  const mq        = window.matchMedia('(max-width: 1100px)');

  if (toggleBtn && navList) {
    let lastFocus = null;

    const isOpen = () => body.classList.contains('nav-open');

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
      body.classList.add('nav-open', 'no-scroll');
      toggleBtn.setAttribute('aria-expanded', 'true');
      navList.removeAttribute('hidden');
      document.addEventListener('keydown', trapKeydown);
      const f = getFocusables(navList);
      (f[0] || toggleBtn).focus();
    };

    const closeMenu = () => {
      if (!isOpen()) return;
      body.classList.remove('nav-open', 'no-scroll');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', trapKeydown);
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    // Sync on resize — keep nav visible on desktop, hidden on mobile
    const syncViewport = () => {
      if (!mq.matches) {
        // Desktop: always show nav, clear any mobile state
        body.classList.remove('nav-open', 'no-scroll');
        navList.removeAttribute('hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', trapKeydown);
      } else {
        // Mobile: hide nav unless open
        if (!isOpen()) navList.setAttribute('hidden', '');
      }
    };

    toggleBtn.addEventListener('click', () => isOpen() ? closeMenu() : openMenu());

    // Close on scrim click
    if (scrim) scrim.addEventListener('click', closeMenu);

    // Close when a nav link is tapped on mobile
    navList.addEventListener('click', (e) => {
      if (e.target.closest('a[href]') && mq.matches) closeMenu();
    });

    mq.addEventListener('change', syncViewport);
    syncViewport();
  }

  /* 1) Dropdown nav toggle.
        History is a parent-only item: clicking it must NOT navigate anywhere —
        the user has to pick Park history or Jacob Smith family from the submenu. */
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const menu = this.closest('.has-dropdown')?.querySelector('.dropdown-menu');
      if (window.innerWidth < 1100) {
        // Mobile: tap toggles the submenu open/closed
        const open = menu && menu.style.display === 'block';
        if (menu) menu.style.display = open ? 'none' : 'block';
        this.setAttribute('aria-expanded', open ? 'false' : 'true');
      }
      // Desktop: hover / keyboard focus reveals the submenu via CSS (:hover, :focus-within)
    });
  });

  /* 2) Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 3) Universal Lightbox */
  const lbTargets = Array.from(
    document.querySelectorAll('.lightbox-trigger, .two-col img, .image-grid a')
  );

  if (lbTargets.length) {
    let overlay = document.getElementById('lightbox-overlay');
    let overlayImg = overlay?.querySelector('img');
    let closeBtn = overlay?.querySelector('.close-btn');

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

      lbTargets.forEach(el => {
        if (el.hasAttribute('data-no-lightbox')) return;
        el.addEventListener('click', (e) => {
          const tag = el.tagName.toLowerCase();
          let src = '', alt = '';
          if (tag === 'a') {
            e.preventDefault();
            const imgIn = el.querySelector('img');
            src = el.getAttribute('href');
            alt = imgIn?.alt || el.getAttribute('aria-label') || 'Image';
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

  /* 4) Scrollspy (History page subnav) */
  const subnav = document.querySelector('.subnav');
  if (subnav) {
    const links   = Array.from(subnav.querySelectorAll('.subnav__link'));
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

  /* 5) Contact page reason tabs */
  document.querySelectorAll('.reason-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.reason-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const label = this.dataset.label;
      const formTitle = document.getElementById('form-title');
      const enquiryType = document.getElementById('enquiry-type');
      if (formTitle) formTitle.textContent = label;
      if (enquiryType) enquiryType.value = label;
    });
  });

  /* 5b) Legacy contact action buttons (older contact page version) */
  const actionButtons = document.querySelectorAll('.action-btn');
  if (actionButtons.length) {
    const formTitle      = document.getElementById('form-title');
    const messageLabel   = document.getElementById('message-label');
    const messageArea    = document.getElementById('message');
    const enquiryType    = document.getElementById('enquiry-type');

    actionButtons.forEach(button => {
      button.addEventListener('click', function () {
        actionButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const action = this.getAttribute('data-action');
        if (action === 'keep-informed') {
          if (formTitle) formTitle.textContent = 'Keep me informed';
          if (messageLabel) messageLabel.innerHTML = 'Tell us what you\'d like to hear about <span aria-hidden="true">*</span>';
          if (messageArea) messageArea.placeholder = 'E.g., volunteer events, biannual meetings, park updates…';
          if (enquiryType) enquiryType.value = 'Keep me informed';
        } else if (action === 'get-involved') {
          if (formTitle) formTitle.textContent = 'Get involved';
          if (messageLabel) messageLabel.innerHTML = 'What would you like to get involved in? <span aria-hidden="true">*</span>';
          if (messageArea) messageArea.placeholder = 'Tell us about your interests or what you\'d like to help with…';
          if (enquiryType) enquiryType.value = 'Get involved';
        } else {
          if (formTitle) formTitle.textContent = 'Get in touch';
          if (messageLabel) messageLabel.innerHTML = 'Message <span aria-hidden="true">*</span>';
          if (messageArea) messageArea.placeholder = '';
          if (enquiryType) enquiryType.value = 'General enquiry';
        }
        document.querySelector('.contact-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => document.getElementById('name')?.focus(), 500);
      });
    });
  }

  /* 6) Contact form AJAX (Formspree) */
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          formStatus.textContent = 'Message sent — thank you!';
          contactForm.reset();
        } else {
          formStatus.textContent = 'Something went wrong. Please try emailing us directly.';
        }
      } catch {
        formStatus.textContent = 'Could not send. Please try emailing us directly.';
      }
    });
  }

});

/* 7) Sticky header shadow on scroll */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let last = 0, tick = false;
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if ((y > 8) !== (last > 8)) header.classList.toggle('is-scrolled', y > 8);
    last = y; tick = false;
  }
  window.addEventListener('scroll', () => {
    if (!tick) { tick = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
})();