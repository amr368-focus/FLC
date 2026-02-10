import { useState } from 'react';
import { Plus, Search, Calendar, User, LayoutGrid, List, GanttChartSquare } from 'lucide-react';
import { Project, Department, Task, calculateProgress, deriveStatus } from '../types';
import { downloadCsvFromApi } from '../utils/download';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick: (project: Project) => void;
  onAddProject: () => void;
}

const statusConfig = {
  'at-risk': { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-600' },
  'needs-attention': { label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  'on-track': { label: 'On Track', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-600' },
};

const departments: Department[] = ['Professional Services', 'Sales', 'Marketing', 'CE&S', 'Finance', 'Product', 'IT-Cybersecurity', 'Other Exec'];

export function ProjectsView({ projects, tasks, onProjectClick, onAddProject }: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('grid');
  const [isExporting, setIsExporting] = useState(false);

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return calculateProgress(projectTasks);
  };

  const getProjectStatus = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    return deriveStatus(projectTasks);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getProjectStatus(project.id) === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || project.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-600 mt-1">{filteredProjects.length} of {projects.length} projects</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                try{
                  setIsExporting(true);
                  await downloadCsvFromApi('/api/export/csv', 'pmo-export.csv');
                }catch(err){
                  console.error(err);
                }finally{setIsExporting(false)}
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isExporting}
            >
              Export CSV
            </button>

            <button
              onClick={onAddProject}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
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

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
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

        {/* Projects Display */}
        {viewMode === 'grid' ? (
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
                      {project.department}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
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
                      {project.department}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
