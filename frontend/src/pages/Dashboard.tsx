import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import type { Course, StudyResource, Review } from '../types';

interface DashboardData {
  savedCourses: Course[];
  myFlashcards: StudyResource[];
  myReviews: Review[];
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  rank: {
    rank: number;
    reputation: number;
  };
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [savedCourses, myFlashcards, myReviews, streak, rank] = await Promise.all([
        apiClient.get('/courses/saved/list'),
        apiClient.get('/users/resources?type=FLASHCARDS'),
        apiClient.get('/users/reviews'),
        apiClient.get('/analytics/streak'),
        apiClient.get('/analytics/rank'),
      ]);

      setData({
        savedCourses: savedCourses.data,
        myFlashcards: myFlashcards.data,
        myReviews: myReviews.data,
        streak: streak.data,
        rank: rank.data,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">StudyHub</Link>
              <Link to="/courses" className="text-gray-600 hover:text-gray-900">Courses</Link>
              <Link to="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
              <Link to="/ai" className="text-gray-600 hover:text-gray-900">AI Tools</Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}! </h1>
          <p className="text-gray-600">{user?.school.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Study Streak</h3>
              <span className="text-3xl"></span>
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-1">{data?.streak.currentStreak || 0} days</div>
            <p className="text-sm text-gray-600">Longest: {data?.streak.longestStreak || 0} days</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Your Rank</h3>
              <span className="text-3xl"></span>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-1">#{data?.rank.rank || 0}</div>
            <p className="text-sm text-gray-600">{data?.rank.reputation || 0} reputation points</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Email Status</h3>
              <span className="text-3xl"></span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{user?.emailVerified ? 'Verified ' : 'Not Verified'}</div>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Flashcard Sets</h2>
              <Link to="/courses" className="text-blue-600 hover:underline text-sm">Create New </Link>
            </div>
            <div className="p-6">
              {data?.myFlashcards && data.myFlashcards.length > 0 ? (
                <div className="space-y-3">
                  {data.myFlashcards.slice(0, 5).map((set) => (
                    <div key={set.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{set.title}</h3>
                          <p className="text-sm text-gray-600">{set.course.courseCode}  {set.flashcardCount} cards</p>
                          <div className="flex gap-3 text-sm text-gray-500 mt-1">
                            <span> {set.upvotes}</span>
                            <span> {set.usedCount}</span>
                          </div>
                        </div>
                        <Link to={`/study/${set.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Study</Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">You haven't created any flashcard sets yet</p>
                  <Link to="/courses" className="text-blue-600 hover:underline font-semibold">Browse courses and create your first set </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Saved Courses</h2>
              <Link to="/courses" className="text-blue-600 hover:underline text-sm">Browse All </Link>
            </div>
            <div className="p-6">
              {data?.savedCourses && data.savedCourses.length > 0 ? (
                <div className="space-y-3">
                  {data.savedCourses.slice(0, 5).map((course) => (
                    <Link key={course.id} to={`/courses/${course.id}`} className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">{course.courseCode}</span>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span> {course.averageOverallRating?.toFixed(1) || 'N/A'}</span>
                        <span> {course.reviewCount} reviews</span>
                        <span> {course.resourceCount} resources</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">You haven't saved any courses yet</p>
                  <Link to="/courses" className="text-blue-600 hover:underline font-semibold">Browse courses and save your favorites </Link>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">My Reviews</h2>
            </div>
            <div className="p-6">
              {data?.myReviews && data.myReviews.length > 0 ? (
                <div className="space-y-3">
                  {data.myReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link to={`/courses/${review.course?.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                            {review.course?.courseCode} - {review.course?.title}
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">{review.overallRating}/5</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{review.reviewText}</p>
                      <p className="text-sm text-gray-500"> {review.helpfulVotes} people found this helpful</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">You haven't written any reviews yet</p>
                  <Link to="/courses" className="text-blue-600 hover:underline font-semibold">Browse courses and share your experience </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}