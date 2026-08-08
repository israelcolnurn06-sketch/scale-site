# Iscale: marketing site

Static, no-build-step site. Plain HTML/CSS/JS, no framework, no bundler.
Matches the Design DNA of the Base44 "Iscale" mockup: warm off-white canvas,
near-navy ink, deep coral-red accent, italic serif wordmark, Sora display
type over Work Sans body copy. Domain: **iscalemktg.com** (registered via
GoDaddy).

This folder is a full git working copy (not just static files) with the
GitHub remote already configured, so it can be edited and pushed directly
from here. Live deploy pipeline: edit here -> `git commit` -> `git push` ->
Cloudflare Worker auto-deploys within about a minute.

## Current status (as of 2026-08-08)

**Live and working:**
- Site is live at `https://www.iscalemktg.com`, deployed as a Cloudflare
  Worker with static assets, project name `scale-site`.
- GitHub repo: `https://github.com/israelcolnurn06-sketch/scale-site`
- DNS is fully on Cloudflare (nameservers `kara.ns.cloudflare.com` /
  `noah.ns.cloudflare.com`, switched over from GoDaddy). The bare
  `iscalemktg.com` 301-redirects to `www.iscalemktg.com` via a Cloudflare
  Redirect Rule (in the zone's Rules -> Redirect Rules), preserving path.
- All packages on the `#packages` section have live Stripe Payment Links.
  Current pricing: Meta Ads one-time $3,000; Meta Ads monthly $3,000 setup
  + $2,500/mo; Business Website $1,000 one-time + $100/mo hosting;
  Ultimate Package $4,000 setup + $2,500/mo. The Meta Ads monthly and
  Ultimate Package cards each have two separate payment buttons (setup fee
  + monthly plan) since those are separate Stripe links, not one combined
  checkout.
- Founder bio (Israel) is filled in on the `#agency` section.
- Google Search Console: domain property verified (DNS TXT record),
  sitemap.xml submitted, homepage indexing requested. Not indexed by
  Google yet as of launch day, which is expected and can take days.

**Resolved: contact/booking form wasn't delivering emails.**
- Root cause found: in `contact.html`, the `<form>` element carries both
  `data-booking` and `data-booking-form` attributes. `js/main.js` selected
  the form via `calRoot.querySelector('[data-booking-form]')`, but
  `querySelector` only searches descendants, never the element itself, so
  `form` was always `null`. The whole submit-handling block (including
  `addEventListener('submit', ...)`) was skipped, so clicking "Schedule
  Meeting" fell back to a native browser form submission: a page reload
  with the access key and field values dumped into the URL as a GET query
  string. Web3Forms was never actually contacted, for any visitor, ever.
  Confirmed live by dispatching a synthetic `submit` event on the deployed
  page and observing `defaultPrevented` was `false` before the fix.
- Fix: `js/main.js` now checks whether `calRoot` itself matches
  `[data-booking-form]` before falling back to a descendant search.
  Verified live (patched JS injected into the real production page) that
  the submit event is now correctly intercepted (`defaultPrevented` is
  `true`) and the code proceeds to call the Web3Forms API as intended.
- Caveat: end-to-end delivery could not be confirmed by automated testing.
  Both `curl` and a real headless-Chromium request to
  `api.web3forms.com/submit` get blocked (Web3Forms explicitly rejects
  non-interactive/server-side calls, and Cloudflare challenges the POST) —
  this is Web3Forms' own anti-bot behavior, not a site bug, but it means
  only a real browser session can prove final delivery. **Do one manual
  test:** submit the live contact form in a normal browser and check both
  the inbox and spam folder for iscalemarketing@gmail.com.

**Known quirk, not fully resolved:**
- Cloudflare has a zone-level "Manage your robots.txt" / "Block AI
  training bots" feature (Overview page of the `iscalemktg.com` zone) that
  auto-injects rules blocking GPTBot/ClaudeBot/PerplexityBot/
  Google-Extended, which directly contradicts this site's own
  `robots.txt` (which deliberately allows those crawlers for AI
  discoverability, see Copy notes below). Recommended fix: set that
  Cloudflare feature to "Off" since the real `robots.txt` already handles
  it. Unconfirmed whether this was actually turned off.

## Preview locally

No install needed. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

`index.html` is a single scrollable landing page: hero, then Services,
Packages, and Agency as in-page sections (`#services`, `#packages`,
`#agency`), so the nav just scrolls the same page instead of loading a new
one. Booking and legal stay as separate pages since they're destinations,
not browsing.

```
index.html         Home + Services + Packages + Agency, all as sections
contact.html       Booking widget + lead form
privacy.html       Legal
terms.html         Legal
404.html           Not-found page
css/tokens.css     Design tokens (colors in OKLCH, type, spacing)
css/site.css       All shared styles
js/main.js         Nav toggle, scroll-spy, scroll reveal, booking calendar, form delivery
robots.txt         Crawler rules incl. AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
sitemap.xml        4 URLs: /, /contact, /privacy, /terms
_headers           Cloudflare Pages security headers + cache rules (no CSP yet, see below)
site.webmanifest   PWA manifest
favicon.ico        Multi-res favicon (also mirrored in assets/)
assets/og-image.png             1200x630 social preview card
assets/apple-touch-icon.png     180x180
assets/android-chrome-*.png     192x192 and 512x512
assets/favicon-*.png            16x16 and 32x32
```

The favicon set and OG image were generated locally from the same brand
fonts and colors used on the site (Newsreader italic wordmark on the
--dark navy background, --accent coral "I" mark), not placeholders.

From `contact.html`, `privacy.html`, `terms.html`, and `404.html`, the
Services/Packages/Agency nav links point to `index.html#services` etc.
since those sections only exist on the home page. The nav also highlights
whichever section is currently in view while you scroll (scroll-spy, in
`js/main.js`).

## Deploying (GitHub + Cloudflare Pages + your domain)

The repo is committed locally. To go live:

1. Create an empty repo at https://github.com/new (no README/license).
2. `git remote add origin <your-repo-url>`, `git branch -M main`, `git push -u origin main`.
3. Cloudflare dashboard -> Workers & Pages -> Create application -> Pages ->
   Connect to Git -> pick this repo. Build command: leave blank. Build
   output directory: `/`. Deploy.
4. Custom domain: in the Pages project -> Custom domains -> add
   `www.iscalemktg.com`. Cloudflare gives you a CNAME target; add that at
   GoDaddy's DNS for the `www` record. For the bare `iscalemktg.com` (no
   `www`), use GoDaddy's domain forwarding to `https://www.iscalemktg.com`
   as a permanent (301) redirect, not temporary (302), and not masked.
