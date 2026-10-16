/**
 * Fontshare faces (the woff2 URLs of the @font-face rules at the top of globals.css) and
 * their preloads.
 *
 * Preload only what a route paints at load: its first viewport, measured at 390×844, 412×823
 * and 1440×900 (.scratch/qa/w7/perf/fontsvp.mjs), plus any face the browser lays out before the
 * first paint anyway. Every other face still loads the moment text uses it (font-display: swap).
 *
 * - Every route: Switzer 400 (body), 500 (navbar links, buttons, chips) and 700 (headings).
 *   The root layout preloads these with ReactDOM.preload().
 * - Per route, <FontPreloads faces={[…]} /> (components/layout/font-preloads.tsx) in the page:
 *   Home "boska500i" (the H1 keyword) + "switzer600" + "boska400i"; /pricing "switzer600" +
 *   "boska400i"; /viral-now "switzer600" + "switzer800" + "boska400i"; /resources and the 404
 *   "boska400i"; articles none.
 * - Home's "switzer600" and "boska400i" are the statement scene's, just below the hero. Its
 *   section is close enough to the viewport that `content-visibility: auto` still lays it out
 *   at load, so the browser fetches both faces before the first paint on phones and desktops
 *   alike. Without a preload they are found late, through the stylesheet, at the highest
 *   priority, and Lighthouse counts them as render-blocking (a document → CSS → font chain): Home
 *   desktop FCP went from 0.45s to 1.0s. A preload costs no extra bytes and keeps them off it.
 *
 * Route preloads come from a client component. A preload in a server component (a
 * ReactDOM.preload() call or a <link rel="preload"> element) travels as a hint in the route's
 * RSC payload, and a <Link> prefetch of that route from another page applies it there: Home's
 * Boska 500 italic was fetched on /pricing, where nothing uses it ("preloaded but not used").
 * A client component's preload only runs when the route actually renders.
 */
const FONTSHARE = "https://cdn.fontshare.com/wf/";

export const FONT_FILES = {
  switzer400: `${FONTSHARE}BLNB4FAQFNK56DWWNF7PMGTCOTZHOEII/ST3WKSSDMBK2MIQQO3MAVYWLF4FTOLFV/6IN5WOLRCYP4G4MOCOHOMXNON6Q7MDAR.woff2`,
  switzer500: `${FONTSHARE}OYB4CXKJQXKTNSLJMTDQOIVUL2V5EL7S/WYO2P7DQVV5RNXGMCUO2HL4RJP4VFUAS/6XPIMU23OJVRY676OG5YVJMWEHWICATX.woff2`,
  switzer600: `${FONTSHARE}5SZVFDB7V52TI6ULVC6J3WQZQCIZVDV5/ODYPSTCUDMKSTYIPTV4CLQ7URIK7XYBJ/YS3VPNVO4B3TOJMEXDGFZQ4TLZGGSRZC.woff2`,
  switzer700: `${FONTSHARE}HBNTRIISA5MEXGL5WPYI7CV2HIWTDV3Q/YDPDINVT673XLXNSTMLG4JNCZZMVVNPN/Y7SCNZJOT2MW5ADSGOFLDGH4TNL4JCQY.woff2`,
  switzer800: `${FONTSHARE}ZME55SZ3XN6FJ6WZ26BVFLFSAZ5I2VWW/YETVURK7HXO34ARWAMVG6MSPWALMBOUD/SMQAIKPHV4D6DU77XSDVYN543XEEYX6R.woff2`,
  boska400i: `${FONTSHARE}MBMZ7FPNE3BLIO7BA7WSXS622ESHMSPS/A24ASHB6YYDC2RKM53ROP5SQJCGM5LMQ/2YQT6WFIC4YLG23Y6A7HCRXGM5EQU4GP.woff2`,
  boska500i: `${FONTSHARE}BQ7H6NLD2VQ7DH6MKXG4EKNOHS4ARVBW/WJSA3LVU7OIK54ZLW7BVBDUCWMC7XIEL/7CAW3NYJZQZXMCDUJFS4DWGYL4PJNT5C.woff2`,
} as const;

export type FontKey = keyof typeof FONT_FILES;

/** Faces every route paints in its first viewport (the root layout preloads them). */
export const SITE_FONT_PRELOADS: FontKey[] = ["switzer400", "switzer500", "switzer700"];
