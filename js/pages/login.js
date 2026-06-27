'use strict';

function initLoginPage() {
  const form = $('#login-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    AppAuth?.login?.();
    AppRouter.navigate('intro');
  });

  $$('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.login-tab').forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  $$('.social-btn').forEach(button => {
    button.addEventListener('click', () => {
      AppAuth?.login?.();
      AppRouter.navigate('intro');
    });
  });
}

document.addEventListener('DOMContentLoaded', initLoginPage);
