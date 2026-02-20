import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../lib/auth';

interface AnalyticsData {
  studyStats: {
    totalFlashcardsCreated: number;
    totalFlashcardSets: number;
    estimatedStudyHours: number;
    totalResourcesUsed: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastStudied: string | null;
    totalStudyDays: number;
  };
  rank: {
    rank: number;
    totalUsers: number;
    percentile: number;
    reputation: number;
  };
  leaderboard: Array<{
    rank: number;
    name: string;
    reputation: number;
    totalContributions: number;
  }>;
}

export default function Analytics() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [stats, streak, rank, leaderboard] = await Promise.all([
        apiClient.get('/analytics/study-stats'),
        apiClient.get('/analytics/streak'),
        apiClient.get('/analytics/rank'),
        apiClient.get('/analytics/leaderboard'),
      ]);

      setData({
        studyStats: stats.data,
        streak: streak.data,
        rank: rank.data,
        leaderboard: leaderboard.data,
      });
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

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
              <Link to="/analytics" className="text-blue-600 font-semibold">
                Analytics
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Analytics</h1>

        {/* Study Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {data?.studyStats.totalFlashcardSets || 0}
            </div>
            <div className="text-sm text-gray-600">Flashcard Sets Created</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {data?.studyStats.totalFlashcardsCreated || 0}
            </div>
            <div className="text-sm text-gray-600">Total Flashcards</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {data?.studyStats.estimatedStudyHours?.toFixed(1) || 0}h
            </div>
            <div className="text-sm text-gray-600">Est. Study Time</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {data?.studyStats.totalResourcesUsed || 0}
            </div>
            <div className="text-sm text-gray-600">Resources Used</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Study Streak */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4"> Study Streak</h2>
            <div className="space-y-4">
              <div>
                <div className="text-5xl font-bold text-orange-600 mb-1">
                  {data?.streak.currentStreak || 0} days
                </div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="font-semibold text-gray-900">
                    {data?.streak.longestStreak || 0} days
                  </div>
                  <div className="text-gray-600">Longest Streak</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {data?.streak.totalStudyDays || 0} days
                  </div>
                  <div className="text-gray-600">Total Study Days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rank */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4"> Your Rank</h2>
            <div className="space-y-4">
              <div>
                <div className="text-5xl font-bold text-blue-600 mb-1">
                  #{data?.rank.rank || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Out of {data?.rank.totalUsers || 0} students
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="font-semibold text-gray-900">
                    Top {data?.rank.percentile || 0}%
                  </div>
                  <div className="text-gray-600">Percentile</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {data?.rank.reputation || 0} pts
                  </div>
                  <div className="text-gray-600">Reputation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold"> School Leaderboard</h2>
          </div>
          <div className="divide-y">
            {data?.leaderboard.map((user) => (
              <div key={user.rank} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    user.rank === 1 ? 'text-yellow-500' :
                    user.rank === 2 ? 'text-gray-400' :
                    user.rank === 3 ? 'text-orange-600' :
                    'text-gray-600'
                  }`}>
                    #{user.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      {user.totalContributions} contributions
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{user.reputation}</div>
                  <div className="text-xs text-gray-500">reputation</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}