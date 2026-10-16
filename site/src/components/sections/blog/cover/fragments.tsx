"use client";

/**
 * The nine coded UI fragments that float over a cover plate (spec: one per post).
 * Pure DOM/SVG, sized in em (see blog-cover.css). Each takes its `fragment_data`
 * and `active` (true while the host card is hovered or focused).
 *
 * All values come from `blog-covers.json`; anything derived (pips, day-over-day
 * deltas, hour ticks) is computed from that data. The gold breakout curve on the
 * score-card poster is decorative and the cover carries an "Illustrative" tag.
 */
import Image from "next/image";
import { Check, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import type {
  AgentTraceData,
  BoardGridData,
  FragmentSpec,
  HookTimelineData,
  McpTerminalData,
  NicheChipsData,
  ScoreCardData,
  SearchBarData,
  TrackingChartData,
  TrendChartData,
} from "@/lib/blog/types";
import { smarten } from "@/lib/blog/smart-quotes";
import { BREAKOUT_CURVE, buildSeries, fmt } from "./charts";

const cssVar = (name: string, value: string | number) => ({ [name]: value }) as CSSProperties;

/** Per-fragment tilt (2D rotate + skew), so side-by-side covers do not read as one template. */
const tilt = (rz: number, sk: number): CSSProperties => ({ ...cssVar("--bc-rz", `${rz}deg`), ...cssVar("--bc-sk", `${sk}deg`) });

const TILT: Record<FragmentSpec["kind"], CSSProperties> = {
  "search-bar": tilt(-0.8, 0),
  "score-card": tilt(-2, 0),
  "hook-timeline": tilt(0.5, -0.8),
  "trend-chart": tilt(-1, -1),
  "board-grid": tilt(0.9, 0),
  "agent-trace": tilt(-1.4, 1),
  "tracking-chart": tilt(1, -1.2),
  "mcp-terminal": tilt(-0.6, 0),
  "niche-chips": tilt(1.3, 0.6),
};

export function Fragment({ spec, active }: { spec: FragmentSpec; active: boolean }) {
  return (
    <div className="bc-tilt" style={TILT[spec.kind]}>
      {renderFragment(spec, active)}
    </div>
  );
}

function renderFragment(spec: FragmentSpec, active: boolean) {
  switch (spec.kind) {
    case "search-bar":
      return <SearchBar data={spec.data} />;
    case "score-card":
      return <ScoreCard data={spec.data} />;
    case "hook-timeline":
      return <HookTimeline data={spec.data} active={active} />;
    case "trend-chart":
      return <TrendChart data={spec.data} />;
    case "board-grid":
      return <BoardGrid data={spec.data} />;
    case "agent-trace":
      return <AgentTrace data={spec.data} />;
    case "tracking-chart":
      return <TrackingChart data={spec.data} />;
    case "mcp-terminal":
      return <McpTerminal data={spec.data} />;
    case "niche-chips":
      return <NicheChips data={spec.data} active={active} />;
  }
}

/** Small local posters (tiny files, served as-is). Illustrative stand-ins for matched videos. */
function Poster({ src, sizes = "120px" }: { src: string; sizes?: string }) {
  return <Image src={src} alt="" fill sizes={sizes} unoptimized draggable={false} className="object-cover" />;
}

const safeId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, "");

/* ----------------------------------------------------------- search-bar */

const SEARCH_VIDS = [
  { src: "/media/hero/1/4.webp", tag: "Result-first" },
  { src: "/media/hero/1/8.webp", tag: "Problem call-out" },
  { src: "/media/hero/1/10.webp", tag: "Open loop" },
];

