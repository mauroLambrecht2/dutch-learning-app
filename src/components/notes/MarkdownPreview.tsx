import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownPreview.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

export interface MarkdownPreviewRef {
  scrollTo: (scrollTop: number) => void;
  getScrollInfo: () => { scrollTop: number; scrollHeight: number; clientHeight: number };
}

export const MarkdownPreview = forwardRef<MarkdownPreviewRef, MarkdownPreviewProps>(
  ({ content, className = '', onScroll }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollTo: (scrollTop: number) => {
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollTop;
        }
      },
      getScrollInfo: () => {
        if (containerRef.current) {
          return {
            scrollTop: containerRef.current.scrollTop,
            scrollHeight: containerRef.current.scrollHeight,
            clientHeight: containerRef.current.clientHeight,
          };
        }
        return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
      },
    }));

    const handleScroll = () => {
      if (containerRef.current && onScroll) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        onScroll(scrollTop, scrollHeight, clientHeight);
      }
    };

    return (
      <div
        ref={containerRef}
        className={`markdown-preview ${className}`}
        onScroll={handleScroll}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);
