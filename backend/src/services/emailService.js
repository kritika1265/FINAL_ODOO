/**
 * Email Service
 * Handles all email communications for the rental system
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  async initialize() {
    try {
      // Get email configuration from environment variables
      const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };

      this.transporter = nodemailer.createTransport(config);

      // Verify connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Error initializing email service:', error);
      // Continue without email service in development
    }
  }

  /**
   * Send email with template
   * @param {String} to - Recipient email
   * @param {String} subject - Email subject
   * @param {String} templateName - Template file name
   * @param {Object} context - Template variables
   * @param {Array} attachments - Email attachments
   * @returns {Object} Send result
   */
  async sendEmail(to, subject, templateName, context = {}, attachments = []) {
    try {
      if (!this.transporter) {
        console.log('Email not sent (service not initialized):', { to, subject });
        return { success: false, message: 'Email service not initialized' };
      }

      // Compile template
      const html = await this.compileTemplate(templateName, context);

      // Send email
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME || 'Rental System'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Compile email template
   * @param {String} templateName 
   * @param {Object} context 
   * @returns {String} Compiled HTML
   */
  async compileTemplate(templateName, context) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
      
      // Check if template exists, otherwise use default
      let templateContent;
      try {
        templateContent = await fs.readFile(templatePath, 'utf-8');
      } catch (error) {
        // Use inline template if file not found
        templateContent = this.getDefaultTemplate(templateName);
      }

      const template = handlebars.compile(templateContent);
      
      // Add common context variables
      const enrichedContext = {
        ...context,
        appName: process.env.APP_NAME || 'Rental Management System',
        appUrl: process.env.APP_URL || 'http://localhost:3000',
        currentYear: new Date().getFullYear(),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@rentalapp.com'
      };

      return template(enrichedContext);
    } catch (error) {
      console.error('Error compiling template:', error);
      throw error;
    }
  }

  /**
   * Get default inline template
   * @param {String} templateName 
   * @returns {String} Template HTML
   */
  getDefaultTemplate(templateName) {
    // Simple default templates
    const templates = {
      'welcome': `
        <h1>Welcome to {{appName}}!</h1>
        <p>Hello {{userName}},</p>
        <p>Thank you for signing up. Your account has been created successfully.</p>
        <p>You can now browse and rent products from our platform.</p>
        <p>Best regards,<br>{{appName}} Team</p>
      `,
      'order-confirmation': `
        <h1>Order Confirmation</h1>
        <p>Hello {{customerName}},</p>
        <p>Your order #{{orderNumber}} has been confirmed.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Order Number: {{orderNumber}}</li>
          <li>Rental Period: {{startDate}} to {{endDate}}</li>
          <li>Total Amount: ₹{{total}}</li>
        </ul>
        <p>Thank you for your order!</p>
      `,
      'invoice': `
        <h1>Invoice {{invoiceNumber}}</h1>
        <p>Hello {{customerName}},</p>
        <p>Please find your invoice details below:</p>
        <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
        <p><strong>Amount Due:</strong> ₹{{amountDue}}</p>
        <p><strong>Due Date:</strong> {{dueDate}}</p>
        <p>Please make the payment by the due date.</p>
      `
    };

    return templates[templateName] || `
      <h1>{{subject}}</h1>
      <p>{{message}}</p>
    `;
  }

  /**
   * Send welcome email to new user
   * @param {Object} user 
   * @returns {Object} Send result
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail(
      user.email,
      'Welcome to Our Rental Platform',
      'welcome',
      {
        userName: user.name,
        userEmail: user.email
      }
    );
  }

  /**
   * Send email verification
   * @param {Object} user 
   * @param {String} verificationToken 
   * @returns {Object} Send result
   */
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    
    return this.sendEmail(
      user.email,
      'Verify Your Email Address',
      'email-verification',
      {
        userName: user.name,
        verificationUrl
      }
    );
  }

  /**
   * Send password reset email
   * @param {Object} user 
   * @param {String} resetToken 
   * @returns {Object} Send result
   */
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    return this.sendEmail(
      user.email,
      'Reset Your Password',
      'password-reset',
      {
        userName: user.name,
        resetUrl,
        expiryHours: 1
      }
    );
  }

  /**
   * Send order confirmation email
   * @param {Object} order 
   * @param {Object} customer 
   * @returns {Object} Send result
   */
  async sendOrderConfirmation(order, customer) {
    return this.sendEmail(
      customer.email,
      `Order Confirmation - ${order.orderNumber}`,
      'order-confirmation',
      {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        orderDate: moment(order.createdAt).format('DD MMM YYYY'),
        startDate: moment(order.rentalStartDate).format('DD MMM YYYY'),
        endDate: moment(order.rentalEndDate).format('DD MMM YYYY'),
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total
      }
    );
  }

  /**
   * Send pickup reminder
   * @param {Object} order 
   * @param {Object} customer 
   * @returns {Object} Send result
   */
  async sendPickupReminder(order, customer) {
    return this.sendEmail(
      customer.email,
      `Pickup Reminder - Order ${order.orderNumber}`,
      'pickup-reminder',
      {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        pickupDate: moment(order.rentalStartDate).format('DD MMM YYYY'),
        items: order.items
      }
    );
  }

  /**
   * Send return reminder
   * @param {Object} order 
   * @param {Object} customer 
   * @param {Number} daysUntilDue 
   * @returns {Object} Send result
   */
  async sendReturnReminder(order, customer, daysUntilDue) {
    return this.sendEmail(
      customer.email,
      `Return Reminder - Order ${order.orderNumber}`,
      'return-reminder',
      {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        returnDate: moment(order.rentalEndDate).format('DD MMM YYYY'),
        daysUntilDue,
        items: order.items
      }
    );
  }

  /**
   * Send overdue return notification
   * @param {Object} order 
   * @param {Object} customer 
   * @param {Number} daysOverdue 
   * @param {Number} lateFee 
   * @returns {Object} Send result
   */
  async sendOverdueNotification(order, customer, daysOverdue, lateFee) {
    return this.sendEmail(
      customer.email,
      `Overdue Return - Order ${order.orderNumber}`,
      'overdue-notification',
      {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        dueDate: moment(order.rentalEndDate).format('DD MMM YYYY'),
        daysOverdue,
        lateFee,
        items: order.items
      }
    );
  }

  /**
   * Send invoice email
   * @param {Object} invoice 
   * @param {Object} customer 
   * @param {String} pdfPath - Path to invoice PDF
   * @returns {Object} Send result
   */
  async sendInvoice(invoice, customer, pdfPath = null) {
    const attachments = [];
    
    if (pdfPath) {
      attachments.push({
        filename: `Invoice-${invoice.invoiceNumber}.pdf`,
        path: pdfPath
      });
    }

    return this.sendEmail(
      customer.email,
      `Invoice ${invoice.invoiceNumber}`,
      'invoice',
      {
        customerName: customer.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: moment(invoice.invoiceDate).format('DD MMM YYYY'),
        dueDate: moment(invoice.dueDate).format('DD MMM YYYY'),
        amountDue: invoice.amountDue,
        total: invoice.total
      },
      attachments
    );
  }

  /**
   * Send payment confirmation
   * @param {Object} payment 
   * @param {Object} invoice 
   * @param {Object} customer 
   * @returns {Object} Send result
   */
  async sendPaymentConfirmation(payment, invoice, customer) {
    return this.sendEmail(
      customer.email,
      `Payment Received - Invoice ${invoice.invoiceNumber}`,
      'payment-confirmation',
      {
        customerName: customer.name,
        invoiceNumber: invoice.invoiceNumber,
        paymentAmount: payment.amount,
        paymentDate: moment(payment.paymentDate).format('DD MMM YYYY'),
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        remainingBalance: invoice.amountDue
      }
    );
  }

  /**
   * Send payment reminder
   * @param {Object} invoice 
   * @param {Object} customer 
   * @param {Number} daysUntilDue 
   * @returns {Object} Send result
   */
  async sendPaymentReminder(invoice, customer, daysUntilDue) {
    return this.sendEmail(
      customer.email,
      `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
      'payment-reminder',
      {
        customerName: customer.name,
        invoiceNumber: invoice.invoiceNumber,
        amountDue: invoice.amountDue,
        dueDate: moment(invoice.dueDate).format('DD MMM YYYY'),
        daysUntilDue
      }
    );
  }

  /**
   * Send overdue payment notification
   * @param {Object} invoice 
   * @param {Object} customer 
   * @param {Number} daysOverdue 
   * @returns {Object} Send result
   */
  async sendOverduePaymentNotification(invoice, customer, daysOverdue) {
    return this.sendEmail(
      customer.email,
      `Overdue Payment - Invoice ${invoice.invoiceNumber}`,
      'overdue-payment',
      {
        customerName: customer.name,
        invoiceNumber: invoice.invoiceNumber,
        amountDue: invoice.amountDue,
        dueDate: moment(invoice.dueDate).format('DD MMM YYYY'),
        daysOverdue
      }
    );
  }

  /**
   * Send quotation to customer
   * @param {Object} quotation 
   * @param {Object} customer 
   * @param {String} pdfPath 
   * @returns {Object} Send result
   */
  async sendQuotation(quotation, customer, pdfPath = null) {
    const attachments = [];
    
    if (pdfPath) {
      attachments.push({
        filename: `Quotation-${quotation.quotationNumber}.pdf`,
        path: pdfPath
      });
    }

    return this.sendEmail(
      customer.email,
      `Quotation ${quotation.quotationNumber}`,
      'quotation',
      {
        customerName: customer.name,
        quotationNumber: quotation.quotationNumber,
        validUntil: moment(quotation.validUntil).format('DD MMM YYYY'),
        items: quotation.items,
        total: quotation.total
      },
      attachments
    );
  }

  /**
   * Send bulk email (for notifications, newsletters, etc.)
   * @param {Array} recipients - Array of email addresses
   * @param {String} subject 
   * @param {String} templateName 
   * @param {Object} context 
   * @returns {Object} Send results
   */
  async sendBulkEmail(recipients, subject, templateName, context) {
    try {
      const results = [];
      
      for (const email of recipients) {
        try {
          const result = await this.sendEmail(email, subject, templateName, context);
          results.push({
            email,
            success: true,
            messageId: result.messageId
          });
        } catch (error) {
          results.push({
            email,
            success: false,
            error: error.message
          });
        }
      }

      return {
        total: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  }

  /**
   * Send notification to admin/vendor
   * @param {String} to 
   * @param {String} subject 
   * @param {String} message 
   * @returns {Object} Send result
   */
  async sendAdminNotification(to, subject, message) {
    return this.sendEmail(
      to,
      subject,
      'admin-notification',
      {
        subject,
        message,
        timestamp: moment().format('DD MMM YYYY HH:mm')
      }
    );
  }

  /**
   * Send low stock alert to vendor
   * @param {Object} vendor 
   * @param {Array} products 
   * @returns {Object} Send result
   */
  async sendLowStockAlert(vendor, products) {
    return this.sendEmail(
      vendor.email,
      'Low Stock Alert',
      'low-stock-alert',
      {
        vendorName: vendor.name,
        products: products.map(p => ({
          name: p.name,
          currentStock: p.quantityOnHand,
          threshold: p.lowStockThreshold || 5
        }))
      }
    );
  }
}

module.exports = new EmailService();