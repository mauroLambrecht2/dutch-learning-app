/**
 * Tests for NotesExport component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotesExport } from '../NotesExport';
import { api } from '../../../utils/api';
import { Note } from '../../../types/notes';

// Mock the API
vi.mock('../../../utils/api', () => ({
  api: {
    getNotes: vi.fn(),
    getNote: vi.fn(),
  },
}));

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
      },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      setTextColor: vi.fn(),
      setDrawColor: vi.fn(),
      text: vi.fn(),
      splitTextToSize: vi.fn((text: string) => [text]),
      getTextWidth: vi.fn(() => 50),
      line: vi.fn(),
      addPage: vi.fn(),
      output: vi.fn(() => new Blob(['test'], { type: 'application/pdf' })),
    })),
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNote: Note = {
  id: '1',
  userId: 'user1',
  lessonId: 'lesson1',
  topicId: 'topic1',
  title: 'Test Note',
  content: 'This is test content',
  tags: ['grammar', 'vocabulary'],
  classInfo: {
    lessonTitle: 'Lesson 1',
    lessonDate: '2024-01-01',
    topicName: 'Greetings',
    level: 'A1',
    seriesInfo: 'Beginner Series',
  },
  vocabulary: [
    {
      word: 'hallo',
      translation: 'hello',
      exampleSentence: 'Hallo, hoe gaat het?',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastEditedAt: '2024-01-01T00:00:00Z',
};

describe('NotesExport', () => {
  const mockOnComplete = vi.fn();
  const mockAccessToken = 'test-token';
  const mockUserId = 'user1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render export options', () => {
    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'all',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Export Notes to PDF')).toBeInTheDocument();
    expect(screen.getByLabelText(/Include class information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Include vocabulary lists/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export to PDF/i })).toBeInTheDocument();
  });

  it('should display correct scope message for single note', () => {
    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'single',
          noteId: '1',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Exporting 1 note')).toBeInTheDocument();
  });

  it('should display correct scope message for topic', () => {
    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'topic',
          topicId: 'topic1',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Exporting all notes from selected topic')).toBeInTheDocument();
  });

  it('should display correct scope message for all notes', () => {
    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'all',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Exporting all your notes')).toBeInTheDocument();
  });

  it('should toggle includeClassInfo option', () => {
    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'all',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    const checkbox = screen.getByLabelText(/Include class information/i);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should toggle includeVocabulary option', () => {
    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'all',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    const checkbox = screen.getByLabelText(/Include vocabulary lists/i);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should export single note successfully', async () => {
    vi.mocked(api.getNote).mockResolvedValue({ note: mockNote });

    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'single',
          noteId: '1',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export to PDF/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(api.getNote).toHaveBeenCalledWith(mockAccessToken, '1');
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should export all notes successfully', async () => {
    vi.mocked(api.getNotes).mockResolvedValue({ notes: [mockNote] });

    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'all',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export to PDF/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(api.getNotes).toHaveBeenCalledWith(mockAccessToken);
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should show loading state during export', async () => {
    vi.mocked(api.getNotes).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ notes: [mockNote] }), 100))
    );

    render(
      <NotesExport
        accessToken={mockAccessToken}
        userId={mockUserId}
        options={{
          scope: 'all',
          includeVocabulary: true,
          includeClassInfo: true,
          format: 'pdf',
        }}
        onComplete={mockOnComplete}
      />
    );

    const exportButton = screen.getByRole('button', { name: /Export to PDF/i });
    fireEvent.click(exportButton);

    expect(screen.getByText('Generating PDF...')).toBeInTheDocument();
    expect(exportButton).toBeDisabled();
  });
});
