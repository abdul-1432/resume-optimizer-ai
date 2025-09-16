# Deploy to Render

This guide helps you deploy both backend (API) and frontend (static site) to Render using the provided render.yaml.

Prerequisites:
- GitHub repo connected (you already pushed to main)
- MongoDB Atlas connection string
- A strong JWT secret

Steps:
1) Prepare env values
- Backend:
  - PORT=4000
  - MONGO_URI=your Atlas URI (mongodb+srv://...)
  - JWT_SECRET=long random string
  - CLIENT_ORIGIN=https://<frontend-onrender>.onrender.com
- Frontend:
  - VITE_API_URL=https://<backend-onrender>.onrender.com

2) Create services
- Sign in to Render -> New -> Blueprint -> Select your repo
- Ensure render.yaml is detected
- Create both services (web: login-api, static: login-web)
- For login-api, set missing env vars (MONGO_URI, JWT_SECRET)
- Deploy

3) Set correct origins
- After login-web gets a URL like https://login-web-xxxxx.onrender.com, copy it
- Update CLIENT_ORIGIN on login-api to that exact URL and redeploy
- Update VITE_API_URL in login-web env to the backend URL and redeploy

4) Verify
- Health check: https://<backend>/health should return { status: "ok" }
- Frontend should load and call API using the configured VITE_API_URL

Optional: Auto-deploy on main
- Render auto-deploys on push by default. You can disable/enable per service.
