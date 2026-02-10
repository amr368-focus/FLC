import { useState, useEffect } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskComment } from '../types';

interface TaskModalProps {
  task: Task | null;
  projectId: string;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function TaskModal({ task, projectId, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
  );
  const [comments, setComments] = useState<TaskComment[]>(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [dependencies, setDependencies] = useState<string[]>(task?.dependencies || []);
  const [newDependency, setNewDependency] = useState('');
  const [dependencyType, setDependencyType] = useState<'after' | 'parallel'>('after');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignee.trim() || !dueDate) return;

    onSave({
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee.trim(),
      dueDate: new Date(dueDate),
      comments,
      tags,
      dependencies,
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !commentAuthor.trim()) return;

    const comment: TaskComment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: commentAuthor.trim(),
      createdAt: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddDependency = () => {
    const trimmed = newDependency.trim();
    if (!trimmed) return;
    const entry = `${dependencyType}:${trimmed}`;
    if (dependencies.includes(entry)) return;
    setDependencies([...dependencies, entry]);
    setNewDependency('');
  };

  const handleRemoveDependency = (depToRemove: string) => {
    setDependencies(dependencies.filter(dep => dep !== depToRemove));
  };

  const parseDependency = (dependency: string) => {
    const [typeCandidate, ...rest] = dependency.split(':');
    const isTyped = typeCandidate === 'after' || typeCandidate === 'parallel';
    return {
      type: isTyped ? typeCandidate : 'after',
      label: (isTyped ? rest.join(':') : dependency).trim(),
    };
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {task ? 'Edit Task' : 'New Task'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                form="task-form"
                className="btn-teal px-3 py-1.5 text-sm rounded-lg transition-colors shadow-sm"
              >
                {task ? 'Save' : 'Create'}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <form id="task-form" onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee *
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter assignee name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="Add tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dependencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Dependencies
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Choose a dependency type, then enter a task title or key (e.g., PRO-1).
              </p>
              <div className="flex flex-wrap gap-2 mb-2">
                <select
                  value={dependencyType}
                  onChange={(e) => setDependencyType(e.target.value as 'after' | 'parallel')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="after">After (depends on)</option>
                  <option value="parallel">Parallel</option>
                </select>
                <input
                  type="text"
                  value={newDependency}
                  onChange={(e) => setNewDependency(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDependency())}
                  className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  placeholder="Add dependency (task ID or name)..."
                />
                <button
                  type="button"
                  onClick={handleAddDependency}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  Add
                </button>
              </div>
              {dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dependencies.map((dep, idx) => {
                    const parsed = parseDependency(dep);
                    return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm"
                    >
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        {parsed.type}
                      </span>
                      {parsed.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveDependency(dep)}
                        className="hover:bg-orange-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-900">
                  Updates & Comments ({comments.length})
                </h4>
              </div>

              {/* Existing Comments */}
              {comments.length > 0 && (
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a status update or comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white -mx-6 px-6 py-4 border-t border-gray-200">
              <button
                type="submit"
                className="btn-teal flex-1 px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
