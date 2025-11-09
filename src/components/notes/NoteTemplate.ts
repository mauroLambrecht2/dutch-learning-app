/**
 * Note template generation utilities
 * Generates markdown templates for notes with auto-populated content
 */

import { ClassInfo, VocabularyItem } from '../../types/notes';

/**
 * Data structure for note template generation
 */
export interface NoteTemplateData {
  lessonTitle?: string;
  lessonDate?: string;
  topicName?: string;
  level?: string;
  seriesInfo?: string;
  vocabulary?: VocabularyItem[];
}

/**
 * Generates a markdown table for vocabulary items
 * @param vocabulary - Array of vocabulary items to format
 * @returns Markdown formatted table string
 */
export function generateVocabularyTable(vocabulary: VocabularyItem[]): string {
  if (!vocabulary || vocabulary.length === 0) {
    return '| Dutch | English | Example |\n|-------|---------|---------||\n| - | - | - |';
  }

  const header = '| Dutch | English | Example |\n|-------|---------|---------|';
  const rows = vocabulary.map(item => {
    const word = item.word || '-';
    const translation = item.translation || '-';
    const example = item.exampleSentence || '-';
    return `| ${word} | ${translation} | ${example} |`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Generates a markdown section for class information
 * @param classInfo - Class information object
 * @returns Markdown formatted class info section
 */
export function generateClassInfoSection(classInfo: ClassInfo): string {
  const lines = [
    '## Class Information',
    '',
    `- **Lesson**: ${classInfo.lessonTitle || 'N/A'}`,
    `- **Date**: ${classInfo.lessonDate || 'N/A'}`,
    `- **Topic**: ${classInfo.topicName || 'N/A'}`,
    `- **Level**: ${classInfo.level || 'N/A'}`,
  ];

  if (classInfo.seriesInfo) {
    lines.push(`- **Series**: ${classInfo.seriesInfo}`);
  }

  return lines.join('\n');
}

/**
 * Generates a complete note template with optional auto-populated content
 * @param data - Template data including lesson info and vocabulary
 * @returns Complete markdown template string
 */
export function generateNoteTemplate(data: NoteTemplateData = {}): string {
  const title = data.lessonTitle || 'New Note';
  
  // Generate class info section if data is provided
  let classInfoSection = '';
  if (data.lessonTitle || data.lessonDate || data.topicName || data.level) {
    const classInfo: ClassInfo = {
      lessonTitle: data.lessonTitle || '',
      lessonDate: data.lessonDate || '',
      topicName: data.topicName || '',
      level: data.level || '',
      seriesInfo: data.seriesInfo,
    };
    classInfoSection = generateClassInfoSection(classInfo);
  } else {
    classInfoSection = '## Class Information\n\n- **Lesson**: \n- **Date**: \n- **Topic**: \n- **Level**: ';
  }

  // Generate vocabulary section
  const vocabularySection = data.vocabulary && data.vocabulary.length > 0
    ? `## Vocabulary\n\n${generateVocabularyTable(data.vocabulary)}`
    : '## Vocabulary\n\n| Dutch | English | Example |\n|-------|---------|---------||\n| - | - | - |';

  // Build complete template
  const template = [
    `# ${title}`,
    '',
    classInfoSection,
    '',
    vocabularySection,
    '',
    '## My Notes',
    '',
    '[Your notes here...]',
    '',
    '## Key Concepts',
    '',
    '- ',
    '',
    '## Questions',
    '',
    '- ',
    '',
  ].join('\n');

  return template;
}
