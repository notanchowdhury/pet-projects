// Verify SMTP works by sending one test message.
//   node scripts/test-email.js [recipient]
//   npm run test-email -- you@example.com
// Recipient defaults to SMTP_USER.

import 'dotenv/config';
import { sendMail } from '../src/mailer.js';

const to = process.argv[2] || process.env.SMTP_USER;
if (!to) {
  console.error('Usage: node scripts/test-email.js <recipient>');
  process.exit(1);
}

try {
  const r = await sendMail({
    to,
    subject: 'Bewerbungs-Helfer — SMTP test',
    text: 'If you can read this, your SMTP settings work. ✅'
  });
  console.log(r.delivered ? `✓ Sent via SMTP to ${to}` : '⚠ SMTP not configured — the message was logged to the console instead.');
} catch (e) {
  console.error('✗ SMTP send FAILED:', e.message);
  process.exit(1);
}
