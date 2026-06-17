# Memory.md — Nam Flower E-Commerce Platform
## Single Source of Truth | Updated: June 16, 2026

---

## 1. PROJECT OVERVIEW
| Field | Value |
|---|---|
| Project Name | Nam Flower — Online Flower Shop |
| Academic | BCA 5th Semester — MIS & E-Business Project |
| Purpose | Fully functioning e-commerce web app with cart + payments |
| Real Goal | Sellable SaaS product for Nepali flower shops |
| Mac | MacBook Pro 2012, macOS 10.15 Catalina, Node v18.20.8 |
| GitHub | github.com/ethruz/nam-flower (set up when ready) |

---

## 2. TECH STACK
| Layer | Technology | Status |
|---|---|---|
| Frontend | React (Vite 4.4.0) + Framer Motion | ✅ |
| Backend | Node.js v18 + Express.js | ✅ |
| Database | PostgreSQL 16 (Postgres.app) | ✅ |
| ORM | Prisma v5.22.0 | ✅ |
| Auth | bcryptjs + JWT | ✅ |
| Validation | Zod | ✅ |
| Security | Helmet, express-rate-limit | ✅ |
| Email | Nodemailer v8+ | ✅ |
| Payment | eSewa sandbox + Cash on Delivery | ✅ |

---

## 3. ENVIRONMENT
- Backend: `/Users/bibi/Desktop/Website_Build/NamFlower/backend/`
- Frontend: `/Users/bibi/Desktop/Website_Build/NamFlower/frontend/`
- API: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- DB: `postgresql://bibi@localhost:5432/nam_flower`
- Admin login: admin@namflower.com / admin123

### .env variables (values in .env file only — never commit)
```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EMAIL_USER=
EMAIL_PASS=          ← rotate this at myaccount.google.com → Security → App passwords
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q   ← safe, public sandbox credentials
ESEWA_BASE_URL=https://rc-epay.esewa.com.np
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

---

## 4. DATABASE
- Migration: `20260610050100_init` ✅
- Seed: `backend/seed.js` ✅ — 12 products, 4 categories, 1 admin
- Models: User, Category, Product, Cart, CartItem, Order, OrderItem, Payment, Review

---

## 5. ALL API ROUTES

| Method | Route | Auth | Status |
|---|---|---|---|
| POST | /api/auth/signup | Public | ✅ |
| POST | /api/auth/login | Public | ✅ |
| GET | /api/auth/me | JWT | ✅ |
| PATCH | /api/auth/profile | JWT | ✅ |
| GET | /api/products | Public | ✅ |
| GET | /api/products/:id | Public | ✅ |
| GET | /api/categories | Public | ✅ |
| GET | /api/cart | JWT | ✅ |
| POST | /api/cart | JWT | ✅ |
| PATCH | /api/cart/:itemId | JWT | ✅ |
| DELETE | /api/cart/:itemId | JWT | ✅ |
| DELETE | /api/cart | JWT | ✅ |
| POST | /api/orders | JWT | ✅ |
| GET | /api/orders/my | JWT | ✅ |
| GET | /api/orders/:id | JWT | ✅ |
| POST | /api/payments/esewa/initiate | JWT | ✅ |
| GET | /api/payments/esewa/success | Public | ✅ |
| POST | /api/payments/cash | JWT | ✅ |
| POST | /api/products/:id/reviews | JWT | ✅ |
| DELETE | /api/products/:id/reviews/:reviewId | JWT | ✅ |
| GET | /api/admin/dashboard | JWT+ADMIN | ✅ |
| GET | /api/admin/products | JWT+ADMIN | ✅ |
| POST | /api/admin/products | JWT+ADMIN | ✅ |
| PATCH | /api/admin/products/:id | JWT+ADMIN | ✅ |
| DELETE | /api/admin/products/:id | JWT+ADMIN | ✅ |
| GET | /api/admin/categories | JWT+ADMIN | ✅ |
| POST | /api/admin/categories | JWT+ADMIN | ✅ |
| PATCH | /api/admin/categories/:id | JWT+ADMIN | ✅ |
| DELETE | /api/admin/categories/:id | JWT+ADMIN | ✅ |
| GET | /api/orders/admin/all | JWT+ADMIN | ✅ |
| PATCH | /api/orders/admin/:id/status | JWT+ADMIN | ✅ |
| GET | /api/admin/customers | JWT+ADMIN | ✅ |
| GET | /api/admin/reports | JWT+ADMIN | ✅ |

---

## 6. FRONTEND PAGES

| Page | Route | Status | Notes |
|---|---|---|---|
| Home | / | ✅ | Hero oval image, animated counters, sections |
| Products | /products | ✅ | Search, category filter, grid, add to cart, pagination |
| Product Detail | /products/:id | ✅ | Image, reviews, quantity picker, add to cart |
| Login | /login | ✅ | JWT auth |
| Register | /register | ✅ | Validation |
| Cart | /cart | ✅ | Update qty, remove items, order summary |
| Checkout | /checkout | ✅ | Delivery address, date picker, eSewa/COD |
| Payment Success | /payment/success | ✅ | Order summary shown |
| Payment Failed | /payment/failed | ✅ | Retry button |
| Dashboard | /dashboard | ✅ | Order history, expandable rows, status badges |
| Profile | /profile | ✅ | Edit name/phone, change password, stats |
| Admin | /admin | ✅ | 5 tabs, order ID search, mobile cards |

---

## 7. COMPONENTS

| Component | Status | Notes |
|---|---|---|
| Navbar | ✅ | Profile dropdown with initials avatar, mobile hamburger |
| Footer | ✅ | Multi-column dark footer |

---

## 8. DESIGN RULES
- Background: #FAFAF5, Sections: #F2EDD8, Cards: #fff
- Accent yellow: #E8C547, Dark text: #2C1A0E, Muted: #6B4C3B
- Fonts: Playfair Display (headings), Inter (body)
- Images: `picsum.photos/seed/[keyword]/[w]/[h]` — always loads, no blocking
- No emojis anywhere — SVG icons only
- Inline styles only in JSX — no Tailwind class conflicts
- Navbar: desktop-nav class must NOT have inline `display:flex` — CSS handles show/hide

---

## 9. SECURITY NOTES
- `.env` must be in `.gitignore` — never commit secrets
- Gmail App Password: rotate at myaccount.google.com → Security → App passwords
- JWT_SECRET: use a long random string in production
- eSewa EPAYTEST credentials are public sandbox — safe to share

---

## 10. WHAT'S LEFT TO DO

### Before GitHub push (required):
1. ✅ All pages built
2. ⬜ Add `.env` to `.gitignore`
3. ⬜ Rotate Gmail App Password
4. ⬜ Email invoice after order placed
5. ⬜ Admin reports chart (frontend — backend already done)
6. ⬜ README.md for GitHub

### Nice to have (not blocking):
7. ⬜ Khalti payment
8. ⬜ WhatsApp notifications
9. ⬜ Discount/coupon codes
10. ⬜ Deployment (Vercel + Railway + Supabase)

---

## 11. START COMMANDS
```bash
# 1. Open Postgres.app
# 2. cd .../backend && npm run dev
# 3. cd .../frontend && npm run dev
```

## RESUME IN NEW SESSION
Paste Memory.md + Claude.md and say:
"Continue Nam Flower development — [what to build next]"
