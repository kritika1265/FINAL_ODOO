/**
 * Role Middleware
 * Handles role-based access control (RBAC) for different user types
 */

// @desc    Authorize specific roles
// @access  Protected routes
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required to access this route' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. This route requires one of the following roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

// @desc    Admin only access
// @access  Admin routes
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      userRole: req.user.role
    });
  }

  next();
};

// @desc    Vendor only access
// @access  Vendor routes
const vendorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'vendor') {
    return res.status(403).json({ 
      message: 'Access denied. Vendor privileges required.',
      userRole: req.user.role
    });
  }

  next();
};

// @desc    Customer only access
// @access  Customer routes
const customerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({ 
      message: 'Access denied. Customer privileges required.',
      userRole: req.user.role
    });
  }

  next();
};

// @desc    Admin or Vendor access
// @access  Routes accessible by admin and vendor
const adminOrVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return res.status(403).json({ 
      message: 'Access denied. Admin or Vendor privileges required.',
      userRole: req.user.role
    });
  }

  next();
};

// @desc    Check if user can manage resource based on vendor ownership
// @access  Protected routes
const checkVendorOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Admin has access to everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Vendor can only access their own resources
      if (req.user.role === 'vendor') {
        const resourceId = req.params[paramName];
        const resource = await Model.findById(resourceId);

        if (!resource) {
          return res.status(404).json({ 
            message: 'Resource not found' 
          });
        }

        const vendorId = typeof resource.vendor === 'object' 
          ? resource.vendor.toString() 
          : resource.vendor;

        if (vendorId !== req.user.id.toString()) {
          return res.status(403).json({ 
            message: 'Not authorized to access this resource. Vendor mismatch.' 
          });
        }

        req.resource = resource;
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied. Insufficient privileges.' 
      });

    } catch (error) {
      console.error('Vendor ownership check error:', error);
      return res.status(500).json({ 
        message: 'Server error during authorization' 
      });
    }
  };
};

// @desc    Check if user can manage resource based on customer ownership
// @access  Protected routes
const checkCustomerOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Admin has access to everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Customer can only access their own resources
      if (req.user.role === 'customer') {
        const resourceId = req.params[paramName];
        const resource = await Model.findById(resourceId);

        if (!resource) {
          return res.status(404).json({ 
            message: 'Resource not found' 
          });
        }

        const customerId = typeof resource.customer === 'object' 
          ? resource.customer.toString() 
          : resource.customer;

        if (customerId !== req.user.id.toString()) {
          return res.status(403).json({ 
            message: 'Not authorized to access this resource. Customer mismatch.' 
          });
        }

        req.resource = resource;
        return next();
      }

      // Vendor might have read access to customer orders
      if (req.user.role === 'vendor') {
        const resourceId = req.params[paramName];
        const resource = await Model.findById(resourceId);

        if (!resource) {
          return res.status(404).json({ 
            message: 'Resource not found' 
          });
        }

        const vendorId = typeof resource.vendor === 'object' 
          ? resource.vendor.toString() 
          : resource.vendor;

        if (vendorId !== req.user.id.toString()) {
          return res.status(403).json({ 
            message: 'Not authorized to access this resource. Vendor mismatch.' 
          });
        }

        req.resource = resource;
        return next();
      }

      return res.status(403).json({ 
        message: 'Access denied. Insufficient privileges.' 
      });

    } catch (error) {
      console.error('Customer ownership check error:', error);
      return res.status(500).json({ 
        message: 'Server error during authorization' 
      });
    }
  };
};

// @desc    Role-based field filtering
// @access  Protected routes
const filterFieldsByRole = (allowedFields) => {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userRole = req.user.role;
    const roleFields = allowedFields[userRole] || [];

    // Filter request body to only include allowed fields
    if (req.body && Object.keys(req.body).length > 0) {
      const filteredBody = {};

      Object.keys(req.body).forEach(field => {
        if (roleFields.includes(field) || roleFields.includes('*')) {
          filteredBody[field] = req.body[field];
        }
      });

      req.body = filteredBody;
    }

    next();
  };
};

// @desc    Check permissions for specific actions
// @access  Protected routes
const checkPermission = (requiredPermission) => {
  // Define role permissions
  const rolePermissions = {
    admin: [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'products.create',
      'products.read',
      'products.update',
      'products.delete',
      'orders.create',
      'orders.read',
      'orders.update',
      'orders.delete',
      'invoices.create',
      'invoices.read',
      'invoices.update',
      'invoices.delete',
      'payments.read',
      'payments.refund',
      'reports.read',
      'settings.update'
    ],
    vendor: [
      'products.create',
      'products.read',
      'products.update',
      'products.delete',
      'orders.read',
      'orders.update',
      'invoices.create',
      'invoices.read',
      'invoices.update',
      'payments.read',
      'reports.read'
    ],
    customer: [
      'products.read',
      'orders.create',
      'orders.read',
      'invoices.read',
      'payments.create'
    ]
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const permissions = rolePermissions[userRole] || [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: `Access denied. Missing permission: ${requiredPermission}`,
        userRole,
        requiredPermission
      });
    }

    next();
  };
};

// @desc    Conditional role access based on resource state
// @access  Protected routes
const conditionalAccess = (conditions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    try {
      const userRole = req.user.role;
      const condition = conditions[userRole];

      if (!condition) {
        return res.status(403).json({ 
          message: 'Access denied for this role' 
        });
      }

      // If condition is a function, evaluate it
      if (typeof condition === 'function') {
        const allowed = await condition(req, res);
        
        if (!allowed) {
          return res.status(403).json({ 
            message: 'Access denied based on current conditions' 
          });
        }
      }

      next();

    } catch (error) {
      console.error('Conditional access error:', error);
      return res.status(500).json({ 
        message: 'Server error during authorization' 
      });
    }
  };
};

// @desc    Prevent role escalation
// @access  User update routes
const preventRoleEscalation = (req, res, next) => {
  // Only admins can change roles
  if (req.body.role && req.user.role !== 'admin') {
    delete req.body.role;
  }

  // Prevent users from making themselves admin
  if (req.body.role === 'admin' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Cannot assign admin role. Only admins can create other admins.' 
    });
  }

  next();
};

// @desc    Log role-based actions for audit
// @access  All protected routes
const auditRoleAction = (action) => {
  return (req, res, next) => {
    if (req.user) {
      const auditLog = {
        timestamp: new Date(),
        userId: req.user.id,
        userRole: req.user.role,
        action,
        method: req.method,
        path: req.path,
        ip: req.ip || req.connection.remoteAddress
      };

      // Log to console (in production, use proper logging service)
      console.log('[AUDIT]', JSON.stringify(auditLog));

      // Attach to request for further processing if needed
      req.auditLog = auditLog;
    }

    next();
  };
};

module.exports = {
  authorize,
  adminOnly,
  vendorOnly,
  customerOnly,
  adminOrVendor,
  checkVendorOwnership,
  checkCustomerOwnership,
  filterFieldsByRole,
  checkPermission,
  conditionalAccess,
  preventRoleEscalation,
  auditRoleAction
};