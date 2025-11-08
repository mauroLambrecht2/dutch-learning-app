import { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  Trophy,
  Flame,
  Target,
  Star,
  Calendar,
  Award,
  Languages,
} from "lucide-react";
import { CertificateGallery } from "./CertificateGallery";
import { FluencyHistory } from "./FluencyHistory";
import { FluencyLevelBadge } from "./FluencyLevelBadge";
import type { FluencyLevelCode } from "../types/fluency";
import { FLUENCY_LEVELS } from "../constants/fluencyLevels";

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
  const [fluencyLevel, setFluencyLevel] = useState<FluencyLevelCode | null>(
    null
  );
  const [loadingFluency, setLoadingFluency] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activityMap, setActivityMap] = useState<{ [key: string]: number }>({});
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadUserProfile();
    loadProgress();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await api.getProfile(accessToken);
      setUserId(profile.id || "");

      // Load fluency level
      if (profile.id) {
        try {
          const fluencyData = await api.getFluencyLevel(
            accessToken,
            profile.id
          );
          setFluencyLevel(fluencyData.level || "A1");
        } catch (error) {
          console.error("Failed to load fluency level:", error);
          // Default to A1 if fluency data is not available
          setFluencyLevel("A1");
        } finally {
          setLoadingFluency(false);
        }
      } else {
        // No profile ID, default to A1
        setFluencyLevel("A1");
        setLoadingFluency(false);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setFluencyLevel("A1");
      setLoadingFluency(false);
    }
  };

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
          id: "first_lesson",
          title: "First Steps",
          description: "Complete your first lesson",
          icon: "🎯",
          unlocked: lessonsCompleted >= 1,
        },
        {
          id: "week_streak",
          title: "Week Warrior",
          description: "Maintain a 7-day streak",
          icon: "🔥",
          unlocked: (progress.streak || 0) >= 7,
          progress: progress.streak || 0,
          target: 7,
        },
        {
          id: "fifty_words",
          title: "Vocabulary Builder",
          description: "Learn 50 words",
          icon: "📚",
          unlocked: wordsLearned >= 50,
          progress: wordsLearned,
          target: 50,
        },
        {
          id: "perfect_score",
          title: "Perfectionist",
          description: "Get 100% on a test",
          icon: "⭐",
          unlocked: progress.perfectScores > 0,
        },
        {
          id: "level_5",
          title: "Rising Star",
          description: "Reach level 5",
          icon: "🌟",
          unlocked: level >= 5,
          progress: level,
          target: 5,
        },
        {
          id: "ten_lessons",
          title: "Dedicated Learner",
          description: "Complete 10 lessons",
          icon: "📖",
          unlocked: lessonsCompleted >= 10,
          progress: lessonsCompleted,
          target: 10,
        },
      ];

      setAchievements(allAchievements);

      // Build activity map for heatmap
      const map: { [key: string]: number } = {};
      progress.activityLog?.forEach((activity: any) => {
        const date = new Date(activity.date).toISOString().split("T")[0];
        map[date] = (map[date] || 0) + activity.count;
      });
      setActivityMap(map);
    } catch (error) {
      console.error("Failed to load progress:", error);
    }
  };

  const getXPForNextLevel = () => {
    return stats.level * 500;
  };

  const getXPProgress = () => {
    const currentLevelXP = (stats.level - 1) * 500;
    const nextLevelXP = stats.level * 500;
    return (
      ((stats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    );
  };

  // Generate last 12 weeks for heatmap
  const generateHeatmapDays = () => {
    const days: Array<{ date: string; count: number; day: number }> = [];
    const today = new Date();
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = activityMap[dateStr] || 0;
      days.push({ date: dateStr, count, day: date.getDay() });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  return (
    <div className="space-y-6">
      {/* Fluency Level Display */}
      {!loadingFluency && (
        <div
          className="p-8 rounded-lg text-white"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm mb-2" style={{ opacity: 0.9 }}>
                Your Fluency Level
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-5xl" style={{ fontWeight: 700 }}>
                  {fluencyLevel || "A1"}
                </div>
                <div
                  className="text-2xl"
                  style={{ fontWeight: 600, opacity: 0.9 }}
                >
                  {FLUENCY_LEVELS[fluencyLevel || "A1"].name}
                </div>
              </div>
              <p className="text-sm mt-3 max-w-2xl" style={{ opacity: 0.9 }}>
                {FLUENCY_LEVELS[fluencyLevel || "A1"].description}
              </p>
            </div>
            <div style={{ opacity: 0.2 }}>
              <Languages className="w-20 h-20" />
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-white rounded-lg">
          <Flame className="w-10 h-10 mb-3" />
          <div className="text-4xl mb-2" style={{ fontWeight: 700 }}>
            {stats.streak}
          </div>
          <div className="text-base opacity-90">Day Streak</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white rounded-lg">
          <Star className="w-10 h-10 mb-3" />
          <div className="text-4xl mb-2" style={{ fontWeight: 700 }}>
            Level {stats.level}
          </div>
          <div className="text-base opacity-90">{stats.totalXP} XP</div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-8 text-white rounded-lg">
          <Target className="w-10 h-10 mb-3" />
          <div className="text-4xl mb-2" style={{ fontWeight: 700 }}>
            {stats.lessonsCompleted}
          </div>
          <div className="text-base opacity-90">Lessons Done</div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-8 text-white rounded-lg">
          <Trophy className="w-10 h-10 mb-3" />
          <div className="text-4xl mb-2" style={{ fontWeight: 700 }}>
            {stats.wordsLearned}
          </div>
          <div className="text-base opacity-90">Words Learned</div>
        </div>
      </div>

      {/* Level Explanation */}
      <div className="bg-white border border-zinc-200 p-6">
        <h3 className="text-sm text-zinc-900 mb-3" style={{ fontWeight: 600 }}>
          Understanding Your Levels
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-indigo-600" />
              <span
                className="text-sm text-indigo-900"
                style={{ fontWeight: 600 }}
              >
                XP Level (Activity-Based)
              </span>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Your XP level increases automatically as you complete lessons,
              learn words, and practice. It reflects your engagement and
              activity in the app.
            </p>
          </div>
          <div className="p-4 bg-pink-50 border border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-5 h-5 text-pink-600" />
              <span
                className="text-sm text-pink-900"
                style={{ fontWeight: 600 }}
              >
                Fluency Level (Proficiency-Based)
              </span>
            </div>
            <p className="text-xs text-pink-700 leading-relaxed">
              Your fluency level (A1-C1) is assigned by your teacher based on
              your actual Dutch language proficiency. It follows the CEFR
              standard and reflects your real-world language skills.
            </p>
          </div>
        </div>
      </div>

      {/* XP Level Progress */}
      <div className="bg-white border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg text-zinc-900" style={{ fontWeight: 600 }}>
              XP Level {stats.level}
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

      {/* Fluency Level Display */}
      {!loadingFluency && fluencyLevel && (
        <div className="bg-white border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3
                className="text-lg text-zinc-900 mb-2"
                style={{ fontWeight: 600 }}
              >
                Fluency Level
              </h3>
              <FluencyLevelBadge level={fluencyLevel} size="large" showLabel />
            </div>
            <div className="text-4xl">{FLUENCY_LEVELS[fluencyLevel].icon}</div>
          </div>
          <p className="text-sm text-zinc-600 mt-3">
            {FLUENCY_LEVELS[fluencyLevel].description}
          </p>
        </div>
      )}

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

                  const intensity =
                    dayData.count === 0
                      ? "bg-zinc-100"
                      : dayData.count <= 2
                      ? "bg-green-200"
                      : dayData.count <= 4
                      ? "bg-green-400"
                      : "bg-green-600";

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
            ({achievements.filter((a) => a.unlocked).length} /{" "}
            {achievements.length})
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 border-2 transition-all ${
                achievement.unlocked
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-zinc-200 bg-zinc-50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4
                    className="text-sm text-zinc-900 mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-zinc-600 mb-2">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked &&
                    achievement.progress !== undefined &&
                    achievement.target && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-zinc-200">
                          <div
                            className="h-full bg-indigo-500"
                            style={{
                              width: `${
                                (achievement.progress / achievement.target) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-zinc-500">
                          {achievement.progress} / {achievement.target}
                        </div>
                      </div>
                    )}
                  {achievement.unlocked && (
                    <div
                      className="text-xs text-yellow-700"
                      style={{ fontWeight: 600 }}
                    >
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
            <div
              className="text-2xl text-indigo-600 mb-1"
              style={{ fontWeight: 700 }}
            >
              {stats.testsCompleted}
            </div>
            <div className="text-xs text-zinc-600">Tests Taken</div>
          </div>
          <div className="text-center p-4 bg-zinc-50 border border-zinc-200">
            <div
              className="text-2xl text-green-600 mb-1"
              style={{ fontWeight: 700 }}
            >
              {stats.averageScore}%
            </div>
            <div className="text-xs text-zinc-600">Avg Test Score</div>
          </div>
          <div className="text-center p-4 bg-zinc-50 border border-zinc-200">
            <div
              className="text-2xl text-purple-600 mb-1"
              style={{ fontWeight: 700 }}
            >
              {stats.totalXP}
            </div>
            <div className="text-xs text-zinc-600">Total XP Earned</div>
          </div>
        </div>
      </div>

      {/* Earned Certificates */}
      {userId && (
        <div className="bg-white border border-zinc-200 p-6">
          <h3
            className="text-sm text-zinc-900 mb-4"
            style={{ fontWeight: 600 }}
          >
            Earned Certificates
          </h3>
          <CertificateGallery userId={userId} accessToken={accessToken} />
        </div>
      )}

      {/* Fluency Level History */}
      {userId && <FluencyHistory userId={userId} accessToken={accessToken} />}
    </div>
  );
}
