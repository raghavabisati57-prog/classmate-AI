import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client safely
function getGeminiClient(): { client: GoogleGenAI | null; error?: string } {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return {
      client: null,
      error: 'GEMINI_API_KEY is not set or is still the default placeholder in .env.',
    };
  }
  try {
    return { client: new GoogleGenAI({ apiKey }) };
  } catch (err: any) {
    return {
      client: null,
      error: `Failed to initialize GoogleGenAI client: ${err?.message || String(err)}`,
    };
  }
}

// Supported models in priority order
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function generateWithGemini(ai: GoogleGenAI, prompt: string): Promise<{ text: string; model: string }> {
  let lastError: any = null;
  const attempts: string[] = [];

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      const errMsg = err?.message || err?.status || String(err);
      console.warn(`Model ${model} attempt failed:`, errMsg);
      attempts.push(`${model}: ${errMsg}`);
      lastError = err;
    }
  }

  const finalError = new Error(`All candidate models failed. Attempts: ${attempts.join(' | ')}`);
  (finalError as any).originalError = lastError;
  (finalError as any).status = lastError?.status || 500;
  throw finalError;
}

// API Health & Status Check
app.get('/api/health', (req, res) => {
  const { client, error } = getGeminiClient();
  res.json({
    status: 'ok',
    aiConfigured: client !== null,
    error: error || null,
    primaryModel: CANDIDATE_MODELS[0],
    models: CANDIDATE_MODELS,
    timestamp: new Date().toISOString(),
  });
});

// AI Custom Ask Question
app.post('/api/ai/ask', async (req, res) => {
  const { userQuestion, subject, courseCode, title, topics, notes, assignments } = req.body;
  if (!userQuestion || !userQuestion.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Question is required.',
    });
  }

  const { client: ai, error: clientError } = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      error: clientError || 'Gemini API is not configured on the server.',
      diagnostic: 'Server GEMINI_API_KEY environment variable is missing or placeholder.',
    });
  }

  try {
    const topicsStr = Array.isArray(topics) ? topics.join(', ') : (topics || '');
    const assignmentsStr = assignments && assignments.length > 0 
      ? JSON.stringify(assignments.map((a: any) => ({ title: a.title, dueDate: a.dueDate, description: a.description })))
      : 'No formal homework assigned for this lecture.';

    const prompt = `You are an articulate, encouraging college AI tutor helping an undergraduate student understand their course material.

Course: ${courseCode || ''} ${subject || 'General Studies'}
Lecture Title: ${title || 'Class Session'}
Topics Covered: ${topicsStr || 'General curriculum'}
Assignments / Labs: ${assignmentsStr}
Lecture Notes:
${notes || 'No extra notes logged'}

Student's Question: "${userQuestion.trim()}"

Instructions:
1. Answer the student's question directly, accurately, and with clear academic depth.
2. If the student asks for a concept in simple words with a real-life example (e.g. "Explain cloud computing in simple words with one real-life example"), provide a crystal-clear explanation along with a vivid, relatable real-world analogy.
3. If they ask about homework or assignments, connect their question directly to the specific assignments and deadlines listed above.
4. If relevant, reference the topics and lecture notes to reinforce active learning.
5. Use clean markdown formatting (headings ###, bullet points, bold terms) so it is easy to read.`;

    const { text, model } = await generateWithGemini(ai, prompt);
    return res.json({
      success: true,
      model,
      answer: text,
    });
  } catch (error: any) {
    console.error('Error generating AI answer:', error);
    const errorMsg = error?.message || String(error);
    const status = error?.status || 500;
    return res.status(status).json({
      success: false,
      error: `Gemini API Error: ${errorMsg}`,
      diagnostic: errorMsg,
      status,
    });
  }
});

