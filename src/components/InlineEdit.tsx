import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface InlineEditTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

/**
 * Inline text editing component - click to edit, blur or Enter to save
 */
export function InlineEditText({ value, onSave, className = '', placeholder = 'Click to edit', multiline = false }: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: `w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`,
      placeholder,
    };

    return multiline ? (
      <textarea {...commonProps} rows={3} />
    ) : (
      <input {...commonProps} type="text" />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded inline-block min-w-[60px] ${className} ${!value ? 'text-gray-400 italic' : ''}`}
    >
      {value || placeholder}
    </span>
  );
}

interface InlineEditSelectProps<T extends string> {
  value: T;
  options: { value: T; label: string; color?: string }[];
  onSave: (value: T) => void;
  className?: string;
}

/**
 * Inline select component with Monday.com-style colored options
 */
export function InlineEditSelect<T extends string>({ value, options, onSave, className = '' }: InlineEditSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: T) => {
    setIsOpen(false);
    if (newValue !== value) {
      onSave(newValue);
    }
  };

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentOption?.color || 'bg-gray-100 text-gray-700'}`}
      >
        {currentOption?.label || value}
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${option.value === value ? 'bg-gray-50' : ''}`}
            >
              <span className={`w-3 h-3 rounded-full ${option.color?.split(' ')[0] || 'bg-gray-300'}`} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface InlineEditDateProps {
  value: Date;
  onSave: (value: Date) => void;
  className?: string;
}

/**
 * Inline date picker component
 */
export function InlineEditDate({ value, onSave, className = '' }: InlineEditDateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toInputFormat = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onSave(newDate);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={toInputFormat(value)}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        className={`px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    );
  }

  const isOverdue = value < new Date() && value.toDateString() !== new Date().toDateString();
  const isDueSoon = !isOverdue && value <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded inline-block ${className} ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-amber-600' : ''}`}
    >
      {formatDate(value)}
    </span>
  );
}

interface InlineEditNumberProps {
  value: number;
  onSave: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
}

/**
 * Inline number input with progress bar visualization
 */
export function InlineEditNumber({ value, onSave, min = 0, max = 100, suffix = '%', className = '' }: InlineEditNumberProps) {
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
    if (!isNaN(num) && num >= min && num <= max && num !== value) {
      onSave(num);
    } else {
      setEditValue(value.toString());
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-16 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    );
  }

  const progressColor = value >= 80 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 rounded p-1 flex items-center gap-2 ${className}`}
    >
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
        <div className={`h-full ${progressColor} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-medium min-w-[40px] text-right">{value}{suffix}</span>
    </div>
  );
}
