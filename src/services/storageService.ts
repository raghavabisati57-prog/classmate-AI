import { Lecture, CatchUpItem, CatchUpStatus } from '../types';
import { INITIAL_SAMPLE_LECTURES, INITIAL_SAMPLE_CATCH_UP_ITEMS } from '../data/sampleLectures';

const LECTURES_STORAGE_KEY = 'classmate_ai_lectures_v1';
const PLANNER_STORAGE_KEY = 'classmate_ai_planner_v1';
const EVENT_NAME = 'classmate-storage-sync';

class StorageService {
  private lectures: Lecture[] = [];
  private plannerItems: CatchUpItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === LECTURES_STORAGE_KEY || e.key === PLANNER_STORAGE_KEY) {
          this.loadFromStorage();
          this.notifyListeners();
        }
      });
      window.addEventListener(EVENT_NAME, () => {
        this.loadFromStorage();
        this.notifyListeners();
      });
    }
  }

  private init() {
    this.loadFromStorage();
    if (this.lectures.length === 0) {
      this.lectures = [...INITIAL_SAMPLE_LECTURES];
      this.saveLecturesToStorage();
    }
    if (this.plannerItems.length === 0) {
      this.plannerItems = [...INITIAL_SAMPLE_CATCH_UP_ITEMS];
      this.savePlannerToStorage();
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const storedLectures = localStorage.getItem(LECTURES_STORAGE_KEY);
        if (storedLectures) {
          this.lectures = JSON.parse(storedLectures);
        }
        const storedPlanner = localStorage.getItem(PLANNER_STORAGE_KEY);
        if (storedPlanner) {
          this.plannerItems = JSON.parse(storedPlanner);
        }
      }
    } catch (err) {
      console.warn('Storage read failed, falling back to memory state', err);
    }
  }

  private saveLecturesToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LECTURES_STORAGE_KEY, JSON.stringify(this.lectures));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
      }
    } catch (err) {
      console.warn('Storage write failed', err);
    }
    this.notifyListeners();
  }

  private savePlannerToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(this.plannerItems));
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
      }
    } catch (err) {
      console.warn('Storage write failed', err);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error('Listener callback error', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Lecture Methods ---
  public getLectures(): Lecture[] {
    return [...this.lectures];
  }

  public getLectureById(id: string): Lecture | undefined {
    return this.lectures.find((lec) => lec.id === id);
  }

  public addLecture(data: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Lecture {
    const now = new Date().toISOString();
    const newLecture: Lecture = {
      ...data,
      id: `lec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.lectures = [newLecture, ...this.lectures];
    this.saveLecturesToStorage();
    return newLecture;
  }

  public updateLecture(id: string, updates: Partial<Omit<Lecture, 'id' | 'createdAt'>>): Lecture | null {
    const index = this.lectures.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const updated: Lecture = {
      ...this.lectures[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.lectures[index] = updated;
    this.saveLecturesToStorage();
    return updated;
  }

  public deleteLecture(id: string): boolean {
    const initialLen = this.lectures.length;
    this.lectures = this.lectures.filter((l) => l.id !== id);
    if (this.lectures.length !== initialLen) {
      this.saveLecturesToStorage();
      return true;
    }
    return false;
  }

  public resetToSampleData(): void {
    this.lectures = [...INITIAL_SAMPLE_LECTURES];
    this.plannerItems = [...INITIAL_SAMPLE_CATCH_UP_ITEMS];
    this.saveLecturesToStorage();
    this.savePlannerToStorage();
  }

  // --- Catch-Up Planner Methods ---
  public getCatchUpItems(): CatchUpItem[] {
    return [...this.plannerItems];
  }

  public addCatchUpItem(item: Omit<CatchUpItem, 'id' | 'createdAt'>): CatchUpItem {
    const newItem: CatchUpItem = {
      ...item,
      id: `catchup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.plannerItems = [newItem, ...this.plannerItems];
    this.savePlannerToStorage();
    return newItem;
  }

  public toggleCatchUpStatus(id: string): CatchUpItem | null {
    const item = this.plannerItems.find((i) => i.id === id);
    if (!item) return null;

    const nextStatus: Record<CatchUpStatus, CatchUpStatus> = {
      'to-review': 'in-progress',
      'in-progress': 'mastered',
      'mastered': 'to-review',
    };

    const newStatus = nextStatus[item.status];
    return this.updateCatchUpItem(id, {
      status: newStatus,
      completedAt: newStatus === 'mastered' ? new Date().toISOString() : undefined,
    });
  }

  public updateCatchUpItem(id: string, updates: Partial<CatchUpItem>): CatchUpItem | null {
    const index = this.plannerItems.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const updated = { ...this.plannerItems[index], ...updates };
    this.plannerItems[index] = updated;
    this.savePlannerToStorage();
    return updated;
  }

  public deleteCatchUpItem(id: string): boolean {
    const initialLen = this.plannerItems.length;
    this.plannerItems = this.plannerItems.filter((i) => i.id !== id);
    if (this.plannerItems.length !== initialLen) {
      this.savePlannerToStorage();
      return true;
    }
    return false;
  }

  public addTopicsFromLectureToPlanner(lecture: Lecture): number {
    let countAdded = 0;
    const existingTopics = new Set(
      this.plannerItems
        .filter((i) => i.lectureId === lecture.id)
        .map((i) => i.topic.trim().toLowerCase())
    );

    lecture.topicsCovered.forEach((topic) => {
      const cleanTopic = topic.trim();
      if (!cleanTopic) return;
      if (!existingTopics.has(cleanTopic.toLowerCase())) {
        this.addCatchUpItem({
          lectureId: lecture.id,
          courseCode: lecture.courseCode,
          subject: lecture.subject,
          lectureTitle: lecture.title,
          topic: cleanTopic,
          lectureDate: lecture.date,
          status: 'to-review',
          priority: 'high',
          notes: `Added from ${lecture.courseCode} lecture on ${lecture.date}`,
        });
        existingTopics.add(cleanTopic.toLowerCase());
        countAdded++;
      }
    });

    return countAdded;
  }
}

export const storageService = new StorageService();
