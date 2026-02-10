import { useState } from 'react';
import { useLocalStorage, STORAGE_KEYS } from './hooks/useLocalStorage';
import { Navigation } from './components/Navigation';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DepartmentsView } from './components/DepartmentsView';
import { TeamView } from './components/TeamView';
import { InitiativeDetailView } from './components/InitiativeDetailView';
import { TaskModal } from './components/TaskModal';
import { TaskListModal } from './components/TaskListModal';
import { ProjectListModal } from './components/ProjectListModal';
import { GoalsView } from './components/GoalsView';
import { InitiativeModal } from './components/InitiativeModal';
import { WorkBreakdownView } from './components/WorkBreakdownView';
import { PortfolioTimelineView } from './components/PortfolioTimelineView';
import { PmoMeetingsView } from './components/PmoMeetingsView';
import { PmoMeetingDock } from './components/PmoMeetingDock';
import { HomePageView } from './components/HomePageView';
import { SettingsPanel } from './components/SettingsPanel';
import { AuthModal } from './components/AuthModal';
import { Project, Task, Department, CompanyGoal, KeyResult, PmoMeeting } from './types';

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Digital Transformation Q1',
    description: 'Company-wide digital transformation initiative focusing on cloud migration and process automation',
    color: '#8B5CF6',
    department: 'IT-Cybersecurity',
    team: 'Digital Transformation Team',
    status: 'needs-attention',
    progress: 45,
    owner: 'John Smith',
    dueDate: new Date('2026-05-20'),
    createdAt: new Date('2026-02-10'),
    isKeyInitiative: true,
  },
  {
    id: '2',
    name: 'Cost Optimization Program',
    description: 'Identify and implement cost savings across all departments',
    color: '#10B981',
    department: 'Finance',
    team: 'Cost Optimization Team',
    status: 'on-track',
    progress: 72,
    owner: 'Sarah Jones',
    dueDate: new Date('2026-07-18'),
    createdAt: new Date('2026-02-12'),
    isKeyInitiative: true,
  },
  {
    id: '3',
    name: 'Employee Experience Initiative',
    description: 'Improve employee satisfaction and retention through better tools and processes',
    color: '#EF4444',
    department: 'Professional Services',
    status: 'at-risk',
    progress: 20,
    owner: 'David Brown',
    dueDate: new Date('2026-06-12'),
    createdAt: new Date('2026-02-13'),
    isKeyInitiative: false,
  },
  {
    id: '4',
    name: 'Brand Refresh Campaign',
    description: 'Update company branding across all channels',
    color: '#F59E0B',
    department: 'Marketing',
    team: 'Brand Team',
    status: 'on-track',
    progress: 85,
    owner: 'Lisa Taylor',
    dueDate: new Date('2026-04-08'),
    createdAt: new Date('2026-02-14'),
    isKeyInitiative: false,
  },
  {
    id: '5',
    name: 'Sales Process Optimization',
    description: 'Streamline sales workflows and improve conversion rates',
    color: '#3B82F6',
    department: 'Sales',
    team: 'Sales Excellence Team',
    status: 'on-track',
    progress: 65,
    owner: 'Mike Anderson',
    dueDate: new Date('2026-06-30'),
    createdAt: new Date('2026-02-16'),
    isKeyInitiative: true,
  },
  {
    id: '6',
    name: 'Product Roadmap Q2',
    description: 'Define and execute product development priorities for Q2',
    color: '#8B5CF6',
    department: 'Product',
    status: 'needs-attention',
    progress: 30,
    owner: 'Emily Chen',
    dueDate: new Date('2026-08-05'),
    createdAt: new Date('2026-02-18'),
    isKeyInitiative: true,
  },
  {
    id: '7',
    name: 'Customer Success Platform',
    description: 'Implement new customer success tracking and engagement platform',
    color: '#10B981',
    department: 'CE&S',
    team: 'Customer Success Team',
    status: 'on-track',
    progress: 55,
    owner: 'Rachel Green',
    dueDate: new Date('2026-06-25'),
    createdAt: new Date('2026-02-20'),
    isKeyInitiative: false,
  },
  {
    id: '8',
    name: 'Learning Platform Analytics',
    description: 'Unify engagement analytics across LMS and mobile channels',
    color: '#06B6D4',
    department: 'Product',
    team: 'Insights Team',
    status: 'on-track',
    progress: 40,
    owner: 'Alicia Reed',
    dueDate: new Date('2026-09-12'),
    createdAt: new Date('2026-02-22'),
    isKeyInitiative: true,
  },
  {
    id: '9',
    name: 'Service Desk Modernization',
    description: 'Replace legacy ticketing with a unified ITSM platform',
    color: '#6366F1',
    department: 'IT-Cybersecurity',
    team: 'IT Operations',
    status: 'needs-attention',
    progress: 25,
    owner: 'Priya Patel',
    dueDate: new Date('2026-10-30'),
    createdAt: new Date('2026-02-24'),
    isKeyInitiative: false,
  },
  {
    id: '10',
    name: 'Partner Ecosystem Expansion',
    description: 'Grow channel partners and improve onboarding enablement',
    color: '#F97316',
    department: 'Sales',
    team: 'Channel Partnerships',
    status: 'on-track',
    progress: 50,
    owner: 'Carlos Gomez',
    dueDate: new Date('2026-11-18'),
    createdAt: new Date('2026-02-26'),
    isKeyInitiative: true,
  },
  {
    id: '11',
    name: 'Finance Systems Automation',
    description: 'Automate close workflows and reporting across Finance',
    color: '#14B8A6',
    department: 'Finance',
    team: 'Finance Ops',
    status: 'needs-attention',
    progress: 35,
    owner: 'Nora Young',
    dueDate: new Date('2026-08-28'),
    createdAt: new Date('2026-02-28'),
    isKeyInitiative: false,
  }
];

