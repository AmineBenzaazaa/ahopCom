# ahopCom

A CRM web application for real-estate style workflows: leads, contacts, properties, accounts, opportunities, quotes, invoices, tasks, meetings, calls, emails and payments, with role-based access and admin-defined custom fields/modules.

The repository contains a React front end (`Client/`) and an Express + MongoDB API (`Server/`).

## Features (from the code)

- Authentication with JWT and role-based access control (roles, per-module permissions)
- CRUD, import (CSV/Excel) and advanced search for leads, contacts, properties, accounts, opportunities, quotes and invoices
- Custom fields and dynamically created modules (Mongoose schemas built at runtime)
- Tasks, meetings, calendar view, phone calls, text messages, email history and email templates (drag-and-drop email editor)
- Documents / file uploads (Multer)
- Stripe payment listing
- Reports and dashboard charts (ApexCharts)
- PDF generation for quotes/invoices

## Tech stack

**Client:** React 17 (Create React App), Chakra UI, Redux Toolkit + redux-persist, React Router 6, Formik + Yup, Axios, FullCalendar, ApexCharts, react-table, react-email-editor, @react-pdf/renderer, Stripe.js, PapaParse / xlsx / exceljs

**Server:** Node.js, Express, Mongoose (MongoDB), jsonwebtoken, bcrypt, Multer, Nodemailer, Stripe, dotenv, nodemon

**Local database:** `docker-compose.yml` with a MongoDB 6 container (host port 27018)

## Project structure

```
Client/
  src/
    components/   shared UI (tables, modals, charts, file upload, navbar...)
    layouts/      admin, user and auth layouts
    redux/        store and slices per module
    schema/       Yup validation schemas
    services/     API helpers (axios)
    theme/        Chakra UI theme
    views/        pages (admin/*, auth/signIn)
    routes.js     app routes
Server/
  controllers/    one folder per module (routes + controller), mounted under /api
  db/             MongoDB connection, default modules and fields
  middelwares/    auth (JWT) and mail helpers
  model/schema/   Mongoose models
  index.js        Express entry point
docker-compose.yml
```

## Getting started

Prerequisites: Node.js and npm, and MongoDB (local install or Docker).

1. Start MongoDB (optional, via Docker):

   ```bash
   docker compose up -d
   ```

2. Run the API:

   ```bash
   cd Server
   npm install
   # create Server/.env (see below)
   npm start          # nodemon index.js, listens on PORT (default 5001)
   ```

   On first start the server creates the default Leads/Contacts/Properties modules and a seed super-admin user (see `Server/db/config.js`). Change that password after the first login.

3. Run the client:

   ```bash
   cd Client
   npm install
   npm start          # react-scripts start
   ```

   Note: `Client/src/services/api.js` currently calls `http://localhost:5001/` directly.

Other client scripts: `npm run build`, `npm test`.

## Environment variables

Server (`Server/.env`):

- `MONGO_URI` - MongoDB connection string
- `DB` - database name (also used by docker-compose)
- `DB_HOST`, `DB_PORT` - used in the connection log message
- `PORT` - API port (default 5001)
- `CORS_ORIGIN` - allowed origin (default `*`)
- `JWT_SECRET` - secret for signing tokens
- `DEFAULT_USERS` - usernames treated as protected default users
- `STRIPE_PRIVATE_KEY` - Stripe secret key
- `user`, `pass` - SMTP (Office 365) credentials for outgoing mail

Client (`Client/.env`):

- `REACT_APP_BASE_URL` - API base URL
