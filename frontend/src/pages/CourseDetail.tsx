import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import type { Course, Review, StudyResource } from '../types';

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [flashcards, setFlashcards] = useState<StudyResource[]>([]);
  const [notes, setNotes] = useState<StudyResource[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
    fetchReviews();
    fetchFlashcards();
    fetchNotes();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      setCourse(response.data);
      setIsSaved(response.data.isSaved);
    } catch (err) {
      console.error('Failed to fetch course', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(`/reviews/courses/${courseId}/reviews`);
      setReviews(response.data.reviews);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  const fetchFlashcards = async () => {
    try {
      const response = await apiClient.get(`/resources/courses/${courseId}/flashcards`);
      setFlashcards(response.data.resources);
    } catch (err) {
      console.error('Failed to fetch flashcards', err);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await apiClient.get(`/resources/courses/${courseId}/notes`);
      setNotes(response.data.resources);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const toggleSave = async () => {
    try {
      if (isSaved) {
        await apiClient.delete(`/courses/${courseId}/save`);
        setIsSaved(false);
      } else {
        await apiClient.post(`/courses/${courseId}/save`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to save course', err);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading course...</div>
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
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-4 py-2 bg-blue-100 text-blue-800 font-bold text-lg rounded">{course.courseCode}</span>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              </div>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <p className="text-sm text-gray-500">{course.department.name}</p>
            </div>

            <button
              onClick={toggleSave}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isSaved ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaved ? '★ Saved' : '☆ Save Course'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{course.averageOverallRating?.toFixed(1) || 'N/A'}</div>
              <div className="text-sm text-gray-600">Overall Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{course.reviewCount || 0}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{course.flashcardsCount || 0}</div>
              <div className="text-sm text-gray-600">Flashcard Sets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{course.notesCount || 0}</div>
              <div className="text-sm text-gray-600">Notes</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <Link
              to={`/courses/${courseId}/review`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-center hover:bg-green-700 transition"
            >
              ✍️ Write a Review
            </Link>
            <Link
              to={`/courses/${courseId}/flashcards`}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition"
            >
              🃏 Create Flashcards
            </Link>
            <Link
              to={`/courses/${courseId}/notes`}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold text-center hover:bg-orange-700 transition"
            >
              📄 Upload Notes
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Flashcard Sets</h2>
            {flashcards.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">No flashcard sets yet</div>
            ) : (
              <div className="space-y-3">
                {flashcards.map((set) => (
                  <div key={set.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{set.title}</h3>
                        <p className="text-sm text-gray-600">by {set.user.name} • {set.flashcardCount} cards</p>
                        <div className="flex gap-3 text-sm text-gray-500 mt-2">
                          <span>↑ {set.upvotes} upvotes</span>
                          <span>👁 {set.usedCount} uses</span>
                        </div>
                      </div>
                      <Link to={`/study/${set.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                        Study
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Notes</h2>
            {notes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">No notes yet</div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{note.title}</h3>
                        <p className="text-sm text-gray-600">by {note.user.name}</p>
                        <div className="flex gap-3 text-sm text-gray-500 mt-2">
                          <span>↑ {note.upvotes} upvotes</span>
                          <span>👁 {note.usedCount} views</span>
                        </div>
                      </div>
                      <Link to={`/notes/${note.id}`} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                        📥 View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">No reviews yet</div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">{review.overallRating}/5</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">Workload: {review.workloadRating}/5</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">Difficulty: {review.difficultyRating}/5</span>
                      </div>
                    </div>
                    <p className="text-gray-900 mb-2">{review.reviewText}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>by {review.user.name}</span>
                      <span>👍 {review.helpfulVotes} helpful</span>
                    </div>
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