import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseJSON, stripRules } from '../src/llm.js';

test('parseJSON extracts JSON from a fenced code block', () => {
  const raw = '```json\n{"a": 1, "b": "two"}\n```';
  assert.deepEqual(parseJSON(raw), { a: 1, b: 'two' });
});

test('parseJSON extracts JSON with surrounding prose', () => {
  const raw = 'Sure, here you go:\n{"ok": true}\nHope that helps!';
  assert.deepEqual(parseJSON(raw), { ok: true });
});

test('parseJSON throws on genuinely invalid input', () => {
  assert.throws(() => parseJSON('not json at all'));
});

test('stripRules removes horizontal rule lines and code fences', () => {
  const md = '# Title\n\n---\n\nSome text\n\n```\ncode block\n```\n\n***\n\nMore text';
  const out = stripRules(md);
  assert.ok(!out.includes('---'));
  assert.ok(!out.includes('***'));
  assert.ok(!out.includes('```'));
  assert.ok(out.includes('Some text'));
  assert.ok(out.includes('More text'));
});

test('stripRules collapses excessive blank lines', () => {
  const out = stripRules('a\n\n\n\n\nb');
  assert.equal(out, 'a\n\nb');
});
