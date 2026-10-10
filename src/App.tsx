/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Header } from './components/Header';
import { StudentLectureFeed } from './components/StudentLectureFeed';
import { LectureDetailModal } from './components/LectureDetailModal';
import { FacultyLectureManager } from './components/FacultyLectureManager';
import { WeeklyCatchUpPlanner } from './components/WeeklyCatchUpPlanner';
import { AITutorView } from './components/AITutorView';
import { storageService } from './services/storageService';
import { Lecture, CatchUpItem, UserRole, ActiveTab } from './types';
import { CheckCircle2, Info, BookOpen } from 'lucide-react';

export default function App() {
  const [lectures, setLectures] = useState<Lecture[]>(() => storageService.getLectures());
  const [plannerItems, setPlannerItems] = useState<CatchUpItem[]>(() => storageService.getCatchUpItems());

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<ActiveTab>('lectures');

  // Modal State
  const [detailModalLecture, setDetailModalLecture] = useState<Lecture | null>(null);

  // AI Tutor Target State
  const [tutorState, setTutorState] = useState<{
    lectureId?: string;
    topic?: string;
    mode?: 'explain' | 'summarize' | 'quiz';
  }>({});

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Subscribe to persistent storage events
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setLectures(storageService.getLectures());
      setPlannerItems(storageService.getCatchUpItems());
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Handlers for Faculty
  const handleAddLecture = (data: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLec = storageService.addLecture(data);
    showToast(`Lecture "${newLec.title}" posted! Instantly visible in Student Feed.`);
    return newLec;
  };

  const handleUpdateLecture = (id: string, updates: Partial<Lecture>) => {
    storageService.updateLecture(id, updates);
    showToast('Lecture updated in shared database.');
  };

  const handleDeleteLecture = (id: string) => {
    storageService.deleteLecture(id);
    showToast('Lecture deleted from shared database.', 'info');
  };

  // Handlers for Planner
  const handleToggleCatchUpStatus = (id: string) => {
    storageService.toggleCatchUpStatus(id);
  };

  const handleDeleteCatchUpItem = (id: string) => {
    storageService.deleteCatchUpItem(id);
    showToast('Topic removed from planner.', 'info');
  };

  const handleAddCatchUpItem = (item: Omit<CatchUpItem, 'id' | 'createdAt'>) => {
    storageService.addCatchUpItem(item);
    showToast(`Added "${item.topic}" to Catch-Up Planner!`);
  };

  const handleAddTopicsFromLecture = (lecture: Lecture) => {
    const addedCount = storageService.addTopicsFromLectureToPlanner(lecture);
    if (addedCount > 0) {
      showToast(`Added ${addedCount} topics from ${lecture.courseCode} to your Catch-Up Planner!`);
    } else {
      showToast(`All topics from ${lecture.courseCode} are already in your Planner.`, 'info');
    }
  };

  const handleAddSingleTopicToPlanner = (lecture: Lecture, topic: string) => {
    storageService.addCatchUpItem({
      lectureId: lecture.id,
      courseCode: lecture.courseCode,
      subject: lecture.subject,
      lectureTitle: lecture.title,
      topic,
      lectureDate: lecture.date,
      status: 'to-review',
      priority: 'high',
      notes: `Reviewing ${topic} from ${lecture.courseCode}`,
    });
    showToast(`Added "${topic}" to your Weekly Catch-Up Planner!`);
  };

  // Open AI Tutor with specific mode
  const handleOpenAITutor = (
    lecture: Lecture,
    mode: 'explain' | 'summarize' | 'quiz' = 'explain',
    topic?: string
  ) => {
    setDetailModalLecture(null);
    setTutorState({
      lectureId: lecture.id,
      topic: topic || (lecture.topicsCovered ? lecture.topicsCovered[0] : ''),
      mode,
    });
    setCurrentRole('student');
    setActiveTab('tutor');
  };

  const handleOpenAITutorForPlannerTopic = (subject: string, topic: string, lectureId?: string) => {
    setTutorState({
      lectureId,
      topic,
      mode: 'explain',
    });
    setActiveTab('tutor');
  };

  const handleOpenLectureFromPlanner = (lectureId: string) => {
    const found = storageService.getLectureById(lectureId);
    if (found) {
      setDetailModalLecture(found);
    } else {
      showToast('Lecture record not found.', 'info');
    }
  };

  const handleResetData = () => {
    storageService.resetToSampleData();
    showToast('Sample data reloaded for CS, Biology, Economics, Math & Thermodynamics!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Academic Disclaimer */}
      <DisclaimerBanner />

      {/* Main App Navigation Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lectureCount={lectures.length}
        plannerCount={plannerItems.length}
        onResetData={handleResetData}
      />

      {/* Toast Notification Container */}
      {toast && (
        <aside
          aria-label="Notifications"
          className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-teal-300 border-teal-500/50 shadow-teal-950/20'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            ) : (
              <Info className="w-4 h-4 text-slate-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'faculty' && activeTab === 'faculty-manage' && (
          <FacultyLectureManager
            lectures={lectures}
            onAddLecture={handleAddLecture}
            onUpdateLecture={handleUpdateLecture}
            onDeleteLecture={handleDeleteLecture}
            onPreviewAsStudent={(lec) => setDetailModalLecture(lec)}
            onSwitchToStudentView={() => {
              setCurrentRole('student');
              setActiveTab('lectures');
            }}
          />
        )}

        {currentRole === 'student' && activeTab === 'lectures' && (
          <StudentLectureFeed
            lectures={lectures}
            onSelectLecture={(lec) => setDetailModalLecture(lec)}
            onOpenAITutor={handleOpenAITutor}
            onAddTopicsToPlanner={handleAddTopicsFromLecture}
            onSwitchToFaculty={() => {
              setCurrentRole('faculty');
              setActiveTab('faculty-manage');
            }}
          />
        )}

        {currentRole === 'student' && activeTab === 'planner' && (
          <WeeklyCatchUpPlanner
            items={plannerItems}
            lectures={lectures}
            onToggleStatus={handleToggleCatchUpStatus}
            onDeleteItem={handleDeleteCatchUpItem}
            onAddItem={handleAddCatchUpItem}
            onOpenAITutorForTopic={handleOpenAITutorForPlannerTopic}
            onOpenLecture={handleOpenLectureFromPlanner}
          />
        )}

        {currentRole === 'student' && activeTab === 'tutor' && (
          <AITutorView
            lectures={lectures}
            initialLectureId={tutorState.lectureId}
            initialTopic={tutorState.topic}
            initialMode={tutorState.mode}
            onAddTopicToPlanner={handleAddSingleTopicToPlanner}
          />
        )}
      </main>

      {/* Global Lecture Detail Modal */}
      {detailModalLecture && (
        <LectureDetailModal
          lecture={detailModalLecture}
          onClose={() => setDetailModalLecture(null)}
          onOpenAITutor={handleOpenAITutor}
          onAddTopicToPlanner={handleAddSingleTopicToPlanner}
          onAddAllTopicsToPlanner={handleAddTopicsFromLecture}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">ClassMate<span className="text-teal-400">AI</span></span>
            <span>—</span>
            <span className="text-slate-400">Missed a Class? Never Miss Learning.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button
              onClick={() => {
                setCurrentRole('student');
                setActiveTab('lectures');
              }}
              className="hover:text-white"
            >
              Lectures Feed
            </button>
            <button
              onClick={() => {
                setCurrentRole('student');
                setActiveTab('planner');
              }}
              className="hover:text-white"
            >
              Catch-Up Planner
            </button>
            <button
              onClick={() => {
                setCurrentRole('student');
                setActiveTab('tutor');
              }}
              className="hover:text-white"
            >
              AI Tutor Lab
            </button>
            <button
              onClick={() => {
                setCurrentRole('faculty');
                setActiveTab('faculty-manage');
              }}
              className="hover:text-white"
            >
              Faculty Desk
            </button>
            <button onClick={handleResetData} className="hover:text-teal-400">
              Reset Sample Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
