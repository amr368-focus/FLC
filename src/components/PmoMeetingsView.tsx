import { useMemo, useState, useEffect, useRef } from 'react';
import { Calendar, Users, Plus } from 'lucide-react';
import { Department, PmoMeeting } from '../types';

interface PmoMeetingsViewProps {
  meetings: PmoMeeting[];
  selectedMeetingId: string | null;
  onSelectMeeting: (id: string) => void;
  onCreateMeeting: () => void;
  onSaveMeeting: (meeting: PmoMeeting) => void;
  onMinimize?: () => void;
}

const departments: Array<Department | 'All'> = [
  'All',
  'Professional Services',
  'Sales',
  'Marketing',
  'CE&S',
  'Finance',
  'Product',
  'IT-Cybersecurity',
  'Other Exec'
];

export function PmoMeetingsView({
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onCreateMeeting,
  onSaveMeeting,
  onMinimize,
}: PmoMeetingsViewProps) {
  const sortedMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [meetings]);

  const selectedMeeting = sortedMeetings.find(m => m.id === selectedMeetingId) || null;

  const [draft, setDraft] = useState<PmoMeeting | null>(selectedMeeting);
  const autosaveTimer = useRef<number | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    setDraft(selectedMeeting);
    initialLoad.current = true;
  }, [selectedMeeting]);

  useEffect(() => {
    if (!draft) return;
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = window.setTimeout(() => {
      onSaveMeeting(draft);
    }, 600);

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [draft, onSaveMeeting]);

  const updateDraft = (updates: Partial<PmoMeeting>) => {
    if (!draft) return;
    setDraft({ ...draft, ...updates });
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden flex">
      {/* List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">PMO Meetings</h1>
            <p className="text-xs text-gray-500">Historical view and notes</p>
          </div>
          <button
            onClick={onCreateMeeting}
            className="btn-teal p-2 rounded-lg transition-colors"
            title="New PMO meeting"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {sortedMeetings.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No meetings yet.</div>
          ) : (
            sortedMeetings.map(meeting => (
              <button
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  meeting.id === selectedMeetingId ? 'bg-[#E6F7F5]' : ''
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {meeting.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {meeting.department} • {meeting.attendees ? meeting.attendees.split(',').length : 0} attendees
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-auto">
        {!draft ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a PMO meeting to view details.
          </div>
        ) : (
          <div className="p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">PMO Meeting</h2>
                <p className="text-sm text-gray-500">Capture outcomes and decisions</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Autosaves</span>
                {onMinimize && (
                  <button
                    onClick={onMinimize}
                    className="btn-teal px-3 py-2 rounded-lg transition-colors"
                  >
                    Minimize
                  </button>
                )}
                <button
                  onClick={onCreateMeeting}
                  className="btn-teal px-3 py-2 rounded-lg transition-colors"
                >
                  New Meeting
                </button>
                <button
                  onClick={() => onSaveMeeting(draft)}
                  className="btn-teal px-4 py-2 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                <select
                  value={draft.department}
                  onChange={(e) => updateDraft({ department: e.target.value as Department | 'All' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of meeting</label>
                <input
                  type="date"
                  value={draft.date.toISOString().split('T')[0]}
                  onChange={(e) => updateDraft({ date: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Attendees</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={draft.attendees}
                    onChange={(e) => updateDraft({ attendees: e.target.value })}
                    placeholder="Comma-separated names"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Agenda</h3>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li>1. Quick wins and blockers since last meeting</li>
                    <li>2. Portfolio health review (on track, attention, at risk)</li>
                    <li>3. Items requiring leadership decisions</li>
                    <li>4. Upcoming deadlines and dependencies</li>
                    <li>5. Action items with owners and dates</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Team status</label>
                  <textarea
                    value={draft.teamStatus}
                    onChange={(e) => updateDraft({ teamStatus: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Items requiring attention</label>
                  <textarea
                    value={draft.itemsRequiringAttention}
                    onChange={(e) => updateDraft({ itemsRequiringAttention: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tasks coming due</label>
                  <textarea
                    value={draft.tasksComingDue}
                    onChange={(e) => updateDraft({ tasksComingDue: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Action items assigned</label>
                  <textarea
                    value={draft.actionItemsAssigned}
                    onChange={(e) => updateDraft({ actionItemsAssigned: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
              </div>

              <div className="space-y-4">
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meeting notes and discussion</label>
                  <textarea
                    value={draft.meetingNotes}
                    onChange={(e) => updateDraft({ meetingNotes: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Decisions made</label>
                  <textarea
                    value={draft.decisionsMade}
                    onChange={(e) => updateDraft({ decisionsMade: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
                <section>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Parking lot</label>
                  <textarea
                    value={draft.parkingLot}
                    onChange={(e) => updateDraft({ parkingLot: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