const initialGoals: CompanyGoal[] = [
  {
    id: 'goal-1',
    name: 'Increase Customer Satisfaction',
    description: 'Improve overall customer satisfaction scores across all products and services',
    targetDate: new Date('2025-12-31'),
    owner: 'Jane Executive',
    status: 'on-track',
    keyResults: [
      {
        id: 'kr-1',
        goalId: 'goal-1',
        name: 'Increase NPS score',
        targetValue: 50,
        currentValue: 42,
        unit: 'points',
        owner: 'Rachel Green',
        dueDate: new Date('2025-12-31'),
      },
      {
        id: 'kr-2',
        goalId: 'goal-1',
        name: 'Reduce support ticket resolution time',
        targetValue: 24,
        currentValue: 32,
        unit: 'hours',
        owner: 'Mike Anderson',
        dueDate: new Date('2025-09-30'),
      },
    ],
  },
  {
    id: 'goal-2',
    name: 'Drive Revenue Growth',
    description: 'Achieve 20% year-over-year revenue growth through new products and market expansion',
    targetDate: new Date('2025-12-31'),
    owner: 'John Smith',
    status: 'at-risk',
    keyResults: [
      {
        id: 'kr-3',
        goalId: 'goal-2',
        name: 'Launch 3 new products',
        targetValue: 3,
        currentValue: 1,
        unit: 'products',
        owner: 'Emily Chen',
        dueDate: new Date('2025-10-31'),
      },
      {
        id: 'kr-4',
        goalId: 'goal-2',
        name: 'Expand to 2 new markets',
        targetValue: 2,
        currentValue: 0,
        unit: 'markets',
        owner: 'Lisa Taylor',
        dueDate: new Date('2025-11-30'),
      },
    ],
  },
  {
    id: 'goal-3',
    name: 'Operational Excellence',
    description: 'Streamline operations and reduce costs by 15%',
    targetDate: new Date('2025-06-30'),
    owner: 'Sarah Jones',
    status: 'on-track',
    keyResults: [
      {
        id: 'kr-5',
        goalId: 'goal-3',
        name: 'Reduce operational costs',
        targetValue: 15,
        currentValue: 12,
        unit: '%',
        owner: 'Sarah Jones',
        dueDate: new Date('2025-06-30'),
      },
    ],
  },
];

