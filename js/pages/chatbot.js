'use strict';

const ChatbotPage = (() => {
  let inited = false;

  const WELCOME = 'สวัสดีครับ ผมเป็น AI Research Assistant ด้านสุขภาพหัวใจและหลอดเลือด ผมสามารถช่วยอธิบายเกี่ยวกับ TMAO biomarker, ความเสี่ยงโรคหัวใจ และงานวิจัยล่าสุดได้ครับ จะให้ผมช่วยเรื่องใดดีครับ?';

  function appendBubble(role, text) {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;

    const isAI = role === 'ai';
    const wrap = document.createElement('div');
    wrap.className = `chat-bubble-wrap ${isAI ? '' : 'user'} fade-up`;
    wrap.innerHTML = `
      <div class="chat-avatar ${isAI ? 'ai' : 'user-av'}">${isAI ? '🩺' : '👤'}</div>
      <div class="chat-bubble ${isAI ? 'ai' : 'user'}">${String(text).replace(/\n/g, '<br>')}</div>
    `;
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'chat-bubble-wrap';
    typing.innerHTML = `
      <div class="chat-avatar ai">🩺</div>
      <div class="chat-bubble ai" style="padding:0.6rem 1rem">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('typing-indicator')?.remove();
  }

  async function send(message) {
    const text = String(message || '').trim();
    if (!text) return;
    appendBubble('user', text);
    document.getElementById('chat-input').value = '';
    showTyping();
    try {
      const response = await AppChatbotApi.sendChatMessage(text);
      hideTyping();
      appendBubble('ai', response);
    } catch (error) {
      hideTyping();
      const fallback = AppChatbotApi.getFallbackChatResponse?.(text) || 'ขออภัย ระบบตอบกลับไม่สำเร็จ';
      appendBubble('ai', `${fallback}\n\n(เชื่อม webhook ไม่สำเร็จ: ${error.message})`);
    }
  }

  function init() {
    if (inited) return;
    inited = true;
    appendBubble('ai', WELCOME);

    document.getElementById('chat-send')?.addEventListener('click', () => {
      send(document.getElementById('chat-input')?.value || '');
    });

    document.getElementById('chat-input')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send(event.target.value);
      }
    });

    $$('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => send(chip.textContent.trim()));
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ChatbotPage.init();
});


