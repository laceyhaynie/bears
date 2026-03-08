---
name: Test Generator
description: Generate tests for Node.js APIs and React components using Vitest
keywords: test, vitest, testing, unit-test, integration-test
---

# Test Generator

Generate comprehensive tests for backend APIs and React components using Vitest and React Testing Library.

## Purpose

This skill provides templates and patterns for writing tests that ensure code quality, prevent regressions, and document expected behavior.

## Backend API Testing

### Setup File

```javascript
// tests/setup.js
import { beforeAll, afterAll, afterEach } from 'vitest';
import { query } from '../src/utils/database.js';

// Setup test database
beforeAll(async () => {
  // Create test tables if needed
  console.log('Setting up test database...');
});

// Cleanup after each test
afterEach(async () => {
  // Clear test data
  await query('DELETE FROM news WHERE title LIKE "TEST:%"');
  await query('DELETE FROM members WHERE email LIKE "%@test.com"');
});

// Cleanup after all tests
afterAll(async () => {
  console.log('Cleaning up test database...');
});
```

### API Endpoint Tests

```javascript
// tests/news.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/index.js'; // Your Express app
import { query } from '../src/utils/database.js';

describe('News API', () => {
  let testNewsId;

  // Create test data before each test
  beforeEach(async () => {
    const result = await query(
      'INSERT INTO news (title, description, date) VALUES (?, ?, NOW())',
      ['TEST: Sample News', 'Test description']
    );
    testNewsId = result.insertId;
  });

  describe('GET /api/news', () => {
    it('should return list of recent news', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return news from last 60 days only', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(200);

      const news = response.body.data;

      // Check all news items are within 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      news.forEach(item => {
        const newsDate = new Date(item.date);
        expect(newsDate.getTime()).toBeGreaterThanOrEqual(sixtyDaysAgo.getTime());
      });
    });
  });

  describe('GET /api/news/:id', () => {
    it('should return single news item', async () => {
      const response = await request(app)
        .get(`/api/news/${testNewsId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id_numb).toBe(testNewsId);
      expect(response.body.data.title).toBe('TEST: Sample News');
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .get('/api/news/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('News item not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/news/invalid')
        .expect(400);

      expect(response.body.error).toContain('Validation failed');
    });
  });

  describe('POST /api/news', () => {
    it('should create news when authenticated', async () => {
      // First, login to get session cookie
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      // Create news with session
      const response = await request(app)
        .post('/api/news')
        .set('Cookie', sessionCookie)
        .send({
          title: 'TEST: New News Item',
          description: 'Test description',
          image: ''
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('TEST: New News Item');
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/news')
        .send({
          title: 'TEST: Unauthorized News',
          description: 'Should fail'
        })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 400 for invalid data', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      const response = await request(app)
        .post('/api/news')
        .set('Cookie', sessionCookie)
        .send({
          // Missing required title
          description: 'No title provided'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/news/:id', () => {
    it('should update news when authenticated', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      const response = await request(app)
        .put(`/api/news/${testNewsId}`)
        .set('Cookie', sessionCookie)
        .send({
          title: 'TEST: Updated Title',
          description: 'Updated description',
          image: ''
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('TEST: Updated Title');
    });

    it('should return 404 for non-existent news', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      const response = await request(app)
        .put('/api/news/99999')
        .set('Cookie', sessionCookie)
        .send({
          title: 'Updated Title',
          description: 'Updated'
        })
        .expect(404);

      expect(response.body.error).toBe('News item not found');
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('should delete news when authenticated', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      const response = await request(app)
        .delete(`/api/news/${testNewsId}`)
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('News deleted successfully');

      // Verify it's deleted
      const checkRes = await request(app)
        .get(`/api/news/${testNewsId}`)
        .expect(404);
    });
  });
});
```

### Authentication Tests

```javascript
// tests/auth.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('admin@test.com');

      // Check that session cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('bears_session');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password'
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout and destroy session', async () => {
      // First login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      // Then logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');

      // Verify session is destroyed by trying to access protected route
      const protectedRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });

      const sessionCookie = loginRes.headers['set-cookie'];

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('admin@test.com');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
});
```

### Utility Function Tests

```javascript
// tests/bcrypt.test.js
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/utils/bcrypt.js';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should create different hashes for same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('wrongPassword', hash);

      expect(isValid).toBe(false);
    });
  });
});
```

## Frontend Component Testing

### Setup File

```javascript
// react/tests/setup.js
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### Component Tests

```javascript
// components/news/NewsCard/NewsCard.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NewsCard } from './NewsCard';

describe('NewsCard', () => {
  const mockNewsItem = {
    id_numb: 1,
    title: 'Test News Title',
    date: '2024-03-07',
    description: 'Test news description'
  };

  it('should render news card with all information', () => {
    render(
      <BrowserRouter>
        <NewsCard newsItem={mockNewsItem} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test News Title')).toBeInTheDocument();
    expect(screen.getByText('Test news description')).toBeInTheDocument();
    expect(screen.getByText(/Read More/i)).toBeInTheDocument();
  });

  it('should render link to news detail page', () => {
    render(
      <BrowserRouter>
        <NewsCard newsItem={mockNewsItem} />
      </BrowserRouter>
    );

    const link = screen.getByRole('link', { name: /Read More/i });
    expect(link).toHaveAttribute('href', '/news/1');
  });

  it('should format date correctly', () => {
    render(
      <BrowserRouter>
        <NewsCard newsItem={mockNewsItem} />
      </BrowserRouter>
    );

    // Assuming formatDate converts to "March 7, 2024" or similar
    const dateElement = screen.getByText(/2024/);
    expect(dateElement).toBeInTheDocument();
  });
});
```

