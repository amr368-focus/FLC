import { Menu } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  project: Project | undefined;
  onToggleSidebar: () => void;
  view: 'dashboard' | 'board';
}

export function Header({ project, onToggleSidebar, view }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        {view === 'dashboard' ? (
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        ) : project ? (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
            <span className="text-sm text-gray-500">• {project.teams.join(', ')}</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
