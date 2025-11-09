import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClassPlayer } from '../ClassPlayer';
import { api } from '../../utils/api';

// Mock dependencies
vi.mock('../../utils/api');
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock child components
vi.mock('../pages/IntroPage', () => ({
  IntroPage: ({ page }: any) => <div data-testid="intro-page">{page.title}</div>,
}));

vi.mock('../pages/VocabularyPage', () => ({
  VocabularyPage: ({ page }: any) => <div data-testid="vocabulary-page">{page.title}</div>,
}));

vi.mock('../notes/SimpleNoteEditor', () => ({
  SimpleNoteEditor: ({ lessonData, onClose }: any) => (
    <div data-testid="simple-note-editor">
      <div data-testid="lesson-title">{lessonData.title}</div>
      <div data-testid="lesson-date">{lessonData.date}</div>
      <div data-testid="lesson-topic">{lessonData.topicName}</div>
      <div data-testid="lesson-level">{lessonData.level}</div>
      <div data-testid="vocabulary-count">{lessonData.vocabulary.length}</div>
      <button onClick={onClose} data-testid="close-editor">Close</button>
    </div>
  ),
}));

describe('ClassPlayer - SimpleNoteEditor Integration', () => {
  const mockClassData = {
    id: 'lesson-123',
    topicId: 'topic-456',
    title: 'Dutch Greetings',
    topic: 'Greetings',
    level: 'Beginner',
    pages: [
      {
        type: 'intro',
        title: 'Introduction',
        content: { text: 'Welcome to the lesson' },
      },
      {
        type: 'vocabulary',
        title: 'Vocabulary',
        content: {
          items: [
            {
              dutch: 'Hallo',
              english: 'Hello',
              example: 'Hallo, hoe gaat het?',
            },
            {
              dutch: 'Goedemorgen',
              english: 'Good morning',
              example: 'Goedemorgen, meneer.',
            },
          ],
        },
      },
    ],
  };

  const mockOnComplete = vi.fn();
  const mockOnExit = vi.fn();
  const mockAccessToken = 'test-token-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SimpleNoteEditor Integration', () => {
    it('should show "Take Notes" button when user is logged in', () => {
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      expect(screen.getByText('Take Notes')).toBeInTheDocument();
    });

    it('should not show "Take Notes" button when user is not logged in', () => {
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );

      expect(screen.queryByText('Take Notes')).not.toBeInTheDocument();
    });

    it('should open SimpleNoteEditor when "Take Notes" is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      const takeNotesButton = screen.getByText('Take Notes');
      await user.click(takeNotesButton);

      await waitFor(() => {
        expect(screen.getByTestId('simple-note-editor')).toBeInTheDocument();
      });
    });

    it('should pass correct lesson data to SimpleNoteEditor', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const editor = screen.getByTestId('simple-note-editor');
        expect(within(editor).getByTestId('lesson-title')).toHaveTextContent('Dutch Greetings');
        expect(within(editor).getByTestId('lesson-topic')).toHaveTextContent('Greetings');
        expect(within(editor).getByTestId('lesson-level')).toHaveTextContent('Beginner');
      });
    });

    it('should extract and pass vocabulary from lesson pages', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const editor = screen.getByTestId('simple-note-editor');
        expect(within(editor).getByTestId('vocabulary-count')).toHaveTextContent('2');
      });
    });

    it('should close SimpleNoteEditor when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));
      
      await waitFor(() => {
        expect(screen.getByTestId('simple-note-editor')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('close-editor'));

      await waitFor(() => {
        expect(screen.queryByTestId('simple-note-editor')).not.toBeInTheDocument();
      });
    });

    it('should toggle button text when editor is opened/closed', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      const button = screen.getByText('Take Notes');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Hide Notes')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('close-editor'));

      await waitFor(() => {
        expect(screen.getByText('Take Notes')).toBeInTheDocument();
      });
    });

    it('should handle lessons without vocabulary pages', async () => {
      const user = userEvent.setup();
      const classDataNoVocab = {
        ...mockClassData,
        pages: [
          {
            type: 'intro',
            title: 'Introduction',
            content: { text: 'Welcome' },
          },
        ],
      };

      render(
        <ClassPlayer
          classData={classDataNoVocab}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const editor = screen.getByTestId('simple-note-editor');
        expect(within(editor).getByTestId('vocabulary-count')).toHaveTextContent('0');
      });
    });

    it('should handle lessons with missing metadata gracefully', async () => {
      const user = userEvent.setup();
      const minimalClassData = {
        id: 'lesson-123',
        pages: [],
      };

      render(
        <ClassPlayer
          classData={minimalClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const editor = screen.getByTestId('simple-note-editor');
        expect(within(editor).getByTestId('lesson-title')).toHaveTextContent('Untitled Lesson');
        expect(within(editor).getByTestId('lesson-topic')).toHaveTextContent('General');
        expect(within(editor).getByTestId('lesson-level')).toHaveTextContent('Intermediate');
      });
    });

    it('should maintain note editor state while navigating lesson pages', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      // Open note editor
      await user.click(screen.getByText('Take Notes'));
      
      await waitFor(() => {
        expect(screen.getByTestId('simple-note-editor')).toBeInTheDocument();
      });

      // Navigate to next page
      await user.click(screen.getByText('Next'));

      // Note editor should still be visible
      expect(screen.getByTestId('simple-note-editor')).toBeInTheDocument();
      expect(screen.getByTestId('vocabulary-page')).toBeInTheDocument();
    });

    it('should extract vocabulary with various field names', async () => {
      const user = userEvent.setup();
      const classDataVariedFields = {
        ...mockClassData,
        pages: [
          {
            type: 'vocabulary',
            title: 'Vocabulary',
            content: {
              items: [
                {
                  word: 'Dag',
                  translation: 'Day',
                  exampleSentence: 'Een mooie dag.',
                },
              ],
            },
          },
        ],
      };

      render(
        <ClassPlayer
          classData={classDataVariedFields}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const editor = screen.getByTestId('simple-note-editor');
        expect(within(editor).getByTestId('vocabulary-count')).toHaveTextContent('1');
      });
    });
  });

  describe('Auto-save functionality', () => {
    it('should pass correct props for auto-save to SimpleNoteEditor', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const editor = screen.getByTestId('simple-note-editor');
        expect(editor).toBeInTheDocument();
        // SimpleNoteEditor handles auto-save internally
      });
    });
  });

  describe('Layout and responsiveness', () => {
    it('should adjust main content width when note editor is open', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      // Find the main content area by its class structure
      const mainContent = container.querySelector('.flex-1.flex.flex-col');
      expect(mainContent).toHaveClass('w-full');

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        expect(mainContent).toHaveClass('w-1/2');
      });
    });

    it('should display note editor in side panel layout', async () => {
      const user = userEvent.setup();
      
      render(
        <ClassPlayer
          classData={mockClassData}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
          accessToken={mockAccessToken}
        />
      );

      await user.click(screen.getByText('Take Notes'));

      await waitFor(() => {
        const sidePanel = screen.getByTestId('simple-note-editor').closest('.w-1\\/2');
        expect(sidePanel).toBeInTheDocument();
      });
    });
  });
});
