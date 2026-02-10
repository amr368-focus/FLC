import { useState, useMemo } from 'react';
import { Project, Task, Department, calculateProgress, deriveStatus } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar } from 'lucide-react';

interface PortfolioTimelineViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick: (project: Project) => void;
  onAddInitiative?: () => void;
}

type TimeHorizon = 'week' | 'month' | 'quarter' | 'year';

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

const statusColors = {
  'on-track': '#0BAFA6',
  'needs-attention': '#ED7D2F',
  'at-risk': '#E94B4B',
};

export function PortfolioTimelineView({ projects, tasks, onProjectClick, onAddInitiative }: PortfolioTimelineViewProps) {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('quarter');
  const [viewStartDate, setViewStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Start of current month
    return date;
  });
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set(departments));

  // Calculate time range based on horizon
  const { startDate, endDate, columns, columnWidth } = useMemo(() => {
    const start = new Date(viewStartDate);
    const end = new Date(viewStartDate);
    let cols: { label: string; date: Date }[] = [];
    let width = 100;

    switch (timeHorizon) {
      case 'week':
        start.setDate(start.getDate() - start.getDay()); // Start of week
        end.setDate(start.getDate() + 6); // End of week
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          cols.push({
            label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            date: d,
          });
        }
        width = 120;
        break;

      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0); // Last day of month
        const daysInMonth = end.getDate();
        // Show weeks
        for (let i = 0; i < daysInMonth; i += 7) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          cols.push({
            label: `Week ${Math.floor(i / 7) + 1}`,
            date: d,
          });
        }
        width = 150;
        break;

      case 'quarter':
        const quarterStart = Math.floor(start.getMonth() / 3) * 3;
        start.setMonth(quarterStart, 1);
        end.setMonth(quarterStart + 3, 0);
        for (let i = 0; i < 3; i++) {
          const d = new Date(start);
          d.setMonth(quarterStart + i, 1);
          cols.push({
            label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            date: d,
          });
        }
        width = 180;
        break;

      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        for (let i = 0; i < 12; i++) {
          const d = new Date(start);
          d.setMonth(i, 1);
          cols.push({
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            date: d,
          });
        }
        width = 80;
        break;
    }

    return { startDate: start, endDate: end, columns: cols, columnWidth: width };
  }, [timeHorizon, viewStartDate]);

  const totalWidth = columns.length * columnWidth;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Group projects by department
  const projectsByDepartment = useMemo(() => {
    const grouped: Record<string, Project[]> = {};
    departments.forEach(dept => {
      grouped[dept] = projects.filter(p => p.department === dept);
    });
    return grouped;
  }, [projects]);

  const toggleDepartment = (dept: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedDepartments(newExpanded);
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewStartDate);
    switch (timeHorizon) {
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    setViewStartDate(newDate);
  };

  const goToToday = () => {
    setViewStartDate(new Date());
  };

  const getProjectBar = (project: Project) => {
    const createdAt = project.createdAt;
    const dueDate = project.dueDate;

    // Calculate position relative to visible range
    const rangeMs = endDate.getTime() - startDate.getTime();
    
    // Project start position (clamped to visible range)
    const projectStartMs = Math.max(createdAt.getTime(), startDate.getTime());
    const projectEndMs = Math.min(dueDate.getTime(), endDate.getTime());

    // Check if project is visible in this range
    if (projectEndMs < startDate.getTime() || projectStartMs > endDate.getTime()) {
      return null; // Not visible
    }

    const leftPercent = ((projectStartMs - startDate.getTime()) / rangeMs) * 100;
    const widthPercent = ((projectEndMs - projectStartMs) / rangeMs) * 100;

    return {
      leftPercent: Math.max(0, leftPercent),
      widthPercent: Math.min(100, Math.max(2, widthPercent)),
      startMs: projectStartMs,
      endMs: projectEndMs,
    };
  };

  const now = new Date();
  const todayPosition = ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
  const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getTimeRangeLabel = () => {
    switch (timeHorizon) {
      case 'week':
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarter':
        const q = Math.floor(startDate.getMonth() / 3) + 1;
        return `Q${q} ${startDate.getFullYear()}`;
      case 'year':
        return startDate.getFullYear().toString();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Timeline</h1>
            <p className="text-sm text-gray-500">View all initiatives across time</p>
          </div>
          
          <div className="flex items-center gap-4">
            {onAddInitiative && (
              <button
                onClick={onAddInitiative}
                className="btn-teal px-3 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                Add Initiative
              </button>
            )}
            {/* Time navigation */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => navigateTime('prev')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-medium text-gray-700 min-w-[140px] text-center">
                {getTimeRangeLabel()}
              </span>
              <button
                onClick={() => navigateTime('next')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>

            {/* Time horizon selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['week', 'month', 'quarter', 'year'] as TimeHorizon[]).map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                    timeHorizon === horizon
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {horizon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors['on-track'] }}></div>
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors['needs-attention'] }}></div>
            <span>Needs Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors['at-risk'] }}></div>
            <span>At Risk</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          {/* Column Headers */}
          <div className="flex sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
            <div className="w-72 flex-shrink-0 px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200">
              Department / Initiative
            </div>
            <div className="flex-1 flex relative" style={{ minWidth: totalWidth }}>
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 px-2 py-3 text-center text-xs font-medium text-gray-500 border-r border-gray-100"
                  style={{ width: columnWidth }}
                >
                  {col.label}
                </div>
              ))}
              {todayPosition >= 0 && todayPosition <= 100 && (
                <div
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400"
                  style={{ left: `${todayPosition}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded whitespace-nowrap border border-red-200">
                    Today • {todayLabel}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Departments and Projects */}
          {departments.map((dept) => {
            const deptProjects = projectsByDepartment[dept];
            if (deptProjects.length === 0) return null;
            
            const isExpanded = expandedDepartments.has(dept);

            return (
              <div key={dept}>
                {/* Department Header */}
                <div
                  className="flex items-center bg-gray-100 border-b border-gray-200 cursor-pointer hover:bg-gray-150"
                  onClick={() => toggleDepartment(dept)}
                >
                  <div className="w-72 flex-shrink-0 px-4 py-3 flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-gray-700">{dept}</span>
                    <span className="text-xs text-gray-500">({deptProjects.length})</span>
                  </div>
                  <div className="flex-1 relative h-10" style={{ minWidth: totalWidth }}>
                    {todayPosition >= 0 && todayPosition <= 100 && (
                      <div
                        className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-300"
                        style={{ left: `${todayPosition}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Project Rows */}
                {isExpanded && deptProjects.map((project, idx) => {
                  const bar = getProjectBar(project);
                  const projectTasks = tasks.filter(t => t.projectId === project.id);
                  const progress = calculateProgress(projectTasks);
                  const status = deriveStatus(projectTasks);
                  const barFillPercent = bar
                    ? (() => {
                        const range = Math.max(1, bar.endMs - bar.startMs);
                        const clampedToday = Math.min(Math.max(now.getTime(), bar.startMs), bar.endMs);
                        return ((clampedToday - bar.startMs) / range) * 100;
                      })()
                    : 0;

                  return (
                    <div
                      key={project.id}
                      className={`flex border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                      onClick={() => onProjectClick(project)}
                    >
                      {/* Project Info */}
                      <div className="w-72 flex-shrink-0 px-4 py-3 pl-10 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{project.owner}</span>
                          <span>•</span>
                          <span>{progress}% complete</span>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative py-3" style={{ minWidth: totalWidth }}>
                        {/* Grid lines */}
                        {columns.map((_, idx) => (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 border-r border-gray-100"
                            style={{ left: `${(idx / columns.length) * 100}%` }}
                          />
                        ))}

                        {/* Today indicator */}
                        {todayPosition >= 0 && todayPosition <= 100 && (
                          <div
                            className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-300 z-5"
                            style={{ left: `${todayPosition}%` }}
                          />
                        )}

                        {/* Project Bar */}
                        {bar && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-7 rounded-md shadow-md flex items-center"
                            style={{
                              left: `${bar.leftPercent}%`,
                              width: `${bar.widthPercent}%`,
                              minWidth: '60px',
                              backgroundColor: statusColors[status],
                            }}
                          >
                            {/* Future outline */}
                            <div
                              className="absolute inset-0 rounded-md border-2 border-dashed"
                              style={{ borderColor: '#0c1e45' }}
                            />
                            {/* Solid fill up to today */}
                            <div
                              className="absolute top-0 left-0 bottom-0 rounded-md"
                              style={{
                                width: `${barFillPercent}%`,
                                backgroundColor: 'rgba(12, 30, 69, 0.25)',
                              }}
                            />
                            <span
                              className="relative z-10 text-xs font-medium truncate px-2 py-0.5 rounded w-full text-center"
                              style={{ color: '#ffffff', textShadow: '0 1px 2px rgba(12, 30, 69, 0.45)' }}
                            >
                              {project.name}
                            </span>
                          </div>
                        )}

                        {/* Task diamonds */}
                        {projectTasks.map(task => {
                          const position = ((task.dueDate.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
                          if (position < 0 || position > 100) return null;
                          const taskColor = task.status === 'done' ? '#10B981' : task.dueDate < now ? '#EF4444' : statusColors[status];
                          return (
                            <div
                              key={task.id}
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
                              style={{ left: `${position}%`, backgroundColor: taskColor }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
