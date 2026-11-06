import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const users = fs.readFileSync(new URL('../public/js/cc-users.js', import.meta.url), 'utf8');
const akten = fs.readFileSync(new URL('../public/js/cc-akten.js', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../public/css/hello-kitty.css', import.meta.url), 'utf8');

test('Accounts API exposes bot profiles with permission-aware phone numbers', () => {
  assert.match(server, /const canSeeNumbers = perm\(session, 'accounts\.manage'\)/);
  assert.match(server, /botUsers = scanUserProfiles\(\)\.map/);
  assert.match(server, /phone: canSeeNumbers \? phone : maskNum\(phone\)/);
});

test('Bot-profile detail lookup validates the BID and stays within LoveUser', () => {
  assert.match(server, /function findProfileByBid\(bid\)/);
  assert.match(server, /!\/\^\[a-zA-Z0-9\._-\]\{1,200\}\$\/\.test\(bid\)/);
  assert.match(server, /path\.dirname\(profileDir\) !== root/);
  assert.match(server, /id\.startsWith\('bot_'\)[\s\S]*?findProfileByBid\(id\.slice\(4\)\)/);
  assert.match(server, /if \(!perm\(session, 'accounts\.view'\)\) return sendJson\(res, 403/);
});

test('Accounts view lists, searches, and opens Botprofileakten', () => {
  assert.match(users, /CC\._botUsersCache = \(a && a\.botUsers\) \|\| \[\]/);
  assert.match(users, /WhatsApp-Botprofile/);
  assert.match(users, /botUsers\.filter/);
  assert.match(users, /data-bot-profile-bid/);
  assert.match(users, /encodeURIComponent\('bot_' \+ button\.dataset\.botProfileBid\)/);
  assert.match(akten, /encodeURIComponent\(id\) \+ '\/detail\/full'/);
  assert.match(akten, /const rank = pr\?\.rank \|\| ''/);
});

test('Botprofile use the LoveBot pink and lilac theme in the owner center', () => {
  assert.match(theme, /--brand-1: #f7b6d2/);
  assert.match(theme, /--brand-2: #ff69b4/);
  assert.match(theme, /--brand-3: #d8b4f8/);
  assert.match(theme, /\.cc-navitem\.on/);
  assert.match(theme, /\.cc-bot-account-section/);
});
