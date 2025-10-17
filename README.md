# icmern

A production-ready MERN starter template with batteries included: authentication (JWT + cookies), email verification with OTP, validation, error handling, pagination utilities, and a developer-friendly CLI to scaffold resources and bootstrap new projects quickly.

## Features

- Authentication with JWT (HTTP-only cookie in production)
- Email verification via OTP codes (Nodemailer + templated emails)
- Request validation using Joi and centralized validator middleware
- Centralized error handler with consistent API responses
- RESTful User CRUD (secured)
- Pagination utilities
- Security middleware (Helmet, CORS, Cookie Parser)
- MongoDB via Mongoose
- Developer CLI:
  - `init` to scaffold a fresh project from this template
  - `make:controller`, `make:model`, `make:route`, `make:middleware`, `make:factory`
- EJS view engine for server-rendered pages (configurable `view/` directory)

## Quick Start

```bash
# 1) Scaffold a new project (clean app package.json)
npx icmern init my-app
cd my-app

# 2) Install dependencies
npm install

# 3) Configure environment variables
cp .env.example .env   # (create .env and fill values)

# 4) Run development server
npm run dev
```

## Scripts

- `npm run dev`: Run with Nodemon on `server.js`
- `npm start`: Run with Node

## Environment Variables

Create a `.env` file in the project root with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/icmern

# JWT
JWT_SECRET=your_jwt_secret_here

# HMAC (for OTP hashing if needed)
HMAC_VERIFICATION_CODE_SECRET=your_hmac_secret_here

# SMTP (email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email
SMTP_PASS=your_password
```

## Project Structure

```
server.js                # Entry; loads app and starts HTTP server
app.js                   # Express app configuration
src/
  config/
    db.js                # MongoDB connection (Mongoose)
  controllers/
    authController.js    # register/login/logout, email verification
    userController.js    # CRUD for users (secured)
    homeController.js    # Web pages (EJS) controllers: home/about
  middleware/
    authMiddleware.js    # Checks Authorization (JWT from header/cookie)
    errorHandler.js      # Central error handler
    validatorMiddleware.js # Joi schema validation
    uploadMiddleware.js  # (placeholder)
  models/
    User.js              # User schema with verification fields
  routes/
    api/
      authRouter.js      # /api/auth/* endpoints
      userRouter.js      # /api/users/* endpoints
    router.js            # example root router (welcome)
    web/
      index.js           # web router rendering EJS views (/, /about)
  templates/
    emailTemplates.js    # Nodemailer HTML templates
  utils/
    apiResponse.js       # success/error response helpers
    Cookies.js           # send/clear cookie helpers
    email.js             # nodemailer transporter + sendMail
    generateOTP.js       # numeric OTP generator
    hashing.js           # bcrypt password hashing
    jwt.js               # sign/verify JWT
    pagination.js        # pagination helper (API)
    viewHelpers.js       # helpers for EJS views (formatDate, truncate, ...)
view/                    # place your .ejs templates here (create as needed)
  pages/                 # suggested location for page templates
    index.ejs            # homepage (rendered at /)
    about.ejs            # about page (rendered at /about)
```

## API Overview

Base URL: `/api`

### Auth

- `POST /api/auth/register`
  - Body: `{ name, email, password }`
  - Creates a user; returns created user (without password)

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Verifies credentials, returns `{ token }` and sets cookie `Authorization` (Bearer token in production-safe mode)

- `POST /api/auth/logout`
  - Clears `Authorization` cookie

- `PATCH /api/auth/send-verification-code` (auth required)
  - Sends a 6-digit code to the user’s email and stores it with a 10-minute expiry

- `PATCH /api/auth/verify-verification-code` (auth required)
  - Body: `{ code }`
  - Marks user as `verified` when the code matches and is not expired

### Users (auth required)

- `GET /api/users` → Paginated users
  - Query: `page`, `limit`
- `GET /api/users/:id` → Single user
- `POST /api/users` → Create user (validated like register)
- `PUT /api/users/:id` → Update user
- `DELETE /api/users/:id` → Delete user

## Views (EJS)

EJS is configured in `app.js`:

```js
app.set('view engine', 'ejs');
app.set('views', 'view'); // use the 'view/' directory
```

- Web router at `src/routes/web/index.js`:
  - `/` → `homeController.home` → `res.render('pages/index', { ... })`
  - `/about` → `homeController.about` → `res.render('pages/about', { ... })`

### Create your first page

1) Create a file `view/pages/index.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title><%= title %></title>
</head>
<body>
	<h1><%= message %></h1>
