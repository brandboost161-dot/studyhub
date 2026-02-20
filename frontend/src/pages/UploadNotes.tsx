import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';
import type { Course } from '../types';

export default function UploadNotes() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [examTag, setExamTag] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
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
    if (!files || files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (examTag) formData.append('examTag', examTag);
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      await apiClient.post(`/resources/courses/${courseId}/notes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload notes');
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
            ← Back to {course.courseCode}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-2">Upload Notes</h1>
          <p className="text-gray-600 mb-6">
            {course.courseCode} - {course.title}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lecture 5 Notes, Chapter 3 Summary"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  onChange={(e) => setFiles(e.target.files)}
                  accept=".pdf,.docx,.txt"
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-5xl mb-3">📄</div>
                  <p className="text-gray-700 font-semibold mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOCX, or TXT files (max 10MB each)
                  </p>
                </label>
              </div>
              {files && files.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Selected files ({files.length}):
                  </p>
                  <ul className="space-y-1">
                    {Array.from(files).map((file, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        <span>📎</span>
                        <span>{file.name}</span>
                        <span className="text-gray-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Text will be automatically extracted from PDFs and DOCX files</li>
                <li>• AI can summarize your notes after upload</li>
                <li>• Other students can upvote helpful notes</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Uploading...' : '📤 Upload Notes'}
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