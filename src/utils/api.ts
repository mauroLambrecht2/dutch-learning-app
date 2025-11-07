import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a784a06a`;

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
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    
    // Note: This would use Supabase Storage API directly
    // For now, we'll return a placeholder URL
    // In a real implementation, you would upload to Supabase Storage
    return {
      url: `https://placeholder-audio-url.com/${filename}`,
      success: true
    };
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
  }
};