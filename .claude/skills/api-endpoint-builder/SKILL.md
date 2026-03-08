---
name: API Endpoint Builder
description: Create Express.js REST endpoints with authentication and validation
keywords: api, express, endpoint, rest, node
---

# API Endpoint Builder

Create secure, validated Express.js REST API endpoints following BEARS project patterns.

## Purpose

This skill provides templates for building RESTful API endpoints with proper authentication, validation, error handling, and database interactions.

## Complete REST Endpoint Pattern

### Routes File

```javascript
// routes/news.js
import express from 'express';
import * as controller from '../controllers/newsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, newsSchema, idSchema } from '../middleware/validate.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', controller.listNews);
router.get('/archives', controller.listNewsArchives);
router.get('/:id', validate(idSchema, 'params'), controller.getNewsById);

// Protected routes (admin only)
router.post('/', authenticate, validate(newsSchema), controller.createNews);
router.put('/:id', authenticate, validate(idSchema, 'params'), validate(newsSchema), controller.updateNews);
router.delete('/:id', authenticate, validate(idSchema, 'params'), controller.deleteNews);

export default router;
```

### Controller File

```javascript
// controllers/newsController.js
import { query } from '../utils/database.js';
import logger from '../utils/logger.js';

/**
 * List recent news (last 60 days)
 * GET /api/news
 */
export async function listNews(req, res, next) {
  try {
    const news = await query(`
      SELECT *
      FROM news
      WHERE date >= DATE_SUB(NOW(), INTERVAL 60 DAY)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      count: news.length,
      data: news
    });
  } catch (error) {
    logger.error('Error fetching news:', error);
    next(error); // Pass to error handler
  }
}

/**
 * List news archives (older than 60 days)
 * GET /api/news/archives
 */
export async function listNewsArchives(req, res, next) {
  try {
    const archives = await query(`
      SELECT *
      FROM news
      WHERE date < DATE_SUB(NOW(), INTERVAL 60 DAY)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      count: archives.length,
      data: archives
    });
  } catch (error) {
    logger.error('Error fetching archives:', error);
    next(error);
  }
}

/**
 * Get single news item by ID
 * GET /api/news/:id
 */
export async function getNewsById(req, res, next) {
  try {
    const { id } = req.params;

    const news = await query(
      'SELECT * FROM news WHERE id_numb = ?',
      [id]
    );

    if (news.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'News item not found'
      });
    }

    // Fetch related images
    const images = await query(
      'SELECT * FROM images WHERE news_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...news[0],
        images
      }
    });
  } catch (error) {
    logger.error('Error fetching news by ID:', error);
    next(error);
  }
}

/**
 * Create new news item (admin only)
 * POST /api/news
 */
export async function createNews(req, res, next) {
  try {
    const { title, description, image } = req.body;

    const result = await query(
      'INSERT INTO news (title, description, image, date) VALUES (?, ?, ?, NOW())',
      [title, description, image || '']
    );

    logger.info(`News created: ID ${result.insertId} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: {
        id: result.insertId,
        title,
        description,
        image
      }
    });
  } catch (error) {
    logger.error('Error creating news:', error);
    next(error);
  }
}

/**
 * Update news item (admin only)
 * PUT /api/news/:id
 */
export async function updateNews(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;

    // Check if news exists
    const existing = await query(
      'SELECT * FROM news WHERE id_numb = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'News item not found'
      });
    }

    // Update news
    await query(
      'UPDATE news SET title = ?, description = ?, image = ? WHERE id_numb = ?',
      [title, description, image || '', id]
    );

    logger.info(`News updated: ID ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'News updated successfully',
      data: {
        id,
        title,
        description,
        image
      }
    });
  } catch (error) {
    logger.error('Error updating news:', error);
    next(error);
  }
}

/**
 * Delete news item (admin only)
 * DELETE /api/news/:id
 */
export async function deleteNews(req, res, next) {
  try {
    const { id } = req.params;

    // Check if news exists
    const existing = await query(
      'SELECT * FROM news WHERE id_numb = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'News item not found'
      });
    }

    // Delete related images first (if cascade not set)
    await query('DELETE FROM images WHERE news_id = ?', [id]);

    // Delete news
    await query('DELETE FROM news WHERE id_numb = ?', [id]);

    logger.info(`News deleted: ID ${id} by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting news:', error);
    next(error);
  }
}
```

### Register Routes in Server

```javascript
// index.js
import newsRoutes from './routes/news.js';

