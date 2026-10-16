# Merge the revamp into production and deploy (2026-10-16)

Owner: "merge website and deploy".

## Facts (checked by the orchestrator on 2026-10-16)

- `https://conthunt.app` → Cloudflare → Cloud Run service **`conthunt-lp`**, project **`conthunt-dev`**,
  region `us-central1` (run.app host `conthunt-lp-976912795426.us-central1.run.app`).
- Source of production: **`Synthenova/conthunt-lp`** (public, branch `main`). It is a static site: nginx
  on 8080 (`nginx.conf`), `Dockerfile` (node:20 runs `scripts/build-blog.js`, then nginx:alpine serves the output),
  `cloudbuild.yaml` (docker build → `us-central1-docker.pkg.dev/$PROJECT_ID/conthunt-lp/website` →
  `gcloud run deploy conthunt-lp`).
- **There is no deploy-on-push.** Live matches `df26e26` (11 Oct) while `main` is at `4dc9eca`; the four sync
  commits since then never went live. A deploy is a manual `gcloud builds submit`.
- The monorepo workflow `conthunt/.github/workflows/sync-mcp-guidance.yml` pushes `skills/conthunt/**` into
  this repo's root. That path must keep working.
- Live today (keep every one of these): `/`, `/blog`, 45 `/blog/<slug>` posts, `/privacy`, `/terms`, `/docs`,
  `/docs/integrations/mcp`, `/docs/integrations/skill`, `/mcp` and `/skill` (301), `/.well-known/skills/*`,
  `/rss.xml`, `/sitemap.xml`, the PostHog proxy `/ingest/`, about 50 blog 301/410 rules, `/public/*`, `/assets/*`.
  `/about`, `/editorial`, `/authors` and `/zach-sanders` return 404 live; don't newly expose them.
- The old checkout `Landing Page` has origin `sachin-soundar/conthunt-lp` (stale personal GitHub Pages
  repo, Jan 2026). It is not production. The revamp there is an untracked working tree.

## Target

Production repo clone: `C:/Users/win10/Documents/GitHub/Conthunt/conthunt-lp`, branch `revamp/next-site`
(from `main` `4dc9eca`). The revamp serves the marketing routes and every legacy route keeps working.

### Layout
- The Next app goes into **`site/`**. The legacy site stays at the repo root, untouched apart from the edits
  listed below (`content/`, `scripts/`, `skills/`, `sections/`, `assets/`, `public/`, `privacy/`, `terms/`, `SEO/`).
- Copy from `Landing Page`: `src/`, `content/`, `docs/` (not `docs/reference/`), `AGENTS.md`, `package.json`,
  `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.env.example`,
  `.gitignore` (as `site/.gitignore`), and from `public/` only what the revamp uses (`blog/`, `brand/`,
  `media/`, `llms.txt`, `og-default.jpg`, plus any other file the code references).
  Never copy `.env*` (except `.env.example`), `node_modules`, `.next`, `.scratch`, `s-*.png`, `next-env.d.ts`,
  `*.tsbuildinfo`, `index.html*`, `index.bak`, `.orchids`, `.cursor`, or the Jan-2026 assets in `public/`.

### Runtime: one container
- nginx on 8080 in front, with Next standalone on `127.0.0.1:3000` behind it.
- nginx keeps **every existing rule verbatim** (PostHog `/ingest/`, `/skill`, `/mcp`, `/.well-known/skills/`,
  every blog 301/410, `/assets/`, `/public/`) and serves the legacy generated output: `/blog`, `/blog/<slug>`,
  `/privacy`, `/terms`, `/docs/**`, `/rss.xml`, `/.well-known/skills/**`, `/public/**`, `/assets/**`.
- Everything else goes to Next:
  - `/` (exact), `/pricing`, `/resources/**`, `/viral-now/**`, `/_next/**`;
  - `/v1/**` (the Next rewrite to the backend);
  - `/robots.txt`, `/sitemap.xml`, the OG images, `/media/**`, `/brand/**`, `/llms.txt` and `/og-default.jpg`;
  - unknown paths, which get the revamp's 404 page.
- `/blog/` collides with the revamp's `public/blog/*` cover assets. Use `try_files` on the legacy file first,
  then `@next`, and check that no names collide.
- Forward `Host`, `X-Forwarded-For` and `X-Forwarded-Proto`.
- The legacy `index.html` and `sections/*.html` are no longer served at `/`. Keep anything the legacy blog,
  docs or legal pages still load.
