/**
 * Platform glyphs for the three supported platforms (lucide has no brand icons).
 * The app uses react-icons FaTiktok / FaInstagram / FaYoutube (MediaCard.tsx:748-755); these are
 * simplified single-colour marks drawn with `currentColor`.
 */
import type { SVGProps } from "react";
import type { SimPlatform } from "@/content/simulator/types";

type IconProps = SVGProps<SVGSVGElement> & { platform: SimPlatform; size?: number };

export function PlatformIcon({ platform, size = 14, ...rest }: IconProps) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, focusable: false, ...rest };
  if (platform === "tiktok") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M16.6 2.2c.4 2.4 1.9 4.1 4.4 4.3v3.3c-1.6.1-3-.4-4.4-1.2v6.2c0 4-3.3 6.9-7.1 6.4-2.8-.4-5-2.7-5.2-5.6-.3-3.8 3-6.9 6.8-6.4v3.5c-.4-.1-.8-.2-1.2-.1-1.6.1-2.7 1.5-2.5 3.1.2 1.3 1.3 2.3 2.6 2.3 1.5 0 2.7-1.2 2.7-2.7V2.2h3.9Z" />
      </svg>
    );
  }
  if (platform === "instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth={2.2}>
        <rect x="3" y="3" width="18" height="18" rx="5.2" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="currentColor">
      <path
        fillRule="evenodd"
        d="M22.6 7.2a2.8 2.8 0 0 0-2-2C18.9 4.7 12 4.7 12 4.7s-6.9 0-8.6.5a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.4 4.8a2.8 2.8 0 0 0 2 2c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.8 2.8 0 0 0 2-2c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8ZM9.8 15.2V8.8l5.6 3.2-5.6 3.2Z"
      />
    </svg>
  );
}
