import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  BookOpen, 
  Layout as LayoutIcon, 
  LogOut, 
  Settings,
  Users,
  Award
} from 'lucide-react';

function Layout() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                to="/dashboard" 
                className="flex items-center px-4 text-gray-900 font-semibold"
              >
                <BookOpen className="h-6 w-6 mr-2" />
                Engineering LMS
              </Link>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  <LayoutIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Courses
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;