import { Calendar, ExternalLink, Minus, Plus, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PmoMeeting } from '../types';

interface PmoMeetingDockProps {
  isOpen: boolean;
  meetings: PmoMeeting[];
  selectedMeetingId: string | null;
  onSelectMeeting: (id: string) => void;
  onCreateMeeting: () => void;
  onUpdateMeeting: (id: string, updates: Partial<PmoMeeting>) => void;
  onSaveMeeting: (meeting: PmoMeeting) => void;
  onSnap: (anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClose: () => void;
  onOpenFull: () => void;
}

export function PmoMeetingDock({
  isOpen,
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onCreateMeeting,
  onUpdateMeeting,
  onSaveMeeting,
  onSnap,
  anchor,
  onClose,
  onOpenFull,
}: PmoMeetingDockProps) {
  if (!isOpen) return null;

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!position) {
      const width = 360;
      const height = 520;
      const margin = 24;
      const x = anchor.endsWith('right')
        ? Math.max(margin, window.innerWidth - width - margin)
        : margin;
      const y = anchor.startsWith('bottom')
        ? Math.max(margin, window.innerHeight - height - margin)
        : margin;
      setPosition({ x, y });
    }
  }, [position, anchor]);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!isDragging.current || !dragOffset.current) return;
      setPosition({
        x: Math.max(12, event.clientX - dragOffset.current.x),
        y: Math.max(12, event.clientY - dragOffset.current.y),
      });
    };

    const handleUp = () => {
      if (position) {
        const width = 360;
        const height = 520;
        const margin = 24;
        const centerX = position.x + width / 2;
        const centerY = position.y + height / 2;
        const snapAnchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' =
          centerY < window.innerHeight / 2
            ? (centerX < window.innerWidth / 2 ? 'top-left' : 'top-right')
            : (centerX < window.innerWidth / 2 ? 'bottom-left' : 'bottom-right');

        const x = snapAnchor.endsWith('right')
          ? Math.max(margin, window.innerWidth - width - margin)
          : margin;
        const y = snapAnchor.startsWith('bottom')
          ? Math.max(margin, window.innerHeight - height - margin)
          : margin;
        setPosition({ x, y });
        onSnap(snapAnchor);
      }
      isDragging.current = false;
      dragOffset.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const activeMeetingId = selectedMeetingId || meetings[0]?.id || null;
  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || null;

  if (!activeMeeting) return null;

  return (
    <div
      className="fixed w-[360px] h-[520px] bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden flex flex-col"
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 cursor-move"
        onMouseDown={(event) => {
          if (!position) return;
          isDragging.current = true;
          dragOffset.current = { x: event.clientX - position.x, y: event.clientY - position.y };
        }}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Calendar className="w-4 h-4 text-gray-500" />
          PMO Notes
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateMeeting}
            className="btn-teal p-1 rounded transition-colors"
            title="New meeting"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenFull}
            className="btn-teal p-1 rounded transition-colors"
            title="Open full view"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-teal p-1 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">Meeting</label>
          <select
            value={activeMeeting.id}
            onChange={(e) => onSelectMeeting(e.target.value)}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            {meetings.map(meeting => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {meeting.department}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Department</label>
            <input
              value={activeMeeting.department}
              readOnly
              className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Attendees</label>
            <input
              value={activeMeeting.attendees}
              onChange={(e) => onUpdateMeeting(activeMeeting.id, { attendees: e.target.value })}
              className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Comma-separated"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">Team status</label>
          <textarea
            value={activeMeeting.teamStatus}
            onChange={(e) => onUpdateMeeting(activeMeeting.id, { teamStatus: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">Items requiring attention</label>
          <textarea
            value={activeMeeting.itemsRequiringAttention}
            onChange={(e) => onUpdateMeeting(activeMeeting.id, { itemsRequiringAttention: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">Meeting notes</label>
          <textarea
            value={activeMeeting.meetingNotes}
            onChange={(e) => onUpdateMeeting(activeMeeting.id, { meetingNotes: e.target.value })}
            rows={3}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-600 mb-1">Decisions made</label>
          <textarea
            value={activeMeeting.decisionsMade}
            onChange={(e) => onUpdateMeeting(activeMeeting.id, { decisionsMade: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => onSaveMeeting(activeMeeting)}
          className="btn-teal inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-teal px-3 py-2 text-xs rounded-lg transition-colors"
        >
          Minimize
        </button>
      </div>
    </div>
  );
}
