import { useState } from 'react';
import { Plus, Filter, LayoutGrid, List, GanttChartSquare, ArrowLeft } from 'lucide-react';
import { Project, Task, TaskStatus, TaskPriority } from '../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { FilterDropdown } from './FilterDropdown';
import { ListView } from './ListView';
import { GanttView } from './GanttView';

interface ProjectBoardProps {
  project: Project;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onBack: () => void;
}

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

export function ProjectBoard({
  project,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onBack,
}: ProjectBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string | 'all'>('all');
  const [projectView, setProjectView] = useState<'kanban' | 'list' | 'gantt'>('kanban');

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onAddTask(taskData);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onUpdateTask(taskId, { status });
  };

  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterAssignee !== 'all' && task.assignee !== filterAssignee) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-600">{project.department} • {project.owner}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FilterDropdown
                label="Priority"
                value={filterPriority}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                onChange={(value) => setFilterPriority(value as TaskPriority | 'all')}
              />
              <FilterDropdown
                label="Assignee"
                value={filterAssignee}
                options={[
                  { value: 'all', label: 'All Assignees' },
                  ...assignees.map(a => ({ value: a, label: a })),
                ]}
                onChange={(value) => setFilterAssignee(value)}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setProjectView('kanban')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    projectView === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Kanban
                </button>
                <button
                  onClick={() => setProjectView('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    projectView === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setProjectView('gantt')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    projectView === 'gantt'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GanttChartSquare className="w-4 h-4" />
                  Gantt
                </button>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          {projectView === 'kanban' ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-auto">
              {columns.map(({ status, label }) => {
                const columnTasks = filteredTasks.filter(t => t.status === status);
                
                return (
                  <div
                    key={status}
                    className="flex flex-col bg-gray-100 rounded-lg p-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{label}</h3>
                      <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={onDeleteTask}
                          onDragStart={handleDragStart}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : projectView === 'list' ? (
            <div className="flex-1 overflow-auto">
              <ListView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <GanttView
                tasks={filteredTasks}
                onEditTask={handleEditTask}
              />
            </div>
          )}

          {isModalOpen && (
            <TaskModal
              task={editingTask}
              projectId={project.id}
              onSave={handleSaveTask}
              onClose={() => {
                setIsModalOpen(false);
                setEditingTask(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
