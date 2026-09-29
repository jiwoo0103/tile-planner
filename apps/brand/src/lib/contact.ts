export const reportSubject = 'Site question or error report';
export const reportTemplate = `Page or article URL:
Steps to reproduce:
Inputs and units (including allowance, box size, price, grout, rotation and starting point if relevant):
Observed result or message:
Expected result and why:
Browser/version and device:

Include only details needed to reproduce the issue. Remove personal information from links and screenshots.`;

export function contactMailto(email: string): string {
  const address = email.split('@').map(encodeURIComponent).join('@');
  return `mailto:${address}?subject=${encodeURIComponent(reportSubject)}&body=${encodeURIComponent(reportTemplate)}`;
}

export async function copyContactEmail(email: string, clipboard?: Pick<Clipboard, 'writeText'>): Promise<string> {
  try {
    if (!clipboard) throw new Error('Clipboard unavailable');
    await clipboard.writeText(email);
    return 'Email address copied. Nothing has been sent.';
  } catch {
    return 'Copy was unavailable. Select and copy the address above, or use Write an email. Nothing has been sent.';
  }
}
