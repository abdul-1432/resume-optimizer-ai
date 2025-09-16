# GitHub Pages for Frontend

GitHub Pages can host only the static frontend (not the Node/Express backend). To use it:

1) In your GitHub repo settings:
- Go to Settings → Pages
- Set Source to GitHub Actions (it will use .github/workflows/pages.yml)

2) Add a repository secret for the API base URL:
- Settings → Secrets and variables → Actions → New repository secret
- Name: VITE_API_URL
- Value: https://your-backend-domain.tld (or a temporary http://localhost:4000 for testing, but remember GitHub Pages is on HTTPS)

3) Push or re-run the workflow
- On push to main affecting frontend/, the workflow builds and deploys to Pages
- The site will be served at https://<your-username>.github.io/resume-optimizer-ai/

Notes:
- The workflow builds with --base=/resume-optimizer-ai/ so assets resolve correctly under project pages.
- Ensure your backend has CORS CLIENT_ORIGIN set to the GitHub Pages URL in production.
- Browsers block mixed content: if Pages is HTTPS, your API must be HTTPS too.
