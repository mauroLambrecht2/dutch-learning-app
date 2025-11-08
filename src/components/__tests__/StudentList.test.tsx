import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { StudentList } from '../StudentList';
import { api } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    getUsers: vi.fn(),
  },
}));

// Mock FluencyLevelBadge
vi.mock('../FluencyLevelBadge', () => ({
  FluencyLevelBadge: ({ level }: any) => (
    <div data-testid="fluency-badge">{level}</div>
  ),
}));

describe('StudentList', () => {
  const mockAccessToken = 'mock-token';
  const mockOnSelectStudent = vi.fn();

  const mockStudents = [
    {
      id: 'student-1',
      name: 'Alice Johnson',
      email: 'alice@test.com',
      role: 'student',
      fluencyLevel: 'A1',
    },
    {
      id: 'student-2',
      name: 'Bob Smith',
      email: 'bob@test.com',
      role: 'student',
      fluencyLevel: 'A2',
    },
    {
      id: 'student-3',
      name: 'Charlie Brown',
      email: 'charlie@test.com',
      role: 'student',
      fluencyLevel: 'B1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.getUsers as any).mockResolvedValue({ users: mockStudents });
  });

  describe('Rendering', () => {
    it('should display list of students', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });

    it('should display student emails', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('alice@test.com')).toBeInTheDocument();
      });

      expect(screen.getByText('bob@test.com')).toBeInTheDocument();
      expect(screen.getByText('charlie@test.com')).toBeInTheDocument();
    });

    it('should display fluency level badges for each student', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByTestId('fluency-badge')).toHaveLength(3);
      });
    });

    it('should display student count', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('3 students')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter students by name', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search students/i);
      fireEvent.change(searchInput, { target: { value: 'Alice' } });

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('should filter students by email', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search students/i);
      fireEvent.change(searchInput, { target: { value: 'bob@test' } });

      await waitFor(() => {
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
      });
    });

    it('should be case-insensitive', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search students/i);
      fireEvent.change(searchInput, { target: { value: 'CHARLIE' } });

      await waitFor(() => {
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
      });
    });

    it('should show "no students found" when search has no results', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search students/i);
      fireEvent.change(searchInput, { target: { value: 'NonexistentStudent' } });

      await waitFor(() => {
        expect(screen.getByText('No students found')).toBeInTheDocument();
      });
    });

    it('should allow clearing search', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search students/i);
      fireEvent.change(searchInput, { target: { value: 'NonexistentStudent' } });

      await waitFor(() => {
        expect(screen.getByText('No students found')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear search');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      });
    });
  });

  describe('Student Selection', () => {
    it('should call onSelectStudent when student is clicked', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const studentButton = screen.getByText('Alice Johnson').closest('button');
      fireEvent.click(studentButton!);

      expect(mockOnSelectStudent).toHaveBeenCalledWith('student-1');
    });

    it('should have hover effects on student items', async () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const studentButton = screen.getByText('Alice Johnson').closest('button');
      expect(studentButton).toHaveClass('hover:border-indigo-300');
      expect(studentButton).toHaveClass('hover:bg-indigo-50');
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no students exist', async () => {
      (api.getUsers as any).mockResolvedValue({ users: [] });

      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No students yet')).toBeInTheDocument();
      });

      expect(screen.getByText('Students will appear here once they sign up')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      expect(screen.getByText('Loading students...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      (api.getUsers as any).mockRejectedValue(new Error('Failed to load students'));

      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load students')).toBeInTheDocument();
      });
    });

    it('should show try again button on error', async () => {
      (api.getUsers as any).mockRejectedValue(new Error('Failed to load students'));

      render(
        <StudentList
          accessToken={mockAccessToken}
          onSelectStudent={mockOnSelectStudent}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load students')).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText('Try Again');
      expect(tryAgainButton).toBeInTheDocument();

      // Mock successful retry
      (api.getUsers as any).mockResolvedValue({ users: mockStudents });
      fireEvent.click(tryAgainButton);

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });
  });
});
