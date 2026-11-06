# Phoenix Baileys V3

Phoenix Baileys V3 is a Phoenix-maintained WhatsApp Web library based on Baileys.

The project follows upstream Baileys closely while maintaining a small set of documented Phoenix-specific patches required by the Phoenix ecosystem.

Current version:

```text
3.0.0-beta.1
```

## Goals

Phoenix Baileys V3 is designed around a few simple principles:

- stay as close to upstream Baileys as possible
- keep Phoenix-specific changes small and documented
- avoid large invasive modifications
- preserve compatibility with modern WhatsApp protocol changes
- add regression tests for Phoenix-specific behavior
- review every Phoenix patch when updating the upstream base

Phoenix-specific modifications are documented in:

```text
PHOENIX_PATCHES.md
```

## Based on Baileys

Phoenix Baileys V3 is based on the open-source Baileys project.

Upstream project:

```text
WhiskeySockets/Baileys
```

Phoenix Baileys V3 is not intended to hide or replace its upstream origin.

The upstream MIT license and copyright notices are preserved in this repository.

## Current Phoenix Patches

### PHX-001 - Group Leave / Remove distinction

Phoenix preserves the distinction between:

```text
GROUP_PARTICIPANT_LEAVE
GROUP_PARTICIPANT_REMOVE
```

Incoming group participant events emit:

```text
leave
remove
```

instead of treating both events as `remove`.

This allows applications to reliably distinguish a voluntary group leave from a participant removal.

### PHX-002 - Interactive Native Flow Buttons

Phoenix adds a high-level:

```ts
interactiveButtons
```

message API for WhatsApp Native Flow messages.

Currently tested button types:

```text
single_select
cta_url
```

The implementation also supports:

```text
image
video
mentions
mentionAll
contextInfo
```

Example:

```ts
await sock.sendMessage(jid, {
  text: 'Phoenix Menu',
  footer: 'Vivere diu Phoenix',
  image: {
    url: './media/pic1.jpg'
  },
  interactiveButtons: [
    {
      name: 'single_select',
      buttonParamsJson: {
        title: 'Select menu',
        sections: [
          {
            title: 'Phoenix',
            rows: [
              {
                title: 'Main Menu',
                id: '/menu'
              }
            ]
          }
        ]
      }
    },
    {
      name: 'cta_url',
      buttonParamsJson: {
        display_text: 'Phoenix Website',
        url: 'https://phoenixgermany.com',
        merchant_url: 'https://phoenixgermany.com'
      }
    }
  ]
})
```

`buttonParamsJson` accepts either a JSON string or an object.

Objects are automatically serialized.

## Verification

Phoenix-specific changes are covered by regression tests.

Current project result:

```text
Test Suites: 30 passed, 30 total
Tests:       411 passed, 411 total
Snapshots:   0 total
```

The TypeScript build also completes successfully.

PHX-002 has additionally been verified against the live WhatsApp service using Phoenix bots.

## Installation

Phoenix Baileys V3 can currently be installed directly from GitHub:

```bash
npm install github:Exiqonbotz/phoenix-baileys-v3
```

Example CommonJS usage:

```js
const makeWASocket = require('phoenix-baileys-v3').default
```

Additional exports can be imported normally:

```js
const {
  proto,
  delay,
  getContentType
} = require('phoenix-baileys-v3')
```

## Development

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Run the complete test suite:

```bash
npm test -- --runInBand
```

Run only the Phoenix group participant regression tests:

```bash
node --experimental-vm-modules ./node_modules/jest/bin/jest.js phoenix-group-participants.test.ts --runInBand
```

Run only the Phoenix interactive button regression tests:

```bash
node --experimental-vm-modules ./node_modules/jest/bin/jest.js phoenix-interactive-buttons.test.ts --runInBand
```

## Patch Policy

Every Phoenix-specific modification should receive a patch ID:

```text
PHX-001
PHX-002
PHX-003
...
```

Each patch should document:

- the problem
- Phoenix behavior
- affected files
- tests
- upstream compatibility considerations

See:

```text
PHOENIX_PATCHES.md
```

## Upstream Updates

When updating to a newer upstream Baileys version:

1. Review all Phoenix patches.
2. Check whether upstream already provides equivalent functionality.
3. Remove obsolete Phoenix patches where possible.
4. Reapply only the patches that are still required.
5. Run the complete build and test suite.
6. Perform a live Phoenix canary test before deploying broadly.

The goal is to avoid maintaining duplicate behavior once upstream provides an equivalent solution.

## What Phoenix Baileys V3 Does Not Do

Phoenix Baileys V3 intentionally does not include the large collection of modifications previously present in Phoenix Baileys V2.

V3 does not aim to provide:

- AntiBan claims
- protocol masquerading
- unnecessary WhatsApp client spoofing
- large undocumented patches
- unrelated payment or business modifications
- custom replacements for functionality already handled correctly upstream

Phoenix-specific functionality should only be added when there is a concrete requirement.

## License

Phoenix Baileys V3 is distributed under the MIT License inherited from the upstream project.

See:

```text
LICENSE
```

The original upstream copyright and license notices remain preserved.
