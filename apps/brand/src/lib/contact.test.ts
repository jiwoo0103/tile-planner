import { describe, expect, it, vi } from 'vitest';
import { operatorContact, siteConfig } from '../../../../scripts/site-config.mjs';
import { contactMailto, copyContactEmail, reportSubject, reportTemplate } from './contact';

describe('operator contact configuration', () => {
  it('does not invent a channel when none is supplied', () => {
    for (const value of [undefined, '', '   ']) expect(operatorContact({ OPERATOR_CONTACT_EMAIL: value })).toEqual({ email: undefined, complete: false });
    expect(siteConfig({}).contact.complete).toBe(false);
  });
  it('trims one plain address and preserves its local part', () => {
    expect(operatorContact({ OPERATOR_CONTACT_EMAIL: '  Report+site&checks@example.com  ' })).toEqual({ email: 'Report+site&checks@example.com', complete: true });
  });
  it.each(['hello', 'a@localhost', 'a@127.0.0.1', 'a@site.test', 'a@site..com', 'a@-site.com', '.a@example.com', 'a..b@example.com', 'a@example.com,b@example.com', 'Name <a@example.com>', 'a@example.com?subject=x', 'a@example.com\r\nBcc:other@example.com', `${'a'.repeat(65)}@example.com`])('rejects invalid or unsafe contact value %s', email => {
    expect(() => operatorContact({ OPERATOR_CONTACT_EMAIL: email })).toThrow(/OPERATOR_CONTACT_EMAIL/);
  });
});

it('encodes the address and report template without injecting mail parameters', () => {
  const email = 'reports+checks&review@example.com';
  const url = new URL(contactMailto(email));
  expect(url.protocol).toBe('mailto:');
  expect(decodeURIComponent(url.pathname)).toBe(email);
  expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
  expect(url.searchParams.get('subject')).toBe(reportSubject);
  expect(url.searchParams.get('body')).toBe(reportTemplate);
});

it('reports a copy only after the clipboard promise succeeds and never claims delivery', async () => {
  let finish!: () => void;
  const writeText = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  let completed = false;
  const result = copyContactEmail('fixture@example.com', { writeText }).then(message => { completed = true; return message; });
  await Promise.resolve();
  expect(writeText).toHaveBeenCalledExactlyOnceWith('fixture@example.com');
  expect(completed).toBe(false);
  finish();
  expect(await result).toBe('Email address copied. Nothing has been sent.');
});

it('provides a manual fallback when permission is denied or the clipboard is unavailable', async () => {
  const denied = await copyContactEmail('fixture@example.com', { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) });
  expect(denied).toMatch(/Select and copy/);
  expect(denied).toMatch(/Nothing has been sent/);
  expect(denied).not.toMatch(/address copied/);
  expect(await copyContactEmail('fixture@example.com')).toBe(denied);
});
