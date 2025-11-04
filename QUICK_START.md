# 🚀 Quick Start Guide

Get CraveXpress running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Basic knowledge of terminal/command line

## Step 1: Installation (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd CraveXpress

# Install all dependencies
npm run install-all
```

## Step 2: Database Setup (1 minute)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string

## Step 3: Environment Setup (1 minute)

**Backend (.env in server directory):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=any_random_long_string_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (.env in client directory):**
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 4: Run the Application (1 minute)

From the root directory:
```bash
npm run dev
```

That's it! 🎉

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

## First Steps

1. **Create an Account**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Choose "Seller" to add products, or "Customer" to browse

2. **Make Yourself Admin** (optional)
   - Register with any email
   - Open MongoDB Compass or Atlas
   - Find your user in the `users` collection
   - Change `role` from "customer" to "admin"

3. **Add Products** (as Seller)
   - Login as a seller
   - Go to Dashboard → Add Product
   - Fill in product details
   - Use image URLs from Unsplash or similar

4. **Test Shopping** (as Customer)
   - Register/Login as a customer
   - Browse products
   - Add to cart
   - Checkout (use Stripe test cards)

## Test Credit Cards (Stripe)

For testing payments:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0027 6000 3184
- Any future expiry date
- Any 3-digit CVC

## Optional: Enable Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth credentials
4. Add to your `.env` files:

**server/.env:**
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**client/.env:**
```env
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## Optional: Enable Payments

1. Go to [Stripe](https://stripe.com)
2. Create account
3. Get API keys from Dashboard
4. Add to your `.env` files:

**server/.env:**
```env
STRIPE_SECRET_KEY=sk_test_...
```

**client/.env:**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Common Issues

**Can't connect to MongoDB?**
- Check your connection string
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify username/password are correct

**Port already in use?**
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

**Dependencies not installing?**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Need More Help?

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---

**Happy coding! 🚀**

