import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { LogOut, Trophy, Brain, AlertCircle, BarChart3, Flame, Target } from 'lucide-react';
import { ClassPlayer } from './ClassPlayer';
import { ProgressTracker } from './ProgressTracker';
import { MistakeBank } from './MistakeBank';
import { SpacedRepetition } from './SpacedRepetition';
import { VocabularyList } from './VocabularyList';
import { NotesViewer } from './notes/NotesViewer';
import { FullNoteEditor } from './notes/FullNoteEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FluencyLevelBadge } from './FluencyLevelBadge';
import type { FluencyLevel } from '../types/fluency';

interface StudentDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function StudentDashboard({ accessToken, onLogout }: StudentDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [days, setDays] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>({ streak: 0 });
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [fluencyLevel, setFluencyLevel] = useState<FluencyLevel>('A1');
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // Determine active tab from route
  useEffect(() => {
    if (location.pathname.startsWith('/notes')) {
      setActiveTab('notes');
    }
  }, [location.pathname]);

  useEffect(() => {
    loadData();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.getProfile(accessToken);
      const profile = response.profile;
      if (profile) {
        setFluencyLevel(profile.fluencyLevel || 'A1');
        setUserName(profile.name || '');
        setUserId(profile.id || '');
      } else {
        // Set defaults if profile is null
        setFluencyLevel('A1');
        setUserName('Student');
        setUserId('');
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Set defaults on error
      setFluencyLevel('A1');
      setUserName('Student');
      setUserId('');
    }
  };

  const loadData = async () => {
    try {
      const [daysRes, classesRes, progressRes] = await Promise.all([
        api.getDays(),
        api.getClasses(),
        api.getProgress(accessToken)
      ]);
      setDays(daysRes.days || []);
      setClasses(classesRes.classes || []);
      setProgress(progressRes.progress || []);
      setUserProgress({
        streak: progressRes.streak || 0,
        lastActivityDate: progressRes.lastActivityDate,
        completedLessons: progressRes.completedLessons || [],
        testsCompleted: progressRes.testsCompleted || 0,
        averageScore: progressRes.averageScore || 0,
        totalXP: progressRes.totalXP || 0,
        vocabulary: progressRes.vocabulary || []
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleClassComplete = async (classId: string, score: number) => {
    await api.saveProgress(accessToken, classId, true, score);
    setSelectedClass(null);
    await loadData();
  };

  const isClassCompleted = (classId: string) => {
    return progress.some((p: any) => p.classId === classId && p.completed);
  };

  const getCompletedCount = () => {
    return progress.filter((p: any) => p.completed).length;
  };

  const getTotalCount = () => {
    return classes.length;
  };

  if (selectedClass) {
    return (
      <ClassPlayer
        classData={selectedClass}
        onComplete={handleClassComplete}
        onExit={() => setSelectedClass(null)}
        accessToken={accessToken}
      />
    );
  }

  // Group classes by day and sort by order
  const groupedClasses = days.map(day => ({
    ...day,
    classes: classes
      .filter(c => c.dayId === day.id)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
  }));

  // Add ungrouped classes and sort by order
  const ungroupedClasses = classes
    .filter(c => !c.dayId)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <Routes>
      {/* Note editor routes */}
      <Route path="/notes/:noteId/edit" element={<FullNoteEditor accessToken={accessToken} />} />
      <Route path="/notes/new" element={<FullNoteEditor accessToken={accessToken} />} />
      
      {/* Main dashboard route */}
      <Route path="/*" element={
        <div className="min-h-screen bg-zinc-50">
          {/* Header */}
          <div className="bg-white border-b border-zinc-200">
            <div className="max-w-5xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl text-zinc-900" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                      Dutch Learning
                    </h1>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs border border-indigo-100" style={{ fontWeight: 600 }}>
                      XINDY
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">Your personalized learning path</p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Streak */}
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" style={{ color: '#fb923c' }} />
                    <div>
                      <div className="text-xl text-zinc-900 leading-none" style={{ fontWeight: 700 }}>
                        {userProgress.streak || 0}
                      </div>
                      <div className="text-xs text-zinc-500">Day Streak</div>
                    </div>
                  </div>
                  
                  {/* Lessons Completed */}
                  <div className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="text-xl text-zinc-900 leading-none" style={{ fontWeight: 700 }}>
                        {getCompletedCount()}
                      </div>
                      <div className="text-xs text-zinc-500">Lessons Done</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={onLogout} 
                    variant="outline"
                    size="sm"
                    className="border-zinc-200 hover:bg-zinc-50 ml-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
                <TabsTrigger value="spaced">Spaced Repetition</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
            <div className="space-y-12">
              {groupedClasses.map((day, dayIndex) => {
                if (day.classes.length === 0) return null;

                return (
                  <div key={day.id}>
                    {/* Chapter Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 bg-zinc-900 text-white text-sm" style={{ fontWeight: 700 }}>
                        {dayIndex + 1}
                      </div>
                      <div>
                        <h2 className="text-xl text-zinc-900" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {day.name}
                        </h2>
                        <p className="text-sm text-zinc-500">
                          {day.classes.filter((c: any) => isClassCompleted(c.id)).length} of {day.classes.length} completed
                        </p>
                      </div>
                    </div>

                    {/* Lessons Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {day.classes.map((cls: any, classIndex: number) => {
                        const completed = isClassCompleted(cls.id);
                        const previousCompleted = classIndex === 0 || isClassCompleted(day.classes[classIndex - 1].id);
                        const isLocked = !previousCompleted && classIndex > 0;

                        return (
                          <button
                            key={cls.id}
                            onClick={() => !isLocked && setSelectedClass(cls)}
                            disabled={isLocked}
                            className={`text-left p-5 border transition-all ${
                              completed 
                                ? 'bg-emerald-50 border-emerald-500' 
                                : isLocked 
                                  ? 'bg-zinc-100 border-zinc-200 opacity-50 cursor-not-allowed' 
                                  : 'bg-white border-zinc-200 hover:border-indigo-500 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Status Icon */}
                              <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center border ${
                                completed 
                                  ? 'bg-emerald-500 border-emerald-600' 
                                  : isLocked 
                                    ? 'bg-zinc-300 border-zinc-400' 
                                    : 'bg-white border-zinc-300'
                              }`}>
                                {isLocked ? (
                                  <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                ) : completed ? (
                                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <div className="w-3 h-3 bg-indigo-500"></div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-sm mb-1 ${
                                  completed ? 'text-emerald-900' : 'text-zinc-900'
                                }`} style={{ fontWeight: 600 }}>
                                  {cls.title}
                                </h3>
                                <p className={`text-xs ${
                                  completed ? 'text-emerald-700' : 'text-zinc-500'
                                }`}>
                                  {cls.description}
                                </p>
                                {completed && (
                                  <div className="mt-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs border border-emerald-200">
                                    Completed
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {ungroupedClasses.length > 0 && (
                <div>
                  {/* Other Lessons Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-zinc-400 text-white text-sm" style={{ fontWeight: 700 }}>
                      •
                    </div>
                    <div>
                      <h2 className="text-xl text-zinc-900" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                        Other Lessons
                      </h2>
                      <p className="text-sm text-zinc-500">Additional practice</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {ungroupedClasses.map((cls: any) => {
                      const completed = isClassCompleted(cls.id);

                      return (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass(cls)}
                          className={`text-left p-5 border transition-all ${
                            completed 
                              ? 'bg-emerald-50 border-emerald-500' 
                              : 'bg-white border-zinc-200 hover:border-indigo-500 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center border ${
                              completed ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-zinc-300'
                            }`}>
                              {completed ? (
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className="w-3 h-3 bg-indigo-500"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm mb-1 ${
                                completed ? 'text-emerald-900' : 'text-zinc-900'
                              }`} style={{ fontWeight: 600 }}>
                                {cls.title}
                              </h3>
                              <p className={`text-xs ${
                                completed ? 'text-emerald-700' : 'text-zinc-500'
                              }`}>
                                {cls.description}
                              </p>
                              {completed && (
                                <div className="mt-2 inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs border border-emerald-200">
                                  Completed
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {classes.length === 0 && (
                <div className="text-center py-16 border border-dashed border-zinc-200">
                  <p className="text-sm text-zinc-500">No lessons available yet</p>
                  <p className="text-xs text-zinc-400 mt-1">Check back soon for new content</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <NotesViewer accessToken={accessToken} userId={userId} />
          </TabsContent>

          <TabsContent value="vocabulary">
            <VocabularyList accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="mistakes">
            <MistakeBank accessToken={accessToken} />
          </TabsContent>

              <TabsContent value="spaced">
                <SpacedRepetition accessToken={accessToken} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      } />
    </Routes>
  );
}