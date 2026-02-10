import { useState } from 'react';
import { Plus, FolderKanban, Trash2, X, LayoutDashboard, Kanban } from 'lucide-react';
import { Project, Team } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string, color: string, team: string) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  view: 'dashboard' | 'board';
  onViewChange: (view: 'dashboard' | 'board') => void;
}

const colors = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#14B8A6'
];

const teams: Team[] = ['CE&S', 'Sales', 'Product', 'IT/Cyber', 'Marketing', 'Finance', 'Other Exec', 'Professional Services'];

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  isOpen,
  view,
  onViewChange,
}: SidebarProps) {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedTeam, setSelectedTeam] = useState<Team>('Product');

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim(), selectedColor, selectedTeam);
      setNewProjectName('');
      setSelectedColor(colors[0]);
      setSelectedTeam('Product');
      setIsAddingProject(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
      </div>

      {/* View Switcher */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'dashboard'
                ? 'bg-[#0d3b66] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('board')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'board'
                ? 'bg-[#0d3b66] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Kanban className="w-4 h-4" />
            Board
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {projects.map(project => (
            <div
              key={project.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedProjectId === project.id && view === 'board'
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {project.teams.join(', ')}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>

        {isAddingProject ? (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
              autoFocus
            />
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Select team:</p>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value as Team)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
              >
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Select color:</p>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddProject}
                className="flex-1 px-3 py-1.5 bg-[#0d3b66] text-white text-sm rounded-md hover:bg-[#0a2d4d]"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingProject(false);
                  setNewProjectName('');
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingProject(true)}
            className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>
    </aside>
  );
}
