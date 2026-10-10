import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  GraduationCap, 
  Tag, 
  ArrowRight, 
  Filter,
  Layers,
  Check
} from 'lucide-react';
import { Lecture } from '../types';

interface StudentLectureFeedProps {
  lectures: Lecture[];
  onSelectLecture: (lecture: Lecture) => void;
  onOpenAITutor: (lecture: Lecture, mode?: 'explain' | 'summarize' | 'quiz') => void;
  onAddTopicsToPlanner: (lecture: Lecture) => void;
  onSwitchToFaculty: () => void;
}

export const StudentLectureFeed: React.FC<StudentLectureFeedProps> = ({
  lectures,
  onSelectLecture,
  onOpenAITutor,
  onAddTopicsToPlanner,
  onSwitchToFaculty,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [addedPlannerMap, setAddedPlannerMap] = useState<Record<string, boolean>>({});

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    lectures.forEach((l) => set.add(l.subject));
    return Array.from(set).sort();
  }, [lectures]);

  // Filter lectures
  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      // Subject filter
      if (selectedSubject !== 'all' && lecture.subject !== selectedSubject) {
        return false;
      }

      // Date filter
      if (customDate) {
        if (lecture.date !== customDate) return false;
      } else if (dateFilter !== 'all') {
        const lectureTime = new Date(lecture.date).getTime();
        const now = new Date().getTime();
        const daysDiff = (now - lectureTime) / (1000 * 3600 * 24);

        if (dateFilter === '7days' && (daysDiff < 0 || daysDiff > 7)) return false;
        if (dateFilter === '14days' && (daysDiff < 0 || daysDiff > 14)) return false;
        if (dateFilter === '30days' && (daysDiff < 0 || daysDiff > 30)) return false;
      }

      // Search query filter (subject, title, courseCode, topics, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = lecture.title.toLowerCase().includes(q);
        const matchSubject = lecture.subject.toLowerCase().includes(q);
        const matchCode = lecture.courseCode.toLowerCase().includes(q);
        const matchTopics = lecture.topicsCovered.some((t) => t.toLowerCase().includes(q));
        const matchNotes = lecture.notes.toLowerCase().includes(q);
        const matchInstructor = lecture.instructor.toLowerCase().includes(q);

        return matchTitle || matchSubject || matchCode || matchTopics || matchNotes || matchInstructor;
      }

      return true;
    });
  }, [lectures, selectedSubject, dateFilter, customDate, searchQuery]);

  const handleAddToPlanner = (lecture: Lecture) => {
    onAddTopicsToPlanner(lecture);
    setAddedPlannerMap((prev) => ({ ...prev, [lecture.id]: true }));
    setTimeout(() => {
      setAddedPlannerMap((prev) => ({ ...prev, [lecture.id]: false }));
    }, 2500);
  };

  const formatLectureDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lecture Recovery Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Missed a Class? <span className="text-teal-400">Never Miss Learning.</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Search missed lectures posted by faculty, review structured class notes, extract homework assignments, and let your AI Tutor explain tough topics simply.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <strong>{lectures.length}</strong> Lectures Available
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Tag className="w-4 h-4 text-teal-400" />
              <strong>{subjects.length}</strong> Academic Subjects
            </span>
            <button
              onClick={onSwitchToFaculty}
              className="inline-flex items-center gap-1.5 text-teal-300 hover:text-teal-200 underline underline-offset-4 decoration-teal-400/50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Are you an instructor? Post lecture records here</span>
            </button>
          </div>
        </div>
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lectures by subject (e.g. CS 301), topic, professor, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded px-1.5 py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Date and Subject Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Selector */}
            <div className="relative min-w-[150px]">
              <select
                aria-label="Filter by subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Subjects ({lectures.length})</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Quick Filter */}
            <div className="relative min-w-[140px]">
              <select
                aria-label="Filter by date range"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCustomDate('');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Dates</option>
                <option value="7days">Past 7 Days</option>
                <option value="14days">Past 14 Days</option>
                <option value="30days">Past 30 Days</option>
              </select>
            </div>

            {/* Specific Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                aria-label="Filter by specific lecture date"
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateFilter('custom');
                }}
                className="bg-transparent text-xs sm:text-sm text-slate-700 focus:outline-none"
                title="Filter by specific lecture date"
              />
              {customDate && (
                <button
                  onClick={() => {
                    setCustomDate('');
                    setDateFilter('all');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold ml-1"
                  title="Clear date"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Subject Chips */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Courses
          </button>
          {subjects.map((sub) => {
            const count = lectures.filter((l) => l.subject === sub).length;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedSubject === sub
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Lectures Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Course Lectures</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
              {filteredLectures.length} {filteredLectures.length === 1 ? 'record' : 'records'}
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            Click any lecture to read notes, launch AI tutor, or add topics to planner.
          </span>
        </div>

        {filteredLectures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No lecture records found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              No classes matched your search filter for &ldquo;{searchQuery || selectedSubject}&rdquo;.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setDateFilter('all');
                  setCustomDate('');
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Reset Filters
              </button>
              <button
                onClick={onSwitchToFaculty}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700"
              >
                + Post New Lecture as Faculty
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-500/50 shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Date Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-900 text-teal-400 rounded-lg text-xs font-bold tracking-wide">
                        {lecture.courseCode}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {lecture.subject}
                      </span>
                      {lecture.room && (
                        <span className="text-xs text-slate-600 hidden sm:inline">
                          • {lecture.room}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatLectureDate(lecture.date)}</span>
                    </div>
                  </div>

                  {/* Title & Instructor */}
                  <div className="mt-3">
                    <h3
                      onClick={() => onSelectLecture(lecture)}
                      className="text-lg sm:text-xl font-bold text-slate-900 hover:text-teal-600 cursor-pointer transition-colors"
                    >
                      {lecture.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                      <span>Taught by <strong className="text-slate-700">{lecture.instructor}</strong></span>
                    </p>
                  </div>

                  {/* Topics Covered Pills */}
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Topics Covered:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lecture.topicsCovered.map((topic, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200/80"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes Preview Teaser */}
                  <div className="mt-3.5 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 line-clamp-2">
                    <span className="font-semibold text-slate-700">Notes snippet: </span>
                    {lecture.notes.replace(/[#*`$]/g, '').trim()}
                  </div>

                  {/* Assignment Notice if present */}
                  {lecture.assignments && lecture.assignments.length > 0 && (
                    <div className="mt-3.5 bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900">
                          Assignment: {lecture.assignments[0].title}
                        </span>
                        <div className="text-amber-700 text-[11px] mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {lecture.assignments[0].dueDate}
                          </span>
                          {lecture.assignments[0].points && (
                            <span>• {lecture.assignments[0].points} pts</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Read Notes Button */}
                    <button
                      onClick={() => onSelectLecture(lecture)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Read Full Notes</span>
                    </button>

                    {/* AI Tutor Actions */}
                    <button
                      onClick={() => onOpenAITutor(lecture, 'explain')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
                      title="Have AI Tutor break down these topics simply"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Explain Simply</span>
                    </button>

                    <button
                      onClick={() => onOpenAITutor(lecture, 'quiz')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Take 5 practice questions for this lecture"
                    >
                      <span>Take 5-Q Quiz</span>
                    </button>
                  </div>

                  {/* Add to Planner Action */}
                  <button
                    onClick={() => handleAddToPlanner(lecture)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      addedPlannerMap[lecture.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {addedPlannerMap[lecture.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Added to Planner!</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>+ Add to Catch-Up Planner</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
