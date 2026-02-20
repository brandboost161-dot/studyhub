import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

export default function ViewNotes() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { user, logout } = useAuth();
  const [resource, setResource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [resourceId]);

  const fetchNotes = async () => {
    try {
      const response = await apiClient.get(`/resources/${resourceId}`);
      setResource(response.data);
      await apiClient.post(`/resources/${resourceId}/increment-usage`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading notes...</div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Notes not found'}</h2>
          <Link to="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">StudyHub</Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/courses/${resource.course.id}`} className="text-blue-600 hover:underline">
            ← Back to {resource.course.courseCode}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{resource.course.courseCode} - {resource.course.title}</span>
              <span>•</span>
              <span>by {resource.user.name}</span>
              {resource.examTag && (
                <>
                  <span>•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{resource.examTag}</span>
                </>
              )}
            </div>
            <div className="flex gap-4 text-sm text-gray-500 mt-3">
              <span>↑ {resource.upvotes} upvotes</span>
              <span>👁 {resource.usedCount} views</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Notes Content</h2>
            {resource.extractedText && resource.extractedText.trim() !== '' ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed bg-gray-50 p-6 rounded-lg">
                  {resource.extractedText}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-600">No text content available.</p>
                <p className="text-sm text-gray-500 mt-2">
                  The uploaded files may be images or the text extraction didn't work.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}