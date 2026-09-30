# School Management System 🏫

A comprehensive web-based school management system built with **NestJS** (backend) and **Next.js** (frontend). Manage students, attendance, fees, homework, and notices all in one place.

## 🚀 Features

- **👥 User Management** - Admin, Teacher, and Parent roles
- **📚 Student Management** - Track student information and assignments
- **✅ Attendance Tracking** - Daily attendance with reporting
- **💰 Fee Management** - Online fee collection and tracking
- **📝 Homework Management** - Post and track homework assignments
- **📢 Notice Board** - School-wide announcements
- **📊 Reports** - Comprehensive attendance and fee reports

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + Passport.js
- **API Documentation:** RESTful API

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Seed database with test data
npx prisma db seed

# Start development server
npm run start:dev
```

Backend runs on: `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

## 🔑 Test Credentials

```
Admin:
  Email: admin@demo.com
  Password: admin123

Teacher:
  Email: teacher@demo.com
  Password: teacher123

Parent:
  Email: parent@demo.com
  Password: parent123
```

## 📁 Project Structure

```
SchoolManagement/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── students/
│   │   │   ├── attendance/
│   │   │   ├── fees/
│   │   │   ├── homework/
│   │   │   └── notices/
│   │   ├── common/         # Shared utilities
│   │   └── prisma/         # Database client
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── (auth)/       # Login/Register
│   │   └── (dashboard)/  # Role-based dashboards
│   ├── components/        # Reusable components
│   └── lib/              # Utilities and API client
│
└── .gitignore
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - School registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Students
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/:id` - Student attendance
- `GET /api/attendance/report/daily` - Daily report
- `GET /api/attendance/report/monthly` - Monthly report

### Fees
- `GET /api/fees/student/:id/pending` - Pending fees
- `POST /api/fees/create-order` - Create payment order
- `POST /api/fees/manual-entry` - Manual payment entry

### Homework & Notices
- `GET /api/homework` - List homework
- `POST /api/homework` - Create homework
- `GET /api/notices` - List notices
- `POST /api/notices` - Create notice

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/school_management"
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📝 Development

### Backend
```bash
npm run start:dev    # Development mode with hot reload
npm run build        # Production build
npm run start:prod   # Production mode
```

### Frontend
```bash
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production mode
```

## 🧪 Testing

```bash
# Backend
cd backend
npm run test         # Unit tests

# Frontend  
cd frontend
npm run test:e2e     # E2E tests with Playwright
```

## 📊 Database Schema

Key models:
- **School** - School information
- **User** - Admin, Teacher, Parent users
- **Student** - Student records
- **Attendance** - Daily attendance tracking
- **FeePayment** - Fee transaction records
- **Homework** - Homework assignments
- **Notice** - School announcements
- **Notification** - In-app notifications

## 🎯 Roadmap

- [ ] Razorpay payment integration
- [ ] S3 file upload for homework images
- [ ] PDF receipt generation
- [ ] Email notifications (SendGrid)
- [ ] Real-time updates (WebSockets)
- [ ] Bulk student import (CSV)
- [ ] Mobile app (React Native)

## 📄 License

Private - All Rights Reserved

## 👨‍💻 Author

Sai Srinivas Salluri

---

**Status:** In Development (75% Complete)  
**Last Updated:** December 2, 2025
