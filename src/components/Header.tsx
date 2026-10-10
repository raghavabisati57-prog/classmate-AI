import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  Sparkles, 
  PlusCircle, 
  RotateCcw, 
  Layers,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { UserRole, ActiveTab } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  lectureCount: number;
  plannerCount: number;
  onResetData: () => void;
  onOpenAddLectureModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  lectureCount,
  plannerCount,
  onResetData,
  onOpenAddLectureModal,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg shadow-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <GraduationCap className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    ClassMate<span className="text-teal-400">AI</span>
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                    Lecture Recovery
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden md:block">
                  Missed a Class? <span className="text-teal-300 font-medium">Never Miss Learning.</span>
                </p>
              </div>
            </div>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              {currentRole === 'student' ? (
                <>
                  <button
                    onClick={() => onTabChange('lectures')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'lectures'
                        ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lectures Feed</span>
                    <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                      activeTab === 'lectures' ? 'bg-slate-950 text-teal-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {lectureCount}
                    </span>
                  </button>

                  <button
                    onClick={() => onTabChange('planner')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'planner'
                        ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Catch-Up Planner</span>
                    {plannerCount > 0 && (
                      <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                        activeTab === 'planner' ? 'bg-slate-950 text-teal-300' : 'bg-teal-950 text-teal-300 border border-teal-800'
                      }`}>
                        {plannerCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onTabChange('tutor')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'tutor'
                        ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30'
                        : 'text-teal-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>AI Tutor Lab</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onTabChange('faculty-manage')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === 'faculty-manage'
                        ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Faculty Desk</span>
                    <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                      activeTab === 'faculty-manage' ? 'bg-slate-950 text-teal-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {lectureCount}
                    </span>
                  </button>

                  {onOpenAddLectureModal && (
                    <button
                      onClick={onOpenAddLectureModal}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Post Lecture</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onRoleChange('student');
                      onTabChange('lectures');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Preview student feed"
                  >
                    <span>View as Student</span>
                  </button>
                </>
              )}
            </nav>

            {/* Right actions: Role Switcher & Sample Data reset */}
            <div className="flex items-center gap-3">
              {/* Role Toggle Switcher */}
              <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('student');
                    if (activeTab === 'faculty-manage') onTabChange('lectures');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentRole === 'student'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to Student view"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Student View</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange('faculty');
                    onTabChange('faculty-manage');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentRole === 'faculty'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to Faculty desk"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Faculty Desk</span>
                </button>
              </div>

              {/* Reset Data Button */}
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                title="Reset sample college lectures and planner"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Data</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-800 flex flex-col gap-2">
              <p className="text-xs text-slate-400 px-2 pb-1">
                Missed a Class? <span className="text-teal-300 font-medium">Never Miss Learning.</span>
              </p>
              {currentRole === 'student' ? (
                <>
                  <button
                    onClick={() => {
                      onTabChange('lectures');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold ${
                      activeTab === 'lectures' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Lectures Feed
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                      {lectureCount}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('planner');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold ${
                      activeTab === 'planner' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" /> Catch-Up Planner
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                      {plannerCount}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('tutor');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                      activeTab === 'tutor' ? 'bg-teal-500 text-slate-950' : 'text-teal-300 hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" /> AI Tutor Lab
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onTabChange('faculty-manage');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold ${
                      activeTab === 'faculty-manage' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Faculty Desk
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-slate-300">
                      {lectureCount}
                    </span>
                  </button>
                  {onOpenAddLectureModal && (
                    <button
                      onClick={() => {
                        onOpenAddLectureModal();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white"
                    >
                      <PlusCircle className="w-4 h-4" /> + Post Lecture
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setShowResetConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-teal-600" />
              Reset to Sample Data?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              This will reload the initial realistic sample college lectures (Computer Science, Biology, Economics, Linear Algebra, Thermodynamics) and reset the weekly catch-up planner.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
