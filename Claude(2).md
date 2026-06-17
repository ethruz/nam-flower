# Claude.md — Nam Flower Platform
## Last Updated: June 16, 2026

---

## PROJECT GOALS
1. Pass BCA MIS & E-Business exam
2. Build sellable SaaS product for Nepali flower shops
3. Push to GitHub and submit to examiner

---

## CONSTRAINTS (NEVER VIOLATE)
1. No emojis anywhere in UI — SVG icons only
2. No placeholders — every function must be complete
3. All DB writes in transactions
4. Zod validation on all POST/PATCH
5. JWT on all protected routes
6. Admin routes: protect + adminOnly middleware
7. Uniform JSON responses: { success, message, data? }
8. Prisma singleton from config/db.js
9. Node v18 — no Node 20+ features
10. No console.log in production paths
11. Images: use `picsum.photos/seed/[keyword]/[w]/[h]` — Unsplash/Pixabay block hotlinks
12. Inline styles only in JSX — no Tailwind class names in components
13. Navbar desktop-nav class must NOT have inline `display:flex` — CSS media query handles it
14. NEVER put secrets (.env values) in Memory.md or Claude.md — values stay in .env only

---

## COMPLETED ✅

### Backend:
- Full project scaffold + server.js with all routes registered
- Prisma schema: User, Category, Product, Cart, CartItem, Order, OrderItem, Payment, Review
- DB migration: 20260610050100_init
- Seed: backend/seed.js (12 products, 4 categories, 1 admin user)
- Auth: signup, login, JWT, profile update, role middleware (protect + adminOnly)
- Products + Categories: public browse/search/filter + full admin CRUD
- Cart: get/add/update/remove/clear with stock checks
- Orders: create from cart (atomic transaction, deducts stock), my orders, admin all orders
- Payments: eSewa (HMAC signature, callback verify, atomic status update) + Cash on Delivery
- Reviews: create (duplicate check), delete (owner or admin)
- Admin: dashboard stats, customers search, monthly revenue reports

### Frontend:
- Vite + React + Framer Motion scaffold
- AuthContext (login/signup/logout/updateUser)
- api.js (axios with JWT interceptor, auto-redirect on 401)
- Navbar: profile dropdown with initials avatar, admin badge, mobile hamburger menu
- Footer: multi-column dark footer
- Home: hero oval image, animated stat counters, bouquet section, best selling grid, wedding banner, trust bar
- Products: search bar, category filter sidebar, product grid, stock badges, add to cart, pagination
- ProductDetail: image, category, rating, stock badge, quantity picker, add to cart, reviews
- Login + Register: form validation, error handling
- Cart: item list with qty controls, remove, clear, order summary, checkout button
- Checkout: delivery address, date picker, eSewa/COD radio, order summary
- PaymentSuccess + PaymentFailed: animated, order summary shown
- Dashboard: order history, expandable rows, status color badges
- Profile: stats (orders, spent, member since), edit name/phone, change password
- AdminDashboard: 5 tabs (Overview, Products, Categories, Orders, Customers)
  - Overview: 4 stat cards, recent orders, low stock alert
  - Products: table (desktop) / cards (mobile), add/edit/delete with form
  - Categories: grid cards, add/delete
  - Orders: search by order ID/name/email, status filter dropdown, expandable detail panel, update status
  - Customers: search by name/email, table (desktop) / cards (mobile)

---

## WHAT TO BUILD NEXT

### Required before GitHub:
1. Email invoice — send order confirmation email (Nodemailer, backend only)
2. Admin reports chart — monthly revenue bar chart on frontend (API already built)
3. README.md — project description for GitHub/examiner

### Then:
4. .gitignore check — ensure .env is listed
5. GitHub push
6. Deployment (Vercel + Railway + Supabase)

---

## FILE STRUCTURE (current)

```
backend/
├── src/
│   ├── config/db.js                    ✅
│   ├── controllers/
│   │   ├── auth.controller.js          ✅
│   │   ├── product.controller.js       ✅ (products + categories + reviews)
│   │   ├── cart.controller.js          ✅
│   │   ├── order.controller.js         ✅
│   │   ├── payment.controller.js       ✅ (eSewa + COD)
│   │   └── admin.controller.js         ✅ (dashboard + customers + reports)
│   ├── middleware/auth.middleware.js    ✅
│   ├── routes/
│   │   ├── auth.routes.js              ✅
│   │   ├── product.routes.js           ✅ (products + categories + reviews)
│   │   ├── cart.routes.js              ✅
│   │   ├── order.routes.js             ✅
│   │   ├── payment.routes.js           ✅
│   │   └── admin.routes.js             ✅
│   ├── validators/
│   │   ├── auth.validator.js           ✅
│   │   ├── product.validator.js        ✅
│   │   └── order.validator.js          ✅
│   └── server.js                       ✅
├── prisma/schema.prisma                ✅
├── seed.js                             ✅
├── .env                                ✅ (never commit)
└── .gitignore                          ⬜ check .env is listed

frontend/src/
├── context/AuthContext.jsx             ✅
├── utils/api.js                        ✅
├── components/
│   ├── Navbar.jsx                      ✅ (profile dropdown + mobile)
│   └── Footer.jsx                      ✅
├── pages/
│   ├── Home.jsx                        ✅
│   ├── Products.jsx                    ✅
│   ├── ProductDetail.jsx               ✅
│   ├── Login.jsx                       ✅
│   ├── Register.jsx                    ✅
│   ├── Cart.jsx                        ✅
│   ├── Checkout.jsx                    ✅
│   ├── PaymentSuccess.jsx              ✅
│   ├── PaymentFailed.jsx               ✅
│   ├── Dashboard.jsx                   ✅
│   ├── Profile.jsx                     ✅
│   └── AdminDashboard.jsx              ✅
└── App.jsx                             ✅
```

---

## SCHEMA (current — v1)
```
User: id, name, email, password, phone, role(USER/ADMIN), createdAt
Category: id, name, description, imageUrl, isActive
Product: id, name, description, price, stock, imageUrl, isActive, categoryId, createdAt
Cart: id, userId(unique), updatedAt
CartItem: id, cartId, productId, quantity
Order: id, userId, totalAmount, status(PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED), paymentMethod, deliveryAddress, deliveryDate, createdAt
OrderItem: id, orderId, productId, quantity, price(snapshot at order time)
Payment: id, orderId(unique), method, status(PENDING/COMPLETED/FAILED/REFUNDED), transactionId, amount, paidAt, createdAt
Review: id, userId, productId, rating(1-5), comment, createdAt
```

---

## START COMMANDS
```bash
# 1. Open Postgres.app
# 2. cd .../backend && npm run dev
# 3. cd .../frontend && npm run dev
```

## RESUME IN NEW SESSION
Paste Memory.md + Claude.md and say:
"Continue Nam Flower development — [what to build next]"
