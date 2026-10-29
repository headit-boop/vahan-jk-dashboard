# VAHAN J&K Dashboard

A free, static dashboard for the monthly **Motor Car** maker x district data.

## Open it locally

Double-click **`VAHAN_DASHBOARD.html`** - one self-contained file with the data, CSS and JS inlined. It works offline, no server. (`index.html` is the multi-file version.)

- **Month** - pick any month from JAN to the latest scraped month.
- **District** - All 20 or one district.
- **Maker** - All makers or one maker.
- **Compare with** - previous month, shown as a maker-level comparison table.
- Click bars in the trend, top-makers, or district charts to change the filters.
- The matrix switches between **Maker x district** (All districts) and **Maker x month** (one district).

## Daily updates

The Windows task **Vahan Daily Report** runs at **09:30** and rebuilds `VAHAN_DASHBOARD.html` automatically. Refresh the browser page to see the new data.

## Publish free on GitHub Pages

1. Create a free GitHub account and a **public** repository, e.g. `vahan-jk-dashboard`.
2. Upload **`VAHAN_DASHBOARD.html`** as `index.html` (one file is enough), or upload the four separate files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
3. Repository â†’ **Settings â†’ Pages** â†’ **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Save.
4. Wait 1-2 minutes. The site appears at:
   `https://<your-github-username>.github.io/vahan-jk-dashboard/`

No build step, no server, no paid plan. GitHub Pages is free for public repositories.

### Push from this PC

```bat
cd /d "D:\New folder\Documents\VahanAutomation\dashboard"
git init
git add index.html styles.css app.js data.js README.md
git commit -m "VAHAN J&K dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/vahan-jk-dashboard.git
git push -u origin main
```

Then enable Pages as above.

## Refresh the data

After each scrape, regenerate the dashboard data:

```bat
"C:\Users\HP\AppData\Local\hermes\tools\python-3.14.9+20261021-win32-x64\python.exe" ^
  "D:\New folder\Documents\VahanAutomation\tools\build_master.py"
```

That rewrites `data.js` (and `data.json`, `VAHAN_MASTER_2026.xlsx`, and per-district Excel files). Refresh the page.

## Notes

- Data is **monthly**, cumulative to the scrape date (Vahan's Maker Month Wise report).
- The dashboard is deliberately dependency-free: no Chart.js, no CDN, no tracking, no paid services.
- `data.js` is generated from the public Vahan dashboard; it contains no personal data.

