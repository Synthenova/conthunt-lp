/**
 * Static markup for one card face and one card back. React renders the first
 * prompt set (so the board is complete without JavaScript); after hydration the
 * engine (engine.ts) repaints these nodes imperatively through their `data-f` /
 * `data-b` hooks, so props here never change after the first render.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  CHART_H,
  CHART_W,
  HERO_POSTER_SIZES,
  PARAMS,
  RADAR_R,
  TREND_LABEL,
  backKeywords,
  chartGeometry,
  formatViews,
  heroPosterSrcSet,
  paramValues,
  radarAxis,
  radarPoints,
  type GlyphMap,
  type HeroCard,
  type Trend,
} from "./data";
import s from "./hero.module.css";

/** A 1×1 transparent GIF: the <picture> source for a poster whose column is hidden. */
const BLANK_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const gradId = (trend: Trend) => `ch-hero-area-${trend}`;

/**
 * Shared gradients for the card area charts (one per trend). About 30% solid at
 * the line, settling to 18% at the card's foot (owner, hero-rev2 C); the
 * projected area reuses the same gradient at 45% opacity (hero.module.css .projArea).
 */
export function ChartDefs() {
  const stops: [Trend, string][] = [
    ["breakout", "var(--breakout-glow)"],
    ["growth", "var(--growth)"],
    ["decline", "var(--decline)"],
  ];
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute" focusable="false">
      <defs>
        {stops.map(([trend, color]) => (
          <linearGradient key={trend} id={gradId(trend)} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: trend === "breakout" ? 0.34 : 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.18 }} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

/**
 * The trend tag's icon (hero-rev14, Phosphor): star-fill for breakout, caret-double-up-bold for
 * growth, caret-double-down-bold for decline. All three paths ship and the face's data-trend shows
 * one (hero.module.css .trendIcon), so the engine's repaint needs no markup change.
 */
function TrendIcon() {
  return (
    <svg className={s.trendIcon} viewBox="0 0 256 256" aria-hidden="true" focusable="false">
      <path
        className={s.iconBreakout}
        d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"
      />
      <path
        className={s.iconGrowth}
        d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z"
      />
      <path
        className={s.iconDecline}
        d="M216.49,127.51a12,12,0,0,1,0,17l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,1,1,17-17L128,199l71.51-71.52A12,12,0,0,1,216.49,127.51Zm-97,17a12,12,0,0,0,17,0l80-80a12,12,0,0,0-17-17L128,119,56.49,47.51a12,12,0,0,0-17,17Z"
      />
    </svg>
  );
}

export interface FaceProps {
  card: HeroCard;
  glyphs: GlyphMap;
  chart?: boolean;
  eager?: boolean;
  /** Responsive poster (srcset/sizes, data.ts HERO_POSTER_SIZES). Board slots; not the static columns. */
  responsive?: boolean;
  /**
   * The media query under which the card's column is hidden (data.ts COLUMN_HIDDEN_MEDIA): a
   * <picture> source swaps in an empty image there (`display: none` does not stop an eager image).
   * A viewport query only approximates the hero's column count (scrollbar width, the column-5
   * height band), so the board also makes those posters lazy (`eager` false), which is exact.
   */
  hiddenMedia?: string;
  /** Rendered above the poster (the loop video on ranks 1–3). */
  media?: ReactNode;
  className?: string;
}

export function Face({ card, glyphs, chart = true, eager = false, responsive = false, hiddenMedia, media, className }: FaceProps) {
  const g = chartGeometry(card);
  // Plain <img>: the engine swaps `src` (and `srcset`) every wave (pre-decoded WebP, 360×640 ≤ 30 KB).
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-f="img"
      className={s.poster}
      src={card.poster}
      srcSet={responsive ? heroPosterSrcSet(card.poster) : undefined}
      sizes={responsive ? HERO_POSTER_SIZES : undefined}
      alt=""
      draggable={false}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
    />
  );
  return (
    <div className={cn(s.face, className)} data-face="" data-trend={card.trend} data-chart={chart ? "on" : "off"}>
      {hiddenMedia ? (
        <picture className="contents">
          <source media={hiddenMedia} srcSet={BLANK_IMAGE} />
          {img}
        </picture>
      ) : (
        img
      )}
      {media}
      <span className={s.scrimTop} />
      <span className={s.scrimBottom} />
      <span className={s.meta}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path data-f="glyph" d={glyphs[card.platform] ?? glyphs.tiktok} />
        </svg>
        <span data-f="views">{formatViews(card.views)}</span>
      </span>
      <span className={s.score}>
        <span data-f="score">{card.score}</span>%
      </span>
      <div className={s.chartBox}>
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path data-f="area" d={g.area} fill={`url(#${gradId(card.trend)})`} />
          {/* Projection: a paler area and a dotted line from the end dot to the right edge. */}
          <g data-f="proj" className={s.proj}>
            <path data-f="projArea" className={s.projArea} d={g.projArea} fill={`url(#${gradId(card.trend)})`} />
            <path data-f="projLine" className={s.projLine} d={g.projLine} />
          </g>
          <path data-f="line" className={s.line} d={g.line} />
        </svg>
        <span data-f="dot" className={s.dot} style={{ left: `${g.endX}%`, top: `${g.endY}%` }} />
      </div>
      {/* The card's growth label (hero-rev5; hero-rev14: a tinted chip with a trend icon, drawn above
          the chart, so it comes after it). It lives in the face, so a split-flap landing carries it
          with the poster and the chart; the engine repaints the text, and data-trend picks the icon
          and the colours (paintFace). */}
      <span className={s.trendTag}>
        <TrendIcon />
        <span data-f="trendText">{TREND_LABEL[card.trend]}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ back */

/**
 * Radar label layout, in the radar's own units (hexagon radius RADAR_R = 30).
 * The top and bottom axes read on one line ("HOOK 93"), which saves the height
 * the card does not have; the four side axes stack label over value.
 */
const LABEL_GAP = 4;
const RADAR_VIEWBOX = "-48 -46 96 93";

type RadarLabel =
  | { key: string; short: string; inline: true; y: number }
  | { key: string; short: string; inline: false; x: number; labelY: number; valueY: number; anchor: "start" | "end" };

function radarLabels(): RadarLabel[] {
  return PARAMS.map((p, i) => {
    const [ux, uy] = radarAxis(i);
    const d = RADAR_R + LABEL_GAP;
    if (Math.abs(ux) < 0.3) {
      // Baseline above the top vertex, or one cap-height below the bottom one.
      return { key: p.key, short: p.short, inline: true, y: uy < 0 ? -d - 1 : d + 8 };
    }
    const y = uy * d;
    return {
      key: p.key,
      short: p.short,
      inline: false,
      x: Math.round(ux * d * 10) / 10,
      labelY: y - 1,
      valueY: y + 9.5,
      anchor: ux > 0 ? "start" : "end",
    };
  });
}

const LABELS = radarLabels();
const RINGS = [0.33, 0.66, 1].map((k) => radarPoints([100, 100, 100, 100, 100, 100], RADAR_R * k));

export function CardBack({ card }: { card: HeroCard }) {
  const values = paramValues(card);
  return (
    <div className={cn(s.back, s.backCard)} data-back="" data-trend={card.trend}>
      {/* The six labelled radar axes carry the "scored on 6 signals" line; the
          footer row it used to take now holds a second row of keywords. */}
      <div className={s.backHead}>
        <span>Why it scored</span>
        <span data-b="rank" className={s.backRank}>
          #{card.rank}
        </span>
      </div>
      <div className={s.backScoreRow}>
        <span data-b="score" className={s.backScore}>
          {card.score}
        </span>
        <span className={s.backOf}>/100</span>
        <span data-b="trend" className={s.backTrend}>
          {TREND_LABEL[card.trend]}
        </span>
      </div>
      <svg className={s.radar} viewBox={RADAR_VIEWBOX} aria-hidden="true" focusable="false">
        {RINGS.map((points, i) => (
          <polygon key={i} className={s.radarGrid} points={points} />
        ))}
        {PARAMS.map((p, i) => {
          const [x, y] = radarAxis(i);
          return <line key={p.key} className={s.radarAxis} x1={0} y1={0} x2={x * RADAR_R} y2={y * RADAR_R} />;
        })}
        <polygon data-b="poly" className={s.radarPoly} points={radarPoints(values)} />
        {LABELS.map((l, i) =>
          l.inline ? (
            <text key={l.key} x={0} y={l.y} textAnchor="middle">
              <tspan className={s.radarLabel}>{l.short}</tspan>
              <tspan data-b={`v${i}`} className={s.radarValue} dx={3}>
                {values[i]}
              </tspan>
            </text>
          ) : (
            <g key={l.key}>
              <text className={s.radarLabel} x={l.x} y={l.labelY} textAnchor={l.anchor}>
                {l.short}
              </text>
              <text data-b={`v${i}`} className={s.radarValue} x={l.x} y={l.valueY} textAnchor={l.anchor}>
                {values[i]}
              </text>
            </g>
          ),
        )}
      </svg>
      {/* Compact cards (≤128px wide) show this grid instead of the radar. */}
      <dl className={s.paramList}>
        {PARAMS.map((p, i) => (
          <div key={p.key}>
            <dt>{p.short}</dt>
            <dd data-b={`pv${i}`}>{values[i]}</dd>
          </div>
        ))}
      </dl>
      <div data-b="kw" className={s.kw}>
        {backKeywords(card).map((k) => (
          <span key={k}>{k}</span>
        ))}
      </div>
    </div>
  );
}
