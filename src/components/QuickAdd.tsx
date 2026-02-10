import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';

interface QuickAddRowProps {
  placeholder?: string;
  onAdd: (value: string) => void;
  className?: string;
}

/**
 * Quick-add row component - Monday.com style instant item creation
 * Press Enter to add, Escape to cancel
 */
export function QuickAddRow({ placeholder = 'Add new item...', onAdd, className = '' }: QuickAddRowProps) {
  const [isActive, setIsActive] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
      // Keep focus for rapid entry
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setValue('');
      setIsActive(false);
    }
  };

  const handleBlur = () => {
    if (!value.trim()) {
      setIsActive(false);
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-xs ${className}`}
      >
        <Plus className="w-3 h-3" />
        <span>+ Add task...</span>
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <Plus className="w-3 h-3 text-blue-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-xs"
      />
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200">↵</kbd>
      </div>
    </div>
  );
}

interface QuickAddTaskProps {
  projectId: string;
  parentTaskId?: string;
  onAdd: (task: {
    title: string;
    projectId: string;
    parentTaskId?: string;
    status: 'todo';
    priority: 'medium';
    assignee: string;
    description: string;
    dueDate: Date;
    comments: [];
  }) => void;
  className?: string;
}

/**
 * Quick-add task with smart defaults
 */
export function QuickAddTask({ projectId, parentTaskId, onAdd, className = '' }: QuickAddTaskProps) {
  const handleAdd = (title: string) => {
    onAdd({
      title,
      projectId,
      parentTaskId,
      status: 'todo',
      priority: 'medium',
      assignee: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week from now
      comments: [],
    });
  };

  return <QuickAddRow placeholder="Add task... (Press Enter)" onAdd={handleAdd} className={className} />;
}

interface QuickAddInitiativeProps {
  department: string;
  onAdd: (initiative: {
    name: string;
    department: string;
    status: 'on-track';
    progress: 0;
    owner: string;
    description: string;
    color: string;
    dueDate: Date;
    isKeyInitiative: boolean;
  }) => void;
  className?: string;
}

/**
 * Quick-add initiative with smart defaults
 */
export function QuickAddInitiative({ department, onAdd, className = '' }: QuickAddInitiativeProps) {
  const handleAdd = (name: string) => {
    // Generate a random color from a predefined palette
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    onAdd({
      name,
      department,
      status: 'on-track',
      progress: 0,
      owner: '',
      description: '',
      color: randomColor,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default: 3 months from now
      isKeyInitiative: false,
    });
  };

  return <QuickAddRow placeholder="Add initiative... (Press Enter)" onAdd={handleAdd} className={className} />;
}
