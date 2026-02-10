import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Project } from '../types';

interface ProjectListModalProps {
  projects: Project[];
  title: string;
  onClose: () => void;
  onProjectClick: (project: Project) => void;
}

const statusConfig = {
  'at-risk': { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-600' },
  'needs-attention': { label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  'on-track': { label: 'On Track', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-600' },
};

export function ProjectListModal({ projects, title, onClose, onProjectClick }: ProjectListModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredProjects.length} projects</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-200px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const config = statusConfig[project.status];
              
              return (
                <div
                  key={project.id}
                  onClick={() => {
                    onProjectClick(project);
                    onClose();
                  }}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
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

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden mr-3">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${project.progress}%`,
                            backgroundColor: project.status === 'at-risk' ? '#EF4444' : project.status === 'needs-attention' ? '#F59E0B' : '#10B981',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{project.progress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{project.owner}</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      {project.department}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No projects found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
