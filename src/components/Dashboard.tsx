import { useState } from 'react';
import { Calendar, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Project, Task, Team } from '../types';
import { DashboardCard } from './DashboardCard';
import { TeamSection } from './TeamSection';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const teams: Team[] = ['CE&S', 'Sales', 'Product', 'IT/Cyber', 'Marketing', 'Finance', 'Other Exec', 'Professional Services'];

export function Dashboard({ projects, tasks, onEditTask }: DashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | 'all'>('all');

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get project team mapping (projects can have multiple teams)
  const projectTeamMap = new Map<string, Team[]>();
  projects.forEach(p => {
    projectTeamMap.set(p.id, p.teams);
  });

  // Filter tasks by team
  const filteredTasks = selectedTeam === 'all' 
    ? tasks 
    : tasks.filter(t => {
        const teams = projectTeamMap.get(t.projectId);
        return teams?.includes(selectedTeam);
      });

  // Overdue tasks (not done)
  const overdueTasks = filteredTasks.filter(
    t => t.dueDate < now && t.status !== 'done'
  );

  // Due soon (within 7 days)
  const dueSoonTasks = filteredTasks.filter(
    t => t.dueDate >= now && t.dueDate <= sevenDaysFromNow && t.status !== 'done'
  );

  // High priority tasks not done
  const highPriorityTasks = filteredTasks.filter(
    t => t.priority === 'high' && t.status !== 'done'
  );

  // Needs leadership attention (overdue high priority OR high priority due within 3 days)
  const needsAttentionTasks = filteredTasks.filter(
    t => t.priority === 'high' && t.status !== 'done' && (
      t.dueDate < now || t.dueDate <= threeDaysFromNow
    )
  );

  // Completed this week
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedThisWeek = filteredTasks.filter(
    t => t.status === 'done' && t.createdAt >= oneWeekAgo
  );

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
          
          {/* Team Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedTeam('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTeam === 'all'
                  ? 'bg-[#0d3b66] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All Teams
            </button>
            {teams.map(team => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTeam === team
                    ? 'bg-[#0d3b66] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Needs Leadership Attention"
            count={needsAttentionTasks.length}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
          <DashboardCard
            title="Overdue"
            count={overdueTasks.length}
            icon={<Calendar className="w-5 h-5" />}
            color="orange"
          />
          <DashboardCard
            title="Due This Week"
            count={dueSoonTasks.length}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          <DashboardCard
            title="Completed This Week"
            count={completedThisWeek.length}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
        </div>

        {/* Leadership Attention Section */}
        {needsAttentionTasks.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Needs Leadership Attention
                </h3>
              </div>
              <div className="space-y-3">
                {needsAttentionTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {project && (
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{task.assignee}</span>
                            <span>•</span>
                            <span className={task.dueDate < now ? 'text-red-600 font-medium' : ''}>
                              Due {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {task.dueDate < now && ' (Overdue)'}
                            </span>
                            {project && (
                              <>
                                <span>•</span>
                                <span>{project.teams.join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Team Sections */}
        <div className="space-y-6">
          {selectedTeam === 'all' ? (
            teams.map(team => {
              const teamProjects = projects.filter(p => p.teams.includes(team));
              const teamTasks = tasks.filter(t => {
                const project = projects.find(p => p.id === t.projectId);
                return project?.teams.includes(team);
              });

              if (teamTasks.length === 0) return null;

              return (
                <TeamSection
                  key={team}
                  team={team}
                  projects={teamProjects}
                  tasks={teamTasks}
                  onEditTask={onEditTask}
                />
              );
            })
          ) : (
            <TeamSection
              team={selectedTeam}
              projects={projects.filter(p => p.teams.includes(selectedTeam))}
              tasks={filteredTasks}
              onEditTask={onEditTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}
