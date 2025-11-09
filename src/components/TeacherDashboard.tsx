import { useState, useEffect, DragEvent } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { LogOut, Plus, BookOpen, FileText, ClipboardList, BarChart3, Upload, Volume2, GraduationCap, Search, Edit, Copy, Trash2, MoreVertical, Users, GripVertical } from 'lucide-react';
import { Input } from './ui/input';
import { LessonBuilder } from './LessonBuilder';
import { ClassBuilder } from './ClassBuilder';
import { JSONImporter } from './JSONImporter';
import { VocabularyManager } from './VocabularyManager';
import { AudioMigrationTool } from './AudioMigrationTool';
import { TestBuilder } from './TestBuilder';
import { TestResults } from './TestResults';
import { GrammarBuilder } from './GrammarBuilder';
import { StudentList } from './StudentList';
import { StudentProfile } from './StudentProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TeacherDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function TeacherDashboard({ accessToken, onLogout }: TeacherDashboardProps) {
  const [days, setDays] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showJSONImporter, setShowJSONImporter] = useState(false);
  const [showTestBuilder, setShowTestBuilder] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChapterInput, setShowNewChapterInput] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [daysRes, classesRes] = await Promise.all([
        api.getDays(),
        api.getClasses()
      ]);
      setDays(daysRes.days || []);
      setClasses(classesRes.classes || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateDay = async () => {
    if (!newChapterName.trim()) return;

    try {
      await api.createDay(accessToken, {
        name: newChapterName,
        order: days.length
      });
      setNewChapterName('');
      setShowNewChapterInput(false);
      await loadData();
    } catch (error: any) {
      console.error('Failed to create chapter:', error);
      alert(`❌ Failed to create chapter: ${error.message}`);
    }
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    setShowBuilder(true);
  };

  const handleEditClass = (cls: any) => {
    setEditingClass(cls);
    setShowBuilder(true);
  };

  const handleDuplicateClass = async (cls: any) => {
    try {
      const duplicated = {
        ...cls,
        id: undefined,
        title: `${cls.title} (Copy)`,
      };
      await api.createClass(accessToken, duplicated);
      await loadData();
    } catch (error) {
      console.error('Failed to duplicate class:', error);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;

    try {
      await api.deleteClass(accessToken, classId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const handleReorderClass = async (classId: string, newOrder: number) => {
    try {
      await api.updateClass(accessToken, classId, { order: newOrder });
      await loadData();
    } catch (error) {
      console.error('Failed to reorder class:', error);
    }
  };

  const handleSaveClass = async () => {
    setShowBuilder(false);
    setEditingClass(null);
    await loadData();
  };

  const handleJSONImport = async (jsonData: any) => {
    try {
      await api.createClass(accessToken, jsonData);
      setShowJSONImporter(false);
      await loadData();
    } catch (error: any) {
      console.error('Failed to import JSON:', error);
      alert(`❌ Failed to import JSON: ${error.message}`);
    }
  };

  // Show student profile if a student is selected
  if (selectedStudentId) {
    return (
      <StudentProfile
        userId={selectedStudentId}
        accessToken={accessToken}
        currentUserRole="teacher"
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  if (showBuilder) {
    return (
      <ClassBuilder
        accessToken={accessToken}
        existingClass={editingClass}
        days={days}
        onSave={handleSaveClass}
        onCancel={() => {
          setShowBuilder(false);
          setEditingClass(null);
        }}
      />
    );
  }

  const filteredClasses = classes.filter(c => {
    const matchesDay = selectedDay ? c.dayId === selectedDay : true;
    const matchesSearch = searchQuery 
      ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDay && matchesSearch;
  });

  const getChapterStats = (dayId: string) => {
    const dayClasses = classes.filter(c => c.dayId === dayId);
    return {
      total: dayClasses.length,
      pages: dayClasses.reduce((sum, c) => sum + (c.pages?.length || 0), 0)
    };
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl text-zinc-900" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Creator Studio
                </h1>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs border border-indigo-100" style={{ fontWeight: 600 }}>
                  MAURO
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                {classes.length} lesson{classes.length !== 1 ? 's' : ''} • {days.length} chapter{days.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowJSONImporter(true)} 
                variant="outline"
                size="sm"
                className="border-zinc-200 hover:bg-zinc-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import JSON
              </Button>
              <Button 
                onClick={onLogout} 
                variant="outline"
                size="sm"
                className="border-zinc-200 hover:bg-zinc-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full border-b border-zinc-200 rounded-none bg-transparent h-auto p-0 mb-6">
            <TabsTrigger value="lessons" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-2">
              <Volume2 className="w-4 h-4 mr-2" />
              Vocabulary Library
            </TabsTrigger>
            <TabsTrigger value="tests" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-2">
              <GraduationCap className="w-4 h-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="results" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Test Results
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-0">
            <LessonsTab
              classes={classes}
              days={days}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showNewChapterInput={showNewChapterInput}
              setShowNewChapterInput={setShowNewChapterInput}
              newChapterName={newChapterName}
              setNewChapterName={setNewChapterName}
              handleCreateDay={handleCreateDay}
              handleCreateClass={handleCreateClass}
              handleEditClass={handleEditClass}
              handleDuplicateClass={handleDuplicateClass}
              handleDeleteClass={handleDeleteClass}
              handleReorderClass={handleReorderClass}
            />
          </TabsContent>

          <TabsContent value="vocabulary" className="mt-0">
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                  🔧 Audio Migration Tool
                </h3>
                <p className="text-xs text-yellow-800 mb-3">
                  If your existing lessons don't have audio, use this tool to automatically add audio URLs from your vocabulary database.
                </p>
                <AudioMigrationTool accessToken={accessToken} />
              </div>
              <VocabularyManager accessToken={accessToken} />
            </div>
          </TabsContent>

          <TabsContent value="tests" className="mt-0">
            {showTestBuilder ? (
              <TestBuilder
                accessToken={accessToken}
                existingTest={editingTest}
                onSave={() => {
                  setShowTestBuilder(false);
                  setEditingTest(null);
                }}
                onCancel={() => {
                  setShowTestBuilder(false);
                  setEditingTest(null);
                }}
              />
            ) : (
              <TestsTab
                accessToken={accessToken}
                onCreateTest={() => {
                  setEditingTest(null);
                  setShowTestBuilder(true);
                }}
                onEditTest={(test: any) => {
                  setEditingTest(test);
                  setShowTestBuilder(true);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <TestResults accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="students" className="mt-0">
            <StudentList
              accessToken={accessToken}
              onSelectStudent={(studentId) => setSelectedStudentId(studentId)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <JSONImporter
        isOpen={showJSONImporter}
        onImport={handleJSONImport}
        onClose={() => setShowJSONImporter(false)}
      />
    </div>
  );
}

// Lessons Tab Component
function LessonsTab({
  classes,
  days,
  selectedDay,
  setSelectedDay,
  searchQuery,
  setSearchQuery,
  showNewChapterInput,
  setShowNewChapterInput,
  newChapterName,
  setNewChapterName,
  handleCreateDay,
  handleCreateClass,
  handleEditClass,
  handleDuplicateClass,
  handleDeleteClass,
  handleReorderClass,
}: any) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [optimisticClasses, setOptimisticClasses] = useState<any[] | null>(null);

  // Use optimistic classes if available, otherwise use filtered classes
  const baseFilteredClasses = classes.filter((c: any) => {
    const matchesDay = selectedDay ? c.dayId === selectedDay : true;
    const matchesSearch = searchQuery 
      ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesDay && matchesSearch;
  }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const filteredClasses = optimisticClasses || baseFilteredClasses;

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a custom drag image or styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only clear if we're actually leaving the element
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Optimistically reorder the classes for immediate UI feedback
    const reorderedClasses = [...baseFilteredClasses];
    const [draggedClass] = reorderedClasses.splice(draggedIndex, 1);
    reorderedClasses.splice(dropIndex, 0, draggedClass);
    
    // Update optimistic state immediately
    setOptimisticClasses(reorderedClasses);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Update order in the background
    try {
      await Promise.all(
        reorderedClasses.map((cls, index) => 
          handleReorderClass(cls.id, index)
        )
      );
      // Clear optimistic state after successful update
      setOptimisticClasses(null);
    } catch (error) {
      console.error('Failed to reorder classes:', error);
      // Revert optimistic update on error
      setOptimisticClasses(null);
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getChapterStats = (dayId: string) => {
    const dayClasses = classes.filter((c: any) => c.dayId === dayId);
    return {
      total: dayClasses.length,
      pages: dayClasses.reduce((sum: number, c: any) => sum + (c.pages?.length || 0), 0)
    };
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="col-span-3 space-y-4">
        {/* Quick Actions */}
        <div className="bg-white border border-zinc-200">
          <div className="p-4 border-b border-zinc-200">
            <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
              Quick Actions
            </h2>
          </div>
          <div className="p-2">
            <Button 
              onClick={handleCreateClass}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Lesson
            </Button>
          </div>
        </div>

        {/* Chapters */}
        <div className="bg-white border border-zinc-200">
          <div className="p-4 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
                Chapters
              </h2>
              <button 
                onClick={() => setShowNewChapterInput(!showNewChapterInput)}
                className="p-1 hover:bg-zinc-100 border border-zinc-200"
              >
                <Plus className="w-3 h-3 text-zinc-600" />
              </button>
            </div>
          </div>
          <div className="p-2">
            {showNewChapterInput && (
              <div className="p-2 mb-2 bg-zinc-50 border border-zinc-200">
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="Chapter name..."
                  className="text-sm mb-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateDay();
                    if (e.key === 'Escape') {
                      setShowNewChapterInput(false);
                      setNewChapterName('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateDay} size="sm" className="flex-1">
                    Add
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowNewChapterInput(false);
                      setNewChapterName('');
                    }} 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setSelectedDay(null)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                selectedDay === null 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
              style={{ fontWeight: selectedDay === null ? 600 : 400 }}
            >
              <div className="flex items-center justify-between">
                <span>All Lessons</span>
                <span className="text-xs text-zinc-400">{classes.length}</span>
              </div>
            </button>
            
            {days.map((day) => {
              const stats = getChapterStats(day.id);
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors mt-1 ${
                    selectedDay === day.id 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                  style={{ fontWeight: selectedDay === day.id ? 600 : 400 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="truncate">{day.name}</span>
                    <span className="text-xs text-zinc-400 ml-2">{stats.total}</span>
                  </div>
                  {stats.total > 0 && (
                    <div className="text-xs text-zinc-400">
                      {stats.pages} page{stats.pages !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              );
            })}

            {days.length === 0 && !showNewChapterInput && (
              <div className="p-4 text-center">
                <p className="text-xs text-zinc-400 mb-2">No chapters yet</p>
                <button
                  onClick={() => setShowNewChapterInput(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                  style={{ fontWeight: 500 }}
                >
                  Create your first chapter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-9">
        <div className="bg-white border border-zinc-200">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
                  {selectedDay 
                    ? days.find(d => d.id === selectedDay)?.name || 'Lessons'
                    : 'All Lessons'}
                </h2>
                <p className="text-xs text-zinc-500">
                  {filteredClasses.length} lesson{filteredClasses.length !== 1 ? 's' : ''}
                  {searchQuery && ' matching search'}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Lessons List */}
          <div className="p-4">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-200">
                <div className="text-zinc-400 mb-3">
                  <Plus className="w-10 h-10 mx-auto opacity-40" />
                </div>
                {searchQuery ? (
                  <>
                    <p className="text-sm text-zinc-500 mb-2">No lessons found</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                      style={{ fontWeight: 500 }}
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-zinc-500 mb-2">No lessons yet</p>
                    <button 
                      onClick={handleCreateClass}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                      style={{ fontWeight: 500 }}
                    >
                      Create your first lesson
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {filteredClasses.map((cls, index) => {
                  const isDragging = draggedIndex === index;
                  const isDropTarget = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
                  const shouldShowDropIndicatorAbove = isDropTarget && draggedIndex !== null && draggedIndex > index;
                  const shouldShowDropIndicatorBelow = isDropTarget && draggedIndex !== null && draggedIndex < index;

                  return (
                    <div key={cls.id}>
                      {/* Drop indicator above */}
                      {shouldShowDropIndicatorAbove && (
                        <div className="h-2 mb-3 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded animate-pulse" />
                      )}
                      
                      <div 
                        draggable={!searchQuery}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`group border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all mb-3 ${
                          isDragging ? 'opacity-40 scale-95' : ''
                        } ${
                          isDropTarget ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
                        } ${
                          !searchQuery ? 'cursor-move' : ''
                        }`}
                        style={{
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {!searchQuery && (
                            <div className="flex items-center pt-1 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-zinc-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm text-zinc-900 mb-1 truncate" style={{ fontWeight: 600 }}>
                              {cls.title}
                            </h3>
                            <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{cls.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs">
                                {cls.pages?.length || 0} page{cls.pages?.length !== 1 ? 's' : ''}
                              </span>
                              {cls.dayId && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">
                                  {days.find(d => d.id === cls.dayId)?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditClass(cls)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-200 px-2"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDuplicateClass(cls)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClass(cls.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                      </div>
                      
                      {/* Drop indicator below */}
                      {shouldShowDropIndicatorBelow && (
                        <div className="h-2 mt-3 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tests Tab Component
function TestsTab({
  accessToken,
  onCreateTest,
  onEditTest,
}: any) {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testsRes = await api.getTests(accessToken);
        setTests(testsRes.tests || []);
      } catch (error) {
        console.error('Failed to load tests:', error);
      }
    };

    fetchTests();
  }, [accessToken]);

  const handleEditTest = (test: any) => {
    onEditTest(test);
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Delete this test? This cannot be undone.')) return;

    try {
      await api.deleteTest(accessToken, testId);
      setTests(tests.filter(t => t.id !== testId));
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="col-span-3 space-y-4">
        {/* Quick Actions */}
        <div className="bg-white border border-zinc-200">
          <div className="p-4 border-b border-zinc-200">
            <h2 className="text-sm text-zinc-900" style={{ fontWeight: 600 }}>
              Quick Actions
            </h2>
          </div>
          <div className="p-2">
            <Button 
              onClick={onCreateTest}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Test
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-9">
        <div className="bg-white border border-zinc-200">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
                  Tests
                </h2>
                <p className="text-xs text-zinc-500">
                  {tests.length} test{tests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Tests List */}
          <div className="p-4">
            {tests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-200">
                <div className="text-zinc-400 mb-3">
                  <Plus className="w-10 h-10 mx-auto opacity-40" />
                </div>
                <p className="text-sm text-zinc-500 mb-2">No tests yet</p>
                <button 
                  onClick={onCreateTest}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                  style={{ fontWeight: 500 }}
                >
                  Create your first test
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <div 
                    key={test.id} 
                    className="group border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-zinc-900 mb-1 truncate" style={{ fontWeight: 600 }}>
                            {test.title}
                          </h3>
                          <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{test.description}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs">
                              {test.questions?.length || 0} question{test.questions?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditTest(test)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-200 px-2"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTest(test.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
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