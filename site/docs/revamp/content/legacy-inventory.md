# Legacy content inventory (index.html)

Status: extraction complete, owner review needed for the flags in section 1.
Source: `index.html` in the Landing Page repo (2288 lines, mtime May 23). Line numbers refer to that file.
Modules: `src/content/site/*.ts` (11 files). Each exports `data` with an exported inline type, has no imports, and compiles under strict TypeScript.
Not processed: `index.bak` and `index.html_temp_video` (older or scratch copies). Only `index.html` plus the scripts it loads (`public/step2-animation.js`) and the Lottie JSON files were read.

Conventions:
- Copy is verbatim. Whitespace from HTML line wraps is collapsed to single spaces. Nothing else is changed except the fix listed in section 7.
- `MISSING` = the legacy page has no value for this field (no URL, no image, no source).
- "Brief" = the owner's list in `docs/revamp/USER_BRIEF.md`.

---

## 1. Flags for the owner (read first)

1. **Testimonials.** The four quotes and names (Sarah Jenkins, Mark D., Alex Rivera, Elena K.) come from the legacy site.
2. **Unverified claims in legacy copy** (kept verbatim, not checked against data):
   - "Join 5,000+ content strategists hunting smarter." (line 1041)
   - "Turn 10 hours of manual digging into 10 minutes of execution." (line 695)
   - Sample Deep Research outputs: "retains 80% of viewers at 3s", "Hook Score: 92/100 • Virality Index: 8.4x • Est. Reach: 2.1M" (lines 821-836). Illustrative mock copy, not measured data.
   - Code simulation numbers: "Expanded to 847 keywords", "Scanned 24,847 videos", "127 high-potential matches", "Report ready: 12 videos identified" (`public/step2-animation.js`). Demo copy.
   - "Lock in Beta pricing today. Prices increase after V1.0 launch." (line 1221). No code reference.
3. **Pricing copy conflicts with the app** (section 4): search and credit allowances differ, Free is described as monthly but the app says one-time, and the FAQ says "monthly billing" while the app sells annual plans.
4. **Platform copy conflicts with the app** (section 5): the FAQ says LinkedIn and X are "in beta", the bento says LinkedIn is included, and the marquee and tiles show Reddit, Snapchat, Facebook, X and Pinterest. The app's active search adapters are Instagram Reels, TikTok (keyword and top) and YouTube. Pinterest is disabled. No adapter exists for LinkedIn, X, Reddit, Snapchat or Facebook.
5. **Every footer link and every CTA destination is a placeholder.** Footer links and socials are `href="#"` (lines 1448-1485). The workflow CTA (line 1025) and the pricing buttons (lines 1272, 1329, 1392) have no destination. Only the hero, the LOGIN link and the newsletter success state point to `https://agent.conthunt.app`.
6. **Legacy pricing defaults to monthly** (`let isAnnual = false;`, line 1583). The brief asks for yearly by default. The app defaults to yearly (`useState(true)`, PricingSection.tsx line 51).
7. **The Lottie files cannot be described from their JSON alone.** They have no layer names and no text layers. What they depict needs a render, which the brief rules out for now. Structure is in section 3.
8. **Copyright year** "© 2024" (line 1492) is kept as written. The date today is 2026-10-14; update it when the owner confirms.
9. **Not on the retain list, kept as reference:** the "high cost of manual research" block (lines 631-702, in `statement.ts` under `reference`) and the head SEO meta (lines 7-42, in `hero-legacy.ts` under `head`). Owner decides.
10. **Excluded per the brief:** the 14-day money-back line and its "Risk Reversal" label (lines 1398-1405). Not in any module.

---

## 2. Items by module

### 2.1 nav.ts (navbar)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Logo image | 468 | `public/logo-title-white.png`, alt "ContHunt Logo" | `logo.src`, `logo.alt` | Logo is not wrapped in a link, so `logo.href` = MISSING. Brief: logo goes to Home. The white wordmark is for dark backgrounds. `public/logo-title-high.png` also exists (not used by legacy). |
| Link "Features" | 473-475 | Features | `links[0]` | href `#features` (in-page anchor, line 473) |
| Link "Workflow" | 476-478 | Workflow | `links[1]` | href `#workflow` (line 476) |
| Link "Pricing" | 479-481 | Pricing | `links[2]` | href `#pricing` (line 479) |
| Login | 489-493 | LOGIN (icon lucide:arrow-right) | `login` | href `https://agent.conthunt.app` (line 489) |
| Commented-out "Log in" link | 486-488 | Log in | not included | Commented out in the source with href "#". Excluded. |

Notes: the legacy nav has no "Get started" button; the brief and PLAN add one. Navbar hide and show on scroll (lines 1870-1907): the nav hides after 30px of downward scroll once past 100px, and reappears after 15px of upward scroll.