5. If you have email on this domain already (Google Workspace, Microsoft
   365, etc.), do **not** move the domain's nameservers to Cloudflare, only
   add the one `www` CNAME record above. Moving nameservers risks breaking
   MX/SPF/DKIM records.

## What's still open (by design, this was scoped as front-end only)

1. **Booking calendar has no real availability yet.** The date/time picker
   in `js/main.js` is a fully working UI (and submissions really deliver,
   see above), but it doesn't check a real calendar, so double-booking is
   possible. To go live with real availability: drop in a Calendly (or
   similar) embed in `contact.html` inside the `[data-booking]` form and
   delete the calendar/time markup it replaces.
2. **Stripe Payment Links are live** on all packages in `index.html`
   (`#packages`), each also offering a secondary "book a call first" path
   to `contact.html`. Verified as of 2026-08-08 that each link's actual
   Stripe checkout amount matches the price displayed on the card.
3. **Pricing contradiction I resolved:** the original mockup's standalone
   "Business Website" card showed "$1,000 one-time" as the price, but its
   body copy said the build was free with only a $100/month hosting fee.
   That's the phrasing meant for the *Ultimate Package* bundle, not the
   standalone website. I rewrote the standalone card to say a $1,000 build
   fee plus $100/month hosting, consistent with its own price tag. Confirm
   that's the number you actually want before this goes live.
4. **Hero "campaign snapshot" and stats are explicitly illustrative**, not a
   real client result (per your instruction), and labeled as such on the
   page. Swap in a real result whenever you have one you can stand behind.
5. **Not yet wired up:** analytics/tracking (GA4, Meta Pixel, Microsoft
   Clarity), Google Search Console + sitemap submission, Schema.org
   JSON-LD (LocalBusiness/Organization), llms.txt, and the hidden
   body-SEO content blocks the SOP uses to boost AEO scoring. All optional
   for a first launch, all covered in the Website Build SOP's Phases 5-8
   whenever you're ready for them.
6. **CSP (Content-Security-Policy) is intentionally not in `_headers`.**
   Per the SOP, add it only after auditing every script/style/connect
   endpoint the live site actually uses (Google Fonts, Web3Forms, Stripe).
   The other security headers (HSTS, X-Frame-Options, etc.) are already in
   place.

## Copy notes

Copy was rewritten against the Design & Copy Rulebook's hard rules: no em
dashes, no "Ready to...?" rhetorical-question headers, no "unlock/bridge the
gap"-style filler verbs, no not-X-but-Y reversals. Pricing, package
inclusions, and the contact email were pulled directly from your mockup.
