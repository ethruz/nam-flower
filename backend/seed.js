import prisma from './src/config/db.js'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding...')

  // Admin user
  const hash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@namflower.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@namflower.com', password: hash, role: 'ADMIN' }
  })
  console.log('Admin created: admin@namflower.com / admin123')

  // Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: 'Bouquets' }, update: {}, create: { name: 'Bouquets', description: 'Fresh handcrafted bouquets' } }),
    prisma.category.upsert({ where: { name: 'Wedding' }, update: {}, create: { name: 'Wedding', description: 'Elegant wedding arrangements' } }),
    prisma.category.upsert({ where: { name: 'Single Stems' }, update: {}, create: { name: 'Single Stems', description: 'Individual fresh flowers' } }),
    prisma.category.upsert({ where: { name: 'Seasonal' }, update: {}, create: { name: 'Seasonal', description: 'Best of the season' } }),
  ])
  console.log('Categories created')

  const [bouquets, wedding, single, seasonal] = cats

  // Products with picsum images (always loads)
  const products = [
    { name: 'Sunflower Bouquet', description: 'Bright yellow sunflowers arranged beautifully', price: 850, stock: 20, categoryId: bouquets.id, imageUrl: 'https://picsum.photos/seed/sunflower/400/300' },
    { name: 'Rose Collection', description: 'Premium red and pink roses', price: 1200, stock: 15, categoryId: bouquets.id, imageUrl: 'https://picsum.photos/seed/roses/400/300' },
    { name: 'Yellow Tulips', description: 'Fresh yellow tulips from the valley', price: 650, stock: 30, categoryId: bouquets.id, imageUrl: 'https://picsum.photos/seed/tulips/400/300' },
    { name: 'Mixed Spring Bouquet', description: 'A colorful mix of spring flowers', price: 950, stock: 25, categoryId: bouquets.id, imageUrl: 'https://picsum.photos/seed/spring/400/300' },
    { name: 'Bridal Bouquet', description: 'Elegant white roses for your wedding day', price: 3500, stock: 10, categoryId: wedding.id, imageUrl: 'https://picsum.photos/seed/bridal/400/300' },
    { name: 'Wedding Centerpiece', description: 'Large floral arrangement for your reception tables', price: 5500, stock: 8, categoryId: wedding.id, imageUrl: 'https://picsum.photos/seed/wedding/400/300' },
    { name: 'Boutonniere', description: 'Small buttonhole flower for the groom', price: 450, stock: 20, categoryId: wedding.id, imageUrl: 'https://picsum.photos/seed/boutonniere/400/300' },
    { name: 'Single Red Rose', description: 'Classic single red rose', price: 150, stock: 50, categoryId: single.id, imageUrl: 'https://picsum.photos/seed/redrose/400/300' },
    { name: 'Single Lily', description: 'Elegant white lily stem', price: 200, stock: 40, categoryId: single.id, imageUrl: 'https://picsum.photos/seed/lily/400/300' },
    { name: 'Monsoon Special', description: 'Seasonal flowers celebrating the monsoon', price: 750, stock: 15, categoryId: seasonal.id, imageUrl: 'https://picsum.photos/seed/monsoon/400/300' },
    { name: 'Festive Arrangement', description: 'Perfect for Dashain and Tihar celebrations', price: 1100, stock: 20, categoryId: seasonal.id, imageUrl: 'https://picsum.photos/seed/festive/400/300' },
    { name: 'Marigold Garland', description: 'Traditional marigold garland for puja', price: 350, stock: 35, categoryId: seasonal.id, imageUrl: 'https://picsum.photos/seed/marigold/400/300' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: (await prisma.product.findFirst({ where: { name: p.name } }))?.id || 0 },
      update: {},
      create: p
    })
  }
  console.log('12 products created')
  console.log('Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
