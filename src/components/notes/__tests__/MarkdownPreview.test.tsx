import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownPreview, MarkdownPreviewRef } from '../MarkdownPreview';
import { createRef } from 'react';

describe('MarkdownPreview', () => {
  it('renders basic text content', () => {
    const content = 'Hello, world!';
    render(<MarkdownPreview content={content} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders headings correctly', () => {
    const content = `# Heading 1
## Heading 2
### Heading 3`;
    render(<MarkdownPreview content={content} />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Heading 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Heading 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Heading 3' })).toBeInTheDocument();
  });

  it('renders bold and italic text', () => {
    const content = '**bold text** and *italic text*';
    const { container } = render(<MarkdownPreview content={content} />);
    
    expect(container.querySelector('strong')).toHaveTextContent('bold text');
    expect(container.querySelector('em')).toHaveTextContent('italic text');
  });

  it('renders unordered lists', () => {
    const content = `- Item 1
- Item 2
- Item 3`;
    render(<MarkdownPreview content={content} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders ordered lists', () => {
    const content = `1. First
2. Second
3. Third`;
    render(<MarkdownPreview content={content} />);
    
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders links correctly', () => {
    const content = '[Click here](https://example.com)';
    render(<MarkdownPreview content={content} />);
    
    const link = screen.getByRole('link', { name: 'Click here' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders inline code', () => {
    const content = 'Use `console.log()` to debug';
    const { container } = render(<MarkdownPreview content={content} />);
    
    expect(container.querySelector('code')).toHaveTextContent('console.log()');
  });

  it('renders code blocks', () => {
    const content = '```javascript\nconst x = 10;\n```';
    const { container } = render(<MarkdownPreview content={content} />);
    
    const codeBlock = container.querySelector('pre code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent('const x = 10;');
  });

  it('renders tables with GFM plugin', () => {
    const content = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;
    render(<MarkdownPreview content={content} />);
    
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('renders blockquotes', () => {
    const content = '> This is a quote';
    const { container } = render(<MarkdownPreview content={content} />);
    
    expect(container.querySelector('blockquote')).toHaveTextContent('This is a quote');
  });

  it('renders strikethrough text with GFM plugin', () => {
    const content = '~~strikethrough~~';
    const { container } = render(<MarkdownPreview content={content} />);
    
    expect(container.querySelector('del')).toHaveTextContent('strikethrough');
  });

  it('renders task lists with GFM plugin', () => {
    const content = `- [x] Completed task
- [ ] Incomplete task`;
    const { container } = render(<MarkdownPreview content={content} />);
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('renders horizontal rules', () => {
    const content = 'Text above\n\n---\n\nText below';
    const { container } = render(<MarkdownPreview content={content} />);
    
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const content = 'Test content';
    const { container } = render(<MarkdownPreview content={content} className="custom-class" />);
    
    expect(container.querySelector('.markdown-preview')).toHaveClass('custom-class');
  });

  it('renders complex nested markdown', () => {
    const content = `# Main Title

## Section 1

This is a paragraph with **bold** and *italic* text.

- List item 1
  - Nested item 1
  - Nested item 2
- List item 2

### Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Table

| Dutch | English | Example |
|-------|---------|---------|
| hallo | hello   | Hallo! |
| dag   | day     | Goede dag |

> Important note: This is a blockquote.`;

    render(<MarkdownPreview content={content} />);
    
    expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Section 1' })).toBeInTheDocument();
    expect(screen.getByText('Dutch')).toBeInTheDocument();
    expect(screen.getByText('hallo')).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const { container } = render(<MarkdownPreview content="" />);
    expect(container.querySelector('.markdown-preview')).toBeInTheDocument();
  });

  it('renders multiple paragraphs', () => {
    const content = `First paragraph.

Second paragraph.

Third paragraph.`;
    render(<MarkdownPreview content={content} />);
    
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Third paragraph.')).toBeInTheDocument();
  });

  describe('Scroll Sync', () => {
    it('calls onScroll callback when scrolling', () => {
      const onScroll = vi.fn();
      const content = 'Test content';
      const { container } = render(<MarkdownPreview content={content} onScroll={onScroll} />);
      
      const previewDiv = container.querySelector('.markdown-preview');
      expect(previewDiv).toBeInTheDocument();
      
      // Mock scroll properties
      Object.defineProperty(previewDiv, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(previewDiv, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(previewDiv, 'clientHeight', { value: 500, writable: true });
      
      fireEvent.scroll(previewDiv!);
      
      expect(onScroll).toHaveBeenCalledWith(100, 1000, 500);
    });

    it('exposes scrollTo method via ref', () => {
      const ref = createRef<MarkdownPreviewRef>();
      const content = 'Test content';
      const { container } = render(<MarkdownPreview ref={ref} content={content} />);
      
      const previewDiv = container.querySelector('.markdown-preview') as HTMLDivElement;
      expect(previewDiv).toBeInTheDocument();
      
      // Mock scrollTop property
      Object.defineProperty(previewDiv, 'scrollTop', { value: 0, writable: true });
      
      // Call scrollTo via ref
      ref.current?.scrollTo(200);
      
      expect(previewDiv.scrollTop).toBe(200);
    });

    it('exposes getScrollInfo method via ref', () => {
      const ref = createRef<MarkdownPreviewRef>();
      const content = 'Test content';
      const { container } = render(<MarkdownPreview ref={ref} content={content} />);
      
      const previewDiv = container.querySelector('.markdown-preview');
      expect(previewDiv).toBeInTheDocument();
      
      // Mock scroll properties
      Object.defineProperty(previewDiv, 'scrollTop', { value: 150, writable: true });
      Object.defineProperty(previewDiv, 'scrollHeight', { value: 2000, writable: true });
      Object.defineProperty(previewDiv, 'clientHeight', { value: 600, writable: true });
      
      const scrollInfo = ref.current?.getScrollInfo();
      
      expect(scrollInfo).toEqual({
        scrollTop: 150,
        scrollHeight: 2000,
        clientHeight: 600,
      });
    });

    it('handles getScrollInfo when ref is not attached', () => {
      const ref = createRef<MarkdownPreviewRef>();
      const content = 'Test content';
      render(<MarkdownPreview ref={ref} content={content} />);
      
      // Create a new ref that's not attached
      const detachedRef = createRef<MarkdownPreviewRef>();
      
      const scrollInfo = detachedRef.current?.getScrollInfo();
      
      expect(scrollInfo).toBeUndefined();
    });

    it('does not call onScroll when callback is not provided', () => {
      const content = 'Test content';
      const { container } = render(<MarkdownPreview content={content} />);
      
      const previewDiv = container.querySelector('.markdown-preview');
      expect(previewDiv).toBeInTheDocument();
      
      // Should not throw error when scrolling without onScroll callback
      expect(() => {
        fireEvent.scroll(previewDiv!);
      }).not.toThrow();
    });
  });
});
