import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, FolderKanban, CheckSquare, AlertCircle, CheckCircle2, Search, Plus } from 'lucide-react';
import { Project, Task, Department, CompanyGoal, calculateProgress, deriveStatus } from '../types';

interface WorkBreakdownViewProps {
  projects: Project[];
  tasks: Task[];
  goals: CompanyGoal[];
  onProjectClick: (project: Project) => void;
  onTaskClick: (task: Task) => void;
  onAddInitiative?: () => void;
  onAddTask?: (projectId: string) => void;
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
  'todo': { label: 'To Do', color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  'done': { label: 'Done', color: 'bg-green-100 text-green-700' },
};

const projectStatusConfig = {
  'on-track': { label: 'On track', color: 'bg-emerald-100 text-emerald-700' },
  'needs-attention': { label: 'Needs attention', color: 'bg-amber-100 text-amber-700' },
  'at-risk': { label: 'At risk', color: 'bg-red-100 text-red-700' },
};

export function WorkBreakdownView({ projects, tasks, goals, onProjectClick, onTaskClick, onAddInitiative, onAddTask }: WorkBreakdownViewProps) {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(departments));
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'assignee' | 'dueDate' | 'progress'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const now = new Date();
  const searchLower = searchQuery.trim().toLowerCase();
  const assignees = Array.from(new Set(tasks.map(t => t.assignee))).sort();

  const toggleDept = (dept: string) => {
    const newSet = new Set(expandedDepts);
    if (newSet.has(dept)) {
      newSet.delete(dept);
    } else {
      newSet.add(dept);
    }
    setExpandedDepts(newSet);
  };

  const toggleProject = (projectId: string) => {
    const newSet = new Set(expandedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    setExpandedProjects(newSet);
  };

  const expandAll = () => {
    setExpandedDepts(new Set(departments));
    setExpandedProjects(new Set(projects.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedDepts(new Set());
    setExpandedProjects(new Set());
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">All work</h1>
          <div className="flex items-center gap-2">
            {onAddInitiative && (
              <button
                onClick={onAddInitiative}
                className="btn-teal flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Initiative
              </button>
            )}
            <button onClick={expandAll} className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              Expand All
            </button>
            <button onClick={collapseAll} className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              Collapse All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 items-center mb-4">
          <div className="relative col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search initiatives or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as Department | 'all')}
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
          <div className="col-span-2" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button
              className="col-span-5 text-left hover:text-gray-800"
              onClick={() => handleSortChange('name')}
            >
              Initiative / Task Name {sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-800"
              onClick={() => handleSortChange('status')}
            >
              Status {sortBy === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-800"
              onClick={() => handleSortChange('assignee')}
            >
              Assignee {sortBy === 'assignee' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-2 text-left hover:text-gray-800"
              onClick={() => handleSortChange('dueDate')}
            >
              Due Date {sortBy === 'dueDate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              className="col-span-1 text-left hover:text-gray-800"
              onClick={() => handleSortChange('progress')}
            >
              Progress {sortBy === 'progress' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>

          {departments.map(dept => {
            if (departmentFilter !== 'all' && dept !== departmentFilter) return null;
            const deptProjects = sortProjects(projects.filter(p => p.department === dept));
            if (deptProjects.length === 0) return null;

            return (
              <div key={dept} className="border-b border-gray-100 last:border-b-0">
                <div onClick={() => toggleDept(dept)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                  {expandedDepts.has(dept) ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm">{dept}</span>
                  <span className="text-xs text-gray-500">({deptProjects.length})</span>
                </div>

                {expandedDepts.has(dept) && (
                  <div>
                    {deptProjects.map(project => {
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
                          <div className="grid grid-cols-12 gap-3 pl-8 pr-4 py-2 hover:bg-gray-50 border-l-2 items-center" style={{ borderLeftColor: project.color }}>
                            <div className="col-span-5 flex items-center gap-2 min-w-0">
                              <button onClick={(e) => { e.stopPropagation(); toggleProject(project.id); }} className="p-0.5">
                                {expandedProjects.has(project.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                              </button>
                              <FolderKanban className="w-4 h-4" style={{ color: project.color }} />
                              <span onClick={() => onProjectClick(project)} className="text-sm text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                                {project.isKeyInitiative && <span className="mr-1"></span>}
                                {project.name}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${projectStatusConfig[projectStatus].color}`}>
                                {projectStatusConfig[projectStatus].label}
                              </span>
                            </div>
                            <div className="col-span-2 text-xs text-gray-600 truncate">{project.owner}</div>
                            <div className="col-span-2 text-xs text-gray-600">
                              {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="col-span-1 flex items-center gap-2">
                              <div className="flex-1">
                                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: projectStatus === 'at-risk' ? '#EF4444' : projectStatus === 'needs-attention' ? '#F59E0B' : '#10B981' }} />
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1 text-right">{progress}%</div>
                                <div className="text-[10px] text-gray-400 text-right">{completedCount}/{projectTasks.length}</div>
                              </div>
                              {onAddTask && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddTask(project.id);
                                  }}
                                  className="btn-teal inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium shadow-sm"
                                  title="Add task"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Task
                                </button>
                              )}
                            </div>
                          </div>

                          {expandedProjects.has(project.id) && (
                            <div className="bg-gray-50/50">
                              {filteredProjectTasks.length === 0 ? (
                                <div className="pl-16 pr-4 py-2 text-xs text-gray-500 italic">No tasks</div>
                              ) : (
                                sortTasks(filteredProjectTasks).map(task => {
                                  const isOverdue = task.dueDate < now && task.status !== 'done';
                                  const taskConfig = taskStatusConfig[task.status];
                                  return (
                                    <div key={task.id} onClick={() => onTaskClick(task)} className="grid grid-cols-12 gap-3 pl-14 pr-4 py-1.5 hover:bg-blue-50 cursor-pointer items-center">
                                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                                        {task.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <CheckSquare className="w-3.5 h-3.5 text-gray-400" />}
                                        <span className={`text-sm truncate ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</span>
                                        {task.priority === 'high' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                                      </div>
                                      <div className="col-span-2">
                                        <span className={`px-1.5 py-0.5 rounded text-xs ${taskConfig.color}`}>{taskConfig.label}</span>
                                      </div>
                                      <div className="col-span-2 flex items-center gap-2 text-xs text-gray-600 min-w-0">
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]" style={{ backgroundColor: '#0d3b66' }}>
                                          {task.assignee.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="truncate">{task.assignee}</span>
                                      </div>
                                      <div className={`col-span-2 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                        {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </div>
                                      <div className="col-span-1 text-xs text-right text-gray-500">
                                        {task.status === 'done' ? '100%' : '0%'}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
