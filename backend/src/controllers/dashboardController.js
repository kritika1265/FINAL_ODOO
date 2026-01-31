const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');

/**
 * Dashboard Controller
 * Provides analytics, metrics, and dashboard data for different user roles
 */

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    let dashboardData;

    if (req.user.role === 'admin') {
      dashboardData = await getAdminDashboard();
    } else if (req.user.role === 'vendor') {
      dashboardData = await getVendorDashboard(req.user.id);
    } else if (req.user.role === 'customer') {
      dashboardData = await getCustomerDashboard(req.user.id);
    }

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/dashboard/revenue
// @access  Private (Vendor/Admin)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'monthly' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = {};
    if (Object.keys(dateFilter).length > 0) {
      filter.paidDate = dateFilter;
    }

    // Role-based filtering
    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    filter.status = 'paid';

    const invoices = await Invoice.find(filter);

    // Group by period
    const revenueByPeriod = {};
    
    invoices.forEach(invoice => {
      let periodKey;
      const date = invoice.paidDate || invoice.invoiceDate;

      if (period === 'daily') {
        periodKey = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekNumber = getWeekNumber(date);
        periodKey = `${date.getFullYear()}-W${weekNumber}`;
      } else if (period === 'monthly') {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        periodKey = date.getFullYear().toString();
      }

      if (!revenueByPeriod[periodKey]) {
        revenueByPeriod[periodKey] = {
          period: periodKey,
          revenue: 0,
          count: 0
        };
      }

      revenueByPeriod[periodKey].revenue += invoice.total;
      revenueByPeriod[periodKey].count += 1;
    });

    const revenueData = Object.values(revenueByPeriod).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalInvoices: invoices.length,
        averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
        revenueByPeriod: revenueData
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get product performance
// @route   GET /api/dashboard/products
// @access  Private (Vendor/Admin)
exports.getProductPerformance = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'revenue' } = req.query;

    const filter = {};
    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    const orders = await Order.find({
      ...filter,
      status: { $in: ['with_customer', 'returned'] }
    }).populate('items.product', 'name sku');

    const productStats = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        
        if (!productStats[productId]) {
          productStats[productId] = {
            product: {
              id: productId,
              name: item.product.name,
              sku: item.product.sku
            },
            totalRevenue: 0,
            totalRentals: 0,
            totalQuantityRented: 0,
            averageRentalDuration: 0,
            totalDurationDays: 0
          };
        }

        productStats[productId].totalRevenue += item.lineTotal;
        productStats[productId].totalRentals += 1;
        productStats[productId].totalQuantityRented += item.quantity;

        const durationMs = item.rentalEndDate - item.rentalStartDate;
        const durationDays = durationMs / (1000 * 60 * 60 * 24);
        productStats[productId].totalDurationDays += durationDays;
      });
    });

    // Calculate averages
    Object.values(productStats).forEach(stats => {
      stats.averageRentalDuration = stats.totalDurationDays / stats.totalRentals;
      stats.averageRevenue = stats.totalRevenue / stats.totalRentals;
    });

    let sortedProducts = Object.values(productStats);

    // Sort based on criteria
    if (sortBy === 'revenue') {
      sortedProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sortBy === 'rentals') {
      sortedProducts.sort((a, b) => b.totalRentals - a.totalRentals);
    } else if (sortBy === 'quantity') {
      sortedProducts.sort((a, b) => b.totalQuantityRented - a.totalQuantityRented);
    }

    const topProducts = sortedProducts.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topProducts
    });

  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order trends
// @route   GET /api/dashboard/orders/trends
// @access  Private (Vendor/Admin)
exports.getOrderTrends = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = {};
    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }

    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    const orders = await Order.find(filter);

    const trendsByPeriod = {};
    const statusCount = {
      draft: 0,
      confirmed: 0,
      pickup_ready: 0,
      with_customer: 0,
      returned: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      let periodKey;
      const date = order.createdAt;

      if (period === 'daily') {
        periodKey = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekNumber = getWeekNumber(date);
        periodKey = `${date.getFullYear()}-W${weekNumber}`;
      } else if (period === 'monthly') {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!trendsByPeriod[periodKey]) {
        trendsByPeriod[periodKey] = {
          period: periodKey,
          count: 0,
          revenue: 0
        };
      }

      trendsByPeriod[periodKey].count += 1;
      trendsByPeriod[periodKey].revenue += order.total;

      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    const trendsData = Object.values(trendsByPeriod).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        trends: trendsData,
        statusDistribution: statusCount
      }
    });

  } catch (error) {
    console.error('Order trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get customer insights
// @route   GET /api/dashboard/customers
// @access  Private (Vendor/Admin)
exports.getCustomerInsights = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const filter = {};
    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email companyName');

    const customerStats = {};

    orders.forEach(order => {
      const customerId = order.customer._id.toString();

      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          customer: {
            id: customerId,
            name: order.customer.name,
            email: order.customer.email,
            companyName: order.customer.companyName
          },
          totalOrders: 0,
          totalRevenue: 0,
          activeOrders: 0,
          completedOrders: 0
        };
      }

      customerStats[customerId].totalOrders += 1;
      customerStats[customerId].totalRevenue += order.total;

      if (order.status === 'with_customer') {
        customerStats[customerId].activeOrders += 1;
      } else if (order.status === 'returned') {
        customerStats[customerId].completedOrders += 1;
      }
    });

    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topCustomers
    });

  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get inventory status
