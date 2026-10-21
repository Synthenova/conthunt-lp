"use client";

/**
 * Navbar — retained structure: logo left (→ Home), pages center (Pricing,
 * Viral Now, Resources, with active state), Login + "Get started" right.
 *
 * At the top of the page it is LARGE: full content width, 88px tall, no chrome.
 * Past ~48px of scroll it settles into a compact floating centered pill of
 * frosted glass (translucent paper at 20% + 60px backdrop blur + a 1.15 brightness lift, no border, a
 * layered shadow below: a 1px contact edge plus a soft drop, so the pill still reads
 * over light content and stays milky rather than muddy gray over dark media). The switch is a CSS transition on `data-compact` with the site
 * ease (0.6s), with hysteresis (compact > 48px, expand < 24px).
 *
 * Auto-hide (compact only): scrolling DOWN 40px in one direction past 240px of
 * page hides it; scrolling UP 14px brings it back. It always shows near the
 * top, while the mobile menu is open, while it holds keyboard focus, and when
 * the pointer touches the top 64px of the window.
 * On /viral-now neither happens. The header sits in the page and scrolls away
 * with it. The niche row is the sticky bar, so it takes the top edge.
 * Below 768px it is a compact bar with a menu button that opens a sheet.
 *
 * Rendered by src/app/(site)/layout.tsx. It is `position: fixed`, so the first
 * section must leave room for it (use the `--nav-h` variable, 88px). While a native
 * modal <dialog> is open it steps aside: the dialog's owner sets `data-modal-open`
 * on <html> after showModal() and removes it on `close` and in cleanup, and
 * globals.css hides `[data-site-nav]` under `:root[data-modal-open]` (no `:has()`).
 * While the landed full-size Deep Search simulator owns the screen, the statement scene sets
 * `data-immersive` on <html> and globals.css slides the bar away the same way (OWNER_DECISIONS D5).
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useSound } from "@/lib/sound";
import { GET_STARTED_URL, isActivePath, LOGIN_URL, NAV_LINKS, ROUTES } from "@/lib/links";
import { MobileMenu } from "./mobile-menu";
import { navDotClass } from "./nav-dot";

const COMPACT_AT = 48;
const EXPAND_AT = 24;
/** Auto-hide only below this scroll depth. */
const HIDE_MIN_Y = 240;
/** Continuous downward scroll needed to hide. */
const HIDE_AFTER = 40;
/** Continuous upward scroll needed to reveal. */
const SHOW_AFTER = 14;
/** Pointer within this many px of the top edge reveals the bar. */
const PEEK_ZONE = 64;

function useNavScroll(
  pinnedOpen: boolean,
  headerRef: React.RefObject<HTMLElement | null>,
  /** Viral Now keeps the large bar fixed; the sticky niche row sits under it. */
  lockExpanded: boolean,
) {
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (lockExpanded) {
      setCompact(false);
      setHidden(false);
      return;
    }
    let frame = 0;
    let lastY = window.scrollY;
    let run = 0; // distance traveled in the current direction (+down, -up)
    let peek = false;
    // Reveal-on-scroll-up only counts real user input (wheel, touch, keys), so
    // layout shifts and smooth-scroll settling near the page end don't pop the bar.
    let lastUserScroll = -Infinity;
    const markUser = () => {
      lastUserScroll = performance.now();
    };

    const read = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      setCompact((prev) => (prev ? y > EXPAND_AT : y > COMPACT_AT));

      if (dy !== 0) run = Math.sign(dy) === Math.sign(run) ? run + dy : dy;
      const focusInside = !!headerRef.current?.contains(document.activeElement);
      if (y < HIDE_MIN_Y || pinnedOpen || focusInside || peek) setHidden(false);
      else if (run > HIDE_AFTER) setHidden(true);
      else if (run < -SHOW_AFTER && performance.now() - lastUserScroll < 500) setHidden(false);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    const onPointer = (e: PointerEvent) => {
      // Ignore Chrome's synthetic post-scroll mouse moves (no movement): only a real
      // hand on the mouse heading for the top edge should reveal the bar.
      if (e.pointerType !== "mouse" || (e.movementX === 0 && e.movementY === 0)) return;
      const near = e.clientY <= PEEK_ZONE;
      if (near === peek) return;
      peek = near;
      if (near) setHidden(false);
    };
    const onFocus = () => setHidden(false);

    onScroll(); // initial state (e.g. reload mid-page), batched into a frame
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("wheel", markUser, { passive: true });
    window.addEventListener("touchmove", markUser, { passive: true });
    window.addEventListener("keydown", markUser, { passive: true });
    const header = headerRef.current;
    header?.addEventListener("focusin", onFocus);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("wheel", markUser);
      window.removeEventListener("touchmove", markUser);
      window.removeEventListener("keydown", markUser);
      header?.removeEventListener("focusin", onFocus);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pinnedOpen, headerRef, lockExpanded]);

  return {
    compact: lockExpanded ? false : compact,
    hidden: lockExpanded ? false : hidden && !pinnedOpen,
  };
}

/**
 * Desktop sound toggle. The accessible name is constant ("Interface sounds") and
 * the state lives in aria-pressed, so assistive tech announces "pressed / not
 * pressed" instead of a name that changes under the user. The tooltip repeats the
 * name, so it never adds a second, conflicting description.
 */
