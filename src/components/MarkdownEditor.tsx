import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Link as LinkIcon, Image } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = '200px' }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code inline
    html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-800">$1</code>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>');

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li class="ml-4">.*<\/li>)/s, '<ul class="list-disc ml-4 space-y-1">$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-3">');
    html = html.replace(/\n/g, '<br/>');

    return '<p class="mb-3">' + html + '</p>';
  };

  return (
    <div className="border border-zinc-200 bg-white">
      {/* Toolbar */}
      <div className="border-b border-zinc-200 p-2 flex items-center gap-1 flex-wrap bg-zinc-50">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('# ', '')}
          title="Heading 1"
          className="h-7 px-2"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('## ', '')}
          title="Heading 2"
          className="h-7 px-2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-zinc-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('**', '**')}
          title="Bold"
          className="h-7 px-2"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('*', '*')}
          title="Italic"
          className="h-7 px-2"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('`', '`')}
          title="Code"
          className="h-7 px-2"
        >
          <Code className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-zinc-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('* ', '')}
          title="Bullet List"
          className="h-7 px-2"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('1. ', '')}
          title="Numbered List"
          className="h-7 px-2"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('[', '](url)')}
          title="Link"
          className="h-7 px-2"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'edit' | 'preview')} className="w-full">
        <TabsList className="w-full rounded-none border-b border-zinc-200 bg-transparent h-9">
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600">
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your content here. Supports **bold**, *italic*, # headers, lists, and more...'}
            className="border-0 rounded-none focus-visible:ring-0 font-mono text-sm"
            style={{ minHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0 p-4" style={{ minHeight }}>
          {value ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          ) : (
            <p className="text-zinc-400 italic">Nothing to preview yet. Start writing in the Edit tab.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
