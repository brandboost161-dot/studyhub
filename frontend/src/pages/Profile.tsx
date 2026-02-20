import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

export default function Profile() {
  const { user, logout } = useAuth();
  const [myFlashcards, setMyFlashcards] = useState<any[]>([]);
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [flashcards, notes, reviews, analytics] = await Promise.all([
        apiClient.get('/users/resources?type=FLASHCARDS'),
        apiClient.get('/users/resources?type=NOTES'),
        apiClient.get('/users/reviews'),
        apiClient.get('/analytics/study-stats'),
      ]);

      setMyFlashcards(flashcards.data);
      setMyNotes(notes.data);
      setMyReviews(reviews.data);
      setStats(analytics.data);
    } catch (err) {
      console.error('Failed to fetch profile data', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
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
              <Link to="/profile" className="text-blue-600 font-semibold">Profile</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h1>
              <p className="text-gray-600 mb-3">{user?.email}</p>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                  {user?.school.name}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                  🏆 {user?.reputationScore} reputation
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{myFlashcards.length}</div>
            <div className="text-sm text-gray-600">Flashcard Sets</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{myNotes.length}</div>
            <div className="text-sm text-gray-600">Notes Uploaded</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">{myReviews.length}</div>
            <div className="text-sm text-gray-600">Reviews Written</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats?.totalFlashcardsCreated || 0}
            </div>
            <div className="text-sm text-gray-600">Total Flashcards</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">My Flashcard Sets</h2>
            {myFlashcards.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                No flashcard sets yet
              </div>
            ) : (
              <div className="space-y-3">
                {myFlashcards.map((set) => (
                  <div key={set.id} className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold text-gray-900">{set.title}</h3>
                    <p className="text-sm text-gray-600">{set.course.courseCode} • {set.flashcardCount} cards</p>
                    <div className="flex gap-3 text-sm text-gray-500 mt-2">
                      <span>↑ {set.upvotes}</span>
                      <span>👁 {set.usedCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">My Notes</h2>
            {myNotes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                No notes uploaded yet
              </div>
            ) : (
              <div className="space-y-3">
                {myNotes.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold text-gray-900">{note.title}</h3>
                    <p className="text-sm text-gray-600">{note.course.courseCode}</p>
                    <div className="flex gap-3 text-sm text-gray-500 mt-2">
                      <span>↑ {note.upvotes}</span>
                      <span>👁 {note.usedCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">My Reviews</h2>
            {myReviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                No reviews written yet
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow p-4">
                    <Link to={`/courses/${review.course?.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {review.course?.courseCode}
                    </Link>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{review.overallRating}/5</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">👍 {review.helpfulVotes} helpful</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}