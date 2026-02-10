import { Task } from '../types';
import { Calendar, User, Flag } from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  projectName: string;
}

const priorityColors = {
  low: '#9CA3AF',
  medium: '#F59E0B',
  high: '#EF4444',
};

export function GanttView({ tasks, onEditTask, projectName }: GanttViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No tasks to display in Gantt chart
      </div>
    );
  }

  // Calculate date range
  const allDates = tasks.map(t => t.dueDate.getTime());
  const minDate = new Date(Math.min(...allDates, Date.now()));
  const maxDate = new Date(Math.max(...allDates));
  
  // Extend range for better visualization
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);

  const totalDays = Math.max(
    1,
    Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  
  // Generate month headers
  const months: { label: string; width: number; startDay: number }[] = [];
  let currentDate = new Date(minDate);
  let currentMonth = currentDate.getMonth();
  let monthStartDay = 0;
  let dayCount = 0;

  for (let i = 0; i < totalDays; i++) {
    if (currentDate.getMonth() !== currentMonth) {
      months.push({
        label: new Date(currentDate.getFullYear(), currentMonth).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        width: dayCount,
        startDay: monthStartDay,
      });
      currentMonth = currentDate.getMonth();
      monthStartDay = i;
      dayCount = 0;
    }
    dayCount++;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Add last month
  if (dayCount > 0) {
    months.push({
      label: new Date(currentDate.getFullYear(), currentMonth).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      width: dayCount,
      startDay: monthStartDay,
    });
  }

  const getTaskPosition = (task: Task) => {
    const taskDate = task.dueDate.getTime();
    const start = minDate.getTime();
    const daysSinceStart = Math.floor((taskDate - start) / (1000 * 60 * 60 * 24));
    
    // Task bar starts 7 days before due date and ends on due date
    const taskStartDay = Math.max(0, daysSinceStart - 7);
    const taskEndDay = daysSinceStart;
    const taskDuration = Math.max(1, taskEndDay - taskStartDay);

    const leftPercent = (taskStartDay / totalDays) * 100;
    const widthPercent = (taskDuration / totalDays) * 100;

    return {
      leftPercent,
      widthPercent,
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const now = new Date();
  const todayPosition = ((now.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
  const todayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Sort tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const parseDependency = (dep: string) => {
    const trimmed = dep.trim();
    if (trimmed.toLowerCase().startsWith('parallel:')) {
      return { key: trimmed.slice('parallel:'.length).trim(), type: 'parallel' as const };
    }
    if (trimmed.toLowerCase().startsWith('after:')) {
      return { key: trimmed.slice('after:'.length).trim(), type: 'after' as const };
    }
    return { key: trimmed, type: 'after' as const };
  };

  const taskIdByTitle = new Map<string, string>();
  tasks.forEach(t => taskIdByTitle.set(t.title.toLowerCase(), t.id));

  const projectKey = projectName.substring(0, 3).toUpperCase();
  const taskIdByKey = new Map<string, string>();

  const taskPositions = new Map<string, { leftPercent: number; widthPercent: number; rowIndex: number }>();
  sortedTasks.forEach((task, index) => {
    const position = getTaskPosition(task);
    taskPositions.set(task.id, { leftPercent: position.leftPercent, widthPercent: position.widthPercent, rowIndex: index });
    taskIdByKey.set(`${projectKey}-${index + 1}`, task.id);
  });

  const dependencyLinks = sortedTasks.flatMap(task => {
    if (!task.dependencies || task.dependencies.length === 0) return [];
    return task.dependencies.map(dep => {
      const parsed = parseDependency(dep);
      const normalizedKey = parsed.key.trim();
      const directMatch = taskPositions.has(normalizedKey) ? normalizedKey : undefined;
      const titleMatch = taskIdByTitle.get(normalizedKey.toLowerCase());
      const keyMatch = taskIdByKey.get(normalizedKey.toUpperCase());
      const fromId = directMatch || keyMatch || titleMatch;
      if (!fromId) return null;
      return { fromId, toId: task.id, type: parsed.type };
    }).filter((link): link is { fromId: string; toId: string; type: 'after' | 'parallel' } => Boolean(link));
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-80 flex-shrink-0 px-4 py-3 border-r border-gray-200">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">Task</span>
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {months.map((month, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 border-r border-gray-200 text-center"
                    style={{ width: `${(month.width / totalDays) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-gray-700">{month.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="relative">
            {dependencyLinks.length > 0 && (
              <div className="absolute top-0 bottom-0 left-80 right-0 pointer-events-none">
                <svg
                  width="100%"
                  height={sortedTasks.length * 72}
                  viewBox={`0 0 1000 ${sortedTasks.length * 72}`}
                  className="absolute inset-0"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6B7280" />
                    </marker>
                  </defs>
                  {dependencyLinks.map((link, idx) => {
                    const from = taskPositions.get(link.fromId);
                    const to = taskPositions.get(link.toId);
                    if (!from || !to) return null;

                    const svgWidth = 1000;
                    const fromX = ((from.leftPercent + from.widthPercent) / 100) * svgWidth;
                    const toX = (to.leftPercent / 100) * svgWidth;
                    const fromY = from.rowIndex * 72 + 36;
                    const toY = to.rowIndex * 72 + 36;
                    const midX = Math.max(fromX + 12, (fromX + toX) / 2);

                    return (
                      <path
                        key={idx}
                        d={`M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`}
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeDasharray={link.type === 'parallel' ? '4 4' : '0'}
                        markerEnd={link.type === 'after' ? 'url(#arrow)' : undefined}
                      />
                    );
                  })}
                </svg>
              </div>
            )}
            {sortedTasks.map((task, idx) => {
              const position = getTaskPosition(task);
              const isOverdue = task.dueDate < now && task.status !== 'done';
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.id}
                  className={`flex border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                  onClick={() => onEditTask(task)}
                >
                  {/* Task Info */}
                  <div className="w-80 flex-shrink-0 px-4 py-4 border-r border-gray-200">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                        <Flag 
                          className="w-3.5 h-3.5 flex-shrink-0" 
                          style={{ color: priorityColors[task.priority] }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                          task.status === 'done' 
                            ? 'bg-green-100 text-green-700' 
                            : task.status === 'in-progress'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gantt Bar */}
                  <div className="flex-1 relative py-4">
                    <div className="relative h-full">
                      {/* Grid lines */}
                      {months.map((month, idx) => (
                        <div
                          key={idx}
                          className="absolute top-0 bottom-0 border-r border-gray-100"
                          style={{ left: `${(month.startDay / totalDays) * 100}%` }}
                        />
                      ))}

                      {/* Task bar */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md shadow-sm transition-all hover:shadow-md"
                        style={{
                          left: position.left,
                          width: position.width,
                          backgroundColor: isDone ? '#10B981' : isOverdue ? '#EF4444' : priorityColors[task.priority],
                          opacity: isDone ? 0.6 : 0.9,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-white font-medium truncate px-2">
                            {task.status === 'in-progress' ? 'In Progress' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Today indicator */}
            {todayPosition >= 0 && todayPosition <= 100 && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400 z-10 pointer-events-none"
                style={{ left: `calc(320px + ${todayPosition}%)` }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded whitespace-nowrap border border-red-200">
                  Today • {todayLabel}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: priorityColors.high }}></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: priorityColors.medium }}></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: priorityColors.low }}></div>
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 opacity-60"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