- Entrypoint:
  - start `node server.js` and wait (bounded) until :3000 accepts, then run nginx in the foreground;
  - if either process exits, the container exits;
  - pass SIGTERM through.

### Build
- Multi-stage `Dockerfile`:
  1. The legacy builder, as today.
  2. The site builder: node:22-alpine, corepack pnpm, `pnpm install --frozen-lockfile` and `pnpm build`, with
     `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_APP_URL` as build args.
  3. The runtime: node:22-alpine plus nginx, with the legacy output in the nginx root and Next's standalone
     output, `.next/static` and `public` in `/app`.
- `NEXT_PUBLIC_*` values are public. Use the **production** backend URL, the one `agent.conthunt.app` uses.
  You can find it in that site's public client bundle, or in the monorepo docs. Report the value and where it came from.
- Update `.dockerignore` (add `site/node_modules`, `site/.next` and `.scratch`).
- `cloudbuild.yaml`: same image and service as today, plus the build args and an extra `:$BUILD_ID` image tag.
- Add `cloudbuild.preview.yaml`: the same build, deployed with `--no-traffic --tag=preview`, so the orchestrator
  can test the real container before moving traffic.

### Site changes
- `next.config.ts`: `output: "standalone"` and the correct `outputFileTracingRoot`. Dev keeps working.
- `/preview/**` section previews return 404 in production unless `ENABLE_PREVIEW_ROUTES=1`.
- **Sitemap:** one `/sitemap.xml` holding the revamp routes, the legacy `/blog` and its posts, the `/docs` pages,
  `/privacy` and `/terms`. List only canonical URLs that return 200. `robots.txt` points at it. RSS stays legacy.
- **PostHog:** the legacy pages already load PostHog, so bring the revamp pages to parity.
  - Use the same public project key and `api_host: '/ingest'`, `ui_host`, `person_profiles` and
    `cross_subdomain_cookie` as the legacy page.
  - Load it lazily (idle or first interaction) so LCP and TBT don't regress.
  - Production only.
- Legacy blog and docs nav and footer links (`scripts/templates/**`) that point at old home anchors move to
  the revamp routes and anchors. Make minimal edits and don't restyle.
- `/viral-now`:
  - Check it against the production backend (`/v1/trending/*`).
  - If the endpoints aren't live and the page breaks or shows empty states, hide it: 404, out of the sitemap,
    and no nav or footer link. Keep the code behind a flag.
- The revamp's links to `/docs`, `/docs/integrations/mcp`, `/privacy` and `/terms` must resolve in the container.

### Verification (no Docker or WSL on this host)
- In `site/`: `pnpm install`, `pnpm build`, tsc and eslint pass.
- Run the legacy build on a scratch copy, or make sure its outputs are gitignored.
- Route checks against the real nginx config:
  - If nginx isn't installed, you may fetch the official nginx Windows zip from nginx.org into a new empty
    directory under the clone's gitignored `.scratch/` and run the config with paths adjusted.
  - If that isn't viable, say so.
- Commit `site/scripts/check-routes.mjs <baseUrl>`:
  - pages: `/` (a revamp marker), `/pricing`, `/resources`, one resource, `/blog` and three posts;
  - redirects: every 301/410 parsed from `nginx.conf`, plus `/mcp` and `/skill`;
  - legacy: `/privacy`, `/terms`, `/docs`, both integration pages, and `/.well-known/skills/index.json` and
    `SKILL.md` with their content types;
  - feeds: `/rss.xml`, `/robots.txt`, `/llms.txt`, and `/sitemap.xml`, with every URL in it returning 200;
  - assets: `/og-default.jpg`, one `/media/*`, one `/_next/static/*`, `/ingest/` (not 5xx), `/v1/...` (not 5xx);
  - errors: `/preview/hero` → 404 and an unknown path → 404.
- The orchestrator runs that script against the Cloud Run preview tag.

### Git and safety
- Commit on `revamp/next-site` in the clone. End each message with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- The repo is **public**. Never commit `.env` files, credential values, `.scratch`, screenshots or
  `docs/reference`. Before the first commit, scan the staged tree for secrets and report the result.
- **Don't push, deploy or run gcloud.** The orchestrator does that.
- Leave the `Landing Page` folder and its dev server on :3001 alone (that's the owner's preview). Use port 3010+.
  Close every server and browser you start.
