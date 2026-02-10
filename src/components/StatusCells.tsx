import { useState, useRef, useEffect } from 'react';

type StatusType = 'project' | 'task';

interface StatusCellProps {
  value: string;
  type: StatusType;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const projectStatusConfig = {
  'on-track': { label: 'On Track', bgColor: '#059669', textColor: '#ffffff' },
  'needs-attention': { label: 'Needs Attention', bgColor: '#d97706', textColor: '#ffffff' },
  'at-risk': { label: 'At Risk', bgColor: '#dc2626', textColor: '#ffffff' },
};

const taskStatusConfig = {
  'todo': { label: 'To Do', bgColor: '#64748b', textColor: '#ffffff' },
  'in-progress': { label: 'In Progress', bgColor: '#2563eb', textColor: '#ffffff' },
  'done': { label: 'Done', bgColor: '#059669', textColor: '#ffffff' },
};

const priorityConfig = {
  'low': { label: 'Low', bgColor: '#cbd5e1', textColor: '#334155' },
  'medium': { label: 'Medium', bgColor: '#fbbf24', textColor: '#ffffff' },
  'high': { label: 'High', bgColor: '#ef4444', textColor: '#ffffff' },
};

/**
 * Monday.com-style status cell with colored background
 */
export function StatusCell({ value, type, onChange, size = 'md' }: StatusCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const config = type === 'project' ? projectStatusConfig : taskStatusConfig;
  const current = config[value as keyof typeof config] || { label: value || 'Not Set', bgColor: '#9ca3af', textColor: '#ffffff' };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs min-w-[80px]',
    md: 'px-3 py-1.5 text-sm min-w-[100px]',
    lg: 'px-4 py-2 text-base min-w-[120px]',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: current.bgColor, color: current.textColor }}
        className={`${sizeClasses[size]} rounded font-medium text-center transition-all hover:opacity-90 shadow-sm`}
      >
        {current.label}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[140px] left-0">
          {Object.entries(config).map(([key, opt]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setIsOpen(false); }}
              className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 ${key === value ? 'bg-gray-100' : ''}`}
            >
              <span className="w-4 h-4 rounded" style={{ backgroundColor: opt.bgColor }} />
              <span className="text-sm text-gray-800">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PriorityCellProps {
  value: 'low' | 'medium' | 'high';
  onChange: (value: 'low' | 'medium' | 'high') => void;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Monday.com-style priority cell
 */
export function PriorityCell({ value, onChange, size = 'md' }: PriorityCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = priorityConfig[value];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: current.bgColor, color: current.textColor }}
        className={`${sizeClasses[size]} rounded font-medium transition-all hover:opacity-90`}
      >
        {current.label}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[100px] left-0">
          {(Object.entries(priorityConfig) as [string, typeof priorityConfig.low][]).map(([key, opt]) => (
            <button
              key={key}
              onClick={() => { onChange(key as 'low' | 'medium' | 'high'); setIsOpen(false); }}
              className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 ${key === value ? 'bg-gray-100' : ''}`}
            >
              <span className="w-4 h-4 rounded" style={{ backgroundColor: opt.bgColor }} />
              <span className="text-sm text-gray-800">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProgressCellProps {
  value: number;
  onChange: (value: number) => void;
  showLabel?: boolean;
}

/**
 * Visual progress bar cell with click-to-edit
 */
export function ProgressCell({ value, onChange, showLabel = true }: ProgressCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const num = parseInt(editValue, 10);
    if (!isNaN(num) && num >= 0 && num <= 100 && num !== value) {
      onChange(num);
    } else {
      setEditValue(value.toString());
    }
  };

  const getColor = (v: number) => {
    if (v >= 80) return 'bg-emerald-500';
    if (v >= 50) return 'bg-amber-500';
    if (v > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        max={100}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') { setEditValue(value.toString()); setIsEditing(false); }
        }}
        className="w-16 px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer flex items-center gap-2 hover:bg-gray-50 rounded px-1 py-0.5 min-w-[100px]"
    >
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-gray-600 w-8 text-right">{value}%</span>}
    </div>
  );
}

interface OwnerCellProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

/**
 * Owner/assignee cell with avatar and name
 */
export function OwnerCell({ value, onChange, suggestions = [] }: OwnerCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = (newValue: string) => {
    setIsEditing(false);
    setShowSuggestions(false);
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(editValue.toLowerCase()) && s !== value
  );

  if (isEditing) {
    return (
      <div ref={containerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => { setEditValue(e.target.value); setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => handleSave(editValue), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave(editValue);
            if (e.key === 'Escape') { setEditValue(value); setIsEditing(false); }
          }}
          placeholder="Enter name..."
          className="w-full px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl py-1 max-h-40 overflow-auto">
            {filteredSuggestions.slice(0, 5).map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleSave(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <div className={`w-6 h-6 rounded-full ${getAvatarColor(suggestion)} text-white text-xs flex items-center justify-center`}>
                  {getInitials(suggestion)}
                </div>
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!value) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-gray-400 hover:text-gray-600 text-sm italic hover:bg-gray-50 px-2 py-1 rounded"
      >
        + Assign
      </button>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 hover:bg-gray-50 rounded px-1 py-0.5"
    >
      <div className={`w-6 h-6 rounded-full ${getAvatarColor(value)} text-white text-xs flex items-center justify-center`}>
        {getInitials(value)}
      </div>
      <span className="text-sm truncate max-w-[100px]">{value}</span>
    </button>
  );
}

interface DateCellProps {
  value: Date;
  onChange: (value: Date) => void;
  showRelative?: boolean;
}

/**
 * Date cell with overdue highlighting
 */
export function DateCell({ value, onChange, showRelative = false }: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRelative = (d: Date) => {
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days}d`;
    return formatDate(d);
  };

  const isOverdue = value < new Date() && value.toDateString() !== new Date().toDateString();
  const isDueSoon = !isOverdue && value <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={value.toISOString().split('T')[0]}
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          if (!isNaN(newDate.getTime())) {
            onChange(newDate);
          }
          setIsEditing(false);
        }}
        onBlur={() => setIsEditing(false)}
        className="px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`px-2 py-1 rounded text-sm hover:bg-gray-50 ${
        isOverdue ? 'text-red-600 font-medium bg-red-50' : 
        isDueSoon ? 'text-amber-600 bg-amber-50' : 
        'text-gray-600'
      }`}
    >
      {showRelative ? getRelative(value) : formatDate(value)}
    </button>
  );
}
