/**
 * Product Routes
 * Handles rental product management, variants, and attributes
 */

const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import product controller (to be implemented)
// const productController = require('../controllers/product.controller');

// Import middleware
// const { authenticate, authorize } = require('../middleware/auth.middleware');
// const { upload } = require('../middleware/upload.middleware');

/**
 * @route   GET /api/products
 * @desc    Get all products with filters and pagination
 * @access  Public (for website), Private (for admin/vendor)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('rentable').optional().isBoolean(),
    query('published').optional().isBoolean(),
    query('vendorId').optional().isMongoId(),
    query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'popularity']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const result = await productController.getProducts(req.query);

      res.status(200).json({
        success: true,
        data: {
          // products: result.products,
          // pagination: result.pagination,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch products',
      });
    }
  }
);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const product = await productController.getProductById(req.params.id);

      res.status(200).json({
        success: true,
        data: {
          // product,
        },
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || 'Product not found',
      });
    }
  }
);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').optional().trim(),
    body('isRentable').isBoolean().withMessage('Rentable flag is required'),
    body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be positive'),
    body('salesPrice').isFloat({ min: 0 }).withMessage('Sales price must be positive'),
    body('quantityOnHand').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
    body('category').optional().trim(),
    body('rentalPricing').optional().isObject(),
    body('rentalPricing.hourly').optional().isFloat({ min: 0 }),
    body('rentalPricing.daily').optional().isFloat({ min: 0 }),
    body('rentalPricing.weekly').optional().isFloat({ min: 0 }),
    body('rentalPricing.custom').optional().isArray(),
    body('attributes').optional().isArray(),
    body('variants').optional().isArray(),
    body('images').optional().isArray(),
    body('isPublished').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const product = await productController.createProduct(req.body, req.user);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          // product,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product',
      });
    }
  }
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Admin/Vendor - own products)
 */
router.put(
  '/:id',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('isRentable').optional().isBoolean(),
    body('costPrice').optional().isFloat({ min: 0 }),
    body('salesPrice').optional().isFloat({ min: 0 }),
    body('quantityOnHand').optional().isInt({ min: 0 }),
    body('category').optional().trim(),
    body('rentalPricing').optional().isObject(),
    body('attributes').optional().isArray(),
    body('variants').optional().isArray(),
    body('images').optional().isArray(),
    body('isPublished').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const product = await productController.updateProduct(req.params.id, req.body, req.user);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: {
          // product,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update product',
      });
    }
  }
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (Admin/Vendor - own products)
 */
router.delete(
  '/:id',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // await productController.deleteProduct(req.params.id, req.user);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete product',
      });
    }
  }
);

/**
 * @route   POST /api/products/:id/upload-images
 * @desc    Upload product images
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/:id/upload-images',
  /* authenticate, authorize(['admin', 'vendor']), upload.array('images', 5), */
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const product = await productController.uploadImages(req.params.id, req.files, req.user);

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          // product,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload images',
      });
    }
  }
);

/**
 * @route   DELETE /api/products/:id/images/:imageId
 * @desc    Delete product image
 * @access  Private (Admin/Vendor)
 */
router.delete(
  '/:id/images/:imageId',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    param('imageId').notEmpty().withMessage('Image ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // await productController.deleteImage(req.params.id, req.params.imageId, req.user);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete image',
      });
    }
  }
);

/**
 * @route   GET /api/products/:id/availability
 * @desc    Check product availability for rental period
 * @access  Public
 */
router.get(
  '/:id/availability',
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    query('startDate').isISO8601().withMessage('Valid start date is required'),
    query('endDate').isISO8601().withMessage('Valid end date is required'),
    query('variantId').optional().isMongoId(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const availability = await productController.checkAvailability(
      //   req.params.id,
      //   req.query
      // );

      res.status(200).json({
        success: true,
        data: {
          // availability,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check availability',
      });
    }
  }
);

/**
 * @route   GET /api/products/:id/variants
 * @desc    Get product variants
 * @access  Public
 */
router.get(
  '/:id/variants',
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const variants = await productController.getVariants(req.params.id);

      res.status(200).json({
        success: true,
        data: {
          // variants,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch variants',
      });
    }
  }
);

/**
 * @route   POST /api/products/:id/variants
 * @desc    Add product variant
 * @access  Private (Admin/Vendor)
 */
router.post(
  '/:id/variants',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('attributes').isObject().withMessage('Variant attributes are required'),
    body('sku').optional().trim(),
    body('additionalPrice').optional().isFloat({ min: 0 }),
    body('quantityOnHand').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const variant = await productController.addVariant(req.params.id, req.body, req.user);

      res.status(201).json({
        success: true,
        message: 'Variant added successfully',
        data: {
          // variant,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add variant',
      });
    }
  }
);

/**
 * @route   PUT /api/products/:id/publish
 * @desc    Publish/unpublish product on website
 * @access  Private (Admin/Vendor)
 */
router.put(
  '/:id/publish',
  /* authenticate, authorize(['admin', 'vendor']), */
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('isPublished').isBoolean().withMessage('Publish status is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Call controller method
      // const product = await productController.togglePublish(
      //   req.params.id,
      //   req.body.isPublished,
      //   req.user
      // );

      res.status(200).json({
        success: true,
        message: `Product ${req.body.isPublished ? 'published' : 'unpublished'} successfully`,
        data: {
          // product,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update publish status',
      });
    }
  }
);

/**
 * @route   GET /api/products/categories/list
 * @desc    Get all product categories
 * @access  Public
 */
router.get('/categories/list', async (req, res) => {
  try {
    // Call controller method
    // const categories = await productController.getCategories();

    res.status(200).json({
      success: true,
      data: {
        // categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
});

module.exports = router;