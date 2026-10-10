import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Send, 
  ArrowRight,
  Info,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';
import { Lecture, QuizQuestion } from '../types';
import { AITutorService, AIResponse } from '../services/aiTutorService';

interface AITutorViewProps {
  lectures: Lecture[];
  initialLectureId?: string;
  initialTopic?: string;
  initialMode?: 'explain' | 'summarize' | 'quiz';
  onAddTopicToPlanner: (lecture: Lecture, topic: string) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  lectures,
  initialLectureId,
  initialTopic,
  initialMode = 'explain',
  onAddTopicToPlanner,
}) => {
  // Selected lecture
  const [selectedLectureId, setSelectedLectureId] = useState<string>(
    initialLectureId || (lectures[0] ? lectures[0].id : '')
  );

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId) || lectures[0];

  // Active tutor mode: 'explain' | 'summarize' | 'quiz' | 'ask'
  const [mode, setMode] = useState<'explain' | 'summarize' | 'quiz' | 'ask'>(initialMode);

  // Mode 1: Explain state
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || '');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [explainResult, setExplainResult] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainModel, setExplainModel] = useState<string>('');

  // Mode 2: Summarize state
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryModel, setSummaryModel] = useState<string>('');

  // Mode 3: 5 Practice Questions state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizModel, setQuizModel] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Mode 4: Ask follow-up state
  const [askInput, setAskInput] = useState('');
  const [askChat, setAskChat] = useState<Array<{
    role: 'user' | 'tutor';
    text: string;
    model?: string;
    isError?: boolean;
    diagnostic?: string;
  }>>([]);
  const [askLoading, setAskLoading] = useState(false);

  // Audio / Speech state
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedTopicToast, setAddedTopicToast] = useState(false);

  // Update initial topic if passed
  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
    } else if (selectedLecture && selectedLecture.topicsCovered.length > 0) {
      setSelectedTopic(selectedLecture.topicsCovered[0]);
    }
  }, [initialTopic, selectedLecture]);

  // Handle Speech Synthesis
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[#*`$_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Run Explain
  const handleRunExplain = async (topicToUse?: string) => {
    if (!selectedLecture) return;
    const topic = topicToUse || customTopic.trim() || selectedTopic || selectedLecture.topicsCovered[0] || 'Core Concept';
    setExplainLoading(true);
    setExplainResult(null);
    setExplainError(null);

    const res = await AITutorService.explainTopic(
      selectedLecture.subject,
      topic,
      selectedLecture.notes,
      selectedLecture.courseCode
    );
    if (res.success && res.data) {
      setExplainResult(res.data);
      setExplainModel(res.model || 'Gemini 3.1 Flash Lite');
    } else {
      setExplainError(res.error || 'Failed to generate explanation from Gemini API.');
    }
    setExplainLoading(false);
  };

  // 2. Run Summarize
  const handleRunSummarize = async () => {
    if (!selectedLecture) return;
    setSummaryLoading(true);
    setSummaryResult(null);
    setSummaryError(null);

    const res = await AITutorService.summarizeLecture(selectedLecture);
    if (res.success && res.data) {
      setSummaryResult(res.data);
      setSummaryModel(res.model || 'Gemini 3.1 Flash Lite');
    } else {
      setSummaryError(res.error || 'Failed to generate summary from Gemini API.');
    }
    setSummaryLoading(false);
  };

  // 3. Run Quiz
  const handleRunQuiz = async () => {
    if (!selectedLecture) return;
    setQuizLoading(true);
    setQuizError(null);
    setUserAnswers({});
    setShowQuizResults(false);

    const res = await AITutorService.generateQuiz(selectedLecture);
    if (res.success && res.data) {
      setQuizQuestions(res.data);
      setQuizModel(res.model || 'Gemini 3.1 Flash Lite');
    } else {
      setQuizError(res.error || 'Failed to generate quiz questions from Gemini API.');
    }
    setQuizLoading(false);
  };

  // 4. Run Ask
  const handleSendQuestion = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const query = (directQuery || askInput).trim();
    if (!query) return;

    setAskInput('');
    setAskChat((prev) => [...prev, { role: 'user', text: query }]);
    setAskLoading(true);

    const res = await AITutorService.askCustomQuestion(query, selectedLecture);
    if (res.success && res.data) {
      setAskChat((prev) => [
        ...prev,
        { role: 'tutor', text: res.data!, model: res.model || 'Gemini 3.1 Flash Lite' },
      ]);
    } else {
      setAskChat((prev) => [
        ...prev,
        {
          role: 'tutor',
          text: res.error || 'Gemini API request failed.',
          isError: true,
          diagnostic: res.diagnosticDetails,
        },
      ]);
    }
    setAskLoading(false);
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  // Score calculation
  const score = quizQuestions.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Lecture Picker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Tutor Workstation</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalized Lecture Catch-Up Tutor
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Break down complex missed lectures into crystal-clear explanations, executive summaries, and five tailored practice questions.
            </p>
          </div>

          {/* Lecture Selector Dropdown */}
          <div className="w-full lg:w-auto min-w-[280px]">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Lecture to Study:
            </label>
            <select
              aria-label="Select lecture to study"
              value={selectedLecture?.id || ''}
              onChange={(e) => {
                setSelectedLectureId(e.target.value);
                setExplainResult(null);
                setSummaryResult(null);
                setQuizQuestions([]);
                setUserAnswers({});
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              {lectures.map((lec) => (
                <option key={lec.id} value={lec.id}>
                  {lec.courseCode}: {lec.title} ({lec.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Lecture Details Strip */}
        {selectedLecture && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-slate-900 text-teal-400 font-bold rounded-lg">
                {selectedLecture.courseCode}
              </span>
              <span className="font-bold text-slate-800">{selectedLecture.subject}</span>
              <span className="text-slate-500">• Taught by {selectedLecture.instructor}</span>
              <span className="text-slate-500">• Date: {selectedLecture.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ready for AI breakdown
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setMode('explain')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            mode === 'explain'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-lg">💡</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              mode === 'explain' ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              ELi5 Mode
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Explain Simply</h3>
            <p className={`text-xs mt-0.5 ${mode === 'explain' ? 'text-slate-300' : 'text-slate-500'}`}>
              Jargon-free analogies
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setMode('summarize');
            if (!summaryResult && !summaryLoading) handleRunSummarize();
          }}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            mode === 'summarize'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-lg">📋</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              mode === 'summarize' ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              High-Yield
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Summarize Notes</h3>
            <p className={`text-xs mt-0.5 ${mode === 'summarize' ? 'text-slate-300' : 'text-slate-500'}`}>
              60-sec catch-up sheet
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setMode('quiz');
            if (quizQuestions.length === 0 && !quizLoading) handleRunQuiz();
          }}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            mode === 'quiz'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-lg">🎯</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              mode === 'quiz' ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              Interactive
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm">5 Practice Questions</h3>
            <p className={`text-xs mt-0.5 ${mode === 'quiz' ? 'text-slate-300' : 'text-slate-500'}`}>
              Self-test your mastery
            </p>
          </div>
        </button>

        <button
          onClick={() => setMode('ask')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            mode === 'ask'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-lg">💬</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              mode === 'ask' ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-600'
            }`}>
              Q&A
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Ask Tutor Anything</h3>
            <p className={`text-xs mt-0.5 ${mode === 'ask' ? 'text-slate-300' : 'text-slate-500'}`}>
              Instant lecture Q&A
            </p>
          </div>
        </button>
      </div>

      {/* MODE 1: Explain in Simple Words */}
      {mode === 'explain' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Explain a Missed Topic in Plain English
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select one of the topics covered in this lecture or type any specific concept below:
            </p>
          </div>

          {/* Topic selection pills */}
          {selectedLecture?.topicsCovered && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Topics from this lecture:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedLecture.topicsCovered.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTopic(t);
                      setCustomTopic('');
                      handleRunExplain(t);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedTopic === t && !customTopic
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom topic prompt */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or enter a specific sub-topic or formula (e.g. Invariant proof, Relaxation)..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunExplain();
              }}
            />
            <button
              onClick={() => handleRunExplain()}
              disabled={explainLoading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {explainLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-teal-400" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Explain Topic</span>
                </>
              )}
            </button>
          </div>

          {/* Diagnostic Error Banner */}
          {explainError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Gemini API Error:</strong>
                <p>{explainError}</p>
              </div>
            </div>
          )}

          {/* Result Card */}
          {explainResult && (
            <div className="mt-5 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                    {explainModel || 'AI Explanation'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Topic: <strong>{customTopic || selectedTopic || 'Core Concept'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(explainResult)}
                    className="p-1.5 text-slate-600 hover:text-teal-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title={speaking ? 'Stop listening' : 'Listen with text-to-speech'}
                  >
                    {speaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-600">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(explainResult)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (selectedLecture) {
                        onAddTopicToPlanner(
                          selectedLecture,
                          customTopic || selectedTopic || 'Lecture Review'
                        );
                        setAddedTopicToast(true);
                        setTimeout(() => setAddedTopicToast(false), 2000);
                      }
                    }}
                    className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {addedTopicToast ? 'Added to Planner!' : '+ Add to Planner'}
                  </button>
                </div>
              </div>

              {/* Formatted Content */}
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 font-sans">
                {explainResult.split('\n\n').map((para, i) => {
                  if (para.startsWith('### ') || para.startsWith('#### ')) {
                    return (
                      <h4 key={i} className="font-bold text-slate-900 text-base mt-3 mb-1">
                        {para.replace(/###* /, '')}
                      </h4>
                    );
                  }
                  if (para.startsWith('- ')) {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                        {para.split('\n').map((item, j) => (
                          <li key={j}>{item.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-700 text-sm">
                      {para}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Summarize Notes */}
      {mode === 'summarize' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                High-Yield Lecture Summary (1-Pager)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Executive distillation of core concepts, formulas, and midterm watch-outs.
              </p>
            </div>
            <button
              onClick={handleRunSummarize}
              disabled={summaryLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {summaryLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate Summary</span>
                </>
              )}
            </button>
          </div>

          {/* Diagnostic Error Banner */}
          {summaryError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Gemini API Error:</strong>
                <p>{summaryError}</p>
              </div>
            </div>
          )}

          {summaryLoading ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Reading lecture notes...</p>
              <p className="text-xs text-slate-500 mt-1">
                Distilling high-yield formulas and key exam takeaways for {selectedLecture?.courseCode}.
              </p>
            </div>
          ) : summaryResult ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                  {summaryModel || 'Lecture Catch-Up Sheet'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(summaryResult)}
                    className="p-1.5 text-slate-600 hover:text-teal-700 bg-white border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={() => handleCopy(summaryResult)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 font-sans">
                {summaryResult.split('\n\n').map((para, i) => {
                  if (para.startsWith('### ') || para.startsWith('#### ')) {
                    return (
                      <h4 key={i} className="font-bold text-slate-900 text-base mt-3 mb-1">
                        {para.replace(/###* /, '')}
                      </h4>
                    );
                  }
                  if (para.startsWith('- ')) {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                        {para.split('\n').map((item, j) => (
                          <li key={j}>{item.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-700 text-sm">
                      {para}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Ready to summarize</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click &ldquo;Regenerate Summary&rdquo; above to distill this lecture into key formulas and exam advice.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: 5 Practice Questions */}
      {mode === 'quiz' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Five Practice Questions (Catch-Up Assessment)
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                  5 Questions
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Answer these 5 interactive multiple-choice questions to test whether you have mastered this missed lecture.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunQuiz}
                disabled={quizLoading}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Questions</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Error Banner */}
          {quizError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Gemini API Error:</strong>
                <p>{quizError}</p>
              </div>
            </div>
          )}

          {/* Quiz Score Card if attempted */}
          {answeredCount > 0 && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-extrabold text-sm">
                  {score}/{quizQuestions.length}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300">
                    Your Current Score: <strong className="text-white">{Math.round((score / quizQuestions.length) * 100)}%</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {answeredCount} of {quizQuestions.length} questions answered
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {answeredCount === quizQuestions.length && (
                  <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30">
                    {score >= 4 ? '🎉 Great Recovery!' : '📚 Review Recommended'}
                  </span>
                )}
                <button
                  onClick={() => setUserAnswers({})}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Clear Answers
                </button>
              </div>
            </div>
          )}

          {quizLoading ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Generating 5 practice questions...</p>
              <p className="text-xs text-slate-500 mt-1">
                Creating tailored questions testing definitions, mechanisms, and edge cases.
              </p>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => {
                const selectedOption = userAnswers[qIdx];
                const hasAnswered = selectedOption !== undefined;
                const isCorrect = selectedOption === q.correctIndex;

                return (
                  <div
                    key={q.id || qIdx}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        <span className="inline-block w-6 h-6 rounded-full bg-slate-900 text-teal-300 text-xs font-bold text-center leading-6 mr-2">
                          {qIdx + 1}
                        </span>
                        {q.question}
                      </h4>
                      {hasAnswered && (
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((option, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isTheCorrectOne = optIdx === q.correctIndex;

                        let btnClasses =
                          'p-3 rounded-xl text-xs sm:text-sm font-medium text-left border transition-all flex items-center justify-between ';

                        if (!hasAnswered) {
                          btnClasses +=
                            'bg-white border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 text-slate-800';
                        } else if (isTheCorrectOne) {
                          btnClasses +=
                            'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isChosen && !isTheCorrectOne) {
                          btnClasses +=
                            'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                        } else {
                          btnClasses +=
                            'bg-white border-slate-200 text-slate-400 opacity-60';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={btnClasses}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{option}</span>
                            </span>
                            {hasAnswered && isTheCorrectOne && (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {hasAnswered && isChosen && !isTheCorrectOne && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Reveal */}
                    {hasAnswered && (
                      <div
                        className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50/80 border-amber-200 text-amber-900'
                        }`}
                      >
                        <strong className="block mb-0.5">
                          {isCorrect ? '✅ Explanation:' : '💡 Learning Breakdown:'}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Award className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Practice questions ready to generate</p>
              <button
                onClick={handleRunQuiz}
                className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
              >
                Generate 5 Practice Questions
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: Ask Tutor Anything */}
      {mode === 'ask' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ask AI Tutor About This Lecture
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Have a specific question about {selectedLecture?.courseCode || 'this lecture'}? Ask below!
              </p>
            </div>
            {askChat.length > 0 && (
              <button
                type="button"
                onClick={() => setAskChat([])}
                className="self-start sm:self-auto text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Clear conversation transcript"
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Quick Suggested Prompts */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-semibold self-center mr-1">Suggestions:</span>
            <button
              type="button"
              onClick={() => {
                const q = 'Explain cloud computing in simple words with one real-life example.';
                setAskInput(q);
                handleSendQuestion(undefined, q);
              }}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md font-semibold transition-colors"
            >
              Explain cloud computing with real-life example
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'How does this connect to the homework assignment?';
                setAskInput(q);
                handleSendQuestion(undefined, q);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
            >
              Connection to homework?
            </button>
            <button
              type="button"
              onClick={() => {
                const q = 'What is the most critical exam trap students fail to notice?';
                setAskInput(q);
                handleSendQuestion(undefined, q);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
            >
              Exam traps to avoid?
            </button>
          </div>

          {/* Chat transcript */}
          <div className="space-y-3 min-h-[160px] max-h-[420px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {askChat.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Sparkles className="w-8 h-8 text-teal-600/40 mx-auto mb-2" />
                No questions asked yet. Click a suggestion above or type your question below.
              </div>
            ) : (
              askChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.isError ? (
                    <div className="p-4 rounded-2xl max-w-2xl bg-rose-50 border border-rose-300 text-rose-900 shadow-xs">
                      <div className="flex items-center gap-2 font-bold text-rose-800 mb-1">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Gemini API Error</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium">{msg.text}</p>
                      {msg.diagnostic && (
                        <div className="mt-2 text-[11px] bg-rose-100/70 p-2 rounded text-rose-800 font-mono">
                          Diagnostic Details: {msg.diagnostic}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const lastUserMsg = askChat[i - 1]?.role === 'user' ? askChat[i - 1]?.text : null;
                            if (lastUserMsg) handleSendQuestion(undefined, lastUserMsg);
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Retry with Gemini
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-bl-none'
                      }`}
                    >
                      {msg.text.split('\n\n').map((block, bIdx) => (
                        <p key={bIdx} className="mb-2 last:mb-0">
                          {block}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {msg.role === 'user' ? 'You' : 'AI Tutor'}
                    </span>
                    {msg.role === 'tutor' && !msg.isError && msg.model && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {msg.model}
                      </span>
                    )}
                    {msg.role === 'tutor' && !msg.isError && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text)}
                        className="text-[10px] text-slate-400 hover:text-slate-600"
                        title="Copy answer"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {askLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Gemini Tutor is generating a live explanation...</span>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <form onSubmit={handleSendQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything about this lecture..."
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={askLoading || !askInput.trim()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* AI Setup Info Note */}
      <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <p>
            <strong className="text-white">AI Engine Status:</strong> Active with <code className="text-teal-300 font-mono">Gemini 3.1 Flash Lite</code> for instant lecture explanations, note summarization, and quiz generation. Fallback academic synthesizer available automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
