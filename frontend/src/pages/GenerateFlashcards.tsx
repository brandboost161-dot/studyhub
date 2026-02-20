import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

export default function GenerateFlashcards() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState('');
  const [courseContext, setCourseContext] = useState('');
  const [examTag, setExamTag] = useState('');
  const [count, setCount] = useState(10);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // For saving
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiClient.get('/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setGeneratedCards([]);

    try {
      const response = await apiClient.post('/ai/generate-flashcards', {
        sourceText,
        courseContext: courseContext || null,
        examTag: examTag || null,
        count,
      });

      setGeneratedCards(response.data.flashcards);
      setTitle(`AI Generated - ${examTag || 'Study Set'}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      setError('Please select a course to save to');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for your flashcard set');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const response = await apiClient.post(`/resources/courses/${selectedCourse}/flashcards`, {
        title,
        examTag: examTag || null,
        flashcards: generatedCards,
      });

      // Navigate to study mode with the new flashcard set
      navigate(`/study/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save flashcards');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">StudyHub</Link>
              <Link to="/ai" className="text-blue-600 hover:underline"> AI Tools</Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"> AI Flashcard Generator</h1>
          <p className="text-gray-600">Paste any text and AI will generate study flashcards instantly!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Input</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Text *</label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={10}
                  placeholder="Paste lecture notes, textbook excerpts, or any study material here... (minimum 100 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                  minLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{sourceText.length} / 100 characters minimum</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Context (Optional)</label>
                <input
                  type="text"
                  value={courseContext}
                  onChange={(e) => setCourseContext(e.target.value)}
                  placeholder="e.g., BIOL 101 - Introduction to Biology"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam/Topic (Optional)</label>
                <input
                  type="text"
                  value={examTag}
                  onChange={(e) => setExamTag(e.target.value)}
                  placeholder="e.g., Midterm 1, Chapter 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Flashcards</label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  min={5}
                  max={50}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Between 5 and 50 cards</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || sourceText.length < 100}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? ' Generating...' : ' Generate Flashcards'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Generated Flashcards</h2>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 animate-bounce"></div>
                <p className="text-gray-600">AI is generating flashcards...</p>
              </div>
            )}

            {!isLoading && generatedCards.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4"></div>
                <p>Your generated flashcards will appear here</p>
              </div>
            )}

            {generatedCards.length > 0 && (
              <div>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                   Generated {generatedCards.length} flashcards!
                </div>

                {/* Save Options */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Name your flashcard set"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Save to Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseCode} - {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !selectedCourse || !title.trim()}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : ' Save & Study Now'}
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {generatedCards.map((card, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">Card {index + 1}</div>
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-blue-600 mb-1">QUESTION</div>
                        <div className="text-sm text-gray-900">{card.front}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-green-600 mb-1">ANSWER</div>
                        <div className="text-sm text-gray-700">{card.back}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}