import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

interface SearchResults {
  courses: any[];
  flashcards: any[];
  reviews: any[];
}

export default function Search() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'flashcards' | 'reviews'>('all');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setIsLoading(true);

    try {
      const [coursesRes, flashcardsRes] = await Promise.all([
        apiClient.get(`/courses?search=${query}`),
        apiClient.get(`/resources/search?query=${query}`).catch(() => ({ data: { resources: [] } })),
      ]);

      setResults({
        courses: coursesRes.data.courses || [],
        flashcards: flashcardsRes.data?.resources || [],
        reviews: [],
      });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalResults = results
    ? results.courses.length + results.flashcards.length + results.reviews.length
    : 0;

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
              <Link to="/ai" className="text-gray-600 hover:text-gray-900">
                AI Tools
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6"> Search Everything</h1>
          <form onSubmit={handleSearch}>
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, flashcards, reviews..."
                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || query.trim().length < 2}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {results && (
          <div>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-semibold ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 font-semibold ${
                  activeTab === 'courses'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Courses ({results.courses.length})
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-4 py-2 font-semibold ${
                  activeTab === 'flashcards'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Flashcards ({results.flashcards.length})
              </button>
            </div>

            {/* No Results */}
            {totalResults === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-5xl mb-4"></div>
                <p className="text-gray-600">No results found for "{query}"</p>
              </div>
            )}

            {/* Courses */}
            {(activeTab === 'all' || activeTab === 'courses') && results.courses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Courses</h2>
                <div className="space-y-3">
                  {results.courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                          {course.courseCode}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span> {course.averageOverallRating?.toFixed(1) || 'N/A'}</span>
                        <span> {course.reviewCount} reviews</span>
                        <span> {course.resourceCount} resources</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Flashcards */}
            {(activeTab === 'all' || activeTab === 'flashcards') && results.flashcards.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Flashcard Sets</h2>
                <div className="space-y-3">
                  {results.flashcards.map((set) => (
                    <div key={set.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{set.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {set.course?.courseCode} - {set.course?.title}
                          </p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>by {set.user?.name}</span>
                            <span> {set.flashcardCount} cards</span>
                            <span> {set.upvotes} upvotes</span>
                          </div>
                        </div>
                        <Link
                          to={`/study/${set.id}`}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                          Study
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}