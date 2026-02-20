import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import type { Course } from '../types';

interface FlashcardInput {
  front: string;
  back: string;
}

export default function CreateFlashcards() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [examTag, setExamTag] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardInput[]>([
    { front: '', back: '' },
    { front: '', back: '' },
    { front: '', back: '' },
  ]);
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

  const addCard = () => {
    setFlashcards([...flashcards, { front: '', back: '' }]);
  };

  const removeCard = (index: number) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const updated = [...flashcards];
    updated[index][field] = value;
    setFlashcards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validCards = flashcards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      setError('Please add at least one complete flashcard');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(`/resources/courses/${courseId}/flashcards`, {
        title,
        examTag: examTag || null,
        flashcards: validCards,
      });

      navigate(`/study/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create flashcards');
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
             Back to {course.courseCode}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Create Flashcard Set</h1>
          <p className="text-gray-600 mb-6">
            {course.courseCode} - {course.title}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flashcard Set Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm 1 Review, Chapter 3 Vocab"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Exam Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam/Topic Tag (Optional)
              </label>
              <input
                type="text"
                value={examTag}
                onChange={(e) => setExamTag(e.target.value)}
                placeholder="e.g., Midterm 1, Final Exam"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Flashcards */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Flashcards ({flashcards.length})
                </label>
                <button
                  type="button"
                  onClick={addCard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                >
                  + Add Card
                </button>
              </div>

              <div className="space-y-4">
                {flashcards.map((card, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Card {index + 1}
                      </span>
                      {flashcards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Question (Front)
                        </label>
                        <input
                          type="text"
                          value={card.front}
                          onChange={(e) => updateCard(index, 'front', e.target.value)}
                          placeholder="What is...?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Answer (Back)
                        </label>
                        <textarea
                          value={card.back}
                          onChange={(e) => updateCard(index, 'back', e.target.value)}
                          placeholder="The answer is..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Flashcard Set'}
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