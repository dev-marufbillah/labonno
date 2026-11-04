import "server-only";

/**
 * Transactional email through Resend's HTTP API — no SDK, no extra dependency.
 *
 * Configure with:
 *   RESEND_API_KEY=re_…
 *   EMAIL_FROM="Labonno <orders@yourdomain.com>"
 *   EMAIL_REPLY_TO=hello@yourdomain.com        (optional)
 *   EMAIL_TEST_OVERRIDE=you@gmail.com          (optional: send everything here while testing)
 *
 * Without a key nothing is sent and nothing breaks: the order still goes through, and the
 * admin order page tells you the email was skipped.
 */
export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function mailerSummary() {
  return {
    configured: mailerConfigured(),
    from: process.env.EMAIL_FROM ?? "",
    replyTo: process.env.EMAIL_REPLY_TO ?? "",
    override: process.env.EMAIL_TEST_OVERRIDE ?? "",
  };
}

export async function sendMail(input: MailInput): Promise<{ ok: boolean; skipped?: boolean; error?: string; id?: string }> {
  if (!mailerConfigured()) return { ok: false, skipped: true, error: "Email is not configured (RESEND_API_KEY / EMAIL_FROM)." };

  const to = process.env.EMAIL_TEST_OVERRIDE || input.to;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: input.replyTo || process.env.EMAIL_REPLY_TO || undefined,
      }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok) return { ok: false, error: data.message ?? `Resend returned ${response.status}` };
    return { ok: true, id: data.id };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
