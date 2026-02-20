import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import type { Course } from '../types';

export default function CreateReview() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [workloadRating, setWorkloadRating] = useState(3);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [overallRating, setOverallRating] = useState(3);
  const [examStyle, setExamStyle] = useState('');
  const [attendanceRequired, setAttendanceRequired] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      setCourse(response.data);
    } catch (err) {
      setError('Failed to load course');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post(`/reviews/courses/${courseId}/reviews`, {
        workloadRating,
        difficultyRating,
        overallRating,
        examStyle: examStyle || null,
        attendanceRequired,
        reviewText,
      });

      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create review');
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              StudyHub
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
            ← Back to {course.courseCode}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Write a Review</h1>
          <p className="text-gray-600 mb-6">
            {course.courseCode} - {course.title}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating
                </label>
                <select
                  value={overallRating}
                  onChange={(e) => setOverallRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} - {['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][n - 1]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workload
                </label>
                <select
                  value={workloadRating}
                  onChange={(e) => setWorkloadRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} - {['Very Light', 'Light', 'Moderate', 'Heavy', 'Very Heavy'][n - 1]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficultyRating}
                  onChange={(e) => setDifficultyRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} - {['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'][n - 1]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Style (Optional)
              </label>
              <input
                type="text"
                value={examStyle}
                onChange={(e) => setExamStyle(e.target.value)}
                placeholder="e.g., Multiple choice midterm, essay final"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attendance */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="attendance"
                checked={attendanceRequired}
                onChange={(e) => setAttendanceRequired(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="attendance" className="ml-2 text-sm text-gray-700">
                Attendance is required
              </label>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                placeholder="Share your experience with this course..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Be honest and helpful! Your review will help other students.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <Link
                to={`/courses/${courseId}`}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}