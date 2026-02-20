import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

export default function GenerateStudyGuide() {
  const { user, logout } = useAuth();
  const [myFlashcards, setMyFlashcards] = useState<any[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [courseContext, setCourseContext] = useState('');
  const [examTag, setExamTag] = useState('');
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyFlashcards();
  }, []);

  const fetchMyFlashcards = async () => {
    try {
      const response = await apiClient.get('/users/resources?type=FLASHCARDS');
      setMyFlashcards(response.data);
    } catch (err) {
      console.error('Failed to fetch flashcards', err);
    }
  };

  const toggleResource = (id: string) => {
    if (selectedResources.includes(id)) {
      setSelectedResources(selectedResources.filter(r => r !== id));
    } else {
      setSelectedResources([...selectedResources, id]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResources.length === 0) {
      setError('Please select at least one flashcard set');
      return;
    }

    setError('');
    setIsLoading(true);
    setStudyGuide(null);

    try {
      const response = await apiClient.post('/ai/generate-study-guide', {
        resourceIds: selectedResources,
        courseContext: courseContext || null,
        examTag: examTag || null,
      });

      setStudyGuide(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate study guide');
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
              <Link to="/ai" className="text-blue-600 hover:underline">? AI Tools</Link>
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
          <h1 className="text-4xl font-bold mb-2">?? AI Study Guide Generator</h1>
          <p className="text-gray-600">Combine your flashcard sets into a comprehensive study guide!</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Select Flashcard Sets</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {myFlashcards.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No flashcard sets found. Create some first!</p>
                ) : (
                  myFlashcards.map((set) => (
                    <label key={set.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(set.id)}
                        onChange={() => toggleResource(set.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-semibold text-gray-900">{set.title}</div>
                        <div className="text-sm text-gray-600">
                          {set.course.courseCode} • {set.flashcardCount} cards
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Context (Optional)</label>
                <input
                  type="text"
                  value={courseContext}
                  onChange={(e) => setCourseContext(e.target.value)}
                  placeholder="e.g., BIOL 101"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Tag (Optional)</label>
                <input
                  type="text"
                  value={examTag}
                  onChange={(e) => setExamTag(e.target.value)}
                  placeholder="e.g., Midterm 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || selectedResources.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '?? Generating...' : '? Generate Study Guide'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Study Guide</h2>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 animate-bounce">??</div>
                <p className="text-gray-600">AI is creating your study guide...</p>
              </div>
            )}

            {!isLoading && !studyGuide && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">??</div>
                <p>Your study guide will appear here</p>
              </div>
            )}

            {studyGuide && (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  ? Study guide generated!
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">{studyGuide.title}</h3>

                {studyGuide.sections?.map((section: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{section.heading}</h4>
                    
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <div className="mb-3">
                        <div className="font-semibold text-gray-700 mb-1">Key Points:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {section.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="text-gray-600">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.definitions && section.definitions.length > 0 && (
                      <div className="mb-3">
                        <div className="font-semibold text-gray-700 mb-1">Definitions:</div>
                        {section.definitions.map((def: any, i: number) => (
                          <div key={i} className="ml-4 mb-2">
                            <span className="font-semibold text-gray-900">{def.term}:</span>{' '}
                            <span className="text-gray-600">{def.definition}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.examples && section.examples.length > 0 && (
                      <div className="mb-3">
                        <div className="font-semibold text-gray-700 mb-1">Examples:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {section.examples.map((ex: string, i: number) => (
                            <li key={i} className="text-gray-600">{ex}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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