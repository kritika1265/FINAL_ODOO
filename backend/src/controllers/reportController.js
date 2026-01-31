const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

/**
 * Report Controller
 * Generates various business reports in different formats (PDF, Excel, CSV)
 */

// @desc    Get rental orders report
// @route   GET /api/reports/rental-orders
// @access  Private (Vendor/Admin)
exports.getRentalOrdersReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      format = 'json',
      vendor,
      customer 
    } = req.query;

    const filter = {};

    // Role-based filtering
    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (status) filter.status = status;
    if (vendor && req.user.role === 'admin') filter.vendor = vendor;
    if (customer) filter.customer = customer;

    const orders = await Order.find(filter)
      .populate('customer', 'name email companyName gstin')
      .populate('vendor', 'name companyName')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    const reportData = orders.map(order => ({
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName: order.customer.name,
      customerCompany: order.customer.companyName,
      vendorName: order.vendor.companyName,
      status: order.status,
      itemCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      pickupDate: order.pickupDate,
      returnDate: order.returnDate,
      lateFee: order.lateFee || 0
    }));

    if (format === 'json') {
      return res.json({
        success: true,
        data: reportData,
        summary: {
          totalOrders: orders.length,
          totalRevenue: reportData.reduce((sum, r) => sum + r.total, 0),
          averageOrderValue: reportData.length > 0 
            ? reportData.reduce((sum, r) => sum + r.total, 0) / reportData.length 
            : 0
        }
      });
    } else if (format === 'csv') {
      const csv = generateCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=rental-orders-report.csv');
      return res.send(csv);
    } else if (format === 'xlsx') {
      const workbook = await generateExcel(reportData, 'Rental Orders');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=rental-orders-report.xlsx');
      return workbook.xlsx.write(res);
    } else if (format === 'pdf') {
      return generatePDFReport(res, 'Rental Orders Report', reportData, [
        { key: 'orderNumber', label: 'Order #' },
        { key: 'customerName', label: 'Customer' },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Total', format: 'currency' }
      ]);
    }

  } catch (error) {
    console.error('Rental orders report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Private (Vendor/Admin)
exports.getRevenueReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      format = 'json',
      groupBy = 'monthly',
      vendor 
    } = req.query;

    const filter = { status: 'paid' };

    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    if (startDate || endDate) {
      filter.paidDate = {};
      if (startDate) filter.paidDate.$gte = new Date(startDate);
      if (endDate) filter.paidDate.$lte = new Date(endDate);
    }

    if (vendor && req.user.role === 'admin') filter.vendor = vendor;

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name companyName')
      .populate('vendor', 'name companyName')
      .sort({ paidDate: -1 });

    const groupedData = {};

    invoices.forEach(invoice => {
      const date = invoice.paidDate;
      let groupKey;

      if (groupBy === 'daily') {
        groupKey = date.toISOString().split('T')[0];
      } else if (groupBy === 'weekly') {
        const week = getWeekNumber(date);
        groupKey = `${date.getFullYear()}-W${week}`;
      } else if (groupBy === 'monthly') {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'yearly') {
        groupKey = date.getFullYear().toString();
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          period: groupKey,
          invoiceCount: 0,
          totalRevenue: 0,
          totalTax: 0,
          subtotal: 0
        };
      }

      groupedData[groupKey].invoiceCount += 1;
      groupedData[groupKey].totalRevenue += invoice.total;
      groupedData[groupKey].totalTax += invoice.tax;
      groupedData[groupKey].subtotal += invoice.subtotal;
    });

    const reportData = Object.values(groupedData).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);

    if (format === 'json') {
      return res.json({
        success: true,
        data: reportData,
        summary: {
          totalInvoices: invoices.length,
          totalRevenue,
          totalTax,
          averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0
        }
      });
    } else if (format === 'csv') {
      const csv = generateCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.csv');
      return res.send(csv);
    } else if (format === 'xlsx') {
      const workbook = await generateExcel(reportData, 'Revenue Report');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.xlsx');
      return workbook.xlsx.write(res);
    }

  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

