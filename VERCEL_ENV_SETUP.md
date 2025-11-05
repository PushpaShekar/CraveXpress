# Vercel Environment Setup - URGENT FIX

## 🚨 Your Issue: Frontend Can't Connect to Backend

Your Vercel frontend is trying to call `http://localhost:5000/api` which doesn't exist in production!

## ✅ Solution: Configure API URL in Vercel

### Step 1: Get Your Render Backend URL

1. Go to https://dashboard.render.com/
2. Click on your **cravexpress-api** service
3. Copy the URL at the top (looks like: `https://cravexpress-api-xxxx.onrender.com`)

### Step 2: Add Environment Variable in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **CraveXpress** project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New** button
6. Fill in:
   ```
   Name: VITE_API_URL
   Value: https://your-render-url.onrender.com/api
   ```
   **IMPORTANT**: Add `/api` at the end!
   
7. Select **all environments** (Production, Preview, Development)
8. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **3 dots menu** (⋯)
4. Click **Redeploy**
5. Check **Use existing Build Cache** is OFF
6. Click **Redeploy**

### Step 4: Wait & Test

1. Wait 1-2 minutes for deployment
2. Visit: https://crave-xpress.vercel.app/products
3. Products should now load! ✅

---

## Example Configuration

If your Render URL is: `https://cravexpress-api-abc123.onrender.com`

Then set:
```
VITE_API_URL=https://cravexpress-api-abc123.onrender.com/api
```

---

## Troubleshooting

### If products still don't load:

**Check Backend is Running:**
1. Go to Render dashboard
2. Check service status is "Live"
3. Open: `https://your-render-url.onrender.com/api/health`
4. Should show: `{"status":"ok","message":"Server is running"}`

**Check Environment Variable:**
1. Vercel → Settings → Environment Variables
2. Verify `VITE_API_URL` is set correctly
3. Must end with `/api`
4. Must start with `https://`

**Clear Vercel Cache:**
1. Deployments → Latest → Menu → Redeploy
2. **Uncheck** "Use existing Build Cache"
3. Redeploy

---

## What This Fixes

Before:
```javascript
// Frontend calls localhost (doesn't work in production)
baseURL: 'http://localhost:5000/api' ❌
```

After:
```javascript
// Frontend calls your Render backend
baseURL: 'https://your-render-api.onrender.com/api' ✅
```

---

## Need Help?

1. Share your Render backend URL
2. Share any errors from browser console (F12)
3. Check Vercel deployment logs for errors

