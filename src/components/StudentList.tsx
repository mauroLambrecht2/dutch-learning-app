import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, User, ChevronRight } from 'lucide-react';
import { FluencyLevelBadge } from './FluencyLevelBadge';
import type { FluencyLevelCode } from '../types/fluency';

interface Student {
  id: string;
  name: string;
  email: string;
  fluencyLevel: FluencyLevelCode;
  role: string;
}

interface StudentListProps {
  accessToken: string;
  onSelectStudent: (studentId: string) => void;
}

export function StudentList({ accessToken, onSelectStudent }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(
          (student) =>
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, students]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all users (this endpoint needs to be implemented in the backend)
      const response = await api.getUsers(accessToken);
      
      // Filter to only show students
      const studentUsers = response.users.filter((user: any) => user.role === 'student');
      setStudents(studentUsers);
      setFilteredStudents(studentUsers);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Failed to load students');
      
      // For now, show empty state if endpoint doesn't exist
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 p-12 text-center">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-zinc-500">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-zinc-200 p-12 text-center">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button onClick={loadStudents} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm text-zinc-900 mb-1" style={{ fontWeight: 600 }}>
              Students
            </h2>
            <p className="text-xs text-zinc-500">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
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
            placeholder="Search students by name or email..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="p-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200">
            <div className="text-zinc-400 mb-3">
              <User className="w-10 h-10 mx-auto opacity-40" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-sm text-zinc-500 mb-2">No students found</p>
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
                <p className="text-sm text-zinc-500 mb-2">No students yet</p>
                <p className="text-xs text-zinc-400">Students will appear here once they sign up</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className="w-full text-left p-4 border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-zinc-900 truncate" style={{ fontWeight: 600 }}>
                          {student.name}
                        </h3>
                        <FluencyLevelBadge
                          level={student.fluencyLevel || 'A1'}
                          size="small"
                          showLabel={false}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{student.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