### 2.2 platforms.ts (platforms covered)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Heading | 596 | Your platforms. Covered. | `heading` | |
| Marquee icons | 603-610 | TikTok, YouTube, Instagram, Reddit, LinkedIn, X, Pinterest, Snapchat (icons only, iconify simple-icons ids) | `marquee` | Labels are derived from the icon ids; the page had no text. Reddit, LinkedIn, X and Snapchat have `hidden md:block` (desktop only). |
| Platform count | none | MISSING | `platformCount` | No number on the page. Plans say "All Platforms" (line 1302) and "2 Platforms (IG, TikTok)" (line 1252). |
| Bento platform tiles | 738-792 | Instagram (large), YouTube (small), Facebook (small), Pinterest (wide), TikTok (large) | `bentoTiles` | Hover hex: #E1306C, #FF0000, #1877F2, #E60023, #00F2EA (`data-hover-color`, lines 748, 757, 764, 777, 785). Gradient hover styles are CSS only and not copied. |
| Copy mention, bento | 733-734 | "Search keywords, hashtags, or creators across TikTok, YouTube Shorts, Instagram Reels, and LinkedIn simultaneously." | `listedInCopy.bentoMultiPlatform` | Conflicts with FAQ and app; see section 5. |
| Copy mention, FAQ | 1193-1194 | "Currently, we support TikTok, YouTube Shorts, and Instagram Reels. LinkedIn video and X (Twitter) support is in beta." | `listedInCopy.faqSupport` | Conflicts with bento and marquee; see section 5. |

### 2.3 statement.ts (stop scrolling)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Statement | 622-626 | Stop / scrolling / to / find / ideas. (five spans) | `text`, `words` | Rendered as one sentence: "Stop scrolling to find ideas." Word-by-word reveal in the source. |
| Reference heading | 634-636 | The high cost of manual research. | `reference.heading` | Not on the retain list (flag 9). |
| Reference subhead | 637 | Why the old way is holding you back. | `reference.subhead` | |
| Card: The Problem | 651, 654-656 | "You are wasting hours on manual research. Scrolling endlessly through feeds hoping to find a spark of inspiration is not a repeatable strategy." | `reference.cards[0]` | |
| Card: The Cost | 671, 674-676 | "While you scroll, your competitors are automating their content strategy. You lose market share and miss trends before they even peak." | `reference.cards[1]` | |
| Card: The Solution | 691, 694-696 | "An intelligent engine that scouts, filters, and analyzes viral videos for you. Turn 10 hours of manual digging into 10 minutes of execution." | `reference.cards[2]` | "10 hours to 10 minutes" is an unverified claim (flag 2). |

### 2.4 bento.ts (features grid)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Heading | 707-709 | Intelligence, not just search. | `heading` | |
| Subhead | 710-711 | Everything you need to reverse-engineer virality. | `subhead` | |
| Card 1 title | 730 | Multi-Platform Aggregation | `items[0].title` | 3 words. Brief asks for 1-2 word captions. Kept verbatim. |
| Card 1 body | 733-734 | Search keywords, hashtags, or creators across TikTok, YouTube Shorts, Instagram Reels, and LinkedIn simultaneously. | `items[0].body` | LinkedIn conflict; see section 5. Legacy size: wide (line 717-718). Icon lucide:globe (line 727). |
| Card 2 title | 807 | Deep Research Agent | `items[1].title` | 3 words. Legacy size: tall (line 796). Icon lucide:scan-eye (line 804). |
| Card 2 body | 810-811 | Like NotebookLM for short-form. Our AI analyzes hooks, pacing, visuals, and script structure. | `items[1].body` | "Like NotebookLM" is a comparison claim. |
| Card 2 sample: Analysis | 821-822 | "The video retains 80% of viewers at 3s due to the visual disruption effect." | `items[1].samples[0]` | Illustrative mock (flag 2). |
| Card 2 sample: Script | 829 | "Wait, don't throw that away..." | `items[1].samples[1]` | Illustrative. |
| Card 2 sample: Metrics | 836 | "Hook Score: 92/100 • Virality Index: 8.4x • Est. Reach: 2.1M" | `items[1].samples[2]` | Illustrative (flag 2). |
| Card 3 title | 851 | Niche Hunter | `items[2].title` | Legacy size: small (line 843). Icon lucide:radar (line 849). |
| Card 3 body | 852-854 | Find low-competition, high-velocity topics tailored to your brand. | `items[2].body` | |
| Card 4 title | 868 | Velocity Metrics | `items[3].title` | Legacy size: small (line 860). Icon lucide:bar-chart-2 (line 866). |
| Card 4 body | 871-873 | Identify videos that are growing faster than the creator's average. | `items[3].body` | |

Platform tiles inside card 1 are in `platforms.ts`, not here.

### 2.5 getStarted.ts (Get Started, 3 steps, deep-dive video)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Eyebrow | 887-888 | Get Started | `eyebrow` | Uppercased by CSS in the legacy page. |
| Step 01 title | 898-899 | Define Parameters | `steps[0].title` | |
| Step 01 body | 901-904 | Communicate your needs with the agent and watch it spin up niche keywords based on your requests, along with the mainstream ones. | `steps[0].body` | Visual: `public/Scene-1.json` (lottie, loops; lines 955-956). Mobile duplicate lines 943-948 ignored. |
| Step 02 title | 911-913 | Content Search Engine | `steps[1].title` | |
| Step 02 body | 914-917 | Scan thousands of videos across platforms in minutes, filtering out noise and flagging high-potential content. | `steps[1].body` | Visual: scripted code simulation, `public/step2-animation.js` (line 2159). Sequences are in `hero-legacy.ts`. |
| Step 03 title | 924-926 | Deep Dive | `steps[2].title` | |
| Step 03 body | 927-930 | Start talking to the video. Get a full breakdown of why it worked, generate similar scripts and set up scouting alerts. | `steps[2].body` | Visual: deep-dive video (line 1016). |
| CTA label | 1027 | GET STARTED | `cta.label` | No href and no click handler, so `cta.href` = MISSING. |
| Deep-dive video | 1016-1017 | `public/conthunt agent - zoom.mp4` (src written as `public/conthunt%20agent%20-%20zoom.mp4`), muted, loop, playsinline | `deepDiveVideo` | Size 30,942,365 bytes (about 31 MB). Poster MISSING. Brief item 6 confirmed: this is the "deepdive video". PLAN says re-encode. |