### Form Component Tests

```javascript
// components/forms/SignupForm/SignupForm.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from './SignupForm';

describe('SignupForm', () => {
  it('should render all form fields', () => {
    render(<SignupForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/call sign/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<SignupForm onSubmit={vi.fn()} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should show error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignupForm onSubmit={vi.fn()} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(<SignupForm onSubmit={mockSubmit} />);

    // Fill in form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/call sign/i), 'KE7ABC');

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        fname: 'John',
        lname: 'Doe',
        email: 'john@example.com',
        callsign: 'KE7ABC'
      });
    });
  });

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<SignupForm onSubmit={mockSubmit} />);

    // Fill in form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/call sign/i), 'KE7ABC');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
  });

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup();
    render(<SignupForm onSubmit={vi.fn()} />);

    // Submit empty form to trigger errors
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    // Start typing in email field
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'j');

    // Error should be cleared
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });
});
```

### Custom Hook Tests

```javascript
// hooks/useNews.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNews } from './useNews';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('useNews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch news successfully', async () => {
    const mockNews = [
      { id_numb: 1, title: 'News 1', date: '2024-03-07' },
      { id_numb: 2, title: 'News 2', date: '2024-03-06' }
    ];

    axios.get.mockResolvedValue({
      data: { success: true, data: mockNews }
    });

    const { result } = renderHook(() => useNews());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.news).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.news).toEqual(mockNews);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNews());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.news).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should call correct API endpoint', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    renderHook(() => useNews());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/news');
    });
  });
});
```

### Page Component Tests

```javascript
// pages/public/NewsPage.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NewsPage } from './NewsPage';
import * as useNewsHook from '@/hooks/useNews';

vi.mock('@/hooks/useNews');

describe('NewsPage', () => {
  it('should show loading state', () => {
    useNewsHook.useNews.mockReturnValue({
      news: [],
      loading: true,
      error: null
    });

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    useNewsHook.useNews.mockReturnValue({
      news: [],
      loading: false,
      error: 'Failed to load news'
    });

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/failed to load news/i)).toBeInTheDocument();
  });

  it('should render news items', () => {
    const mockNews = [
      { id_numb: 1, title: 'News 1', date: '2024-03-07', description: 'Desc 1' },
      { id_numb: 2, title: 'News 2', date: '2024-03-06', description: 'Desc 2' }
    ];

    useNewsHook.useNews.mockReturnValue({
      news: mockNews,
      loading: false,
      error: null
    });

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('News 1')).toBeInTheDocument();
    expect(screen.getByText('News 2')).toBeInTheDocument();
  });

  it('should show empty state when no news', () => {
    useNewsHook.useNews.mockReturnValue({
      news: [],
      loading: false,
      error: null
    });

    render(
      <BrowserRouter>
        <NewsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/no news/i)).toBeInTheDocument();
  });
});
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```javascript
it('should update item', async () => {
  // Arrange - Set up test data
  const mockItem = { id: 1, name: 'Test' };

  // Act - Perform the action
  const result = await updateItem(mockItem);

  // Assert - Check the result
  expect(result.success).toBe(true);
});
```

### 2. Test File Naming

- Component tests: `ComponentName.test.jsx`
- Hook tests: `useHookName.test.js`
- Utility tests: `utilityName.test.js`
- API tests: `resourceName.test.js`

### 3. Descriptive Test Names

```javascript
// ✅ Good
it('should return 404 when news item does not exist')

// ❌ Bad
it('test news not found')
```

### 4. Mock External Dependencies

```javascript
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

// Mock specific module
vi.mock('@/utils/api', () => ({
  fetchData: vi.fn()
}));
```

### 5. Test User Interactions

```javascript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  const mockClick = vi.fn();

  render(<Button onClick={mockClick}>Click Me</Button>);

  await user.click(screen.getByRole('button'));

  expect(mockClick).toHaveBeenCalledTimes(1);
});
```

### 6. Async Testing

```javascript
import { waitFor } from '@testing-library/react';

it('should load data asynchronously', async () => {
  render(<DataComponent />);

  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
  });
});
```

## Common Testing Patterns

### Testing Protected Routes

```javascript
it('should redirect to login if not authenticated', async () => {
  const loginRes = await request(app)
    .get('/api/admin/dashboard')
    .expect(401);

  expect(loginRes.body.error).toBe('Authentication required');
});
```

### Testing Form Validation

```javascript
it('should validate required fields', async () => {
  const user = userEvent.setup();
  render(<Form />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/required/i)).toBeInTheDocument();
});
```

### Testing API Calls

```javascript
it('should call API with correct data', async () => {
  axios.post.mockResolvedValue({ data: { success: true } });

  await createNews({ title: 'Test' });

  expect(axios.post).toHaveBeenCalledWith(
    '/api/news',
    { title: 'Test' }
  );
});
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Run coverage report:
```bash
npm test -- --coverage
```

## Quick Checklist

- [ ] Test happy path (success case)
- [ ] Test error cases
- [ ] Test edge cases (empty, null, invalid)
- [ ] Test authentication/authorization
- [ ] Test validation
- [ ] Mock external dependencies
- [ ] Use descriptive test names
- [ ] Follow AAA pattern (Arrange-Act-Assert)
- [ ] Test user interactions, not implementation
- [ ] Async operations handled with waitFor
