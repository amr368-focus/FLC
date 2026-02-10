import { useState } from 'react';
import { Plus, Search, Calendar, User, LayoutGrid, List, GanttChartSquare, ChevronRight, ChevronDown, CheckSquare, CheckCircle2 } from 'lucide-react';
import { Project, Department, Task, calculateProgress, deriveStatus } from '../types';
import { downloadCsvFromApi } from '../utils/download';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick: (project: Project) => void;
  onAddProject: () => void;
}

const statusConfig = {
  'at-risk': { label: 'At Risk', textColor: '#dc2626', bgColor: '#fef2f2', dotColor: '#dc2626' },
  'needs-attention': { label: 'Needs Attention', textColor: '#ea580c', bgColor: '#fff7ed', dotColor: '#f97316' },
  'on-track': { label: 'On Track', textColor: '#16a34a', bgColor: '#f0fdf4', dotColor: '#16a34a' },
};

const taskStatusConfig = {
  'todo': { label: 'To Do', bgColor: '#64748b', textColor: '#ffffff' },
  'in-progress': { label: 'In Progress', bgColor: '#2563eb', textColor: '#ffffff' },
  'done': { label: 'Done', bgColor: '#059669', textColor: '#ffffff' },
};

const departments: Department[] = ['Professional Services', 'Sales', 'Marketing', 'CE&S', 'Finance', 'Product', 'IT-Cybersecurity', 'Other Exec'];

export function ProjectsView({ projects, tasks, onProjectClick, onAddProject }: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('grid');
  const [isExporting, setIsExporting] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

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
            <h1 className="text-2xl font-semibold text-gray-900">Cross-Departmental Initiatives</h1>
            <p className="text-sm text-gray-600 mt-1">{filteredProjects.length} initiatives</p>
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
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ml-auto"
                      style={{ color: config.textColor, backgroundColor: config.bgColor }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }}></div>
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
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Initiative / Task</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-1">Progress</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredProjects.map((project) => {
                const status = getProjectStatus(project.id);
                const progress = getProjectProgress(project.id);
                const config = statusConfig[status];
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const isExpanded = expandedProjects.has(project.id);

                return (
                  <div key={project.id}>
                    {/* Initiative Row */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 items-center">
                      <div className="col-span-5 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProject(project.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <div
                          className="cursor-pointer"
                          onClick={() => onProjectClick(project)}
                        >
                          <div className="flex items-center gap-2">
                            {project.isKeyInitiative && <span>⭐</span>}
                            <span className="font-medium text-gray-900">{project.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{project.department}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ color: config.textColor, backgroundColor: config.bgColor }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dotColor }}></div>
                          {config.label}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        {project.owner}
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {project.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
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
                    </div>

                    {/* Tasks (when expanded) */}
                    {isExpanded && projectTasks.map((task) => {
                      const taskConfig = taskStatusConfig[task.status];
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 hover:bg-gray-100/50 items-center"
                        >
                          <div className="col-span-5 flex items-center gap-2 pl-8">
                            <CheckSquare className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{task.name}</span>
                          </div>
                          <div className="col-span-2">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: taskConfig.bgColor, color: taskConfig.textColor }}
                            >
                              {taskConfig.label}
                            </span>
                          </div>
                          <div className="col-span-2 text-sm text-gray-600">
                            {task.assignee || '-'}
                          </div>
                          <div className="col-span-2 text-sm text-gray-600">
                            {task.dueDate ? task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                          </div>
                          <div className="col-span-1 text-sm text-gray-600">
                            {task.status === 'done' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Gantt View Placeholder */
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <GanttChartSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Gantt view coming soon</p>
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
