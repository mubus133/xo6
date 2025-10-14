// main.js — general behaviors & UI micro-interactions
document.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Newsletter mock
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value.trim();
      if(!email || !/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email.');
        return;
      }
      // mock success
      newsletterForm.reset();
      alert('Thanks — you are subscribed (mock).');
    });
  }

  // Chat toggle
  const chatToggle = document.getElementById('chatToggle');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose  = document.getElementById('chatClose');
  if(chatToggle && chatPanel) {
    chatToggle.addEventListener('click', () => {
      chatPanel.hidden = !chatPanel.hidden;
      if(!chatPanel.hidden) {
        const input = document.getElementById('chatInput');
        if(input) input.focus();
      }
    });
    if(chatClose) chatClose.addEventListener('click', () => chatPanel.hidden = true);
  }

  // Section reveal on scroll (IntersectionObserver)
  const reveals = document.querySelectorAll('.section-reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold: 0.12});
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('is-visible'));
  }
});
