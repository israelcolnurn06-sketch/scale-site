# Iscale: marketing site

Static, no-build-step site. Plain HTML/CSS/JS, no framework, no bundler.
Matches the Design DNA of the Base44 "Iscale" mockup: warm off-white canvas,
near-navy ink, deep coral-red accent, italic serif wordmark, Sora display
type over Work Sans body copy.

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
index.html      Home + Services + Packages + Agency, all as sections
contact.html    Booking widget + lead form
privacy.html    Legal
terms.html      Legal
404.html        Not-found page
css/tokens.css  Design tokens (colors in OKLCH, type, spacing)
css/site.css    All shared styles
js/main.js      Nav toggle, scroll-spy, scroll reveal, booking calendar, form delivery
```

From `contact.html`, `privacy.html`, `terms.html`, and `404.html`, the
Services/Packages/Agency nav links point to `index.html#services` etc.
since those sections only exist on the home page. The nav also highlights
whichever section is currently in view while you scroll (scroll-spy, in
`js/main.js`).

## What's still open (by design, this was scoped as front-end only)

1. **Founder bio.** The `#agency` section in `index.html` has a placeholder
   `[Founder Name]` card. Drop in the real name, role, and a specific
   sentence or two.
2. **Booking calendar has no real availability yet.** The date/time picker
   in `js/main.js` is a fully working UI (and submissions really deliver,
   see above), but it doesn't check a real calendar, so double-booking is
   possible. To go live with real availability: drop in a Calendly (or
   similar) embed in `contact.html` inside the `[data-booking]` form and
   delete the calendar/time markup it replaces.
3. **Stripe Payment Links are live** on all 5 packages in `index.html`
   (`#packages`), each also offering a secondary "book a call first" path
   to `contact.html`. Verify each Stripe link in your dashboard actually
   maps to the price you intended.
4. **Pricing contradiction I resolved:** the original mockup's standalone
   "Business Website" card showed "$1,000 one-time" as the price, but its
   body copy said the build was free with only a $100/month hosting fee.
   That's the phrasing meant for the *Ultimate Package* bundle, not the
   standalone website. I rewrote the standalone card to say a $1,000 build
   fee plus $100/month hosting, consistent with its own price tag. Confirm
   that's the number you actually want before this goes live.
5. **Hero "campaign snapshot" and stats are explicitly illustrative**, not a
   real client result (per your instruction), and labeled as such on the
   page. Swap in a real result whenever you have one you can stand behind.
6. **Domain, deploy, tracking, SEO/AEO infra.** None of that is wired up
   yet (out of scope for this pass). When you're ready, the Website Build
   SOP's Phases 2 through 9 cover the build pipeline, Cloudflare deploy,
   DNS, sitemap/robots/llms.txt, Schema.org, and the GA4/Meta Pixel/Clarity
   tracking stack, in that order.

## Copy notes

Copy was rewritten against the Design & Copy Rulebook's hard rules: no em
dashes, no "Ready to...?" rhetorical-question headers, no "unlock/bridge the
gap"-style filler verbs, no not-X-but-Y reversals. Pricing, package
inclusions, and the contact email were pulled directly from your mockup.
