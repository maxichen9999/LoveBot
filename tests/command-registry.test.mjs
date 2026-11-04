import test from 'node:test';
import assert from 'node:assert/strict';
import { getCategories, getHelpCategories, getRich, resolve, stats, validate } from '../commandRegistry.js';

const commands = getRich();
const normalizedNames = commands.map((command) => command.name.toLowerCase());
const allAliases = commands.flatMap((command) => command.aliases.map((alias) => alias.toLowerCase()));

test('every registered command name resolves and passes the dry-run validator', () => {
  assert.equal(commands.length, 383);
  for (const command of commands) {
    const resolved = resolve(command.name);
    assert.equal(resolved?.name, command.name, `${command.name} must resolve to itself`);

    const checked = validate(`$${command.name}`);
    assert.equal(checked.dryRun, true, `${command.name} must remain a dry run`);
    assert.equal(checked.valid, true, `${command.name} must pass validation`);
    assert.equal(checked.resolved.name, command.name, `${command.name} must resolve in validation`);
  }
});

test('ADM remains hidden from command listings and the command tester', () => {
  for (const name of ['adm', 'admall', 'adminall']) {
    assert.equal(resolve(name), null, `${name} must not be listed in the public registry`);
    assert.equal(validate(`$${name}`).valid, false, `${name} must stay hidden from dry-run validation`);
  }
});

test('every registered alias resolves to exactly its command, including multiword aliases', () => {
  for (const command of commands) {
    for (const alias of command.aliases) {
      const resolved = resolve(alias);
      assert.equal(resolved?.name, command.name, `${alias} must resolve to ${command.name}`);

      const checked = validate(`$${alias}`);
      assert.equal(checked.valid, true, `${alias} must pass validation`);
      assert.equal(checked.resolved.name, command.name, `${alias} must validate as ${command.name}`);
    }
  }
});

test('registry has no duplicate command names or ambiguous aliases', () => {
  assert.equal(new Set(normalizedNames).size, normalizedNames.length, 'command names must be unique');
  assert.equal(new Set(allAliases).size, allAliases.length, 'aliases must be unique');
  for (const alias of allAliases) {
    assert.equal(normalizedNames.includes(alias), false, `${alias} cannot also be a command name`);
  }
});

test('multiword command names preserve trailing arguments in dry-run validation', () => {
  for (const [input, name, args] of [
    ['$afk off', 'afk off', []],
    ['$pet name Luna', 'pet name', ['Luna']],
    ['$pet status', 'pet status', []]
  ]) {
    const checked = validate(input);
    assert.equal(checked.resolved.name, name);
    assert.deepEqual(checked.args, args);
  }
});

test('experimental protocol demo commands are registered as owner-only', () => {
  for (const name of ['loadingaiimg', 'loadingaivid']) {
    const command = resolve(name);
    assert.equal(command?.perms, 'owner', `${name} must be owner-only`);
    assert.equal(validate(`$${name} demo`).resolved.name, name);
  }
});

test('contact-card command is registered as owner-only', () => {
  const command = resolve('oc');
  assert.equal(command?.perms, 'owner');
  assert.equal(validate('$oc').resolved.name, 'oc');
});

test('ownersend is registered as an owner-only contact-card command', () => {
  const command = resolve('ownersend');
  assert.equal(command?.perms, 'owner');
  assert.equal(validate('$ownersend').resolved.name, 'ownersend');
});

test('babe is registered as an owner-only mention command', () => {
  const command = resolve('babe');
  assert.equal(command?.perms, 'owner');
  assert.equal(validate('$babe').resolved.name, 'babe');
});

test('test910 is registered as the single-select test menu command', () => {
  const command = resolve('test910');
  assert.equal(command?.perms, 'all');
  assert.equal(validate('$test910').resolved.name, 'test910');
});

test('new love commands and owner-management spellings are registered', () => {
  assert.equal(resolve('lovequote')?.perms, 'all');
  assert.equal(resolve('liebeszitat')?.name, 'lovequote');
  assert.equal(resolve('herzensfrage')?.perms, 'all');
  assert.equal(resolve('herzfrage')?.name, 'herzensfrage');
  assert.equal(resolve('addowmer')?.name, 'addowner');
  assert.equal(resolve('delowmer')?.name, 'delowner');
  assert.equal(resolve('removeowner')?.name, 'delowner');
});

test('all command surfaces expose the same registry inventory', () => {
  const s = stats();
  const apiCommands = getCategories().flatMap((category) => category.cmds);
  const helpCommands = getHelpCategories().flatMap((category) => category.cmds);

  assert.equal(s.commands, commands.length);
  assert.equal(apiCommands.length, commands.length);
  assert.equal(helpCommands.length, commands.length);
  assert.equal(s.aliases, allAliases.length);
});