// @route   GET /api/dashboard/inventory
// @access  Private (Vendor/Admin)
exports.getInventoryStatus = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'vendor') {
      filter.vendor = req.user.id;
    }

    const products = await Product.find(filter);

    // Get currently rented quantities
    const activeOrders = await Order.find({
      ...filter,
      status: { $in: ['confirmed', 'pickup_ready', 'with_customer'] }
    });

    const rentedQuantities = {};
    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        rentedQuantities[productId] = (rentedQuantities[productId] || 0) + item.quantity;
      });
    });

    const inventoryStatus = products.map(product => ({
      product: {
        id: product._id,
        name: product.name,
        sku: product.sku
      },
      totalStock: product.quantityOnHand,
      rentedQuantity: rentedQuantities[product._id.toString()] || 0,
      availableQuantity: product.quantityOnHand - (rentedQuantities[product._id.toString()] || 0),
      utilizationRate: product.quantityOnHand > 0 
        ? ((rentedQuantities[product._id.toString()] || 0) / product.quantityOnHand * 100).toFixed(2)
        : 0
    }));

    const lowStockProducts = inventoryStatus.filter(item => item.availableQuantity < 2);

    res.json({
      success: true,
      data: {
        totalProducts: products.length,
        totalStock: inventoryStatus.reduce((sum, item) => sum + item.totalStock, 0),
        totalRented: inventoryStatus.reduce((sum, item) => sum + item.rentedQuantity, 0),
        totalAvailable: inventoryStatus.reduce((sum, item) => sum + item.availableQuantity, 0),
        lowStockProducts,
        inventory: inventoryStatus
      }
    });

  } catch (error) {
    console.error('Inventory status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper Functions

async function getAdminDashboard() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalVendors,
    totalCustomers,
    totalProducts,
    totalOrders,
    activeOrders,
    totalRevenue,
    recentRevenue
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'vendor' }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['with_customer'] } }),
    Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Invoice.aggregate([
      { 
        $match: { 
          status: 'paid',
          paidDate: { $gte: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
  ]);

  return {
    users: {
      total: totalUsers,
      vendors: totalVendors,
      customers: totalCustomers
    },
    products: {
      total: totalProducts
    },
    orders: {
      total: totalOrders,
      active: activeOrders
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      last30Days: recentRevenue[0]?.total || 0
    }
  };
}

async function getVendorDashboard(vendorId) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    totalOrders,
    activeOrders,
    completedOrders,
    totalRevenue,
    recentRevenue,
    pendingPayments
  ] = await Promise.all([
    Product.countDocuments({ vendor: vendorId }),
    Order.countDocuments({ vendor: vendorId }),
    Order.countDocuments({ vendor: vendorId, status: 'with_customer' }),
    Order.countDocuments({ vendor: vendorId, status: 'returned' }),
    Invoice.aggregate([
      { $match: { vendor: vendorId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Invoice.aggregate([
      { 
        $match: { 
          vendor: vendorId,
          status: 'paid',
          paidDate: { $gte: thirtyDaysAgo }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Invoice.aggregate([
      { 
        $match: { 
          vendor: vendorId,
          status: { $in: ['draft', 'sent', 'partial'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$balanceDue' } } }
    ])
  ]);

  return {
    products: {
      total: totalProducts
    },
    orders: {
      total: totalOrders,
      active: activeOrders,
      completed: completedOrders
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      last30Days: recentRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0
    }
  };
}

async function getCustomerDashboard(customerId) {
  const [
    totalOrders,
    activeOrders,
    completedOrders,
    totalSpent,
    pendingPayments
  ] = await Promise.all([
    Order.countDocuments({ customer: customerId }),
    Order.countDocuments({ customer: customerId, status: 'with_customer' }),
    Order.countDocuments({ customer: customerId, status: 'returned' }),
    Invoice.aggregate([
      { $match: { customer: customerId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Invoice.aggregate([
      { 
        $match: { 
          customer: customerId,
          status: { $in: ['draft', 'sent', 'partial'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$balanceDue' } } }
    ])
  ]);

  return {
    orders: {
      total: totalOrders,
      active: activeOrders,
      completed: completedOrders
    },
    spending: {
      total: totalSpent[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0
    }
  };
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = exports;