### 2.6 testimonials.ts (scrolling testimonials)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Heading | 1037-1038 | Trusted by top creators | `heading` | |
| Subhead | 1041 | Join 5,000+ content strategists hunting smarter. | `subhead` | Unverified (flag 2). |
| Quote 1 | 1050-1051 | The deep research feature is insane. It's like having a dedicated strategist analyzing my niche 24/7. | `items[0].quote` | Sarah Jenkins, Ecom Founder (lines 1056-1057). |
| Quote 2 | 1063-1064 | I stopped guessing what would go viral. ContHunt just shows me the math behind the trends. | `items[1].quote` | Mark D., Growth Lead (lines 1069-1070). |
| Quote 3 | 1076-1077 | Replaced 3 separate tools with this. The AI agent actually understands context, not just keywords. | `items[2].quote` | Alex Rivera, Content Creator (lines 1082-1083). |
| Quote 4 | 1089-1090 | Our content team output doubled because we spend zero time on ideation now. | `items[3].quote` | Elena K., Agency Owner (lines 1095-1096). |
| Avatars | 1054, 1067, 1080, 1093 | empty `div` with grey background (no image) | `items[n].avatar` = MISSING | No image path exists. |
| Duplicate set | 1102-1153 | Same four cards repeated for the infinite loop | not included | Duplicates are not copy. |

### 2.7 faqs.ts (FAQ)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Heading | 1162-1164 | Common Questions | `heading` | |
| Q1 | 1170 | Is this just another social listening tool? | `items[0].question` | |
| Q1 answer | 1175-1181 | No. Listening tools tell you what people are saying. ContHunt tells you what people are watching and why. Our AI analyzes the visual and structural elements of content, not just text mentions. | `items[0].answer`, `emphasis: ["watching", "why"]` | `watching` and `why` are in `<em>` in the source. Whitespace fix: see section 7. |
| Q2 | 1188 | Which platforms do you support? | `items[1].question` | |
| Q2 answer | 1193-1194 | Currently, we support TikTok, YouTube Shorts, and Instagram Reels. LinkedIn video and X (Twitter) support is in beta. | `items[1].answer` | Conflicts with bento copy (LinkedIn) and marquee (Reddit, Snapchat, X, Pinterest). See section 5. |
| Q3 | 1201 | Can I cancel anytime? | `items[2].question` | |
| Q3 answer | 1206-1207 | Absolutely. We offer monthly billing with no long-term contracts. You can export your data before you leave. | `items[2].answer` | Conflicts with annual plans (section 4). "Export your data" has no code check. |

FAQ answers are styled at 1.25rem on this page (line 1161). Accordion is `<details>`, all three closed by default in the source (opened state only via `open`).

