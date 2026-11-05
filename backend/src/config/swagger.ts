const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const success = (data: object) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data,
  },
});

const paginated = (item: object) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: { type: 'array', items: item },
    meta: ref('PaginationMeta'),
  },
});

const json = (schema: object, description = 'OK') => ({
  description,
  content: { 'application/json': { schema } },
});

const error = (description: string) => json(ref('ErrorResponse'), description);

const body = (schema: object, description = 'Request body') => ({
  required: true,
  description,
  content: { 'application/json': { schema } },
});

const bearer = [{ bearerAuth: [] }];

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
};

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'PasokTani Backend API',
    version: '1.0.0',
    description:
      'REST API PasokTani untuk menghubungkan petani dengan pembeli. Seluruh response menggunakan format JSON.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'System' },
    { name: 'Auth' },
    { name: 'Categories' },
    { name: 'Products' },
    { name: 'Orders' },
    { name: 'Dashboard' },
    { name: 'Reviews' },
    { name: 'Upload' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 100 },
          pages: { type: 'integer', example: 10 },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          fullName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'FARMER', 'BUYER'] },
          status: { type: 'string', enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'] },
          fotoProfile: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          bio: { type: 'string', nullable: true },
          village: { type: 'string', nullable: true },
          farmingExperience: { type: 'string', nullable: true },
          farmArea: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: ref('UserProfile'),
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          icon: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          commodity_count: { type: 'string', description: 'Hanya tersedia pada endpoint count' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          farmer_id: { type: 'integer' },
          category_id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          price: { type: 'string' },
          min_price: { type: 'string', nullable: true },
          max_price: { type: 'string', nullable: true },
          fixed_price: { type: 'string', nullable: true },
          stock: { type: 'string' },
          unit: { type: 'string' },
          quality: { type: 'string' },
          location: { type: 'string' },
          is_published: { type: 'boolean' },
          status: { type: 'string', enum: ['PENDING', 'VERIFIED', 'REJECTED', 'AVAILABLE', 'SOLD_OUT'] },
          min_weight_for_nego: { type: 'string', nullable: true },
          harvest_estimate: { type: 'string', format: 'date-time', nullable: true },
          image: { type: 'string', nullable: true },
          images: { type: 'array', items: {} },
          video_url: { type: 'string', nullable: true },
          rating: { type: 'string' },
          review_count: { type: 'integer' },
          rejected_reason: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          category_name: { type: 'string' },
          farmer_name: { type: 'string', description: 'Hanya tersedia pada detail produk' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          order_code: { type: 'string' },
          buyer_id: { type: 'integer' },
          farmer_id: { type: 'integer' },
          commodity_id: { type: 'integer' },
          quantity: { type: 'string' },
          unit_price: { type: 'string' },
          subtotal: { type: 'string' },
          service_fee: { type: 'string' },
          delivery_fee: { type: 'string' },
          total_price: { type: 'string' },
          delivery_method: { type: 'string', enum: ['PICKUP', 'EXPEDITION'] },
          delivery_address: { type: 'string', nullable: true },
          recipient_name: { type: 'string', nullable: true },
          recipient_phone: { type: 'string', nullable: true },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
          },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          commodity_name: { type: 'string' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          order_id: { type: 'integer' },
          buyer_id: { type: 'integer' },
          farmer_id: { type: 'integer' },
          commodity_id: { type: 'integer' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          buyer_name: { type: 'string' },
        },
      },
      UploadResult: {
        type: 'object',
        properties: {
          publicId: { type: 'string' },
          secureUrl: { type: 'string', format: 'uri' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Welcome endpoint',
        responses: {
          200: json({
            type: 'object',
            properties: {
              message: { type: 'string' },
              version: { type: 'string' },
              documentation: { type: 'string' },
              endpoints: { type: 'array', items: { type: 'string' } },
            },
          }),
        },
      },
    },
    '/api-docs': {
      get: {
        tags: ['System'],
        summary: 'Swagger UI',
        responses: { 200: { description: 'Swagger UI HTML page' } },
      },
    },
    '/api-docs/openapi.json': {
      get: {
        tags: ['System'],
        summary: 'OpenAPI specification',
        responses: { 200: json({ type: 'object' }) },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          200: json({
            type: 'object',
            properties: { success: { type: 'boolean' }, message: { type: 'string' } },
          }),
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
        requestBody: body({
          type: 'object',
          required: ['username', 'fullName', 'email', 'password', 'phone'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 100 },
            fullName: { type: 'string', minLength: 1, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            phone: { type: 'string', maxLength: 20 },
            role: { type: 'string', enum: ['FARMER', 'BUYER'], default: 'BUYER' },
          },
        }),
        responses: {
          201: json(success(ref('UserProfile')), 'User registered'),
          400: error('Validation error or email already registered'),
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: body({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        }),
        responses: {
          200: json(success(ref('AuthResponse')), 'Login successful'),
          401: error('Invalid email or password'),
          403: error('Account is suspended'),
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: bearer,
        responses: {
          200: json(success(ref('UserProfile'))),
          400: error('Failed to get user profile'),
          401: error('Unauthorized'),
          404: error('User not found'),
        },
      },
    },
    '/api/v1/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get all categories',
        responses: {
          200: json(success({ type: 'array', items: ref('Category') })),
          400: error('Failed to retrieve categories'),
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        security: bearer,
        requestBody: body({
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
          },
        }),
        responses: {
          201: json(success(ref('Category')), 'Category created'),
          400: error('Failed to create category'),
          401: error('Unauthorized'),
          403: error('Forbidden, ADMIN only'),
        },
      },
    },
    '/api/v1/categories/count': {
      get: {
        tags: ['Categories'],
        summary: 'Get categories with published commodity count',
        responses: {
          200: json(success({ type: 'array', items: ref('Category') })),
          400: error('Failed to retrieve categories with count'),
        },
      },
    },
    '/api/v1/categories/{id}': {
      patch: {
        tags: ['Categories'],
        summary: 'Update category',
        security: bearer,
        parameters: [idParam],
        requestBody: body({
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
          },
        }),
        responses: {
          200: json(success(ref('Category')), 'Category updated'),
          400: error('Failed to update category'),
          401: error('Unauthorized'),
          403: error('Forbidden, ADMIN only'),
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category',
        security: bearer,
        parameters: [idParam],
        responses: {
          200: json(success({ type: 'object', nullable: true }), 'Category deleted'),
          400: error('Failed to delete category'),
          401: error('Unauthorized'),
          403: error('Forbidden, ADMIN only'),
        },
      },
    },
    '/api/v1/products': {
      get: {
        tags: ['Products'],
        summary: 'Get published products',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: json(paginated(ref('Product'))),
          400: error('Failed to retrieve products'),
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        security: bearer,
        requestBody: body({
          type: 'object',
          required: ['name', 'categoryId', 'price', 'stock', 'location'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 150 },
            description: { type: 'string' },
            categoryId: { type: 'integer' },
            price: { type: 'number' },
            stock: { type: 'number' },
            unit: { type: 'string', default: 'kg' },
            quality: { type: 'string', default: 'A' },
            location: { type: 'string', minLength: 1, maxLength: 150 },
            minPrice: { type: 'number' },
            maxPrice: { type: 'number' },
            fixedPrice: { type: 'number' },
            minWeightForNego: { type: 'number' },
            harvestEstimate: { type: 'string', format: 'date-time' },
          },
        }),
        responses: {
          201: json(success(ref('Product')), 'Commodity created'),
          400: error('Validation error or failed to create commodity'),
          401: error('Unauthorized'),
          403: error('Forbidden, FARMER only'),
        },
      },
    },
    '/api/v1/products/me/products': {
      get: {
        tags: ['Products'],
        summary: "Get the authenticated farmer's products",
        security: bearer,
        responses: {
          200: json(success({ type: 'array', items: ref('Product') })),
          400: error('Failed to retrieve your commodities'),
          401: error('Unauthorized'),
          403: error('Forbidden, FARMER only'),
        },
      },
    },
    '/api/v1/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product detail',
        parameters: [idParam],
        responses: {
          200: json(success(ref('Product'))),
          400: error('Failed to retrieve product'),
          404: error('Commodity not found'),
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product',
        security: bearer,
        parameters: [idParam],
        requestBody: body({
          type: 'object',
          required: ['name', 'price', 'stock', 'quality', 'location'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            quality: { type: 'string' },
            location: { type: 'string' },
          },
        }),
        responses: {
          200: json(success(ref('Product'))),
          400: error('Failed to update commodity'),
          401: error('Unauthorized'),
          403: error('Unauthorized, not the owner'),
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        security: bearer,
        parameters: [idParam],
        responses: {
          200: json(success({ type: 'object', nullable: true }), 'Commodity deleted'),
          400: error('Failed to delete commodity'),
          401: error('Unauthorized'),
          403: error('Unauthorized, not the owner'),
        },
      },
    },
    '/api/v1/products/{id}/stock': {
      patch: {
        tags: ['Products'],
        summary: 'Update product stock',
        security: bearer,
        parameters: [idParam],
        requestBody: body({
          type: 'object',
          required: ['stock'],
          properties: { stock: { type: 'number' } },
        }),
        responses: {
          200: json(success(ref('Product'))),
          400: error('Failed to update stock'),
          401: error('Unauthorized'),
          403: error('Unauthorized, not the owner'),
        },
      },
    },
    '/api/v1/products/{id}/publish': {
      patch: {
        tags: ['Products'],
        summary: 'Toggle product publication status',
        security: bearer,
        parameters: [idParam],
        responses: {
          200: json(success(ref('Product'))),
          400: error('Failed to toggle publication status'),
          401: error('Unauthorized'),
          403: error('Unauthorized, not the owner'),
        },
      },
    },
    '/api/v1/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        security: bearer,
        requestBody: body({
          type: 'object',
          required: ['commodityId', 'quantity', 'paymentMethod'],
          properties: {
            commodityId: { type: 'integer' },
            quantity: { type: 'number' },
            deliveryMethod: { type: 'string', enum: ['PICKUP', 'EXPEDITION'], default: 'PICKUP' },
            paymentMethod: {
              type: 'string',
              enum: ['BANK_TRANSFER', 'VIRTUAL_ACCOUNT', 'EWALLET', 'QRIS', 'COD'],
            },
          },
        }),
        responses: {
          201: json(success(ref('Order')), 'Order created'),
          400: error('Commodity not available, insufficient stock, or failed to create order'),
          401: error('Unauthorized'),
          404: error('Commodity not found'),
        },
      },
    },
    '/api/v1/orders/me': {
      get: {
        tags: ['Orders'],
        summary: "Get the authenticated user's orders",
        security: bearer,
        responses: {
          200: json(success({ type: 'array', items: ref('Order') })),
          400: error('Failed to retrieve orders'),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order detail',
        security: bearer,
        parameters: [idParam],
        responses: {
          200: json(success(ref('Order'))),
          400: error('Failed to retrieve order'),
          401: error('Unauthorized'),
          404: error('Order not found'),
        },
      },
    },
    '/api/v1/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status',
        security: bearer,
        parameters: [idParam],
        requestBody: body({
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
            },
          },
        }),
        responses: {
          200: json(success(ref('Order'))),
          400: error('Failed to update order status'),
          401: error('Unauthorized'),
          403: error('Unauthorized, not the buyer or farmer'),
          404: error('Order not found'),
        },
      },
    },
    '/api/v1/dashboard/farmer': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get farmer dashboard stats',
        security: bearer,
        responses: {
          200: json(
            success({
              type: 'object',
              properties: {
                stats: {
                  type: 'object',
                  properties: {
                    totalProducts: { type: 'integer' },
                    activeProducts: { type: 'integer' },
                    totalOrders: { type: 'integer' },
                    totalRevenue: { type: 'number' },
                  },
                },
              },
            })
          ),
          400: error('Failed to retrieve farmer stats'),
          401: error('Unauthorized'),
          403: error('Forbidden, FARMER only'),
        },
      },
    },
    '/api/v1/dashboard/admin': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get admin dashboard stats',
        security: bearer,
        responses: {
          200: json(
            success({
              type: 'object',
              properties: {
                totalUsers: { type: 'integer' },
                totalFarmers: { type: 'integer' },
                totalOrders: { type: 'integer' },
              },
            })
          ),
          400: error('Failed to retrieve admin stats'),
          401: error('Unauthorized'),
          403: error('Forbidden, ADMIN only'),
        },
      },
    },
    '/api/v1/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Create review for a completed order',
        security: bearer,
        requestBody: body({
          type: 'object',
          required: ['orderId', 'rating'],
          properties: {
            orderId: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
          },
        }),
        responses: {
          201: json(success(ref('Review')), 'Review created'),
          400: error('Order not completed, review already exists, or failed to create review'),
          401: error('Unauthorized'),
          404: error('Order not found or unauthorized'),
        },
      },
    },
    '/api/v1/reviews/farmer/{farmerId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get reviews for a farmer',
        parameters: [{ name: 'farmerId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: json(success({ type: 'array', items: ref('Review') })),
          400: error('Failed to retrieve farmer reviews'),
        },
      },
    },
    '/api/v1/reviews/commodity/{commodityId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get reviews for a commodity',
        parameters: [{ name: 'commodityId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: json(success({ type: 'array', items: ref('Review') })),
          400: error('Failed to retrieve commodity reviews'),
        },
      },
    },
    '/api/v1/upload/image': {
      post: {
        tags: ['Upload'],
        summary: 'Upload an image to Cloudinary',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          201: json(success(ref('UploadResult')), 'Image uploaded successfully'),
          400: error('No file provided, invalid image type, file too large, or upload failed'),
          401: error('Unauthorized'),
        },
      },
    },
    '/api/v1/upload/image/{publicId}': {
      delete: {
        tags: ['Upload'],
        summary: 'Delete an image from Cloudinary',
        security: bearer,
        parameters: [{ name: 'publicId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: json(success({ type: 'object', nullable: true }), 'Image deleted successfully'),
          400: error('Public ID is required or delete failed'),
          401: error('Unauthorized'),
        },
      },
    },
  },
};

export const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PasokTani API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body { margin: 0; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api-docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`;