// @desc    Get product rental report
// @route   GET /api/reports/product-rental
// @access  Private (Vendor/Admin)
exports.getProductRentalReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      format = 'json',
      vendor,
      productId 
    } = req.query;

    const filter = {
      status: { $in: ['with_customer', 'returned'] }
    };

    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (vendor && req.user.role === 'admin') filter.vendor = vendor;

    const orders = await Order.find(filter)
      .populate('items.product', 'name sku category');

    const productStats = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (productId && item.product._id.toString() !== productId) {
          return;
        }

        const productKey = item.product._id.toString();

        if (!productStats[productKey]) {
          productStats[productKey] = {
            productId: productKey,
            productName: item.product.name,
            sku: item.product.sku,
            category: item.product.category || 'Uncategorized',
            totalRentals: 0,
            totalQuantityRented: 0,
            totalRevenue: 0,
            totalRentalDays: 0,
            averageRentalDuration: 0,
            utilizationRate: 0
          };
        }

        const stats = productStats[productKey];
        stats.totalRentals += 1;
        stats.totalQuantityRented += item.quantity;
        stats.totalRevenue += item.lineTotal;

        const durationMs = item.rentalEndDate - item.rentalStartDate;
        const durationDays = durationMs / (1000 * 60 * 60 * 24);
        stats.totalRentalDays += durationDays;
      });
    });

    // Calculate averages
    Object.values(productStats).forEach(stats => {
      stats.averageRentalDuration = (stats.totalRentalDays / stats.totalRentals).toFixed(2);
      stats.averageRevenue = (stats.totalRevenue / stats.totalRentals).toFixed(2);
    });

    const reportData = Object.values(productStats).sort((a, b) => 
      b.totalRevenue - a.totalRevenue
    );

    if (format === 'json') {
      return res.json({
        success: true,
        data: reportData,
        summary: {
          totalProducts: reportData.length,
          totalRentals: reportData.reduce((sum, p) => sum + p.totalRentals, 0),
          totalRevenue: reportData.reduce((sum, p) => sum + p.totalRevenue, 0)
        }
      });
    } else if (format === 'csv') {
      const csv = generateCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=product-rental-report.csv');
      return res.send(csv);
    } else if (format === 'xlsx') {
      const workbook = await generateExcel(reportData, 'Product Rental Report');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=product-rental-report.xlsx');
      return workbook.xlsx.write(res);
    }

  } catch (error) {
    console.error('Product rental report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

// @desc    Get customer report
// @route   GET /api/reports/customers
// @access  Private (Vendor/Admin)
exports.getCustomerReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      format = 'json',
      vendor 
    } = req.query;

    const filter = {};

    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (vendor && req.user.role === 'admin') filter.vendor = vendor;

    const orders = await Order.find(filter)
      .populate('customer', 'name email companyName gstin');

    const customerStats = {};

    orders.forEach(order => {
      const customerId = order.customer._id.toString();

      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          customerId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          companyName: order.customer.companyName,
          gstin: order.customer.gstin,
          totalOrders: 0,
          totalRevenue: 0,
          activeOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          averageOrderValue: 0,
          lastOrderDate: null
        };
      }

      const stats = customerStats[customerId];
      stats.totalOrders += 1;
      stats.totalRevenue += order.total;

      if (order.status === 'with_customer') stats.activeOrders += 1;
      if (order.status === 'returned') stats.completedOrders += 1;
      if (order.status === 'cancelled') stats.cancelledOrders += 1;

      if (!stats.lastOrderDate || order.createdAt > stats.lastOrderDate) {
        stats.lastOrderDate = order.createdAt;
      }
    });

    Object.values(customerStats).forEach(stats => {
      stats.averageOrderValue = (stats.totalRevenue / stats.totalOrders).toFixed(2);
    });

    const reportData = Object.values(customerStats).sort((a, b) => 
      b.totalRevenue - a.totalRevenue
    );

    if (format === 'json') {
      return res.json({
        success: true,
        data: reportData,
        summary: {
          totalCustomers: reportData.length,
          totalRevenue: reportData.reduce((sum, c) => sum + c.totalRevenue, 0),
          totalOrders: reportData.reduce((sum, c) => sum + c.totalOrders, 0)
        }
      });
    } else if (format === 'csv') {
      const csv = generateCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customer-report.csv');
      return res.send(csv);
    } else if (format === 'xlsx') {
      const workbook = await generateExcel(reportData, 'Customer Report');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=customer-report.xlsx');
      return workbook.xlsx.write(res);
    }

  } catch (error) {
    console.error('Customer report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

// @desc    Get payment report
// @route   GET /api/reports/payments
// @access  Private (Vendor/Admin)
exports.getPaymentReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      format = 'json',
      status,
      vendor 
    } = req.query;

    const filter = {};

    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (status) filter.status = status;
    if (vendor && req.user.role === 'admin') filter.vendor = vendor;

    const payments = await Payment.find(filter)
      .populate('customer', 'name email companyName')
      .populate('invoice', 'invoiceNumber')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    const reportData = payments.map(payment => ({
      paymentId: payment.paymentId,
      paymentDate: payment.paidAt || payment.createdAt,
      customerName: payment.customer.name,
      customerCompany: payment.customer.companyName,
      invoiceNumber: payment.invoice.invoiceNumber,
      orderNumber: payment.order.orderNumber,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      gatewayPaymentId: payment.gatewayPaymentId,
      refundAmount: payment.refundAmount || 0,
      refundStatus: payment.refundStatus || 'none'
    }));

    if (format === 'json') {
      return res.json({
        success: true,
        data: reportData,
        summary: {
          totalPayments: payments.length,
          totalAmount: reportData.reduce((sum, p) => sum + p.amount, 0),
          totalRefunds: reportData.reduce((sum, p) => sum + p.refundAmount, 0),
          completedPayments: reportData.filter(p => p.status === 'completed').length,
          failedPayments: reportData.filter(p => p.status === 'failed').length
        }
      });
    } else if (format === 'csv') {
      const csv = generateCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payment-report.csv');
      return res.send(csv);
    } else if (format === 'xlsx') {
      const workbook = await generateExcel(reportData, 'Payment Report');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=payment-report.xlsx');
      return workbook.xlsx.write(res);
    }

  } catch (error) {
    console.error('Payment report error:', error);
    res.status(500).json({ message: 'Server error while generating report' });
  }
};