### 2.8 pricing.ts (pricing cards)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Heading | 1217-1218 | Transparent Pricing | `heading` | |
| Subhead | 1221 | Lock in Beta pricing today. Prices increase after V1.0 launch. | `subhead` | Unverified (flag 2). |
| Toggle label | 1225 | Paid Annually | `billingToggle.label` | Static label. Does not change with the toggle. |
| Toggle billed labels | 1294-1295, 1352-1353; JS 1626 | Billed Monthly / Billed Annually | `billingToggle.billedMonthlyLabel`, `billedYearlyLabel` | |
| Savings badge | 1234-1235 | Save up to 20% | `savingsBadge` | Legacy value (20) is consistent with app-side calculation in section 4. |
| Free: name | 1243 | Free | `plans[0].name` | |
| Free: price | 1245-1246 | $0 /mo | `plans[0].price` | Both billing states show $0. |
| Free: features | 1252, 1256, 1260, 1264, 1268 | 2 Platforms (IG, TikTok) / 10 Searches / mo / 10 AI Analyses / mo / Gemini Flash Model / 1 AI Board | `plans[0].features` | Conflicts with app (section 4). |
| Free: CTA | 1272 | GET STARTED | `plans[0].cta.label` | No href. |
| Creator: badge | 1280 | Popular | `plans[1].badge` | |
| Creator: name | 1283 | Creator | `plans[1].name` | |
| Creator: struck price | 1285 | $49 | `plans[1].struckPrice` | Static; no source in code (section 4). |
| Creator: monthly price | 1287-1289 | 29 (with a $ sign, /mo) | `plans[1].price.monthly` | |
| Creator: yearly price | 1288 (`data-yearly="25"`) | 25 | `plans[1].price.yearly` | JS (lines 1630-1638) swaps the value on toggle. |
| Creator: features | 1302, 1306, 1310, 1313, 1316, 1320, 1325 | All Platforms / 50 Searches / mo / 1000 AI Credits / mo / ~500 video analysis or / ~200 video indexing / Latest AI Models / 5 AI Boards | `plans[1].features` | `~500 video analysis or` and `~200 video indexing` are two lines in the source with a dangling "or". Kept as two items (flag). |
| Creator: CTA | 1329 | CHOOSE PLAN | `plans[1].cta.label` | No href. |
| Pro: badge | 1338 | Full Experience | `plans[2].badge` | |
| Pro: name | 1341 | Pro Research | `plans[2].name` | |
| Pro: struck price | 1343 | $139 | `plans[2].struckPrice` | Static; no source in code. |
| Pro: monthly price | 1345-1347 | 79 | `plans[2].price.monthly` | |
| Pro: yearly price | 1346 (`data-yearly="63"`) | 63 | `plans[2].price.yearly` | |
| Pro: features | 1360, 1364, 1368, 1371, 1374, 1378, 1383, 1387 | All Platforms + Upcoming Platforms / 300 Searches / mo / 3000 AI Credits / mo / ~ 1500 video analysis or / ~ 600 video indexing / Latest AI Models / 25 AI Boards / Deep Search Agent (new) | `plans[2].features` | Conflicts with app (section 4). "Deep Search Agent (new)" is not in the app list. |
| Pro: CTA | 1392 | CHOOSE PLAN | `plans[2].cta.label` | No href. |
| Trial terms | none in legacy | MISSING | `trialTerms` | Brief: 1-week free trial on paid plans. App: 7 days (section 4). |
| Risk reversal | 1398-1405 | excluded per brief | not included | Flag 10. |

Pricing notes:
- Creator and Pro prices are data attributes (`data-monthly`, `data-yearly`). The toggle animates between them (`animateValue`, lines 1586-1604). The strike prices never change.
- Trailing spaces were trimmed from `~500 video analysis or ` (line 1313) and `~ 1500 video analysis or` (line 1371). Text otherwise unchanged.

### 2.9 newsletter.ts (newsletter / final CTA)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Heading | 1415-1417 | Hunt content like / a machine. (line break after "like") | `headlineLines` | |
| Subhead | 1420-1421 | Stop relying on gut feeling. Get the data-backed tool for modern creators. | `subhead` | |
| Input placeholder | 1425 | Enter your email | `input.placeholder` | type="email" |
| Submit label | 1429 | JOIN NEWSLETTER | `submit.label` | |
| Success message | 2241 | Successfully joined! | `submit.successMessage` | Shown client-side after `@` check. Nothing is sent to a server. |
| Post-success label | 2247 | GET STARTED | `submit.postSuccessLabel` | |
| Post-success link | 2231 | https://agent.conthunt.app | `submit.postSuccessHref` | Via `window.location.href`. |
| Invalid input | 2254-2257 | red border for 2 seconds (no copy) | not included | |
| Submit endpoint | none | MISSING | `submit.endpoint` | Legacy form has no backend. Owner needs a provider. |

### 2.10 footer.ts (footer)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| Logo | 1440 | `public/icon black 800px.png`, alt "ContHunt Logo" | `logo.src`, `logo.alt` | |
| Wordmark | 1441 | ContHunt | `logo.wordmark` | |
| Blurb | 1444-1445 | The all-in-one content aggregation and research intelligence tool for the modern web. | `blurb` | |
| Social: Twitter | 1448-1449 | icon simple-icons:twitter, href "#" | `socials[0]` | Name derived from the icon. No URL in legacy. A candidate exists in `conthunt/docs/seo_audit_conthunt.md` line 273 (`https://twitter.com/conthunt`), proposed for schema only and not verified. |
| Social: GitHub | 1450-1451 | icon simple-icons:github, href "#" | `socials[1]` | Candidate in the same doc, line 274 (`https://github.com/conthunt`), unverified. |
| Social: Discord | 1452-1453 | icon simple-icons:discord, href "#" | `socials[2]` | No candidate found. |
| Column: Product title | 1458 | Product | `columns[0].title` | |
| Product: Features | 1461 | Features (href "#") | `columns[0].links[0]` | Could map to `#features` on the home page. |
| Product: Pricing | 1464 | Pricing (href "#") | `columns[0].links[1]` | Could map to `/pricing`. |
| Product: Changelog | 1467 | Changelog (href "#") | `columns[0].links[2]` | No changelog route found in the app. |
| Product: Docs | 1470 | Docs (href "#") | `columns[0].links[3]` | Candidate in the app: `https://conthunt.app/docs/integrations/mcp` (`conthunt/frontend/src/app/app/(private)/profile/components/McpSetup.tsx` line 36, "Full guide"). Not confirmed as the docs home. Owner to decide. |
| Column: Legal title | 1476 | Legal | `columns[1].title` | |
| Legal: Privacy Policy | 1479 | Privacy Policy (href "#") | `columns[1].links[0]` | Source text exists in `conthunt/docs/privacy-policy.md` (last updated January 12, 2026). Public URL unknown. |
| Legal: Terms of Service | 1482 | Terms of Service (href "#") | `columns[1].links[1]` | Source text exists in `conthunt/docs/terms-of-conditions.md` (last updated January 12, 2026). Public URL unknown. |
| Legal: Contact | 1485 | Contact (href "#") | `columns[1].links[2]` | No contact address or form in the legacy page or the app. |
| Copyright | 1492 | © 2024 ContHunt Inc. All rights reserved. | `copyright` | Year kept as written (flag 8). |
| Status | 1494-1495 | Systems Operational (green dot) | removed | Static text, not a live status check. The field was removed from `footer.ts` (see OWNER_DECISIONS). |
| Footer personality copy | none | MISSING | not included | Legacy has no personality or wordmark copy. Brief item 9 (CebbF) is new work. |

