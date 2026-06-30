'use strict';

/*
  TODO: Connect future ML inference endpoints here if the backend expands.
  TODO: Add Supabase or other persistence calls here when needed.
*/

function getChatbotWebhookUrl() {
  return './api/chatbot';
}

function formatWebhookResult(data) {
  if (data == null) return 'ไม่พบข้อความตอบกลับจากระบบ';

  if (typeof data === 'string') return data;

  if (Array.isArray(data)) {
    const first = data[0];
    if (typeof first === 'string') return first;
    return first?.output || first?.answer || first?.message || first?.text || JSON.stringify(first, null, 2);
  }

  if (typeof data === 'object') {
    return data.output || data.answer || data.message || data.text || data.result || JSON.stringify(data, null, 2);
  }

  return String(data);
}

function parseWebhookPayload(rawText, contentType = '') {
  const text = String(rawText || '').trim();
  if (!text) return '';

  if (contentType.includes('application/json')) {
    return formatWebhookResult(JSON.parse(text));
  }

  try {
    return formatWebhookResult(JSON.parse(text));
  } catch {
    return text;
  }
}

function localFallbackResponse(message) {
  const text = String(message || '').toLowerCase();
  if (text.includes('tmao') || text.includes('ทีมาโอ')) {
    return 'TMAO เป็น biomarker ที่สัมพันธ์กับความเสี่ยงโรคหัวใจและหลอดเลือด หากคุณมีค่าตรวจ TMAO สูง ควรคุยกับแพทย์เรื่องอาหาร การออกกำลังกาย และปัจจัยเสี่ยงอื่น ๆ';
  }
  if (text.includes('ldl') || text.includes('cholesterol') || text.includes('คอเลสเตอร')) {
    return 'LDL ที่สูงเป็นปัจจัยเสี่ยงสำคัญของโรคหัวใจ ลองลดอาหารไขมันอิ่มตัว เพิ่มการเคลื่อนไหว และปรึกษาแพทย์เรื่องเป้าหมาย LDL ที่เหมาะกับคุณ';
  }
  if (text.includes('สูบ') || text.includes('บุหรี่') || text.includes('smok')) {
    return 'การสูบบุหรี่เพิ่มความเสี่ยงโรคหัวใจอย่างชัดเจน การเลิกสูบเป็นหนึ่งในวิธีที่ลดความเสี่ยงได้มากที่สุด';
  }
  if (text.includes('prevention') || text.includes('ป้องกัน') || text.includes('ลดเสี่ยง')) {
    return 'แนวทางป้องกันที่ดีคือคุมอาหาร ออกกำลังกายสม่ำเสมอ นอนให้พอ ควบคุมความดัน น้ำตาล และไขมันในเลือด';
  }
  return 'ผมรับข้อความของคุณได้แล้ว แต่ยังไม่มีคำตอบเฉพาะจาก webhook ในตอนนี้ ลองถามเรื่อง TMAO, LDL, การป้องกัน หรือความเสี่ยงโรคหัวใจได้ครับ';
}

window.AppChatbotApi = {
  async sendChatMessage(message) {
    const CHAT_WEBHOOK_URL = getChatbotWebhookUrl();

    const response = await AppApi.request(CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: message }),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${bodyText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();
    return parseWebhookPayload(rawText, contentType);
  },

  getFallbackChatResponse(message) {
    return localFallbackResponse(message);
  },
};

