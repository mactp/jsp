document.addEventListener('DOMContentLoaded', () => {
  /* 0) Header nav toggle — matches current HTML */
  const nav = document.querySelector('.site-nav');
  const toggleBtn = nav?.querySelector('.nav-toggle');
  const navList = nav?.querySelector('#primary-nav');

  if (nav && toggleBtn && navList) {
    const closeMenu = () => {
      toggleBtn.setAttribute('aria-expanded', 'false');
      navList.hidden = true;
    };
    const openMenu = () => {
      toggleBtn.setAttribute('aria-expanded', 'true');
      navList.hidden = false;
    };

    // start closed on mobile
    closeMenu();

    toggleBtn.addEventListener('click', () => {
      const open = toggleBtn.getAttribute('aria-expanded') === 'true';
      open ? closeMenu() : openMenu();
    });

    // click outside closes (mobile)
    document.addEventListener('click', (e) => {
      const isDesktop = window.matchMedia('(min-width: 900px)').matches;
      if (!isDesktop && !nav.contains(e.target)) closeMenu();
    });

    // Esc to close
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // resize sync (prevents stale state)
    const mq = window.matchMedia('(min-width: 900px)');
    const sync = () => {
      if (mq.matches) { navList.hidden = false; toggleBtn.setAttribute('aria-expanded','false'); }
      else { navList.hidden = true; }
    };
    mq.addEventListener?.('change', sync);
    sync();
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
