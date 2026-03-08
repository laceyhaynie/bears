---
name: Database Migration
description: Convert legacy PHP MySQL queries to modern Node.js parameterized queries
keywords: database, sql, migration, mysql, security
---

# Database Migration Helper

Convert unsafe legacy SQL to secure parameterized queries.

## Purpose

This skill helps convert legacy PHP MySQL queries that are vulnerable to SQL injection into modern, secure Node.js parameterized queries using mysql2/promise.

## Legacy Pattern (UNSAFE - Do NOT Use)

```php
// VULNERABLE TO SQL INJECTION
$title = $_REQUEST['title'];
$description = $_REQUEST['description'];
$query = "INSERT INTO news (title, description) VALUES ('$title', '$description')";
mysql_query($query);
```

Problems:
- String concatenation allows SQL injection
- No input validation
- Deprecated mysql_* functions

## Modern Pattern (SAFE - Use This)

```javascript
// SECURE - Uses parameterized queries
import { query } from '../utils/database.js';

const title = req.body.title;
const description = req.body.description;

await query(
  'INSERT INTO news (title, description, date) VALUES (?, ?, NOW())',
  [title, description]
);
```

Benefits:
- Parameters safely escaped by MySQL driver
- No SQL injection possible
- Modern async/await syntax
- mysql2/promise with connection pooling

## Common Conversion Examples

### SELECT Query

```php
// Legacy PHP
$status = $_GET['status'];
$query = "SELECT * FROM members WHERE status = '$status'";
$result = mysql_query($query);
```

```javascript
// Modern Node.js
const status = req.query.status;
const members = await query(
  'SELECT * FROM members WHERE status = ? ORDER BY lname ASC',
  [status]
);
```

### INSERT Query

```php
// Legacy PHP
$fname = $_POST['fname'];
$lname = $_POST['lname'];
$query = "INSERT INTO members (fname, lname) VALUES ('$fname', '$lname')";
mysql_query($query);
```

```javascript
// Modern Node.js
const { fname, lname } = req.body;
const result = await query(
  'INSERT INTO members (fname, lname) VALUES (?, ?)',
  [fname, lname]
);
const insertedId = result.insertId;
```

### UPDATE Query

```php
// Legacy PHP
$id = $_POST['id'];
$title = $_POST['title'];
$query = "UPDATE news SET title = '$title' WHERE id_numb = $id";
mysql_query($query);
```

```javascript
// Modern Node.js
const { id, title } = req.body;
await query(
  'UPDATE news SET title = ? WHERE id_numb = ?',
  [title, id]
);
```

### DELETE Query

```php
// Legacy PHP
$id = $_GET['id'];
$query = "DELETE FROM events WHERE id_numb = $id";
mysql_query($query);
```

```javascript
// Modern Node.js
const id = req.params.id;
await query(
  'DELETE FROM events WHERE id_numb = ?',
  [id]
);
```

## Database Schema Reference

### Tables

- **members**: idnumber, fname, lname, callsign, email, status, netdate
- **news**: id_numb, date, title, description, image
- **events**: id_numb, date, title, time, location, description
- **exams**: id_numb, date, title, description
- **links**: id_numb, type, title, url, description
- **images**: id, news_id, filename
- **passwords**: id, username, email, password_hash (migrated from memberedit)
- **sessions**: session_id, expires, data

### Common Field Names

- Primary keys: `id_numb` or `idnumber` (legacy naming)
- Dates: `date` (DATETIME)
- Status: 'bm' (Bears Member) or 'rci' (Regular Check-In)
- Link types: 1 (Radio Clubs), 2 (General Info), 3 (Radio Stores)

## Important Notes

1. **Always use parameterized queries** - Never concatenate user input
2. **Validate inputs** - Use Joi schemas before database operations
3. **Handle errors** - Wrap queries in try/catch blocks
4. **Return appropriate data** - Use controller pattern to format responses

## Using with Transaction

For operations that need multiple queries to succeed/fail together:

```javascript
import { transaction } from '../utils/database.js';

await transaction(async (conn) => {
  // Insert news item
  const result = await conn.query(
    'INSERT INTO news (title, description) VALUES (?, ?)',
    [title, description]
  );

  const newsId = result[0].insertId;

  // Insert related images
  await conn.query(
    'INSERT INTO images (news_id, filename) VALUES (?, ?)',
    [newsId, filename]
  );
});
```

## Quick Reference

| Legacy PHP | Modern Node.js |
|------------|----------------|
| `$_POST['key']` | `req.body.key` |
| `$_GET['key']` | `req.query.key` |
| `$_REQUEST['key']` | `req.params.key` or `req.body.key` |
| `mysql_query($sql)` | `await query(sql, params)` |
| `mysql_fetch_assoc()` | Results returned as array of objects |
| `mysql_insert_id()` | `result.insertId` |
| `mysql_num_rows()` | `results.length` |
