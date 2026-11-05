import {
  Subject,
  Task,
  Note,
  CalendarEvent,
  Achievement,
  AppNotification,
  UserSettings,
  FocusSession,
  UserAccount
} from '../types';

export const DEMO_USER_ID = 'demo-user-jagruti';

export const INITIAL_DEMO_ACCOUNT: UserAccount = {
  id: DEMO_USER_ID,
  email: 'padalajagrutisrilavanya@gmail.com',
  name: 'Jagruti Srilavanya',
  createdAt: '2026-09-01'
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    userId: DEMO_USER_ID,
    name: 'Data Structures and Algorithms',
    code: 'CS301',
    description: 'Advanced data structures, graph traversals, dynamic programming, and complexity analysis.',
    color: '#8B5CF6',
    icon: 'Network',
    targetHoursPerWeek: 8,
    instructor: 'Dr. Alan Vance',
    room: 'Hall B-204',
    topics: [
      { id: 'top-1', title: 'Asymptotic Analysis & Master Theorem', completed: true },
      { id: 'top-2', title: 'Balanced Search Trees (AVL & Red-Black)', completed: true },
      { id: 'top-3', title: 'Graph Algorithms (BFS, DFS, Dijkstra)', completed: true },
      { id: 'top-4', title: 'Dynamic Programming & Memoization', completed: false },
      { id: 'top-5', title: 'String Matching (KMP & Rabin-Karp)', completed: false },
      { id: 'top-6', title: 'Disjoint Set Union & Minimum Spanning Trees', completed: false }
    ]
  },
  {
    id: 'sub-dbms',
    userId: DEMO_USER_ID,
    name: 'Database Management Systems',
    code: 'CS304',
    description: 'Relational database design, relational algebra, SQL optimization, and indexing.',
    color: '#6366F1',
    icon: 'Database',
    targetHoursPerWeek: 6,
    instructor: 'Prof. Sarah Jenkins',
    room: 'Lab 3',
    topics: [
      { id: 'top-7', title: 'Relational Algebra & ER Modeling', completed: true },
      { id: 'top-8', title: 'Advanced SQL, Joins & Subqueries', completed: true },
      { id: 'top-9', title: 'Normalization (1NF, 2NF, 3NF, BCNF)', completed: true },
      { id: 'top-10', title: 'ACID Properties & Transaction Schedules', completed: false },
      { id: 'top-11', title: 'B+ Tree Indexing & Hash Indices', completed: false }
    ]
  },
  {
    id: 'sub-cn',
    userId: DEMO_USER_ID,
    name: 'Computer Networks',
    code: 'CS306',
    description: 'Protocol architecture, OSI model, packet routing, transport layer congestion control.',
    color: '#0EA5E9',
    icon: 'Wifi',
    targetHoursPerWeek: 5,
    instructor: 'Dr. Michael Chen',
    room: 'Hall C-101',
    topics: [
      { id: 'top-12', title: 'OSI 7-Layer & TCP/IP Model', completed: true },
      { id: 'top-13', title: 'Data Link Layer & Error Detection (CRC)', completed: true },
      { id: 'top-14', title: 'Subnetting, CIDR & IP Addressing', completed: true },
      { id: 'top-15', title: 'Routing Protocols (OSPF, BGP, RIP)', completed: false },
      { id: 'top-16', title: 'TCP Flow Control & Congestion Avoidance', completed: false }
    ]
  },
  {
    id: 'sub-math',
    userId: DEMO_USER_ID,
    name: 'Mathematics',
    code: 'MATH202',
    description: 'Discrete mathematics, linear algebra, graph theory, and probability for computer scientists.',
    color: '#EC4899',
    icon: 'Calculator',
    targetHoursPerWeek: 7,
    instructor: 'Prof. Elena Rostova',
    room: 'Tower 4-A',
    topics: [
      { id: 'top-17', title: 'Matrix Algebra, Determinants & Rank', completed: true },
      { id: 'top-18', title: 'Vector Spaces & Linear Transformations', completed: true },
      { id: 'top-19', title: 'Eigenvalues & Diagonalization', completed: false },
      { id: 'top-20', title: 'Combinatorics & Recurrence Relations', completed: false },
      { id: 'top-21', title: 'Discrete Probability & Bayes Theorem', completed: false }
    ]
  },
  {
    id: 'sub-cs',
    userId: DEMO_USER_ID,
    name: 'Computer Science',
    code: 'CS201',
    description: 'Computer systems, CPU architecture, memory hierarchy, and process scheduling.',
    color: '#10B981',
    icon: 'Cpu',
    targetHoursPerWeek: 6,
    instructor: 'Dr. Marcus Thorne',
    room: 'Hall A-105',
    topics: [
      { id: 'top-22', title: 'Instruction Set Architecture & Assembly', completed: true },
      { id: 'top-23', title: 'CPU Pipelining & Hazard Resolution', completed: true },
      { id: 'top-24', title: 'Cache Memory Hierarchy & LRU Replacement', completed: false },
      { id: 'top-25', title: 'Virtual Memory & Page Replacement', completed: false }
    ]
  },
  {
    id: 'sub-eng',
    userId: DEMO_USER_ID,
    name: 'English',
    code: 'ENG105',
    description: 'Technical report writing, research methodology, academic presentations and documentation.',
    color: '#F59E0B',
    icon: 'BookOpen',
    targetHoursPerWeek: 4,
    instructor: 'Ms. Clara Higgins',
    room: 'Humanities 2',
    topics: [
      { id: 'top-26', title: 'Academic Research Proposals & Citation Styles', completed: true },
      { id: 'top-27', title: 'Drafting Abstracts & Technical Methodologies', completed: false },
      { id: 'top-28', title: 'Executive Summary & Presentation Delivery', completed: false }
    ]
  }
];

