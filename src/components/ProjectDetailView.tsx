import { ArrowLeft, Plus, Calendar, User, MessageSquare, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Project, Task } from '../types';
import { downloadCsvFromApi } from '../utils/download';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}

const statusConfig = {
  'todo': { label: 'To Do', color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  'done': { label: 'Done', color: 'bg-green-100 text-green-700' },
};

const priorityConfig = {
  'low': { label: 'Low', color: 'text-gray-600' },
  'medium': { label: 'Medium', color: 'text-yellow-600' },
  'high': { label: 'High', color: 'text-red-600' },
};

export function ProjectDetailView({ project, tasks, onBack, onEditTask, onAddTask }: ProjectDetailViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const now = new Date();

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {project.isKeyInitiative && <span className="text-2xl">⭐</span>}
                <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              </div>
              <p className="text-gray-600">{project.description}</p>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Owner: <span className="font-medium text-gray-900">{project.owner}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Due: <span className="font-medium text-gray-900">{project.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></span>
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded">
                  {project.department}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try{
                    await downloadCsvFromApi('/api/export/csv', `pulse-${project.name.replace(/\s+/g,'-')}-export.csv`);
                  }catch(err){
                    console.error(err);
                  }
                }}
                className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>

              <button
                onClick={onAddTask}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-gray-900">{project.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${project.progress}%`,
                backgroundColor: project.status === 'at-risk' ? '#EF4444' : project.status === 'needs-attention' ? '#F59E0B' : '#10B981',
              }}
            />
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700 uppercase tracking-wider">
            <div className="col-span-1">
              <input type="checkbox" className="rounded border-gray-300" />
            </div>
            <div className="col-span-1">Type</div>
            <div className="col-span-3">Summary</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1">Priority</div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => {
              const isOverdue = task.dueDate < now && task.status !== 'done';
              const isExpanded = expandedTasks.has(task.id);

              return (
                <div key={task.id} className="hover:bg-gray-50 transition-colors">
                  <div 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer"
                    onClick={() => onEditTask(task)}
                  >
                    <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </div>
                    
                    <div className="col-span-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[task.status].color}`}>
                        {statusConfig[task.status].label}
                      </span>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-900">{task.assignee}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {isOverdue && '⚠️ '}
                        {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className={`text-sm font-medium ${priorityConfig[task.priority].color}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="ml-12">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Comments</h4>
                        {task.comments && task.comments.length > 0 ? (
                          <div className="space-y-3">
                            {task.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                                    <span className="text-xs text-gray-500">
                                      {comment.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No comments yet</p>
                        )}
                        
                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Add comment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No tasks yet. Click "Add Task" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
