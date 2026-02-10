import { useEffect, useMemo } from 'react';
import './PmoHomePage.css';
import { Project, Task, calculateProgress, deriveStatus } from '../types';

interface HomePageViewProps {
  projects: Project[];
  tasks: Task[];
  onViewAllProjects: () => void;
}

export function HomePageView({ projects, tasks, onViewAllProjects }: HomePageViewProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    const elements = document.querySelectorAll('.pmo-home .reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const snapshot = useMemo(() => {
    const entries = projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const status = deriveStatus(projectTasks);
      const progress = calculateProgress(projectTasks);
      return { project, status, progress };
    });

    const counts = entries.reduce(
      (acc, entry) => {
        if (entry.status === 'on-track') acc.onTrack += 1;
        else if (entry.status === 'needs-attention') acc.attention += 1;
        else acc.atRisk += 1;
        acc.total += 1;
        return acc;
      },
      { onTrack: 0, attention: 0, atRisk: 0, total: 0 }
    );

    const list = [...entries]
      .sort((a, b) => a.project.dueDate.getTime() - b.project.dueDate.getTime())
      .slice(0, 5);

    return { counts, list };
  }, [projects, tasks]);

  return (
    <div className="pmo-home">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-left">
          <div className="hero-date">{todayLabel}</div>
          <h1>Clear vision.<br />Shared progress.</h1>
          <p className="hero-sub">Clarity starts here.</p>
          <div className="hero-mission">
            <div className="mission-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0BAFA6" strokeWidth="2" />
                <path d="M12 8v4l3 3" stroke="#0BAFA6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mission-text">
              When every team can see what we're working toward — and how we're doing — <strong>our customers feel the difference.</strong>
            </p>
          </div>
        </div>

        <aside className="snapshot">
          <div className="snapshot-header">
            <span className="snapshot-title">Company Snapshot</span>
            <span className="live-badge"><span className="live-dot"></span>Live</span>
          </div>
          <div className="snapshot-metrics">
            <div className="snap-metric">
              <div className="snap-val val-green">{snapshot.counts.onTrack}</div>
              <div className="snap-label">On Track</div>
            </div>
            <div className="snap-metric">
              <div className="snap-val val-orange">{snapshot.counts.attention}</div>
              <div className="snap-label">Needs Attn</div>
            </div>
            <div className="snap-metric">
              <div className="snap-val val-white">{snapshot.counts.total}</div>
              <div className="snap-label">Total</div>
            </div>
          </div>
          <div className="snapshot-projects">
            {snapshot.list.map(({ project, status, progress }) => {
              const dotClass = status === 'at-risk' ? 'dot-risk' : status === 'needs-attention' ? 'dot-mid' : 'dot-on';
              const pctClass = status === 'at-risk' ? 'pct-orange' : status === 'needs-attention' ? 'pct-blue' : 'pct-green';
              return (
                <div key={project.id} className="snap-project">
                  <div className={`snap-dot ${dotClass}`}></div>
                  <div className="snap-proj-name">{project.name}</div>
                  <div className="snap-dept">{project.department}</div>
                  <div className={`snap-pct ${pctClass}`}>{progress}%</div>
                </div>
              );
            })}
          </div>
          <div className="snapshot-footer">
            <button type="button" onClick={onViewAllProjects} className="snap-cta">View all projects →</button>
          </div>
        </aside>
      </section>

      <section className="pillars reveal">
        <div className="pillars-grid">
          <div className="pillar p1">
            <div className="pillar-num">01</div>
            <div className="pillar-title">Priorities</div>
            <div className="pillar-body">We all know what matters most — right now. Not just your team, but every team. Shared priorities mean shared direction, and shared direction is how silos break down.</div>
          </div>
          <div className="pillar p2">
            <div className="pillar-num">02</div>
            <div className="pillar-title">Progress</div>
            <div className="pillar-body">Honest, visible progress — across every department. When work is visible, teams can help each other. Blockers surface before they become crises. No one works in the dark.</div>
          </div>
          <div className="pillar p3">
            <div className="pillar-num">03</div>
            <div className="pillar-title">Proactive</div>
            <div className="pillar-body">Don't wait for problems to announce themselves. PULSE gives every team the signal to step in, offer support, or ask for help — before a project misses the mark and a customer feels it.</div>
          </div>
        </div>
      </section>

      <section className="mission-banner">
        <div className="mission-banner-inner reveal">
          <div className="mission-eyebrow">Our mission</div>
          <div className="mission-statement">Empowering the world through workforce performance.</div>
          <div className="mission-what">We equip critical industries with workforce performance solutions that improve safety, facilitate compliance, and deliver results. PULSE keeps us focused on that — every day, across every team.</div>
        </div>
      </section>

      <section className="values">
        <div className="values-header reveal">
          <h2>How we show up.</h2>
          <p>These aren't aspirations on a wall. They're how we make decisions, build trust, and deliver on our mission — empowering the world through workforce performance.</p>
        </div>
        <div className="values-grid">
          <div className="value-card reveal">
            <div className="value-icon vi-1">🚀</div>
            <div className="value-title">View obstacles as opportunities</div>
            <div className="value-body">State your intent and make it happen. When something is in the way, we don't wait for permission to go around it — we get creative and find a better path forward.</div>
          </div>
          <div className="value-card reveal delay-1">
            <div className="value-icon vi-2">✅</div>
            <div className="value-title">Own it</div>
            <div className="value-body">Take pride in what you do. Be accountable to yourself and to each other. PULSE makes our commitments visible — not as pressure, but as an expression of the pride we take in our work.</div>
          </div>
          <div className="value-card reveal delay-2">
            <div className="value-icon vi-3">🔍</div>
            <div className="value-title">Embrace curiosity</div>
            <div className="value-body">Be a learn-it-all, not a know-it-all — and have fun doing it. The best teams ask better questions, stay humble, and never stop looking for a smarter way to get there.</div>
          </div>
          <div className="value-card reveal delay-3">
            <div className="value-icon vi-4">🌱</div>
            <div className="value-title">Steward the future</div>
            <div className="value-body">Add value for our customers and the industries we serve. Make it scale. Every project in PULSE is a thread in a larger fabric — one that improves safety, facilitates compliance, and delivers real results.</div>
          </div>
        </div>
      </section>

      <section className="customer-section">
        <div className="reveal">
          <h2 className="customer-h2">What we do here<br />shows up out there.</h2>
          <p className="customer-intro">We equip critical industries with workforce performance solutions that improve safety, facilitate compliance, and deliver results. Every commitment we keep inside these walls is felt by the people we serve outside them.</p>
        </div>

        <div className="chain-grid reveal">
          <div className="chain-card">
            <div className="chain-card-icon">🏢</div>
            <div className="chain-card-title">Teams stay aligned</div>
            <div className="chain-card-body">Priorities are shared. Everyone knows what the company is working toward — this week, this quarter, this year. No one is pulling in a different direction.</div>
          </div>
          <div className="chain-divider">→</div>
          <div className="chain-card">
            <div className="chain-card-icon">🔗</div>
            <div className="chain-card-title">Work moves faster</div>
            <div className="chain-card-body">Blockers surface early. Departments help each other. Cross-team visibility means problems get solved before they slow us down.</div>
          </div>
          <div className="chain-divider">→</div>
          <div className="chain-card">
            <div className="chain-card-icon">💡</div>
            <div className="chain-card-title">We deliver what we promised</div>
            <div className="chain-card-body">Software that works. Services that follow through. When our internal commitments are clear and kept, what we build and deliver actually matches what our customers expected.</div>
          </div>
          <div className="chain-divider">→</div>
          <div className="chain-card chain-card-highlight">
            <div className="chain-card-icon">⭐</div>
            <div className="chain-card-title">Customers feel it</div>
            <div className="chain-card-body">Better coordination means better software, stronger service, and a partner that actually delivers on what it says it will do — in the industries where it really matters.</div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-left">
          <div className="nav-icon" style={{ width: 26, height: 26 }}>
            <svg viewBox="0 0 80 80" fill="none">
              <path
                d="M10 40 L20 40 L25 25 L30 55 L35 30 L40 45 L45 35 L50 50 L55 40 L70 40"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="footer-wordmark">PULSE</div>
            <div className="footer-by">by FOCUS Learning</div>
          </div>
        </div>
        <div className="footer-copy">© 2026 FOCUS Learning Corporation · Internal Use Only</div>
      </footer>
    </div>
  );
}
