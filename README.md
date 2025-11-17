# Souq Jerzem Admin Dashboard

A modern, responsive admin dashboard for managing the Souq Jerzem mobile app. Built with React 19, TypeScript, and Tailwind CSS 4, featuring a clean black and white design theme aligned with 2025 design trends.

## Features

- **Authentication**: Secure login with JWT token management
- **Dashboard**: Real-time statistics with charts and metrics
- **User Management**: Full CRUD operations with role management (user, admin, employee)
- **Order Management**: View, update, and manage customer orders with detailed information
- **Coupon Management**: Create and manage discount coupons with expiration tracking
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean black and white theme with smooth animations

## Tech Stack

- **React 19**: Latest React with modern hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Wouter**: Lightweight routing
- **Recharts**: Beautiful charts and graphs
- **Axios**: HTTP client for API calls
- **shadcn/ui**: High-quality UI components
- **date-fns**: Modern date utility library

## Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Backend API running (see backend setup)

## Installation

1. Extract the project files
2. Navigate to the project directory:
   ```bash
   cd souq_jerzem_admin
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Configure environment variables:
   - The project requires `VITE_API_URL` to be set
   - Update this in your environment or settings to point to your backend API
   - Example: `http://localhost:5000/api`

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Backend Setup

The admin dashboard connects to the Souq Jerzem backend API. Make sure your backend is running and accessible.

### Backend Requirements:
- MongoDB database
- Node.js backend with Express
- JWT authentication enabled
- CORS configured to allow requests from the admin dashboard

### API Endpoints Expected:
- `POST /api/auth/login` - User authentication
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/coupons` - Get all coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon

## Default Login

Use the credentials from your backend database. If you haven't created an admin user yet, you'll need to create one directly in your MongoDB database with the role set to "admin".

## Project Structure

```
souq_jerzem_admin/
├── client/
│   ├── public/           # Static assets
│   │   └── souqlogo.png  # Souq Jerzem logo
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatCard.tsx
│   │   ├── contexts/     # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── lib/          # Utilities
│   │   │   └── api.ts    # API client
│   │   ├── pages/        # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Coupons.tsx
│   │   │   └── Login.tsx
│   │   ├── App.tsx       # Main app component
│   │   ├── index.css     # Global styles
│   │   └── main.tsx      # Entry point
│   └── index.html
├── package.json
└── README.md
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Features in Detail

### Dashboard
- Real-time statistics cards showing total users, orders, revenue, etc.
- Interactive charts for order trends and revenue overview
- Auto-refreshing data every 30 seconds

### User Management
- View all users in a sortable table
- Create new users with role assignment
- Edit existing user details
- Delete users with confirmation
- Search and filter functionality
- Role management: user, admin, employee

### Order Management
- View all orders with customer information
- Update order status (pending, confirmed, shipped, delivered, cancelled)
- View detailed order information including items, pricing, and shipping
- Search orders by order number, customer name, or email
- Filter orders by status
- Delete orders with confirmation

### Coupon Management
- Create discount coupons (percentage, fixed amount, or free shipping)
- Set expiration dates and minimum order requirements
- Edit existing coupons
- Delete coupons with confirmation
- Track active and expired coupons
- Search and filter coupons

## Design Philosophy

The dashboard follows 2025 design trends with:
- Clean black and white color scheme
- Minimalist interface
- Smooth animations and transitions
- Card-based layouts
- Modern typography (Inter font)
- Responsive grid system
- Accessible UI components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Cannot connect to backend
- Verify the backend API is running
- Check the `VITE_API_URL` environment variable
- Ensure CORS is properly configured on the backend

### Login fails
- Verify the backend authentication endpoint is working
- Check that the user exists in the database with correct credentials
- Ensure JWT_SECRET matches between frontend and backend

### Data not loading
- Check browser console for errors
- Verify API endpoints are returning correct data
- Ensure authentication token is being sent with requests

## License

Proprietary - Souq Jerzem

## Support

For issues or questions, please contact the development team.