app.use('/api/news', newsRoutes);
```

## Endpoint Patterns by HTTP Method

### GET - Fetch Data

```javascript
// List all (with optional filtering)
export async function listResources(req, res, next) {
  try {
    const { status, type } = req.query; // Query parameters

    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    const resources = await query(sql, params);

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
}

// Get single item
export async function getResourceById(req, res, next) {
  try {
    const { id } = req.params;

    const resources = await query(
      'SELECT * FROM resources WHERE id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: resources[0]
    });
  } catch (error) {
    next(error);
  }
}
```

### POST - Create Resource

```javascript
export async function createResource(req, res, next) {
  try {
    const { title, description, type } = req.body;

    const result = await query(
      'INSERT INTO resources (title, description, type, created_at) VALUES (?, ?, ?, NOW())',
      [title, description, type]
    );

    logger.info(`Resource created: ID ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: {
        id: result.insertId,
        title,
        description,
        type
      }
    });
  } catch (error) {
    next(error);
  }
}
```

### PUT - Update Resource

```javascript
export async function updateResource(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body;

    // Check existence
    const existing = await query(
      'SELECT * FROM resources WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Update
    await query(
      'UPDATE resources SET title = ?, description = ?, type = ?, updated_at = NOW() WHERE id = ?',
      [title, description, type, id]
    );

    logger.info(`Resource updated: ID ${id}`);

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: { id, title, description, type }
    });
  } catch (error) {
    next(error);
  }
}
```

### DELETE - Delete Resource

```javascript
export async function deleteResource(req, res, next) {
  try {
    const { id } = req.params;

    // Check existence
    const existing = await query(
      'SELECT * FROM resources WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }

    // Delete
    await query('DELETE FROM resources WHERE id = ?', [id]);

    logger.info(`Resource deleted: ID ${id}`);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
```

## Authentication Patterns

### Public Endpoint (No Auth)

```javascript
// No middleware needed
router.get('/public', controller.publicEndpoint);
```

### Protected Endpoint (Any Logged-In User)

```javascript
import { authenticate } from '../middleware/authenticate.js';

router.get('/protected', authenticate, controller.protectedEndpoint);
```

### Admin-Only Endpoint

```javascript
import { authenticate } from '../middleware/authenticate.js';

// In controller, check user role
export async function adminOnlyEndpoint(req, res, next) {
  try {
    // req.user is set by authenticate middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Perform admin action
    // ...

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
```

## Validation Patterns

### Validate Request Body

```javascript
import { validate, resourceSchema } from '../middleware/validate.js';

router.post('/', validate(resourceSchema, 'body'), controller.createResource);
```

### Validate URL Parameters

```javascript
import { validate, idSchema } from '../middleware/validate.js';

router.get('/:id', validate(idSchema, 'params'), controller.getResource);
```

### Validate Query Parameters

```javascript
const querySchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

router.get('/', validate(querySchema, 'query'), controller.listResources);
```

## Response Formats

### Success Response

```javascript
res.json({
  success: true,
  data: { /* resource data */ }
});
```

### Success with Metadata

```javascript
res.json({
  success: true,
  count: 42,
  page: 1,
  totalPages: 5,
  data: [ /* array of resources */ ]
});
```

### Error Response

```javascript
res.status(404).json({
  success: false,
  error: 'Resource not found',
  message: 'The requested resource could not be found'
});
```

### Created Response

```javascript
res.status(201).json({
  success: true,
  message: 'Resource created successfully',
  data: { id: 123, ...resourceData }
});
```

## Common HTTP Status Codes

- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE with no response body)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (unhandled exception)

## Best Practices

1. **Always use try/catch** - Pass errors to `next(error)`
2. **Validate inputs** - Use Joi schemas
3. **Check existence** - Before UPDATE/DELETE
4. **Log important actions** - Creates, updates, deletes
5. **Return consistent formats** - Always include `success` field
6. **Use appropriate status codes** - Match HTTP semantics
7. **Parameterize queries** - NEVER concatenate user input
8. **Handle edge cases** - Empty lists, not found, etc.
9. **Document endpoints** - JSDoc comments for each function
10. **Keep controllers thin** - Complex logic goes in services

## Quick Checklist

- [ ] Route registered in routes file
- [ ] Controller function created
- [ ] Authentication middleware (if needed)
- [ ] Validation middleware (if needed)
- [ ] Parameterized database query
- [ ] Error handling (try/catch + next)
- [ ] Appropriate status code
- [ ] Consistent response format
- [ ] Logging for important actions
- [ ] JSDoc documentation
