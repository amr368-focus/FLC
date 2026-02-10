import { Plus, Search, LayoutGrid, List, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { Project, Task, calculateProgress, deriveStatus } from '../types';

interface TeamViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick: (project: Project) => void;
  onAddInitiative?: () => void;
}

const statusConfig = {
  'at-risk': { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-600' },
  'needs-attention': { label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  'on-track': { label: 'On Track', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-600' },
};

export function TeamView({ projects, tasks, onProjectClick, onAddInitiative }: TeamViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return calculateProgress(projectTasks);
  };

  const getProjectStatus = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return deriveStatus(projectTasks);
  };

  // Filter for cross-departmental projects (those with a team)
  const teamProjects = projects.filter(p => p.team);

  const filteredProjects = teamProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getProjectStatus(project.id) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Cross-Departmental Initiatives</h1>
            <p className="text-sm text-gray-600 mt-1">{filteredProjects.length} initiatives</p>
          </div>
          <button
            className="btn-teal flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm"
            onClick={() => onAddInitiative?.()}
          >
            <Plus className="w-4 h-4" />
            New Initiative
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search initiatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="on-track">On Track</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="at-risk">At Risk</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
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
          </div>
        </div>

        {/* Initiatives Display */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700 uppercase tracking-wider">
              <div className="col-span-4">Initiative Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-2">Progress</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No initiatives found
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const status = getProjectStatus(project.id);
                  const progress = getProjectProgress(project.id);
                  const config = statusConfig[status];

                  return (
                    <div
                      key={project.id}
                      onClick={() => onProjectClick(project)}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          {project.isKeyInitiative && <span>⭐</span>}
                          <div>
                            <div className="font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-1">{project.description}</div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                          {config.label}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                            {project.owner.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm text-gray-900">{project.owner}</span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: status === 'at-risk' ? '#EF4444' : status === 'needs-attention' ? '#F59E0B' : '#10B981',
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[3rem]">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const status = getProjectStatus(project.id);
              const progress = getProjectProgress(project.id);
              const config = statusConfig[status];
              
              return (
                <div
                  key={project.id}
                  onClick={() => onProjectClick(project)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    {project.isKeyInitiative && <span className="text-lg">⭐</span>}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ml-auto`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                      {config.label}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden mr-3">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: status === 'at-risk' ? '#EF4444' : status === 'needs-attention' ? '#F59E0B' : '#10B981',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{progress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{project.owner}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      {project.team || project.department}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No initiatives found</p>
          </div>
        )}
      </div>
    </div>
  );
}
