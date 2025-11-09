/**
 * Unit tests for note template generation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateVocabularyTable,
  generateClassInfoSection,
  generateNoteTemplate,
  NoteTemplateData,
} from '../NoteTemplate';
import { ClassInfo, VocabularyItem } from '../../../types/notes';

describe('NoteTemplate', () => {
  describe('generateVocabularyTable', () => {
    it('should generate a markdown table with vocabulary items', () => {
      const vocabulary: VocabularyItem[] = [
        {
          word: 'huis',
          translation: 'house',
          exampleSentence: 'Ik woon in een groot huis.',
        },
        {
          word: 'kat',
          translation: 'cat',
          exampleSentence: 'De kat slaapt op de bank.',
        },
      ];

      const result = generateVocabularyTable(vocabulary);

      expect(result).toContain('| Dutch | English | Example |');
      expect(result).toContain('|-------|---------|---------|');
      expect(result).toContain('| huis | house | Ik woon in een groot huis. |');
      expect(result).toContain('| kat | cat | De kat slaapt op de bank. |');
    });

    it('should handle vocabulary items without example sentences', () => {
      const vocabulary: VocabularyItem[] = [
        {
          word: 'boek',
          translation: 'book',
        },
      ];

      const result = generateVocabularyTable(vocabulary);

      expect(result).toContain('| boek | book | - |');
    });

    it('should return empty table structure for empty vocabulary array', () => {
      const result = generateVocabularyTable([]);

      expect(result).toContain('| Dutch | English | Example |');
      expect(result).toContain('|-------|---------|---------|');
      expect(result).toContain('| - | - | - |');
    });

    it('should handle undefined vocabulary', () => {
      const result = generateVocabularyTable(undefined as any);

      expect(result).toContain('| Dutch | English | Example |');
      expect(result).toContain('| - | - | - |');
    });

    it('should handle vocabulary items with missing fields', () => {
      const vocabulary: VocabularyItem[] = [
        {
          word: '',
          translation: '',
          exampleSentence: '',
        },
      ];

      const result = generateVocabularyTable(vocabulary);

      expect(result).toContain('| - | - | - |');
    });
  });

  describe('generateClassInfoSection', () => {
    it('should generate a markdown section with all class information', () => {
      const classInfo: ClassInfo = {
        lessonTitle: 'Introduction to Dutch Grammar',
        lessonDate: '2025-11-08',
        topicName: 'Grammar Basics',
        level: 'A1',
      };

      const result = generateClassInfoSection(classInfo);

      expect(result).toContain('## Class Information');
      expect(result).toContain('- **Lesson**: Introduction to Dutch Grammar');
      expect(result).toContain('- **Date**: 2025-11-08');
      expect(result).toContain('- **Topic**: Grammar Basics');
      expect(result).toContain('- **Level**: A1');
    });

    it('should include series info when provided', () => {
      const classInfo: ClassInfo = {
        lessonTitle: 'Lesson 5',
        lessonDate: '2025-11-08',
        topicName: 'Verbs',
        level: 'A2',
        seriesInfo: 'Dutch Fundamentals Series',
      };

      const result = generateClassInfoSection(classInfo);

      expect(result).toContain('- **Series**: Dutch Fundamentals Series');
    });

    it('should handle missing optional fields', () => {
      const classInfo: ClassInfo = {
        lessonTitle: '',
        lessonDate: '',
        topicName: '',
        level: '',
      };

      const result = generateClassInfoSection(classInfo);

      expect(result).toContain('- **Lesson**: N/A');
      expect(result).toContain('- **Date**: N/A');
      expect(result).toContain('- **Topic**: N/A');
      expect(result).toContain('- **Level**: N/A');
    });
  });

  describe('generateNoteTemplate', () => {
    it('should generate a complete template with all sections', () => {
      const data: NoteTemplateData = {
        lessonTitle: 'Dutch Pronunciation',
        lessonDate: '2025-11-08',
        topicName: 'Pronunciation',
        level: 'A1',
        vocabulary: [
          {
            word: 'goed',
            translation: 'good',
            exampleSentence: 'Dat is goed.',
          },
        ],
      };

      const result = generateNoteTemplate(data);

      // Check title
      expect(result).toContain('# Dutch Pronunciation');

      // Check class info section
      expect(result).toContain('## Class Information');
      expect(result).toContain('- **Lesson**: Dutch Pronunciation');
      expect(result).toContain('- **Date**: 2025-11-08');

      // Check vocabulary section
      expect(result).toContain('## Vocabulary');
      expect(result).toContain('| goed | good | Dat is goed. |');

      // Check other sections
      expect(result).toContain('## My Notes');
      expect(result).toContain('[Your notes here...]');
      expect(result).toContain('## Key Concepts');
      expect(result).toContain('## Questions');
    });

    it('should generate template with empty data', () => {
      const result = generateNoteTemplate();

      expect(result).toContain('# New Note');
      expect(result).toContain('## Class Information');
      expect(result).toContain('- **Lesson**: ');
      expect(result).toContain('## Vocabulary');
      expect(result).toContain('| - | - | - |');
      expect(result).toContain('## My Notes');
      expect(result).toContain('## Key Concepts');
      expect(result).toContain('## Questions');
    });

    it('should generate template with partial data', () => {
      const data: NoteTemplateData = {
        lessonTitle: 'Quick Lesson',
        topicName: 'Speaking',
      };

      const result = generateNoteTemplate(data);

      expect(result).toContain('# Quick Lesson');
      expect(result).toContain('- **Lesson**: Quick Lesson');
      expect(result).toContain('- **Topic**: Speaking');
      expect(result).toContain('- **Date**: N/A');
      expect(result).toContain('- **Level**: N/A');
    });

    it('should handle empty vocabulary array', () => {
      const data: NoteTemplateData = {
        lessonTitle: 'Test Lesson',
        vocabulary: [],
      };

      const result = generateNoteTemplate(data);

      expect(result).toContain('## Vocabulary');
      expect(result).toContain('| - | - | - |');
    });

    it('should include series info in template when provided', () => {
      const data: NoteTemplateData = {
        lessonTitle: 'Advanced Grammar',
        lessonDate: '2025-11-08',
        topicName: 'Complex Sentences',
        level: 'B2',
        seriesInfo: 'Advanced Dutch Course',
      };

      const result = generateNoteTemplate(data);

      expect(result).toContain('- **Series**: Advanced Dutch Course');
    });

    it('should maintain proper markdown structure', () => {
      const result = generateNoteTemplate();

      // Check that sections are properly separated with blank lines
      expect(result).toMatch(/## Class Information\n\n/);
      expect(result).toMatch(/## Vocabulary\n\n/);
      expect(result).toMatch(/## My Notes\n\n/);
      expect(result).toMatch(/## Key Concepts\n\n/);
      expect(result).toMatch(/## Questions\n\n/);
    });

    it('should handle multiple vocabulary items correctly', () => {
      const data: NoteTemplateData = {
        lessonTitle: 'Vocabulary Practice',
        vocabulary: [
          { word: 'een', translation: 'a/an' },
          { word: 'de', translation: 'the' },
          { word: 'het', translation: 'the', exampleSentence: 'Het boek is rood.' },
        ],
      };

      const result = generateNoteTemplate(data);

      expect(result).toContain('| een | a/an | - |');
      expect(result).toContain('| de | the | - |');
      expect(result).toContain('| het | the | Het boek is rood. |');
    });
  });
});
