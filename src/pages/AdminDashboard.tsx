import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Course } from '../types';
import { Users, BookOpen, Award, BarChart } from 'lucide-react';

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) {
        setUsers(usersData);
        setStats({
          totalStudents: usersData.filter(u => u.role === 'student').length,
          totalInstructors: usersData.filter(u => u.role === 'instructor').length,
          totalCourses: coursesData?.length || 0,
          activeUsers: usersData.length, // This could be refined based on actual activity
        });
      }
      if (coursesData) setCourses(coursesData);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <Users className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <Award className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Total Instructors</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalInstructors}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <BookOpen className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalCourses}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <BarChart className="h-8 w-8 text-orange-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.activeUsers}</p>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 5).map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-sem <boltAction type="file" filePath="src/pages/AdminDashboard.tsx">ified rounded-full ${
                      user.role === 'student'
                        ? 'bg-green-100 text-green-800'
                        : user.role === 'instructor'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 6).map((course) => (
            <div key={course.id} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="text-sm text-gray-500">
                Added {new Date(course.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;