'use strict';

function bindIntroInteractions() {
  document.querySelectorAll('.feature-card, .step-how, .hero-img-card').forEach(element => {
    element.setAttribute('tabindex', '0');
    element.addEventListener('click', () => element.classList.toggle('active'));
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.classList.toggle('active');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', bindIntroInteractions);
