'use strict';

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const webhookUrl = process.env.CHATBOT_WEBHOOK_URL;
  if (!webhookUrl) {
    response.status(500).json({ error: 'Missing CHATBOT_WEBHOOK_URL' });
    return;
  }

  try {
    const upstreamResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.body || {}),
    });

    const contentType = upstreamResponse.headers.get('content-type') || 'text/plain; charset=utf-8';
    const rawText = await upstreamResponse.text();

    response.status(upstreamResponse.status);
    response.setHeader('Content-Type', contentType);
    response.send(rawText);
  } catch (error) {
    response.status(500).json({ error: 'Failed to call chatbot webhook', detail: error.message });
  }
};