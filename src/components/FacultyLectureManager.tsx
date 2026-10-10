import React, { useState } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Sparkles, 
  Plus, 
  X, 
  Eye, 
  Layers,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { Lecture, Assignment } from '../types';

interface FacultyLectureManagerProps {
  lectures: Lecture[];
  onAddLecture: (data: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>) => Lecture;
  onUpdateLecture: (id: string, updates: Partial<Lecture>) => void;
  onDeleteLecture: (id: string) => void;
  onPreviewAsStudent: (lecture: Lecture) => void;
  onSwitchToStudentView: () => void;
}

export const FacultyLectureManager: React.FC<FacultyLectureManagerProps> = ({
  lectures,
  onAddLecture,
  onUpdateLecture,
  onDeleteLecture,
  onPreviewAsStudent,
  onSwitchToStudentView,
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [instructor, setInstructor] = useState('Prof. Emily Carter');
  const [room, setRoom] = useState('Science Hall 301');
  const [topicsInput, setTopicsInput] = useState('');
  const [topicsList, setTopicsList] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Assignment section
  const [hasAssignment, setHasAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [assignmentPoints, setAssignmentPoints] = useState(30);
  const [assignmentInstructions, setAssignmentInstructions] = useState('');

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingLectureId(null);
    setSubject('');
    setCourseCode('');
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setInstructor('Prof. Emily Carter');
    setRoom('Science Hall 301');
    setTopicsInput('');
    setTopicsList([]);
    setNotes('');
    setHasAssignment(false);
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentInstructions('');
    setErrorMsg(null);
  };

  const openNewLectureModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (lec: Lecture) => {
    setEditingLectureId(lec.id);
    setSubject(lec.subject);
    setCourseCode(lec.courseCode);
    setTitle(lec.title);
    setDate(lec.date);
    setInstructor(lec.instructor);
    setRoom(lec.room || '');
    setTopicsList([...lec.topicsCovered]);
    setTopicsInput('');
    setNotes(lec.notes);

    if (lec.assignments && lec.assignments.length > 0) {
      setHasAssignment(true);
      const asg = lec.assignments[0];
      setAssignmentTitle(asg.title);
      setAssignmentDescription(asg.description);
      setAssignmentDueDate(asg.dueDate);
      setAssignmentPoints(asg.points || 30);
      setAssignmentInstructions(asg.submissionInstructions || '');
    } else {
      setHasAssignment(false);
      setAssignmentTitle('');
      setAssignmentDescription('');
      setAssignmentInstructions('');
    }

    setErrorMsg(null);
    setShowFormModal(true);
  };

  const handleAddTopicTag = () => {
    const trimmed = topicsInput.trim();
    if (!trimmed) return;
    if (!topicsList.includes(trimmed)) {
      setTopicsList([...topicsList, trimmed]);
    }
    setTopicsInput('');
  };

  const handleRemoveTopicTag = (index: number) => {
    setTopicsList(topicsList.filter((_, i) => i !== index));
  };

  // Quick prefill templates to make testing effortless
  const applyTemplate = (type: 'cs' | 'biology' | 'economics') => {
    if (type === 'cs') {
      setCourseCode('CS 320');
      setSubject('Computer Networks & Distributed Systems');
      setTitle('Lecture 15: TCP Flow Control, Congestion Window & AIMD');
      setTopicsList([
        'Sliding Window Protocol mechanics',
        'TCP Reno vs Cubic algorithms',
        'Additive Increase Multiplicative Decrease (AIMD)',
        'Three-Way Handshake SYN/ACK verification',
      ]);
      setNotes(`## TCP Congestion Control & Reliability
In this lecture we explored how TCP guarantees in-order byte stream delivery over unreliable IP networks.

### 1. Sliding Window & Flow Control
- **Receiver Window (rwnd)**: Advertised in TCP header to prevent buffer overflow at the client.
- **Congestion Window (cwnd)**: Dynamic limit maintained by sender to prevent network bottlenecks.

### 2. AIMD (Additive Increase Multiplicative Decrease)
- **Additive Increase**: Add 1 MSS to cwnd per RTT when no packet loss is detected.
- **Multiplicative Decrease**: Cut cwnd in half upon 3 duplicate ACKs (fast retransmit).

### 3. Exam Problem Focus:
Remember that a timeout triggers Slow Start (cwnd drops to 1 MSS), whereas 3 duplicate ACKs trigger Fast Recovery!`);
      setHasAssignment(true);
      setAssignmentTitle('Wireshark Lab 4: Analyzing TCP Handshakes & Retransmission');
      setAssignmentDescription('Capture packet traces during a 50MB file transfer. Calculate effective RTT and plot congestion window growth curves.');
      setAssignmentPoints(45);
      setAssignmentInstructions('Submit PCAPNG trace file and a 2-page analysis report.');
    } else if (type === 'biology') {
      setCourseCode('BIO 340');
      setSubject('Neurobiology & Synaptic Transmission');
      setTitle('Lecture 08: Voltage-Gated Channels & Action Potential Propagation');
      setTopicsList([
        'Resting Membrane Potential & Nernst Equation',
        'Voltage-Gated Sodium (Na+) and Potassium (K+) Activation Gates',
        'Refractory Periods (Absolute vs Relative)',
        'Myelination & Saltatory Conduction at Nodes of Ranvier',
      ]);
      setNotes(`## Neurobiology: The Action Potential Cycle

### 1. The Membrane Threshold
When membrane depolarization reaches approximately -55mV (threshold), voltage-gated Na+ channels rapidly open:
- Rapid Na+ influx drives membrane potential to +30mV.
- Inactivation gates (ball-and-chain mechanism) close quickly.

### 2. Repolarization & Hyperpolarization
- Delayed rectifier K+ channels open, allowing K+ efflux.
- Membrane potential dips below resting level (-70mV) into the after-hyperpolarization phase.

### 3. Saltatory Conduction
Myelin sheaths formed by Schwann cells (PNS) and Oligodendrocytes (CNS) restrict ionic current to Nodes of Ranvier, increasing conduction speed by up to 100x.`);
      setHasAssignment(true);
      setAssignmentTitle('Membrane Potential Problem Set 2');
      setAssignmentDescription('Calculate equilibrium potentials using the Goldman-Hodgkin-Katz voltage equation under changing extracellular potassium concentrations.');
      setAssignmentPoints(35);
      setAssignmentInstructions('Show full algebraic derivations for parts A through D.');
    } else {
      setCourseCode('ECON 310');
      setSubject('Microeconomic Theory & Game Theory');
      setTitle('Lecture 12: Nash Equilibrium & Repeated Cournot Competition');
      setTopicsList([
        'Simultaneous Move Games & Normal Form Representation',
        'Strictly Dominated Strategies Elimination',
        'Pure vs Mixed Strategy Nash Equilibria',
        'The Prisoner’s Dilemma & Collusion in Repeated Duopolies',
      ]);
      setNotes(`## Game Theory & Strategic Interaction

### 1. Nash Equilibrium Definition
A strategy profile $(s_1^*, s_2^*, ..., s_n^*)$ is a Nash Equilibrium if no player has a profitable unilateral deviation:
$$u_i(s_i^*, s_{-i}^*) \\ge u_i(s_i, s_{-i}^*) \\quad \\forall s_i \\in S_i$$

### 2. Finding Mixed Strategy Equilibria
To find mixed strategies:
- Player A mixes such that Player B is indifferent between their pure strategies.
- Equate expected payoffs for each pure strategy branch!`);
      setHasAssignment(false);
    }
  };

  const handleSaveLecture = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!subject.trim()) {
      setErrorMsg('Please enter a subject name (e.g. Computer Science, Genetics).');
      return;
    }
    if (!courseCode.trim()) {
      setErrorMsg('Please enter a course code (e.g. CS 301, MATH 240).');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a lecture title.');
      return;
    }
    if (!date) {
      setErrorMsg('Please select the date of this lecture.');
      return;
    }
    if (topicsList.length === 0 && !topicsInput.trim()) {
      setErrorMsg('Please add at least one topic covered in this lecture.');
      return;
    }
    if (!notes.trim()) {
      setErrorMsg('Please provide lecture notes or a summary for missed students.');
      return;
    }

    // Process any dangling topic input
    let finalTopics = [...topicsList];
    if (topicsInput.trim()) {
      const parts = topicsInput.split(',').map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => {
        if (!finalTopics.includes(p)) finalTopics.push(p);
      });
    }

    // Build assignment
    const assignments: Assignment[] = [];
    if (hasAssignment && assignmentTitle.trim()) {
      assignments.push({
        id: `asg-${Date.now()}`,
        title: assignmentTitle.trim(),
        description: assignmentDescription.trim() || 'Review problem set and submit before deadline.',
        dueDate: assignmentDueDate || date,
        points: Number(assignmentPoints) || 20,
        submissionInstructions: assignmentInstructions.trim(),
      });
    }

    if (editingLectureId) {
      onUpdateLecture(editingLectureId, {
        subject: subject.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        title: title.trim(),
        date,
        instructor: instructor.trim() || 'Course Instructor',
        room: room.trim(),
        topicsCovered: finalTopics,
        notes: notes.trim(),
        assignments,
      });
      setSuccessNotice(`Updated lecture "${title.trim()}" successfully!`);
    } else {
      const newLec = onAddLecture({
        subject: subject.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        title: title.trim(),
        date,
        instructor: instructor.trim() || 'Course Instructor',
        room: room.trim(),
        topicsCovered: finalTopics,
        notes: notes.trim(),
        assignments,
      });
      setSuccessNotice(`Posted "${newLec.title}"! It is now immediately visible to all students in the Lectures Feed.`);
    }

    setShowFormModal(false);
    resetForm();
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleDelete = (id: string) => {
    onDeleteLecture(id);
    setDeleteConfirmId(null);
    setSuccessNotice('Lecture record deleted from shared database.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-900 text-teal-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Faculty Lecture Desk
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Post and manage lecture records, syllabus topics, class transcripts, and assignments. 
            All entries are saved directly to the shared data store and update the Student View immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openNewLectureModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Post New Lecture</span>
          </button>
          <button
            onClick={onSwitchToStudentView}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            title="Check how students view your posted lectures"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview Student Feed</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-medium flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => onSwitchToStudentView()}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
          >
            View in Student Portal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Lectures Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Published Lecture Records ({lectures.length})
            </h2>
            <p className="text-xs text-slate-500">
              Live records accessible to students for lecture catch-up and AI tutoring.
            </p>
          </div>
          <button
            onClick={openNewLectureModal}
            className="text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            + Add Another
          </button>
        </div>

        {lectures.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No lectures in database</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t posted any lectures yet. Click below to add your first lecture record.
            </p>
            <button
              onClick={openNewLectureModal}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
            >
              + Create First Lecture
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lectures.map((lec) => (
              <div
                key={lec.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-slate-900 text-teal-300">
                      {lec.courseCode}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {lec.subject}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {lec.date}
                    </span>
                    {lec.room && (
                      <span className="text-xs text-slate-600 hidden sm:inline">
                        • {lec.room}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {lec.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 mr-1">
                      {lec.topicsCovered.length} Topics:
                    </span>
                    {lec.topicsCovered.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700"
                      >
                        {topic}
                      </span>
                    ))}
                    {lec.topicsCovered.length > 3 && (
                      <span className="text-[11px] text-slate-600">
                        +{lec.topicsCovered.length - 3} more
                      </span>
                    )}
                  </div>

                  {lec.assignments && lec.assignments.length > 0 && (
                    <div className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Assignment: &ldquo;{lec.assignments[0].title}&rdquo; (Due {lec.assignments[0].dueDate})</span>
                    </div>
                  )}
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => onPreviewAsStudent(lec)}
                    className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    title="View as student modal"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>

                  <button
                    onClick={() => openEditModal(lec)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    title="Edit lecture"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  {deleteConfirmId === lec.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                      <button
                        onClick={() => handleDelete(lec.id)}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(lec.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete lecture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form: Add or Edit Lecture Record */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Title */}
            <div className="p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingLectureId ? 'Edit Lecture Record' : 'Post New Lecture Record'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in the class metadata, topics covered, and notes for students who missed this class.
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Presets Bar */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Quick Prefill Templates:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('cs')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded font-semibold border border-slate-300 transition-colors"
                >
                  Computer Science (TCP/IP)
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('biology')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded font-semibold border border-slate-300 transition-colors"
                >
                  Biology (Neurobiology)
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('economics')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded font-semibold border border-slate-300 transition-colors"
                >
                  Economics (Game Theory)
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveLecture} className="p-6 overflow-y-auto space-y-5 flex-1">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Row 1: Course Code, Subject, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS 301, BIO 210"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures & Algorithms"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lecture Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Lecture Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 14: Dynamic Programming & Optimal Substructure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Row 3: Instructor & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Emily Carter"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Classroom / Lecture Hall
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Turing Hall 204"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Topics Covered Tag Adder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topics Covered (Key syllabus concepts) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type topic and click Add, or separate multiple with commas..."
                    value={topicsInput}
                    onChange={(e) => setTopicsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopicTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopicTag}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    + Add Topic
                  </button>
                </div>

                {topicsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {topicsList.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTopicTag(idx)}
                          className="text-teal-600 hover:text-teal-900 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Detailed Lecture Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Lecture Notes & Recap for Missed Students *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Supports markdown formatting (## headings, - bullets, formulas)
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste or write detailed lecture summary, definitions, step-by-step formulas, or takeaways..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-sans focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Assignment Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAssignment}
                      onChange={(e) => setHasAssignment(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Include Assigned Homework or Lab
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Students will see due dates and submission criteria
                  </span>
                </div>

                {hasAssignment && (
                  <div className="mt-3 p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          Assignment Title *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lab 4: Memory Profiling"
                          value={assignmentTitle}
                          onChange={(e) => setAssignmentTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          Due Date *
                        </label>
                        <input
                          type="date"
                          value={assignmentDueDate}
                          onChange={(e) => setAssignmentDueDate(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Task Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Explain what problems students must solve or what code to implement..."
                        value={assignmentDescription}
                        onChange={(e) => setAssignmentDescription(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          Point Value
                        </label>
                        <input
                          type="number"
                          value={assignmentPoints}
                          onChange={(e) => setAssignmentPoints(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          Submission Guidelines
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Submit PDF via student course portal"
                          value={assignmentInstructions}
                          onChange={(e) => setAssignmentInstructions(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingLectureId ? 'Update Lecture' : 'Publish to Student Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
