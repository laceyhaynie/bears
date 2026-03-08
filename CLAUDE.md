# CLAUDE.md

## Project Overview

Modern React + Node.js website for BEARS ham radio club. Migrated from legacy PHP to improve security, maintainability, and user experience.

## Technology Stack

- **Frontend**: React 18, Vite, React Router v6, SCSS Modules
- **Backend**: Node.js, Express.js, mysql2/promise
- **Database**: MySQL (existing database from legacy PHP app)
- **Authentication**: express-session with MySQL store, bcrypt password hashing
- **Testing**: Vitest, React Testing Library, Supertest
- **Development**: npm workspaces (monorepo)

## Monorepo Structure

- `/node` - Express.js REST API backend
- `/react` - React frontend (Vite)
- `/shared` - Shared types and constants
- `/.claude/skills` - Claude Code skills

## Development Workflow

### Setup
```bash
npm install
cd node && npm install
cd ../react && npm install
```

### Running Locally
```bash
# Terminal 1: Backend
cd node
npm run dev   # Runs on http://localhost:5000

# Terminal 2: Frontend
cd react
npm run dev   # Runs on http://localhost:3000
```

### Testing
```bash
# Backend tests
cd node
npm test

# Frontend tests
cd react
npm test
```

## Architecture Patterns

### Backend (Node)

**RESTful API** with consistent patterns:
- `GET /api/resource` - List all
- `GET /api/resource/:id` - Get single item
- `POST /api/resource` - Create (admin only)
- `PUT /api/resource/:id` - Update (admin only)
- `DELETE /api/resource/:id` - Delete (admin only)

**Middleware stack**:
1. CORS (restrict to frontend origin)
2. Helmet (security headers)
3. Rate limiting (100 req/15min)
4. Body parsing (JSON, urlencoded)
5. Session management
6. Route handlers
7. Error handler (must be last)

**Authentication**:
- Session-based (not JWT)
- Admin credentials stored in `passwords` table with bcrypt hash
- Middleware: `authenticate` (check logged in), `authorize` (check admin role)

### Frontend (React)

**Component Organization**:
- `/pages` - One component per route (HomePage, NewsPage, etc.)
- `/components` - Reusable components organized by domain (news/, events/, common/)
- `/hooks` - Custom hooks for data fetching and state management
- `/context` - Global state (AuthContext)
- `/utils` - Helper functions (API client, formatters, validators)

**State Management**:
- Local state: `useState` for UI state (form inputs, toggles)
- Server data: Custom hooks (`useNews`, `useEvents`) with `useEffect`
- Global auth: `AuthContext` with Context API
- No Redux/Zustand needed for this project scope

**Routing**:
- React Router v6 with nested routes
- Public routes accessible to all
- Admin routes wrapped with `<ProtectedRoute requireAdmin />`
- Redirects to login if not authenticated

### SCSS Design System

**Variables** (`_variables.scss`):
- Colors: Preserved from legacy (green, blue-gray, tan)
- Typography: Font families, sizes, weights
- Spacing: 8px grid system
- Breakpoints: Responsive design

**Component Styles**:
- Use CSS Modules (`.module.scss`) for component scoping
- Import variables and mixins in each component
- Follow BEM-like naming within modules

## Database Schema

**Tables** (existing from legacy PHP):
- `members` - Club members and regular check-ins
- `news` - News items with timestamps
- `events` - Club events
- `exams` - Exam sessions
- `examdates` - Exam dates
- `links` - External resource links
- `images` - News photos
- `passwords` - Admin credentials
- `sessions` - Express session store (new)

**Key Fields**:
- Members: `status` ('bm' = Bears Member, 'rci' = Regular Check-In)
- Links: `type` (1 = Radio Clubs, 2 = General Info, 3 = Radio Stores)
- News: `date` used for 60-day cutoff (recent vs archives)

## Security Practices

**CRITICAL - Always Follow**:
- ✅ Use parameterized queries: `query('SELECT * FROM news WHERE id = ?', [id])`
- ❌ NEVER concatenate user input: `query('SELECT * FROM news WHERE id = ' + id)`
- ✅ Validate all inputs (frontend AND backend)
- ✅ Use bcrypt for passwords (never plaintext)
- ✅ Check authentication before admin operations
- ✅ Enable CORS only for frontend origin
- ✅ Use HttpOnly cookies for sessions

## Coding Guidelines for Beginners

**Naming Conventions**:
- Components: PascalCase (`NewsCard.jsx`)
- Files/functions: camelCase (`useNews.js`, `formatDate()`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)
- CSS classes: kebab-case or camelCase

**Comments**:
- Explain WHY, not WHAT
- Document function parameters and return types
- Add context for non-obvious business logic
- Avoid redundant comments

**File Size**:
- Keep components under 200 lines (split if larger)
- Extract reusable logic into custom hooks
- Create separate components for complex UI sections

## Common Tasks

### Adding a New Public Page
1. Create component in `/react/src/pages/public/NewPage.jsx`
2. Add route in `/react/src/App.jsx`
3. Add navigation link in `/react/src/components/common/Navigation/Navigation.jsx`
4. Create corresponding API endpoint in `/node/src/routes/` if needed

### Adding a New Admin CRUD Page
1. Create controller in `/node/src/controllers/newResourceController.js`
2. Create routes in `/node/src/routes/newResource.js`
3. Add validation middleware in `/node/src/middleware/validate.js`
4. Create React page in `/react/src/pages/admin/AdminNewResourcePage.jsx`
5. Add protected route in `/react/src/App.jsx`
6. Add link in `/react/src/pages/admin/AdminDashboard.jsx`

### Adding a New Database Query
1. Open `/node/src/utils/database.js`
2. Use the `query()` function with parameterized placeholders
3. Example:
```javascript
const results = await query(
  'SELECT * FROM members WHERE status = ? ORDER BY lname ASC',
  [status]
);
```

## Troubleshooting

**Backend won't start**:
- Check `.env` file exists with correct DB credentials
- Verify MySQL is running and accessible
- Check port 5000 isn't already in use

**Frontend can't reach API**:
- Verify backend is running on http://localhost:5000
- Check `VITE_API_URL` in `/react/.env`
- Check CORS settings in `/node/src/index.js`

**Session not persisting**:
- Check `sessions` table exists in MySQL
- Verify `SESSION_SECRET` is set in backend `.env`
- Check browser allows cookies (check DevTools Application tab)

**CSS not applying**:
- Verify import path in component matches file structure
- Check CSS Module naming (`.module.scss`)
- Import variables at top: `@import '@/styles/variables';`

## Resources

- [React Docs](https://react.dev)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [Vite Guide](https://vitejs.dev/guide/)
- [SCSS Documentation](https://sass-lang.com/documentation/)
