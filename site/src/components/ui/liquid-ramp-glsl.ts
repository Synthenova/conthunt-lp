/**
 * GLSL for <LiquidRampFill> / <LiquidRampText> (liquid-ramp.tsx): a WebGL1 port of the owner's Pencil
 * effect shader `liquid-ramp.glsl` (C:/Users/win10/Documents/Pencil/liquid-ramp.glsl, hero rev 14).
 *
 * Ported for the bevel = 0 path only, which is all the site uses. With u_bevel = 0 the SDF input
 * (u_shape) drops out: s = 1, slope = 0, w = 1, so `at = gl_FragCoord.xy` and
 * `t = fold(fold(body) - 0.3 * sin(PI * w)) = fold(fold(body))`. u_depth only scales the bevel, so it
 * goes too. Everything else (hash, gradient noise, fbm, the domain-warped `liquid`, fold, ramp and the
 * time loop) is verbatim.
 *
 * Two additions, so the pattern matches Pencil when the canvas is bigger than the node it decorates
 * (the text canvas overhangs its text box to keep swash glyphs whole):
 *   u_box        the pattern box in device px = Pencil's u_resolution (the text box, or the canvas)
 *   u_boxOrigin  the box's bottom-left corner in canvas px (gl_FragCoord has a bottom-left origin)
 * u_resolution stays the canvas size and only maps gl_FragCoord to the cover texture's uv (the texture
 * is uploaded with UNPACK_FLIP_Y, so its row 0 is the canvas bottom, like gl_FragCoord).
 * u_useCover = 0 skips the texture (the rectangular fill: cover = 1 everywhere).
 *
 * Output is premultiplied (`col * cover, cover`), which matches the default premultipliedAlpha context.
 */

export const LIQUID_RAMP_VERTEX = /* glsl */ `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const LIQUID_RAMP_FRAGMENT = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_box;
uniform vec2 u_boxOrigin;
uniform float u_time;
uniform sampler2D u_content;
uniform float u_useCover;

uniform float u_waves;
uniform float u_warp;
uniform float u_bands;
uniform float u_flow;
uniform float u_loop;
uniform float u_seed;
uniform float u_rampLoop;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;
uniform vec3 u_c5;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 grad2(vec2 i) {
  float a = 6.2831853 * hash21(i);
  return vec2(cos(a), sin(a));
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad2(i), f);
  float b = dot(grad2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  return 0.6 * gnoise(p) + 0.24 * gnoise(mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1);
}

float liquid(vec2 p, float ang) {
  float r = u_flow * 0.044;
  p += r * 1.3 * vec2(cos(ang + 0.7), sin(ang + 0.7));
  vec2 o1 = r * 0.6 * vec2(cos(ang), sin(ang));
  vec2 o2 = r * 0.4 * vec2(cos(2.0 * ang + 1.3), sin(2.0 * ang + 1.3));
  vec2 o3 = r * 0.5 * vec2(sin(ang + 2.1), cos(ang + 2.1));
  vec2 q = vec2(gnoise(p + o1), gnoise(p + vec2(5.2, 1.3) - o1.yx));
  vec2 w = p + u_warp * 1.6 * q;
  vec2 s = vec2(gnoise(w + vec2(1.7, 9.2) + o2), gnoise(w + vec2(8.3, 2.8) - o2));
  return fbm(p + u_warp * 1.6 * s + o3);
}

float fold(float x) {
  return u_rampLoop > 0.5 ? fract(x) : 1.0 - abs(fract(x * 0.5) * 2.0 - 1.0);
}

vec3 ramp(float t) {
  float k = t * (u_rampLoop > 0.5 ? 6.0 : 5.0);
  vec3 c = u_c0;
  c = mix(c, u_c1, clamp(k, 0.0, 1.0));
  c = mix(c, u_c2, clamp(k - 1.0, 0.0, 1.0));
  c = mix(c, u_c3, clamp(k - 2.0, 0.0, 1.0));
  c = mix(c, u_c4, clamp(k - 3.0, 0.0, 1.0));
  c = mix(c, u_c5, clamp(k - 4.0, 0.0, 1.0));
  c = mix(c, u_c0, clamp(k - 5.0, 0.0, 1.0));
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float cover = u_useCover > 0.5 ? texture2D(u_content, uv).a : 1.0;

  float side = min(u_box.x, u_box.y);
  vec2 at = gl_FragCoord.xy - u_boxOrigin;

  float ang = 6.2831853 * fract(u_time / max(u_loop, 0.1));
  vec2 p = (at - 0.5 * u_box) / side;

  p = p * u_waves * vec2(1.0, 0.65) + u_seed * vec2(3.7, 5.3);
  float body = 0.5 + 4.2 * liquid(p, ang) * u_bands;

  float t = fold(fold(body));
  vec3 col = ramp(t);

  gl_FragColor = vec4(col * cover, cover);
}
`;
