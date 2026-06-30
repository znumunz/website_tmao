'use strict';

const fs = require('fs');
const path = require('path');

function parseEnvFile(contents) {
  const env = {};

  String(contents || '')
    .split(/\r?\n/)
    .forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return;

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key) return;

      let value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    });

  return env;
}

function readWebhookUrl(projectRoot) {
  if (process.env.CHATBOT_WEBHOOK_URL) {
    return process.env.CHATBOT_WEBHOOK_URL;
  }

  const envPath = path.join(projectRoot, '.env');
  if (fs.existsSync(envPath)) {
    const localEnv = parseEnvFile(fs.readFileSync(envPath, 'utf8'));
    if (localEnv.CHATBOT_WEBHOOK_URL) {
      return localEnv.CHATBOT_WEBHOOK_URL;
    }
  }

  throw new Error('Missing CHATBOT_WEBHOOK_URL. Set it in the environment or in a local .env file before building.');
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const webhookUrl = readWebhookUrl(projectRoot);
  const outputPath = path.join(projectRoot, 'js', 'runtime-config.js');
  const output = `window.AppRuntimeConfig = ${JSON.stringify({ chatbotWebhookUrl: webhookUrl }, null, 2)};\n`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
}

main();