### 2.11 hero-legacy.ts (hero and simulation, reference only)

| Item | Lines | Verbatim | Field | Notes |
|---|---|---|---|---|
| H1 lead | 506 | Third eye for your | `headline.lead` | |
| Changing word | 510; JS 1656-1661 | marketing, ecommerce, content idea, brand growth | `headline.changingWords` | Initial word "marketing" (line 510, JS 1654). Order: marketing → ecommerce → content idea → brand growth → marketing. First change 2000 ms after load; 3000 ms hold after each scramble; scramble tick 30 ms (lines 1693-1696, 1686, 1670). |
| Subtext | 515-516 | Aggregates viral videos across all social media platforms, analyzes every frame and uncovers niche gold before it trends. | `subtext` | |
| View Demo | 522 | View Demo | `actions.viewDemoLabel` | Hidden below md. Scrolls to the app frame (JS 2209-2211). |
| Hero GET STARTED | 526 | GET STARTED | `actions.getStarted.label` | Redirect set by JS (line 2218), not an anchor. Href = https://agent.conthunt.app. |
| App-frame search pill | 547 | organic skin care | `appFrame.searchPill` | Fake search. Code sample says "organic skincare" (step2 line 48). Spelling differs. Not changed. |
| Sidebar tab ids | 562, 567, 572, 577 | search, boards, settings, ai | `appFrame.sidebarTabs` | Icon-only buttons (no visible labels). Tab switching is commented out (JS 1732-1757). |
| Replay | 552 | Replay | `appFrame.replayLabel` | Shown after the Lottie completes (JS 2191-2194). |
| Main Lottie | 584-585 | `public/main_lottie.json` | `simulation.mainLottie` | Structure in section 3. Depicts: MISSING. |
| Scene-1 Lottie | 955-956 | `public/Scene-1.json`, comment "Lottie Animation for Search" (line 954) | `simulation.scene1Lottie` | Structure in section 3. Depicts: MISSING. |
| Code simulation | `public/step2-animation.js` | status and line sequences (4 sequences, 24 lines) | `simulation.codeSimulation` | Status text gets "..." appended. Initial status "Initializing search..." (HTML line 979). Lines keep their original indentation. |
| Head title | 8 | ContHunt \| Analyze Viral Videos | `head.title` | Also `og:title` and `twitter:title` (lines 23, 34). |
| Head description | 10-11 | Find viral short-form videos from TikTok, Instagram, YouTube & analyze with AI. Discover virality patterns, copy winning UGC ADs, download shorts reels. | `head.description` | Same text in `og:description` and `twitter:description` (lines 24-25, 35-36). |
| Head keywords | 12-13 | content research, viral video analysis, TikTok analytics, content intelligence, social media research, content strategy, trend analysis | `head.keywords` | |
| OG image | 26 | https://conthunt.app/banner.png | `head.ogImage` | Live URL in the source. A local copy also exists at `public/banner.png` (645,829 bytes). |

---

## 3. Lottie and video simulation: structure (not rendered, per the brief)

Method: `python -I` with `json` only. No rendering. Layer names (`nm`) are absent in both files. Both were exported from jitter.video (`meta.g`), and neither has text layers. The depicted content therefore cannot be stated from the JSON. Structure only:

**`public/main_lottie.json`** (hero app-frame content area, lines 584-585)
- Canvas 675 × 443, 60 fps, out point 794.4 frames (about 13.24 s). Plays once (no `loop`), starts when 50% visible, Replay button after completion.
- Top-level layers: 124 (58 precomp, 47 null, 19 shape). Across the whole file including precomp assets: 498 shape, 657 null, 215 precomp, 11 image layers.
- 680 path shapes, 35 rectangles, 10 groups, 4 strokes.
- Dominant fills: #FFFFFF (454), #000000 (31), #828282 (12), #B2B2B2 (2), #1A1A1A (2), with greys elsewhere.
- 10 embedded PNG assets: three horizontal strips (315 × 66, 165 × 66, 681 × 66), one 107 × 164, and six 254 × 388 portrait images. Pixel content was not inspected.
- Depicts: MISSING.

**`public/Scene-1.json`** (Get Started step 1 box, lines 955-956)
- Canvas 640 × 360, 60 fps, 243 frames (4.05 s). Loops with autoplay.
- Top-level layers: 178 (136 precomp, 40 null, 2 shape). 226 path shapes, 4 rectangles, 7 groups, 2 gradient strokes, 1 gradient fill.
- Dominant fills: #BABABA (131), #757575 (4), #000000 (3), #080808, #5E5E5E.
- One embedded 1 × 1 placeholder PNG (asset 0). 144 assets total.
- Legacy comment: "Lottie Animation for Search" (line 954).
- Depicts: MISSING.

