import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { Project, Department, ProjectStatus, CompanyGoal } from '../types';

interface InitiativeModalProps {
  initiative: Project | null;
  goals: CompanyGoal[];
  onSave: (initiative: Omit<Project, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const departments: Department[] = [
  'Professional Services',
  'Sales',
  'Marketing',
  'CE&S',
  'Finance',
  'Product',
  'IT-Cybersecurity',
  'Other Exec'
];

const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'on-track', label: 'On Track', color: 'bg-green-100 text-green-700' },
  { value: 'needs-attention', label: 'Needs Attention', color: 'bg-orange-100 text-orange-700' },
  { value: 'at-risk', label: 'At Risk', color: 'bg-red-100 text-red-700' },
];

const colorOptions = [
  '#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6'
];

export function InitiativeModal({ initiative, goals, onSave, onClose, onDelete }: InitiativeModalProps) {
  const [name, setName] = useState(initiative?.name || '');
  const [description, setDescription] = useState(initiative?.description || '');
  const [department, setDepartment] = useState<Department>(initiative?.department || 'Professional Services');
  const [team, setTeam] = useState(initiative?.team || '');
  const [status, setStatus] = useState<ProjectStatus>(initiative?.status || 'on-track');
  const [owner, setOwner] = useState(initiative?.owner || '');
  const [dueDate, setDueDate] = useState(
    initiative?.dueDate ? initiative.dueDate.toISOString().split('T')[0] : ''
  );
  const [isKeyInitiative, setIsKeyInitiative] = useState(initiative?.isKeyInitiative || false);
  const [color, setColor] = useState(initiative?.color || '#8B5CF6');
  const [goalId, setGoalId] = useState(initiative?.goalId || '');

  useEffect(() => {
    if (initiative) {
      setName(initiative.name);
      setDescription(initiative.description);
      setDepartment(initiative.department);
      setTeam(initiative.team || '');
      setStatus(initiative.status);
      setOwner(initiative.owner);
      setDueDate(initiative.dueDate.toISOString().split('T')[0]);
      setIsKeyInitiative(initiative.isKeyInitiative || false);
      setColor(initiative.color);
      setGoalId(initiative.goalId || '');
    }
  }, [initiative]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      department,
      team: team || undefined,
      status,
      progress: initiative?.progress || 0,
      owner,
      dueDate: new Date(dueDate),
      isKeyInitiative,
      color,
      goalId: goalId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initiative?.id ? 'Edit Initiative' : 'New Initiative'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="initiative-form"
              className="px-3 py-1.5 text-sm bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2d4d] transition-colors"
            >
              {initiative?.id ? 'Save' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form id="initiative-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initiative Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter initiative name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe this initiative"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Team name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner *
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Initiative owner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Linked Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linked Company Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No linked goal</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Initiative Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsKeyInitiative(!isKeyInitiative)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isKeyInitiative 
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star className={`w-4 h-4 ${isKeyInitiative ? 'fill-yellow-500' : ''}`} />
              {isKeyInitiative ? 'Key Initiative' : 'Mark as Key Initiative'}
            </button>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between sticky bottom-0 bg-white -mx-6 px-6 py-4 border-t border-gray-200">
            <div>
              {initiative?.id && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this initiative?')) {
                      onDelete(initiative.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete Initiative
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-teal px-4 py-2 rounded-lg transition-colors"
              >
                {initiative?.id ? 'Save' : 'Create Initiative'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
