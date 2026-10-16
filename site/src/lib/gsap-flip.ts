/**
 * GSAP Flip, registered. Import it from here, not from "@/lib/gsap":
 *
 *   import { Flip } from "@/lib/gsap-flip";
 *
 * Flip is kept out of @/lib/gsap (which every page loads first) because only a few
 * components use it (the statement scene and simulator board, How it works and Viral Now),
 * and on Home those load with their islands (components/layout/island-code.tsx).
 * Registering twice does nothing.
 */
import { Flip } from "gsap/Flip";
import { gsap } from "@/lib/gsap";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

export { Flip };
