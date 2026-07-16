# Atlas — Specimen Archive

A gallery front-end for the [waifu.im](https://waifu.im) public API. Pure static site (HTML/CSS/JS, no build step, no framework) — deploys to Vercel as-is.

## Features

- Live grid pulled straight from `https://api.waifu.im/images`
- Filters: rating (Safe / NSFW / All), orientation, animated vs still, sort order, results per page, and tag chips (pulled live from `/tags`)
- **Redraw** button to reshuffle the current filter set
- Pagination (Prior / Next, shows current plate / total)
- Click any image for a full lightbox with dimensions, file size, upload date, favorites, artist credit and a link back to the original source
- No login/albums/favorites-saving — those need Discord OAuth against your own account, out of scope for a public gallery front-end

## Run locally

No build tooling needed. Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 5500
```

Then open the printed local URL.

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm i -g vercel
cd waifu-gallery
vercel        # first deploy, follow prompts
vercel --prod # promote to production
```

**Option B — Git + Vercel dashboard**
1. Push this folder to a GitHub repo.
2. Go to vercel.com → **Add New… → Project** → import the repo.
3. Framework preset: **Other** (no build command, no output directory needed — it's already static).
4. Deploy.

No environment variables or backend needed; the browser calls `api.waifu.im` directly.

## Notes

- All filter values map directly to the waifu.im API's own parameters (`isNsfw`, `orientation`, `isAnimated`, `orderBy`, `includedTags`, `page`, `pageSize`), so behavior matches the official site.
- Tag list is fetched live from `/tags`, so it stays in sync if the archive adds new tags.
