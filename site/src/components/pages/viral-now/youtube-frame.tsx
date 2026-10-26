"use client";

/**
 * The same stripped YouTube player the app uses on a card and in the drawer.
 * Controls, keyboard, fullscreen, annotations, related videos, and the info bar
 * are off. The frame ignores pointer events, so the remaining YouTube chrome
 * cannot be clicked. The poster stays up until playback actually starts.
 */
import { useEffect, useRef, useState } from "react";

const PLAYER_VARS = {
  autoplay: 0,
  controls: 0,
  disablekb: 1,
  enablejsapi: 1,
  fs: 0,
  iv_load_policy: 3,
  modestbranding: 1,
  mute: 1,
  playsinline: 1,
  rel: 0,
  showinfo: 0,
};

type YouTubePlayer = {
  destroy: () => void;
};

type YouTubeEvent = {
  target: { mute: () => void; playVideo: () => void };
  data: number;
};

let loadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  const ready = window as Window & {
    YT?: { Player?: new (el: HTMLElement, options: object) => YouTubePlayer };
    onYouTubeIframeAPIReady?: () => void;
  };
  if (ready.YT?.Player) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    const script = existing ?? document.createElement("script");
    const previous = ready.onYouTubeIframeAPIReady;
    ready.onYouTubeIframeAPIReady = () => {
      ready.onYouTubeIframeAPIReady = previous;
      resolve();
      previous?.();
    };
    script.addEventListener(
      "error",
      () => {
        loadPromise = null;
        reject(new Error("YouTube IFrame API failed to load"));
      },
      { once: true },
    );
    if (!existing) {
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return loadPromise;
}

export function YouTubeFrame({ videoId, className }: { videoId: string; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;
    let host: HTMLDivElement | null = null;

    void loadYouTubeAPI()
      .then(() => {
        if (cancelled || !root.isConnected) return;
        const YT = (window as unknown as { YT: { Player: new (el: HTMLElement, options: object) => YouTubePlayer } }).YT;
        host = document.createElement("div");
        host.style.cssText = "width:100%;height:100%;";
        const mount = document.createElement("div");
        host.appendChild(mount);
        root.appendChild(host);
        player = new YT.Player(mount, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: { ...PLAYER_VARS, loop: 1, playlist: videoId, origin: window.location.origin },
          events: {
            onReady: (event: YouTubeEvent) => {
              if (cancelled) return;
              event.target.mute();
              event.target.playVideo();
            },
            onStateChange: (event: YouTubeEvent) => {
              if (!cancelled && event.data === 1) setPlaying(true);
            },
          },
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      try {
        player?.destroy();
      } catch {
        host?.remove();
      }
      host?.remove();
    };
  }, [videoId]);

  return <div ref={rootRef} className={className} data-playing={playing ? "true" : "false"} />;
}