function SoundToggle() {
  const { on, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label="Interface sounds"
      title="Interface sounds"
      className="hidden size-10 items-center justify-center rounded-[10px] text-muted transition-colors duration-200 ease-out hover:bg-surface/70 hover:text-ink group-data-[compact=true]/nav:text-ink md:flex"
    >
      {on ? <Volume2 className="size-[17px]" aria-hidden="true" /> : <VolumeX className="size-[17px]" aria-hidden="true" />}
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // The niche row is the sticky bar on this page. The site header stays in the
  // document and scrolls off; the mobile sheet still needs it pinned while open.
  const lockExpanded = isActivePath(pathname, ROUTES.viralNow);
  const inlineHeader = lockExpanded && !menuOpen;
  const { compact, hidden } = useNavScroll(menuOpen, headerRef, lockExpanded);
  const solid = menuOpen || (!lockExpanded && compact);

  return (
    <header
      ref={headerRef}
      data-site-nav=""
      data-compact={solid ? "true" : "false"}
      data-hidden={hidden ? "true" : "false"}
      className={cn(
        "group/nav pointer-events-none z-50 flex justify-center",
        inlineHeader ? "relative" : "fixed inset-x-0 top-0",
        "transition-transform duration-[450ms] ease-out will-change-transform motion-reduce:transition-none",
        // Clear the pill's drop shadow too (it reaches ~24px below the pill), so no gray strip lingers at the top edge.
        "data-[hidden=true]:-translate-y-[calc(100%+40px)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto relative grid w-full max-w-full grid-cols-[1fr_auto] items-center border border-transparent md:grid-cols-[1fr_auto_1fr]",
          "transition-[max-width,width,height,margin,padding,border-radius,background-color,border-color,box-shadow,backdrop-filter] duration-[600ms] ease-out motion-reduce:transition-none",
          // Large (top of page)
          "h-16 px-5 md:h-[var(--nav-h)] md:px-8 lg:px-10",
          // Compact floating pill
          "group-data-[compact=true]/nav:mt-2 group-data-[compact=true]/nav:h-14 group-data-[compact=true]/nav:w-[calc(100%-16px)] group-data-[compact=true]/nav:rounded-[20px] group-data-[compact=true]/nav:pl-4 group-data-[compact=true]/nav:pr-2",
          "md:group-data-[compact=true]/nav:mt-3 md:group-data-[compact=true]/nav:h-[60px] md:group-data-[compact=true]/nav:w-[calc(100%-32px)] md:group-data-[compact=true]/nav:max-w-[780px] md:group-data-[compact=true]/nav:rounded-[22px] md:group-data-[compact=true]/nav:pl-5",
          // Frosted glass (owner spec): a faint white tint (20%, the ceiling) over a very heavy 60px blur, no border; a 1.15 brightness lift
          // keeps text at 4.5:1 or better over dark media. The shadow
          // gives the edge its definition instead: a tight contact line, a mid drop and a long soft one.
          "group-data-[compact=true]/nav:bg-paper/20 group-data-[compact=true]/nav:backdrop-blur-[60px] group-data-[compact=true]/nav:backdrop-saturate-[1.8] group-data-[compact=true]/nav:backdrop-brightness-[1.15]",
          "group-data-[compact=true]/nav:shadow-[0_1px_2px_rgba(15,15,15,0.05),0_2px_8px_-3px_rgba(15,15,15,0.08),0_12px_30px_-12px_rgba(15,15,15,0.15)]",
        )}
      >
        {/* Logo */}
        <Link
          href={ROUTES.home}
          aria-label="ContHunt home"
          // h-10 gives a 40px target (WCAG 2.5.8) around the 18-22px wordmark without moving it.
          className="flex h-10 w-fit items-center justify-self-start rounded-[6px]"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/wordmark-ink.png"
            alt="ContHunt"
            width={136}
            height={22}
            preload
            className={cn(
              // Explicit sizes keep the 2208×358 aspect (6.17:1) at both breakpoints.
              "h-[18px] w-[111px] origin-left transition-transform duration-[600ms] ease-out motion-reduce:transition-none md:h-[22px] md:w-[136px]",
              "md:group-data-[compact=true]/nav:scale-[0.86]",
            )}
          />
        </Link>

        {/* Pages (desktop) */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-9 items-center rounded-[10px] px-3 text-[14px] font-medium tracking-[-0.005em] transition-colors duration-200 ease-out",
                      // In the compact pill the inactive links step up to full ink: the 20% glass lets dark hero cards and video through, where muted and ink-2 fall under 4.5:1.
                      active ? "text-ink" : "text-muted hover:bg-surface/70 hover:text-ink group-data-[compact=true]/nav:text-ink",
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full transition-[opacity,scale] duration-300 ease-out",
                        navDotClass(link.label),
                        active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-self-end gap-1.5">
          <SoundToggle />
          <a
            href={LOGIN_URL}
            className="hidden h-10 items-center rounded-[10px] px-3 text-[14px] font-medium text-ink-2 transition-colors duration-200 ease-out hover:text-ink group-data-[compact=true]/nav:text-ink md:flex"
          >
            Login
          </a>
          <Button href={GET_STARTED_URL} size="md" className="hidden h-10 px-4 md:inline-flex">
            Get started
          </Button>
          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
