import { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  Trophy,
  Flame,
  Target,
  Star,
  Calendar,
  Award,
  ArrowLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { FluencyLevelBadge } from "./FluencyLevelBadge";
import { FluencyLevelManager } from "./FluencyLevelManager";
import { CertificateGallery } from "./CertificateGallery";
import { FluencyHistory } from "./FluencyHistory";
import type { FluencyLevelCode } from "../types/fluency";

interface StudentProfileProps {
  userId: string;
  accessToken: string;
  currentUserRole: "teacher" | "student";
  onBack?: () => void;
}

export function StudentProfile({
  userId,
  accessToken,
  currentUserRole,
  onBack,
}: StudentProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    streak: 0,
    totalXP: 0,
    level: 1,
    lessonsCompleted: 0,
    wordsLearned: 0,
    testsCompleted: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentData();
  }, [userId]);

  const loadStudentData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load user profile
      const userProfile = await api.getProfile(accessToken);
      setProfile(userProfile);

      // Load progress data
      const progress = await api.getProgress(accessToken);

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
    } catch (err: any) {
      console.error("Failed to load student data:", err);
      setError(err.message || "Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFluencyLevelChange = async () => {
    // Reload profile data after fluency level change
    await loadStudentData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-zinc-500">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isTeacherView = currentUserRole === "teacher";

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button onClick={onBack} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1
                    className="text-2xl text-zinc-900"
                    style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                  >
                    {profile.name || "Student"}
                  </h1>
                  <FluencyLevelBadge
                    level={(profile.fluencyLevel as FluencyLevelCode) || "A1"}
                    size="medium"
                    showLabel={true}
                  />
                </div>
                <p className="text-sm text-zinc-500">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Admin Controls - Only visible to teachers */}
        {isTeacherView && (
          <div className="bg-white border border-zinc-200 p-6">
            <h3
              className="text-sm text-zinc-900 mb-4"
              style={{ fontWeight: 600 }}
            >
              Fluency Level Management
            </h3>
            <FluencyLevelManager
              userId={userId}
              currentLevel={profile.fluencyLevel || "A1"}
              accessToken={accessToken}
              userRole={currentUserRole}
              onLevelChange={handleFluencyLevelChange}
            />
          </div>
        )}

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

        {/* Detailed Statistics */}
        <div className="bg-white border border-zinc-200 p-6">
          <h3
            className="text-sm text-zinc-900 mb-4"
            style={{ fontWeight: 600 }}
          >
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
        <div className="bg-white border border-zinc-200 p-6">
          <h3
            className="text-sm text-zinc-900 mb-4"
            style={{ fontWeight: 600 }}
          >
            Earned Certificates
          </h3>
          <CertificateGallery userId={userId} accessToken={accessToken} />
        </div>

        {/* Fluency Level History */}
        <FluencyHistory userId={userId} accessToken={accessToken} />
      </div>
    </div>
  );
}
