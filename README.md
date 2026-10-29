# VAHAN J&K Dashboard

A free, static dashboard for the monthly **Motor Car** maker × district data.

## Open it locally

Double-click `index.html`. It loads `data.js` (no server, no internet needed).

- **Month** — pick any month from JAN to the latest scraped month.
- **District** — All 20 or one district.
- **Maker** — All makers or one maker.
- **Compare with** — previous month, shown as a maker-level comparison table.
- Click bars in the trend, top-makers, or district charts to change the filters.
- The matrix switches between **Maker × district** (All districts) and **Maker × month** (one district).

## Publish free on GitHub Pages

1. Create a free GitHub account and a **public** repository, e.g. `vahan-jk-dashboard`.
2. Upload these four files to the repository root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
3. Repository → **Settings → Pages** → **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Save.
4. Wait 1–2 minutes. The site appears at:
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