// AI Explain Topic
app.post('/api/ai/explain', async (req, res) => {
  const { subject, topic, notes, courseCode } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ success: false, error: 'Topic is required' });
  }

  const { client: ai, error: clientError } = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      error: clientError || 'Gemini API is not configured on the server.',
    });
  }

  try {
    const prompt = `You are a supportive college tutor explaining a missed lecture topic to an undergraduate student.
Course: ${courseCode || ''} ${subject || 'General Academic'}
Topic: ${topic.trim()}
Lecture context notes:
${notes || 'No notes provided'}

Task:
1. Explain this topic in simple, clear, engaging undergraduate-friendly language.
2. Use an intuitive real-world analogy.
3. Break down the core mechanism or steps.
4. Highlight why this is important for college exams.
Keep your response structured with markdown headings (###), bullet points, and high clarity.`;

    const { text, model } = await generateWithGemini(ai, prompt);
    return res.json({
      success: true,
      model,
      explanation: text,
    });
  } catch (error: any) {
    console.error('Error in AI explain:', error);
    return res.status(error?.status || 500).json({
      success: false,
      error: `Gemini API Error: ${error?.message || String(error)}`,
    });
  }
});

// AI Summarize Notes
app.post('/api/ai/summarize', async (req, res) => {
  const { subject, title, topics, notes, courseCode, assignments } = req.body;
  if (!notes && (!topics || topics.length === 0)) {
    return res.status(400).json({ success: false, error: 'Notes or topics are required to summarize' });
  }

  const { client: ai, error: clientError } = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      error: clientError || 'Gemini API is not configured on the server.',
    });
  }

  try {
    const prompt = `You are an academic tutor preparing a high-yield lecture catch-up summary for a student who missed class.
Course: ${courseCode || ''} ${subject || 'Course'}
Lecture Title: ${title || 'Lecture'}
Topics Covered: ${Array.isArray(topics) ? topics.join(', ') : topics}
Assignments: ${JSON.stringify(assignments || [])}
Full Lecture Notes:
${notes || 'No notes provided'}

Create a structured study catch-up sheet with:
1. **Core Concept in 60 Seconds** (2-3 concise sentences)
2. **Key Takeaways & Formulas/Principles** (bullet points with bold terms)
3. **Common Pitfalls / Exam Traps** (what students usually get wrong)
4. **Action Item for Catch-up** (immediate 15-minute study next step)`;

    const { text, model } = await generateWithGemini(ai, prompt);
    return res.json({
      success: true,
      model,
      summary: text,
    });
  } catch (error: any) {
    console.error('Error in AI summarize:', error);
    return res.status(error?.status || 500).json({
      success: false,
      error: `Gemini API Error: ${error?.message || String(error)}`,
    });
  }
});

// AI 5 Practice Questions
app.post('/api/ai/quiz', async (req, res) => {
  const { subject, title, topics, notes, courseCode } = req.body;

  const { client: ai, error: clientError } = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      success: false,
      error: clientError || 'Gemini API is not configured on the server.',
    });
  }

  try {
    const prompt = `You are a college exam creator. Generate exactly 5 high-quality multiple choice practice questions for a student catching up on this missed lecture.
Course: ${courseCode || ''} ${subject}
Lecture Title: ${title}
Topics: ${Array.isArray(topics) ? topics.join(', ') : topics}
Notes:
${notes || 'No extra notes provided'}

Format your output strictly as a JSON array of objects with no surrounding markdown code block, or format inside \`\`\`json\`\`\`.
Each object must have:
- "id": number (1 to 5)
- "question": string
- "options": array of 4 string choices
- "correctIndex": number (0 to 3)
- "explanation": string explaining why the answer is correct and why other distractors are wrong.`;

    const { text, model } = await generateWithGemini(ai, prompt);
    let raw = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(raw);
    return res.json({
      success: true,
      model,
      questions,
    });
  } catch (error: any) {
    console.error('Error in AI quiz:', error);
    return res.status(error?.status || 500).json({
      success: false,
      error: `Gemini API Error: ${error?.message || String(error)}`,
    });
  }
});

// Vite dev server mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClassMate AI server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
