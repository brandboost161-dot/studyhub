import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📚</span>
              <span className="text-2xl font-bold text-gray-900">StudyHub</span>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-2 text-gray-700 hover:text-gray-900 font-semibold">Sign In</Link>
              <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Study Smarter with
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI-Powered Tools</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of students sharing flashcards, reviews, and study resources. Generate AI flashcards instantly. Track your progress. Ace your exams.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
              Start Studying Free →
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white text-gray-700 text-lg rounded-xl font-semibold hover:bg-gray-50 transition border-2 border-gray-200">
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold mb-3">AI Flashcard Generator</h3>
            <p className="text-gray-600">Paste any text and AI creates study flashcards instantly. Powered by free Groq AI.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-3">Track Your Progress</h3>
            <p className="text-gray-600">Monitor your study streak, see your rank, and get detailed analytics on your performance.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-bold mb-3">Community Driven</h3>
            <p className="text-gray-600">Share flashcards, read course reviews, and learn from thousands of students at your school.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-white mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Why Students Love StudyHub</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Free Forever</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">⚡</div>
              <div className="text-blue-100">AI-Powered</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">🎓</div>
              <div className="text-blue-100">Student Made</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">🔒</div>
              <div className="text-blue-100">School Verified</div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Everything You Need to Succeed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '🃏', title: 'Interactive Flashcards', desc: 'Flip cards, track progress, study wrong cards only' },
              { icon: '📚', title: 'AI Study Guides', desc: 'Generate comprehensive study guides from flashcards' },
              { icon: '❓', title: 'Practice Quizzes', desc: 'AI-generated quizzes to test your knowledge' },
              { icon: '⭐', title: 'Course Reviews', desc: 'Read honest reviews from real students' },
              { icon: '🔥', title: 'Study Streaks', desc: 'Track your consistency and stay motivated' },
              { icon: '🏆', title: 'Leaderboards', desc: 'See your rank and compete with classmates' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
                <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h4 className="text-xl font-bold mb-1">{feature.title}</h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Study Smarter?</h2>
          <p className="text-xl text-gray-600 mb-8">Join with your .edu email and start using AI-powered study tools today.</p>
          <Link to="/register" className="inline-block px-12 py-4 bg-blue-600 text-white text-xl rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-2xl">
            Create Free Account →
          </Link>
          <p className="text-sm text-gray-500 mt-4">No credit card required. 100% free forever.</p>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">📚</span>
            <span className="text-2xl font-bold">StudyHub</span>
          </div>
          <p className="text-gray-400 mb-4">The AI-powered study platform built by students, for students.</p>
          <p className="text-gray-500 text-sm">© 2026 StudyHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}