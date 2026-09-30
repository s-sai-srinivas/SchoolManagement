# School Management System - Frontend

Next.js 14 frontend for the School Management System with authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local if backend URL is different
```

3. Run development server:
```bash
npm run dev
```

Frontend will be running at: `http://localhost:3001`

## 📁 Project Structure

```
app/
├── (auth)/
│   ├── login/          # Login page
│   └── register/       # User registration (admin only)
├── dashboard/          # Protected dashboard
├── page.tsx            # Home page
└── layout.tsx          # Root layout

lib/
├── api/
│   ├── client.ts       # Axios client with interceptors
│   └── auth.ts         # Auth API functions
└── store/
    └── auth.ts         # Zustand auth store

components/
└── ui/                 # Reusable UI components
```

## 🔐 Authentication Flow

### Login
1. User enters email, password, and role
2. Frontend calls `POST /api/auth/login`
3. Backend returns access token (15 min) and refresh token (7 days)
4. Tokens stored in cookies
5. User redirected to dashboard

### Token Refresh
- Automatic refresh when access token expires
- Axios interceptor handles refresh seamlessly
- If refresh fails, user redirected to login

### Logout
- Calls `POST /api/auth/logout` to revoke refresh token
- Clears all cookies
- Redirects to login page

## 📡 API Integration

### Base URL
- Development: `http://localhost:3000/api`
- Configure in `.env.local`

### Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - Create user (admin only)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

## 🎨 Pages

### Home (`/`)
- Landing page with feature showcase
- Links to login and register

### Login (`/login`)
- Email and password authentication
- Role selection (ADMIN, TEACHER, PARENT)
- Error handling and loading states
- Rate limited: 5 attempts per 15 minutes

### Register (`/register`)
- Admin-only user creation
- Displays temporary password
- Form validation
- Success/error messages

### Dashboard (`/dashboard`)
- Protected route (requires authentication)
- User information display
- Role-specific content:
  - **Parents:** View children list
  - **Teachers:** View class assignments
  - **Admins:** Full access
- Logout functionality

## 🔒 Security Features

### Token Management
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Stored in HTTP-only cookies (via js-cookie)
- Automatic refresh on expiry

### Protected Routes
- Dashboard requires authentication
- Automatic redirect to login if not authenticated
- Token validation on page load

### Error Handling
- API errors displayed to user
- Network errors handled gracefully
- Automatic retry on token refresh failure

## 🛠️ Technologies

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Cookie Management:** js-cookie

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3001)

# Build
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🎯 Next Steps

1. **Attendance Module**
   - Mark attendance page (teachers)
   - View attendance page (parents)
   - Attendance reports (admin)

2. **Fees Module**
   - View pending fees (parents)
   - Pay fees via Razorpay
   - Fee reports (admin)

3. **Homework Module**
   - Post homework (teachers)
   - View homework (parents)
   - Image upload to S3

4. **Notices Module**
   - Post notices (admin)
   - View notices (all users)

## 🔗 Backend Connection

Ensure backend is running:
```bash
cd ../backend
npm run start:dev
```

Backend should be accessible at: `http://localhost:3000/api`

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured for `http://localhost:3001`
- Check `FRONTEND_URL` in backend `.env`

### Authentication Errors
- Check backend is running
- Verify API URL in `.env.local`
- Clear cookies and try again

### Token Refresh Issues
- Check refresh token in cookies
- Verify backend `/auth/refresh` endpoint
- Check token expiry times

---

**Frontend is ready for authentication!** 🎉

Next: Implement feature modules (Attendance, Fees, Homework, Notices)
