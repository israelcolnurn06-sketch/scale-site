# Iscale: marketing site

Static, no-build-step site. Plain HTML/CSS/JS, no framework, no bundler.
Matches the Design DNA of the Base44 "Iscale" mockup: warm off-white canvas,
near-navy ink, deep coral-red accent, italic serif wordmark, Sora display
type over Work Sans body copy. Domain: **iscalemktg.com** (registered via
GoDaddy).

Git repo is initialized locally with one commit. Not yet pushed to GitHub.

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
2. **Stripe Payment Links are live** on all 5 packages in `index.html`
   (`#packages`), each also offering a secondary "book a call first" path
   to `contact.html`. Verify each Stripe link in your dashboard actually
   maps to the price you intended.
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
