# kayducreator.com

Source for [kayducreator.com](https://kayducreator.com), a Malaysian hiking site by Kay Du: free GPX trail files, trail cards, hike stories, and the tooling that publishes them.

Plain HTML/CSS/JS, hosted on Vercel. No framework, no build step.

## What is here

- `index.html`, `free-gpx.html`, `*.html` — public pages and trail stories
- `gpx/` — free GPX files for Malaysian trails (the canonical open dataset with validator and contribution guide is [malaysia-trails-gpx](https://github.com/kaydudrone/malaysia-trails-gpx))
- `admin/` — GPX trail builder, blog editor, login (protected by `middleware.js`)
- `api/` — Vercel serverless endpoints: publish trail/blog via GitHub API, stats, auth
- `scripts/gpxLogic.js` — GPX parsing: distance, elevation gain, peak
- `content/hikes.json` — trail data

## Run locally

Any static server works for the public pages:

```bash
python3 -m http.server 8000
```

The `api/` and `admin/` parts need Vercel env vars (`ADMIN_SECRET`, `GITHUB_PAT`, `GITHUB_OWNER`, `GITHUB_REPO`).

## Contributing

Trail corrections (distance, meeting point, closed trails) are welcome as issues or PRs against `content/hikes.json`.

## Licence

Code: [MIT](LICENSE). The GPX trail files are published as an open dataset under CC BY 4.0 at [kaydudrone/malaysia-trails-gpx](https://github.com/kaydudrone/malaysia-trails-gpx); photos remain © Kay Du, credit kayducreator.com for personal use.