**Code simulation** (`public/step2-animation.js`, Get Started step 2): four scripted sequences that type code lines into a fixed window and cycle. Text is in `hero-legacy.ts`. It is a demo of the search pipeline, not a capture of real output.

**Deep-dive video** (`public/conthunt agent - zoom.mp4`, 31 MB, Get Started step 3): the file is in `public/`. Duration, dimensions and content were not inspected (no decoding).

---

## 4. Pricing cross-check against the app repo

App root: `C:\Users\win10\Documents\GitHub\Conthunt\conthunt`. Prices are not hard-coded in the app: they come from the Dodo catalog at runtime (`backend/app/api/v1/billing.py` `/billing/products`, `backend/app/services/billing_service.py`). Literal prices found in `frontend/src` and `backend/app` are test fixtures and one code comment only.

### 4.1 Sources checked

| Source | Lines | What it says |
|---|---|---|
| `backend/app/services/plan_wallets.py` | 71-77 `_PLANS` | free: wallet $0.60, search_platform_cap 12, credit_total 150. creator: $20.00 wallet, cap 300, credits 5,000, tracking 1,500. pro_research: $60.00 wallet, cap 900, credits 15,000, tracking 5,000. |
| same | 79-82 `_TRIALS` | creator trial: $4.67 wallet, cap 70, credits 1,166. pro_research trial: $14.00 wallet, cap 210, credits 3,500. |
| `backend/app/api/v1/billing.py` | 47-51 | `/billing/products` returns `entitlements` = plan_wallet `search_platform_cap` (searches), `credit_total` (ai_credits) and `tracking_credit_total` (tracking_credits). This is what the app shows. |
| `backend/app/billing/catalog.py` | 9-10, 18, 72-73 | Plan roles: free, creator, pro_research. Comment: "Creator yearly ($300) to Pro monthly ($79) is an upgrade." |
| `frontend/.../billing/return/PricingSection.tsx` | 51 | Default billing: `useState(true)`, so annual is the default. |
| same | 160-170 | Monthly price shown = `price / 100 / 12` for yearly products. |
| same | 178-183 | Savings = `1 - annual.price / (12 * monthly.price)`, rounded, maximum across plans. "Save up to N%" at line 399. |
| same | 185-188, 312, 316-318 | Trial shown only when `trial_period_days` is 7 and the user is trial-eligible. Button label "START FREE TRIAL" if eligible, else "SUBSCRIBE NOW". |
| same | 370, 373 | "Start your seven-day free trial" / "Choose Creator or Pro Research to activate your trial. If you don't continue with paid access, you'll move to Free when your trial ends." |
| same | 392, 395 | "Annual Plan" / "Monthly Plan" label; switch aria-label "Annual billing". |
| same | 441, 491 | Plan name from Dodo product `name`, fallback "Creator" and "Research" (note: fallback for Pro is "Research", not "Pro Research"). |
| same | 455, 505 | "{price} billed per year." (annual only) |
| same | 456-461, 506-511 | Trial badge "{N}-day free trial" plus " · No card required" when `trial_payment_method_optional` is true. |
| same | 451, 501 | "Billed Annually" / "Billed Monthly" (same as legacy). |
| same | 464-471 (Creator), 514-521 (Pro) | Feature lists: All Platforms / N Searches / mo / N AI Credits / mo / N Tracking Credits / mo / All AI features / 5 AI Boards (Creator). All Platforms + Upcoming / ... / 25 AI Boards (Pro). |
| `frontend/.../billing/return/billing-view.ts` | 22 | "Activate a seven-day trial to start using ContHunt." Free: "Free credits are issued once on your first query. They do not renew." |
| `frontend/src/app/app/(private)/profile/page.tsx` | 77 | "Free credits are a one-time allowance issued on your first query. They do not renew. ..." |
| `frontend/.../billing/return/PricingSection.test.tsx` | 27-37 | Fixtures: creator-month 2900 cents ($29), creator-year 30000 ($300/yr = $25/mo), pro-month 7900 ($79), pro-year 75600 ($756/yr = $63/mo). trial_period_days 7, names "Creator" and "Pro Research". These are fixtures, not the live catalog. |
| `frontend/src`, `backend/app` (`*.tsx`, `*.py`) | none | No money-back guarantee text found (search: "money back", "refund policy", "14 day"). |

### 4.2 Comparison

