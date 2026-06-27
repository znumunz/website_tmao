'use strict';

/*
  TODO: Replace this placeholder with Firebase Auth or a session-based
  authentication flow when the backend is ready.

  For now, the app is intentionally UI-only and login simply routes to the
  intro page.
*/

window.AppAuth = {
  login() {
    sessionStorage.setItem('cardiovashora_mock_session', '1');
  },

  logout() {
    sessionStorage.removeItem('cardiovashora_mock_session');
  },

  isLoggedIn() {
    return sessionStorage.getItem('cardiovashora_mock_session') === '1';
  },
};
