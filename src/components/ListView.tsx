import { Calendar, User, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

type SortField = 'title' | 'priority' | 'status' | 'assignee' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const priorityOrder = { high: 3, medium: 2, low: 1 };
const statusOrder = { 'todo': 1, 'in-progress': 2, 'done': 3 };

const priorityColors = {
  low: { bgColor: '#f1f5f9', textColor: '#475569' },
  medium: { bgColor: '#fef3c7', textColor: '#d97706' },
  high: { bgColor: '#fee2e2', textColor: '#dc2626' },
};

const statusColors = {
  'todo': { bgColor: '#64748b', textColor: '#ffffff' },
  'in-progress': { bgColor: '#2563eb', textColor: '#ffffff' },
  'done': { bgColor: '#059669', textColor: '#ffffff' },
};

export function ListView({ tasks, onEditTask, onDeleteTask, onUpdateTask }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'status':
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'assignee':
        comparison = a.assignee.localeCompare(b.assignee);
        break;
      case 'dueDate':
        comparison = a.dueDate.getTime() - b.dueDate.getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const now = new Date();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-2">
                  Task
                  <SortIcon field="title" />
                </div>
              </th>
              <th
                className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th
                className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('assignee')}
              >
                <div className="flex items-center gap-2">
                  Assignee
                  <SortIcon field="assignee" />
                </div>
              </th>
              <th
                className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-2">
                  Due Date
                  <SortIcon field="dueDate" />
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedTasks.map((task) => {
              const isOverdue = task.dueDate < now && task.status !== 'done';

              return (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onEditTask(task)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{task.title}</span>
                      {task.description && (
                        <span className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      style={{ backgroundColor: statusColors[task.status].bgColor, color: statusColors[task.status].textColor }}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                    >
                      {task.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      style={{ backgroundColor: priorityColors[task.priority].bgColor, color: priorityColors[task.priority].textColor }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                    >
                      <Flag className="w-3 h-3" />
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {task.assignee}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        {task.dueDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateTask(task.id, { status: e.target.value as TaskStatus });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedTasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks to display
        </div>
      )}
    </div>
  );
}
