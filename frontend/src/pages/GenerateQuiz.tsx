import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

export default function GenerateQuiz() {
  const { user, logout } = useAuth();
  const [myFlashcards, setMyFlashcards] = useState<any[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quiz, setQuiz] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
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
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const response = await apiClient.post('/ai/generate-quiz', {
        resourceIds: selectedResources,
        questionCount,
        difficulty,
        questionTypes: ['multiple_choice'],
      });

      setQuiz(response.data.quiz);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers({...userAnswers, [questionIndex]: answer});
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (userAnswers[idx] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const submitQuiz = () => {
    setShowResults(true);
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
          <h1 className="text-4xl font-bold mb-2"> AI Quiz Generator</h1>
          <p className="text-gray-600">Test your knowledge with AI-generated practice quizzes!</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {myFlashcards.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No flashcard sets found</p>
                ) : (
                  myFlashcards.map((set) => (
                    <label key={set.id} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(set.id)}
                        onChange={() => toggleResource(set.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="ml-2 text-sm">
                        <div className="font-semibold">{set.title}</div>
                        <div className="text-gray-600">{set.course.courseCode}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Questions</label>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  min={5}
                  max={50}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || selectedResources.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? ' Generating...' : ' Generate Quiz'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Quiz</h2>
            
            {isLoading && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 animate-bounce"></div>
                <p className="text-gray-600">Creating your quiz...</p>
              </div>
            )}

            {!isLoading && !quiz && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4"></div>
                <p>Your quiz will appear here</p>
              </div>
            )}

            {quiz && (
              <div className="space-y-6">
                {showResults && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900 mb-2">
                      Score: {calculateScore()} / {quiz.questions.length}
                    </div>
                    <div className="text-blue-700">
                      {Math.round((calculateScore() / quiz.questions.length) * 100)}% correct
                    </div>
                  </div>
                )}

                {quiz.questions.map((q: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-3">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((option: string) => {
                        const optionLetter = option.charAt(0);
                        const isSelected = userAnswers[idx] === optionLetter;
                        const isCorrect = q.correctAnswer === optionLetter;
                        
                        let bgColor = 'bg-white hover:bg-gray-50';
                        if (showResults) {
                          if (isCorrect) bgColor = 'bg-green-100';
                          else if (isSelected && !isCorrect) bgColor = 'bg-red-100';
                        } else if (isSelected) {
                          bgColor = 'bg-blue-100';
                        }

                        return (
                          <button
                            key={option}
                            onClick={() => !showResults && handleAnswerSelect(idx, optionLetter)}
                            disabled={showResults}
                            className={`w-full text-left p-3 border rounded-lg transition ${bgColor}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {showResults && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <div className="font-semibold text-gray-700 mb-1">Explanation:</div>
                        <div className="text-gray-600">{q.explanation}</div>
                      </div>
                    )}
                  </div>
                ))}

                {!showResults && (
                  <button
                    onClick={submitQuiz}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}