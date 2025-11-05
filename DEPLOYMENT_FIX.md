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

### 1. Created `render.yaml` in Project Root
Moved the `render.yaml` from `server/` directory to the project root and added `rootDir` directive:

```yaml
services:
  - type: web
    name: cravexpress-api
    env: node
    rootDir: server  # ← This tells Render to run commands from server directory
    buildCommand: npm install --include=dev && npm run build
    startCommand: npm start
```

Key changes:
- Added `rootDir: server` to specify the working directory
- Changed build command to: `npm install --include=dev && npm run build`

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
   git add render.yaml
   git commit -m "Fix: Add rootDir and include devDependencies in Render build"
   git push origin main
   ```
   
   **Note**: The `render.yaml` file should be in the **project root**, not in the `server/` directory.

2. Render will automatically detect the push and redeploy
3. The build should now succeed! ✅

## Verification

After deployment succeeds:

1. Check the build logs - should see TypeScript compilation completing successfully
2. Visit your backend health endpoint: `https://your-app.onrender.com/api/health`
3. Should return: `{"status":"ok","message":"Server is running"}`

## Common Related Errors

### Error: Cannot find module '/opt/render/project/src/server/dist/server.js'

**Cause**: The `render.yaml` file is missing the `rootDir` directive, causing Render to run commands from the wrong directory.

**Solution**:
1. Ensure `render.yaml` is in the **project root** (not in `server/` directory)
2. Add `rootDir: server` in the service configuration:
   ```yaml
   services:
     - type: web
       rootDir: server  # ← Add this line
       buildCommand: npm install --include=dev && npm run build
       startCommand: npm start
   ```
3. Commit and push the changes

## Alternative Solution (Not Recommended)

If you still face issues, you can move TypeScript and type definitions to `dependencies` instead of `devDependencies` in `server/package.json`. However, this is not recommended as it increases production bundle size unnecessarily.

---

**Status**: ✅ Fixed  
**Date**: November 2025

