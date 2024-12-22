import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import type { Course, UserProgress } from '../types';
import { BookOpen, Award, Clock } from 'lucide-react';

function Dashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (coursesData) setCourses(coursesData);
        if (progressData) setProgress(progressData);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.full_name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <BookOpen className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Enrolled Courses</h3>
            <p className="text-3xl font-bold text-indigo-600">{courses.length}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <Award className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Completed Modules</h3>
            <p className="text-3xl font-bold text-green-600">
              {progress.filter(p => p.completed).length}
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {progress.filter(p => !p.completed).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 6).map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="block bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
              <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;