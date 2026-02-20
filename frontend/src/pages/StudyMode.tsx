import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { StudyResource, Flashcard } from '../types';

export default function StudyMode() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<StudyResource | null>(null);
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>([]);
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [correctCards, setCorrectCards] = useState<Set<number>>(new Set());
  const [wrongCards, setWrongCards] = useState<Set<number>>(new Set());
  const [studyMode, setStudyMode] = useState<'all' | 'wrong'>('all');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [resourceId]);

  const fetchFlashcards = async () => {
    try {
      const response = await apiClient.get(`/resources/${resourceId}`);
      setResource(response.data);
      const cards = response.data.flashcards || [];
      setAllFlashcards(cards);
      setActiveCards(cards);
      
      await apiClient.post(`/resources/${resourceId}/increment-usage`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const markCorrect = () => {
    const globalIndex = allFlashcards.indexOf(activeCards[currentIndex]);
    setCorrectCards(new Set([...correctCards, globalIndex]));
    wrongCards.delete(globalIndex);
    setWrongCards(new Set(wrongCards));
    handleNext();
  };

  const markWrong = () => {
    const globalIndex = allFlashcards.indexOf(activeCards[currentIndex]);
    setWrongCards(new Set([...wrongCards, globalIndex]));
    correctCards.delete(globalIndex);
    setCorrectCards(new Set(correctCards));
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const restartWithWrong = () => {
    const wrongCardsList = allFlashcards.filter((_, idx) => wrongCards.has(idx));
    if (wrongCardsList.length === 0) {
      alert('No wrong cards to study!');
      return;
    }
    setActiveCards(wrongCardsList);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setStudyMode('wrong');
  };

  const restartAll = () => {
    setActiveCards(allFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowSummary(false);
    setCorrectCards(new Set());
    setWrongCards(new Set());
    setStudyMode('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading flashcards...</div>
      </div>
    );
  }

  if (error || !resource || allFlashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'No flashcards found'}</h2>
          <Link to="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentCard = activeCards[currentIndex];
  const progress = ((currentIndex + 1) / activeCards.length) * 100;

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">{resource.title}</h1>
              <Link to="/dashboard" className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">Exit</Link>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold mb-4">Study Session Complete!</h2>
            
            <div className="grid grid-cols-2 gap-6 my-8">
              <div className="p-6 bg-green-50 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-2">{correctCards.size}</div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div className="p-6 bg-red-50 rounded-xl">
                <div className="text-4xl font-bold text-red-600 mb-2">{wrongCards.size}</div>
                <div className="text-gray-600">Need Review</div>
              </div>
            </div>

            <div className="space-y-3">
              {wrongCards.size > 0 && (
                <button
                  onClick={restartWithWrong}
                  className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 transition text-lg"
                >
                  🎯 Study Wrong Cards Only ({wrongCards.size} cards)
                </button>
              )}
              <button
                onClick={restartAll}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition text-lg"
              >
                🔄 Start Over (All {allFlashcards.length} cards)
              </button>
              <Link
                to="/dashboard"
                className="block w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition text-lg"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{resource.title}</h1>
              <p className="text-sm text-gray-600">
                {resource.course.courseCode} - {resource.course.title}
                {studyMode === 'wrong' && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Wrong Cards Only</span>}
              </p>
            </div>
            <Link to="/dashboard" className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg">Exit Study Mode</Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          Card {currentIndex + 1} of {activeCards.length} • ✓ {correctCards.size} correct • ✗ {wrongCards.size} wrong
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div onClick={handleFlip} className="cursor-pointer">
          <div className="relative bg-white rounded-2xl shadow-2xl p-12 min-h-[400px] flex items-center justify-center transition-all duration-300">
            {!isFlipped ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-600 mb-4">QUESTION</p>
                <p className="text-2xl font-medium text-gray-900">{currentCard.front}</p>
                <p className="text-sm text-gray-400 mt-8">Click to flip</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-green-600 mb-4">ANSWER</p>
                <p className="text-xl text-gray-900">{currentCard.back}</p>
                <p className="text-sm text-gray-400 mt-8">Did you get it right?</p>
              </div>
            )}
          </div>
        </div>

        {isFlipped && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={markWrong}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-lg"
            >
              ✗ Wrong
            </button>
            <button
              onClick={markCorrect}
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-lg"
            >
              ✓ Correct
            </button>
          </div>
        )}

        {!isFlipped && (
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold shadow hover:shadow-lg transition disabled:opacity-30"
            >
              ← Previous
            </button>
            <button
              onClick={handleFlip}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              Flip Card
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === activeCards.length - 1}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold shadow hover:shadow-lg transition disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Pro tip: Use arrow keys ← → to navigate, Space to flip</p>
        </div>
      </div>
    </div>
  );
}