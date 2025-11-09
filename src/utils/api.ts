import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a784a06a`;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Network error detection
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch'))
  );
}

// Retry logic for failed requests
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0 && isNetworkError(error)) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// Enhanced error handling
async function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    // Add specific error messages for common status codes
    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (response.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (response.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (response.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const api = {
  async signup(email: string, password: string, name: string, role: 'teacher' | 'student') {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name, role })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  },

  async getProfile(accessToken: string) {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  },

  async getUsers(accessToken: string) {
    const response = await fetch(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  },

  async createDay(accessToken: string, dayData: any) {
    const response = await fetch(`${API_BASE}/days`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(dayData)
    });
    
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || `Failed to create day (${response.status})`);
      } catch (parseError) {
        throw new Error(`Failed to create day: ${response.statusText || response.status}`);
      }
    }
    
    return response.json();
  },

  async getDays() {
    const response = await fetch(`${API_BASE}/days`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch days');
    }
    
    return response.json();
  },

  async createClass(accessToken: string, classData: any) {
    const response = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(classData)
    });
    
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.error || `Failed to create class (${response.status})`);
      } catch (parseError) {
        throw new Error(`Failed to create class: ${response.statusText || response.status}`);
      }
    }
    
    return response.json();
  },

  async getClasses() {
    const response = await fetch(`${API_BASE}/classes`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }
    
    return response.json();
  },

  async getClass(classId: string) {
    const response = await fetch(`${API_BASE}/classes/${classId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch class');
    }
    
    return response.json();
  },

  async deleteClass(accessToken: string, classId: string) {
    const response = await fetch(`${API_BASE}/classes/${classId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete class');
    }
    
    return response.json();
  },

  async saveProgress(accessToken: string, classId: string, completed: boolean, score: number) {
    const response = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ classId, completed, score })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save progress');
    }
    
    return response.json();
  },

  async getProgress(accessToken: string) {
    const response = await fetch(`${API_BASE}/progress`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    
    return response.json();
  },

  // Vocabulary Management
  async getVocabulary(accessToken: string) {
    const response = await fetch(`${API_BASE}/vocabulary`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vocabulary');
    }
    
    return response.json();
  },

  async createVocabulary(accessToken: string, vocabData: any) {
    const response = await fetch(`${API_BASE}/vocabulary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(vocabData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create vocabulary');
    }
    
    return response.json();
  },

  async updateVocabulary(accessToken: string, vocabId: string, updates: any) {
    const response = await fetch(`${API_BASE}/vocabulary/${vocabId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vocabulary');
    }
    
    return response.json();
  },

  async deleteVocabulary(accessToken: string, vocabId: string) {
    const response = await fetch(`${API_BASE}/vocabulary/${vocabId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete vocabulary');
    }
    
    return response.json();
  },

  // Test Management
  async createTest(accessToken: string, testData: any) {
    const response = await fetch(`${API_BASE}/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create test');
    }
    
    return response.json();
  },

  async getTests(accessToken: string) {
    const response = await fetch(`${API_BASE}/tests`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    
    return response.json();
  },

  async deleteTest(accessToken: string, testId: string) {
    const response = await fetch(`${API_BASE}/tests/${testId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete test');
    }
    
    return response.json();
  },

  async submitTest(accessToken: string, testId: string, answers: any, timeSpent: number) {
    const response = await fetch(`${API_BASE}/tests/${testId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ answers, timeSpent })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit test');
    }
    
    return response.json();
  },

  async getTestResults(accessToken: string) {
    const response = await fetch(`${API_BASE}/test-results`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch test results');
    }
    
    return response.json();
  },

  // Mistakes Bank
  async getMistakes(accessToken: string) {
    const response = await fetch(`${API_BASE}/mistakes`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mistakes');
    }
    
    return response.json();
  },

  async updateMistake(accessToken: string, mistakeId: string, updates: any) {
    const response = await fetch(`${API_BASE}/mistakes/${mistakeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update mistake');
    }
    
    return response.json();
  },

  async deleteMistake(accessToken: string, mistakeId: string) {
    const response = await fetch(`${API_BASE}/mistakes/${mistakeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete mistake');
    }
    
    return response.json();
  },

  // Spaced Repetition
  async getSpacedRepetitionCards(accessToken: string) {
    const response = await fetch(`${API_BASE}/spaced-repetition`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch spaced repetition cards');
    }
    
    return response.json();
  },

  async updateSpacedRepetitionCard(accessToken: string, cardId: string, updates: any) {
    const response = await fetch(`${API_BASE}/spaced-repetition/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update card');
    }
    
    return response.json();
  },

  // Grammar Rules
  async getGrammarRules(accessToken: string) {
    const response = await fetch(`${API_BASE}/grammar`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch grammar rules');
    }
    
    return response.json();
  },

  async createGrammarRule(accessToken: string, ruleData: any) {
    const response = await fetch(`${API_BASE}/grammar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(ruleData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create grammar rule');
    }
    
    return response.json();
  },

  async deleteGrammarRule(accessToken: string, ruleId: string) {
    const response = await fetch(`${API_BASE}/grammar/${ruleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete grammar rule');
    }
    
    return response.json();
  },

  // Update class endpoint
  async updateClass(accessToken: string, classId: string, updates: any) {
    const response = await fetch(`${API_BASE}/classes/${classId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update class');
    }
    
    return response.json();
  },

  // Update user progress (XP, streaks)
  async updateProgress(accessToken: string, updates: any) {
    const response = await fetch(`${API_BASE}/progress/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update progress');
    }
    
    return response.json();
  },

  // Create spaced repetition card
  async createSpacedRepetitionCard(accessToken: string, cardData: any) {
    const response = await fetch(`${API_BASE}/spaced-repetition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(cardData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create SRS card');
    }
    
    return response.json();
  },

  // Upload audio (using Supabase Storage)
  async uploadAudio(accessToken: string, audioBlob: Blob, filename: string) {
    try {
      // Import supabase client
      const { supabase } = await import('./supabase-client');
      
      // Upload to Supabase Storage bucket 'vocabulary-audio'
      const { data, error } = await supabase.storage
        .from('vocabulary-audio')
        .upload(`recordings/${filename}`, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('vocabulary-audio')
        .getPublicUrl(`recordings/${filename}`);

      return {
        url: urlData.publicUrl,
        success: true
      };
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  },

  // Record mistake from exercise
  async recordMistake(accessToken: string, mistakeData: any) {
    const response = await fetch(`${API_BASE}/mistakes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(mistakeData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to record mistake');
    }
    
    return response.json();
  },

  // Fluency Level System
  async getFluencyLevel(accessToken: string, userId: string) {
    const response = await fetch(`${API_BASE}/fluency/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch fluency level');
    }
    
    return response.json();
  },

  async updateFluencyLevel(accessToken: string, userId: string, newLevel: string) {
    const response = await fetch(`${API_BASE}/fluency/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ newLevel })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update fluency level');
    }
    
    return response.json();
  },

  async getFluencyHistory(accessToken: string, userId: string) {
    const response = await fetch(`${API_BASE}/fluency/history/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch fluency history');
    }
    
    return response.json();
  },

  async getCertificates(accessToken: string, userId: string) {
    const response = await fetch(`${API_BASE}/certificates/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch certificates');
    }
    
    return response.json();
  },

  async getCertificate(accessToken: string, userId: string, certificateId: string) {
    const response = await fetch(`${API_BASE}/certificates/${userId}/${certificateId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch certificate');
    }
    
    return response.json();
  },

  // Notes Management
  async getNotes(accessToken: string, filters?: {
    topicId?: string;
    lessonId?: string;
    tags?: string[];
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.topicId) params.append('topicId', filters.topicId);
      if (filters?.lessonId) params.append('lessonId', filters.lessonId);
      if (filters?.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const url = `${API_BASE}/notes${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetchWithRetry(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async getNote(accessToken: string, noteId: string) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async createNote(accessToken: string, noteData: {
    lessonId: string;
    topicId: string;
    title: string;
    content: string;
    tags: string[];
  }) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(noteData)
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async updateNote(accessToken: string, noteId: string, updates: {
    content?: string;
    tags?: string[];
    title?: string;
  }) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates)
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async deleteNote(accessToken: string, noteId: string) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async searchNotes(accessToken: string, query: string, filters?: {
    topicId?: string;
    tags?: string[];
  }) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (filters?.topicId) params.append('topicId', filters.topicId);
      if (filters?.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const response = await fetchWithRetry(`${API_BASE}/notes/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  // Tag Management
  async getNoteTags(accessToken: string) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/tags`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async createNoteTag(accessToken: string, tagData: {
    name: string;
    color: string;
  }) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(tagData)
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  async deleteNoteTag(accessToken: string, tagId: string) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  // Notes Export
  async exportNotesToPDF(accessToken: string, options: {
    scope: 'single' | 'topic' | 'all';
    noteId?: string;
    topicId?: string;
    includeVocabulary: boolean;
    includeClassInfo: boolean;
    format: 'pdf';
  }) {
    try {
      const response = await fetchWithRetry(`${API_BASE}/notes/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        throw new Error('Failed to export notes to PDF');
      }
      
      return response.blob();
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  }
};