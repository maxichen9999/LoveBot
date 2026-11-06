export const META_AI_BOT_JID = '867051314767696@bot';

function normalizeMetaAiJid(value) {
  return String(value || '')
    .trim()
    .replace(/:\d+(?=@(?:bot|s\.whatsapp\.net|lid)$)/i, '')
    .toLowerCase();
}

export function isMetaAiMessage(msg, content = msg?.message) {
  const key = msg?.key || {};
  const senderIds = [
    key.remoteJid,
    key.remoteJidAlt,
    key.participant,
    key.participantAlt
  ];
  if (senderIds.some((id) => normalizeMetaAiJid(id) === META_AI_BOT_JID)) {
    return true;
  }

  const richResponse = content?.botForwardedMessage?.message?.richResponseMessage;
  const forwardedBotJid = richResponse?.contextInfo?.forwardedAiBotMessageInfo?.botJid;
  return normalizeMetaAiJid(forwardedBotJid) === META_AI_BOT_JID;
}

export function getMetaAiMessageText(content) {
  const forwarded = content?.botForwardedMessage?.message;
  const richResponse = forwarded?.richResponseMessage;
  const candidates = [
    ...(Array.isArray(richResponse?.submessages)
      ? richResponse.submessages.map((item) => item?.messageText)
      : []),
    richResponse?.messageText,
    forwarded?.conversation,
    forwarded?.extendedTextMessage?.text
  ];
  return candidates.find((text) => typeof text === 'string' && text.trim())?.trim() || '';
}
