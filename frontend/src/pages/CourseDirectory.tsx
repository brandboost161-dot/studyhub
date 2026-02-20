import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import type { Course } from '../types';

interface Department {
  id: string;
  name: string;
  courseCount: number;
}

export default function CourseDirectory() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get('/courses/departments/list');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDept) params.append('departmentId', selectedDept);

      const response = await apiClient.get(`/courses?${params}`);
      setCourses(response.data.courses);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                StudyHub
              </Link>
              <Link to="/courses" className="text-blue-600 font-semibold">
                Courses
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Directory
          </h1>
          <p className="text-gray-600">
            Browse courses at {user?.school.name}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course code or title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.courseCount})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading courses...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                        {course.courseCode}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{course.description}</p>
                    <p className="text-sm text-gray-500">
                      {course.department.name}
                    </p>
                  </div>

                  <div className="text-right ml-6">
                    {course.averageOverallRating ? (
                      <div className="mb-2">
                        <div className="text-3xl font-bold text-blue-600">
                          {course.averageOverallRating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.reviewCount} reviews
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm mb-2">
                        No reviews yet
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      {course.resourceCount} resources
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}