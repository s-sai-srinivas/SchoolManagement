import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          School Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Streamline attendance, fees, homework, and notices
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Register (Admin)
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Attendance</h3>
            <p className="text-sm text-gray-600">Track daily attendance with ease</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Fees</h3>
            <p className="text-sm text-gray-600">Online fee payment via Razorpay</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Homework</h3>
            <p className="text-sm text-gray-600">Post and view homework</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-3">📢</div>
            <h3 className="font-semibold text-gray-900 mb-2">Notices</h3>
            <p className="text-sm text-gray-600">School-wide announcements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
