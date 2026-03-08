# BEARS Website - Modern Migration

Bear Lake Emergency Amateur Radio Service (BEARS) ham radio club website, migrated from legacy PHP to modern React + Node.js stack.

## 🚀 Project Overview

This is a complete rebuild of the BEARS website, preserving all functionality from the legacy PHP site while implementing modern security practices, improved maintainability, and a responsive design.

### Why Do This Migration?

- **Security**: Eliminates SQL injection, XSS vulnerabilities, and plaintext passwords
- **Maintainability**: Modern architecture with separation of concerns
- **Performance**: Faster page loads and better user experience
- **Mobile-Friendly**: Responsive design that works on all devices
- **Future-Ready**: Easy to extend with new features

## 📁 Project Structure

```
bears/
├── node/              # Backend API (Express.js)
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/ # Auth, validation, error handling
│   │   ├── utils/     # Database, bcrypt, logger
│   │   └── index.js   # Server entry point
│   └── tests/         # Backend tests
│
├── react/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── styles/    # SCSS design system
│   │   └── utils/     # Helper functions
│   └── public/        # Static assets
│
├── shared/            # Shared code (types, constants)
│   ├── types/
│   └── constants/
│
└── .claude/           # Claude Code skills
    └── skills/
```

## 🛠️ Technology Stack

**Frontend:**
- React 18
- Vite (build tool)
- React Router v6
- Axios (HTTP client)
- SCSS Modules (styling)

**Backend:**
- Node.js + Express.js
- MySQL (mysql2/promise)
- express-session (authentication)
- bcrypt (password hashing)
- Joi (input validation)
- Helmet, CORS, Rate Limiting (security)

**Database:**
- MySQL (reuses existing database from PHP site)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- MySQL database access
- Git (optional)

### Setup Instructions

1. **Install dependencies:**

```bash
# From project root
npm install

# Install all workspace dependencies
cd node && npm install
cd ../react && npm install
cd ..
```

2. **Configure environment variables:**

```bash
# Backend (.env in node/ directory)
cp node/.env.example node/.env
# Edit node/.env with your database credentials

# Frontend (.env in react/ directory)
cp react/.env.example react/.env
# Edit react/.env if needed (defaults are usually fine for development)
```

3. **Setup database:**

```bash
# Create sessions table for authentication
# Run this SQL in your MySQL database:
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
);
```

4. **Migrate passwords (IMPORTANT - run ONCE):**

```bash
cd node
node src/scripts/migrate-passwords.js
```

This converts existing plaintext passwords to bcrypt hashes.

## 🚀 Running the Application

### Development Mode

**Option 1: Run both frontend and backend together (recommended):**

```bash
# From project root
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3000

**Option 2: Run separately in different terminals:**

```bash
# Terminal 1: Backend
cd node
npm run dev

# Terminal 2: Frontend
cd react
npm run dev
```

### Production Build

```bash
# Build frontend
cd react
npm run build

# Start backend in production mode
cd ../node
NODE_ENV=production npm start
```

## 🧪 Testing

```bash
# Backend tests
cd node
npm test

# Frontend tests
cd react
npm test
```

## 📖 API Documentation

### Authentication Endpoints

```
POST   /api/auth/login      # Login with email/password
POST   /api/auth/logout     # Logout (destroy session)
GET    /api/auth/me         # Get current user info
```

### News Endpoints

```
GET    /api/news            # List recent news (last 60 days)
GET    /api/news/archives   # List older news (archives)
GET    /api/news/:id        # Get single news item
POST   /api/news            # Create news (admin only)
PUT    /api/news/:id        # Update news (admin only)
DELETE /api/news/:id        # Delete news (admin only)
```

Similar patterns exist for:
- `/api/events` - Event management
- `/api/members` - Member directory
- `/api/exams` - Exam schedules
- `/api/links` - Resource links

## 🎨 Design System

The SCSS design system preserves the visual identity from the legacy site:

**Colors:**
- Primary (dark green): `#2c411d`
- Secondary (blue-gray): `#6b98b7`
- Accent (tan): `#dcdca2`
- Hover (olive): `#8a8a65`

**Typography:**
- System font stack for performance
- Responsive font sizes
- Consistent spacing (8px grid)

**Components:**
- Buttons (primary, secondary, outline, danger)
- Cards (standard, interactive, accent)
- Forms (inputs, textareas, selects, validation)

All variables and mixins are in `react/src/styles/`.

## 🔒 Security Features

### Input Validation
- All user inputs validated with Joi schemas
- Client-side AND server-side validation

### SQL Injection Prevention
- Parameterized queries throughout
- NEVER concatenate user input into SQL

### Password Security
- bcrypt hashing (10 rounds)
- Session-based authentication
- HttpOnly cookies prevent XSS theft

### Additional Protections
- Helmet.js security headers
- CORS restricted to frontend origin
- Rate limiting (100 req/15min)
- XSS prevention (React auto-escapes)

## 📚 Common Tasks

### Adding a New Public Page

1. Create component in `react/src/pages/public/NewPage.jsx`
2. Add route in `react/src/App.jsx`
3. Add navigation link in `react/src/components/common/Navigation/`

### Adding a New API Endpoint

1. Create controller in `node/src/controllers/newController.js`
2. Create routes in `node/src/routes/newRoutes.js`
3. Add validation schema in `node/src/middleware/validate.js`
4. Register routes in `node/src/index.js`

### Database Queries

Always use parameterized queries:

```javascript
// ✅ SAFE
const results = await query(
  'SELECT * FROM members WHERE status = ?',
  [status]
);

// ❌ UNSAFE - NEVER DO THIS
const results = await query(
  `SELECT * FROM members WHERE status = '${status}'`
);
```

## 🐛 Troubleshooting

**Backend won't start:**
- Check `.env` file exists with correct credentials
- Verify MySQL is running
- Check port 5000 isn't in use

**Frontend can't reach API:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `react/.env`
- Check browser console for CORS errors

**Session not persisting:**
- Verify `sessions` table exists
- Check `SESSION_SECRET` is set
- Clear browser cookies and try again

**CSS not applying:**
- Check import path in component
- Verify `.module.scss` naming
- Import variables: `@import '@/styles/variables';`

## 🤝 Contributing

This project is designed to be beginner-friendly with extensive comments throughout the codebase.

**Code Style:**
- Use meaningful variable names
- Add comments explaining WHY, not WHAT
- Keep components under 200 lines
- Follow existing patterns

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For questions or issues:
- Club webmaster: webmaster@zb-net.com
- Club email: kjnield@digis.net

---

**Built with ❤️ for the BEARS ham radio club**
