import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  FileText, 
  HelpCircle, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { Lecture } from '../types';

interface LectureDetailModalProps {
  lecture: Lecture | null;
  onClose: () => void;
  onOpenAITutor: (lecture: Lecture, mode?: 'explain' | 'summarize' | 'quiz', topic?: string) => void;
  onAddTopicToPlanner: (lecture: Lecture, topic: string) => void;
  onAddAllTopicsToPlanner: (lecture: Lecture) => void;
}

export const LectureDetailModal: React.FC<LectureDetailModalProps> = ({
  lecture,
  onClose,
  onOpenAITutor,
  onAddTopicToPlanner,
  onAddAllTopicsToPlanner,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'topics' | 'assignments' | 'ai'>('notes');
  const [copied, setCopied] = useState(false);
  const [addedTopics, setAddedTopics] = useState<Record<string, boolean>>({});
  const [allAdded, setAllAdded] = useState(false);

  if (!lecture) return null;

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(lecture.notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSingleTopic = (topic: string) => {
    onAddTopicToPlanner(lecture, topic);
    setAddedTopics((prev) => ({ ...prev, [topic]: true }));
    setTimeout(() => {
      setAddedTopics((prev) => ({ ...prev, [topic]: false }));
    }, 2000);
  };

  const handleAddAll = () => {
    onAddAllTopicsToPlanner(lecture);
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 2500);
  };

  // Convert basic markdown-style notes to readable blocks
  const renderFormattedNotes = (text: string) => {
    return text.split('\n\n').map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-slate-900 mt-5 mb-2 border-b border-slate-200 pb-1">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-teal-800 mt-4 mb-1">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('```')) {
        const codeContent = trimmed.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
        return (
          <div key={idx} className="my-3 p-3.5 bg-slate-900 text-teal-300 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{codeContent}</pre>
          </div>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 text-slate-700 text-sm my-2 pl-2">
            {items.map((it, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {it.replace(/^[-*•]\s*|^\d+\.\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-slate-700 text-sm leading-relaxed mb-3">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-500 text-slate-950">
                {lecture.courseCode}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {lecture.subject}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                {lecture.date}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {lecture.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-teal-400" />
                Instructor: {lecture.instructor}
              </span>
              {lecture.room && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  Room: {lecture.room}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Close lecture details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lecture Notes</span>
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'topics'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Topics Covered ({lecture.topicsCovered.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Assignments ({lecture.assignments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-teal-600 text-teal-700 bg-white'
                : 'border-transparent text-teal-600 hover:text-teal-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>AI Tutor Actions</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Lecture Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Faculty Saved Notes & Transcript
                </span>
                <button
                  onClick={handleCopyNotes}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Notes</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 leading-relaxed font-sans">
                {renderFormattedNotes(lecture.notes)}
              </div>

              {/* Quick AI Summarize Bar */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <p className="text-xs text-teal-900 font-medium">
                    Too long to read right now? Generate an executive 60-second catch-up summary.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAITutor(lecture, 'summarize')}
                  className="px-3.5 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  Summarize Notes with AI
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Topics Covered */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Topics Taught in This Lecture
                  </h4>
                  <p className="text-xs text-slate-500">
                    Track the specific concepts you need to review before the next class.
                  </p>
                </div>
                <button
                  onClick={handleAddAll}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    allAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {allAdded ? 'Added All Topics!' : '+ Add All to Planner'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {lecture.topicsCovered.map((topic, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{topic}</h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lecture.courseCode} • {lecture.subject}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => onOpenAITutor(lecture, 'explain', topic)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1"
                        title="AI Tutor explanation for this specific topic"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Explain Simply</span>
                      </button>

                      <button
                        onClick={() => handleAddSingleTopic(topic)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                          addedTopics[topic]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {addedTopics[topic] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ To Planner</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Assignments */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                Assigned Homework & Practice
              </h4>

              {lecture.assignments && lecture.assignments.length > 0 ? (
                <div className="space-y-4">
                  {lecture.assignments.map((asg) => (
                    <div
                      key={asg.id}
                      className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="text-base font-bold text-amber-950">
                          {asg.title}
                        </h5>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="px-2.5 py-1 bg-amber-200/80 text-amber-900 rounded-md flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Due: {asg.dueDate}
                          </span>
                          {asg.points && (
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-md">
                              {asg.points} Points
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {asg.description}
                      </p>

                      {asg.submissionInstructions && (
                        <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs text-slate-600">
                          <strong className="text-slate-800 block mb-1">
                            Submission Guidelines:
                          </strong>
                          {asg.submissionInstructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">
                    No homework assigned in this lecture.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Faculty did not log any assignments for this date. Focus on mastering the lecture concepts!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI Tutor Launchpad */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  AI Tutor Services for This Lecture
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how you want to catch up on this material:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => onOpenAITutor(lecture, 'explain')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/30 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-3">
                      💡
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                      Explain in Simple Terms
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Transform technical jargon into plain-English analogies and step-by-step intuition.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-600 mt-4 flex items-center gap-1">
                    Launch Explainer <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div
                  onClick={() => onOpenAITutor(lecture, 'summarize')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/30 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-3">
                      📝
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                      Summarize Notes
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Extract high-yield takeaways, critical formulas, and midterm watch-outs in 1 page.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-600 mt-4 flex items-center gap-1">
                    Generate Summary <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div
                  onClick={() => onOpenAITutor(lecture, 'quiz')}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/30 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-3">
                      🎯
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                      5 Practice Questions
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Test your understanding with 5 interactive multiple choice questions and instant scoring.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-600 mt-4 flex items-center gap-1">
                    Start 5-Q Quiz <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Lecture ID: <code className="font-mono">{lecture.id}</code>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddAll}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Add to Weekly Planner
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
