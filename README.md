# CraveXpress - Full-Stack Grocery Delivery Platform

A modern, professional-grade grocery delivery web application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

![CraveXpress](https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop)

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Google OAuth 2.0** integration for social login
- **Role-based access control** (Admin, Seller, Customer)
- Password hashing with bcrypt
- Protected routes and middleware

### 🧑‍💼 Admin Panel
- Comprehensive dashboard with analytics
- User management (view, update, delete)
- Product management across all sellers
- Order tracking and status updates
- User statistics and insights

### 🛒 Customer Features
- Browse products with advanced filtering (category, price, ratings)
- Product search functionality
- Add to cart and manage cart items
- Multiple delivery addresses with Google Maps support
- Secure checkout with Stripe payment integration
- Order history and real-time order tracking
- Product reviews and ratings system

### 🧑‍🌾 Seller Panel
- Seller dashboard with sales analytics
- Product management (CRUD operations)
- Inventory tracking
- Order management
- Sales reporting

### 💳 Payment Processing
- **Stripe** integration for credit/debit card payments
- **Razorpay** support (ready to configure)
- Cash on Delivery (COD) option
- Secure payment handling
- Transaction tracking

### 🎨 UI/UX
- Modern, responsive design with **Tailwind CSS**
- Mobile-first approach
- Smooth animations with **Framer Motion**
- Toast notifications for user feedback
- Intuitive navigation with **React Router**

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **React Hook Form** + **Yup** for form validation
- **Zustand** / **Context API** for state management
- **Axios** for API calls
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Stripe.js** for payment processing
- **date-fns** for date formatting

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Passport.js** for OAuth
- **Stripe SDK** for payments
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Morgan** for logging
- **Rate limiting** for API protection

## 📁 Project Structure

```
CraveXpress/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Cart)
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── admin/     # Admin panel pages
│   │   │   └── seller/    # Seller panel pages
│   │   ├── lib/           # Utilities (axios config)
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   └── server.ts     # Entry point
│   └── package.json
│
├── types/                 # Shared TypeScript types
│   └── index.ts
│
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Stripe account (for payments)
- Google OAuth credentials (for social login)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cravexpress.git
   cd cravexpress
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cravexpress

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Frontend URL
   CLIENT_URL=http://localhost:5173

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

   Create `.env` file in the `client` directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api

   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=your_google_client_id

   # Stripe
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run the application**

   Development mode (runs both frontend and backend):
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Backend
   npm run server

   # Frontend (in another terminal)
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔑 Environment Variables Guide

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### Setting up Stripe

1. Create account at [Stripe](https://stripe.com)
2. Get your API keys from the Dashboard
3. For webhooks, use Stripe CLI in development:
   ```bash
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```

### Setting up MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create a database user
4. Whitelist your IP address
5. Get connection string and add to `MONGODB_URI`

## 📦 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Set root directory to `client`
5. Add environment variables
6. Deploy!

### Backend (Render / Railway)

#### Render

1. Go to [Render](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set root directory to `server`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables
8. Deploy!

#### Railway

1. Go to [Railway](https://railway.app)
2. Create new project from GitHub repo
3. Set root directory to `server`
4. Add environment variables
5. Deploy!

### Using Vercel Serverless Functions (Alternative)

You can deploy both frontend and backend on Vercel using serverless functions. Create `api` directory in root and adapt Express routes.

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user (customer/seller)
- [ ] Login with credentials
- [ ] Login with Google
- [ ] Logout

**Customer Flow:**
- [ ] Browse products
- [ ] Search and filter products
- [ ] View product details
- [ ] Add products to cart
- [ ] Update cart quantities
- [ ] Add delivery address
- [ ] Checkout with Stripe
- [ ] View order history
- [ ] Track order status
- [ ] Write product review

**Seller Flow:**
- [ ] View seller dashboard
- [ ] Add new product
- [ ] Edit product
- [ ] Delete product
- [ ] View orders
- [ ] Update stock

**Admin Flow:**
- [ ] View admin dashboard
- [ ] Manage users
- [ ] Manage all products
- [ ] Manage all orders
- [ ] Update order status

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP-only cookies (optional)
- CORS configuration
- Rate limiting
- Helmet.js security headers
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Seller/Admin)
- `DELETE /api/products/:id` - Delete product (Seller/Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Payments
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Stripe webhook

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by CraveXpress Team

## 🙏 Acknowledgments

- Inspired by [Greencart](https://greencart-gs.vercel.app/)
- UI components inspired by modern e-commerce platforms
- Icons from Lucide React
- Images from Unsplash

---

**Happy Coding! 🚀**

