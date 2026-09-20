# Antonio Riyanto Portfolio CMS

A fully featured, production-ready full-stack application built with React, Express, and PostgreSQL (Drizzle ORM).

## Features
- **Public Portfolio**: Fast, responsive, accessible, and SEO-friendly.
- **Admin Portal**: Secure CMS for managing projects, skills, experiences, etc.
- **PostgreSQL Database**: Single source of truth via Drizzle ORM.
- **Supabase Storage**: Permanent object storage for media and CVs.
- **Authentication**: Secure bcrypt hashed passwords, CSRF protection, secure cookies.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` and fill in the values:
   ```env
   NODE_ENV=development
   PORT=3000
   PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio
   SESSION_SECRET=your_super_secret_session_key_here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ADMIN_BOOTSTRAP_EMAIL=admin@example.com
   ADMIN_BOOTSTRAP_PASSWORD=SuperSecretPassword123!
   ```

3. **Database Setup (Supabase / Postgres)**
   - Run Drizzle migrations to generate your schema:
     ```bash
     npm run db:generate
     npm run db:migrate
     ```
   - Import legacy JSON data (optional):
     ```bash
     npm run db:import-legacy
     ```
   - Bootstrap the first admin user:
     ```bash
     npm run admin:bootstrap
     ```

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment (Cloud Run)

1. Build the Docker image:
   ```bash
   docker build -t portfolio-cms .
   ```
2. Push to Google Container Registry or Artifact Registry.
3. Deploy to Cloud Run, ensuring you set the environment variables via Secret Manager.
4. Run migrations on a secure baston host or CI/CD pipeline, do NOT run them concurrently in Cloud Run instances.

## Testing
Run all verifications:
```bash
npm run verify
```
