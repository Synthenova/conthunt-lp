/**
 * GLSL for <MetalRing> (metal-ring.tsx): the liquid-metal ring around the "Get started" buttons, our own
 * compact WebGL1 shader in place of metal-fx (whose Paper Shaders `liquidMetal` sheet ran on a shared
 * 15fps loop and was copied into each button's 2D canvas).
 *
 * One full-canvas triangle per button. The canvas covers the button's border box (plus a margin for
 * the halo); the fragment shader computes the button's rounded-rect SDF itself and lights only:
 *   the ring band   d in [-ring, 0]: opaque chrome, antialiased on both edges, the inner edge half a
 *                   device px into the face so the button's own edge never peeks through;
 *   the halo        a soft pale-blue light outside the ring, centred on a point of the ring (u_glow,
 *                   moved along the outline from JS), which also brightens the band under it.
 * Everything else is transparent. Output is premultiplied, like the default WebGL context.
 *
 * The chrome keeps the look of metal-fx's "chromatic" dark preset (tuned side by side against the live
 * ring: tone spread, coloured share, hue mix and cool cast):
 *   - a stripe field read on the ring's centre line, so the metal changes along the ring and not across
 *     it: mostly vertical (the long edges sweep slowly, the short sides show tight bands), slightly
 *     diagonal and bent, warped by slow gradient noise, flowing 0.3 cycles/s (Paper's speed 1);
 *   - each cycle is a thin bright strip, a thin dark gap, then a long fall from bright towards dark,
 *     between Paper's near-white (.98, .98, 1) and near-black stripe endpoints;
 *   - R and B read the stripe shifted forwards and backwards (chromatic dispersion): the hard edges
 *     split into soft red/yellow, magenta and cyan/blue fringes, the long falls stay neutral;
 *   - the cool cast is the preset's colour burn towards #88ccff (~18%) plus a slight cool multiply,
 *     which metal-fx's compositing added on top of the burn;
 *   - a darker hairline on the outer edge, as the old ring had.
 * Time loops every LOOP seconds (the noise drifts on a circle and a whole number of stripe cycles flow
 * past), so the clock can wrap without a jump and stays small for mediump GPUs.
 *
 * The stripe profile, the R/B dispersion, the stripe endpoints and the tint burn are adapted from
 * Paper Shaders' `liquidMetal` (https://github.com/paper-design/shaders), Copyright (c) Paper Design,
 * Inc., licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0).
 * Simplified and rewritten here; the SDF ring, field, noise, halo and loop are our own.
 */

export const METAL_RING_VERTEX = /* glsl */ `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** Seconds per animation loop. Keep in step with LOOP in the fragment shader. */
export const METAL_RING_LOOP = 20;

export const METAL_RING_FRAGMENT = /* glsl */ `
#extension GL_OES_standard_derivatives : enable
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution; // canvas, device px
uniform vec2 u_half;       // half the button's border box, device px
uniform float u_radius;    // outer corner radius, device px
uniform float u_ring;      // ring thickness, device px
uniform float u_unit;      // button height, device px: the stripe field scales with the button
uniform float u_px;        // device px per CSS px (halo size)
uniform float u_time;      // seconds, 0..LOOP
uniform vec3 u_glow;       // halo centre (device px from the button centre, y up), strength (0 = none)

const float TAU = 6.2831853;
const float LOOP = 20.0;
const float CYCLES = 1.5;   // stripe cycles per button height (top and bottom edges out of phase)
const float LAPS = 6.0;     // stripe cycles that flow past per loop
const vec3 BRIGHT = vec3(0.98, 0.98, 1.0);
const vec3 DARK = vec3(0.1, 0.1, 0.12);
const vec3 TINT = vec3(0.533, 0.8, 1.0); // #88ccff
const float TINT_MIX = 0.14;
const vec3 COOL = vec3(0.965, 0.978, 1.0);
const vec3 HALO = vec3(0.72, 0.82, 1.0);

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// Outward normal of the same rounded rect (the SDF's gradient).
vec2 sdNormal(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  vec2 n = (q.x > 0.0 && q.y > 0.0) ? normalize(q) : (q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  return n * (step(0.0, p) * 2.0 - 1.0);
}

float hash(vec2 p) {
  vec3 p3 = fract(p.xyx * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 grad(vec2 i) {
  float a = TAU * hash(i);
  return vec2(cos(a), sin(a));
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = dot(grad(i), f);
  float b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// One stripe cycle: 1 = BRIGHT, 0 = DARK. A thin bright strip, a thin dark gap, then a long fall from
// bright towards dark; m (0..1) widens the strip and the gap.
float chrome(float x, float blur, float m) {
  float f = fract(x);
  float e1 = 0.13 + 0.04 * m;
  float e2 = e1 + 0.035 + 0.01 * m;
  float v = smoothstep(0.0, blur, f) * (1.0 - smoothstep(e1, e1 + blur, f));
  float fall = smoothstep(e2, 1.0, f);
  return mix(v, 1.0 - 0.8 * fall, smoothstep(e2, e2 + blur, f));
}

void main() {
  vec2 p = gl_FragCoord.xy - 0.5 * u_resolution;
  float d = sdRoundRect(p, u_half, u_radius);
  float cover = (1.0 - smoothstep(-0.5, 0.5, d)) * smoothstep(-0.5, 0.5, d + u_ring + 0.5);

  // The metal is read on the ring's centre line, so it changes along the ring, not across it.
  vec2 uv = (p - sdNormal(p, u_half, u_radius) * (d + 0.5 * u_ring)) / u_unit;
  float ang = TAU * u_time / LOOP;
  vec2 orbit = vec2(cos(ang), sin(ang));
  float n = gnoise(0.9 * uv + 0.8 * orbit) + 0.5 * gnoise(1.9 * uv - 0.6 * orbit.yx + 4.7);
  float m = clamp(0.5 + 1.2 * gnoise(0.7 * uv - 0.5 * orbit + 9.1), 0.0, 1.0);

  float s = CYCLES * (uv.y + 0.055 * uv.x - 0.04 * uv.x * uv.x + 0.1 * n) - LAPS * u_time / LOOP;
#ifdef GL_OES_standard_derivatives
  float blur = 0.025 + fwidth(s);
#else
  float blur = 0.05;
#endif
  float disp = 0.015 + 0.022 * m;
  vec3 v = vec3(chrome(s + disp, blur, m), chrome(s, blur, m), chrome(s - 1.15 * disp, blur, m));
  vec3 col = mix(DARK, BRIGHT, v);
  col = mix(col, 1.0 - min(vec3(1.0), (1.0 - col) / TINT), TINT_MIX) * COOL;
  col *= 1.0 - 0.4 * (1.0 - smoothstep(0.0, 0.6 * u_px, -d)); // a darker rim on the outer edge

  vec2 g = p - u_glow.xy;
  float sa = 20.0 * u_px;
  float sn = 8.5 * u_px;
  float halo = u_glow.z * exp(-dot(g, g) / (2.0 * sa * sa));
  col = min(col + 0.35 * halo * HALO, 1.0);
  float out_d = max(d, 0.0);
  float ha = 0.55 * halo * smoothstep(-0.5, 0.5, d) * exp(-out_d * out_d / (2.0 * sn * sn));

  gl_FragColor = vec4(col * cover + HALO * ha * (1.0 - cover), cover + ha * (1.0 - cover));
}
`;