| Field | Legacy (index.html) | App code | Result |
|---|---|---|---|
| Plan names | Free / Creator / Pro Research | Creator / Pro Research (Dodo names; fixture uses same); free shown as "Free" in billing copy | Match. Pro fallback name in the app is "Research" (PricingSection.tsx line 491), which differs. |
| Creator monthly | $29 | $29 (fixture; live catalog not in repo) | Consistent with fixture. Unverified against live Dodo. |
| Creator yearly (per month) | $25 | $300/yr = $25/mo (fixture; catalog.py comment cites $300) | Consistent with fixture. |
| Pro monthly | $79 | $79 (fixture; catalog.py comment cites $79) | Consistent. |
| Pro yearly (per month) | $63 | $756/yr = $63/mo (fixture) | Consistent with fixture. |
| Struck prices $49 (Creator) and $139 (Pro) | shown | no source | MISSING. Owner to confirm the "original" prices. |
| Savings badge | Save up to 20% | computed max saving: Pro 20%, Creator 14% (from fixture) | Consistent. |
| Default billing | monthly (`isAnnual = false`) | yearly (`useState(true)`) | Mismatch with legacy. Brief and app agree: yearly. |
| Trial | not mentioned | 7-day trial on paid plans, "No card required" if Dodo flag set; only for trial-eligible users | Brief: 1-week trial. Consistent with app (7 days). Legacy has no trial copy. |
| Creator searches | 50 / mo | 300 (`search_platform_cap`, plan_wallets.py line 73) | MISMATCH |
| Creator AI credits | 1000 / mo | 5,000 (plan_wallets.py line 73) | MISMATCH |
| Creator tracking credits | not listed | 1,500 / mo | Missing in legacy. Owner to decide if shown. |
| Creator "~500 video analysis or ~200 video indexing" | listed | not in app pricing list | Unverified. No code source. |
| Creator "Latest AI Models" | listed | not in app pricing list | Unverified. |
| Creator "All Platforms" | listed | "All Platforms" (PricingSection.tsx line 465) | Match. |
| Creator "5 AI Boards" | listed | "5 AI Boards" (line 470) | Match. |
| Pro searches | 300 / mo | 900 (plan_wallets.py line 75) | MISMATCH |
| Pro AI credits | 3000 / mo | 15,000 (plan_wallets.py line 75) | MISMATCH |
| Pro tracking credits | not listed | 5,000 / mo | Missing in legacy. |
| Pro "All Platforms + Upcoming Platforms" | listed | "All Platforms + Upcoming" (PricingSection.tsx line 515) | Wording differs slightly. |
| Pro "~1500 video analysis or ~600 video indexing" | listed | not in app | Unverified. |
| Pro "25 AI Boards" | listed | "25 AI Boards" (line 520) | Match. |
| Pro "Deep Search Agent (new)" | listed | not in the app pricing list | Unverified. |
| Free searches | 10 / mo (recurring) | 12 search cap, one-time allowance; app copy says it does not renew | MISMATCH (cadence and value). |
| Free AI analyses | 10 / mo | 150 credits, one-time, does not renew | MISMATCH. |
| Free platforms | "2 Platforms (IG, TikTok)" | no per-plan platform list found in the app pricing UI | Unverified. |
| Free "Gemini Flash Model" | listed | not in app pricing UI | Unverified. |
| Free "1 AI Board" | listed | no free board count found in the pricing UI | Unverified. |
| Free card CTA | GET STARTED | Free is not a card in the app's PricingSection; "Included by default" text for free products | Different. |
| Trial copy in legacy | none | "Start your seven-day free trial" | Missing in legacy. |
| FAQ "monthly billing with no long-term contracts" | legacy FAQ line 1206 | annual plans exist (default yearly) | MISMATCH. |
| Money-back guarantee | 14 days (line 1403) | no code reference | Dropped per brief. |

Ambiguity to resolve with the owner: `search_platform_cap` is a per-platform allowance by name, but the app labels it "Searches / mo". The unit (searches or platform-searches) is not confirmed. Verify before publishing numbers.

Sources of truth for numbers: the live Dodo catalog and `plan_wallets.py` for entitlements. The legacy numbers should not ship until the owner confirms them against those sources.

---

## 5. Platform cross-check

Backend adapters (`backend/app/platforms/registry.py`):
- Active: `instagram_reels` (instagram), `tiktok_keyword` and `tiktok_top` (tiktok), `youtube` (lines 14-17).
- Disabled for new searches: `pinterest` (line 22, `DISABLED_SEARCH_PLATFORMS`).
- No adapter for LinkedIn, X, Reddit, Snapchat or Facebook.

| Claim in legacy | Where | App |
|---|---|---|
| LinkedIn is covered | bento body (line 733-734) | No adapter. Conflicts. |
| LinkedIn and X are "in beta" | FAQ (line 1194) | No adapter found. Unverified. |
| Pinterest shown | marquee (line 609), bento tile (line 778) | Adapter exists but is disabled. |
| Reddit, Snapchat, Facebook shown | marquee (lines 606, 610), tile (line 765) | No adapter. |
| TikTok, YouTube Shorts, Instagram Reels | FAQ (line 1193) | Matches the active adapters. |
| Free: "2 Platforms (IG, TikTok)" | line 1252 | Not verified in code. |

Recommendation for the owner: the logos and copy should follow the active adapters, or the copy should be marked as roadmap.

---

## 6. Link and destination inventory

