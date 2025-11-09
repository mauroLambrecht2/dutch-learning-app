import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkdownEditor } from '../MarkdownEditor';

describe('MarkdownEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSave = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render textarea with placeholder', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          placeholder="Test placeholder"
          toolbarMode="full"
        />
      );

      const textarea = screen.getByPlaceholderText('Test placeholder');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with default placeholder', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByPlaceholderText('Start typing your notes...');
      expect(textarea).toBeInTheDocument();
    });

    it('should render MarkdownToolbar in full mode', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('should render MarkdownToolbar in simple mode', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="simple"
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
    });

    it('should display initial value', () => {
      render(
        <MarkdownEditor
          value="Initial content"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial content');
    });
  });

  describe('Text Input', () => {
    it('should call onChange when typing', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New text' } });

      expect(mockOnChange).toHaveBeenCalledWith('New text');
    });

    it('should update value when typing', () => {
      const { rerender } = render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Updated text' } });

      rerender(
        <MarkdownEditor
          value="Updated text"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      expect(textarea.value).toBe('Updated text');
    });
  });

  describe('Text Insertion at Cursor Position', () => {
    it('should insert text at cursor position', async () => {
      render(
        <MarkdownEditor
          value="Hello world"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Set cursor position to index 5 (after "Hello")
      textarea.setSelectionRange(5, 5);
      textarea.focus();

      // Click bold button to insert **
      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('Hello**** world');
    });

    it('should insert text at beginning', async () => {
      render(
        <MarkdownEditor
          value="world"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(0, 0);
      textarea.focus();

      const h1Button = screen.getByTitle('Heading 1');
      fireEvent.click(h1Button);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('# world');
    });

    it('should insert text at end', async () => {
      render(
        <MarkdownEditor
          value="Hello"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(5, 5);
      textarea.focus();

      const listButton = screen.getByTitle('Unordered List');
      fireEvent.click(listButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('Hello- ');
    });
  });

  describe('Text Wrapping for Selected Text', () => {
    it('should wrap selected text with bold syntax', async () => {
      render(
        <MarkdownEditor
          value="Hello world"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Select "world" (indices 6-11)
      textarea.setSelectionRange(6, 11);
      textarea.focus();

      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('Hello **world**');
    });

    it('should wrap selected text with italic syntax', async () => {
      render(
        <MarkdownEditor
          value="Hello world"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(0, 5);
      textarea.focus();

      const italicButton = screen.getByTitle('Italic (Ctrl+I)');
      fireEvent.click(italicButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('*Hello* world');
    });

    it('should wrap selected text with code syntax', async () => {
      render(
        <MarkdownEditor
          value="const x = 5"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(0, 11);
      textarea.focus();

      const codeButton = screen.getByTitle('Inline Code');
      fireEvent.click(codeButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('`const x = 5`');
    });

    it('should insert double syntax when no text selected for wrapping', async () => {
      render(
        <MarkdownEditor
          value="Hello"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(5, 5);
      textarea.focus();

      const boldButton = screen.getByTitle('Bold (Ctrl+B)');
      fireEvent.click(boldButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('Hello****');
    });
  });

  describe('Tab Key Handling', () => {
    it('should insert spaces on tab key', () => {
      render(
        <MarkdownEditor
          value="Hello"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(5, 5);
      textarea.focus();

      fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('Hello  ');
    });

    it('should insert spaces at cursor position on tab', () => {
      render(
        <MarkdownEditor
          value="Hello world"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      textarea.setSelectionRange(5, 5);
      textarea.focus();

      fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('Hello   world');
    });

    it('should prevent default tab behavior', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox');
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      fireEvent(textarea, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave when Ctrl+S is pressed', () => {
      render(
        <MarkdownEditor
          value="Test content"
          onChange={mockOnChange}
          toolbarMode="full"
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should call onSave when Cmd+S is pressed (Mac)', () => {
      render(
        <MarkdownEditor
          value="Test content"
          onChange={mockOnChange}
          toolbarMode="full"
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.keyDown(textarea, { key: 's', metaKey: true });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should prevent default save behavior', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByRole('textbox');
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true, 
        bubbles: true 
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      fireEvent(textarea, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not error when onSave is not provided', () => {
      render(
        <MarkdownEditor
          value="Test content"
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox');
      
      expect(() => {
        fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });
      }).not.toThrow();
    });
  });

  describe('Toolbar Integration', () => {
    it('should insert heading when H1 button clicked', async () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const h1Button = screen.getByTitle('Heading 1');
      fireEvent.click(h1Button);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('# ');
    });

    it('should insert list when list button clicked', async () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const listButton = screen.getByTitle('Unordered List');
      fireEvent.click(listButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('- ');
    });

    it('should insert link syntax when link button clicked', async () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const linkButton = screen.getByTitle('Link (Ctrl+K)');
      fireEvent.click(linkButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith('[](url)');
    });

    it('should insert table when table button clicked', async () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const tableButton = screen.getByTitle('Table');
      fireEvent.click(tableButton);

      vi.runAllTimers();

      expect(mockOnChange).toHaveBeenCalledWith(
        '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on textarea', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByLabelText('Markdown editor');
      expect(textarea).toBeInTheDocument();
    });

    it('should be focusable', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox');
      textarea.focus();

      expect(document.activeElement).toBe(textarea);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(10000);
      render(
        <MarkdownEditor
          value={longText}
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(
        <MarkdownEditor
          value={specialText}
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      render(
        <MarkdownEditor
          value={multilineText}
          onChange={mockOnChange}
          toolbarMode="full"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineText);
    });
  });
});
