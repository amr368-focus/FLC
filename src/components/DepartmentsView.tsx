import { ArrowLeft, Building2, TrendingUp, AlertTriangle, CheckCircle, LayoutGrid, List, GanttChartSquare, Plus, Search, Calendar, User, Clock, FolderKanban } from 'lucide-react';
import { useState } from 'react';
import { Project, Task, Department, calculateProgress, deriveStatus } from '../types';

interface DepartmentsViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick: (project: Project) => void;
  selectedDepartment: Department | null;
  onBackToOverview: () => void;
  onDepartmentSelect: (dept: Department) => void;
  onAddInitiative?: (department: Department) => void;
}

const departments: Department[] = ['Professional Services', 'Sales', 'Marketing', 'CE&S', 'Finance', 'Product', 'IT-Cybersecurity', 'Other Exec'];

const statusConfig = {
  'at-risk': { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-600' },
  'needs-attention': { label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  'on-track': { label: 'On Track', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-600' },
};

export function DepartmentsView({ projects, tasks, onProjectClick, selectedDepartment, onBackToOverview, onDepartmentSelect, onAddInitiative }: DepartmentsViewProps) {
  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'kanban' | 'gantt'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return calculateProgress(projectTasks);
  };

  const getProjectStatus = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return deriveStatus(projectTasks);
  };

  const getDepartmentStats = (dept: Department) => {
    const deptProjects = projects.filter(p => p.department === dept);
    const deptTasks = tasks.filter(t => {
      const project = projects.find(p => p.id === t.projectId);
      return project?.department === dept;
    });

    const activeInitiatives = deptProjects.filter(p => getProjectProgress(p.id) < 100).length;
    const atRisk = deptProjects.filter(p => getProjectStatus(p.id) === 'at-risk').length;
    const onTrack = deptProjects.filter(p => getProjectStatus(p.id) === 'on-track').length;
    const completedTasks = deptTasks.filter(t => t.status === 'done').length;
    const totalTasks = deptTasks.length;

    return { activeInitiatives, atRisk, onTrack, completedTasks, totalTasks, deptProjects };
  };

  // If a department is selected, show detailed view
  if (selectedDepartment) {
    const deptProjects = projects.filter(p => p.department === selectedDepartment);
    const deptTasks = tasks.filter(t => {
      const project = projects.find(p => p.id === t.projectId);
      return project?.department === selectedDepartment;
    });

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeProjects = deptProjects.filter(p => getProjectProgress(p.id) < 100);
    const completedTasks = deptTasks.filter(t => t.status === 'done');
    const overdueTasks = deptTasks.filter(t => t.dueDate < now && t.status !== 'done');
    const dueThisWeek = deptTasks.filter(t => t.dueDate >= now && t.dueDate <= sevenDaysFromNow && t.status !== 'done');

    const keyInitiatives = deptProjects.filter(p => p.isKeyInitiative);
    const atRisk = keyInitiatives.filter(p => getProjectStatus(p.id) === 'at-risk').length;
    const attention = keyInitiatives.filter(p => getProjectStatus(p.id) === 'needs-attention').length;
    const onTrack = keyInitiatives.filter(p => getProjectStatus(p.id) === 'on-track').length;

    const filteredProjects = deptProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || getProjectStatus(project.id) === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-8">
          {/* Back Button */}
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Departments</span>
          </button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{selectedDepartment}</h1>
              <p className="text-sm text-gray-600">Department dashboard and initiative overview</p>
            </div>
            <button
              onClick={() => onAddInitiative?.(selectedDepartment)}
              disabled={!onAddInitiative}
              className="btn-teal flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Initiative
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8 w-fit">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GanttChartSquare className="w-4 h-4" />
              Gantt
            </button>
          </div>

          {viewMode === 'dashboard' ? (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <FolderKanban className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{activeProjects.length}</div>
                      <div className="text-sm text-gray-600 mt-1">Active Initiatives</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {completedTasks.length}/{deptTasks.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Tasks Completed</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{overdueTasks.length}</div>
                      <div className="text-sm text-gray-600 mt-1">Overdue Items</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{dueThisWeek.length}</div>
                      <div className="text-sm text-gray-600 mt-1">Due This Week</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Initiative Overview */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Initiative Overview</h2>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      <span className="text-gray-600">{atRisk} At Risk</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-600">{attention} Attention</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span className="text-gray-600">{onTrack} On Track</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {deptProjects.slice(0, 5).map((project) => {
                      const status = getProjectStatus(project.id);
                      const progress = getProjectProgress(project.id);
                      const config = statusConfig[status];
                      return (
                        <div
                          key={project.id}
                          onClick={() => onProjectClick(project)}
                          className="cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {project.isKeyInitiative && <span>⭐</span>}
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {project.name}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {project.owner}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                              {config.label}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: status === 'at-risk' ? '#EF4444' : status === 'needs-attention' ? '#F59E0B' : '#10B981',
                                }}
                              />
                            </div>
                            <span className="absolute -top-1 right-0 text-xs text-gray-600">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overdue Items */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Overdue Items</h2>
                    </div>
                    {overdueTasks.length > 0 && (
                      <div className="flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-semibold rounded-full">
                        {overdueTasks.length}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {overdueTasks.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">No overdue items</p>
                    ) : (
                      overdueTasks.slice(0, 5).map((task) => {
                        const project = deptProjects.find(p => p.id === task.projectId);
                        const daysOverdue = Math.floor((now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div 
                            key={task.id} 
                            onClick={() => {
                              if (project) {
                                onProjectClick(project);
                              }
                            }}
                            className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                          >
                            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {project?.name} → {task.description || 'No description'}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Owner: {task.assignee}</span>
                              <span className="text-red-600 font-medium">
                                {daysOverdue}d overdue • Due {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="col-span-4">Initiative Name</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Progress</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {deptProjects.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No initiatives found
                  </div>
                ) : (
                  deptProjects.map((project) => {
                    const status = getProjectStatus(project.id);
                    const progress = getProjectProgress(project.id);
                    const config = statusConfig[status];

                    return (
                      <div
                        key={project.id}
                        onClick={() => onProjectClick(project)}
                        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="col-span-4">
                          <div className="flex items-center gap-2">
                            {project.isKeyInitiative && <span>⭐</span>}
                            <div>
                              <div className="font-medium text-gray-900">{project.name}</div>
                              <div className="text-sm text-gray-600 line-clamp-1">{project.description}</div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                            {config.label}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                              {project.owner.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm text-gray-900">{project.owner}</span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: status === 'at-risk' ? '#EF4444' : status === 'needs-attention' ? '#F59E0B' : '#10B981',
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 min-w-[3rem]">{progress}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban View */
            <div className="overflow-x-auto">
              <div className="inline-flex gap-6 min-w-full pb-4">
                {/* To Do Column */}
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">To Do</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                      {deptProjects.filter(p => getProjectProgress(p.id) === 0).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {deptProjects.filter(p => getProjectProgress(p.id) === 0).map((project) => {
                      const status = getProjectStatus(project.id);
                      const config = statusConfig[status];
                      return (
                        <div
                          key={project.id}
                          onClick={() => onProjectClick(project)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            {project.isKeyInitiative && <span className="text-lg">⭐</span>}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ml-auto`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                              {config.label}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{project.owner}</span>
                            <span>{project.dueDate.toLocaleDateString('en-US', { month: 'MMM', day: 'numeric' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">In Progress</h3>
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                      {deptProjects.filter(p => {
                        const progress = getProjectProgress(p.id);
                        return progress > 0 && progress < 100;
                      }).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {deptProjects.filter(p => {
                      const progress = getProjectProgress(p.id);
                      return progress > 0 && progress < 100;
                    }).map((project) => {
                      const status = getProjectStatus(project.id);
                      const progress = getProjectProgress(project.id);
                      const config = statusConfig[status];
                      return (
                        <div
                          key={project.id}
                          onClick={() => onProjectClick(project)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            {project.isKeyInitiative && <span className="text-lg">⭐</span>}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ml-auto`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                              {config.label}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Progress</span>
                              <span className="text-xs font-medium text-gray-900">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: status === 'at-risk' ? '#EF4444' : status === 'needs-attention' ? '#F59E0B' : '#10B981',
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{project.owner}</span>
                            <span>{project.dueDate.toLocaleDateString('en-US', { month: 'MMM', day: 'numeric' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Done Column */}
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Done</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                      {deptProjects.filter(p => getProjectProgress(p.id) === 100).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {deptProjects.filter(p => getProjectProgress(p.id) === 100).map((project) => {
                      const status = getProjectStatus(project.id);
                      const config = statusConfig[status];
                      return (
                        <div
                          key={project.id}
                          onClick={() => onProjectClick(project)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow opacity-75"
                        >
                          <div className="flex items-start justify-between mb-2">
                            {project.isKeyInitiative && <span className="text-lg">⭐</span>}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ml-auto`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                              {config.label}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{project.owner}</span>
                            <span>{project.dueDate.toLocaleDateString('en-US', { month: 'MMM', day: 'numeric' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Gantt View Placeholder */
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <GanttChartSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gantt Chart View</h3>
              <p className="text-gray-600">Timeline visualization coming soon</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Overview: Show all departments
  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Departments</h1>
            <p className="text-sm text-gray-600">Department-specific initiatives and metrics</p>
          </div>
          <button
            onClick={() => onAddInitiative?.()}
            disabled={!onAddInitiative}
            className="btn-teal flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Initiative
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departments.map((dept) => {
            const stats = getDepartmentStats(dept);
            
            if (stats.deptProjects.length === 0) return null;

            return (
              <div 
                key={dept} 
                onClick={() => onDepartmentSelect(dept)} 
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{dept}</h2>
                      <p className="text-sm text-gray-600">{stats.activeInitiatives} initiatives</p>
                    </div>
                  </div>
                  {onAddInitiative && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddInitiative(dept);
                      }}
                      className="btn-teal flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Initiative
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-2xl font-semibold text-gray-900">{stats.onTrack}</span>
                    </div>
                    <div className="text-xs text-gray-600">On Track</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-2xl font-semibold text-gray-900">{stats.atRisk}</span>
                    </div>
                    <div className="text-xs text-gray-600">At Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-2xl font-semibold text-gray-900">
                        {stats.completedTasks}/{stats.totalTasks}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">Tasks Done</div>
                  </div>
                </div>

                {/* Projects List */}
                <div className="space-y-3">
                  {stats.deptProjects.slice(0, 3).map((project) => {
                    const status = getProjectStatus(project.id);
                    const progress = getProjectProgress(project.id);
                    return (
                    <div
                      key={project.id}
                      onClick={() => onProjectClick(project)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === 'at-risk'
                            ? 'bg-red-50 text-red-700'
                            : status === 'needs-attention'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            status === 'at-risk'
                              ? 'bg-red-600'
                              : status === 'needs-attention'
                              ? 'bg-orange-500'
                              : 'bg-green-600'
                          }`}></div>
                          {status === 'at-risk' ? 'At Risk' : status === 'needs-attention' ? 'Attention' : 'On Track'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: status === 'at-risk' ? '#EF4444' : status === 'needs-attention' ? '#F59E0B' : '#10B981',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{progress}%</span>
                      </div>
                    </div>
                  );
                  })}
                </div>

                {stats.deptProjects.length > 3 && (
                  <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all {stats.deptProjects.length} initiatives →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
