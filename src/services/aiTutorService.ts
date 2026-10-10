import { Lecture, QuizQuestion } from '../types';

export interface AIResponse<T> {
  data?: T;
  success: boolean;
  model?: string;
  error?: string;
  diagnosticDetails?: string;
}

export class AITutorService {
  public static async checkHealth(): Promise<{ aiConfigured: boolean; model: string; error?: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        return {
          aiConfigured: json.aiConfigured === true,
          model: json.primaryModel || 'gemini-3.1-flash-lite',
          error: json.error,
        };
      }
    } catch {
      // Server offline
    }
    return { aiConfigured: false, model: 'Offline / Unconfigured' };
  }

  public static async askCustomQuestion(
    userQuestion: string,
    lecture?: Lecture
  ): Promise<AIResponse<string>> {
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: userQuestion.trim(),
          subject: lecture?.subject || '',
          courseCode: lecture?.courseCode || '',
          title: lecture?.title || '',
          topics: lecture?.topicsCovered || [],
          notes: lecture?.notes || '',
          assignments: lecture?.assignments || [],
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        return {
          success: true,
          data: data.answer,
          model: data.model || 'Gemini 3.1 Flash Lite',
        };
      } else {
        const errorMsg = data?.error || `Server responded with HTTP ${res.status}: ${res.statusText}`;
        return {
          success: false,
          error: errorMsg,
          diagnosticDetails: data?.diagnostic || `Status code: ${res.status}`,
        };
      }
    } catch (e: any) {
      console.error('Network error during askCustomQuestion:', e);
      return {
        success: false,
        error: `Network Connection Error: Unable to contact /api/ai/ask (${e?.message || e})`,
        diagnosticDetails: 'Check that the dev server is running on port 3000.',
      };
    }
  }

  public static async explainTopic(
    subject: string,
    topic: string,
    notes: string,
    courseCode?: string
  ): Promise<AIResponse<string>> {
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, notes, courseCode }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        return {
          success: true,
          data: data.explanation,
          model: data.model || 'Gemini 3.1 Flash Lite',
        };
      } else {
        return {
          success: false,
          error: data?.error || `Failed to generate explanation (HTTP ${res.status})`,
          diagnosticDetails: data?.details || String(res.status),
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: `Network Error: ${e?.message || e}`,
      };
    }
  }

  public static async summarizeLecture(lecture: Lecture): Promise<AIResponse<string>> {
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lecture.subject,
          courseCode: lecture.courseCode,
          title: lecture.title,
          topics: lecture.topicsCovered,
          notes: lecture.notes,
          assignments: lecture.assignments,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        return {
          success: true,
          data: data.summary,
          model: data.model || 'Gemini 3.1 Flash Lite',
        };
      } else {
        return {
          success: false,
          error: data?.error || `Failed to generate summary (HTTP ${res.status})`,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: `Network Error: ${e?.message || e}`,
      };
    }
  }

  public static async generateQuiz(lecture: Lecture): Promise<AIResponse<QuizQuestion[]>> {
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lecture.subject,
          courseCode: lecture.courseCode,
          title: lecture.title,
          topics: lecture.topicsCovered,
          notes: lecture.notes,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && Array.isArray(data.questions)) {
        return {
          success: true,
          data: data.questions,
          model: data.model || 'Gemini 3.1 Flash Lite',
        };
      } else {
        return {
          success: false,
          error: data?.error || `Failed to generate practice quiz (HTTP ${res.status})`,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: `Network Error: ${e?.message || e}`,
      };
    }
  }
}
