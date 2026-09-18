import { Exam, StudyTask, MoodLogEntry, MoodProfile, MoodType } from '../types';

export const MOODS: Record<MoodType, MoodProfile> = {
  energized: {
    label: "Energized",
    color: "#D97706",
    hex: "#E8A33D",
    block: 50,
    brk: 10,
    order: "priority",
    tag: "Deep-Work Flow (50m blocks)",
    tagColor: "#E8A33D",
    description: "Peak mental energy. Tackle your most demanding, high-weight exam topics first.",
    advice: "Channel this energy into active problem solving and challenging exam papers."
  },
  focused: {
    label: "Focused",
    color: "#2D6A4F",
    hex: "#3D7A5C",
    block: 45,
    brk: 8,
    order: "priority",
    tag: "Standard Pomodoro (45m blocks)",
    tagColor: "#3D7A5C",
    description: "Solid, clear concentration. Balanced intervals for steady retention.",
    advice: "Maintain rhythm with timed 45-minute sprints and brief standing breaks."
  },
  calm: {
    label: "Calm",
    color: "#3B6998",
    hex: "#4C7EA8",
    block: 35,
    brk: 10,
    order: "asc",
    tag: "Steady & Low Friction (35m blocks)",
    tagColor: "#4C7EA8",
    description: "Relaxed state of mind. Gradual ramp-up from lighter topics to deeper study.",
    advice: "Build momentum with straightforward review before tackling complex proofs."
  },
  low: {
    label: "Low Energy",
    color: "#795290",
    hex: "#8B6FB3",
    block: 20,
    brk: 12,
    order: "asc",
    tag: "Micro-Sprints & High Rest (20m blocks)",
    tagColor: "#8B6FB3",
    description: "Feeling fatigued or drained. Short bite-sized bursts with generous rest.",
    advice: "Lower the friction: flashcard recall or listening to lecture recordings counts as progress."
  },
  stressed: {
    label: "Stressed / Overwhelmed",
    color: "#B83A30",
    hex: "#C0554A",
    block: 18,
    brk: 14,
    order: "priority-first-small",
    tag: "Tension-Relief Sprints (18m blocks)",
    tagColor: "#C0554A",
    description: "Exam anxiety or high tension. Immediate small win followed by mindful breathing.",
    advice: "Knock out one quick high-priority slice to break the paralysis and calm nerves."
  }
};

export function getInitialExams(): Exam[] {
  const now = new Date();
  
  const d1 = new Date(now);
  d1.setDate(now.getDate() + 3);
  d1.setHours(9, 30, 0, 0);

  const d2 = new Date(now);
  d2.setDate(now.getDate() + 7);
  d2.setHours(13, 0, 0, 0);

  const d3 = new Date(now);
  d3.setDate(now.getDate() + 14);
  d3.setHours(10, 0, 0, 0);

  const d4 = new Date(now);
  d4.setDate(now.getDate() + 21);
  d4.setHours(15, 30, 0, 0);

  return [
    {
      id: "exam-1",
      courseCode: "CHEM 201",
      title: "Organic Chemistry II - Midterm",
      dateTime: d1.toISOString(),
      durationMins: 120,
      location: "Science Hall Aud. 102",
      color: "#3D7A5C",
      weight: 35,
      targetGrade: "A (92%)",
      confidence: 3,
      notes: "Focus heavily on nucleophilic addition and stereochemistry reaction trees.",
      topics: [
        { id: "t1-1", title: "Carbonyl Additions & Grignard reagents", completed: true, difficulty: "hard" },
        { id: "t1-2", title: "Enols, Enolates & Aldol Condensation", completed: true, difficulty: "hard" },
        { id: "t1-3", title: "Carboxylic Acid Derivatives & Mechanisms", completed: false, difficulty: "medium" },
        { id: "t1-4", title: "1H & 13C NMR Spectroscopy Analysis", completed: false, difficulty: "medium" },
        { id: "t1-5", title: "2023 Past Exam Paper Simulation", completed: false, difficulty: "hard" },
      ]
    },
    {
      id: "exam-2",
      courseCode: "CS 210",
      title: "Data Structures & Algorithms Final",
      dateTime: d2.toISOString(),
      durationMins: 180,
      location: "Turing Bldg Room 304",
      color: "#4C7EA8",
      weight: 40,
      targetGrade: "A+ (96%)",
      confidence: 4,
      notes: "Practice whiteboard coding on tree traversals and dynamic programming memoization.",
      topics: [
        { id: "t2-1", title: "Red-Black Trees & AVL Self-Balancing", completed: true, difficulty: "medium" },
        { id: "t2-2", title: "Dijkstra's & Bellman-Ford Shortest Path", completed: true, difficulty: "medium" },
        { id: "t2-3", title: "Dynamic Programming: Knapsack & Edit Distance", completed: false, difficulty: "hard" },
        { id: "t2-4", title: "Amortized Complexity & Disjoint Sets", completed: true, difficulty: "easy" },
        { id: "t2-5", title: "Mock Exam: 4 Leetcode medium timed problems", completed: false, difficulty: "hard" },
      ]
    },
    {
      id: "exam-3",
      courseCode: "ECON 102",
      title: "Macroeconomic Principles Exam",
      dateTime: d3.toISOString(),
      durationMins: 90,
      location: "East Lecture Center 4",
      color: "#E8A33D",
      weight: 25,
      targetGrade: "A (90%)",
      confidence: 4,
      notes: "Memorize IS-LM curve shifts and Federal Reserve monetary policy instruments.",
      topics: [
        { id: "t3-1", title: "GDP Accounting & Inflation Deflator", completed: true, difficulty: "easy" },
        { id: "t3-2", title: "Aggregate Demand & Aggregate Supply (AD-AS)", completed: false, difficulty: "medium" },
        { id: "t3-3", title: "Fiscal vs Monetary Policy Stimulus transmission", completed: false, difficulty: "medium" },
        { id: "t3-4", title: "Foreign Exchange Rates & Purchasing Power Parity", completed: false, difficulty: "easy" },
      ]
    },
    {
      id: "exam-4",
      courseCode: "NEUR 305",
      title: "Cognitive Neuroscience Term Test",
      dateTime: d4.toISOString(),
      durationMins: 120,
      location: "BioMed Hall Rm 212",
      color: "#8B6FB3",
      weight: 30,
      targetGrade: "A (94%)",
      confidence: 2,
      notes: "Requires deep memorization of anatomical pathways and visual cortical areas (V1-V5).",
      topics: [
        { id: "t4-1", title: "Action Potential & Synaptic Vesicle Dynamics", completed: true, difficulty: "easy" },
        { id: "t4-2", title: "Visual Cortex Hierarchies & Ventral/Dorsal Streams", completed: false, difficulty: "hard" },
        { id: "t4-3", title: "Hippocampal LTP & Memory Consolidation", completed: false, difficulty: "medium" },
        { id: "t4-4", title: "fMRI vs EEG spatial & temporal resolution analysis", completed: false, difficulty: "medium" },
      ]
    }
  ];
}

