import nodemailer from 'nodemailer';

let cached; // undefined = not built yet, false = no SMTP, object = transporter
function transporter() {
  if (cached !== undefined) return cached;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT) {
    cached = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
  } else {
    cached = false;
  }
  return cached;
}

// Sends an email if SMTP is configured; otherwise logs it to the server console so the
// operator can relay the link during development. Returns { delivered }.
export async function sendMail({ to, subject, text }) {
  const t = transporter();
  if (!t) {
    console.log('\n──────── [mailer] SMTP not configured — email NOT sent ────────');
    console.log('to:      ', to);
    console.log('subject: ', subject);
    console.log(text);
    console.log('───────────────────────────────────────────────────────────────\n');
    return { delivered: false };
  }
  await t.sendMail({ from: process.env.SMTP_FROM || 'no-reply@jobpilot-germany.local', to, subject, text });
  return { delivered: true };
}
