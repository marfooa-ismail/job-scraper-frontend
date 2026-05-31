React frontend for AI/ML Internship Intelligence

Quick start

1. Install Node.js (16+ recommended)
2. From the `frontend-react` folder run:

```bash
npm install
npm run dev
```

3. Open the local dev URL reported by Vite (usually http://localhost:5173)

Usage

- Upload the `ai_internships_lahore.csv` file exported by the scraper using the Upload control.
 - Upload the `ai_internships_lahore.csv` file exported by the scraper using the Upload control.
 - You can now also upload a PDF containing tabular listings; the app will attempt to extract tables from the PDF and render them.
- The dashboard will render visualizations and a table of opportunities.

Notes

- This is a standalone static UI. If you want one-click scraping from the UI, we can add a small backend (FastAPI) to run `search_jobs.py` and serve the CSV to the frontend.