const initialTasks: Task[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Migrate database servers',
    description: 'Cloud Migration',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Mike Chen',
    dueDate: new Date('2026-02-20'),
    createdAt: new Date('2026-02-10'),
    comments: [],
    tags: ['infrastructure', 'cloud'],
    dependencies: [],
  },
  {
    id: '2',
    projectId: '1',
    title: 'Application containerization',
    description: 'Cloud Migration',
    status: 'todo',
    priority: 'high',
    assignee: 'John Smith',
    dueDate: new Date('2026-02-26'),
    createdAt: new Date('2026-02-12'),
    comments: [],
    tags: ['docker', 'cloud'],
    dependencies: ['after:Migrate database servers'],
  },
  {
    id: '3',
    projectId: '1',
    title: 'Develop training materials',
    description: 'Change Management',
    status: 'todo',
    priority: 'high',
    assignee: 'David Brown',
    dueDate: new Date('2026-03-02'),
    createdAt: new Date('2026-02-13'),
    comments: [],
    tags: ['training', 'documentation'],
    dependencies: [],
  },
  {
    id: '4',
    projectId: '1',
    title: 'Schedule training sessions',
    description: 'Change Management',
    status: 'todo',
    priority: 'high',
    assignee: 'David Brown',
    dueDate: new Date('2026-03-10'),
    createdAt: new Date('2026-02-14'),
    comments: [],
    tags: ['training'],
    dependencies: ['after:Develop training materials'],
  },
  {
    id: '5',
    projectId: '2',
    title: 'Negotiate consolidated contracts',
    description: 'Vendor Consolidation',
    status: 'todo',
    priority: 'medium',
    assignee: 'Emma Wilson',
    dueDate: new Date('2026-04-05'),
    createdAt: new Date('2026-02-15'),
    comments: [],
    tags: ['procurement', 'vendors'],
    dependencies: [],
  },
  {
    id: '6',
    projectId: '8',
    title: 'Define KPI taxonomy',
    description: 'Analytics Foundation',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Alicia Reed',
    dueDate: new Date('2026-04-18'),
    createdAt: new Date('2026-02-22'),
    comments: [],
    tags: ['analytics'],
    dependencies: [],
  },
  {
    id: '7',
    projectId: '8',
    title: 'Instrument mobile events',
    description: 'Analytics Foundation',
    status: 'todo',
    priority: 'high',
    assignee: 'Ben Ortiz',
    dueDate: new Date('2026-05-06'),
    createdAt: new Date('2026-02-24'),
    comments: [],
    tags: ['mobile', 'tracking'],
    dependencies: ['after:Define KPI taxonomy'],
  },
  {
    id: '8',
    projectId: '9',
    title: 'Select ITSM vendor',
    description: 'Vendor Selection',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Priya Patel',
    dueDate: new Date('2026-04-28'),
    createdAt: new Date('2026-02-25'),
    comments: [],
    tags: ['vendor', 'itsm'],
    dependencies: [],
  },
  {
    id: '9',
    projectId: '10',
    title: 'Launch partner portal',
    description: 'Enablement',
    status: 'todo',
    priority: 'medium',
    assignee: 'Carlos Gomez',
    dueDate: new Date('2026-06-20'),
    createdAt: new Date('2026-02-27'),
    comments: [],
    tags: ['partners', 'portal'],
    dependencies: [],
  },
  {
    id: '10',
    projectId: '11',
    title: 'Automate month-end close',
    description: 'Close Automation',
    status: 'todo',
    priority: 'high',
    assignee: 'Nora Young',
    dueDate: new Date('2026-07-15'),
    createdAt: new Date('2026-02-28'),
    comments: [],
    tags: ['finance', 'automation'],
    dependencies: [],
  },
];

const initialMeetings: PmoMeeting[] = [
  {
    id: 'pmo-1',
    department: 'All',
    date: new Date(),
    attendees: 'Jane Executive, John Smith',
    teamStatus: 'Team is on track overall with a few risks flagged for next sprint.',
    itemsRequiringAttention: 'Vendor contract approvals pending for IT-Cybersecurity.',
    tasksComingDue: 'Cloud migration training materials due next week.',
    meetingNotes: 'Reviewed portfolio health and confirmed priorities for next month.',
    decisionsMade: 'Approved additional budget for digital transformation.',
    actionItemsAssigned: 'Sarah to draft budget request and share by Friday.',
    parkingLot: 'Discuss PMO tooling upgrade at next meeting.',
    createdAt: new Date(),
  },
];

const AUTH_EMAIL_KEY = 'pmo-auth-email';

