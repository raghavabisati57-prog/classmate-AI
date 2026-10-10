import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  Filter, 
  Layers, 
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import { CatchUpItem, CatchUpStatus, PriorityLevel, Lecture } from '../types';

interface WeeklyCatchUpPlannerProps {
  items: CatchUpItem[];
  lectures: Lecture[];
  onToggleStatus: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<CatchUpItem, 'id' | 'createdAt'>) => void;
  onOpenAITutorForTopic: (subject: string, topic: string, lectureId?: string) => void;
  onOpenLecture: (lectureId: string) => void;
}

export const WeeklyCatchUpPlanner: React.FC<WeeklyCatchUpPlannerProps> = ({
  items,
  lectures,
  onToggleStatus,
  onDeleteItem,
  onAddItem,
  onOpenAITutorForTopic,
  onOpenLecture,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | CatchUpStatus>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newTopic, setNewTopic] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newTargetDate, setNewTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [newNotes, setNewNotes] = useState('');
  const [selectedLectureId, setSelectedLectureId] = useState<string>('');

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.subject));
    return Array.from(set).sort();
  }, [items]);

  // Statistics
  const totalCount = items.length;
  const masteredCount = items.filter((i) => i.status === 'mastered').length;
  const inProgressCount = items.filter((i) => i.status === 'in-progress').length;
  const toReviewCount = items.filter((i) => i.status === 'to-review').length;
  const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (selectedSubject !== 'all' && it.subject !== selectedSubject) return false;
      return true;
    });
  }, [items, statusFilter, selectedSubject]);

  const handleSelectLectureInForm = (lecId: string) => {
    setSelectedLectureId(lecId);
    const found = lectures.find((l) => l.id === lecId);
    if (found) {
      setNewCourseCode(found.courseCode);
      setNewSubject(found.subject);
    }
  };

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const matchedLecture = lectures.find((l) => l.id === selectedLectureId);

    onAddItem({
      lectureId: selectedLectureId || 'custom-entry',
      courseCode: newCourseCode.trim() || (matchedLecture ? matchedLecture.courseCode : 'SELF'),
      subject: newSubject.trim() || (matchedLecture ? matchedLecture.subject : 'General Review'),
      lectureTitle: matchedLecture ? matchedLecture.title : 'Self-Directed Review',
      topic: newTopic.trim(),
      lectureDate: matchedLecture ? matchedLecture.date : new Date().toISOString().split('T')[0],
      status: 'to-review',
      priority: newPriority,
      targetDate: newTargetDate,
      notes: newNotes.trim(),
    });

    // Reset & close
    setNewTopic('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Progress Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Weekly Catch-Up Planner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Track Missed Topics to Mastery
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Never let missed lectures pile up. Check off topics as you review notes and complete quizzes. Use the AI Tutor to break down any concepts still in progress.
            </p>
          </div>

          {/* Progress Widget */}
          <div className="w-full lg:w-auto bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex items-center gap-5 shadow-sm min-w-[280px]">
            <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-400 transition-all duration-500"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-black text-white">{progressPercent}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-teal-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Catch-Up Rate
              </div>
              <div className="text-slate-300">
                <strong className="text-white text-sm">{masteredCount}</strong> of {totalCount} topics mastered
              </div>
              <div className="text-[11px] text-slate-400">
                {inProgressCount} in progress • {toReviewCount} to review
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${totalCount ? (masteredCount / totalCount) * 100 : 0}%` }}
              title={`Mastered: ${masteredCount}`}
            />
            <div
              className="bg-teal-400 h-full transition-all duration-300"
              style={{ width: `${totalCount ? (inProgressCount / totalCount) * 100 : 0}%` }}
              title={`In Progress: ${inProgressCount}`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${totalCount ? (toReviewCount / totalCount) * 100 : 0}%` }}
              title={`To Review: ${toReviewCount}`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Mastered ({masteredCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
              In Progress ({inProgressCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              To Review ({toReviewCount})
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Add Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('to-review')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'to-review'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            To Review ({toReviewCount})
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'in-progress'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setStatusFilter('mastered')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'mastered'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mastered ({masteredCount})
          </button>
        </div>

        {/* Right action: Add topic & Subject filter */}
        <div className="flex items-center gap-2">
          {subjects.length > 0 && (
            <select
              aria-label="Filter planner by course"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Courses</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Topic</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              {statusFilter === 'mastered'
                ? 'No mastered topics yet'
                : statusFilter === 'all'
                ? 'Planner is clear!'
                : `No items marked as "${statusFilter}"`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add topics from any lecture card or click &ldquo;+ Add Topic&rdquo; to set a personal study goal.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700"
            >
              + Add First Catch-Up Goal
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isMastered = item.status === 'mastered';
            const isInProgress = item.status === 'in-progress';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isMastered
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isInProgress
                    ? 'bg-teal-50/40 border-teal-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left side: Checkbox + Topic Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Status toggle button */}
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-0.5 shrink-0 transition-transform active:scale-90"
                    title={`Current: ${item.status}. Click to change status`}
                  >
                    {isMastered ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : isInProgress ? (
                      <div className="w-5 h-5 rounded-full border-2 border-teal-600 flex items-center justify-center bg-teal-100">
                        <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-900 text-teal-300">
                        {item.courseCode}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {item.subject}
                      </span>
                      {item.targetDate && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Target: {item.targetDate}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    <h4
                      className={`text-sm sm:text-base font-bold ${
                        isMastered
                          ? 'text-slate-500 line-through'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.topic}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                      <span>Source:</span>
                      <button
                        onClick={() => onOpenLecture(item.lectureId)}
                        className="text-teal-700 hover:underline font-medium truncate max-w-xs"
                      >
                        {item.lectureTitle}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: Quick Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* AI Explain button */}
                  <button
                    onClick={() =>
                      onOpenAITutorForTopic(item.subject, item.topic, item.lectureId)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
                    title="Ask AI Tutor to explain this topic simply"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Explain with AI</span>
                  </button>

                  {/* Status badge cycler */}
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      isMastered
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : isInProgress
                        ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Click to cycle status"
                  >
                    {item.status.replace('-', ' ')}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove from planner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                Add Topic to Catch-Up Planner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Connect to Existing Lecture (Optional)
                </label>
                <select
                  aria-label="Connect to existing lecture"
                  value={selectedLectureId}
                  onChange={(e) => handleSelectLectureInForm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="">-- No specific lecture (Independent Review) --</option>
                  {lectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.courseCode}: {l.title} ({l.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic / Concept Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Theorem for Divide-and-Conquer Recurrences"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS 301"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Catch-Up Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    aria-label="Priority level"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Personal Study Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Review textbook example 4.2 before Friday recitation"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Save to Planner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
