import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

export default function SummarizeNotes() {
  const { user, logout } = useAuth();
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [length, setLength] = useState<'brief' | 'moderate' | 'detailed'>('moderate');
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const response = await apiClient.get('/users/resources?type=NOTES');
      setMyNotes(response.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) {
      setError('Please select a notes resource');
      return;
    }

    setError('');
    setIsLoading(true);
    setSummary(null);

    try {
      const response = await apiClient.post(`/ai/resources/${selectedResource}/summarize`, {
        length,
      });

      setSummary(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to summarize notes');
    } finally {
      setIsLoading(false);
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"> AI Notes Summarizer</h1>
          <p className="text-gray-600">Get concise summaries of your uploaded notes!</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Select Notes</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a notes resource
                </label>
                {myNotes.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No notes resources found. Upload some notes first!
                  </p>
                ) : (
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select notes...</option>
                    {myNotes.map((notes) => (
                      <option key={notes.id} value={notes.id}>
                        {notes.title} ({notes.course.courseCode}) - {notes.fileCount} files
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="brief">Brief (2-3 paragraphs)</option>
                  <option value="moderate">Moderate (4-6 paragraphs)</option>
                  <option value="detailed">Detailed (8-12 paragraphs)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedResource}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? ' Summarizing...' : ' Generate Summary'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 animate-bounce"></div>
                <p className="text-gray-600">AI is summarizing your notes...</p>
              </div>
            )}

            {!isLoading && !summary && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4"></div>
                <p>Your summary will appear here</p>
              </div>
            )}

            {summary && (
              <div>
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                   Summary generated! ({summary.compressionRatio}% of original length)
                </div>
                
                <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Original</div>
                    <div className="font-bold text-gray-900">{summary.originalLength.toLocaleString()} chars</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600">Summary</div>
                    <div className="font-bold text-gray-900">{summary.summaryLength.toLocaleString()} chars</div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {summary.summary}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}