export default function App() {
  const [view, setView] = useState<'home' | 'dashboard' | 'departments' | 'team' | 'portfolio' | 'goals' | 'workbreakdown' | 'timeline' | 'pmo'>('home');
  // Data persisted to localStorage - survives page reloads
  const [projects, setProjects, resetProjects] = useLocalStorage<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  const [tasks, setTasks, resetTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, initialTasks);
  const [goals, setGoals, resetGoals] = useLocalStorage<CompanyGoal[]>(STORAGE_KEYS.GOALS, initialGoals);
  const [meetings, setMeetings, resetMeetings] = useLocalStorage<PmoMeeting[]>(STORAGE_KEYS.MEETINGS, initialMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(initialMeetings[0]?.id || null);
  const [isPmoDockOpen, setIsPmoDockOpen] = useState(false);
  const [pmoDockAnchor, setPmoDockAnchor] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newTaskProjectId, setNewTaskProjectId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [taskListModal, setTaskListModal] = useState<{ tasks: Task[]; title: string } | null>(null);
  const [projectListModal, setProjectListModal] = useState<{ projects: Project[]; title: string } | null>(null);
  const [editingInitiative, setEditingInitiative] = useState<Project | null>(null);
  const [newInitiativeDepartment, setNewInitiativeDepartment] = useState<Department | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(() => {
    const stored = localStorage.getItem(AUTH_EMAIL_KEY);
    if (stored && stored.endsWith('@focuslearning.com')) return stored;
    return null;
  });

  const isAuthenticated = Boolean(authEmail);

  const handleAuthenticate = (email: string) => {
    setAuthEmail(email);
    localStorage.setItem(AUTH_EMAIL_KEY, email);
  };

  const handleLogout = () => {
    setAuthEmail(null);
    localStorage.removeItem(AUTH_EMAIL_KEY);
  };

  // Data management functions for settings panel
  const handleResetData = () => {
    resetProjects();
    resetTasks();
    resetGoals();
    resetMeetings();
    // Reload to ensure fresh state
    window.location.reload();
  };

  const csvEscape = (value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const toCsv = (headers: string[], rows: Array<Record<string, string | number | boolean | null | undefined>>) => {
    const headerLine = headers.join(',');
    const bodyLines = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','));
    return [headerLine, ...bodyLines].join('\n');
  };

  const handleExportCsv = () => {
    const dateStamp = new Date().toISOString().split('T')[0];

    const projectsCsv = toCsv(
      ['id', 'name', 'department', 'status', 'progress', 'owner', 'team', 'dueDate', 'createdAt', 'description', 'isKeyInitiative', 'goalId', 'color'],
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        department: p.department,
        status: p.status,
        progress: p.progress,
        owner: p.owner,
        team: p.team || '',
        dueDate: p.dueDate?.toISOString?.() || '',
        createdAt: p.createdAt?.toISOString?.() || '',
        description: p.description,
        isKeyInitiative: p.isKeyInitiative ? 'true' : 'false',
        goalId: p.goalId || '',
        color: p.color,
      }))
    );

    const tasksCsv = toCsv(
      ['id', 'projectId', 'parentTaskId', 'title', 'status', 'priority', 'assignee', 'dueDate', 'createdAt', 'description', 'tags', 'dependencies'],
      tasks.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        parentTaskId: t.parentTaskId || '',
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
        dueDate: t.dueDate?.toISOString?.() || '',
        createdAt: t.createdAt?.toISOString?.() || '',
        description: t.description,
        tags: (t.tags || []).join('|'),
        dependencies: (t.dependencies || []).join('|'),
      }))
    );

    const goalsCsv = toCsv(
      ['id', 'name', 'owner', 'status', 'targetDate', 'createdAt', 'description'],
      goals.map((g) => ({
        id: g.id,
        name: g.name,
        owner: g.owner,
        status: g.status,
        targetDate: g.targetDate?.toISOString?.() || '',
        createdAt: g.createdAt?.toISOString?.() || '',
        description: g.description,
      }))
    );

    const meetingsCsv = toCsv(
      ['id', 'department', 'date', 'attendees', 'teamStatus', 'itemsRequiringAttention', 'tasksComingDue', 'meetingNotes', 'decisionsMade', 'actionItemsAssigned', 'parkingLot', 'createdAt'],
      meetings.map((m) => ({
        id: m.id,
        department: m.department,
        date: m.date?.toISOString?.() || '',
        attendees: m.attendees,
        teamStatus: m.teamStatus,
        itemsRequiringAttention: m.itemsRequiringAttention,
        tasksComingDue: m.tasksComingDue,
        meetingNotes: m.meetingNotes,
        decisionsMade: m.decisionsMade,
        actionItemsAssigned: m.actionItemsAssigned,
        parkingLot: m.parkingLot,
        createdAt: m.createdAt?.toISOString?.() || '',
      }))
    );

    return [
      { filename: `pmo-projects-${dateStamp}.csv`, data: projectsCsv },
      { filename: `pmo-tasks-${dateStamp}.csv`, data: tasksCsv },
      { filename: `pmo-goals-${dateStamp}.csv`, data: goalsCsv },
      { filename: `pmo-meetings-${dateStamp}.csv`, data: meetingsCsv },
    ];
  };

  const handleImportData = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.projects && parsed.tasks && parsed.goals && parsed.meetings) {
        // Convert date strings back to Date objects
        const reviveDate = (obj: any) => {
          for (const key in obj) {
            if (typeof obj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(obj[key])) {
              obj[key] = new Date(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              reviveDate(obj[key]);
            }
          }
          return obj;
        };
        setProjects(reviveDate(parsed.projects));
        setTasks(reviveDate(parsed.tasks));
        setGoals(reviveDate(parsed.goals));
        setMeetings(reviveDate(parsed.meetings));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleExportJson = (): string => {
    return JSON.stringify({
      projects,
      tasks,
      goals,
      meetings,
    }, null, 2);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleDepartmentSelect = (dept: Department) => {
    setSelectedProject(null); // Close project detail if open
    setSelectedDepartment(dept);
    setView('departments');
  };

  const handleNavigationChange = (newView: 'home' | 'dashboard' | 'departments' | 'team' | 'portfolio' | 'goals' | 'workbreakdown' | 'timeline' | 'pmo') => {
    setSelectedProject(null); // Close project detail if open
    if (newView === 'departments') {
      setSelectedDepartment(null); // Reset to overview when clicking Departments
    }
    setView(newView);
  };

  const handleOpenNewTask = (projectId: string) => {
    setNewTaskProjectId(projectId);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      handleUpdateTask(editingTask.id, taskData);
    } else {
      handleAddTask(taskData);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleViewAllProjects = () => {
    setSelectedProject(null);
    setView('portfolio');
  };

  const handleViewOverdue = () => {
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate < now && t.status !== 'done');
    setTaskListModal({ tasks: overdueTasks, title: 'Overdue Items' });
  };

  const handleViewDueThisWeek = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueThisWeek = tasks.filter(t => t.dueDate >= now && t.dueDate <= sevenDaysFromNow && t.status !== 'done');
    setTaskListModal({ tasks: dueThisWeek, title: 'Due This Week' });
  };

  const handleViewActiveProjects = () => {
    const activeProjects = projects.filter(p => p.progress < 100);
    setProjectListModal({ projects: activeProjects, title: 'Active Projects' });
  };

  const handleViewCompletedTasks = () => {
    const completedTasks = tasks.filter(t => t.status === 'done');
    setTaskListModal({ tasks: completedTasks, title: 'Completed Tasks' });
  };

  const handleTaskClickFromModal = (task: Task) => {
    const project = projects.find(p => p.id === task.projectId);
    if (project) {
      setSelectedProject(project);
      handleEditTask(task);
    }
  };

  const handleTaskClickFromDashboard = (task: Task) => {
    const project = projects.find(p => p.id === task.projectId);
    if (project) {
      setSelectedProject(project);
      handleEditTask(task);
    }
  };

  const handleViewGoals = () => {
    setSelectedProject(null);
    setView('goals');
  };

  // Goal handlers
  const handleAddGoal = (goal: Omit<CompanyGoal, 'id' | 'keyResults'>) => {
    const newGoal: CompanyGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      keyResults: [],
    };
    setGoals([...goals, newGoal]);
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<CompanyGoal>) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    // Remove goalId from any linked projects
    setProjects(projects.map(p => p.goalId === goalId ? { ...p, goalId: undefined } : p));
  };

  const handleAddKeyResult = (goalId: string, keyResult: Omit<KeyResult, 'id' | 'goalId'>) => {
    const newKR: KeyResult = {
      ...keyResult,
      id: `kr-${Date.now()}`,
      goalId,
    };
    setGoals(goals.map(g => 
      g.id === goalId ? { ...g, keyResults: [...g.keyResults, newKR] } : g
    ));
  };

  const handleUpdateKeyResult = (goalId: string, krId: string, updates: Partial<KeyResult>) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, keyResults: g.keyResults.map(kr => kr.id === krId ? { ...kr, ...updates } : kr) } 
        : g
    ));
  };

  const handleDeleteKeyResult = (goalId: string, krId: string) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, keyResults: g.keyResults.filter(kr => kr.id !== krId) } 
        : g
    ));
  };

  // Initiative/Project handlers
  const handleEditInitiative = (project: Project) => {
    setEditingInitiative(project);
  };

  const handleAddInitiative = (department?: Department) => {
    setNewInitiativeDepartment(department || null);
    // Create a blank initiative template
    const blankInitiative: Project = {
      id: '',
      name: '',
      description: '',
      color: '#3B82F6',
      department: department || 'Professional Services',
      status: 'on-track',
      progress: 0,
      owner: '',
      dueDate: new Date(),
      createdAt: new Date(),
      isKeyInitiative: false,
    };
    setEditingInitiative(blankInitiative);
  };

  const handleSaveInitiative = (initiativeData: Omit<Project, 'id' | 'createdAt'>) => {
    if (editingInitiative && editingInitiative.id) {
      // Update existing
      setProjects(projects.map(p => 
        p.id === editingInitiative.id 
          ? { ...p, ...initiativeData }
          : p
      ));
      // Also update selectedProject if it's the same
      if (selectedProject?.id === editingInitiative.id) {
        setSelectedProject({ ...selectedProject, ...initiativeData });
      }
    } else {
      // Create new
      const newProject: Project = {
        ...initiativeData,
        id: `proj-${Date.now()}`,
        createdAt: new Date(),
      };
      setProjects([...projects, newProject]);
    }
    setEditingInitiative(null);
    setNewInitiativeDepartment(null);
  };

  const handleDeleteInitiative = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    // Also delete associated tasks
    setTasks(tasks.filter(t => t.projectId !== projectId));
    // Close detail view if deleting the selected project
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
    setEditingInitiative(null);
  };

  const handleCreateMeeting = () => {
    const newMeeting: PmoMeeting = {
      id: `pmo-${Date.now()}`,
      department: 'All',
      date: new Date(),
      attendees: '',
      teamStatus: '',
      itemsRequiringAttention: '',
      tasksComingDue: '',
      meetingNotes: '',
      decisionsMade: '',
      actionItemsAssigned: '',
      parkingLot: '',
      createdAt: new Date(),
    };
    setMeetings([newMeeting, ...meetings]);
    setSelectedMeetingId(newMeeting.id);
  };

  const handleSaveMeeting = (meeting: PmoMeeting) => {
    setMeetings(meetings.map(m => (m.id === meeting.id ? meeting : m)));
  };

  const handleUpdateMeeting = (meetingId: string, updates: Partial<PmoMeeting>) => {
    setMeetings(meetings.map(m => (m.id === meetingId ? { ...m, ...updates } : m)));
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Navigation
        currentView={view}
        onViewChange={handleNavigationChange}
        onDepartmentSelect={handleDepartmentSelect}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedProject ? (
          <InitiativeDetailView
            project={selectedProject}
            tasks={tasks.filter(t => t.projectId === selectedProject.id)}
            onBack={() => setSelectedProject(null)}
            onEditTask={handleEditTask}
            onAddTask={() => handleOpenNewTask(selectedProject.id)}
            onUpdateTask={handleUpdateTask}
            onEditInitiative={handleEditInitiative}
            onDeleteInitiative={handleDeleteInitiative}
          />
        ) : (
          <>
            {view === 'home' && (
              <HomePageView
                projects={projects}
                tasks={tasks}
                onViewAllProjects={handleViewAllProjects}
              />
            )}
            {view === 'dashboard' && (
              <ExecutiveDashboard
                projects={projects}
                tasks={tasks}
                goals={goals}
                onProjectClick={handleProjectClick}
                onViewAllProjects={handleViewAllProjects}
                onViewOverdue={handleViewOverdue}
                onViewDueThisWeek={handleViewDueThisWeek}
                onViewActiveProjects={handleViewActiveProjects}
                onViewCompletedTasks={handleViewCompletedTasks}
                onTaskClick={handleTaskClickFromDashboard}
                onUpdateTask={handleUpdateTask}
                onViewGoals={handleViewGoals}
                onDepartmentSelect={handleDepartmentSelect}
              />
            )}

            {view === 'portfolio' && (
              <TeamView
                projects={projects}
                tasks={tasks}
                onProjectClick={handleProjectClick}
                onAddInitiative={() => handleAddInitiative()}
              />
            )}
            
            {view === 'departments' && (
              <DepartmentsView
                projects={projects}
                tasks={tasks}
                onProjectClick={handleProjectClick}
                selectedDepartment={selectedDepartment}
                onBackToOverview={() => setSelectedDepartment(null)}
                onDepartmentSelect={handleDepartmentSelect}
                onAddInitiative={handleAddInitiative}
                onUpdateTask={handleUpdateTask}
              />
            )}

            {view === 'goals' && (
              <GoalsView
                goals={goals}
                projects={projects}
                tasks={tasks}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onAddKeyResult={handleAddKeyResult}
                onUpdateKeyResult={handleUpdateKeyResult}
                onDeleteKeyResult={handleDeleteKeyResult}
                onProjectClick={handleProjectClick}
              />
            )}

            {view === 'workbreakdown' && (
              <WorkBreakdownView
                projects={projects}
                tasks={tasks}
                goals={goals}
                onProjectClick={handleProjectClick}
                onTaskClick={handleTaskClickFromDashboard}
                onAddInitiative={() => handleAddInitiative()}
                onAddTask={handleOpenNewTask}
                onUpdateTask={handleUpdateTask}
                onQuickAddTask={handleAddTask}
              />
            )}

            {view === 'timeline' && (
              <PortfolioTimelineView
                projects={projects}
                tasks={tasks}
                onProjectClick={handleProjectClick}
                onAddInitiative={() => handleAddInitiative()}
                onUpdateTask={handleUpdateTask}
              />
            )}

            {view === 'pmo' && (
              <PmoMeetingsView
                meetings={meetings}
                selectedMeetingId={selectedMeetingId}
                onSelectMeeting={setSelectedMeetingId}
                onCreateMeeting={handleCreateMeeting}
                onSaveMeeting={handleSaveMeeting}
                onMinimize={() => setIsPmoDockOpen(true)}
              />
            )}
          </>
        )}
      </div>

      {!isPmoDockOpen && (
        <button
          type="button"
          onClick={() => setIsPmoDockOpen(true)}
          className="btn-teal fixed px-4 py-2 rounded-full shadow-xl transition-colors text-sm font-semibold border border-[#089188] z-30"
          style={{
            ...(pmoDockAnchor.startsWith('bottom') ? { bottom: 24 } : { top: 24 }),
            ...(pmoDockAnchor.endsWith('right') ? { right: 24 } : { left: 24 }),
          }}
        >
          PMO Notes
        </button>
      )}

      <PmoMeetingDock
        isOpen={isPmoDockOpen}
        meetings={meetings}
        selectedMeetingId={selectedMeetingId}
        onSelectMeeting={setSelectedMeetingId}
        onCreateMeeting={handleCreateMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        onSaveMeeting={handleSaveMeeting}
        anchor={pmoDockAnchor}
        onSnap={setPmoDockAnchor}
        onClose={() => setIsPmoDockOpen(false)}
        onOpenFull={() => {
          setView('pmo');
          setIsPmoDockOpen(false);
        }}
      />

      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          projectId={editingTask?.projectId || newTaskProjectId || selectedProject?.id || ''}
          onSave={handleSaveTask}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setNewTaskProjectId(null);
          }}
        />
      )}

      {taskListModal && (
        <TaskListModal
          tasks={taskListModal.tasks}
          projects={projects}
          title={taskListModal.title}
          onClose={() => setTaskListModal(null)}
          onTaskClick={handleTaskClickFromModal}
        />
      )}

      {projectListModal && (
        <ProjectListModal
          projects={projectListModal.projects}
          title={projectListModal.title}
          onClose={() => setProjectListModal(null)}
          onProjectClick={(project) => {
            setProjectListModal(null);
            handleProjectClick(project);
          }}
        />
      )}

      {editingInitiative && (
        <InitiativeModal
          initiative={editingInitiative}
          goals={goals}
          onSave={handleSaveInitiative}
          onClose={() => setEditingInitiative(null)}
          onDelete={handleDeleteInitiative}
        />
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={handleResetData}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportData={handleImportData}
        currentUserEmail={authEmail}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={!isAuthenticated}
        domain="focuslearning.com"
        companyName="FOCUS Learning Corporation"
        onAuthenticate={handleAuthenticate}
      />
    </div>
  );
}