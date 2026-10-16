/**
 * Newsletter subscription (`subscribeToNewsletter`) and the mode it runs in.
 *
 * The legacy page's form never posted anywhere (it only checked for an "@" and
 * flipped to a success message client-side), and `data.submit.endpoint` in
 * `src/content/site/newsletter.ts` is "MISSING". So there is no provider yet.
 * A sign-up form must never tell a visitor "Successfully joined!" for an address
 * that was thrown away, so the form has three modes:
 *
 *   live    An endpoint is configured. The email is POSTed to it and the UI
 *           reports the real result.
 *             - `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` (build-time env var), or
 *             - `data.submit.endpoint` in the content file once it holds a URL.
 *           Body: JSON `{ "email": "...", "source": "landing-footer" }`. Any 2xx
 *           response counts as success.
 *   demo    No endpoint, and a development build (or `NEXT_PUBLIC_NEWSLETTER_DEMO=1`).
 *           The submit resolves locally after a short delay so the pending and
 *           success states can be reviewed. NOTHING IS SENT, and the form says so
 *           in a "Demo mode" note under the field.
 *   closed  No endpoint in a production build. The submit button is disabled and
 *           a note says sign-up opens soon. Nothing can be mis-reported.
 *
 * TODO(newsletter): pick a provider and either set the env var to its form
 * endpoint, or add a Route Handler (POST /api/newsletter, which can hold the
 * provider's secret key) and point the env var at `/api/newsletter`. No UI change
 * is needed: <NewsletterForm /> only calls `subscribeToNewsletter()`.
 */
import { data } from "@/content/site/newsletter";

export type SubscribeResult = { ok: true } | { ok: false; error: string };
export type NewsletterMode = "live" | "demo" | "closed";

/** Same shape the legacy page used: something@something.tld. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fromEnv = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT?.trim() ?? "";
const fromContent = data.submit.endpoint && data.submit.endpoint !== "MISSING" ? data.submit.endpoint : "";
const ENDPOINT = fromEnv || fromContent;

export const NEWSLETTER_MODE: NewsletterMode = ENDPOINT
  ? "live"
  : process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_NEWSLETTER_DEMO === "1"
    ? "demo"
    : "closed";

const REQUEST_TIMEOUT_MS = 10_000;

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const value = email.trim();
  if (!EMAIL_PATTERN.test(value)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (NEWSLETTER_MODE === "closed") {
    return { ok: false, error: "Newsletter sign-up opens soon." };
  }

  if (NEWSLETTER_MODE === "demo") {
    // DEMO ONLY: nothing is sent. Simulated latency so the pending state is visible.
    await new Promise((resolve) => setTimeout(resolve, 650));
    return { ok: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ email: value, source: "landing-footer" }),
      signal: controller.signal,
    });
    if (res.ok) return { ok: true };
    if (res.status === 429) return { ok: false, error: "Too many attempts. Try again in a minute." };
    return { ok: false, error: "Something went wrong. Try again." };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Try again." };
  } finally {
    clearTimeout(timer);
  }
}
