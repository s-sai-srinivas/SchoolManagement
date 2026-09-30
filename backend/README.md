# School Management System - Backend

NestJS backend API for School Management System with PostgreSQL and Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Set up database:
```bash
# Make sure PostgreSQL is running
# Update DATABASE_URL in .env

# Initialize Prisma and run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

4. Run the development server:
```bash
npm run start:dev
```

Server will be running at: `http://localhost:3000/api`

## 📁 Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators (@CurrentUser, @Roles, etc.)
│   ├── guards/          # Auth guards (JwtAuthGuard, RolesGuard)
│   ├── filters/         # Exception filters
│   └── interceptors/    # Response interceptors
├── config/              # Configuration modules
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── students/       # Student management
│   ├── attendance/     # Attendance tracking
│   ├── fees/           # Fee management
│   ├── homework/       # Homework module
│   ├── notices/        # Notice board
│   └── notifications/  # Notification system
├── prisma/             # Prisma service
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## 🔧 Available Scripts

```bash
# Development
npm run start:dev       # Start dev server with hot reload

# Build
npm run build           # Build for production

# Production
npm run start:prod      # Run production build

# Database
npx prisma migrate dev  # Create and apply migrations
npx prisma studio       # Open Prisma Studio (DB GUI)
npx prisma generate     # Generate Prisma Client

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run e2e tests
npm run test:cov        # Test coverage
```

## 🗄️ Database

This project uses PostgreSQL with Prisma ORM.

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Prisma Studio

Open a visual database editor:
```bash
npx prisma studio
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables:

- **Database:** `DATABASE_URL`
- **JWT:** `JWT_SECRET`, `JWT_REFRESH_SECRET`
- **AWS S3:** `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
- **Razorpay:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- **Email:** `SENDGRID_API_KEY`, `FROM_EMAIL`
- **CORS:** `FRONTEND_URL`

## 📚 API Documentation

Once the server is running, API documentation is available at:
- Swagger UI: `http://localhost:3000/api/docs` (to be configured)

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (salt rounds: 12)
- Rate limiting on sensitive endpoints
- CORS configuration
- Input validation with class-validator
- SQL injection prevention (Prisma)

## 🏗️ Development Phases

Refer to `BACKEND_API_SPECIFICATION.md` for detailed API specifications and development phases.

## 📝 Next Steps

1. ✅ Project initialized
2. ⏳ Add Prisma schema (see `BACKEND_API_SPECIFICATION.md`)
3. ⏳ Create authentication module
4. ⏳ Implement user management
5. ⏳ Build core features (attendance, fees, homework, notices)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## 📄 License

Private project - All rights reserved
