document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    accordion.addEventListener('click', () => {
      // Close all panels
      accordions.forEach((acc) => {
        if (acc !== accordion) {
          acc.classList.remove('active');
          acc.nextElementSibling.style.maxHeight = null;
        }
      });

      // Toggle current one
      accordion.classList.toggle('active');
      const panel = accordion.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
});