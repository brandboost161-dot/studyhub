import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function AIHub() {
  const { user, logout } = useAuth();

  const features = [
    {
      title: 'Generate Flashcards',
      description: 'Turn any text into study flashcards instantly with AI',
      icon: '',
      link: '/ai/generate-flashcards',
      color: 'from-blue-50 to-indigo-50',
    },
    {
      title: 'Create Study Guide',
      description: 'Combine flashcard sets into a comprehensive study guide',
      icon: '',
      link: '/ai/study-guide',
      color: 'from-purple-50 to-pink-50',
    },
    {
      title: 'Practice Quiz',
      description: 'Generate quiz questions to test your knowledge',
      icon: '',
      link: '/ai/quiz',
      color: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Summarize Notes',
      description: 'Get concise summaries of your uploaded notes',
      icon: '',
      link: '/ai/summarize',
      color: 'from-orange-50 to-red-50',
    },
  ];

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
              <Link to="/ai" className="text-blue-600 font-semibold">
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Study Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Supercharge your studying with free AI tools. Generate flashcards, create study guides, and more!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => (
            <Link
              key={feature.link}
              to={feature.link}
              className={`bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-200`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
              <div className="mt-4 text-blue-600 font-semibold">
                Try it now 
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-4"> Powered by Groq AI</h2>
          <p className="text-gray-600 mb-4">
            All AI features are completely free and powered by Groq's lightning-fast Llama 3.3 70B model.
            Generate unlimited flashcards, study guides, and quizzes at no cost!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">FREE</div>
              <div className="text-sm text-gray-600">Completely Free</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1"></div>
              <div className="text-sm text-gray-600">Lightning Fast</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1"></div>
              <div className="text-sm text-gray-600">Unlimited Use</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}