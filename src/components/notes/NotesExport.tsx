import { useState } from "react";
import { api } from "../../utils/api";
import { Note, NotesExportOptions } from "../../types/notes";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Download, Loader2, FileText } from "lucide-react";
import jsPDF from "jspdf";

interface NotesExportProps {
  accessToken: string;
  userId: string;
  options: NotesExportOptions;
  onComplete: () => void;
}

export function NotesExport({
  accessToken,
  userId,
  options: initialOptions,
  onComplete,
}: NotesExportProps) {
  const [options, setOptions] = useState<NotesExportOptions>(initialOptions);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>("");

  const handleExport = async (retryCount = 0) => {
    setExporting(true);
    setExportProgress("Preparing export...");
    
    try {
      // Fetch notes based on export scope
      setExportProgress("Fetching notes...");
      let notes: Note[] = [];
      
      if (options.scope === 'single' && options.noteId) {
        const response = await api.getNote(accessToken, options.noteId);
        notes = [response.note];
      } else if (options.scope === 'topic' && options.topicId) {
        const response = await api.getNotes(accessToken, { topicId: options.topicId });
        notes = response.notes;
      } else if (options.scope === 'all') {
        const response = await api.getNotes(accessToken);
        notes = response.notes;
      }

      if (notes.length === 0) {
        toast.error('No notes found to export');
        setExporting(false);
        setExportProgress("");
        return;
      }

      // Generate PDF
      setExportProgress(`Generating PDF (${notes.length} ${notes.length === 1 ? 'note' : 'notes'})...`);
      const pdfBlob = generateNotesPDF(notes, options);
      
      // Trigger download
      setExportProgress("Downloading...");
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notes-${options.scope}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Notes exported successfully');
      onComplete();
    } catch (error) {
      console.error('Failed to export notes:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to export notes";
      
      toast.error('Failed to export notes', {
        description: errorMessage,
        action: retryCount < 2 ? {
          label: "Retry",
          onClick: () => handleExport(retryCount + 1),
        } : undefined,
      });
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  };

  const generateNotesPDF = (notes: Note[], options: NotesExportOptions): Blob => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('My Dutch Learning Notes', margin, yPosition);
    yPosition += 15;

    // Add export date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Process each note
    notes.forEach((note, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Note title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(note.title, maxWidth);
      doc.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 7;

      // Add class info if enabled
      if (options.includeClassInfo && note.classInfo) {
        yPosition += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        
        doc.text(`Lesson: ${note.classInfo.lessonTitle}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Date: ${note.classInfo.lessonDate}`, margin, yPosition);
        yPosition += 6;
        doc.text(`Topic: ${note.classInfo.topicName} | Level: ${note.classInfo.level}`, margin, yPosition);
        yPosition += 6;
        
        if (note.classInfo.seriesInfo) {
          doc.text(`Series: ${note.classInfo.seriesInfo}`, margin, yPosition);
          yPosition += 6;
        }
        
        doc.setTextColor(0, 0, 0);
        yPosition += 5;
      }

      // Add tags if present
      if (note.tags && note.tags.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Tags: ${note.tags.join(', ')}`, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 8;
      }

      // Add manual notes content
      if (note.content) {
        yPosition += 3;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const contentLines = doc.splitTextToSize(note.content, maxWidth);
        
        contentLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
      }

      // Add vocabulary if enabled
      if (options.includeVocabulary && note.vocabulary && note.vocabulary.length > 0) {
        yPosition += 8;
        
        // Check if we need a new page for vocabulary section
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Vocabulary', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        note.vocabulary.forEach((vocab) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Word and translation
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${vocab.word}`, margin + 5, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(` - ${vocab.translation}`, margin + 5 + doc.getTextWidth(`• ${vocab.word}`), yPosition);
          yPosition += 6;
          
          // Example sentence if present
          if (vocab.exampleSentence) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(80, 80, 80);
            const exampleLines = doc.splitTextToSize(`Example: ${vocab.exampleSentence}`, maxWidth - 10);
            exampleLines.forEach((line: string) => {
              if (yPosition > pageHeight - 20) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(line, margin + 10, yPosition);
              yPosition += 6;
            });
            doc.setTextColor(0, 0, 0);
          }
          
          yPosition += 2;
        });
      }

      // Add separator between notes (except for last note)
      if (index < notes.length - 1) {
        yPosition += 10;
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        } else {
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 15;
        }
      }
    });

    return doc.output('blob');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Export Notes to PDF</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeClassInfo"
            checked={options.includeClassInfo}
            onCheckedChange={(checked) =>
              setOptions({ ...options, includeClassInfo: checked as boolean })
            }
          />
          <Label htmlFor="includeClassInfo" className="text-sm cursor-pointer">
            Include class information (lesson title, date, topic, level)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeVocabulary"
            checked={options.includeVocabulary}
            onCheckedChange={(checked) =>
              setOptions({ ...options, includeVocabulary: checked as boolean })
            }
          />
          <Label htmlFor="includeVocabulary" className="text-sm cursor-pointer">
            Include vocabulary lists from lessons
          </Label>
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {exportProgress || "Exporting..."}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </>
          )}
        </Button>
      </div>

      {!exporting && (
        <p className="text-xs text-gray-500 text-center">
          {options.scope === 'single' && 'Exporting 1 note'}
          {options.scope === 'topic' && 'Exporting all notes from selected topic'}
          {options.scope === 'all' && 'Exporting all your notes'}
        </p>
      )}
      
      {exporting && exportProgress && (
        <p className="text-xs text-blue-600 text-center animate-pulse">
          {exportProgress}
        </p>
      )}
    </div>
  );
}
