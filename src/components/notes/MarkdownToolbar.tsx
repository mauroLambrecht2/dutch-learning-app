import React, { useEffect } from 'react';

export interface MarkdownToolbarProps {
  onInsert: (syntax: string, wrapSelection?: boolean) => void;
  mode: 'simple' | 'full';
}

interface ToolbarButton {
  label: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  title: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onInsert, mode }) => {
  // Insert functions for each markdown syntax
  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    onInsert(prefix, false);
  };

  const insertBold = () => {
    onInsert('**', true);
  };

  const insertItalic = () => {
    onInsert('*', true);
  };

  const insertUnorderedList = () => {
    onInsert('- ', false);
  };

  const insertOrderedList = () => {
    onInsert('1. ', false);
  };

  const insertLink = () => {
    onInsert('[](url)', false);
  };

  const insertCode = () => {
    onInsert('`', true);
  };

  const insertCodeBlock = () => {
    onInsert('```\n', false);
  };

  const insertTable = () => {
    const table = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
    onInsert(table, false);
  };

  const insertBlockquote = () => {
    onInsert('> ', false);
  };

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when Ctrl/Cmd is pressed
      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertBold();
          break;
        case 'i':
          e.preventDefault();
          insertItalic();
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Define buttons for full mode
  const fullModeButtons: ToolbarButton[] = [
    {
      label: 'H1',
      icon: 'H1',
      action: () => insertHeading(1),
      title: 'Heading 1',
    },
    {
      label: 'H2',
      icon: 'H2',
      action: () => insertHeading(2),
      title: 'Heading 2',
    },
    {
      label: 'H3',
      icon: 'H3',
      action: () => insertHeading(3),
      title: 'Heading 3',
    },
    {
      label: 'B',
      icon: '𝐁',
      action: insertBold,
      shortcut: 'Ctrl+B',
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'I',
      icon: '𝐼',
      action: insertItalic,
      shortcut: 'Ctrl+I',
      title: 'Italic (Ctrl+I)',
    },
    {
      label: '•',
      icon: '•',
      action: insertUnorderedList,
      title: 'Unordered List',
    },
    {
      label: '1.',
      icon: '1.',
      action: insertOrderedList,
      title: 'Ordered List',
    },
    {
      label: '🔗',
      icon: '🔗',
      action: insertLink,
      shortcut: 'Ctrl+K',
      title: 'Link (Ctrl+K)',
    },
    {
      label: '</>',
      icon: '</>',
      action: insertCode,
      title: 'Inline Code',
    },
    {
      label: '{ }',
      icon: '{ }',
      action: insertCodeBlock,
      title: 'Code Block',
    },
    {
      label: '⊞',
      icon: '⊞',
      action: insertTable,
      title: 'Table',
    },
    {
      label: '"',
      icon: '"',
      action: insertBlockquote,
      title: 'Blockquote',
    },
  ];

  // Define buttons for simple mode (only essential buttons)
  const simpleModeButtons: ToolbarButton[] = [
    {
      label: 'B',
      icon: '𝐁',
      action: insertBold,
      shortcut: 'Ctrl+B',
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'I',
      icon: '𝐼',
      action: insertItalic,
      shortcut: 'Ctrl+I',
      title: 'Italic (Ctrl+I)',
    },
    {
      label: '•',
      icon: '•',
      action: insertUnorderedList,
      title: 'Unordered List',
    },
  ];

  const buttons = mode === 'simple' ? simpleModeButtons : fullModeButtons;

  return (
    <div
      className="markdown-toolbar"
      role="toolbar"
      aria-label="Markdown formatting toolbar"
    >
      {buttons.map((button, index) => (
        <button
          key={index}
          type="button"
          onClick={button.action}
          title={button.title}
          className="toolbar-button"
          aria-label={button.title}
        >
          {button.icon}
        </button>
      ))}
      <style>{`
        .markdown-toolbar {
          display: flex;
          gap: 4px;
          padding: 8px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          flex-wrap: wrap;
        }

        .toolbar-button {
          min-width: 36px;
          min-height: 36px;
          padding: 6px 10px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toolbar-button:hover {
          background-color: #e8e8e8;
          border-color: #999;
        }

        .toolbar-button:active {
          background-color: #d8d8d8;
          transform: translateY(1px);
        }

        .toolbar-button:focus {
          outline: 2px solid #4a90e2;
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .toolbar-button {
            min-width: 44px;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
};
