"use client";

/**
 * The retained deep-dive recording (re-encoded, 15 s, no audio track) in a 16:9 frame.
 * Muted inline loop through the shared video manager while near the viewport (poster
 * only under reduced motion). A small pause toggle holds the loop where it is without
 * restarting it (WCAG 2.2.2). "Play full demo" restarts it from 0:00 with native
 * controls and takes it out of the manager so the visitor owns playback. There is no
 * sound control because the source is silent.
 */
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { posterStyle, useManagedVideo, videoManager } from "@/lib/media";
import { usePrefersReducedMotion } from "@/lib/motion";

const SRC_DESKTOP = "/media/deepdive/deepdive-1280.mp4";
const SRC_MOBILE = "/media/deepdive/deepdive-720.mp4";
const POSTER = "/media/deepdive/poster.webp";

export function DeepDive({ id, caption, className }: { id?: string; caption: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [full, setFull] = useState(false);
  const [held, setHeld] = useState(false);
  useManagedVideo(ref, { priority: 1, enabled: !full });

  // Pause holds the loop in place (the manager keeps it paused even in view).
  useEffect(() => {
    const el = ref.current;
    if (!el || full) return;
    videoManager.hold(el, held);
  }, [held, full]);

  // Runs after the manager has released the element (its cleanup pauses it).
  useEffect(() => {
    const el = ref.current;
    if (!full || !el) return;
    el.currentTime = 0;
    el.muted = true;
    el.focus({ preventScroll: true });
    el.play().catch(() => {
      /* The native controls stay available if the browser refuses autoplay. */
    });
  }, [full]);

  return (
    <figure id={id} className={cn("motion-reduce:scroll-mt-24", className)}>
      <div className="relative aspect-video overflow-hidden rounded-card bg-surface shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
        <video
          ref={ref}
          style={posterStyle(POSTER)}
          muted
          playsInline
          loop
          preload="none"
          controls={full}
          disablePictureInPicture
          disableRemotePlayback
          aria-label="Product recording: a ContHunt deep dive, chatting with the agent about a saved short-form video"
          className="absolute inset-0 size-full object-cover"
        >
          <source media="(max-width: 767px)" src={SRC_MOBILE} type="video/mp4" />
          <source src={SRC_DESKTOP} type="video/mp4" />
        </video>
        {!full && (
          <button
            type="button"
            onClick={() => setFull(true)}
            className={cn(
              // Compact so the recording stays readable: 36px visual (44px hit area), and on
              // phones only the play square and the runtime show (the label stays in the name).
              "group/play absolute bottom-3 left-3 inline-flex h-9 items-center gap-2 rounded-[12px] bg-paper pl-1 pr-3 text-[13px] font-medium text-ink shadow-float sm:bottom-4 sm:left-4",
              "after:absolute after:-inset-1 after:content-[''] transition-[scale,background-color] duration-200 ease-out hover:bg-bg active:scale-[0.96]",
            )}
          >
            <span className="grid size-7 place-items-center rounded-[9px] bg-ink text-paper transition-[scale] duration-200 ease-out group-hover/play:scale-105">
              <Play className="size-3 translate-x-px fill-current" strokeWidth={2} />
            </span>
            <span className="max-sm:sr-only">Play full demo</span>
            <span className="font-mono text-[12px] tabular-nums text-ink/62">0:15</span>
          </button>
        )}
        {!full && !reduced && (
          <button
            type="button"
            onClick={() => setHeld((h) => !h)}
            aria-pressed={held}
            aria-label={held ? "Play the preview loop" : "Pause the preview loop"}
            title={held ? "Play the preview loop" : "Pause the preview loop"}
            className={cn(
              "absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-paper/90 text-ink shadow-float sm:bottom-4 sm:right-4",
              "transition-[scale,background-color] duration-200 ease-out after:absolute after:-inset-1 after:content-[''] hover:bg-paper active:scale-[0.94]",
            )}
          >
            {held ? (
              <Play className="size-3.5 translate-x-px fill-current" strokeWidth={2} />
            ) : (
              <Pause className="size-3.5 fill-current" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-ink/62">{caption}</figcaption>
    </figure>
  );
}
