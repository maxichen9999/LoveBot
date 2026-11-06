import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMetaAiMessageText,
  isMetaAiMessage,
  META_AI_BOT_JID
} from '../metaAiMessage.js';

test('Meta-AI-Antworten werden anhand der weitergeleiteten Bot-ID erkannt', () => {
  const msg = {
    key: {
      remoteJid: '120363411722505265@g.us',
      participant: '491234567890@s.whatsapp.net'
    }
  };
  const content = {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [{ messageText: '$Ping' }],
          contextInfo: {
            forwardedAiBotMessageInfo: { botJid: META_AI_BOT_JID }
          }
        }
      }
    }
  };

  assert.equal(isMetaAiMessage(msg, content), true);
  assert.equal(getMetaAiMessageText(content), '$Ping');
});

test('Meta-AI-Absender mit Gerätekennung wird erkannt', () => {
  assert.equal(isMetaAiMessage({
    key: { remoteJid: '867051314767696:4@bot' }
  }), true);
});

test('gewöhnliche weitergeleitete Inhalte werden nicht als Meta-AI-Antwort erkannt', () => {
  const content = {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [{ messageText: '$ping' }],
          contextInfo: {
            forwardedAiBotMessageInfo: { botJid: '867051314767697@bot' }
          }
        }
      }
    }
  };
  assert.equal(isMetaAiMessage({ key: {} }, content), false);
  assert.equal(getMetaAiMessageText(content), '$ping');
});