| Destination | Where | Target |
|---|---|---|
| LOGIN | line 489 | https://agent.conthunt.app |
| Hero GET STARTED | JS line 2218 | https://agent.conthunt.app |
| Newsletter post-success GET STARTED | JS line 2231 | https://agent.conthunt.app |
| CTA GET STARTED (workflow) | line 1025 | none (MISSING) |
| Pricing GET STARTED / CHOOSE PLAN (x3) | lines 1272, 1329, 1392 | none (MISSING) |
| Nav Features / Workflow / Pricing | lines 473, 476, 479 | #features, #workflow, #pricing (in-page; these IDs will not exist on the new home page) |
| Footer links (all) | lines 1461-1485 | href "#" (MISSING) |
| Footer socials (all) | lines 1448-1452 | href "#" (MISSING) |
| Canonical and OG URL | lines 22, 42 | https://conthunt.app/ |
| Logo (nav) | line 468 | none (MISSING) |

Candidate URLs found elsewhere in the repos (not confirmed, owner to decide):
- `https://conthunt.app/docs/integrations/mcp` (app McpSetup.tsx line 36) for Docs.
- `https://twitter.com/conthunt` and `https://github.com/conthunt` (`conthunt/docs/seo_audit_conthunt.md` lines 273-274) for social links.
- Privacy and Terms source documents: `conthunt/docs/privacy-policy.md` and `conthunt/docs/terms-of-conditions.md`. Public URLs unknown.

---

## 7. Fixes applied

Only whitespace changes. No spelling fixes were needed.

1. FAQ Q1 answer: the HTML source has a line break before the final period, so the rendered text reads "and why ." The module reads "and why." (lines 1176-1180).
2. Multi-line text collapsed to single spaces (testimonials, bento body, step bodies, FAQ answers, pricing sub-lines, newsletter subhead).
3. Testimonial quotes: the decorative straight quote marks around each quote are not stored.
4. Trailing spaces trimmed on the two pricing sub-lines `~500 video analysis or ` and `~ 1500 video analysis or`.
5. Newsletter heading split into two lines at the legacy `<br />`.

Spelling check: no spelling typos found. "ConHunt" appears once in the source as "ContHunt" in quote 2 (line 1063); the module keeps "ContHunt" as written (the source is correct).

Kept as written (flagged, not changed): "organic skin care" vs "organic skincare" in code (lines 547, step2 line 48); "© 2024"; "Creator" and "Pro Research" card names; "10 Searches / mo" type copy.

---

## 8. MISSING list

| Module | Field | Why |
|---|---|---|
| nav.ts | logo.href | Logo not linked on legacy page. |
| platforms.ts | platformCount | No count on page. |
| getStarted.ts | cta.href | Button has no destination. |
| getStarted.ts | deepDiveVideo.poster | None in legacy (no poster attribute). |
| testimonials.ts | items[0-3].avatar | No images; grey circles only. |
| pricing.ts | plans[0-2].cta.href | No destinations. |
| pricing.ts | plans[1-2].struckPrice source | $49 and $139 have no source in code. |
| pricing.ts | trialTerms | Not in legacy; brief says 1-week trial (app: 7 days). |
| newsletter.ts | submit.endpoint | Form is client-side only. |
| footer.ts | all url fields | href "#" on every footer link and social icon. |
| hero-legacy.ts | simulation.mainLottie.depicts | Not rendered (brief). |
| hero-legacy.ts | simulation.scene1Lottie.depicts | Not rendered (brief). |
| hero-legacy.ts | simulation.*.layerNames | Layer names absent in both files. |
| (not in legacy) | footer personality copy | Brief item 9 (CebbF). New work. |
| (not in legacy) | nav "Get started" button | PLAN and brief want it; not in legacy nav. |

---

## 9. Excluded or not processed

- Risk Reversal block, 14-day money-back guarantee (lines 1398-1405): excluded per brief.
- Commented-out "Log in" link (lines 486-488): excluded.
- Dead JS: the sort dropdown script (lines 1762-1821) looks up `#sort-btn`, `#sort-menu`, `#cards-container` and `.content-card`, none of which exist in the markup. The tab-switch script (lines 1727-1759) is entirely commented out. Neither contributes copy.
- Head meta is in `hero-legacy.ts` (`head`). Canonical, theme-color and robots tags are not copied.
- CSS: the only `content:` values are empty strings (lines 124, 159, 225, 243, 424).
- `index.bak` and `index.html_temp_video` were not processed.

---

## 10. What was verified and what was not

Verified:
- All 11 modules compile with `tsc --strict` (plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `isolatedModules`), using the app's TypeScript 5.9.3 and a `types: []` config kept in `.scratch/legacy-extract/`. No errors.
- 180 string literals in the modules were matched against `index.html` and `public/step2-animation.js` after whitespace normalisation. Skipped: MISSING, URLs, icon ids and enum values. Unmatched literals (14) are expected: derived names (GitHub, Discord, Reddit, Snapchat), descriptive notes in `hero-legacy.ts`, the FAQ Q1 answer (period whitespace fix, and `<em>` tags in the source), and the statement (split into spans in the source).
- Lottie JSON parsed with `python -I` (structure counts and colours). Not rendered.
- App-side pricing and platform facts read from the source files cited in sections 4 and 5. The live Dodo catalog was not queried; no network calls were made.

Not verified:
- Whether the legacy pricing numbers match the live Dodo catalog. Only the test fixtures and a code comment were checked.
- What the two Lottie files depict. Not rendered, per the brief.
- Whether any of the footer or social URL candidates are live or owned by ContHunt.
- The visual result of any module. These files hold data only; no page was rendered.
- The deep-dive video's duration and content.
