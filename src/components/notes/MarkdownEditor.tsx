import React, { useRef, useEffect } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  toolbarMode: 'simple' | 'full';
  onSave?: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing your notes...',
  toolbarMode,
  onSave,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle text insertion at cursor position
  const handleInsert = (syntax: string, wrapSelection: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText: string;
    let newCursorPos: number;

    if (wrapSelection && selectedText) {
      // Wrap selected text with syntax (e.g., **bold**)
      newText = beforeText + syntax + selectedText + syntax + afterText;
      newCursorPos = start + syntax.length + selectedText.length + syntax.length;
    } else if (wrapSelection && !selectedText) {
      // No selection, insert syntax twice and place cursor in between
      newText = beforeText + syntax + syntax + afterText;
      newCursorPos = start + syntax.length;
    } else {
      // Insert syntax at cursor position
      newText = beforeText + syntax + afterText;
      newCursorPos = start + syntax.length;
    }

    onChange(newText);

    // Restore focus and cursor position after React updates
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);

      // Insert tab (2 spaces)
      const newText = beforeText + '  ' + afterText;
      onChange(newText);

      // Move cursor after the inserted spaces
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }

    // Handle Ctrl+S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (onSave) {
        onSave();
      }
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height to scrollHeight to fit content
    textarea.style.height = textarea.scrollHeight + 'px';
  }, [value]);

  return (
    <div className="markdown-editor-container">
      <MarkdownToolbar onInsert={handleInsert} mode={toolbarMode} />
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="markdown-textarea"
        aria-label="Markdown editor"
      />
      <style>{`
        .markdown-editor-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .markdown-textarea {
          width: 100%;
          min-height: 300px;
          padding: 12px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.6;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        .markdown-textarea:focus {
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
        }

        .markdown-textarea::placeholder {
          color: #999;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .markdown-textarea {
            font-size: 16px; /* Prevent zoom on iOS */
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};
