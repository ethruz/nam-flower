# Nam Flower — Setup Instructions

## First time setup (run once)

### 1. Create project folders on your Mac
```bash
mkdir -p ~/Desktop/Nam_Flower
```

### 2. Copy files
Copy the `backend/` and `frontend/` folders into `~/Desktop/Nam_Flower/`

### 3. Create the database
```bash
# Open Postgres.app first, then:
createdb nam_flower
```

### 4. Install backend dependencies + run migration
```bash
cd ~/Desktop/Nam_Flower/backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Install frontend dependencies
```bash
cd ~/Desktop/Nam_Flower/frontend
npm install
```

---

## Every time you work on it

```bash
# Terminal 1 — Backend
cd ~/Desktop/Nam_Flower/backend
npm run dev

# Terminal 2 — Frontend
cd ~/Desktop/Nam_Flower/frontend
npm run dev
```

Then open: http://localhost:5173

---

## Create admin user (run once after migration)
```bash
cd ~/Desktop/Nam_Flower/backend
node -e "
import('./src/config/db.js').then(async ({ default: prisma }) => {
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.default.hash('admin123', 12)
  await prisma.user.create({
    data: { name: 'Admin', email: '@namflower.com', password: hash, role: 'ADMIN' }
  })
  console.log('Admin created: @namflower.com / adminxxxxx')
  process.exit(0)
})
"
```

---

## Seed sample products (optional)
```bash
cd ~/Desktop/Nam_Flower/backend
node -e "
import('./src/config/db.js').then(async ({ default: prisma }) => {
  await prisma.category.createMany({
    data: [
      { name: 'Bouquets', description: 'Fresh flower bouquets' },
      { name: 'Wedding', description: 'Wedding arrangements' },
      { name: 'Single Stems', description: 'Individual flowers' },
      { name: 'Seasonal', description: 'Seasonal arrangements' }
    ]
  })
  const cat = await prisma.category.findFirst({ where: { name: 'Bouquets' } })
  await prisma.product.createMany({
    data: [
      { name: 'Sunflower Bouquet', price: 850, stock: 20, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1470509037663-253d62d2e98d?w=500' },
      { name: 'Rose Collection', price: 1200, stock: 15, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?w=500' },
      { name: 'Yellow Tulips', price: 650, stock: 30, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500' },
    ]
  })
  console.log('Seed done!')
  process.exit(0)
})
"
```