// Helper Functions

function generateCSV(data) {
  const parser = new Parser();
  return parser.parse(data);
}

async function generateExcel(data, sheetName) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) {
    return workbook;
  }

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return value;
    });
    worksheet.addRow(values);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const length = cell.value ? cell.value.toString().length : 10;
      maxLength = Math.max(maxLength, length);
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  return workbook;
}

function generatePDFReport(res, title, data, columns) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  // Table
  const startY = doc.y;
  const colWidth = (doc.page.width - 100) / columns.length;

  // Headers
  doc.font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col.label, 50 + i * colWidth, startY, { width: colWidth });
  });

  doc.moveTo(50, startY + 15).lineTo(doc.page.width - 50, startY + 15).stroke();

  // Data rows
  doc.font('Helvetica');
  let yPos = startY + 25;

  data.forEach((row, index) => {
    if (yPos > doc.page.height - 100) {
      doc.addPage();
      yPos = 50;
    }

    columns.forEach((col, i) => {
      let value = row[col.key];
      
      if (col.format === 'currency') {
        value = `₹${parseFloat(value).toFixed(2)}`;
      } else if (value instanceof Date) {
        value = value.toLocaleDateString();
      }

      doc.text(value || '', 50 + i * colWidth, yPos, { width: colWidth });
    });

    yPos += 20;
  });

  doc.end();
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = exports;