export function getInitialTasks(): StudyTask[] {
  return [
    {
      id: "task-1",
      name: "Derive Aldol & Claisen mechanisms step-by-step",
      mins: 45,
      pri: "high",
      examId: "exam-1",
      category: "Problem Set",
      completed: false,
      tips: "Draw out formal charges and arrow pushes without looking at answer key first."
    },
    {
      id: "task-2",
      name: "Solve 3 Dynamic Programming problems (Knapsack & LCS)",
      mins: 50,
      pri: "high",
      examId: "exam-2",
      category: "Practice Exam",
      completed: false,
      tips: "Write the recurrence relation on paper before writing code."
    },
    {
      id: "task-3",
      name: "Review Carboxylic acid derivatives reactivity ranking",
      mins: 30,
      pri: "med",
      examId: "exam-1",
      category: "Revision",
      completed: false,
      tips: "Order by leaving group basicity (acyl chloride > anhydride > ester > amide)."
    },
    {
      id: "task-4",
      name: "AD-AS curve shift practice scenarios and graphs",
      mins: 35,
      pri: "med",
      examId: "exam-3",
      category: "Problem Set",
      completed: false,
      tips: "Label both initial and shifted equilibrium points clearly."
    },
    {
      id: "task-5",
      name: "Review Visual Cortex anatomy flashcards (Anki / Quizlet)",
      mins: 20,
      pri: "low",
      examId: "exam-4",
      category: "Flashcards",
      completed: false,
      tips: "Spaced repetition: review any marked difficult twice."
    },
    {
      id: "task-6",
      name: "Formula sheet synthesis for Dijkstra & Bellman-Ford complexities",
      mins: 25,
      pri: "low",
      examId: "exam-2",
      category: "Summary Notes",
      completed: true,
      tips: "Compare priority queue vs adjacency matrix implementations."
    }
  ];
}

export function getInitialMoodLogs(): MoodLogEntry[] {
  const now = new Date();
  
  const m1 = new Date(now);
  m1.setHours(now.getHours() - 4);

  const m2 = new Date(now);
  m2.setDate(now.getDate() - 1);
  m2.setHours(10, 15, 0, 0);

  const m3 = new Date(now);
  m3.setDate(now.getDate() - 2);
  m3.setHours(16, 45, 0, 0);

  const m4 = new Date(now);
  m4.setDate(now.getDate() - 3);
  m4.setHours(9, 0, 0, 0);

  const m5 = new Date(now);
  m5.setDate(now.getDate() - 4);
  m5.setHours(14, 20, 0, 0);

  return [
    {
      id: "log-1",
      mood: "focused",
      note: "Coffee kicked in, ready to tackle organic synthesis reaction trees.",
      when: m1.toISOString()
    },
    {
      id: "log-2",
      mood: "energized",
      note: "High mental clarity after gym session. Covered 2 chapters.",
      when: m2.toISOString()
    },
    {
      id: "log-3",
      mood: "stressed",
      note: "Felt nervous about Organic Chemistry midterm in 3 days. Short sprints helped.",
      when: m3.toISOString()
    },
    {
      id: "log-4",
      mood: "calm",
      note: "Quiet morning study session. Summarized Macroeconomics notes.",
      when: m4.toISOString()
    },
    {
      id: "log-5",
      mood: "low",
      note: "Tired after long lab class. Did light flashcard review.",
      when: m5.toISOString()
    }
  ];
}
