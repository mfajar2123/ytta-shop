import nodemailer from 'nodemailer'
import ejs from 'ejs'
import { join } from 'path'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'

export const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
      pass: process.env.SMTP_PASS || 'etherealpassword'
    }
  })
}

// Ensures the template exists, if not creates it
export const ensureTemplate = (templateName: string, content: string) => {
  const dir = join(process.cwd(), 'server', 'templates')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  const filePath = join(dir, templateName)
  // Always overwrite to ensure latest template design is used
  writeFileSync(filePath, content)
  return filePath
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F5F5F7; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); overflow: hidden; }
  .header { background-color: #1D1D1F; padding: 40px 30px; text-align: center; color: white; }
  .header h2 { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #86868B; }
  .header h1 { margin: 10px 0 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
  .content { padding: 40px 30px; color: #1D1D1F; line-height: 1.6; font-size: 16px; }
  .content p { margin: 0 0 20px; }
  .highlight-box { background-color: #F5F5F7; border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid #E5E7EB; }
  .highlight-box h3 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #86868B; letter-spacing: 1px; }
  .highlight-box .amount { font-size: 32px; font-weight: 700; color: #0071E3; margin-bottom: 20px; }
  .footer { padding: 30px; text-align: center; color: #86868B; font-size: 12px; border-top: 1px solid #F5F5F7; }
`;

const proformaTemplate = `
<!DOCTYPE html>
<html>
<head><style>\${baseStyles}</style></head>
<body>
  <div class="wrapper">
    <div class="header">
      <h2>Imani Prima Shop</h2>
      <h1>Order Placed</h1>
    </div>
    <div class="content">
      <p>Dear <strong><%= order.billingDetails.fullName %></strong>,</p>
      <p>Thank you for your order! Your invoice number is <strong><%= order.invoiceNumber %></strong>.</p>
      <p>We have attached your Proforma Invoice to this email. Please review the details carefully.</p>
      
      <div class="highlight-box">
        <h3>Total Amount to Transfer</h3>
        <div class="amount"><%= new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total) %></div>
        <p style="margin: 0;"><strong>Bank BCA:</strong> 1234567890<br/><strong>Name:</strong> PT Imani Prima</p>
        <p style="font-size: 12px; color: #86868B; margin-top: 12px;">* This total includes a unique code to help us verify your payment automatically.</p>
      </div>

      <p>If you have already paid, you can send the payment proof to our helpdesk or simply wait for our automatic verification.</p>
    </div>
    <div class="footer">
      &copy; <%= new Date().getFullYear() %> PT Imani Prima. All rights reserved.<br/>
      Graha STR, 2nd Floor, Jalan Ampera Raya No.11, Jakarta Selatan
    </div>
  </div>
</body>
</html>
`

const lunasTemplate = `
<!DOCTYPE html>
<html>
<head><style>\${baseStyles}</style></head>
<body>
  <div class="wrapper">
    <div class="header" style="background-color: #0071E3;">
      <h2 style="color: rgba(255,255,255,0.7);">Imani Prima Shop</h2>
      <h1>Payment Verified</h1>
    </div>
    <div class="content">
      <p>Dear <strong><%= order.billingDetails.fullName %></strong>,</p>
      <p>Great news! We have successfully received and verified your payment for order <strong><%= order.invoiceNumber %></strong>.</p>
      <p>Attached is your official LUNAS (PAID) invoice for your records.</p>
      
      <div class="highlight-box" style="border-left: 4px solid #0071E3;">
        <p style="margin:0;">Your order is now being prepared for fulfillment. You will receive a final confirmation once everything is completed.</p>
      </div>
      
      <p>Thank you for choosing Imani Prima Shop!</p>
    </div>
    <div class="footer">
      &copy; <%= new Date().getFullYear() %> PT Imani Prima. All rights reserved.<br/>
      Graha STR, 2nd Floor, Jalan Ampera Raya No.11, Jakarta Selatan
    </div>
  </div>
</body>
</html>
`

const completedTemplate = `
<!DOCTYPE html>
<html>
<head><style>\${baseStyles}</style></head>
<body>
  <div class="wrapper">
    <div class="header" style="background-color: #16A34A;">
      <h2 style="color: rgba(255,255,255,0.7);">Imani Prima Shop</h2>
      <h1>Order Completed</h1>
    </div>
    <div class="content">
      <p>Dear <strong><%= order.billingDetails.fullName %></strong>,</p>
      <p>Your order <strong><%= order.invoiceNumber %></strong> has been fully completed!</p>
      <p>If you ordered physical devices, they have been handed over to our shipping partners. If you purchased subscriptions, they are now fully active.</p>
      
      <div class="highlight-box" style="border-left: 4px solid #16A34A;">
        <p style="margin:0;">Need help setting up? Check out our online documentation or reply to this email to reach our helpdesk.</p>
      </div>
      
      <p>Thank you for your business. We look forward to serving you again.</p>
    </div>
    <div class="footer">
      &copy; <%= new Date().getFullYear() %> PT Imani Prima. All rights reserved.<br/>
      Graha STR, 2nd Floor, Jalan Ampera Raya No.11, Jakarta Selatan
    </div>
  </div>
</body>
</html>
`

const cancelledTemplate = `
<!DOCTYPE html>
<html>
<head><style>\${baseStyles}</style></head>
<body>
  <div class="wrapper">
    <div class="header" style="background-color: #EF4444;">
      <h2 style="color: rgba(255,255,255,0.7);">Imani Prima Shop</h2>
      <h1>Order Cancelled</h1>
    </div>
    <div class="content">
      <p>Dear <strong><%= order.billingDetails.fullName %></strong>,</p>
      <p>Your order <strong><%= order.invoiceNumber %></strong> has been cancelled.</p>
      <p>If this was done in error or if you have any questions, please contact our helpdesk.</p>
      
      <div class="highlight-box" style="border-left: 4px solid #EF4444;">
        <p style="margin:0;">No charges have been applied, or if you already paid, please reply to this email for assistance.</p>
      </div>
      
      <p>Thank you for your understanding.</p>
    </div>
    <div class="footer">
      &copy; <%= new Date().getFullYear() %> PT Imani Prima. All rights reserved.<br/>
      Graha STR, 2nd Floor, Jalan Ampera Raya No.11, Jakarta Selatan
    </div>
  </div>
</body>
</html>
`

export const sendOrderPlacedEmail = async (order: any, items: any[], pdfBuffer: Buffer) => {
  const tplPath = ensureTemplate('proforma.ejs', proformaTemplate)
  const html = await ejs.renderFile(tplPath, { order })

  await getTransporter().sendMail({
    from: '"Imani Shop" <mfajar212345@gmail.com>',
    to: [order.customerEmail, 'mfajar212345@gmail.com'],
    subject: `Order Placed - ${order.invoiceNumber}`,
    html,
    attachments: [
      {
        filename: `${order.invoiceNumber}-Proforma.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  })
}

export const sendPaymentVerifiedEmail = async (order: any, pdfBuffer: Buffer, proofBuffer?: Buffer) => {
  const tplPath = ensureTemplate('lunas.ejs', lunasTemplate)
  const html = await ejs.renderFile(tplPath, { order })
  
  const attachments: any[] = [
    {
      filename: `${order.invoiceNumber}-Invoice.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }
  ]

  await getTransporter().sendMail({
    from: '"Imani Shop" <mfajar212345@gmail.com>',
    to: [order.customerEmail, 'mfajar212345@gmail.com'],
    subject: `Payment Verified - ${order.invoiceNumber}`,
    html,
    attachments
  })
}

export const sendOrderCompletedEmail = async (order: any, pdfBuffer: Buffer) => {
  const tplPath = ensureTemplate('completed.ejs', completedTemplate)
  const html = await ejs.renderFile(tplPath, { order })

  await getTransporter().sendMail({
    from: '"Imani Shop" <mfajar212345@gmail.com>',
    to: [order.customerEmail, 'mfajar212345@gmail.com'],
    subject: `Order Completed - ${order.invoiceNumber}`,
    html,
    attachments: [
      {
        filename: `${order.invoiceNumber}-Invoice.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  })
}

export const sendOrderCancelledEmail = async (order: any) => {
  const tplPath = ensureTemplate('cancelled.ejs', cancelledTemplate)
  const html = await ejs.renderFile(tplPath, { order })

  await getTransporter().sendMail({
    from: '"Imani Shop" <mfajar212345@gmail.com>',
    to: [order.customerEmail, 'mfajar212345@gmail.com'],
    subject: `Order Cancelled - ${order.invoiceNumber}`,
    html
  })
}
