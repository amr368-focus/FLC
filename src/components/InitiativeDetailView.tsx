import { ArrowLeft, Plus, MessageSquare, Calendar, User, AlertCircle, LayoutGrid, List, GanttChartSquare, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Project, Task, calculateProgress, deriveStatus, TaskStatus } from '../types';
import { StatusCell, OwnerCell, DateCell } from './StatusCells';
import { InlineEditText } from './InlineEdit';
import { GanttView } from './GanttView';
interface InitiativeDetailViewProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onEditInitiative?: (project: Project) => void;
  onDeleteInitiative?: (projectId: string) => void;
}
const statusConfig = {
  'at-risk': { label: 'At Risk', textColor: '#dc2626', bgColor: '#fef2f2', dotColor: '#dc2626' },
  'needs-attention': { label: 'Needs Attention', textColor: '#ea580c', bgColor: '#fff7ed', dotColor: '#f97316' },
  'on-track': { label: 'On Track', textColor: '#16a34a', bgColor: '#f0fdf4', dotColor: '#16a34a' },
};
const taskStatusConfig = {
  'todo': { label: 'To Do', bgColor: '#64748b', textColor: '#ffffff' },
  'in-progress': { label: 'In Progress', bgColor: '#2563eb', textColor: '#ffffff' },
  'done': { label: 'Done', bgColor: '#059669', textColor: '#ffffff' },
};
export function InitiativeDetailView({ project, tasks, onBack, onEditTask, onAddTask, onUpdateTask, onEditInitiative, onDeleteInitiative }: InitiativeDetailViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt'>('list');
  const [sortField, setSortField] = useState<'title' | 'status' | 'assignee' | 'dueDate'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const progress = calculateProgress(tasks);
  const derivedStatus = deriveStatus(tasks);
  const config = statusConfig[derivedStatus];
  const now = new Date();
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    onUpdateTask(taskId, { status });
  };
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const filteredTasks = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
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
  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to initiatives</span>
        </button>
        {/* Initiative Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {project.isKeyInitiative && <span className="text-xl">⭐</span>}
                <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
                <span 
                  style={{ backgroundColor: config.bgColor, color: config.textColor }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.dotColor }}></div>
                  {config.label}
                </span>
              </div>
              <p className="text-gray-600">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onAddTask}
                className="btn-teal flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
              {onEditInitiative && (
                <button
                  onClick={() => onEditInitiative(project)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {onDeleteInitiative && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Initiative?</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete "<strong>{project.name}</strong>"? This will also delete all {tasks.length} associated tasks. This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteInitiative(project.id);
                      setShowDeleteConfirm(false);
                    }}
                    className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete Initiative
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-1">Owner</div>
              <div className="font-medium text-gray-900">{project.owner}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Department</div>
              <div className="font-medium text-gray-900">{project.department}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Due Date</div>
              <div className="font-medium text-gray-900">
                {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Progress</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: derivedStatus === 'at-risk' ? '#EF4444' : derivedStatus === 'needs-attention' ? '#F59E0B' : '#10B981',
                    }}
                  />
                </div>
                <span className="font-medium text-gray-900">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Tasks Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              {viewMode === 'list' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onAddTask}
                className="flex items-center gap-2 px-3 py-2 bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
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
            </div>
          </div>
          {/* Task Views */}
          {viewMode === 'list' ? (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="col-span-1">Key</div>
                <div className="col-span-2 cursor-pointer hover:text-gray-900" onClick={() => handleSort('title')}>
                  Summary {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1">Dependencies</div>
                <div className="col-span-1">Tags</div>
                <div className="col-span-1">Category</div>
                <div className="col-span-2 cursor-pointer hover:text-gray-900" onClick={() => handleSort('assignee')}>
                  Assignee {sortField === 'assignee' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-2 cursor-pointer hover:text-gray-900" onClick={() => handleSort('dueDate')}>
                  Due Date {sortField === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1">Comments</div>
              </div>
              {/* Table Rows */}
              <div className="divide-y divide-gray-200">
                {sortedTasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No tasks yet. Click "Add Task" to get started.
                  </div>
                ) : (
                  (() => {
                    const parentTasks = sortedTasks.filter(task => !task.parentTaskId);
                    const childTasks = sortedTasks.filter(task => task.parentTaskId);
                    const childByParent = childTasks.reduce((acc, task) => {
                      const key = task.parentTaskId as string;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(task);
                      return acc;
                    }, {} as Record<string, Task[]>);

                    return parentTasks.map((task, index) => {
                      const isOverdue = task.dueDate < now && task.status !== 'done';
                      const children = childByParent[task.id] || [];

                      return (
                        <div key={task.id}>
                          <div
                            onDoubleClick={() => onEditTask(task)}
                            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="col-span-1 flex items-center">
                              <span className="text-sm text-gray-600 font-mono">{`${project.name.substring(0, 3).toUpperCase()}-${index + 1}`}</span>
                            </div>

                            <div className="col-span-2 flex items-center">
                              <InlineEditText
                                value={task.title}
                                onSave={(newTitle) => onUpdateTask(task.id, { title: newTitle })}
                                className={`text-sm truncate ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}
                                placeholder="Task title"
                              />
                            </div>

                            <div className="col-span-1 flex items-center">
                              <StatusCell
                                value={task.status}
                                type="task"
                                onChange={(newStatus) => onUpdateTask(task.id, { status: newStatus as TaskStatus })}
                                size="sm"
                              />
                            </div>

                            <div className="col-span-1 flex items-center">
                              {task.dependencies && task.dependencies.length > 0 && (
                                <span className="text-xs text-orange-600 font-medium">
                                  {task.dependencies.length}
                                </span>
                              )}
                            </div>

                            <div className="col-span-1 flex items-center">
                              {task.tags && task.tags.length > 0 && (
                                <span className="text-xs text-blue-600">
                                  {task.tags.length} tag{task.tags.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            <div className="col-span-1 flex items-center">
                              {task.description && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs truncate">
                                  {task.description.substring(0, 10)}
                                </span>
                              )}
                            </div>

                            <div className="col-span-2 flex items-center">
                              <OwnerCell
                                value={task.assignee}
                                onChange={(newAssignee) => onUpdateTask(task.id, { assignee: newAssignee })}
                              />
                            </div>

                            <div className="col-span-2 flex items-center">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <DateCell
                                  value={task.dueDate}
                                  onChange={(newDate) => onUpdateTask(task.id, { dueDate: newDate })}
                                />
                                {task.priority === 'high' && (
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                )}
                                {isOverdue && <span className="text-xs text-red-600 font-medium">Overdue</span>}
                              </div>
                            </div>

                            <div className="col-span-1 flex items-center">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{task.comments.length}</span>
                              </div>
                            </div>
                          </div>

                          {children.map((child) => (
                            <div key={child.id} className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50/60 border-t border-gray-100">
                              <div className="col-span-1 flex items-center text-[11px] text-gray-400">Sub</div>
                              <div className="col-span-2 flex items-center pl-4">
                                <InlineEditText
                                  value={child.title}
                                  onSave={(newTitle) => onUpdateTask(child.id, { title: newTitle })}
                                  className={`text-sm truncate ${child.status === 'done' ? 'line-through text-gray-500' : 'text-gray-700'}`}
                                  placeholder="Subtask title"
                                />
                              </div>
                              <div className="col-span-1 flex items-center">
                                <StatusCell
                                  value={child.status}
                                  type="task"
                                  onChange={(newStatus) => onUpdateTask(child.id, { status: newStatus as TaskStatus })}
                                  size="sm"
                                />
                              </div>
                              <div className="col-span-1" />
                              <div className="col-span-1" />
                              <div className="col-span-1" />
                              <div className="col-span-2 flex items-center">
                                <OwnerCell
                                  value={child.assignee}
                                  onChange={(newAssignee) => onUpdateTask(child.id, { assignee: newAssignee })}
                                />
                              </div>
                              <div className="col-span-2 flex items-center">
                                <DateCell
                                  value={child.dueDate}
                                  onChange={(newDate) => onUpdateTask(child.id, { dueDate: newDate })}
                                />
                              </div>
                              <div className="col-span-1" />
                            </div>
                          ))}
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </>
          ) : viewMode === 'kanban' ? (
            <div className="overflow-auto">
               <div className="p-6 min-h-[400px]">
                <div className="grid grid-cols-3 gap-6">
                  {/* To Do Column */}
                <div onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'todo')}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">To Do</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                      {tasks.filter(t => t.status === 'todo').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'todo').map((task) => {
                      const isOverdue = task.dueDate < now;
                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs text-gray-600">{task.assignee}</span>
                            </div>
                            <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* In Progress Column */}
                <div onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'in-progress')}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">In Progress</h3>
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'in-progress').map((task) => {
                      const isOverdue = task.dueDate < now;
                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs text-gray-600">{task.assignee}</span>
                            </div>
                            <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Done Column */}
                <div onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'done')}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Done</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                      {tasks.filter(t => t.status === 'done').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'done').map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onEditTask(task)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow opacity-75"
                      >
                        <h4 className="font-medium text-gray-900 mb-2 line-through">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {task.assignee.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs text-gray-600">{task.assignee}</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>
          ) : (
            <div className="overflow-auto p-6">
              <GanttView tasks={tasks} onEditTask={onEditTask} projectName={project.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
