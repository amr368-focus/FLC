import { Calendar, User, Trash2, Flag } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const priorityColors = {
  low: 'text-gray-500 bg-gray-100',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-red-600 bg-red-50',
};

export function TaskCard({ task, onEdit, onDelete, onDragStart }: TaskCardProps) {
  const isOverdue = task.dueDate < new Date() && task.status !== 'done';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEdit(task)}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1 pr-2">{task.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Flag className={`w-3.5 h-3.5 ${priorityColors[task.priority].split(' ')[0]}`} />
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-3.5 h-3.5" />
          <span className="text-xs">{task.assignee}</span>
        </div>

        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs">
            {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      </div>
    </div>
  );
}
