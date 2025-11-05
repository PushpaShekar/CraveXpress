# Quick Fix for Render Deployment Error

## Problem
TypeScript build failing on Render with errors like:
```
error TS7016: Could not find a declaration file for module 'express'
error TS7016: Could not find a declaration file for module 'passport'
```

## Root Cause
Render sets `NODE_ENV=production` by default, which causes `npm install` to skip `devDependencies`. Since TypeScript and all `@types` packages are in `devDependencies`, they don't get installed during the build process.

## Solution Applied

### 1. Fixed `server/render.yaml`
Changed the build command from:
```yaml
buildCommand: npm install && npm run build
```

To:
```yaml
buildCommand: npm install --include=dev && npm run build
```

### 2. Updated Deployment Guide
Added troubleshooting section and updated instructions to use the correct build command.

## Next Steps

### If deploying via Render Dashboard (not using render.yaml):

1. Go to your Render service dashboard
2. Click on **"Settings"** or **"Environment"** tab
3. Find **"Build Command"** section
4. Update it to:
   ```bash
   npm install --include=dev && npm run build
   ```
5. Click **"Save Changes"**
6. Trigger a new deploy by clicking **"Manual Deploy"** → **"Deploy latest commit"**

### If deploying via GitHub (using render.yaml):

1. Commit the changes:
   ```bash
   git add server/render.yaml
   git commit -m "Fix: Include devDependencies in Render build"
   git push origin main
   ```
2. Render will automatically detect the push and redeploy
3. The build should now succeed! ✅

## Verification

After deployment succeeds:

1. Check the build logs - should see TypeScript compilation completing successfully
2. Visit your backend health endpoint: `https://your-app.onrender.com/api/health`
3. Should return: `{"status":"ok","message":"Server is running"}`

## Alternative Solution (Not Recommended)

If you still face issues, you can move TypeScript and type definitions to `dependencies` instead of `devDependencies` in `server/package.json`. However, this is not recommended as it increases production bundle size unnecessarily.

---

**Status**: ✅ Fixed  
**Date**: November 2025

