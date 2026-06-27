'use strict';

function requestWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
    mode: 'cors',
  }).finally(() => {
    window.clearTimeout(timer);
  });
}

window.AppApi = {
  request(url, options = {}, timeoutMs = 15000) {
    return requestWithTimeout(url, options, timeoutMs);
  },

  async requestText(url, options = {}, timeoutMs = 15000) {
    const response = await requestWithTimeout(url, options, timeoutMs);
    return {
      response,
      text: await response.text(),
    };
  },

  async requestJson(url, options = {}, timeoutMs = 15000) {
    const { response, text } = await window.AppApi.requestText(url, options, timeoutMs);
    return {
      response,
      json: text ? JSON.parse(text) : null,
    };
  },
};
