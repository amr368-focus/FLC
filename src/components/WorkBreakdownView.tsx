import { useState } from 'react';
import { ChevronRight, ChevronDown, CheckSquare, AlertCircle, CheckCircle2, Search, Plus } from 'lucide-react';
import { Project, Task, Department, CompanyGoal, TaskStatus, TaskPriority, calculateProgress, deriveStatus } from '../types';
import { StatusCell, PriorityCell, ProgressCell, OwnerCell, DateCell } from './StatusCells';
import { InlineEditText } from './InlineEdit';

interface WorkBreakdownViewProps {
  projects: Project[];
  tasks: Task[];
  goals: CompanyGoal[];
  onProjectClick: (project: Project) => void;
  onTaskClick: (task: Task) => void;
  onAddInitiative?: () => void;
  onAddTask?: (projectId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

const departments: Department[] = [
  'Professional Services',
  'Sales',
  'Marketing',
  'CE&S',
  'Finance',
  'Product',
  'IT-Cybersecurity',
  'Other Exec'
];

const taskStatusConfig = {
  'todo': { label: 'To Do', bgColor: '#64748b', textColor: '#ffffff' },
  'in-progress': { label: 'In Progress', bgColor: '#2563eb', textColor: '#ffffff' },
  'done': { label: 'Done', bgColor: '#059669', textColor: '#ffffff' },
};

const projectStatusConfig = {
  'on-track': { label: 'On track', bgColor: '#059669', textColor: '#ffffff' },
  'needs-attention': { label: 'Needs attention', bgColor: '#d97706', textColor: '#ffffff' },
  'at-risk': { label: 'At risk', bgColor: '#dc2626', textColor: '#ffffff' },
};

type GroupBy = 'department' | 'initiative' | 'status';

export function WorkBreakdownView({ projects, tasks, goals, onProjectClick, onTaskClick, onAddInitiative, onAddTask, onUpdateTask }: WorkBreakdownViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => new Set(projects.map(p => p.id)));
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('initiative');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'assignee' | 'dueDate' | 'progress'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const now = new Date();
  const searchLower = searchQuery.trim().toLowerCase();
  const allAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))).sort();
  const assignees = allAssignees;

  const toggleItem = (itemId: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setExpandedItems(newSet);
  };

  const toggleTask = (taskId: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedTasks(newSet);
  };

  const expandAll = () => {
    const allIds = new Set([
      ...projects.map(p => p.id),
      ...departments,
      'todo', 'in-progress', 'done'
    ]);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
    setExpandedTasks(new Set());
  };

  const handleSortChange = (value: 'name' | 'status' | 'assignee' | 'dueDate' | 'progress') => {
    if (sortBy === value) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortDirection('asc');
    }
  };

  const sortProjects = (deptProjects: Project[]) => {
    return [...deptProjects].sort((a, b) => {
      const aTasks = tasks.filter(t => t.projectId === a.id);
      const bTasks = tasks.filter(t => t.projectId === b.id);
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'progress') {
        comparison = calculateProgress(aTasks) - calculateProgress(bTasks);
      } else if (sortBy === 'dueDate') {
        comparison = a.dueDate.getTime() - b.dueDate.getTime();
      } else {
        comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const sortTasks = (projectTasks: Task[]) => {
    return [...projectTasks].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'assignee') {
        comparison = a.assignee.localeCompare(b.assignee);
      } else if (sortBy === 'progress') {
        comparison = a.status === 'done' ? 1 : 0;
        comparison -= b.status === 'done' ? 1 : 0;
      } else {
        comparison = a.dueDate.getTime() - b.dueDate.getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">All Work</h1>
          <div className="flex items-center gap-3">
            {onAddInitiative && (
              <button
                onClick={onAddInitiative}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0d3b66] hover:bg-[#0a2d4d] rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Initiative
              </button>
            )}
            <button onClick={expandAll} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Expand All
            </button>
            <button onClick={collapseAll} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Collapse All
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search initiatives or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d3b66] focus:border-transparent"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as Department | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d3b66] focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d3b66] focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d3b66] focus:border-transparent"
          >
            <option value="all">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
          
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0d3b66] focus:border-transparent"
          >
            <option value="initiative">Group by Initiative</option>
            <option value="department">Group by Department</option>
            <option value="status">Group by Status</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <button
              className="col-span-4 text-left hover:text-gray-900"
              onClick={() => handleSortChange('name')}
            >
              Initiative / Task {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-900"
              onClick={() => handleSortChange('status')}
            >
              Status {sortBy === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-900"
              onClick={() => handleSortChange('assignee')}
            >
              Owner {sortBy === 'assignee' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-900"
              onClick={() => handleSortChange('dueDate')}
            >
              Due Date {sortBy === 'dueDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-900"
              onClick={() => handleSortChange('progress')}
            >
              Progress {sortBy === 'progress' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>

          {sortProjects(
            projects.filter(p => departmentFilter === 'all' || p.department === departmentFilter)
          ).map(project => {
                      const projectTasks = tasks.filter(t => t.projectId === project.id);
                      const projectMatchesSearch = searchLower.length === 0
                        || project.name.toLowerCase().includes(searchLower)
                        || project.description.toLowerCase().includes(searchLower);
                      const filteredProjectTasks = projectTasks.filter(task => {
                        if (statusFilter !== 'all' && task.status !== statusFilter) return false;
                        if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) return false;
                        if (searchLower.length > 0) {
                          const taskMatches = task.title.toLowerCase().includes(searchLower);
                          return taskMatches || projectMatchesSearch;
                        }
                        return true;
                      });

                      if (!projectMatchesSearch && filteredProjectTasks.length === 0) return null;
                      const progress = calculateProgress(projectTasks);
                      const projectStatus = deriveStatus(projectTasks);
                      const completedCount = projectTasks.filter(t => t.status === 'done').length;

                      return (
                        <div key={project.id}>
                          <div className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 items-center" style={{ borderLeftWidth: '3px', borderLeftColor: project.color }}>
                            <div className="col-span-4 flex items-center gap-2 min-w-0">
                              <button onClick={(e) => { e.stopPropagation(); toggleItem(project.id); }} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                                {expandedItems.has(project.id) ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                              </button>
                              <div className="min-w-0 flex-1">
                                <span onClick={() => onProjectClick(project)} className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate block">
                                  {project.isKeyInitiative && <span className="mr-1">⭐</span>}
                                  {project.name}
                                </span>
                                <span className="text-xs text-gray-500">{project.department}</span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span 
                                style={{ backgroundColor: projectStatusConfig[projectStatus].bgColor, color: projectStatusConfig[projectStatus].textColor }}
                                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap"
                              >
                                {projectStatusConfig[projectStatus].label}
                              </span>
                            </div>
                            <div className="col-span-2 text-sm text-gray-700 truncate">{project.owner}</div>
                            <div className="col-span-2 text-sm text-gray-600 whitespace-nowrap">
                              {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: projectStatus === 'at-risk' ? '#EF4444' : projectStatus === 'needs-attention' ? '#F59E0B' : '#10B981' }} />
                                </div>
                                <span className="text-xs text-gray-600 whitespace-nowrap">{progress}%</span>
                              </div>
                              <div className="text-xs text-gray-400 text-right mt-0.5">{completedCount}/{projectTasks.length}</div>
                            </div>
                          </div>

                          {expandedItems.has(project.id) && (
                            <div className="bg-gray-50/50">
                              {(() => {
                                const parentTasks = sortTasks(filteredProjectTasks.filter(task => !task.parentTaskId));
                                const childTasks = filteredProjectTasks.filter(task => task.parentTaskId);
                                const childByParent = childTasks.reduce((acc, task) => {
                                  const key = task.parentTaskId as string;
                                  if (!acc[key]) acc[key] = [];
                                  acc[key].push(task);
                                  return acc;
                                }, {} as Record<string, Task[]>);

                                return parentTasks.map(task => {
                                  const children = sortTasks(childByParent[task.id] || []);
                                  const isOverdue = task.dueDate < now && task.status !== 'done';
                                  const hasChildren = children.length > 0;
                                  const isTaskExpanded = expandedTasks.has(task.id);

                                  return (
                                    <div key={task.id}>
                                      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-blue-50 items-center border-b border-gray-50" onDoubleClick={() => onTaskClick(task)}>
                                        <div className="col-span-4 flex items-center gap-2 min-w-0 pl-8">
                                          {hasChildren ? (
                                            <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} className="p-1 hover:bg-gray-100 rounded -ml-1 flex-shrink-0">
                                              {isTaskExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                            </button>
                                          ) : (
                                            <span className="w-6 flex-shrink-0" />
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (onUpdateTask) {
                                                onUpdateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
                                              }
                                            }}
                                            className="flex-shrink-0"
                                          >
                                            {task.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <CheckSquare className="w-4 h-4 text-gray-400 hover:text-green-500" />}
                                          </button>
                                          {onUpdateTask ? (
                                            <InlineEditText
                                              value={task.title}
                                              onSave={(newTitle) => onUpdateTask(task.id, { title: newTitle })}
                                              className={`text-sm truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}
                                              placeholder="Task title"
                                            />
                                          ) : (
                                            <span className={`text-sm truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                              {task.title}
                                            </span>
                                          )}
                                          {task.priority === 'high' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                          {hasChildren && <span className="text-xs text-gray-400 ml-1 flex-shrink-0">({children.length})</span>}
                                        </div>
                                        <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                          {onUpdateTask ? (
                                            <StatusCell
                                              value={task.status}
                                              type="task"
                                              onChange={(newStatus) => onUpdateTask(task.id, { status: newStatus as TaskStatus })}
                                              size="sm"
                                            />
                                          ) : (
                                            <span 
                                              style={{ backgroundColor: taskStatusConfig[task.status].bgColor, color: taskStatusConfig[task.status].textColor }}
                                              className="px-2 py-1 rounded text-xs font-medium"
                                            >
                                              {taskStatusConfig[task.status].label}
                                            </span>
                                          )}
                                        </div>
                                        <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                          {onUpdateTask ? (
                                            <OwnerCell
                                              value={task.assignee}
                                              onChange={(newAssignee) => onUpdateTask(task.id, { assignee: newAssignee })}
                                              suggestions={allAssignees}
                                            />
                                          ) : (
                                            <span className="text-sm text-gray-600">{task.assignee}</span>
                                          )}
                                        </div>
                                        <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                          {onUpdateTask ? (
                                            <DateCell
                                              value={task.dueDate}
                                              onChange={(newDate) => onUpdateTask(task.id, { dueDate: newDate })}
                                            />
                                          ) : (
                                            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                              {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                          )}
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-500">
                                          {task.status === 'done' ? '100%' : '0%'}
                                        </div>
                                      </div>

                                      {isTaskExpanded && children.map((child) => {
                                        const isChildOverdue = child.dueDate < now && child.status !== 'done';
                                        return (
                                          <div key={child.id} className="grid grid-cols-12 gap-2 px-4 py-2 hover:bg-blue-50 items-center bg-gray-50/50 border-b border-gray-50">
                                            <div className="col-span-4 flex items-center gap-2 min-w-0 pl-16">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (onUpdateTask) {
                                                    onUpdateTask(child.id, { status: child.status === 'done' ? 'todo' : 'done' });
                                                  }
                                                }}
                                                className="flex-shrink-0"
                                              >
                                                {child.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <CheckSquare className="w-4 h-4 text-gray-400 hover:text-green-500" />}
                                              </button>
                                              {onUpdateTask ? (
                                                <InlineEditText
                                                  value={child.title}
                                                  onSave={(newTitle) => onUpdateTask(child.id, { title: newTitle })}
                                                  className={`text-sm truncate ${child.status === 'done' ? 'line-through text-gray-400' : 'text-gray-600'}`}
                                                  placeholder="Subtask title"
                                                />
                                              ) : (
                                                <span className={`text-sm truncate ${child.status === 'done' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                                  {child.title}
                                                </span>
                                              )}
                                            </div>
                                            <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                              {onUpdateTask ? (
                                                <StatusCell
                                                  value={child.status}
                                                  type="task"
                                                  onChange={(newStatus) => onUpdateTask(child.id, { status: newStatus as TaskStatus })}
                                                  size="sm"
                                                />
                                              ) : (
                                                <span 
                                                  style={{ backgroundColor: taskStatusConfig[child.status].bgColor, color: taskStatusConfig[child.status].textColor }}
                                                  className="px-2 py-1 rounded text-xs font-medium"
                                                >
                                                  {taskStatusConfig[child.status].label}
                                                </span>
                                              )}
                                            </div>
                                            <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                              {onUpdateTask ? (
                                                <OwnerCell
                                                  value={child.assignee}
                                                  onChange={(newAssignee) => onUpdateTask(child.id, { assignee: newAssignee })}
                                                  suggestions={allAssignees}
                                                />
                                              ) : (
                                                <span className="text-sm text-gray-600">{child.assignee}</span>
                                              )}
                                            </div>
                                            <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                              {onUpdateTask ? (
                                                <DateCell
                                                  value={child.dueDate}
                                                  onChange={(newDate) => onUpdateTask(child.id, { dueDate: newDate })}
                                                />
                                              ) : (
                                                <span className={`text-sm ${isChildOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                                  {child.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                              )}
                                            </div>
                                            <div className="col-span-2 text-sm text-gray-400">-</div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                });
                              })()}
                              {filteredProjectTasks.length === 0 && (
                                <div className="px-3 py-2 text-xs text-gray-500 italic">No tasks</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
        </div>
      </div>
    </div>
  );
}
