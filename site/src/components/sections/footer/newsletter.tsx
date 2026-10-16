"use client";

/**
 * NewsletterForm — email field with an ink submit button, plus pending, error
 * and success states. Copy comes from `src/content/site/newsletter.ts`.
 *
 * Submission goes through `subscribeToNewsletter()` (./subscribe.ts). Until a
 * provider endpoint is configured the form runs in one of two honest modes
 * (see NEWSLETTER_MODE there): "demo" (development: local success, labelled
 * "Demo mode, nothing is sent") or "closed" (production: submit disabled, a note
 * says sign-up opens soon). Only "live" talks to a real endpoint.
 *
 * States: idle -> submitting -> success | error. The error shakes the field once
 * (transform only, skipped under reduced motion) and is announced via role="alert".
 * On success the form is replaced by a confirmation with a drawn check mark and
 * the retained post-success "GET STARTED" link to the app. The form (and the control that
 * had focus) unmounts, so focus moves to the confirmation (tabIndex -1) instead of falling
 * to <body>; the next Tab lands on the link.
 */
import { ArrowRight, CircleAlert, LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { data } from "@/content/site/newsletter";
import { cn } from "@/lib/cn";
import { GET_STARTED_URL } from "@/lib/links";
import { prefersReducedMotion } from "@/lib/motion";
import { EMAIL_PATTERN, NEWSLETTER_MODE, subscribeToNewsletter } from "./subscribe";

type Status = "idle" | "submitting" | "success" | "error";

function CheckMark() {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M4.5 10.5l3.6 3.6 7.4-8"
          style={{
            strokeDasharray: 18,
            strokeDashoffset: drawn ? 0 : 18,
            transition: "stroke-dashoffset 500ms cubic-bezier(0.2, 0.715, 0.205, 0.99) 120ms",
          }}
        />
      </svg>
    </span>
  );
}

function ErrorLine({ id, message, className }: { id: string; message: string; className?: string }) {
  return (
    <p id={id} role="alert" className={cn("flex items-center gap-2 text-[14px] leading-5 text-ink", className)}>
      <CircleAlert aria-hidden="true" className="size-4 shrink-0 text-decline" />
      {message}
    </p>
  );
}

export function NewsletterForm({ className }: { className?: string }) {
  const uid = useId();
  const inputId = `${uid}-email`;
  const errorId = `${uid}-error`;
  const noteId = `${uid}-note`;
  const mode = NEWSLETTER_MODE;
  const closed = mode === "closed";
  // Demo and closed modes carry a note under the field, so that line reserves its height.
  const reserveLine = mode !== "live";
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fail = (message: string) => {
    setError(message);
    setStatus("error");
    inputRef.current?.focus();
    if (!prefersReducedMotion()) {
      fieldRef.current?.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-7px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(-3px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 380, easing: "cubic-bezier(0.2, 0.715, 0.205, 0.99)" },
      );
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting" || closed) return;
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      fail(value ? "That doesn't look like an email address." : "Enter your email address.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const result = await subscribeToNewsletter(value);
      if (result.ok) setStatus("success");
      else fail(result.error);
    } catch {
      fail("Something went wrong. Try again.");
    }
  };

  // The submit button / input unmount with the form; hand focus to the confirmation.
  useEffect(() => {
    if (status === "success") statusRef.current?.focus({ preventScroll: true });
  }, [status]);

  const invalid = status === "error";

  return (
    <div className={className}>
      <div aria-live="polite" className="relative min-h-[60px]">
        {status === "success" ? (
          <div
            ref={statusRef}
            role="status"
            tabIndex={-1}
            // The global :focus-visible ring squares corners to 4px; keep this panel's 14px.
            className="flex flex-col gap-3 rounded-[14px] bg-paper p-1.5 ring-1 ring-inset ring-hairline focus-visible:rounded-[14px] sm:flex-row sm:items-center sm:justify-between sm:gap-2"
          >
            <p className="flex items-center gap-3 pl-3 pt-2 text-[16px] font-medium tracking-[-0.01em] text-ink sm:py-0 sm:pt-0">
              <CheckMark />
              {data.submit.successMessage}
            </p>
            <a
              href={GET_STARTED_URL}
              className={cn(
                "group/cta inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-ink px-5 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-paper",
                "transition-[background-color,transform] duration-200 ease-out hover:bg-ink-2 active:scale-[0.96]",
              )}
            >
              {data.submit.postSuccessLabel}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </a>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit}>
            <div
              ref={fieldRef}
              className={cn(
                "flex flex-col gap-1.5 rounded-[14px] bg-paper p-1.5 ring-1 ring-inset transition-[box-shadow] duration-200 ease-out sm:flex-row sm:items-center sm:gap-2",
                invalid
                  ? "ring-decline"
                  : closed
                    ? "ring-hairline"
                    : "ring-hairline hover:ring-ink/20 focus-within:ring-2! focus-within:ring-accent!",
              )}
            >
              <label htmlFor={inputId} className="sr-only">
                Email address
              </label>
              <input
                ref={inputRef}
                id={inputId}
                name="email"
                type={data.input.type}
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                placeholder={data.input.placeholder}
                value={email}
                disabled={status === "submitting" || closed}
                aria-invalid={invalid}
                aria-describedby={invalid ? errorId : reserveLine ? noteId : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") {
                    setStatus("idle");
                    setError(null);
                  }
                }}
                // h-12 + shrink-0 + w-full keep the stacked (mobile) field 48px tall: flex-1 in a flex-col sets flex-basis 0% and would collapse it.
                className="h-12 w-full min-w-0 shrink-0 rounded-[10px] bg-transparent px-4 text-[16px] tracking-[-0.01em] text-ink outline-none placeholder:text-ink-2/70 focus-visible:outline-none disabled:opacity-60 sm:w-auto sm:flex-1"
              />
              <button
                type="submit"
                disabled={status === "submitting" || closed}
                className={cn(
                  "relative inline-flex h-12 min-w-[176px] items-center justify-center gap-2 rounded-[10px] bg-ink px-5 font-mono text-[12px] font-medium uppercase tracking-[0.04em] text-paper",
                  "transition-[background-color,transform] duration-200 ease-out hover:bg-ink-2 active:scale-[0.96]",
                  "disabled:hover:bg-ink disabled:active:scale-100",
                  closed ? "disabled:cursor-not-allowed disabled:opacity-40" : "disabled:cursor-progress",
                )}
              >
                {status === "submitting" ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    Joining
                  </>
                ) : (
                  data.submit.label
                )}
              </button>
            </div>
            {mode === "live" && invalid && error && <ErrorLine id={errorId} message={error} className="absolute left-1 top-full mt-3" />}
          </form>
        )}
      </div>

      {reserveLine && (
        <div className="mt-3 min-h-5 text-[14px] leading-5 text-ink-2/75">
          {invalid && error ? (
            <ErrorLine id={errorId} message={error} />
          ) : closed ? (
            <p id={noteId}>
              Newsletter sign-up opens soon.{" "}
              <a
                href={GET_STARTED_URL}
                className="inline-flex items-center gap-1 font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-[text-decoration-color] duration-200 ease-out hover:decoration-ink"
              >
                Get started
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            </p>
          ) : (
            <p id={noteId} className="font-mono text-[11px] uppercase tracking-[0.04em]">
              Demo mode · nothing is sent
            </p>
          )}
        </div>
      )}
    </div>
  );
}
