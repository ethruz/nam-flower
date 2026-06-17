# Nam Flower 🌸
### Online Flower Shop — BCA 5th Semester MIS & E-Business Project

A fully functional e-commerce web application for a Nepali flower shop, built with a modern full-stack architecture. Customers can browse flowers, add to cart, and pay via eSewa or cash on delivery. Admins manage products, orders, and customers through a dedicated dashboard.

---

## Live Features

**Customer Side**
- Browse flowers by category (Bouquets, Wedding, Single Stems, Seasonal)
- Search products by name or description
- Product detail pages with reviews and ratings
- Add to cart, update quantity, remove items
- Checkout with delivery address and date picker
- Pay via eSewa (sandbox) or Cash on Delivery
- Order history with real-time status tracking
- User profile — edit name, phone, change password

**Admin Panel**
- Dashboard with revenue stats, recent orders, low stock alerts
- Full product management — add, edit, delete
- Category management
- Order management — search by order ID or customer, filter by status, update status
- Customer directory with search
- Monthly revenue reports with bar chart and top selling products

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 4.4 + Framer Motion |
| Backend | Node.js v18 + Express.js |
| Database | PostgreSQL 16 |
| ORM | Prisma v5.22 |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Payment | eSewa sandbox |
| Email | Nodemailer + Gmail SMTP |
| Security | Helmet + express-rate-limit |

---

## Getting Started

### Prerequisites
- Node.js v18
- PostgreSQL (Postgres.app on Mac)
- npm

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/nam-flower.git
cd nam-flower

# 2. Setup backend
cd backend
npm install
cp .env.example .env        # fill in your values
npx prisma migrate dev --name init
npx prisma generate
node seed.js                 # seeds 12 products, 4 categories, admin user

# 3. Setup frontend
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Admin Access
```
Email: admin@namflower.com
Password: admin123
```

---

## Environment Variables

Create `backend/.env` (never commit this file):

```env
DATABASE_URL="postgresql://YOUR_USER@localhost:5432/nam_flower"
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
EMAIL_USER="your@gmail.com"
EMAIL_PASS="your-gmail-app-password"
ESEWA_MERCHANT_CODE="EPAYTEST"
ESEWA_SECRET_KEY="8gBm/:&EnhH.1/q"
ESEWA_BASE_URL="https://rc-epay.esewa.com.np"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:5000"
```

---

## Database Schema

```
User → Cart → CartItem → Product
User → Order → OrderItem → Product
Order → Payment
User → Review → Product
Product → Category
```

---

## API Endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| GET | /api/categories | Public |
| GET/POST | /api/cart | JWT |
| POST | /api/orders | JWT |
| GET | /api/orders/my | JWT |
| POST | /api/payments/esewa/initiate | JWT |
| POST | /api/payments/cash | JWT |
| POST | /api/products/:id/reviews | JWT |
| GET | /api/admin/dashboard | Admin |
| GET | /api/admin/reports | Admin |

---

## Project Structure

```
nam-flower/
├── backend/
│   ├── src/
│   │   ├── config/        # DB + Email
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # Express routes
│   │   ├── validators/    # Zod schemas
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── seed.js
└── frontend/
    └── src/
        ├── components/    # Navbar, Footer
        ├── context/       # AuthContext
        ├── pages/         # All page components
        └── utils/         # API helper
```

---

## Academic Report Structure

1. Introduction
2. Problem Statement
3. Objectives
4. Literature Review
5. Requirement Analysis
6. Feasibility Study
7. Use Case Diagram
8. DFD (Level 0, Level 1)
9. ER Diagram
10. Database Design
11. System Architecture
12. Implementation
13. Testing
14. Conclusion
15. Future Enhancements
16. References

---

## Future Enhancements

- Khalti payment integration
- WhatsApp order notifications
- Discount and coupon codes
- Mobile app (React Native)
- Multi-vendor support for SaaS model
- Deployment on Vercel + Railway + Supabase

---

*Built for BCA 5th Semester — MIS & E-Business | 2026*
