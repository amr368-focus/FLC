import { Building2, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Department } from '../types';

interface TopBarProps {
  currentView: string;
  onDepartmentSelect: (dept: Department) => void;
}

const departments: Department[] = ['Professional Services', 'Sales', 'Marketing', 'CE&S', 'Finance', 'Product', 'IT-Cybersecurity', 'Other Exec'];

export function TopBar({ currentView, onDepartmentSelect }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium text-gray-900">
          {currentView === 'team'
            ? 'Team View'
            : currentView === 'home'
            ? 'Home'
            : currentView === 'workbreakdown'
            ? 'All work'
            : currentView === 'timeline'
            ? 'Portfolio Timeline'
            : currentView === 'pmo'
            ? 'PMO Meetings'
            : currentView}
        </h1>
      </div>

      {/* Quick Department Navigation */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Building2 className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Jump to Department</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[200px]">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => {
                  onDepartmentSelect(dept);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
