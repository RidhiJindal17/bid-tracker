# 🚀 BidSphere AI — Production Deployment Guide

This guide details the procedures for compiling, configuring, containerizing, and deploying the BidSphere AI platform to production cloud hosts.

---

## 🗄️ Database Setup (MongoDB Atlas)

BidSphere AI uses a managed MongoDB Atlas Cluster for persistent storage.

1. **Create Cluster:** Log into MongoDB Atlas and spin up a new shared cluster (M0 or higher).
2. **Configure Network Security:**
   * Navigate to **Network Access**.
   * Click **Add IP Address**.
   * For initial testing, add `0.0.0.0/0` (Allow Access from Anywhere) or add the specific CIDR IP ranges of your hosting providers (e.g. Render, AWS VPC endpoints).
3. **Database Access Credentials:**
   * Navigate to **Database Access**.
   * Create a new database user with Read and Write permissions to the targeted database (e.g. `bidsphere`).
4. **Acquire Connection URI:**
   * Click **Connect** ➔ **Drivers** ➔ Copy the Connection String.
   * Replace `<password>` with the user password you created.

---

## 💻 Frontend Deployment (Vercel)

The React single-page application is built using Vite and should be deployed to a static host supporting client-side routing fallback configurations.

### 1. Vercel Configuration Setup
A `vercel.json` file is located at the root of the `frontend` folder to handle routing redirections:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This forces all navigation requests back to `index.html` allowing React Router to manage layouts.

### 2. Deployment Steps (Vercel Dashboard)
1. Import your project repository into Vercel.
2. Select **Vite** as the framework preset.
3. Override root folder location: **`frontend`**.
4. In the Environment Variables block, add:
   * `VITE_API_URL` = `https://your-backend-service-url.onrender.com/api`
5. Click **Deploy**. Vercel will trigger the `vite build` command and publish your assets.

---

## ⚙️ Backend Deployment (Render or Heroku)

The Express REST API server is stateful and requires a Node runtime platform.

### Option A: Render Web Service
1. Create a new **Web Service** on Render.
2. Link your Git repository.
3. Configure the following build/start settings:
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. Set Environment Variables:
   * `PORT` = `10000` (Render will bind automatically, but standard is `5000` or `10000`)
   * `NODE_ENV` = `production`
   * `MONGO_URI` = `mongodb+srv://...`
   * `JWT_SECRET` = `production_jwt_high_entropy_secret`
   * `GEMINI_API_KEY` = `your_gemini_key`
   * `CLIENT_URL` = `https://your-frontend-app.vercel.app`
5. Click **Create Web Service**.

### Option B: Docker Container Deployment
If deploying to AWS ECS, GCP Cloud Run, or DigitalOcean App Platform, use the following `Dockerfile` inside the `backend` folder:

```dockerfile
# --- Build & Runtime Environment ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install security certificates & node dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Secure environment configurations
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

# Run application under non-root node user for security
USER node

CMD ["node", "server.js"]
```

Build and test the container locally:
```bash
docker build -t bidsphere-backend ./backend
docker run -p 5000:5000 --env-file ./backend/.env bidsphere-backend
```

---

## 🤖 Google Gemini API Configuration

1. Visit the **[Google AI Studio](https://aistudio.google.com/)**.
2. Click **Get API Key** and generate a new key on a designated Google Cloud Project.
3. Ensure the project billing status has sufficient quota for high-volume enterprise requests.
4. Pass this token value into the `GEMINI_API_KEY` environmental parameter on your backend runtime platform.

---

## 🔁 Continuous Integration (CI/CD Pipeline)

Create a GitHub actions file at `.github/workflows/deploy.yml` to automate builds:

```yaml
name: BidSphere AI CI/CD Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-rate: 20
          
      - name: Test Frontend Compilation
        run: |
          cd frontend
          npm ci
          npm run build
          
      - name: Audit Backend Packages
        run: |
          cd backend
          npm ci
          npm run test --if-present

  deploy-production:
    needs: test-and-lint
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Webhook Deploy
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_WEBHOOK_URL }}"
```
This ensures that all builds are validated for syntactic consistency before being published to production servers.
