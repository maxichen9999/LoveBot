const IP_BLOCK_EXEMPTIONS = new Set(['87.106.245.164']);

export function normalizeIpAddress(ip) {
  const value = String(ip || '').trim().toLowerCase();
  if (!value) return '';
  const withoutBrackets = value.replace(/^\[|\]$/g, '').replace(/\s+/g, '');
  return withoutBrackets.startsWith('::ffff:')
    ? withoutBrackets.replace(/^::ffff:/, '')
    : withoutBrackets;
}

export function isIpBlockExempt(ip) {
  const normalized = normalizeIpAddress(ip);
  return !!normalized && IP_BLOCK_EXEMPTIONS.has(normalized);
}
