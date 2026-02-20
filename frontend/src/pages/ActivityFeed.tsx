import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: string;
  message: string;
  link?: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function ActivityFeed() {
  const { user, logout } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const [myResources, myReviews, savedCourses] = await Promise.all([
        apiClient.get('/users/resources'),
        apiClient.get('/users/reviews'),
        apiClient.get('/courses/saved/list'),
      ]);

      const feed: Activity[] = [];

      myResources.data.forEach((resource: any) => {
        if (resource.upvotes > 0) {
          feed.push({
            id: `resource-${resource.id}`,
            type: 'upvote',
            message: `Your flashcard set "${resource.title}" has ${resource.upvotes} upvotes!`,
            link: `/study/${resource.id}`,
            timestamp: resource.createdAt,
            icon: '',
            color: 'bg-blue-50',
          });
        }
        if (resource.usedCount > 0) {
          feed.push({
            id: `usage-${resource.id}`,
            type: 'usage',
            message: `Your flashcard set "${resource.title}" has been studied ${resource.usedCount} times!`,
            link: `/study/${resource.id}`,
            timestamp: resource.createdAt,
            icon: '',
            color: 'bg-green-50',
          });
        }
      });

      myReviews.data.forEach((review: any) => {
        if (review.helpfulVotes > 0) {
          feed.push({
            id: `review-${review.id}`,
            type: 'helpful',
            message: `${review.helpfulVotes} people found your review of ${review.course?.courseCode} helpful!`,
            link: `/courses/${review.course?.id}`,
            timestamp: review.createdAt,
            icon: '',
            color: 'bg-yellow-50',
          });
        }
      });

      savedCourses.data.forEach((course: any) => {
        if (course.resourceCount && course.resourceCount > 0) {
          feed.push({
            id: `course-${course.id}`,
            type: 'course-update',
            message: `${course.courseCode} has ${course.resourceCount} study resources available!`,
            link: `/courses/${course.id}`,
            timestamp: course.updatedAt || course.createdAt,
            icon: '',
            color: 'bg-purple-50',
          });
        }
      });

      feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(feed.slice(0, 20));
    } catch (err) {
      console.error('Failed to fetch activities', err);
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
              <Link to="/courses" className="text-gray-600 hover:text-gray-900">
                Courses
              </Link>
              <Link to="/analytics" className="text-gray-600 hover:text-gray-900">
                Analytics
              </Link>
              <Link to="/activity" className="text-blue-600 font-semibold">
                Activity
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"> Activity Feed</h1>
          <p className="text-gray-600">
            See what's happening with your content and saved courses
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading activities...</div>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No activity yet!</h2>
            <p className="text-gray-600 mb-6">
              Start creating flashcards and reviews to see activity here
            </p>
            <Link
              to="/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                to={activity.link || '#'}
                className={`block ${activity.color} border border-gray-200 rounded-lg p-6 hover:shadow-lg transition`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-1">{activity.message}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-blue-600 text-sm font-semibold"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}