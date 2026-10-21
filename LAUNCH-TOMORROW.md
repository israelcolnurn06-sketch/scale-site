# Publishing iscalemktg.com tomorrow

This `launch/` folder is the complete site, ready to publish. It contains:

- `index.html` + `home/` = the new Royal Gold homepage (search turned on, real domain in its tags, new share image).
- `pricing.html` = the existing pricing page, rewritten with the new prices (Website $1,500, Ad Management $1,500/mo, Growth Package $5,500, AI funnel tiers unchanged).
- `about.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html` = carried over from the live site unchanged, except their "What We Build" menu link now points at the new homepage's services section.
- `css/`, `js/`, `assets/` = the live site's files that those pages still need. `assets/og-image.png` is the new Royal Gold share preview.
- `_headers`, `robots.txt`, `sitemap.xml`, `favicon.ico`, `site.webmanifest` = site config, updated.

## How the live site publishes
`~/iscale-site` is a git folder connected to GitHub (`israelcolnurn06-sketch/scale-site`). Pushing to it makes Cloudflare publish automatically within about a minute. Cloudflare keeps every past version, so rolling back is one click in the dashboard (Workers & Pages > scale-site > Deployments > Rollback).

## The three commands (run in Terminal, one at a time)

1. Copy the launch folder over the live site's files:

   rsync -av --delete --exclude .git --exclude README.md "$HOME/Desktop/iScale Premium Site/launch/" "$HOME/iscale-site/"

2. Save the change:

   cd "$HOME/iscale-site" && git add -A && git commit -m "Launch Royal Gold homepage, websites-and-ads positioning, new pricing"

3. Publish:

   cd "$HOME/iscale-site" && git push

Then open https://www.iscalemktg.com/?v=new in a private window and check the homepage, then /pricing. If anything is wrong, roll back in the Cloudflare dashboard.

## After it is live
- Google Search Console: resubmit the sitemap (https://www.iscalemktg.com/sitemap.xml) and request indexing of the homepage so Google sees the new titles and prices sooner.
- Send yourself the homepage link in iMessage to confirm the new share preview shows.
- The secondary pages (about, contact, privacy, terms, pricing) still use the previous dark/yellow design. They work, but they do not match the Royal Gold homepage yet. Restyling them to match is the next job.
