import prisma from '../config/db.js'

export const getDashboard = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, totalRevenue, recentOrders, lowStock] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 5
      })
    ])

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalCustomers,
          totalRevenue: totalRevenue._sum.amount || 0
        },
        recentOrders,
        lowStock
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query

    const where = { role: 'USER' }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({ success: true, data: { customers } })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getReports = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query

    const monthly = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM p."paidAt") AS month,
        SUM(p.amount) AS revenue,
        COUNT(p.id) AS transactions
      FROM "Payment" p
      WHERE p.status = 'COMPLETED'
        AND EXTRACT(YEAR FROM p."paidAt") = ${parseInt(year)}
      GROUP BY month
      ORDER BY month
    `

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })

    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, imageUrl: true }
        })
        return { ...product, totalSold: tp._sum.quantity }
      })
    )

    return res.status(200).json({
      success: true,
      data: { monthly, topProducts: topProductDetails, year }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
