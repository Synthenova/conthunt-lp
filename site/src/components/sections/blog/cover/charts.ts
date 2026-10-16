/** Small SVG path helpers for the cover fragments (d3-shape does the curve math). */
import { area, curveMonotoneX, line } from "d3-shape";

export interface ChartBox {
  /** viewBox width and height, in SVG units. */
  w: number;
  h: number;
  /** Inner padding inside the viewBox. */
  padX?: number;
  padTop?: number;
  padBottom?: number;
}

export interface ChartGeometry {
  x: (i: number) => number;
  y: (v: number) => number;
  line: string;
  area: string;
}

/** Monotone line and area paths for one series, scaled to a shared `max`. */
export function buildSeries(points: number[], box: ChartBox, max: number): ChartGeometry {
  const { w, h, padX = 0, padTop = 0, padBottom = 0 } = box;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;
  const x = (i: number) => padX + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;
  const l = line<number>()
    .x((_, i) => x(i))
    .y((v) => y(v))
    .curve(curveMonotoneX);
  const a = area<number>()
    .x((_, i) => x(i))
    .y0(h - padBottom)
    .y1((v) => y(v))
    .curve(curveMonotoneX);
  return { x, y, line: l(points) ?? "", area: a(points) ?? "" };
}

/** 1,300 -> "1,300"; 74000 -> "74,000". */
export const fmt = (n: number): string => n.toLocaleString("en-US");

/** An illustrative breakout curve (flat, then a sharp rise), normalized 0..1. Decoration only. */
export const BREAKOUT_CURVE = [0.12, 0.15, 0.11, 0.16, 0.13, 0.18, 0.15, 0.2, 0.3, 0.46, 0.7, 1];
