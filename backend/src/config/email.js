import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendOrderConfirmation = async (order, user) => {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #F2EDD8;font-size:14px;color:#2C1A0E;">${item.product?.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F2EDD8;font-size:14px;color:#6B4C3B;text-align:center;">x${item.quantity}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F2EDD8;font-size:14px;color:#8B5E3C;text-align:right;font-weight:600;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('')

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#FAFAF5;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EDE4C4;">

      <!-- Header -->
      <div style="background:#2C1A0E;padding:32px 40px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:#F5E9C8;letter-spacing:0.02em;">Nam Flower</div>
        <div style="font-size:13px;color:#C4956A;margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">Order Confirmed</div>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;">
        <h2 style="font-family:Georgia,serif;font-size:22px;color:#2C1A0E;margin:0 0 8px;">Thank you, ${user.name}!</h2>
        <p style="font-size:14px;color:#6B4C3B;line-height:1.7;margin:0 0 28px;">Your order has been confirmed. Your fresh flowers are being prepared and will be delivered soon.</p>

        <!-- Order info -->
        <div style="background:#F2EDD8;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="font-size:12px;color:#8B6A4A;padding-bottom:6px;">Order ID</td>
              <td style="font-size:14px;font-weight:600;color:#2C1A0E;text-align:right;">#${order.id}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#8B6A4A;padding-bottom:6px;">Date</td>
              <td style="font-size:14px;color:#2C1A0E;text-align:right;">${new Date(order.createdAt).toLocaleDateString('en-NP', { day:'numeric', month:'long', year:'numeric' })}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#8B6A4A;padding-bottom:6px;">Payment</td>
              <td style="font-size:14px;color:#2C1A0E;text-align:right;">${order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'eSewa'}</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#8B6A4A;">Delivery to</td>
              <td style="font-size:14px;color:#2C1A0E;text-align:right;max-width:200px;">${order.deliveryAddress}</td>
            </tr>
          </table>
        </div>

        <!-- Items -->
        <h3 style="font-size:13px;font-weight:600;color:#8B6A4A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="background:#F2EDD8;">
              <th style="padding:10px 16px;font-size:11px;color:#8B6A4A;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Product</th>
              <th style="padding:10px 16px;font-size:11px;color:#8B6A4A;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Qty</th>
              <th style="padding:10px 16px;font-size:11px;color:#8B6A4A;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <!-- Total -->
        <div style="border-top:2px solid #EDE4C4;padding-top:16px;display:flex;justify-content:space-between;margin-bottom:28px;">
          <span style="font-size:16px;font-weight:600;color:#2C1A0E;">Total</span>
          <span style="font-size:18px;font-weight:700;color:#8B5E3C;">Rs. ${order.totalAmount?.toLocaleString()}</span>
        </div>

        <p style="font-size:14px;color:#6B4C3B;line-height:1.7;margin:0;">If you have any questions, reply to this email or contact us. Thank you for choosing Nam Flower!</p>
      </div>

      <!-- Footer -->
      <div style="background:#F2EDD8;padding:20px 40px;text-align:center;border-top:1px solid #EDE4C4;">
        <div style="font-size:12px;color:#8B6A4A;">© 2026 Nam Flower · Kathmandu, Nepal</div>
      </div>
    </div>
  </body>
  </html>
  `

  await transporter.sendMail({
    from: `"Nam Flower" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Order Confirmed — #${order.id} | Nam Flower`,
    html
  })
}

export default transporter
