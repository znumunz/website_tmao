'use strict';

const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

window.$ = $;
window.$$ = $$;

window.AppRouter = (() => {
  const routes = {
    login: 'login.html',
    intro: 'index.html',
    index: 'index.html',
    assessment: 'predict.html',
    predict: 'predict.html',
    results: 'result.html',
    result: 'result.html',
    dashboard: 'dashboard.html',
    chatbot: 'chatbot.html',
  };

  const root = () => window.APP_ROOT || './';
  const urlFor = page => `${root()}${routes[page]}`;

  function currentPage() {
    return document.body?.dataset.page || 'login';
  }

  function navigate(page) {
    if (!routes[page]) return;
    const target = urlFor(page);
    if (window.location.pathname.endsWith(`/${routes[page]}`) || window.location.pathname.endsWith(`\\${routes[page]}`)) {
      return;
    }
    window.location.href = target;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cardiovashora_theme', theme);
    $$('.btn-darkmode').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function setActiveLinks() {
    const page = currentPage();
    $$('.sidebar-links a, .mobile-nav a').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });
  }

  function bindNavbarControls(scope = document) {
    scope.querySelector('.btn-darkmode')?.addEventListener('click', toggleTheme);
    scope.querySelector('#logout-btn')?.addEventListener('click', () => {
      AppAuth?.logout?.();
      navigate('login');
    });
    scope.querySelector('#hamburger-btn')?.addEventListener('click', () => {
      $('#mobile-nav')?.classList.toggle('open');
    });
    scope.querySelector('#sidebar-toggle')?.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      const toggle = $('#sidebar-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', String(!document.body.classList.contains('sidebar-collapsed')));
      }
    });
  }

  async function injectNavbar() {
    const slot = $('[data-navbar-slot]');
    if (!slot) return;
    const { text } = await AppApi.requestText(`${root()}components/navbar.html`);
    slot.innerHTML = text;
    applyTheme(localStorage.getItem('cardiovashora_theme') || 'light');
    bindNavbarControls(slot);
    setActiveLinks();
  }

  function bindGlobalEvents() {
    document.addEventListener('click', event => {
      const pageLink = event.target.closest('[data-page]');
      if (pageLink) {
        event.preventDefault();
        navigate(pageLink.dataset.page);
        $('#mobile-nav')?.classList.remove('open');
      }
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('#mobile-nav') && !event.target.closest('#hamburger-btn')) {
        $('#mobile-nav')?.classList.remove('open');
      }
    });
  }

  function init() {
    const savedTheme = localStorage.getItem('cardiovashora_theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    bindGlobalEvents();
    injectNavbar();
  }

  return { init, navigate, currentPage, setActiveLinks };
})();

document.addEventListener('DOMContentLoaded', () => {
  AppRouter.init();
});

