"use client";
import { useState, type FormEvent } from "react";
import { NEWSLETTER_MODE, subscribeToNewsletter } from "@/components/sections/footer/subscribe";
import { Panel, button, field } from "./shared";
export function NewsletterSignupCard() {
  const [email,setEmail]=useState(""); const [status,setStatus]=useState(""); const [pending,setPending]=useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setPending(true); setStatus(""); try { const result=await subscribeToNewsletter(email); setStatus(result.ok ? NEWSLETTER_MODE === "demo" ? "Demo only: no subscription was saved." : "You are subscribed." : result.error); } catch { setStatus("Something went wrong. Try again."); } finally { setPending(false); } }
  return <Panel><h2 className="text-xl font-medium">Get ContHunt updates</h2><form className="space-y-3" onSubmit={submit}><label className="block text-sm">Email address<input className={field} type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></label><button className={button} disabled={pending || NEWSLETTER_MODE === "closed"}>{pending ? "Submitting…" : "Subscribe"}</button></form>{NEWSLETTER_MODE === "closed" && <p>Newsletter sign-up opens soon.</p>}{NEWSLETTER_MODE === "demo" && <p>Demo mode: submissions are not saved.</p>}<p aria-live="polite">{status}</p></Panel>;
}
export default NewsletterSignupCard;
