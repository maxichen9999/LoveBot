import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maintenanceModule = await import(pathToFileURL(path.join(root, 'night', 'maintenance.js')));
const gateSource = fs.readFileSync(path.join(root, 'public', 'js', 'maintgate.js'), 'utf8');

function renderGate(state) {
  let html = '';
  class FakeXMLHttpRequest {
    open() {}
    send() {
      this.status = 200;
      this.responseText = JSON.stringify(state);
    }
    setRequestHeader() {}
  }
  const document = {
    open() {},
    write(value) { html = value; },
    close() {}
  };
  vm.runInNewContext(gateSource, {
    location: { pathname: '/index.html' },
    XMLHttpRequest: FakeXMLHttpRequest,
    document,
    localStorage: { getItem() { return null; } },
    window: { stop() {} },
    Date
  });
  return html;
}

test('sleep state remains separate from maintenance', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'lovebot-sleep-state-'));
  try {
    process.chdir(tempRoot);
    const sleeping = maintenanceModule.setSleepMode('Hauptowner');
    assert.equal(sleeping.on, false);
    assert.equal(maintenanceModule.getMaintenance().mode, 'sleep');

    maintenanceModule.setMaintenanceOff('Hauptowner');
    assert.equal(maintenanceModule.getMaintenance().mode, 'awake');

    maintenanceModule.setMaintenanceOn('Testwartung', 'Hauptowner');
    assert.equal(maintenanceModule.getMaintenance().on, true);
    assert.equal(maintenanceModule.getMaintenance().mode, 'maintenance');
  } finally {
    process.chdir(root);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('sleep gate shows bedtime artwork without maintenance messaging', () => {
  const html = renderGate({
    on: false,
    mode: 'sleep',
    reason: 'Schlafenszeit',
    since: new Date().toISOString(),
    by: 'Hauptowner'
  });
  assert.match(html, /<body class="sleeping">/);
  assert.match(html, /<h1>Schlafenszeit<\/h1>/);
  assert.match(html, /sleeping-friends\.png/);
  assert.doesNotMatch(html, /WARTUNGSMODUS|ZUGRIFF VERWEIGERT/);
  assert.equal(fs.existsSync(path.join(root, 'public', 'assets', 'img', 'sleeping-friends.png')), true);
});

test('maintenance gate keeps its own message and has no sleep artwork', () => {
  const html = renderGate({
    on: true,
    mode: 'maintenance',
    reason: 'Testwartung',
    since: new Date().toISOString(),
    by: 'Owner'
  });
  assert.match(html, /ZUGRIFF VERWEIGERT/);
  assert.match(html, /Testwartung/);
  assert.doesNotMatch(html, /sleeping-friends\.png/);
});