import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Course, Module } from '../types';
import { BookOpen, CheckCircle, Circle } from 'lucide-react';

function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseId) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        const { data: modulesData } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (courseData) setCourse(courseData);
        if (modulesData) setModules(modulesData);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading course details...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{course.title}</h2>
        <p className="text-gray-600 mb-6">{course.description}</p>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h3>
          <div className="space-y-4">
            {modules.map((module) => (
              <Link
                key={module.id}
                to={`/modules/${module.id}`}
                className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Circle className="h-5 w-5 text-indigo-600 mr-3" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{module.title}</h4>
                      <p className="text-sm text-gray-500">Module {module.order_index + 1}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    Start Module
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;