# CraveXpress - Vercel Deployment Guide

Complete step-by-step guide to deploy CraveXpress grocery delivery application on Vercel.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Step 1: Prepare Your Codebase](#step-1-prepare-your-codebase)
5. [Step 2: Set Up MongoDB Atlas](#step-2-set-up-mongodb-atlas)
6. [Step 3: Deploy Backend to Render](#step-3-deploy-backend-to-render)
7. [Step 4: Configure Third-Party Services](#step-4-configure-third-party-services)
8. [Step 5: Deploy Frontend to Vercel](#step-5-deploy-frontend-to-vercel)
9. [Step 6: Post-Deployment Configuration](#step-6-post-deployment-configuration)
10. [Troubleshooting](#troubleshooting)
11. [Alternative: Deploy Both on Vercel](#alternative-deploy-both-on-vercel)

---

## Project Overview

**CraveXpress** is a full-stack MERN application with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + MongoDB
- **Features**: Authentication (JWT + Google OAuth), Stripe Payments, Cloudinary Image Upload, Role-based Access Control

---

## Prerequisites

Before starting, ensure you have:

- ✅ GitHub account (to host your code)
- ✅ Vercel account ([sign up free](https://vercel.com/signup))
- ✅ MongoDB Atlas account ([sign up free](https://www.mongodb.com/cloud/atlas/register))
- ✅ Render account ([sign up free](https://render.com/)) - for backend hosting
- ✅ Git installed on your computer
- ✅ Node.js v18+ installed
- ✅ Your project code ready

### Optional (for full functionality):
- 🔸 Google Cloud account (for OAuth)
- 🔸 Stripe account (for payments)
- 🔸 Cloudinary account (for image uploads)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│           FRONTEND (Vercel)                              │
│  - React App                                             │
│  - Static Files (HTML, CSS, JS)                          │
│  - Environment Variables (VITE_*)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND (Render)                               │
│  - Express Server                                        │
│  - API Routes                                            │
│  - Authentication                                        │
│  - Business Logic                                        │
└─────────┬───────────┬───────────┬──────────────────────┘
          │           │           │
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌──────────┐
    │ MongoDB │ │ Stripe  │ │Cloudinary│
    │  Atlas  │ │   API   │ │   API    │
    └─────────┘ └─────────┘ └──────────┘
```

---

## Step 1: Prepare Your Codebase

### 1.1 Initialize Git Repository (if not already done)

```bash
# Navigate to your project directory
cd CraveXpress

# Initialize git (if not already initialized)
git init

# Create .gitignore file
```

### 1.2 Create/Update `.gitignore`

Ensure you have a `.gitignore` file in the root with:

```gitignore
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production
.env.development
client/.env
server/.env

# Build outputs
dist/
build/
client/dist/
server/dist/

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Misc
.cache/
```

### 1.3 Test Local Build

```bash
# Install all dependencies
npm run install-all

# Test client build
cd client
npm run build
cd ..

# Test server build
cd server
npm run build
cd ..
```

### 1.4 Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - CraveXpress application"

# Create repository on GitHub (via web interface)
# Then add remote and push
git remote add origin https://github.com/YOUR_USERNAME/cravexpress.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas

### 2.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### 2.2 Create a Cluster

1. Click **"Build a Database"**
2. Select **"Shared"** (Free tier - M0)
3. Choose:
   - **Cloud Provider**: AWS (recommended)
   - **Region**: Select closest to your users (e.g., us-east-1)
4. **Cluster Name**: Leave default or name it `CraveXpress`
5. Click **"Create Cluster"** (takes 3-5 minutes)

### 2.3 Create Database User

1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set:
   - **Username**: `cravexpress_admin` (or your choice)
   - **Password**: Generate a strong password (save it!)
5. **Database User Privileges**: Select **"Read and write to any database"**
6. Click **"Add User"**

### 2.4 Configure Network Access

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development/testing:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is necessary for Render/Vercel to connect
4. Click **"Confirm"**

### 2.5 Get Connection String

1. Go back to **"Database"** tab
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - Add database name: change `/?retryWrites` to `/cravexpress?retryWrites`

**Final connection string should look like:**
```
mongodb+srv://cravexpress_admin:YourPassword123@cluster0.xxxxx.mongodb.net/cravexpress?retryWrites=true&w=majority
```

**🔒 Save this connection string securely - you'll need it for backend deployment!**

---

## Step 3: Deploy Backend to Render

Since Vercel has limitations with long-running processes and WebSocket connections, we'll deploy the backend on **Render** (free tier available).

### 3.1 Create Render Account

1. Go to [Render.com](https://render.com/)
2. Click **"Get Started"**
3. Sign up with GitHub (recommended for easy deployment)

### 3.2 Create New Web Service

1. Click **"New +"** button in Render dashboard
2. Select **"Web Service"**
3. Connect your GitHub repository
   - Click **"Connect account"** if not connected
   - Find and select your **CraveXpress** repository
4. Click **"Connect"**

### 3.3 Configure Web Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `cravexpress-backend` (or your choice)
- **Region**: Select closest to your MongoDB region
- **Branch**: `main`
- **Root Directory**: `server`

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install --include=dev && npm run build
  ```
  **Important**: Use `--include=dev` to install TypeScript and type definitions needed for build
- **Start Command**: 
  ```bash
  npm start
  ```

**Instance Type:**
- Select **"Free"** (for testing) or **"Starter"** (for production)

### 3.4 Add Environment Variables

Click **"Advanced"** and add environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Port number (can be any) |
| `MONGODB_URI` | `mongodb+srv://cravexpress_admin:...` | Your MongoDB connection string |
| `JWT_SECRET` | Generate random string | Use: `openssl rand -base64 32` |
| `JWT_EXPIRE` | `7d` | Token expiration |
| `CLIENT_URL` | `https://your-app.vercel.app` | Will update later |

**To generate JWT_SECRET on your computer:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3.5 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Once deployed, you'll see:
   - ✅ **Your backend URL**: `https://cravexpress-backend.onrender.com`
4. **Test the backend**: Open `https://cravexpress-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

**🎯 Save your backend URL - you'll need it for frontend deployment!**

---

## Step 4: Configure Third-Party Services

### 4.1 Google OAuth Setup (Optional but Recommended)

#### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown → **"New Project"**
3. Project name: `CraveXpress`
4. Click **"Create"**

#### Enable Google+ API

1. In the sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

#### Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** → Click **"Create"**
3. Fill in:
   - **App name**: CraveXpress
   - **User support email**: your email
   - **Developer contact**: your email
4. Click **"Save and Continue"** through all steps
5. Add test users if needed

#### Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `CraveXpress Web Client`
5. **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   https://cravexpress-backend.onrender.com
   ```
6. **Authorized redirect URIs**:
   ```
   https://cravexpress-backend.onrender.com/api/auth/google/callback
   https://your-app.vercel.app/auth/callback
   ```
7. Click **"Create"**
8. **Copy and save**:
   - Client ID
   - Client Secret

#### Add to Render Environment Variables

Go back to Render dashboard → Your service → **"Environment"** tab:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Client Secret |
| `GOOGLE_CALLBACK_URL` | `https://cravexpress-backend.onrender.com/api/auth/google/callback` |

Click **"Save Changes"** - this will redeploy your backend.

### 4.2 Stripe Payment Setup (Optional)

#### Create Stripe Account

1. Go to [Stripe.com](https://stripe.com/)
2. Click **"Sign up"**
3. Complete registration
4. Activate your account

#### Get API Keys

1. In Stripe Dashboard, click **"Developers"** in the top right
2. Click **"API keys"**
3. You'll see:
   - **Publishable key**: `pk_test_...` (for frontend)
   - **Secret key**: `sk_test_...` (for backend)
4. **Copy both keys**

#### Add to Render (Backend)

In Render environment variables:

| Key | Value |
|-----|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` |

#### Set Up Webhooks (For Production)

1. In Stripe Dashboard → **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. Endpoint URL:
   ```
   https://cravexpress-backend.onrender.com/api/payment/webhook
   ```
4. Select events to listen for (select all `payment_intent.*` and `checkout.session.*`)
5. Click **"Add endpoint"**
6. Copy **"Signing secret"** (starts with `whsec_...`)

Add to Render:

| Key | Value |
|-----|-------|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

### 4.3 Cloudinary Setup (Optional - for image uploads)

#### Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/)
2. Sign up for free account
3. Verify email

#### Get API Credentials

1. Go to Dashboard
2. You'll see:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. Copy all three

#### Add to Render

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY` | Your API key |
| `CLOUDINARY_API_SECRET` | Your API secret |

**After adding all environment variables, Render will automatically redeploy your backend.**

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account

1. Go to [Vercel.com](https://vercel.com/signup)
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub repositories

### 5.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your **CraveXpress** repository
3. Click **"Import"**

### 5.3 Configure Project Settings

**Framework Preset:**
- Vercel should auto-detect **"Vite"** ✅

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Select **`client`** folder
- Click **"Continue"**

**Build Settings:**
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 5.4 Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_API_URL` | `https://cravexpress-backend.onrender.com/api` | Your Render backend URL + /api |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID | If using Google OAuth |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` | If using Stripe (publishable key) |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | If using Google Maps |

**Important:** All Vite environment variables must start with `VITE_`

### 5.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. You'll see: ✅ **"Congratulations!"** with your live URL
4. Your app will be at: `https://your-app-name.vercel.app`

### 5.6 Update Backend CORS

1. Go back to **Render dashboard**
2. Open your backend service
3. Click **"Environment"** tab
4. Update `CLIENT_URL`:
   ```
   CLIENT_URL = https://your-app-name.vercel.app
   ```
5. Save changes (will trigger redeploy)

---

## Step 6: Post-Deployment Configuration

### 6.1 Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click on your OAuth client
4. Update **Authorized JavaScript origins**:
   ```
   https://your-actual-vercel-url.vercel.app
   ```
5. Update **Authorized redirect URIs**:
   ```
   https://your-actual-backend-url.onrender.com/api/auth/google/callback
   https://your-actual-vercel-url.vercel.app/auth/callback
   ```
6. Click **"Save"**

### 6.2 Create Admin User

1. Open your deployed app: `https://your-app.vercel.app`
2. Sign up with an email (this will be your admin account)
3. Go to MongoDB Atlas:
   - Click **"Browse Collections"**
   - Select `cravexpress` database → `users` collection
   - Find your user
   - Click **"Edit Document"**
   - Change `"role": "customer"` to `"role": "admin"`
   - Click **"Update"**
4. Logout and login again to see admin panel

### 6.3 Test Complete Flow

✅ **Test Checklist:**

- [ ] Homepage loads correctly
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can login with Google (if configured)
- [ ] Can browse products
- [ ] Can add products to cart
- [ ] Can view cart
- [ ] Can proceed to checkout
- [ ] Stripe payment works (if configured)
- [ ] Can view orders
- [ ] Admin panel accessible (if admin user created)

### 6.4 Custom Domain (Optional)

#### In Vercel:

1. Go to your project **"Settings"** → **"Domains"**
2. Add your custom domain (e.g., `cravexpress.com`)
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

#### Update Environment Variables:

- Update `CLIENT_URL` in Render backend
- Update redirect URIs in Google OAuth

---

## Troubleshooting

### Problem: Frontend can't connect to Backend

**Error**: `Network Error` or `Failed to fetch`

**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Ensure it ends with `/api`
3. Check backend is running: Visit `https://your-backend.onrender.com/api/health`
4. Verify CORS: `CLIENT_URL` in Render matches your Vercel URL exactly

### Problem: Google OAuth Not Working

**Error**: `redirect_uri_mismatch`

**Solution:**
1. Check Google Cloud Console → Credentials
2. Ensure redirect URIs match exactly (including https://)
3. Make sure both frontend and backend URLs are added
4. Clear browser cookies and try again

### Problem: MongoDB Connection Failed

**Error**: `MongooseServerSelectionError`

**Solution:**
1. Check MongoDB Atlas → Network Access
2. Ensure `0.0.0.0/0` is whitelisted
3. Verify connection string is correct (username, password, database name)
4. Check if MongoDB cluster is running

### Problem: TypeScript Build Failed on Render

**Error**: `error TS7016: Could not find a declaration file for module 'express'` or similar TypeScript errors

**Solution:**
This happens when `devDependencies` (including TypeScript and @types packages) are not installed during build.

1. Update your build command in Render to:
   ```bash
   npm install --include=dev && npm run build
   ```
2. Or in your `render.yaml`:
   ```yaml
   buildCommand: npm install --include=dev && npm run build
   ```
3. Redeploy the service

**Why this happens:** Render sets `NODE_ENV=production` by default, which makes npm skip devDependencies unless explicitly told to include them.

### Problem: Build Failed on Vercel

**Error**: `Build failed`

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Test build locally: `cd client && npm run build`
4. Check if root directory is set to `client`

### Problem: Environment Variables Not Working

**Error**: `undefined` or `null` values

**Solution:**
1. Ensure all Vite variables start with `VITE_`
2. After adding variables, **redeploy** the project
3. Don't use quotes around values in Vercel
4. Check variable names match exactly (case-sensitive)

### Problem: Render Backend Sleeping (Free Tier)

**Issue**: Backend slow or timing out after inactivity

**Solution:**
1. Free tier on Render sleeps after 15 minutes of inactivity
2. First request after sleep takes 30-60 seconds
3. Consider upgrading to Starter plan ($7/month) for always-on
4. Or use a cron job to ping your backend every 10 minutes

### Problem: Stripe Webhooks Failing

**Error**: Webhook signature verification failed

**Solution:**
1. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Verify endpoint URL in Stripe Dashboard matches exactly
3. Check webhook logs in Stripe Dashboard for errors

---

## Alternative: Deploy Both on Vercel

If you want to deploy both frontend AND backend on Vercel (using serverless functions):

### Prerequisites

This requires restructuring your backend as serverless functions, which can be complex.

### Quick Setup

1. **Create `api` folder** in root
2. **Move backend routes** to serverless functions
3. **Update vercel.json**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

**Note:** This approach requires significant refactoring and is more suitable for smaller APIs. For a full Express server like CraveXpress, using Render for the backend is recommended.

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] MongoDB has proper indexes for performance
- [ ] Stripe is in live mode (not test mode)
- [ ] Google OAuth consent screen is verified
- [ ] Error monitoring is set up (e.g., Sentry)
- [ ] Analytics is configured (e.g., Google Analytics)
- [ ] Custom domain is configured and SSL is active
- [ ] Rate limiting is properly configured
- [ ] Database backups are enabled
- [ ] Security headers are configured
- [ ] CORS is restricted to your domain only
- [ ] API keys are rotated from test to production
- [ ] Admin account is secured with strong password

---

## Useful Commands

### Update Deployment

**Frontend (Vercel):**
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys on push
```

**Backend (Render):**
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys on push
```

### View Logs

**Vercel:**
1. Go to project dashboard
2. Click on deployment
3. Click **"Runtime Logs"** or **"Build Logs"**

**Render:**
1. Go to service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Rollback Deployment

**Vercel:**
1. Go to **"Deployments"** tab
2. Find previous successful deployment
3. Click **"⋯"** → **"Promote to Production"**

**Render:**
1. Go to service **"Events"** tab
2. Find previous deploy
3. Click **"Redeploy"**

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## Support

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review deployment logs in Vercel/Render
3. Verify all environment variables
4. Test API endpoints directly
5. Check MongoDB connection

---

## 🎉 Congratulations!

Your CraveXpress application is now live on the internet!

**Frontend:** `https://your-app.vercel.app`  
**Backend:** `https://your-backend.onrender.com`

Share your app with the world! 🚀

---

**Last Updated**: November 2025  
**Version**: 1.0


