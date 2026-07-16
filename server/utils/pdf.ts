import PDFDocument from 'pdfkit'

export const generateInvoicePDF = async (order: any, items: any[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const buffers: any[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))

      const fontRegular = 'Helvetica'
      const fontBold = 'Helvetica-Bold'
      
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const customer = order.billingDetails

      // Background Stamp for PAID
      if (order.status === 'verified' || order.status === 'completed') {
        doc.save()
        doc.opacity(0.15)
        doc.fillColor('red')
        doc.fontSize(100)
        doc.rotate(-45, { origin: [300, 400] })
        doc.text('PAID', 150, 400, { align: 'center' })
        doc.restore()
      }

      // Header
      doc.fillColor('#1D1D1F')
      doc.font(fontBold).fontSize(16).text('Imani Prima Shop', 50, 50)
      doc.font(fontRegular).fontSize(10).fillColor('#86868B')
        .text('Graha STR, 2nd Floor', 50, 70)
        .text('Jalan Ampera Raya no. 11', 50, 85)
        .text('Jakarta Selatan, 12550', 50, 100)

      doc.fillColor('#1D1D1F').font(fontBold).fontSize(24).text('INVOICE', 0, 50, { align: 'right' })
      
      doc.moveTo(50, 130).lineTo(545, 130).lineWidth(2).strokeColor('#E5E7EB').stroke()

      // Meta Data Grid
      const yMeta = 150
      
      // Left: Billed To
      const leftX = 50
      const colW = 100
      
      doc.font(fontBold).fontSize(10).fillColor('#86868B')
      doc.text('Name', leftX, yMeta)
      doc.text('KTP Address', leftX, yMeta + 15)
      doc.text('NPWP', leftX, yMeta + 40)
      doc.text('NIK', leftX, yMeta + 55)
      doc.text('Phone Number', leftX, yMeta + 70)
      doc.text('Email', leftX, yMeta + 85)
      
      doc.font(fontRegular).fillColor('#1D1D1F')
      doc.text(`: ${customer.fullName || 'N/A'}`, leftX + colW, yMeta)
      doc.text(`: ${customer.address || 'N/A'}`, leftX + colW, yMeta + 15, { width: 180 })
      doc.text(`: ${customer.npwp || 'N/A'}`, leftX + colW, yMeta + 40)
      doc.text(`: ${customer.nik || 'N/A'}`, leftX + colW, yMeta + 55)
      doc.text(`: ${customer.phone || 'N/A'}`, leftX + colW, yMeta + 70)
      doc.text(`: ${customer.email || 'N/A'}`, leftX + colW, yMeta + 85)

      // Right: Ship To & Meta
      const rightX = 350
      doc.font(fontBold).fillColor('#86868B').text('Ship To:', rightX, yMeta)
      doc.font(fontRegular).fillColor('#1D1D1F').text(customer.address || 'N/A', rightX, yMeta + 15, { width: 195 })
      
      doc.font(fontBold).fillColor('#86868B')
      doc.text('Invoice number', rightX, yMeta + 55)
      doc.text('Order Date', rightX, yMeta + 70)
      doc.text('Payment Method', rightX, yMeta + 85)

      doc.font(fontRegular).fillColor('#1D1D1F')
      doc.text(`: ${order.invoiceNumber}`, rightX + 85, yMeta + 55)
      doc.text(`: ${orderDate}`, rightX + 85, yMeta + 70)
      doc.text(`: Bank Transfer Payment`, rightX + 85, yMeta + 85)

      // Order Table
      let y = yMeta + 120
      
      // Table Header bg
      doc.rect(50, y, 495, 25).fill('#F5F5F7')
      doc.fillColor('#1D1D1F').font(fontBold).fontSize(10)
      doc.text('Product', 60, y + 8)
      doc.text('Quantity', 380, y + 8, { width: 60, align: 'center' })
      doc.text('Price', 450, y + 8, { width: 85, align: 'right' })
      
      y += 25
      doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#E5E7EB').stroke()
      y += 15

      const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
      
      items.forEach(item => {
        doc.font(fontBold).fillColor('#1D1D1F').fontSize(11).text(item.productName, 60, y, { width: 300 })
        
        let sku = 'OSC1000'
        if (item.productId === 1) sku = 'OSC1000-DEV'
        if (item.productId === 3) sku = 'OSC1000-SUB'
        
        doc.font(fontRegular).fontSize(10).fillColor('#86868B').text(`SKU: ${sku}`, 60, y + 15)
        
        if (item.productId === 1 || item.productId === 2) {
           doc.font(fontBold).fontSize(8).fillColor('#1D1D1F').text('Perangkat : Rp 5.443.000 / unit', 60, y + 30)
           doc.font(fontRegular).fontSize(7).fillColor('#86868B').text('*include PPN', 60, y + 40)
        }
        if (item.productId === 3 || item.productId === 2) {
           const ySub = (item.productId === 2) ? y + 55 : y + 30
           doc.font(fontBold).fontSize(8).fillColor('#1D1D1F').text('Subscriptions: Rp 4.500.000 / Unit', 60, ySub)
           doc.font(fontRegular).fontSize(7).fillColor('#86868B').text('*include PPN', 60, ySub + 10)
        }

        // Quantity & Price
        doc.font(fontBold).fontSize(11).fillColor('#1D1D1F').text(item.quantity.toString(), 380, y, { width: 60, align: 'center' })
        doc.text(formatCurrency(item.unitPrice * item.quantity), 450, y, { width: 85, align: 'right' })
        
        y += 85
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#E5E7EB').stroke()
        y += 15
      })

      // Vessel Details
      if (customer.vesselName || customer.vesselId) {
        doc.rect(50, y, 495, 80).fill('#F5F5F7')
        doc.fillColor('#86868B').font(fontBold).fontSize(10)
        doc.text('Vessel Details:', 60, y + 10, { underline: true })
        doc.text('Vessel Name', 60, y + 25)
        doc.text('Vessel ID Book', 60, y + 40)
        
        doc.fillColor('#1D1D1F').font(fontRegular)
        doc.text(`: ${customer.vesselName || 'N/A'}`, 150, y + 25)
        doc.text(`: ${customer.vesselId || 'N/A'}`, 150, y + 40)

        doc.fillColor('#86868B').font(fontBold)
        doc.text('Notes:', 300, y + 10, { underline: true })
        doc.text('Serial Number', 300, y + 25)
        doc.text('ID Transmitter', 300, y + 40)
        
        doc.fillColor('#1D1D1F').font(fontRegular)
        // Hardcoded dummy values as in the Vue component for now
        const rand1 = Math.floor(100 + Math.random() * 900)
        const rand2 = Math.floor(1000000 + Math.random() * 9000000)
        doc.text(`: KAAB125060${rand1}`, 380, y + 25)
        doc.text(`: ${rand2}`, 380, y + 40)
        
        y += 100
      }

      // Totals
      const subtotalStr = formatCurrency(order.subtotal)
      const uniqueCodeStr = formatCurrency(order.uniqueCode)
      const totalStr = formatCurrency(order.total)

      doc.font(fontBold).fontSize(10).fillColor('#86868B')
      doc.text('Subtotal', 350, y)
      doc.font(fontRegular).fillColor('#1D1D1F').text(subtotalStr, 450, y, { width: 85, align: 'right' })
      y += 15
      
      doc.font(fontBold).fillColor('#86868B')
      doc.text('Unique Payment Code', 350, y)
      doc.font(fontRegular).fillColor('#1D1D1F').text(uniqueCodeStr, 450, y, { width: 85, align: 'right' })
      y += 15
      
      doc.moveTo(350, y).lineTo(545, y).lineWidth(1).strokeColor('#E5E7EB').stroke()
      y += 10
      
      doc.font(fontBold).fontSize(14).fillColor('#1D1D1F')
      doc.text('Total', 350, y)
      doc.fillColor('#0071E3').text(totalStr, 450, y, { width: 85, align: 'right' })
      
      y += 50
      
      // Footer
      doc.font(fontBold).fontSize(10).fillColor('#1D1D1F')
      doc.text(`Jakarta, ${orderDate}`, 50, y, { align: 'right' })
      y += 15
      doc.font(fontRegular).fontSize(8).fillColor('#86868B')
      doc.text('*This invoice is computer-generated', 50, y, { align: 'right' })
      doc.text('and does not require a physical signature', 50, y + 10, { align: 'right' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
