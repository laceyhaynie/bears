---
name: Component Generator
description: Generate React components following BEARS project structure
keywords: react, component, template, scaffold
---

# Component Generator

Generate React components following BEARS project conventions and best practices.

## Purpose

This skill provides templates and patterns for creating consistent React components in the BEARS project, including proper file structure, styling, and documentation.

## Component Template

### Basic Component

```javascript
import styles from './ComponentName.module.scss';

/**
 * Brief description of what this component does.
 *
 * @param {Object} props
 * @param {string} props.title - Description of this prop
 * @param {Function} props.onClick - Callback when clicked
 * @returns {JSX.Element}
 */
export function ComponentName({ title, onClick }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <button onClick={onClick} className={styles.button}>
        Click Me
      </button>
    </div>
  );
}
```

### Component with State

```javascript
import { useState } from 'react';
import styles from './ComponentName.module.scss';

/**
 * Component with internal state management.
 *
 * @param {Object} props
 * @param {string} props.initialValue - Initial value
 * @returns {JSX.Element}
 */
export function ComponentName({ initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className={styles.input}
      />
      <p>Current value: {value}</p>
    </div>
  );
}
```

### Component with Custom Hook

```javascript
import { useNews } from '@/hooks/useNews';
import styles from './NewsList.module.scss';

/**
 * Displays a list of news items fetched from the API.
 *
 * @returns {JSX.Element}
 */
export function NewsList() {
  const { news, loading, error } = useNews();

  if (loading) {
    return <div className="loading">Loading news...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className={styles.list}>
      {news.map((item) => (
        <div key={item.id_numb} className={styles.item}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## Folder Structure

### For Simple Components

```
ComponentName/
├── ComponentName.jsx
└── ComponentName.module.scss
```

### For Complex Components

```
ComponentName/
├── ComponentName.jsx
├── ComponentName.module.scss
├── ComponentName.test.jsx
└── index.js  (re-exports for cleaner imports)
```

Example `index.js`:
```javascript
export { ComponentName } from './ComponentName';
```

## SCSS Module Template

```scss
// ComponentName.module.scss
@import '@/styles/variables';
@import '@/styles/mixins';

.container {
  padding: $spacing-md;
  background-color: $color-white;
  border-radius: $border-radius-md;

  @include responsive('md') {
    padding: $spacing-lg;
  }
}

.title {
  color: $color-primary;
  font-size: $font-size-xl;
  margin-bottom: $spacing-md;
}

.button {
  @include button-primary;
}

.item {
  @include card;
  margin-bottom: $spacing-md;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}
```

## Component Categories

### Page Components (`/pages`)

Full-page components that map to routes.

```javascript
// HomePage.jsx
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import styles from './HomePage.module.scss';

export function HomePage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <h1>Welcome to BEARS</h1>
        <p>Bear Lake Emergency Amateur Radio Service</p>
      </main>
      <Footer />
    </div>
  );
}
```

### Domain Components (`/components/news`, `/components/events`)

Components specific to a domain (news, events, members, etc.).

```javascript
// NewsCard.jsx
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/dateFormatter';
import styles from './NewsCard.module.scss';

/**
 * Display a single news item in card format.
 *
 * @param {Object} props
 * @param {Object} props.newsItem - News item object
 * @returns {JSX.Element}
 */
export function NewsCard({ newsItem }) {
  const { id_numb, title, date, description } = newsItem;

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <time className={styles.date}>{formatDate(date)}</time>
      <p className={styles.description}>{description}</p>
      <Link to={`/news/${id_numb}`} className={styles.link}>
        Read More →
      </Link>
    </article>
  );
}
```

### Common Components (`/components/common`)

Reusable UI components used across the application.

```javascript
// Button.jsx
import styles from './Button.module.scss';

/**
 * Reusable button component.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary'|'secondary'|'danger'} props.variant - Button style
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @returns {JSX.Element}
 */
export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn--${variant}`]}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Form Components

```javascript
// SignupForm.jsx
import { useState } from 'react';
import { validateEmail } from '@/utils/validators';
import styles from './SignupForm.module.scss';

export function SignupForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    callsign: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.fname) newErrors.fname = 'First name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className="form-group">
        <label htmlFor="fname" className="form-label">First Name *</label>
        <input
          type="text"
          id="fname"
          name="fname"
          value={formData.fname}
          onChange={handleChange}
          className={`form-input ${errors.fname ? 'form-input--error' : ''}`}
        />
        {errors.fname && <span className="form-error">{errors.fname}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">Submit</button>
      </div>
    </form>
  );
}
```

## Best Practices

1. **One component per file** - Makes code easier to find and maintain
2. **Use CSS Modules** - Prevents style conflicts
3. **Descriptive prop names** - Self-documenting code
4. **JSDoc comments** - Document props and return types
5. **Extract logic to hooks** - Keep components focused on rendering
6. **Consistent naming** - PascalCase for components, camelCase for props
7. **Accessibility** - Use semantic HTML, labels, ARIA attributes
8. **Error boundaries** - Wrap risky components
9. **Loading states** - Always handle loading/error/success states
10. **Mobile-first** - Design for mobile, enhance for desktop

## Common Patterns

### Conditional Rendering

```javascript
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{!loading && !error && data && <DataDisplay data={data} />}
```

### List Rendering

```javascript
{items.length === 0 ? (
  <p>No items found.</p>
) : (
  <ul>
    {items.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
)}
```

### Event Handlers

```javascript
// Don't call inline
<button onClick={() => handleClick(id)}>  // Creates new function every render

// Do: Bind in JSX or use closure
<button onClick={handleClick}>  // If no args needed
<button onClick={(e) => handleClick(id, e)}>  // If args needed
```

## Quick Checklist

- [ ] Component name matches filename
- [ ] Props documented with JSDoc
- [ ] Styles in matching `.module.scss` file
- [ ] Proper imports (@ aliases)
- [ ] Accessibility attributes (labels, ARIA)
- [ ] Loading/error states handled
- [ ] Responsive design (@media or mixins)
- [ ] Comments explain WHY, not WHAT
