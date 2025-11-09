import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownToolbar } from '../MarkdownToolbar';

describe('MarkdownToolbar', () => {
  let mockOnInsert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnInsert = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Mode', () => {
    it('should render all toolbar buttons in full mode', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      // Check for all buttons by their titles
      expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
      expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
      expect(screen.getByTitle('Heading 3')).toBeInTheDocument();
      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument();
      expect(screen.getByTitle('Unordered List')).toBeInTheDocument();
      expect(screen.getByTitle('Ordered List')).toBeInTheDocument();
      expect(screen.getByTitle('Link (Ctrl+K)')).toBeInTheDocument();
      expect(screen.getByTitle('Inline Code')).toBeInTheDocument();
      expect(screen.getByTitle('Code Block')).toBeInTheDocument();
      expect(screen.getByTitle('Table')).toBeInTheDocument();
      expect(screen.getByTitle('Blockquote')).toBeInTheDocument();
    });

    it('should insert H1 syntax when H1 button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const h1Button = screen.getByTitle('Heading 1');
      fireEvent.click(h1Button);

      expect(mockOnInsert).toHaveBeenCalledWith('# ', false);
    });

    it('should insert H2 syntax when H2 button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const h2Button = screen.getByTitle('Heading 2');
      fireEvent.click(h2Button);

      expect(mockOnInsert).toHaveBeenCalledWith('## ', false);
    });

    it('should insert H3 syntax when H3 button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const h3Button = screen.getByTitle('Heading 3');
      fireEvent.click(h3Button);

      expect(mockOnInsert).toHaveBeenCalledWith('### ', false);
    });

    it('should insert bold syntax when bold button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);

      expect(mockOnInsert).toHaveBeenCalledWith('**', true);
    });

    it('should insert italic syntax when italic button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const italicButton = screen.getByTitle('Italic (Ctrl+I)');
      fireEvent.click(italicButton);

      expect(mockOnInsert).toHaveBeenCalledWith('*', true);
    });

    it('should insert unordered list syntax when list button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const listButton = screen.getByTitle('Unordered List');
      fireEvent.click(listButton);

      expect(mockOnInsert).toHaveBeenCalledWith('- ', false);
    });

    it('should insert ordered list syntax when numbered list button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const orderedListButton = screen.getByTitle('Ordered List');
      fireEvent.click(orderedListButton);

      expect(mockOnInsert).toHaveBeenCalledWith('1. ', false);
    });

    it('should insert link syntax when link button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const linkButton = screen.getByTitle('Link (Ctrl+K)');
      fireEvent.click(linkButton);

      expect(mockOnInsert).toHaveBeenCalledWith('[](url)', false);
    });

    it('should insert inline code syntax when code button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const codeButton = screen.getByTitle('Inline Code');
      fireEvent.click(codeButton);

      expect(mockOnInsert).toHaveBeenCalledWith('`', true);
    });

    it('should insert code block syntax when code block button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const codeBlockButton = screen.getByTitle('Code Block');
      fireEvent.click(codeBlockButton);

      expect(mockOnInsert).toHaveBeenCalledWith('```\n', false);
    });

    it('should insert table syntax when table button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const tableButton = screen.getByTitle('Table');
      fireEvent.click(tableButton);

      const expectedTable = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
      expect(mockOnInsert).toHaveBeenCalledWith(expectedTable, false);
    });

    it('should insert blockquote syntax when blockquote button is clicked', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const blockquoteButton = screen.getByTitle('Blockquote');
      fireEvent.click(blockquoteButton);

      expect(mockOnInsert).toHaveBeenCalledWith('> ', false);
    });
  });

  describe('Simple Mode', () => {
    it('should render only essential buttons in simple mode', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="simple" />);

      // Should have these buttons
      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument();
      expect(screen.getByTitle('Unordered List')).toBeInTheDocument();

      // Should NOT have these buttons
      expect(screen.queryByTitle('Heading 1')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Link (Ctrl+K)')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Table')).not.toBeInTheDocument();
    });

    it('should insert bold syntax in simple mode', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="simple" />);

      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);

      expect(mockOnInsert).toHaveBeenCalledWith('**', true);
    });

    it('should insert italic syntax in simple mode', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="simple" />);

      const italicButton = screen.getByTitle('Italic (Ctrl+I)');
      fireEvent.click(italicButton);

      expect(mockOnInsert).toHaveBeenCalledWith('*', true);
    });

    it('should insert list syntax in simple mode', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="simple" />);

      const listButton = screen.getByTitle('Unordered List');
      fireEvent.click(listButton);

      expect(mockOnInsert).toHaveBeenCalledWith('- ', false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle Ctrl+B keyboard shortcut for bold', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'b', ctrlKey: true });

      expect(mockOnInsert).toHaveBeenCalledWith('**', true);
    });

    it('should handle Ctrl+I keyboard shortcut for italic', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'i', ctrlKey: true });

      expect(mockOnInsert).toHaveBeenCalledWith('*', true);
    });

    it('should handle Ctrl+K keyboard shortcut for link', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

      expect(mockOnInsert).toHaveBeenCalledWith('[](url)', false);
    });

    it('should handle Cmd+B keyboard shortcut for bold on Mac', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'b', metaKey: true });

      expect(mockOnInsert).toHaveBeenCalledWith('**', true);
    });

    it('should handle Cmd+I keyboard shortcut for italic on Mac', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'i', metaKey: true });

      expect(mockOnInsert).toHaveBeenCalledWith('*', true);
    });

    it('should not trigger shortcuts without Ctrl or Cmd key', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'b' });

      expect(mockOnInsert).not.toHaveBeenCalled();
    });

    it('should handle uppercase keyboard shortcuts', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      fireEvent.keyDown(document, { key: 'B', ctrlKey: true });

      expect(mockOnInsert).toHaveBeenCalledWith('**', true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role for toolbar', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('aria-label', 'Markdown formatting toolbar');
    });

    it('should have aria-label for each button', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      expect(boldButton).toHaveAttribute('aria-label', 'Bold (Ctrl+B)');
    });

    it('should have proper button type', () => {
      render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Event Cleanup', () => {
    it('should remove keyboard event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(<MarkdownToolbar onInsert={mockOnInsert} mode="full" />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