const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: DEMO_USER_ID,
    title: 'Implement Dijkstra and A* Search Algorithms',
    description: 'Complete the graph traversal assignment with benchmark comparisons on grid graphs.',
    subjectId: 'sub-dsa',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: getRelativeDate(0), // Today
    dueTime: '17:00',
    category: 'Assignment',
    tags: ['algorithms', 'coding', 'graphs'],
    estimatedMinutes: 120,
    createdAt: getRelativeDate(-2)
  },
  {
    id: 'task-2',
    userId: DEMO_USER_ID,
    title: 'SQL Normalization Problem Set (3NF & BCNF)',
    description: 'Decompose relation schemas to Boyce-Codd Normal Form and verify dependency preservation.',
    subjectId: 'sub-dbms',
    priority: 'high',
    status: 'todo',
    dueDate: getRelativeDate(0), // Today
    dueTime: '21:00',
    category: 'Problem Set',
    tags: ['sql', 'theory'],
    estimatedMinutes: 90,
    createdAt: getRelativeDate(-3)
  },
  {
    id: 'task-3',
    userId: DEMO_USER_ID,
    title: 'Wireshark TCP 3-Way Handshake Packet Capture Analysis',
    description: 'Analyze PCAP files in Wireshark and measure round-trip latency variations.',
    subjectId: 'sub-cn',
    priority: 'medium',
    status: 'todo',
    dueDate: getRelativeDate(1), // Tomorrow
    dueTime: '14:00',
    category: 'Lab Report',
    tags: ['networking', 'wireshark'],
    estimatedMinutes: 75,
    createdAt: getRelativeDate(-1)
  },
  {
    id: 'task-4',
    userId: DEMO_USER_ID,
    title: 'Solve Eigenvalues and Diagonalization Exercises',
    description: 'Chapter 5 review questions 12 to 28 on characteristic polynomials.',
    subjectId: 'sub-math',
    priority: 'medium',
    status: 'in_progress',
    dueDate: getRelativeDate(2),
    dueTime: '18:30',
    category: 'Practice',
    tags: ['linear-algebra', 'homework'],
    estimatedMinutes: 100,
    createdAt: getRelativeDate(-4)
  },
  {
    id: 'task-5',
    userId: DEMO_USER_ID,
    title: 'Draft Abstract & Methodology for Research Report',
    description: 'Submit preliminary draft of the distributed consensus paper for peer review.',
    subjectId: 'sub-eng',
    priority: 'low',
    status: 'todo',
    dueDate: getRelativeDate(4),
    dueTime: '23:59',
    category: 'Writing',
    tags: ['paper', 'draft'],
    estimatedMinutes: 60,
    createdAt: getRelativeDate(-2)
  },
  {
    id: 'task-6',
    userId: DEMO_USER_ID,
    title: 'CPU Cache Miss Simulator in C/C++',
    description: 'Simulate L1/L2 cache hit rate with LRU eviction policy.',
    subjectId: 'sub-cs',
    priority: 'high',
    status: 'todo',
    dueDate: getRelativeDate(5),
    dueTime: '19:00',
    category: 'Project',
    tags: ['systems', 'c++'],
    estimatedMinutes: 150,
    createdAt: getRelativeDate(-1)
  },
  {
    id: 'task-7',
    userId: DEMO_USER_ID,
    title: 'Review B-Tree vs LSM-Tree Storage Engines',
    description: 'Prepare lecture presentation slides comparing read/write amplification.',
    subjectId: 'sub-dbms',
    priority: 'medium',
    status: 'completed',
    dueDate: getRelativeDate(-1),
    dueTime: '16:00',
    category: 'Reading',
    tags: ['storage', 'databases'],
    estimatedMinutes: 80,
    completedAt: getRelativeDate(-1) + 'T15:45:00Z',
    createdAt: getRelativeDate(-5)
  },
  {
    id: 'task-8',
    userId: DEMO_USER_ID,
    title: 'Binary Heap & Priority Queue Practice Problems',
    description: 'Solved 15 LeetCode medium questions on heapify and top-k frequent elements.',
    subjectId: 'sub-dsa',
    priority: 'low',
    status: 'completed',
    dueDate: getRelativeDate(-2),
    dueTime: '18:00',
    category: 'Practice',
    tags: ['dsa', 'heaps'],
    estimatedMinutes: 90,
    completedAt: getRelativeDate(-2) + 'T17:30:00Z',
    createdAt: getRelativeDate(-6)
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    userId: DEMO_USER_ID,
    title: 'Midterm Examination: Data Structures & Algorithms',
    subjectId: 'sub-dsa',
    date: getRelativeDate(3),
    time: '09:30',
    endTime: '11:30',
    category: 'exam',
    room: 'Auditorium West',
    weightage: '25% of Final Grade',
    description: 'Comprehensive exam covering AVL trees, graph algorithms, and DP foundations.'
  },
  {
    id: 'cal-2',
    userId: DEMO_USER_ID,
    title: 'Quiz 2: Relational Schema & SQL Transactions',
    subjectId: 'sub-dbms',
    date: getRelativeDate(7),
    time: '11:00',
    endTime: '12:00',
    category: 'assignment',
    room: 'Lab Hall 3',
    weightage: '15% of Final Grade',
    description: 'In-lab assessment on SQL normalization and transaction schedules.'
  },
  {
    id: 'cal-3',
    userId: DEMO_USER_ID,
    title: 'Major Assessment: Discrete Math & Linear Algebra',
    subjectId: 'sub-math',
    date: getRelativeDate(14),
    time: '14:00',
    endTime: '16:30',
    category: 'exam',
    room: 'Science Complex 102',
    weightage: '30% of Final Grade',
    description: 'Covers vector spaces, eigenvalues, and combinatorics.'
  },
  {
    id: 'cal-4',
    userId: DEMO_USER_ID,
    title: 'Group Study Session: Algorithms Review',
    subjectId: 'sub-dsa',
    date: getRelativeDate(1),
    time: '16:00',
    endTime: '18:00',
    category: 'study_session',
    room: 'Library Room 4B',
    description: 'Peer problem-solving on dynamic programming and graph traversals.'
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    userId: DEMO_USER_ID,
    title: 'Graph Traversal Complexity Cheatsheet',
    content: `Key points to remember for midterms:
- BFS uses Queue; DFS uses Stack (or recursion).
- Time Complexity on Adjacency List: O(V + E)
- Dijkstra Algorithm: O((V + E) log V) with Min-Heap. Fails with negative edge weights!
- Bellman-Ford: O(V * E). Detects negative cycles.
- Floyd-Warshall: O(V^3). All-pairs shortest path.`,
    subjectId: 'sub-dsa',
    category: 'DSA',
    tags: ['algorithms', 'cheatsheet', 'graphs', 'exam-prep'],
    isPinned: true,
    isFavorite: true,
    createdAt: getRelativeDate(-4),
    updatedAt: getRelativeDate(-1)
  },
  {
    id: 'note-2',
    userId: DEMO_USER_ID,
    title: 'Database Normalization Rules (1NF to BCNF)',
    content: `Quick reference for decomposition:
1. 1NF: Atomic attributes, no repeating groups.
2. 2NF: In 1NF + No partial dependencies (every non-prime attribute is fully dependent on the candidate key).
3. 3NF: In 2NF + No transitive dependencies (A -> B -> C).
4. BCNF: For every non-trivial functional dependency X -> Y, X must be a superkey.`,
    subjectId: 'sub-dbms',
    category: 'DBMS',
    tags: ['sql', 'normalization', 'relational-theory'],
    isPinned: true,
    isFavorite: false,
    createdAt: getRelativeDate(-3),
    updatedAt: getRelativeDate(-2)
  },
  {
    id: 'note-3',
    userId: DEMO_USER_ID,
    title: 'TCP vs UDP Header Comparison & Flags',
    content: `TCP Header (20-60 bytes):
- SYN, ACK, FIN, RST, PSH, URG flags
- Sequence and Acknowledgment numbers for reliable ordered delivery
- Window size for flow control

UDP Header (8 bytes):
- Source port, Destination port, Length, Checksum
- Connectionless, unreliable, ideal for real-time streaming & DNS queries.`,
    subjectId: 'sub-cn',
    category: 'Resources',
    tags: ['networking', 'protocols', 'tcp-ip'],
    isPinned: false,
    isFavorite: true,
    createdAt: getRelativeDate(-5),
    updatedAt: getRelativeDate(-3)
  },
  {
    id: 'note-4',
    userId: DEMO_USER_ID,
    title: 'Matrix Diagonalization Algorithm Steps',
    content: `To diagonalize an n x n matrix A:
1. Find characteristic polynomial: det(A - λI) = 0.
2. Solve for eigenvalues λ_1, λ_2, ...
3. For each eigenvalue, find the basis of eigenvectors: (A - λI)v = 0.
4. Construct matrix P whose columns are the eigenvectors.
5. Matrix D = P^(-1) * A * P is the diagonal matrix containing eigenvalues.`,
    subjectId: 'sub-math',
    category: 'Exams',
    tags: ['linear-algebra', 'matrices', 'formulas'],
    isPinned: false,
    isFavorite: false,
    createdAt: getRelativeDate(-2),
    updatedAt: getRelativeDate(-2)
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-task',
    userId: DEMO_USER_ID,
    title: 'First Step to Greatness',
    description: 'Completed your first study task in the planner.',
    icon: 'CheckCircle2',
    category: 'tasks',
    unlocked: true,
    unlockedAt: getRelativeDate(-5),
    progress: 1,
    target: 1
  },
  {
    id: 'ach-streak-3',
    userId: DEMO_USER_ID,
    title: 'Momentum Builder',
    description: 'Maintained a 3-day active study streak.',
    icon: 'Flame',
    category: 'streak',
    unlocked: true,
    unlockedAt: getRelativeDate(-3),
    progress: 3,
    target: 3
  },
  {
    id: 'ach-streak-7',
    userId: DEMO_USER_ID,
    title: 'Consistency Champion',
    description: 'Maintained a 7-day uninterrupted study streak.',
    icon: 'Zap',
    category: 'streak',
    unlocked: true,
    unlockedAt: getRelativeDate(0),
    progress: 7,
    target: 7
  },
  {
    id: 'ach-study-star',
    userId: DEMO_USER_ID,
    title: 'Study Star',
    description: 'Accumulate 25 hours of focused study time.',
    icon: 'Sparkles',
    category: 'focus',
    unlocked: true,
    unlockedAt: getRelativeDate(-1),
    progress: 28,
    target: 25
  },
  {
    id: 'ach-focus-master',
    userId: DEMO_USER_ID,
    title: 'Pomodoro Master',
    description: 'Complete 20 full Pomodoro focus sessions.',
    icon: 'Timer',
    category: 'focus',
    unlocked: false,
    progress: 14,
    target: 20
  },
  {
    id: 'ach-syllabus-50',
    userId: DEMO_USER_ID,
    title: 'Halfway Scholar',
    description: 'Complete at least 50% of the syllabus in any subject.',
    icon: 'BookOpen',
    category: 'syllabus',
    unlocked: true,
    unlockedAt: getRelativeDate(-2),
    progress: 50,
    target: 50
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: DEMO_USER_ID,
    title: 'Assignment Due Today',
    message: 'Dijkstra and A* Search Algorithms assignment is due today at 5:00 PM.',
    type: 'deadline',
    timestamp: '25 mins ago',
    read: false,
    actionUrl: '/app/tasks'
  },
  {
    id: 'notif-2',
    userId: DEMO_USER_ID,
    title: 'Upcoming Midterm Exam',
    message: 'DSA Midterm Examination in 3 days. Review your graph notes!',
    type: 'exam',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/app/calendar'
  },
  {
    id: 'notif-3',
    userId: DEMO_USER_ID,
    title: 'Streak Milestone Achieved!',
    message: 'Congratulations! You reached a 7-day study streak milestone in Smart Study Planner.',
    type: 'achievement',
    timestamp: 'Yesterday',
    read: true,
    actionUrl: '/app/achievements'
  }
];

