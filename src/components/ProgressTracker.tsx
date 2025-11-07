import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Trophy, Flame, Target, Star, TrendingUp, Calendar, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface ProgressTrackerProps {
  accessToken: string;
}

export function ProgressTracker({ accessToken }: ProgressTrackerProps) {
  const [stats, setStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    lessonsCompleted: 0,
    wordsLearned: 0,
    testsCompleted: 0,
    averageScore: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activityMap, setActivityMap] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await api.getProgress(accessToken);
      
      // Calculate stats
      const lessonsCompleted = progress.completedLessons?.length || 0;
      const wordsLearned = progress.vocabulary?.length || 0;
      const totalXP = lessonsCompleted * 100 + wordsLearned * 10;
      const level = Math.floor(totalXP / 500) + 1;

      setStats({
        streak: progress.streak || 0,
        totalXP,
        level,
        lessonsCompleted,
        wordsLearned,
        testsCompleted: progress.testsCompleted || 0,
        averageScore: progress.averageScore || 0,
      });

      // Build achievements
      const allAchievements: Achievement[] = [
        {
          id: 'first_lesson',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '🎯',
          unlocked: lessonsCompleted >= 1,
        },
        {
          id: 'week_streak',
          title: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          unlocked: (progress.streak || 0) >= 7,
          progress: progress.streak || 0,
          target: 7,
        },
        {
          id: 'fifty_words',
          title: 'Vocabulary Builder',
          description: 'Learn 50 words',
          icon: '📚',
          unlocked: wordsLearned >= 50,
          progress: wordsLearned,
          target: 50,
        },
        {
          id: 'perfect_score',
          title: 'Perfectionist',
          description: 'Get 100% on a test',
          icon: '⭐',
          unlocked: progress.perfectScores > 0,
        },
        {
          id: 'level_5',
          title: 'Rising Star',
          description: 'Reach level 5',
          icon: '🌟',
          unlocked: level >= 5,
          progress: level,
          target: 5,
        },
        {
          id: 'ten_lessons',
          title: 'Dedicated Learner',
          description: 'Complete 10 lessons',
          icon: '📖',
          unlocked: lessonsCompleted >= 10,
          progress: lessonsCompleted,
          target: 10,
        },
      ];

      setAchievements(allAchievements);

      // Build activity map for heatmap
      const map: { [key: string]: number } = {};
      progress.activityLog?.forEach((activity: any) => {
        const date = new Date(activity.date).toISOString().split('T')[0];
        map[date] = (map[date] || 0) + activity.count;
      });
      setActivityMap(map);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const getXPForNextLevel = () => {
    return stats.level * 500;
  };

  const getXPProgress = () => {
    const currentLevelXP = (stats.level - 1) * 500;
    const nextLevelXP = stats.level * 500;
    return ((stats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  // Generate last 12 weeks for heatmap
  const generateHeatmapDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      days.push({ date: dateStr, count, day: date.getDay() });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-white">
          <Flame className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1" style={{ fontWeight: 700 }}>
            {stats.streak}
          </div>
          <div className="text-sm opacity-90">Day Streak</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
          <Star className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1" style={{ fontWeight: 700 }}>
            Level {stats.level}
          </div>
          <div className="text-sm opacity-90">{stats.totalXP} XP</div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 text-white">
          <Target className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1" style={{ fontWeight: 700 }}>
            {stats.lessonsCompleted}
          </div>
          <div className="text-sm opacity-90">Lessons Done</div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-6 text-white">
          <Trophy className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1" style={{ fontWeight: 700 }}>
            {stats.wordsLearned}
          </div>
          <div className="text-sm opacity-90">Words Learned</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
              Level {stats.level}
            </h3>
            <p className="text-sm text-zinc-500">
              {Math.floor(getXPProgress())}% to Level {stats.level + 1}
            </p>
          </div>
          <div className="text-2xl">⭐</div>
        </div>
        <div className="h-4 bg-zinc-200">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${getXPProgress()}%` }}
          ></div>
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          {stats.totalXP} / {getXPForNextLevel()} XP
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white border border-zinc-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-zinc-600" />
          <h3 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
            Activity Over Time
          </h3>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {Array.from({ length: 12 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayData = heatmapDays[weekIndex * 7 + dayIndex];
                  if (!dayData) return null;
                  
                  const intensity = dayData.count === 0 ? 'bg-zinc-100' :
                                  dayData.count <= 2 ? 'bg-green-200' :
                                  dayData.count <= 4 ? 'bg-green-400' :
                                  'bg-green-600';
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 ${intensity} border border-zinc-200`}
                      title={`${dayData.date}: ${dayData.count} activities`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-zinc-100 border border-zinc-200"></div>
            <div className="w-3 h-3 bg-green-200 border border-zinc-200"></div>
            <div className="w-3 h-3 bg-green-400 border border-zinc-200"></div>
            <div className="w-3 h-3 bg-green-600 border border-zinc-200"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white border border-zinc-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-zinc-600" />
          <h3 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
            Achievements
          </h3>
          <span className="text-xs text-zinc-500">
            ({achievements.filter(a => a.unlocked).length} / {achievements.length})
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 border-2 transition-all ${
                achievement.unlocked
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-zinc-200 bg-zinc-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-zinc-600 mb-2">{achievement.description}</p>
                  {!achievement.unlocked && achievement.progress !== undefined && achievement.target && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-zinc-200">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {achievement.progress} / {achievement.target}
                      </div>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="text-xs text-yellow-700" style={{ fontWeight: 600 }}>
                      ✓ UNLOCKED
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-white border border-zinc-200 p-6">
        <h3 className="text-sm text-zinc-900 mb-4" style={{ fontWeight: 600 }}>
          Detailed Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-zinc-50 border border-zinc-200">
            <div className="text-2xl text-indigo-600 mb-1" style={{ fontWeight: 700 }}>
              {stats.testsCompleted}
            </div>
            <div className="text-xs text-zinc-600">Tests Taken</div>
          </div>
          <div className="text-center p-4 bg-zinc-50 border border-zinc-200">
            <div className="text-2xl text-green-600 mb-1" style={{ fontWeight: 700 }}>
              {stats.averageScore}%
            </div>
            <div className="text-xs text-zinc-600">Avg Test Score</div>
          </div>
          <div className="text-center p-4 bg-zinc-50 border border-zinc-200">
            <div className="text-2xl text-purple-600 mb-1" style={{ fontWeight: 700 }}>
              {stats.totalXP}
            </div>
            <div className="text-xs text-zinc-600">Total XP Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
}
