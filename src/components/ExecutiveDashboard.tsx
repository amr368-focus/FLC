import { AlertCircle, CheckCircle2, Clock, TrendingUp, Target, BarChart3, Calendar, FolderKanban } from 'lucide-react';
import { Project, Task, CompanyGoal, Department, calculateProgress, deriveStatus } from '../types';

interface ExecutiveDashboardProps {
  projects: Project[];
  tasks: Task[];
  goals: CompanyGoal[];
  onProjectClick: (project: Project) => void;
  onViewAllProjects: () => void;
  onViewOverdue: () => void;
  onViewDueThisWeek: () => void;
  onViewActiveProjects: () => void;
  onViewCompletedTasks: () => void;
  onTaskClick: (task: Task) => void;
  onViewGoals: () => void;
  onDepartmentSelect?: (department: Department) => void;
}

const statusConfig = {
  'at-risk': { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-600' },
  'needs-attention': { label: 'Attention', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  'on-track': { label: 'On Track', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-600' },
};

export function ExecutiveDashboard({ projects, tasks, goals, onProjectClick, onViewAllProjects, onViewOverdue, onViewDueThisWeek, onViewActiveProjects, onViewCompletedTasks, onTaskClick, onViewGoals, onDepartmentSelect }: ExecutiveDashboardProps) {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Helper to get derived status for a project based on its tasks
  const getProjectStatus = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return deriveStatus(projectTasks);
  };

  // Calculate real progress for each project based on tasks
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return calculateProgress(projectTasks);
  };

  const activeProjects = projects.filter(p => getProjectProgress(p.id) < 100);
  const completedTasks = tasks.filter(t => t.status === 'done');
  const overdueTasks = tasks.filter(t => t.dueDate < now && t.status !== 'done');
  const dueThisWeek = tasks.filter(t => t.dueDate >= now && t.dueDate <= sevenDaysFromNow && t.status !== 'done');

  const keyInitiatives = projects.filter(p => p.isKeyInitiative);
  const atRisk = keyInitiatives.filter(p => getProjectStatus(p.id) === 'at-risk').length;
  const attention = keyInitiatives.filter(p => getProjectStatus(p.id) === 'needs-attention').length;
  const onTrack = keyInitiatives.filter(p => getProjectStatus(p.id) === 'on-track').length;

  // Get next 3 months for timeline
  const getTimelineMonths = () => {
    const months = [];
    for (let i = 0; i < 4; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      });
    }
    return months;
  };

  const timelineMonths = getTimelineMonths();
  const timelineStart = timelineMonths[0].start;
  const timelineEnd = timelineMonths[timelineMonths.length - 1].end;
  const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);

  const getBarPosition = (project: Project) => {
    const startDate = project.createdAt > timelineStart ? project.createdAt : timelineStart;
    const endDate = project.dueDate < timelineEnd ? project.dueDate : timelineEnd;
    const left = Math.max(0, (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24) / totalDays * 100);
    const width = Math.min(100 - left, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays * 100);
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  };

  // Department summary
  const departmentSummary = projects.reduce((acc, p) => {
    if (!acc[p.department]) {
      acc[p.department] = { total: 0, atRisk: 0, onTrack: 0, attention: 0 };
    }
    const status = getProjectStatus(p.id);
    acc[p.department].total++;
    if (status === 'at-risk') acc[p.department].atRisk++;
    else if (status === 'on-track') acc[p.department].onTrack++;
    else acc[p.department].attention++;
    return acc;
  }, {} as Record<string, { total: number; atRisk: number; onTrack: number; attention: number }>);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Executive Dashboard</h1>
          <p className="text-sm text-gray-600">Portfolio overview and key metrics at a glance</p>
        </div>

        {/* Metric Cards - Compact Horizontal Row */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <div 
            onClick={onViewActiveProjects}
            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-md transition-shadow cursor-pointer min-w-fit"
          >
            <div className="p-1.5 bg-gray-100 rounded">
              <FolderKanban className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-gray-900">{activeProjects.length}</span>
              <span className="text-xs text-gray-600">Active</span>
            </div>
          </div>

          <div 
            onClick={onViewCompletedTasks}
            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-md transition-shadow cursor-pointer min-w-fit"
          >
            <div className="p-1.5 bg-green-100 rounded">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-gray-900">{completedTasks.length}/{tasks.length}</span>
              <span className="text-xs text-gray-600">Tasks Done</span>
            </div>
          </div>

          <div 
            onClick={onViewOverdue}
            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-md transition-shadow cursor-pointer min-w-fit"
          >
            <div className="p-1.5 bg-red-100 rounded">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-gray-900">{overdueTasks.length}</span>
              <span className="text-xs text-gray-600">Overdue</span>
            </div>
          </div>

          <div 
            onClick={onViewDueThisWeek}
            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 hover:shadow-md transition-shadow cursor-pointer min-w-fit"
          >
            <div className="p-1.5 bg-yellow-100 rounded">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-gray-900">{dueThisWeek.length}</span>
              <span className="text-xs text-gray-600">Due Soon</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-fit">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-gray-600">{onTrack} On Track</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-gray-600">{attention} Attention</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-gray-600">{atRisk} At Risk</span>
            </div>
          </div>
        </div>

        {/* Portfolio Timeline (Gantt-style) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Timeline</h2>
            </div>
            <button 
              onClick={onViewAllProjects}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </button>
          </div>

          {/* Timeline Header */}
          <div className="flex border-b border-gray-200 pb-2 mb-4">
            <div className="w-48 flex-shrink-0 text-xs font-medium text-gray-500 uppercase">Initiative</div>
            <div className="flex-1 flex">
              {timelineMonths.map((month, idx) => (
                <div key={idx} className="flex-1 text-center text-xs font-medium text-gray-500 uppercase">
                  {month.label} {month.year}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="space-y-3">
            {keyInitiatives.slice(0, 6).map((project) => {
              const position = getBarPosition(project);
              const progress = getProjectProgress(project.id);
              const config = statusConfig[getProjectStatus(project.id)];
              
              return (
                <div key={project.id} className="flex items-center group">
                  <div 
                    className="w-48 flex-shrink-0 pr-4 cursor-pointer"
                    onClick={() => onProjectClick(project)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {project.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">{project.owner}</div>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-50 rounded">
                    {/* Month grid lines */}
                    <div className="absolute inset-0 flex">
                      {timelineMonths.map((_, idx) => (
                        <div key={idx} className="flex-1 border-r border-gray-200 last:border-r-0" />
                      ))}
                    </div>
                    {/* Today indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                      style={{ 
                        left: `${((now.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24) / totalDays * 100)}%` 
                      }}
                    />
                    {/* Project bar */}
                    <div
                      className="absolute top-1 bottom-1 rounded cursor-pointer transition-all hover:shadow-md"
                      style={{
                        left: position.left,
                        width: position.width,
                        backgroundColor: project.color,
                        opacity: 0.8,
                      }}
                      onClick={() => onProjectClick(project)}
                    >
                      {/* Progress overlay */}
                      <div 
                        className="absolute inset-0 rounded bg-black/20"
                        style={{ width: `${100 - progress}%`, right: 0, left: 'auto' }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-20 flex-shrink-0 pl-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                      <div className={`w-1 h-1 rounded-full ${config.dot}`} />
                      {config.label.substring(0, 6)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Key Initiatives</h2>
              <button 
                onClick={onViewAllProjects}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
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

            <div className="space-y-4">
              {keyInitiatives.slice(0, 4).map((project) => {
                const status = getProjectStatus(project.id);
                const config = statusConfig[status];
                const progress = getProjectProgress(project.id);
                return (
                  <div
                    key={project.id}
                    onClick={() => onProjectClick(project)}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {project.owner} • {project.department}
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

          {/* Department Health */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Department Health</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(departmentSummary).slice(0, 6).map(([dept, stats]) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => onDepartmentSelect?.(dept as Department)}
                  className={`group w-full text-left rounded-lg p-2 -m-2 transition-colors ${onDepartmentSelect ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${onDepartmentSelect ? 'text-gray-700 group-hover:text-blue-600' : 'text-gray-700'}`}>
                      {dept}
                    </span>
                    <span className="text-xs text-gray-500">{stats.total} initiative{stats.total !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                    {stats.onTrack > 0 && (
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(stats.onTrack / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.attention > 0 && (
                      <div 
                        className="bg-orange-500" 
                        style={{ width: `${(stats.attention / stats.total) * 100}%` }}
                      />
                    )}
                    {stats.atRisk > 0 && (
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(stats.atRisk / stats.total) * 100}%` }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Overdue Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Overdue Items</h2>
              </div>
              {overdueTasks.length > 0 && (
                <div 
                  className="flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-semibold rounded-full cursor-pointer" 
                  onClick={onViewOverdue}
                >
                  {overdueTasks.length}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {overdueTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No overdue items 🎉</p>
              ) : (
                overdueTasks.slice(0, 4).map((task) => {
                  const project = projects.find(p => p.id === task.projectId);
                  const daysOverdue = Math.floor((now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => onTaskClick(task)}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {project?.name}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{task.assignee}</span>
                        <span className="text-red-600 font-medium">
                          {daysOverdue}d overdue
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderKanban(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M3 7V5a2 2 0 0 1 2-2h3l2 2h6a2 2 0 0 1 2 2v2" />
      <line x1="9" y1="11" x2="9" y2="17" />
      <line x1="15" y1="11" x2="15" y2="17" />
    </svg>
  );
}
