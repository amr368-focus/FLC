import React, { useState } from 'react';
import { Target, Plus, ChevronRight, ChevronDown, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { CompanyGoal, KeyResult, Project, Task } from '../types';

interface GoalsViewProps {
  goals: CompanyGoal[];
  projects: Project[];
  tasks: Task[];
  onAddGoal: (goal: Omit<CompanyGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goalId: string, updates: Partial<CompanyGoal>) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddKeyResult: (goalId: string, keyResult: Omit<KeyResult, 'id'>) => void;
  onUpdateKeyResult: (goalId: string, krId: string, updates: Partial<KeyResult>) => void;
  onDeleteKeyResult: (goalId: string, krId: string) => void;
  onProjectClick: (project: Project) => void;
}

export function GoalsView({
  goals,
  projects,
  tasks,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddKeyResult,
  onUpdateKeyResult,
  onDeleteKeyResult,
  onProjectClick,
}: GoalsViewProps) {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set(goals.map(g => g.id)));
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [addingKRToGoal, setAddingKRToGoal] = useState<string | null>(null);

  // New goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalOwner, setNewGoalOwner] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  // New key result form state
  const [newKRName, setNewKRName] = useState('');
  const [newKRTarget, setNewKRTarget] = useState('');
  const [newKRUnit, setNewKRUnit] = useState('');
  const [newKROwner, setNewKROwner] = useState('');

  const toggleGoal = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleCreateGoal = () => {
    if (!newGoalName.trim()) return;
    onAddGoal({
      name: newGoalName,
      description: newGoalDesc,
      owner: newGoalOwner,
      targetDate: new Date(newGoalDate || Date.now()),
      status: 'on-track',
      keyResults: [],
    });
    setNewGoalName('');
    setNewGoalDesc('');
    setNewGoalOwner('');
    setNewGoalDate('');
    setIsAddingGoal(false);
  };

  const handleCreateKR = (goalId: string) => {
    if (!newKRName.trim()) return;
    onAddKeyResult(goalId, {
      goalId,
      name: newKRName,
      targetValue: Number(newKRTarget) || 100,
      currentValue: 0,
      unit: newKRUnit || '%',
      owner: newKROwner,
      dueDate: new Date(),
    });
    setNewKRName('');
    setNewKRTarget('');
    setNewKRUnit('');
    setNewKROwner('');
    setAddingKRToGoal(null);
  };

  const getLinkedProjects = (goalId: string) => {
    return projects.filter(p => p.goalId === goalId);
  };

  const calculateGoalProgress = (goal: CompanyGoal) => {
    if (goal.keyResults.length === 0) {
      // Fall back to linked projects progress
      const linkedProjects = getLinkedProjects(goal.id);
      if (linkedProjects.length === 0) return 0;
      const totalProgress = linkedProjects.reduce((sum, p) => {
        const projectTasks = tasks.filter(t => t.projectId === p.id);
        const completed = projectTasks.filter(t => t.status === 'done').length;
        return sum + (projectTasks.length === 0 ? 0 : Math.round((completed / projectTasks.length) * 100));
      }, 0);
      return Math.round(totalProgress / linkedProjects.length);
    }
    const totalProgress = goal.keyResults.reduce((sum, kr) => {
      return sum + Math.min((kr.currentValue / kr.targetValue) * 100, 100);
    }, 0);
    return Math.round(totalProgress / goal.keyResults.length);
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Company Goals & OKRs</h1>
            <p className="text-sm text-gray-600">Set and track company-level objectives and key results</p>
          </div>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="btn-teal flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name *</label>
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Increase Revenue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={newGoalOwner}
                  onChange={(e) => setNewGoalOwner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Goal owner"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateGoal}
                className="btn-teal px-4 py-2 rounded-lg"
              >
                Create Goal
              </button>
              <button
                onClick={() => setIsAddingGoal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-sm text-gray-600 mb-4">Create company goals to align your initiatives.</p>
              <button
                onClick={() => setIsAddingGoal(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first goal →
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const isExpanded = expandedGoals.has(goal.id);
              const linkedProjects = getLinkedProjects(goal.id);
              const progress = calculateGoalProgress(goal);

              return (
                <div key={goal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Goal Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleGoal(goal.id)}
                          className="p-1 hover:bg-gray-100 rounded mt-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.status === 'on-track' ? 'bg-green-100 text-green-700' :
                              goal.status === 'at-risk' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.status === 'on-track' ? 'On Track' : goal.status === 'at-risk' ? 'At Risk' : 'Completed'}
                            </span>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1 ml-8">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 ml-8 text-sm text-gray-500">
                            <span>Owner: {goal.owner}</span>
                            <span>•</span>
                            <span>Due: {goal.targetDate.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{linkedProjects.length} linked initiative{linkedProjects.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Progress */}
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                          </div>
                          <div className="w-32 h-2 bg-gray-100 rounded-full mt-1">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: progress >= 70 ? '#10B981' : progress >= 40 ? '#F59E0B' : '#EF4444'
                              }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingGoal(goal.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => onDeleteGoal(goal.id)}
                            className="p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {/* Key Results */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Key Results</h4>
                          <button
                            onClick={() => setAddingKRToGoal(goal.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Key Result
                          </button>
                        </div>

                        {addingKRToGoal === goal.id && (
                          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  value={newKRName}
                                  onChange={(e) => setNewKRName(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Key result name"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={newKRTarget}
                                  onChange={(e) => setNewKRTarget(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Target"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={newKRUnit}
                                  onChange={(e) => setNewKRUnit(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="Unit (%, $, etc)"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCreateKR(goal.id)}
                                className="btn-teal px-3 py-1.5 text-sm rounded-lg"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => setAddingKRToGoal(null)}
                                className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {goal.keyResults.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No key results defined. Add key results to track measurable progress.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {goal.keyResults.map((kr) => {
                              const krProgress = Math.min((kr.currentValue / kr.targetValue) * 100, 100);
                              return (
                                <div key={kr.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{kr.name}</span>
                                    <span className="text-sm text-gray-600">
                                      {kr.currentValue} / {kr.targetValue} {kr.unit}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                      <div
                                        className="h-full rounded-full bg-blue-600 transition-all"
                                        style={{ width: `${krProgress}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                                      {Math.round(krProgress)}%
                                    </span>
                                    <input
                                      type="number"
                                      value={kr.currentValue}
                                      onChange={(e) => onUpdateKeyResult(goal.id, kr.id, { currentValue: Number(e.target.value) })}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                      min="0"
                                      max={kr.targetValue}
                                    />
                                    <button
                                      onClick={() => onDeleteKeyResult(goal.id, kr.id)}
                                      className="p-1 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Linked Initiatives */}
                      {linkedProjects.length > 0 && (
                        <div className="p-6 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-4">Linked Initiatives</h4>
                          <div className="space-y-2">
                            {linkedProjects.map((project) => {
                              const projectTasks = tasks.filter(t => t.projectId === project.id);
                              const completed = projectTasks.filter(t => t.status === 'done').length;
                              const projectProgress = projectTasks.length > 0 
                                ? Math.round((completed / projectTasks.length) * 100)
                                : 0;
                              
                              return (
                                <div
                                  key={project.id}
                                  onClick={() => onProjectClick(project)}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: project.color }}
                                    />
                                    <span className="font-medium text-gray-900">{project.name}</span>
                                    <span className="text-sm text-gray-500">{project.department}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${projectProgress}%`,
                                          backgroundColor: project.color
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 w-10">
                                      {projectProgress}%
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
