import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Project, Task } from '../types';

interface TaskListModalProps {
  tasks: Task[];
  projects: Project[];
  title: string;
  onClose: () => void;
  onTaskClick: (task: Task) => void;
}

export function TaskListModal({ tasks, projects, title, onClose, onTaskClick }: TaskListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(task => {
    const project = projects.find(p => p.id === task.projectId);
    return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           project?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const now = new Date();

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredTasks.length} tasks</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-200px)] p-6">
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const project = projects.find(p => p.id === task.projectId);
              const isOverdue = task.dueDate < now && task.status !== 'done';
              const daysOverdue = isOverdue ? Math.floor((now.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    onTaskClick(task);
                    onClose();
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    isOverdue 
                      ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'done' 
                        ? 'bg-green-100 text-green-700' 
                        : task.status === 'in-progress'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'To Do'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {project && (
                      <>
                        <span className="font-medium">{project.name}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{task.assignee}</span>
                    <span>•</span>
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      {isOverdue ? `${daysOverdue}d overdue` : `Due ${task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </span>
                    <span>•</span>
                    <span className={`capitalize ${
                      task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No tasks found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