function SearchBar({ data }: { data: SearchBarData }) {
  return (
    <div className="bc-glass bc-search">
      <div className="bc-search-pill">
        <Search className="bc-ico" strokeWidth={2} />
        <span className="bc-search-q">
          <span>{data.query}</span>
        </span>
        <span className="bc-chip bc-chip-ink">Deep Search</span>
      </div>
      <div className="bc-search-meta">
        {data.platforms.map((p) => (
          <span key={p} className="bc-chip">
            {p}
          </span>
        ))}
        <span className="bc-chip bc-chip-mono">{data.scope}</span>
      </div>
      <div className="bc-search-result">
        <div className="bc-search-status">
          <Check className="bc-ico" strokeWidth={2.6} />
          {data.status}
          <span className="bc-progress">
            <i />
          </span>
        </div>
        <div className="bc-search-vids">
          {SEARCH_VIDS.map((v, i) => (
            <div key={v.src} className="bc-vid" style={cssVar("--i", i)}>
              <div className="bc-vid-poster">
                <Poster src={v.src} />
              </div>
              <span className="bc-chip">{v.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- score-card */

function ScoreCard({ data }: { data: ScoreCardData }) {
  const gid = safeId(useId());
  const name = data.title.replace(/\s*\(illustrative\)\s*/i, "").trim();
  const box = { w: 100, h: 34, padTop: 5, padBottom: 0 };
  const g = buildSeries(BREAKOUT_CURVE, box, 1);
  const last = BREAKOUT_CURVE.length - 1;
  return (
    <div className="bc-score">
      <div className="bc-score-poster">
        <Poster src="/media/hero/0/4.webp" sizes="200px" />
        <span className="bc-score-chip">
          {data.score}
          <small>/{data.out_of}</small>
        </span>
        <div className="bc-score-scrim" />
        <svg className="bc-score-chart" viewBox={`0 0 ${box.w} ${box.h}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${gid}-gold`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffc83d" stopOpacity="0.62" />
              <stop offset="1" stopColor="#ffc83d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={g.area} fill={`url(#${gid}-gold)`} />
          <path
            d={g.line}
            className="bc-draw"
            pathLength={1}
            fill="none"
            stroke="#ffc83d"
            strokeWidth="1.6"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={g.x(last)} cy={g.y(BREAKOUT_CURVE[last])} r="1.8" fill="#ffc83d" />
        </svg>
      </div>
      <div className="bc-glass bc-score-panel">
        <div className="bc-score-head">
          <span className="bc-label">Product score</span>
          <span className="bc-title">{name}</span>
        </div>
        <div className="bc-score-big">
          <b>
            {data.score}
            <small>/ {data.out_of}</small>
          </b>
          <span className="bc-chip bc-chip-breakout">
            <span className="bc-dot" />
            {data.verdict}
          </span>
        </div>
        <div className="bc-metrics">
          {data.metrics.map((m, i) => {
            const [have, of] = m.value.split("/").map((n) => parseInt(n, 10));
            return (
              <div key={m.label} className="bc-metric">
                <span>{m.label}</span>
                <span className="bc-pips" aria-label={m.value}>
                  {Array.from({ length: Number.isFinite(of) ? of : 2 }, (_, k) => (
                    <i key={k} className={k < have ? "on" : ""} style={cssVar("--i", i)} />
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- hook-timeline */

const parseSeconds = (t: string) => parseFloat(t.replace("s", ""));

function HookTimeline({ data, active }: { data: HookTimelineData; active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const [lit, setLit] = useState(-1);
  const times = data.segments.map((s) => parseSeconds(s.t));
  const span = Math.max(...times, 3);
  const ticks = Array.from({ length: Math.floor(span / 0.5) + 1 }, (_, i) => i * 0.5);

  useEffect(() => {
    const head = headRef.current;
    const track = rootRef.current?.querySelector<HTMLElement>(".bc-ruler");
    if (!head || !track) return;
    if (!active || prefersReducedMotion()) {
      gsap.killTweensOf(head);
      gsap.set(head, { opacity: 0, x: 0 });
      return;
    }
    const width = track.getBoundingClientRect().width;
    const tween = gsap.fromTo(
      head,
      { x: 0, opacity: 1 },
      {
        x: width,
        duration: 2.6,
        ease: "none",
        // `this` is the tween: the callback can fire during construction (immediate render)
        onUpdate(this: gsap.core.Tween) {
          const p = this.progress() * span;
          const idx = times.reduce((acc, t, i) => (p >= t - 0.02 ? i : acc), -1);
          setLit((prev) => (prev === idx ? prev : idx));
        },
        onComplete: () => {
          gsap.to(head, { opacity: 0, duration: 0.3 });
        },
      },
    );
    return () => {
      tween.kill();
      setLit(-1);
    };
    // times/span derive from `data`, which is static for a cover
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div ref={rootRef} className="bc-glass bc-hook">
      <div className="bc-hook-head">
        <div>
          <span className="bc-chip bc-chip-ink">{data.hook_family}</span>
          <span className="bc-label">{data.window.replace(" - ", " – ")}</span>
        </div>
        <span className="bc-score-pill">
          Hook score <b>{data.score}</b>
        </span>
      </div>
      <div className="bc-ruler">
        <div className="bc-ruler-line" />
        {ticks.map((t) => (
          <div key={t} className={`bc-tick ${Number.isInteger(t) ? "major" : ""}`} style={{ left: `${(t / span) * 100}%` }}>
            {Number.isInteger(t) && <span>{t}s</span>}
          </div>
        ))}
        {data.segments.map((s, i) => (
          <span
            key={s.t + s.label}
            className={`bc-dot-mark ${lit >= i ? "on" : ""}`}
            style={{ left: `${(times[i] / span) * 100}%` }}
          />
        ))}
        <span ref={headRef} className="bc-playhead" />
      </div>
      <svg className="bc-conn" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
        {data.segments.map((s, i) => {
          const x = (times[i] / span) * 100;
          const c = ((i + 0.5) / data.segments.length) * 100;
          return <path key={s.t + s.label} className={lit >= i ? "on" : ""} d={`M${x} 0V5L${c} 13V20`} />;
        })}
      </svg>
      <div className="bc-beats">
        {data.segments.map((s, i) => (
          <div key={s.t + s.label} className={`bc-beat ${lit >= i ? "on" : ""}`}>
            <span className="bc-mono">{s.t}</span>
            {smarten(s.label)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- scrubbable charts */

/** Maps a pointer over an element to the nearest data index, plus its pixel offset. */
function useScrub(count: number, initial: number) {
  const [state, setState] = useState({ i: initial, px: -1 });
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const rel = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const i = Math.round(rel * (count - 1));
    setState({ i, px: (i / (count - 1)) * r.width });
  };
  const onLeave = () => setState({ i: initial, px: -1 });
  return { ...state, onMove, onLeave };
}

/* ---------------------------------------------------------- trend-chart */

function TrendChart({ data }: { data: TrendChartData }) {
  const gid = safeId(useId());
  const [main, base] = data.series;
  const box = { w: 220, h: 96, padTop: 6, padBottom: 4 };
  const max = Math.max(...main.points, ...base.points) * 1.08;
  const gm = buildSeries(main.points, box, max);
  const gb = buildSeries(base.points, box, max);
  const peak = main.points.indexOf(Math.max(...main.points));
  const scrub = useScrub(main.points.length, peak);
  const hours = main.points.map((_, i) => Math.round((i / (main.points.length - 1)) * 48));
  const hovered = scrub.px >= 0;

  return (
    <div className="bc-glass bc-chart">
      <div className="bc-chart-head">
        <div>
          <span className="bc-label">Views per hour</span>
          <span className="bc-title">First 48h</span>
        </div>
        <span className="bc-chip bc-chip-growth bc-chip-mono">
          <span className="bc-dot" />
          {data.badge}
        </span>
      </div>
      <div className="bc-plot" onPointerMove={scrub.onMove} onPointerLeave={scrub.onLeave}>
        <svg viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          <defs>
            <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#16a05a" stopOpacity="0.3" />
              <stop offset="1" stopColor="#16a05a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={box.w} y1={box.h * f} y2={box.h * f} stroke="rgba(15,15,15,.07)" strokeWidth="1" />
          ))}
          <path d={gm.area} fill={`url(#${gid}-g)`} />
          <path
            d={gb.line}
            fill="none"
            stroke="rgba(15,15,15,.45)"
            strokeWidth="1.4"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={gm.line}
            className="bc-draw"
            pathLength={1}
            fill="none"
            stroke="#16a05a"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={gm.x(scrub.i)} cy={gm.y(main.points[scrub.i])} r="3.2" fill="#fff" stroke="#16a05a" strokeWidth="2" />
          <circle cx={gb.x(scrub.i)} cy={gb.y(base.points[scrub.i])} r="2.4" fill="#fff" stroke="rgba(15,15,15,.55)" strokeWidth="1.5" />
        </svg>
        {hovered && (
          <>
            <span className="bc-cross" style={{ translate: `${scrub.px}px 0` }} />
            <span className="bc-tip" style={{ translate: `calc(${scrub.px}px - ${scrub.i > 3 ? "105%" : "-8%"}) 0` }}>
              <span className="bc-mono">{fmt(main.points[scrub.i])} v/h</span>
              <span style={{ opacity: 0.6 }}>median {fmt(base.points[scrub.i])}</span>
            </span>
          </>
        )}
      </div>
      <div className="bc-axis">
        {[hours[0], hours[Math.floor(hours.length / 2)], hours[hours.length - 1]].map((h) => (
          <span key={h}>{h}h</span>
        ))}
      </div>
      <div className="bc-legend">
        <span>
          <i /> {main.label}
        </span>
        <span>
          <i className="dash" /> {base.label}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- tracking-chart */

function TrackingChart({ data }: { data: TrackingChartData }) {
  const gid = safeId(useId());
  const box = { w: 220, h: 84, padTop: 8, padBottom: 4 };
  const max = Math.max(...data.points) * 1.08;
  const g = buildSeries(data.points, box, max);
  const deltas = data.points.map((p, i) => (i === 0 ? p : p - data.points[i - 1]));
  const maxDelta = Math.max(...deltas);
  const hot = deltas.indexOf(maxDelta);
  const scrub = useScrub(data.points.length, hot);
  const hovered = scrub.px >= 0;
  const handle = data.account.replace("@", "");

  return (
    <div className="bc-glass bc-chart">
      <div className="bc-chart-head">
        <div style={{ display: "flex", alignItems: "center", gap: "0.7em" }}>
          <span className="bc-avatar" aria-hidden="true">
            {handle.slice(0, 2)}
          </span>
          <div className="bc-stack">
            <span className="bc-title">{data.account}</span>
            <span className="bc-label">{data.metric}</span>
          </div>
        </div>
        <span className="bc-chip bc-chip-accent">{data.badge}</span>
      </div>
      <div className="bc-plot" onPointerMove={scrub.onMove} onPointerLeave={scrub.onLeave}>
        <svg viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          <defs>
            <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0f0f0f" stopOpacity="0.16" />
              <stop offset="1" stopColor="#0f0f0f" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map((f) => (
            <line key={f} x1="0" x2={box.w} y1={box.h * f} y2={box.h * f} stroke="rgba(15,15,15,.07)" strokeWidth="1" />
          ))}
          <path d={g.area} fill={`url(#${gid}-g)`} />
          <path
            d={g.line}
            className="bc-draw"
            pathLength={1}
            fill="none"
            stroke="#0f0f0f"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={g.x(hot)} cy={g.y(data.points[hot])} r="4.2" fill="#ffc83d" opacity="0.35" />
          <circle cx={g.x(hot)} cy={g.y(data.points[hot])} r="2.6" fill="#e0a100" />
          <circle
            cx={g.x(scrub.i)}
            cy={g.y(data.points[scrub.i])}
            r="3.2"
            fill="#fff"
            stroke="#0f0f0f"
            strokeWidth="2"
            opacity={scrub.i === hot && !hovered ? 0 : 1}
          />
        </svg>
        {hovered ? (
          <>
            <span className="bc-cross" style={{ translate: `${scrub.px}px 0` }} />
            <span className="bc-tip" style={{ translate: `calc(${scrub.px}px - ${scrub.i > 3 ? "105%" : "-8%"}) 0` }}>
              <span className="bc-mono">{fmt(data.points[scrub.i])}</span>
              <span style={{ opacity: 0.6 }}>
                {data.labels[scrub.i]}, +{fmt(deltas[scrub.i])}
              </span>
            </span>
          </>
        ) : (
          <span
            className="bc-chip bc-chip-breakout bc-chip-mono"
            style={{ position: "absolute", top: "-0.6em", left: `${(hot / (data.points.length - 1)) * 100}%`, translate: "-108% 0" }}
          >
            {data.delta}
          </span>
        )}
      </div>
      <div className="bc-bars" aria-hidden="true">
        {deltas.map((d, i) => (
          <i
            key={data.labels[i]}
            className={`${i === hot ? "hot" : ""} ${i === scrub.i && hovered ? "cur" : ""}`}
            style={{ ...cssVar("--h", `${Math.max(8, (d / maxDelta) * 100)}%`), ...cssVar("--i", i) }}
          />
        ))}
      </div>
      <div className="bc-axis">
        {data.labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- board-grid */

const BOARD_POSTERS = [
  "/media/hero/2/1.webp",
  "/media/hero/2/4.webp",
  "/media/hero/2/6.webp",
  "/media/hero/2/8.webp",
  "/media/hero/2/9.webp",
  "/media/hero/2/11.webp",
];

function BoardGrid({ data }: { data: BoardGridData }) {
  return (
    <div className="bc-glass bc-board">
      <div className="bc-board-head">
        <span className="bc-title">{data.board}</span>
        <span className="bc-chip bc-chip-mono">{data.items.length} formats</span>
      </div>
      <div className="bc-board-grid">
        {data.items.map((item, i) => (
          <div key={item.label} className="bc-tile" style={cssVar("--i", i)}>
            <Poster src={BOARD_POSTERS[i % BOARD_POSTERS.length]} sizes="140px" />
            <span className="bc-tile-score">{item.score}</span>
            <span className="bc-tile-scrim" />
            <span className="bc-tile-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- agent-trace */

function AgentTrace({ data }: { data: AgentTraceData }) {
  const done = data.steps.filter((s) => s.status === "done").length;
  return (
    <div className="bc-glass bc-trace">
      <div className="bc-trace-head">
        <div>
          <span className="bc-chip bc-chip-ink">Deep Search</span>
          <span className="bc-label">
            {done} of {data.steps.length} steps
          </span>
        </div>
      </div>
      <div className="bc-trace-list">
        {data.steps.map((s, i) => (
          <div key={s.label} className={`bc-step ${s.status}`} style={cssVar("--i", i)}>
            <span className="bc-step-ico">{s.status === "done" && <Check className="bc-ico" strokeWidth={3} />}</span>
            <span>{s.label}</span>
            <span className="bc-mono">{s.status}</span>
          </div>
        ))}
      </div>
      <div className="bc-bar-run" aria-hidden="true">
        <i />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- mcp-terminal */

function termLine(line: string) {
  const prompt = /^([$>])\s?/.exec(line);
  const rest = prompt ? line.slice(prompt[0].length) : line;
  const lead = prompt ? <span className="p">{prompt[1]} </span> : <span className="p">{"  "}</span>;
  const connected = /^(\/mcp\s+)(connected:)(.*)$/.exec(rest);
  if (connected) {
    return (
      <>
        {lead}
        <span className="c">{connected[1]}</span>
        <span className="ok">{connected[2]}</span>
        {connected[3]}
      </>
    );
  }
  const cmd = /^(\S+)(\s.*)?$/.exec(rest.trimStart());
  if (prompt && cmd) {
    return (
      <>
        {lead}
        <span className="c">{cmd[1]}</span>
        {cmd[2]}
      </>
    );
  }
  return (
    <>
      {lead}
      <span className="dim">{rest.trimStart().replace(/\s{2,}/g, "  ·  ")}</span>
    </>
  );
}

function McpTerminal({ data }: { data: McpTerminalData }) {
  return (
    <div className="bc-glass bc-term">
      <div className="bc-term-bar">
        <i />
        <i />
        <i />
        <span className="bc-label">agent · conthunt</span>
      </div>
      <div className="bc-term-body">
        {data.lines.map((line, i) => (
          <div key={line} className="bc-term-line" style={cssVar("--i", i)}>
            {termLine(line)}
            {i === data.lines.length - 1 && <span className="bc-caret" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- niche-chips */

const STATE_ORDER = ["Emerging", "Rising", "Peaking", "Fading"];
const STATE_COLOR: Record<string, string> = {
  Emerging: "var(--accent)",
  Rising: "var(--growth)",
  Peaking: "var(--breakout)",
  Fading: "var(--decline)",
};

function NicheChips({ data, active }: { data: NicheChipsData; active: boolean }) {
  const labels = data.chips.map((c) => c.label);
  const baseIdx = Math.max(0, labels.indexOf(data.active));
  const [sweep, setSweep] = useState(0);
  const [pinned, setPinned] = useState<string | null>(null);

  // While the card is hovered, sweep through the chips like a radar pass; a chip under
  // the pointer pins the selection. Leaving the card resets both.
  useEffect(() => {
    if (!active || pinned !== null || prefersReducedMotion()) return;
    const id = window.setInterval(() => setSweep((n) => n + 1), 1100);
    return () => window.clearInterval(id);
  }, [active, pinned]);

  useEffect(() => {
    if (!active) return;
    return () => {
      setSweep(0);
      setPinned(null);
    };
  }, [active]);

  const current = !active ? data.active : (pinned ?? labels[(baseIdx + sweep) % labels.length]);

  const state = data.chips.find((c) => c.label === current)?.state;

  return (
    <div className="bc-glass bc-niche">
      <div className="bc-niche-head">
        <span className="bc-title">Weekly radar</span>
        <span className="bc-chip bc-chip-mono">{data.window}</span>
      </div>
      <div className="bc-cloud">
        {data.chips.map((c) => (
          <span
            key={c.label}
            className={`bc-niche-chip ${c.label === current ? "on" : ""}`}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse") return;
              setPinned(c.label);
            }}
          >
            {c.label}
            <span className="bc-state">
              <span className="bc-dot" style={{ color: STATE_COLOR[c.state] ?? "currentColor" }} />
              {c.state}
            </span>
          </span>
        ))}
      </div>
      <div className="bc-life" aria-hidden="true">
        {STATE_ORDER.map((s) => (
          <span key={s} className={s === state ? "on" : ""}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
