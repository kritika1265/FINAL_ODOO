/**
 * PDF Service
 * Generates PDF documents for invoices, quotations, reports, etc.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '../temp/pdfs');
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  /**
   * Generate invoice PDF
   * @param {Object} invoice - Invoice object
   * @param {Object} company - Company details
   * @returns {String} PDF file path
   */
  async generateInvoicePDF(invoice, company = {}) {
    try {
      const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
      const filepath = path.join(this.outputDir, filename);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      this.addInvoiceHeader(doc, invoice, company);

      // Customer details
      this.addCustomerDetails(doc, invoice);

      // Invoice details
      this.addInvoiceDetails(doc, invoice);

      // Line items table
      this.addLineItemsTable(doc, invoice);

      // Totals
      this.addInvoiceTotals(doc, invoice);

      // Footer
      this.addInvoiceFooter(doc, invoice, company);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }

  /**
   * Add invoice header
   */
  addInvoiceHeader(doc, invoice, company) {
    // Company logo (if exists)
    if (company.logoPath && fs.existsSync(company.logoPath)) {
      doc.image(company.logoPath, 50, 45, { width: 100 });
    }

    // Company details
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .text(company.name || 'Rental Management System', 50, 50);

    doc.fontSize(10)
      .font('Helvetica')
      .text(company.address || '', 50, 80)
      .text(`GSTIN: ${company.gstin || 'N/A'}`, 50, 95)
      .text(`Email: ${company.email || ''}`, 50, 110)
      .text(`Phone: ${company.phone || ''}`, 50, 125);

    // Invoice title
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .text('INVOICE', 400, 50);

    doc.fontSize(10)
      .font('Helvetica')
      .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80)
      .text(`Date: ${moment(invoice.invoiceDate).format('DD MMM YYYY')}`, 400, 95)
      .text(`Due Date: ${moment(invoice.dueDate).format('DD MMM YYYY')}`, 400, 110);

    // Horizontal line
    doc.strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, 160)
      .lineTo(550, 160)
      .stroke();
  }

  /**
   * Add customer details
   */
  addCustomerDetails(doc, invoice) {
    const startY = 180;

    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('Bill To:', 50, startY);

    doc.fontSize(10)
      .font('Helvetica')
      .text(invoice.customer?.name || invoice.billingAddress?.name || '', 50, startY + 20)
      .text(invoice.billingAddress?.street || '', 50, startY + 35)
      .text(`${invoice.billingAddress?.city || ''}, ${invoice.billingAddress?.state || ''}`, 50, startY + 50)
      .text(`${invoice.billingAddress?.pincode || ''}`, 50, startY + 65)
      .text(`GSTIN: ${invoice.customerGSTIN || 'N/A'}`, 50, startY + 80);

    // Order details
    if (invoice.orderNumber) {
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Order Details:', 350, startY);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Order #: ${invoice.orderNumber}`, 350, startY + 20)
        .text(`Rental Period:`, 350, startY + 35)
        .text(`${moment(invoice.rentalStartDate).format('DD MMM YYYY')} to`, 350, startY + 50)
        .text(`${moment(invoice.rentalEndDate).format('DD MMM YYYY')}`, 350, startY + 65);
    }
  }

  /**
   * Add invoice details table header
   */
  addInvoiceDetails(doc, invoice) {
    // This space is used by customer details
  }

  /**
   * Add line items table
   */
  addLineItemsTable(doc, invoice) {
    const tableTop = 300;
    const tableHeaders = ['Item', 'Qty', 'Rate', 'Days', 'Amount'];
    const columnWidths = [200, 50, 80, 50, 100];
    let currentY = tableTop;

    // Table header
    doc.fontSize(10)
      .font('Helvetica-Bold');

    let currentX = 50;
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, currentY, { width: columnWidths[i], align: i === 0 ? 'left' : 'right' });
      currentX += columnWidths[i];
    });

    // Horizontal line under header
    currentY += 20;
    doc.strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, currentY)
      .lineTo(550, currentY)
      .stroke();

    // Line items
    currentY += 10;
    doc.font('Helvetica');

    invoice.lineItems.forEach((item, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const itemName = item.productName || item.description || 'Product';
      const duration = moment(item.endDate).diff(moment(item.startDate), 'days') || 1;

      currentX = 50;
      
      // Item name
      doc.text(itemName, currentX, currentY, { width: columnWidths[0], align: 'left' });
      currentX += columnWidths[0];

      // Quantity
      doc.text(item.quantity.toString(), currentX, currentY, { width: columnWidths[1], align: 'right' });
      currentX += columnWidths[1];

      // Rate
      doc.text(`₹${item.unitPrice.toFixed(2)}`, currentX, currentY, { width: columnWidths[2], align: 'right' });
      currentX += columnWidths[2];

      // Duration
      doc.text(duration.toString(), currentX, currentY, { width: columnWidths[3], align: 'right' });
      currentX += columnWidths[3];

      // Amount
      doc.text(`₹${item.total.toFixed(2)}`, currentX, currentY, { width: columnWidths[4], align: 'right' });

      currentY += 20;
    });

    // Additional charges
    if (invoice.additionalCharges && invoice.additionalCharges.length > 0) {
      currentY += 10;
      invoice.additionalCharges.forEach(charge => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        currentX = 50;
        doc.text(charge.description, currentX, currentY, { width: columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], align: 'left' });
        currentX += columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3];
        doc.text(`₹${charge.amount.toFixed(2)}`, currentX, currentY, { width: columnWidths[4], align: 'right' });
        currentY += 20;
      });
    }

    return currentY;
  }

  /**
   * Add invoice totals
   */
  addInvoiceTotals(doc, invoice) {
    const startY = 650;
    const labelX = 350;
    const valueX = 480;
    let currentY = startY;

    // Horizontal line
    doc.strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(350, currentY - 10)
      .lineTo(550, currentY - 10)
      .stroke();

    doc.fontSize(10)
      .font('Helvetica');

    // Subtotal
    doc.text('Subtotal:', labelX, currentY);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 20;

    // Discount
    if (invoice.discount && invoice.discount.amount > 0) {
      doc.text(`Discount (${invoice.discount.type === 'percentage' ? invoice.discount.value + '%' : 'Fixed'}):`, labelX, currentY);
      doc.text(`-₹${invoice.discount.amount.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 20;
    }

    // Tax breakdown
    if (invoice.tax) {
      if (invoice.tax.cgst) {
        doc.text(`CGST (${invoice.tax.taxRate / 2}%):`, labelX, currentY);
        doc.text(`₹${invoice.tax.cgst.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 20;

        doc.text(`SGST (${invoice.tax.taxRate / 2}%):`, labelX, currentY);
        doc.text(`₹${invoice.tax.sgst.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 20;
      } else if (invoice.tax.igst) {
        doc.text(`IGST (${invoice.tax.taxRate}%):`, labelX, currentY);
        doc.text(`₹${invoice.tax.igst.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 20;
      }
    }

    // Total
    currentY += 5;
    doc.fontSize(12)
      .font('Helvetica-Bold');
    doc.text('Total:', labelX, currentY);
    doc.text(`₹${invoice.total.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 25;

    // Amount paid
    if (invoice.amountPaid > 0) {
      doc.fontSize(10)
        .font('Helvetica');
      doc.text('Amount Paid:', labelX, currentY);
      doc.text(`₹${invoice.amountPaid.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 20;

      // Balance due
      doc.fontSize(12)
        .font('Helvetica-Bold');
      doc.text('Balance Due:', labelX, currentY);
      doc.text(`₹${invoice.amountDue.toFixed(2)}`, valueX, currentY, { align: 'right' });
    }
  }

  /**
   * Add invoice footer
   */
  addInvoiceFooter(doc, invoice, company) {
    const footerY = 750;

    // Payment terms
    if (invoice.paymentTerms) {
      doc.fontSize(9)
        .font('Helvetica')
        .text('Payment Terms:', 50, footerY)
        .text(invoice.paymentTerms, 50, footerY + 12);
    }

    // Notes
    if (invoice.notes) {
      doc.fontSize(9)
        .text('Notes:', 50, footerY + 30)
        .text(invoice.notes, 50, footerY + 42);
    }

    // Thank you message
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text('Thank you for your business!', 50, footerY + 70, { align: 'center' });

    // Footer line
    doc.fontSize(8)
      .font('Helvetica')
      .text(`Generated on ${moment().format('DD MMM YYYY HH:mm')}`, 50, footerY + 90, { align: 'center' });
  }

  /**
   * Generate quotation PDF
   * @param {Object} quotation 
   * @param {Object} company 
   * @returns {String} PDF file path
   */
  async generateQuotationPDF(quotation, company = {}) {
    try {
      const filename = `quotation-${quotation.quotationNumber}-${Date.now()}.pdf`;
      const filepath = path.join(this.outputDir, filename);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Similar structure to invoice but with "QUOTATION" title
      // and "Valid Until" instead of "Due Date"

      // Header
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text(company.name || 'Rental Management System', 50, 50);

      doc.fontSize(24)
        .font('Helvetica-Bold')
        .text('QUOTATION', 400, 50);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Quotation #: ${quotation.quotationNumber}`, 400, 80)
        .text(`Date: ${moment(quotation.createdAt).format('DD MMM YYYY')}`, 400, 95)
        .text(`Valid Until: ${moment(quotation.validUntil || moment().add(30, 'days')).format('DD MMM YYYY')}`, 400, 110);

      // Rest similar to invoice
      doc.text('This is a quotation for rental services.', 50, 200);
      doc.text(`Total Estimated Amount: ₹${quotation.total}`, 50, 220);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating quotation PDF:', error);
      throw error;
    }
  }

  /**
   * Generate report PDF
   * @param {String} reportTitle 
   * @param {Object} reportData 
   * @param {Object} options 
   * @returns {String} PDF file path
   */
  async generateReportPDF(reportTitle, reportData, options = {}) {
    try {
      const filename = `report-${Date.now()}.pdf`;
      const filepath = path.join(this.outputDir, filename);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Report header
      doc.fontSize(18)
        .font('Helvetica-Bold')
        .text(reportTitle, 50, 50);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Generated: ${moment().format('DD MMM YYYY HH:mm')}`, 50, 80);

      if (options.dateRange) {
        doc.text(`Period: ${options.dateRange}`, 50, 95);
      }

      // Report content (simplified - would need specific formatting per report type)
      let currentY = 130;
      doc.fontSize(10)
        .font('Helvetica')
        .text(JSON.stringify(reportData, null, 2), 50, currentY);

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error generating report PDF:', error);
      throw error;
    }
  }

  /**
   * Clean up old PDF files
   * @param {Number} daysOld - Delete files older than this many days
   */
  async cleanupOldPDFs(daysOld = 7) {
    try {
      const files = fs.readdirSync(this.outputDir);
      const cutoffDate = moment().subtract(daysOld, 'days');

      let deletedCount = 0;

      files.forEach(file => {
        const filepath = path.join(this.outputDir, file);
        const stats = fs.statSync(filepath);
        const fileDate = moment(stats.mtime);

        if (fileDate.isBefore(cutoffDate)) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      });

      console.log(`Cleaned up ${deletedCount} old PDF files`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up PDFs:', error);
      throw error;
    }
  }
}

module.exports = new PDFService();