export const INITIAL_SETTINGS: UserSettings = {
  displayName: 'Jagruti Srilavanya',
  email: 'padalajagrutisrilavanya@gmail.com',
  avatarUrl: '/src/assets/images/avatar_student_jagruti_1792929823998.jpg',
  hasCustomAvatar: false,
  bio: 'Computer Science senior focusing on Distributed Systems and Data Structures. Aiming for Dean\'s List this semester!',
  theme: 'light',
  accentColor: '#8B5CF6',
  layoutMode: 'comfortable',
  notifications: {
    taskReminders: true,
    examReminders: true,
    dailyStudyReminder: true,
    browserNotifications: false,
    timerSounds: true
  },
  studyPreferences: {
    dailyGoalHours: 4.5,
    defaultFocusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    preferredStudyTime: 'morning'
  }
};

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'ses-1',
    userId: DEMO_USER_ID,
    durationMinutes: 25,
    subjectId: 'sub-dsa',
    completedAt: getRelativeDate(0) + 'T09:30:00Z',
    type: 'focus'
  },
  {
    id: 'ses-2',
    userId: DEMO_USER_ID,
    durationMinutes: 25,
    subjectId: 'sub-dsa',
    completedAt: getRelativeDate(0) + 'T10:00:00Z',
    type: 'focus'
  },
  {
    id: 'ses-3',
    userId: DEMO_USER_ID,
    durationMinutes: 5,
    completedAt: getRelativeDate(0) + 'T10:30:00Z',
    type: 'short_break'
  },
  {
    id: 'ses-4',
    userId: DEMO_USER_ID,
    durationMinutes: 25,
    subjectId: 'sub-dbms',
    completedAt: getRelativeDate(0) + 'T11:00:00Z',
    type: 'focus'
  },
  {
    id: 'ses-5',
    userId: DEMO_USER_ID,
    durationMinutes: 25,
    subjectId: 'sub-math',
    completedAt: getRelativeDate(-1) + 'T15:00:00Z',
    type: 'focus'
  }
];
