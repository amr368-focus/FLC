export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  department: Department;
  team?: string;
  status: ProjectStatus;
  progress: number;
  owner: string;
  dueDate: Date;
  createdAt: Date;
  isKeyInitiative?: boolean;
  goalId?: string; // Link to company goal/OKR
}

export type Department = 'Professional Services' | 'Sales' | 'Marketing' | 'CE&S' | 'Finance' | 'Product' | 'IT-Cybersecurity' | 'Other Exec';
export type ProjectStatus = 'at-risk' | 'needs-attention' | 'on-track';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  comments: TaskComment[];
  tags?: string[];
  dependencies?: string[];
}

// Company Goals / OKRs
export interface CompanyGoal {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  owner: string;
  status: 'on-track' | 'at-risk' | 'completed';
  keyResults: KeyResult[];
  createdAt: Date;
}

export interface KeyResult {
  id: string;
  goalId: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  owner: string;
  dueDate: Date;
}

export interface PmoMeeting {
  id: string;
  department: Department | 'All';
  date: Date;
  attendees: string;
  teamStatus: string;
  itemsRequiringAttention: string;
  tasksComingDue: string;
  meetingNotes: string;
  decisionsMade: string;
  actionItemsAssigned: string;
  parkingLot: string;
  createdAt: Date;
}

// Utility function to calculate initiative progress based on tasks
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

// Utility function to derive initiative status based on tasks
// at-risk: any task is overdue (past due date and not done)
// needs-attention: any task due within 7 days and not done
// on-track: all tasks are on schedule or completed
export function deriveStatus(tasks: Task[]): ProjectStatus {
  if (tasks.length === 0) return 'on-track'; // No tasks = no risk
  
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const hasOverdue = tasks.some(t => t.status !== 'done' && new Date(t.dueDate) < now);
  if (hasOverdue) return 'at-risk';
  
  const hasDueSoon = tasks.some(t => t.status !== 'done' && new Date(t.dueDate) <= sevenDaysFromNow);
  if (hasDueSoon) return 'needs-attention';
  
  return 'on-track';
}