/**
 * The shared 1200x630 share card used by `/pricing`, `/viral-now` and `/resources`:
 * a blurred cover plate, the ContHunt wordmark, and a frosted card with an eyebrow, a headline
 * and an optional supporting line. It matches the per-article card in
 * `src/app/(site)/resources/[slug]/opengraph-image.tsx`.
 *
 * `next/og` is imported inside the function (see og-assets.ts for why).
 */
import { OG_SIZE, loadOgFonts, plateJpeg, wordmarkDataUri } from "./og-assets";

export interface OgCardInput {
  /** Small uppercase label, for example "Pricing". */
  eyebrow: string;
  title: string;
  /** One supporting line under the headline. */
  subtitle?: string;
  /** Public path of a 1600px cover plate, for example "/blog/plates/_index-1600.webp". */
  plate: string;
  /** Plate colour, shown while nothing else is painted. */
  background?: string;
}

export const titleFontSize = (title: string): number => (title.length > 62 ? 56 : title.length > 44 ? 64 : 72);

export async function renderOgCard({ eyebrow, title, subtitle, plate, background = "#e6e6e6" }: OgCardInput) {
  const { ImageResponse } = await import("next/og");
  const [plateSrc, wordmark, fonts] = await Promise.all([plateJpeg(plate), wordmarkDataUri(), loadOgFonts()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background,
          fontFamily: fonts.length ? "Switzer" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plateSrc}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{ position: "absolute", top: 0, left: 0, width: OG_SIZE.width, height: OG_SIZE.height }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56, width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wordmark} alt="" width={190} height={34} style={{ width: 190, height: 34 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              padding: "40px 48px 46px",
              borderRadius: 28,
              background: "rgba(255,255,255,0.84)",
              boxShadow: "0 24px 60px rgba(26,34,44,0.18)",
              maxWidth: 1000,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(15,15,15,0.55)",
                fontWeight: 500,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: titleFontSize(title),
                fontWeight: 700,
                letterSpacing: -2.4,
                lineHeight: 1.04,
                color: "#0f0f0f",
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div style={{ display: "flex", fontSize: 28, fontWeight: 500, lineHeight: 1.25, color: "rgba(15,15,15,0.6)" }}>
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
