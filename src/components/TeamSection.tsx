import { Calendar, User, Flag } from 'lucide-react';
import { Project, Task, Team } from '../types';

interface TeamSectionProps {
  team: Team;
  projects: Project[];
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityColors = {
  low: 'text-gray-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

export function TeamSection({ team, projects, tasks, onEditTask }: TeamSectionProps) {
  const now = new Date();
  
  // Sort tasks: overdue first, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    const aOverdue = a.dueDate < now && a.status !== 'done';
    const bOverdue = b.dueDate < now && b.status !== 'done';
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const activeTasks = sortedTasks.filter(t => t.status !== 'done');
  const completedTasks = sortedTasks.filter(t => t.status === 'done');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{team}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Projects in this team */}
      <div className="flex flex-wrap gap-2 mb-4">
        {projects.map(project => (
          <div
            key={project.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-gray-700">{project.name}</span>
          </div>
        ))}
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Tasks</h4>
          <div className="space-y-2">
            {activeTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const isOverdue = task.dueDate < now;
              const isDueSoon = task.dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isOverdue
                      ? 'bg-red-50 border-red-200 hover:bg-red-100'
                      : isDueSoon
                      ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {project && (
                          <span
                            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span>
                            {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
                          <Flag className="w-3 h-3" />
                          <span className="capitalize">{task.priority}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-white rounded-full text-xs capitalize">
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2">
            {completedTasks.slice(0, 5).map(task => {
              const project = projects.find(p => p.id === task.projectId);

              return (
                <div
                  key={task.id}
                  onClick={() => onEditTask(task)}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors opacity-75"
                >
                  <div className="flex items-center gap-2">
                    {project && (
                      <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                    )}
                    <span className="text-sm text-gray-700 line-through truncate">
                      {task.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">No tasks for this team</p>
      )}
    </div>
  );
}