</body>
</html>
```

2) In `src/controllers/homeController.js`:

```js
export const home = (req, res) => {
	return res.render('pages/index', { title: 'Home', message: 'Welcome to EJS Home' });
};
```

## View Helpers (EJS)

Utilities you can use inside your EJS templates (import and pass to views or attach to `res.locals` in middleware):

- `formatDate(date)` → Format date in English (`en-US`)
- `truncate(text, length=50)` → Truncate long text and add `...`
- `stripTags(html)` → Remove all HTML tags
- `asset(path)` → Generate asset URL with simple cache busting `?v=...`
- `isActive(currentPath, linkPath)` → Return `active` if the path matches
- `paginate(currentPage, totalPages)` → Build simple pagination links (HTML)
- `humanFileSize(size)` → Convert bytes to B/KB/MB/GB
- `breadcrumb(paths)` → Create breadcrumb from an array `{url,label}`

Example usage in EJS (assuming helpers available in locals as `h`):

```html
<nav>
	<a href="/" class="<%= h.isActive(path, '/') %>">Home</a>
	<a href="/about" class="<%= h.isActive(path, '/about') %>">About</a>
</nav>
<p><small><%= h.formatDate(Date.now()) %></small></p>
<p><%= h.truncate(longText, 120) %></p>
<div>
	<%- h.paginate(currentPage, totalPages) %>
</div>
```

You can expose helpers to all views via middleware in `app.js`:

```js
import * as h from './src/utils/viewHelpers.js';
app.use((req, res, next) => {
	res.locals.h = h;
	res.locals.path = req.path; // useful for isActive
	return next();
});
```

## Authentication Flow

- On login:
  - Password checked with `bcryptjs`
  - JWT created via `signToken(payload, '2h')`
  - Cookie `Authorization` is set to `Bearer <token>`
    - `httpOnly` and `secure` are enabled in production
- On protected routes:
  - `authMiddleware` extracts token from `Authorization` header or cookie
  - Verifies token using `verifyToken`
  - Attaches decoded payload to `req.user`

## Validation & Error Handling

- Validation middleware (`validate(schema)`) ensures request bodies match Joi schemas and aggregates errors per-field
- Central error handler returns a consistent JSON:

```json
{
  "status": "error",
  "message": "...",
  "stack": null
}
```

- Success helper returns:

```json
{
  "status": "success",
  "message": "...",
  "data": { }
}
```

## Email Delivery

- Configured via Nodemailer transporter using SMTP values from `.env`
- Templates live in `src/templates/emailTemplates.js`
- Use `sendMail({ to, subject, templateName, templateData })`

## CLI (Generators)

The `icmern` CLI provides handy generators and a project initializer.

- Initialize a new project (clean `package.json`):

```bash
npx icmern init my-app
```

- Generators (run inside a project):

```bash
icmern make:controller Posts
icmern make:model User
icmern make:route Users
icmern make:middleware Auth
icmern make:factory User
```

The generators create files in `src/` with sensible naming conventions and placeholder content.

## CORS & Security

- `helmet()` enabled for common security headers
- `cors()` is enabled with default configuration (adjust as needed)
- Cookies are set with production-safe flags

## Pagination

- `getPagination(query, defaultPage)` helper used by `userController.index`
- Returns `{ page, limit, skip }`; response includes `total` and `totalPages`

## Conventions

- RESTful controllers: `index`, `store`, `show`, `update`, `destroy`
- Consistent error objects: `{ statusCode, message }` (thrown and caught by error handler)

## Development Notes

- This template assumes ESM (`"type": "module"`)
- Requires Node.js 18+

## Publish to npm

1. Bump the version (choose one):
   - Patch: `npm version patch`
   - Minor: `npm version minor`
   - Major: `npm version major`
2. Ensure `files` in `package.json` includes all directories you want to publish (e.g. `src/`, `view/`, `server.js`, `app.js`).
3. Test tarball locally:
   - `npm pack`
   - Install in another project: `npm i ../path/to/icmern-<version>.tgz`
4. Login and publish:
   - `npm login`
   - `npm publish` (or `npm publish --access public` for first-time public scoped packages)

## License

ISC © Isam Chajia 