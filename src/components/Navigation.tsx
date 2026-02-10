import { Department } from '../types';

interface NavigationProps {
  currentView: 'home' | 'dashboard' | 'departments' | 'team' | 'portfolio' | 'goals' | 'workbreakdown' | 'timeline' | 'pmo';
  onViewChange: (view: 'home' | 'dashboard' | 'departments' | 'team' | 'portfolio' | 'goals' | 'workbreakdown' | 'timeline' | 'pmo') => void;
  onDepartmentSelect: (dept: Department) => void;
}

export function Navigation({ currentView, onViewChange, onDepartmentSelect }: NavigationProps) {
  return (
    <nav className="h-16 w-full flex items-center justify-between px-6 gap-4" style={{ backgroundColor: '#10285A' }}>
      <button onClick={() => onViewChange('home')} className="flex items-center gap-3 hover:opacity-90">
        <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1A4481', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0BAFA6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#pulseGradient)" />
          <path d="M 20 50 L 32 50 L 38 35 L 43 65 L 48 40 L 53 55 L 58 45 L 63 60 L 68 50 L 80 50"
                fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        </svg>
        <span className="text-lg font-bold text-white" style={{ fontFamily: 'Archivo, sans-serif', letterSpacing: '-0.5px' }}>PULSE</span>
      </button>

      <div className="flex flex-1 items-center justify-center gap-2 min-w-0">
        <NavItem
          label="Home"
          active={currentView === 'home'}
          onClick={() => onViewChange('home')}
        />
        <NavItem
          label="Dashboard"
          active={currentView === 'dashboard'}
          onClick={() => onViewChange('dashboard')}
        />
        <NavItem
          label="All Work"
          active={currentView === 'workbreakdown'}
          onClick={() => onViewChange('workbreakdown')}
        />
        <NavItem
          label="Departments"
          active={currentView === 'departments'}
          onClick={() => onViewChange('departments')}
        />
        <NavItem
          label="Cross Functional Projects"
          active={currentView === 'portfolio'}
          onClick={() => onViewChange('portfolio')}
        />
        <NavItem
          label="Timeline"
          active={currentView === 'timeline'}
          onClick={() => onViewChange('timeline')}
        />
        <NavItem
          label="Goals"
          active={currentView === 'goals'}
          onClick={() => onViewChange('goals')}
        />
        <NavItem
          label="PMO Meetings"
          active={currentView === 'pmo'}
          onClick={() => onViewChange('pmo')}
        />
      </div>
    </nav>
  );
}

interface NavItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap shrink-0"
      style={active
        ? { backgroundColor: '#0BAFA6', color: '#ffffff', fontWeight: 600 }
        : { color: 'rgba(255,255,255,0.75)' }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'white'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
    >
      {label}
    </button>
  );
}
