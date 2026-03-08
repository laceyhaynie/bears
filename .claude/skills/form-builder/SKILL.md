---
name: Form Builder
description: Create React forms with validation, error handling, and state management
keywords: form, validation, react, input, state
---

# Form Builder

Create robust, accessible React forms following BEARS project patterns.

## Purpose

This skill provides templates and patterns for building forms with proper validation, error handling, loading states, and accessibility features.

## Basic Form Template

### Simple Contact Form

```javascript
import { useState } from 'react';
import { validateEmail } from '@/utils/validators';
import styles from './ContactForm.module.scss';

/**
 * Contact form with client-side validation.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with form data on successful submission
 * @returns {JSX.Element}
 */
export function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    return newErrors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);

      // Reset form
      setFormData({ name: '', email: '', message: '' });

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Success message */}
      {submitSuccess && (
        <div className="success-message">
          Thank you! Your message has been sent.
        </div>
      )}

      {/* General error message */}
      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}

      {/* Name field */}
      <div className="form-group">
        <label htmlFor="name" className="form-label form-label--required">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          disabled={isSubmitting}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="form-error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Email field */}
      <div className="form-group">
        <label htmlFor="email" className="form-label form-label--required">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          disabled={isSubmitting}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="form-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {/* Message field */}
      <div className="form-group">
        <label htmlFor="message" className="form-label form-label--required">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="5"
          className={`form-textarea ${errors.message ? 'form-input--error' : ''}`}
          disabled={isSubmitting}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <span id="message-error" className="form-error" role="alert">
            {errors.message}
          </span>
        )}
      </div>

      {/* Submit button */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
```

## Form with Custom Hook

### useForm Hook

```javascript
// hooks/useForm.js
import { useState } from 'react';

/**
 * Custom hook for form state management and validation.
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function that returns errors object
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} Form state and handlers
 */
export function useForm(initialValues, validate, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate this field on blur
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name]
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {});
    setTouched(allTouched);

    // Validate
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Submit
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
}
```

### Using the Hook

```javascript
import { useForm } from '@/hooks/useForm';
import { validateEmail } from '@/utils/validators';

export function SignupForm() {
  const initialValues = {
    fname: '',
    lname: '',
    email: '',
    callsign: '',
    acceptTerms: false
  };

  const validate = (values) => {
    const errors = {};

    if (!values.fname.trim()) {
      errors.fname = 'First name is required';
    }

    if (!values.lname.trim()) {
      errors.lname = 'Last name is required';
    }

    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.callsign.trim()) {
      errors.callsign = 'Call sign is required';
    }

    if (!values.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms';
    }

    return errors;
  };

  const handleFormSubmit = async (values) => {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    // Success!
    alert('Signup successful!');
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(initialValues, validate, handleFormSubmit);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="fname" className="form-label form-label--required">
          First Name
        </label>
        <input
          type="text"
          id="fname"
          name="fname"
          value={values.fname}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${touched.fname && errors.fname ? 'form-input--error' : ''}`}
        />
        {touched.fname && errors.fname && (
          <span className="form-error">{errors.fname}</span>
        )}
      </div>

      {/* Other fields... */}

      <div className="form-checkbox">
        <input
          type="checkbox"
          id="acceptTerms"
          name="acceptTerms"
          checked={values.acceptTerms}
          onChange={handleChange}
        />
        <label htmlFor="acceptTerms">
          I accept the terms and conditions
        </label>
      </div>
      {touched.acceptTerms && errors.acceptTerms && (
        <span className="form-error">{errors.acceptTerms}</span>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );
}
```

## Field Types

### Text Input

```javascript
<div className="form-group">
  <label htmlFor="username" className="form-label">Username</label>
  <input
    type="text"
    id="username"
    name="username"
    value={values.username}
    onChange={handleChange}
    className="form-input"
    placeholder="Enter username"
  />
</div>
```

### Email Input

```javascript
<div className="form-group">
  <label htmlFor="email" className="form-label">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    value={values.email}
    onChange={handleChange}
    className="form-input"
    placeholder="you@example.com"
  />
</div>
```

### Password Input

```javascript
<div className="form-group">
  <label htmlFor="password" className="form-label">Password</label>
  <input
    type="password"
    id="password"
    name="password"
    value={values.password}
    onChange={handleChange}
    className="form-input"
    placeholder="••••••••"
  />
  <span className="form-hint">At least 8 characters</span>
</div>
```

### Textarea

```javascript
<div className="form-group">
  <label htmlFor="description" className="form-label">Description</label>
  <textarea
    id="description"
    name="description"
    value={values.description}
    onChange={handleChange}
    className="form-textarea"
    rows="4"
    placeholder="Enter description..."
  />
</div>
```

### Select Dropdown

```javascript
import { LINK_TYPES, getLinkTypeOptions } from '@shared/constants/linkTypes';

