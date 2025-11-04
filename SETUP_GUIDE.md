# CraveXpress - Detailed Setup Guide

This guide will walk you through setting up the CraveXpress application from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Third-Party Service Configuration](#third-party-service-configuration)
6. [Running the Application](#running-the-application)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Compass** (optional, for database management) - [Download](https://www.mongodb.com/products/compass)

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free" and create an account
   - Verify your email

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select your cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the sidebar
   - Click "Add New Database User"
   - Create username and password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address

5. **Get Connection String**
   - Go back to "Database" tab
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., "cravexpress")

### Local MongoDB (Development Alternative)

If you prefer running MongoDB locally:

```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
```

## Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Open `server/.env` and fill in the values:
   
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Use the connection string from MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cravexpress
   
   # Generate a random string for JWT secret
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters
   JWT_EXPIRE=7d
   
   CLIENT_URL=http://localhost:5173
   ```

5. **Test backend**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   Server running in development mode on port 5000
   MongoDB Connected: cluster0.xxxxx.mongodb.net
   ```

## Frontend Setup

1. **Navigate to client directory** (open new terminal)
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Open `client/.env`:
   
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Test frontend**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   VITE v5.0.8  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ```

## Third-Party Service Configuration

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" dropdown
   - Click "New Project"
   - Name it "CraveXpress" or similar
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: CraveXpress
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all screens
   
5. **Configure OAuth Client**
   - Application type: Web application
   - Name: CraveXpress Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Click "Create"

6. **Copy Credentials**
   - Copy Client ID and Client Secret
   - Add to both `.env` files:
   
   **server/.env:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```
   
   **client/.env:**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

### Stripe Payment Setup

1. **Create Stripe Account**
   - Go to [Stripe](https://stripe.com)
   - Click "Sign up"
   - Complete registration

2. **Get API Keys**
   - Go to Stripe Dashboard
   - Click "Developers" in the sidebar
   - Click "API keys"
   - Copy "Publishable key" and "Secret key"

3. **Add to Environment Variables**
   
   **server/.env:**
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```
   
   **client/.env:**
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   ```

4. **Set up Webhooks (for production)**
   - In Stripe Dashboard, go to "Developers" > "Webhooks"
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/payment/webhook`
   - Select events to listen to
   - Copy webhook signing secret
   - Add to `server/.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
     ```

5. **Test Webhooks (development)**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login to Stripe
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```

### Google Maps API (Optional)

1. **Enable Google Maps API**
   - In Google Cloud Console
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - Maps JavaScript API
     - Geocoding API
     - Places API

2. **Create API Key**
   - Go to "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

3. **Restrict API Key** (recommended)
   - Click on the API key
   - Under "Application restrictions": Choose "HTTP referrers"
   - Add referrer: `http://localhost:5173/*`
   - Under "API restrictions": Choose "Restrict key"
   - Select the three APIs enabled above
   - Save

4. **Add to Environment**
   
   **client/.env:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## Running the Application

### Development Mode

**Option 1: Run both together (from root directory)**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

### Default Admin Setup

To create an admin user, register normally and then update the user role in MongoDB:

```javascript
// In MongoDB Compass or shell
db.users.updateOne(
  { email: "admin@cravexpress.com" },
  { $set: { role: "admin" } }
)
```

## Deployment

### Frontend Deployment (Vercel)

1. **Prepare for deployment**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all variables from `client/.env`
   - Update `VITE_API_URL` to your backend URL

### Backend Deployment (Render)

1. **Create render.yaml** (already in server directory)

2. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: cravexpress-api
     - Root Directory: server
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

3. **Add Environment Variables**
   - In Render dashboard, go to Environment tab
   - Add all variables from `server/.env`
   - Update `CLIENT_URL` to your Vercel frontend URL
   - Update `GOOGLE_CALLBACK_URL` to use your Render URL

4. **Update Google OAuth**
   - Go back to Google Cloud Console
   - Add production redirect URI:
     `https://your-render-app.onrender.com/api/auth/google/callback`

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: Could not connect to MongoDB
```
Solution:
- Check internet connection
- Verify MongoDB URI is correct
- Ensure IP address is whitelisted in MongoDB Atlas
- Check if database user credentials are correct

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution:
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
# Or change port in .env
```

**Google OAuth Not Working**
- Verify redirect URIs match exactly (including http/https)
- Check if Google+ API is enabled
- Ensure client ID and secret are correct
- Clear browser cookies and try again

**Stripe Payments Failing**
- Use test card numbers from [Stripe Testing](https://stripe.com/docs/testing)
- Check if API keys are for test mode
- Verify webhook endpoint is reachable

**CORS Errors**
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL
- Check if CORS is properly configured in `server.ts`

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Review the logs in terminal
3. Verify all environment variables are set correctly
4. Check MongoDB connection
5. Ensure all dependencies are installed

### Useful Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update packages
npm update
```

## Next Steps

After setup:
1. Create test accounts for each role (customer, seller, admin)
2. Add sample products
3. Test the complete order flow
4. Configure email notifications (optional)
5. Set up monitoring and logging
6. Implement backup strategy for MongoDB

---

**Setup Complete! 🎉**

Your CraveXpress application should now be running successfully!