<div className="form-group">
  <label htmlFor="type" className="form-label">Link Type</label>
  <select
    id="type"
    name="type"
    value={values.type}
    onChange={handleChange}
    className="form-select"
  >
    <option value="">Select type...</option>
    {getLinkTypeOptions().map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>
```

### Radio Buttons

```javascript
import { STATUS_TYPES } from '@shared/constants/statusTypes';

<div className="form-group">
  <label className="form-label">Member Status</label>

  <div className="form-radio">
    <input
      type="radio"
      id="status-bm"
      name="status"
      value={STATUS_TYPES.BEARS_MEMBER}
      checked={values.status === STATUS_TYPES.BEARS_MEMBER}
      onChange={handleChange}
    />
    <label htmlFor="status-bm">Bears Member</label>
  </div>

  <div className="form-radio">
    <input
      type="radio"
      id="status-rci"
      name="status"
      value={STATUS_TYPES.REGULAR_CHECK_IN}
      checked={values.status === STATUS_TYPES.REGULAR_CHECK_IN}
      onChange={handleChange}
    />
    <label htmlFor="status-rci">Regular Check-In</label>
  </div>
</div>
```

### Checkbox

```javascript
<div className="form-checkbox">
  <input
    type="checkbox"
    id="newsletter"
    name="newsletter"
    checked={values.newsletter}
    onChange={handleChange}
  />
  <label htmlFor="newsletter">Subscribe to newsletter</label>
</div>
```

### Date Input

```javascript
<div className="form-group">
  <label htmlFor="eventDate" className="form-label">Event Date</label>
  <input
    type="date"
    id="eventDate"
    name="eventDate"
    value={values.eventDate}
    onChange={handleChange}
    className="form-input"
  />
</div>
```

### File Upload

```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setFormData(prev => ({
    ...prev,
    image: file
  }));
};

<div className="form-group">
  <label htmlFor="image" className="form-label">Image</label>
  <input
    type="file"
    id="image"
    name="image"
    onChange={handleFileChange}
    accept="image/*"
    className="form-input"
  />
</div>
```

## Validation Patterns

### Client-Side Validation

```javascript
// utils/validators.js

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateCallsign(callsign) {
  // Ham radio call sign pattern (simplified)
  const re = /^[A-Z0-9]{3,6}$/i;
  return re.test(callsign);
}

export function validatePhone(phone) {
  // US phone number (various formats)
  const re = /^[\d\s\-().]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length === 10;
}

export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateRequired(value) {
  return value && value.trim().length > 0;
}

export function validateMinLength(value, min) {
  return value && value.length >= min;
}

export function validateMaxLength(value, max) {
  return value && value.length <= max;
}
```

### Form-Specific Validation

```javascript
const validateMemberForm = (values) => {
  const errors = {};

  if (!validateRequired(values.fname)) {
    errors.fname = 'First name is required';
  }

  if (!validateRequired(values.lname)) {
    errors.lname = 'Last name is required';
  }

  if (!validateRequired(values.callsign)) {
    errors.callsign = 'Call sign is required';
  } else if (!validateCallsign(values.callsign)) {
    errors.callsign = 'Invalid call sign format';
  }

  if (!validateRequired(values.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (values.phone && !validatePhone(values.phone)) {
    errors.phone = 'Invalid phone number';
  }

  return errors;
};
```

## Form Submission Patterns

### API Call with Axios

```javascript
import axios from 'axios';

const handleSubmit = async (formData) => {
  try {
    const response = await axios.post('/api/members', formData);

    console.log('Success:', response.data);
    alert('Member added successfully!');

    // Reset form or redirect
    resetForm();
  } catch (error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || 'Submission failed';
      setErrors({ submit: message });
    } else {
      // Network error
      setErrors({ submit: 'Network error. Please try again.' });
    }
  }
};
```

### With FormData (File Upload)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('description', values.description);
  formData.append('image', values.image); // File object

  try {
    const response = await axios.post('/api/news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Accessibility Best Practices

1. **Always use labels**: Connect labels to inputs with `htmlFor`/`id`
2. **Required fields**: Use `aria-required` or required attribute
3. **Error messages**: Use `aria-invalid` and `aria-describedby`
4. **Fieldsets**: Group related inputs with `<fieldset>` and `<legend>`
5. **Focus management**: Ensure keyboard navigation works
6. **Error announcements**: Use `role="alert"` for dynamic errors
7. **Help text**: Use `aria-describedby` for hints

## Complete Admin Form Example

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NewsForm.module.scss';

export function NewsForm({ initialData = null, mode = 'create' }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await axios.post('/api/news', formData);
        alert('News created successfully!');
      } else {
        await axios.put(`/api/news/${initialData.id_numb}`, formData);
        alert('News updated successfully!');
      }
      navigate('/admin/news');
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to save' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/news');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{mode === 'create' ? 'Create News' : 'Edit News'}</h2>

      {errors.submit && (
        <div className="error-message">{errors.submit}</div>
      )}

      <div className="form-group">
        <label htmlFor="title" className="form-label form-label--required">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          disabled={isSubmitting}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          rows="6"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">
          Image URL
        </label>
        <input
          type="text"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="form-input"
          placeholder="https://example.com/image.jpg"
          disabled={isSubmitting}
        />
        <span className="form-hint">Optional: URL to an image</span>
      </div>

      <div className="form-actions form-actions--space-between">
        <button
          type="button"
          onClick={handleCancel}
          className="btn btn--secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </button>
      </div>
    </form>
  );
}
```

## Quick Checklist

- [ ] All inputs have labels with `htmlFor`
- [ ] Required fields marked (visually and semantically)
- [ ] Validation on blur and submit
- [ ] Error messages clear and specific
- [ ] Loading state disables form during submission
- [ ] Success/error feedback after submission
- [ ] Cancel button or way to navigate away
- [ ] Keyboard navigation works
- [ ] ARIA attributes for errors
- [ ] Form resets or redirects after success
