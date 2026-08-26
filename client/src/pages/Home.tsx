/**
 * Field Console page: decentralized agents remain visually central; telemetry supports mission decisions.
 */
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronDown,
  Crosshair,
  Gauge,
  Grid3X3,
  Info,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Route,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Strategy = "Frontier Sweep" | "Adaptive Relay";
type EventItem = { kind: "success" | "warning" | "error"; time: string; text: string };

type Agent = {
  id: string;
  baseX: number;
  baseY: number;
  phase: number;
  failed: boolean;
};

const TOTAL_AGENTS = 48;
const targets = [
  { x: 26, y: 65, label: "T-01" },
  { x: 69, y: 30, label: "T-02" },
  { x: 81, y: 76, label: "T-03" },
];

const makeAgents = (): Agent[] =>
  Array.from({ length: TOTAL_AGENTS }, (_, index) => {
    const column = index % 8;
    const row = Math.floor(index / 8);
    return {
      id: `R-${String(index + 1).padStart(2, "0")}`,
      baseX: 12 + column * 11 + ((row % 2) * 2.2),
      baseY: 13 + row * 14 + ((column % 3) * 1.3),
      phase: index * 0.54,
      failed: false,
    };
  });

const navItems = [
  { label: "Mission", icon: Crosshair, active: true },
  { label: "Experiments", icon: BarChart3 },
  { label: "Behaviors", icon: Route },
  { label: "Agent registry", icon: Bot },
  { label: "System", icon: Settings2 },
];

function LogoMark() {
  return (
    <svg className="brand-logo" viewBox="0 0 40 40" role="img" aria-label="SwarmMind relay mark">
      <path d="M9 26.7 19.7 20 26.6 10.4" fill="none" stroke="#4BE4C1" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="9" cy="26.7" r="4.2" fill="#4BE4C1" />
      <circle cx="27.4" cy="10.2" r="4.2" fill="#4BE4C1" opacity=".74" />
      <path d="m18 16.2 9.3 3.8-7 7.2Z" fill="#d5fff4" />
    </svg>
  );
}

function formatTime(tick: number) {
  const seconds = Math.floor(tick / 3);
  return `00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function Home() {
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(134);
  const [agentCount, setAgentCount] = useState(500);
  const [failureRate, setFailureRate] = useState(10);
  const [agents, setAgents] = useState<Agent[]>(makeAgents);
  const [strategy, setStrategy] = useState<Strategy>("Adaptive Relay");
  const [events, setEvents] = useState<EventItem[]>([
    { kind: "success", time: "00:00:39", text: "T-01 detected by R-12; local relay confirmed." },
    { kind: "warning", time: "00:00:32", text: "Northwest sector entering shared coverage." },
    { kind: "success", time: "00:00:18", text: "Distributed search partitions initialized." },
  ]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 340);
    return () => window.clearInterval(interval);
  }, [running]);

  const coverage = Math.min(96, Math.round(48 + tick * 0.3));
  const discovered = tick > 185 ? 3 : tick > 145 ? 2 : tick > 112 ? 1 : 0;
  const activeAgents = agents.filter((agent) => !agent.failed).length;
  const energy = Math.max(53, Math.round(79 - tick * 0.105));
  const formattedTime = formatTime(tick);

  const visibleAgents = useMemo(
    () =>
      agents.map((agent, index) => {
        const phase = agent.phase + tick * 0.065;
        return {
          ...agent,
          x: Math.max(6, Math.min(94, agent.baseX + Math.sin(phase) * 4.3 + Math.cos(phase * 0.4) * 1.8)),
          y: Math.max(8, Math.min(91, agent.baseY + Math.cos(phase * 0.8) * 3.7 + Math.sin(phase * 0.25) * 2.1)),
          trailX: Math.max(6, Math.min(94, agent.baseX + Math.sin(phase - 1.5) * 4.3)),
          trailY: Math.max(8, Math.min(91, agent.baseY + Math.cos((phase - 1.5) * 0.8) * 3.7)),
          selected: index === 11 || index === 26,
        };
      }),
    [agents, tick],
  );

  const triggerFailure = () => {
    const candidate = agents.find((agent) => !agent.failed);
    if (!candidate) return;
    setAgents((current) => current.map((agent) => (agent.id === candidate.id ? { ...agent, failed: true } : agent)));
    setEvents((current) => {
      const newEvents: EventItem[] = [
        { kind: "error", time: formattedTime, text: `${candidate.id} unavailable. Adjacent agents inherited the coverage gap.` },
        { kind: "success", time: formattedTime, text: "Adaptive relay rebalanced local search regions." },
      ];
      return [...newEvents, ...current].slice(0, 4);
    });
  };

  const resetSimulation = () => {
    setTick(0);
    setRunning(false);
    setAgents(makeAgents());
    setEvents([{ kind: "success", time: "00:00:00", text: "Mission reset. Set the parameters, then start the simulation." } as EventItem]);
  };

  return (
    <div className="console-shell">
      <div className="top-strip">
        <span className="top-strip__status"><i className="live-dot" /> Simulation kernel connected</span>
        <span>Scenario: Disaster response / sector 14 · build 0.8.3</span>
      </div>

      <div className="console-grid">
        <aside className="left-rail" aria-label="Application navigation">
          <div className="brand-lockup">
            <LogoMark />
            <div>
              <div className="brand-name">SwarmMind</div>
              <div className="brand-subtitle">Collective intelligence</div>
            </div>
          </div>

          <nav className="nav-list">
            {navItems.map(({ label, icon: Icon, active }) => (
              <button key={label} className={`nav-item ${active ? "active" : ""}`} type="button" aria-current={active ? "page" : undefined}>
                <Icon size={15} strokeWidth={1.7} />
                <span className="nav-label">{label}</span>
                {active && <span className="nav-tag">LIVE</span>}
              </button>
            ))}
          </nav>

          <div className="rail-divider" />
          <div className="control-block">
            <div className="section-kicker">Active scenario</div>
            <select className="mission-select" aria-label="Select active scenario" defaultValue="search">
              <option value="search">Search &amp; locate</option>
              <option value="coverage">Area coverage</option>
              <option value="collection">Resource collection</option>
            </select>
          </div>
          <div className="rail-bottom">
            <div className="section-kicker">Communication</div>
            <strong>LOCAL RELAY</strong>
          </div>
        </aside>

        <main className="mission-main">
          <header className="mission-header">
            <div>
              <div className="eyebrow">Mission / Search &amp; locate</div>
              <h1 className="mission-title">No controller.<br />One coordinated search.</h1>
              <p className="mission-summary">Local sensing, local decisions, and a shared objective across a 10,000-cell disaster zone.</p>
            </div>
            <div className="header-coordinates">
              OPERATIONAL AREA<br /><b>34.0522° N / 118.2437° W</b><br />GRID RESOLUTION <b>100 × 100</b>
            </div>
          </header>

          <section className="map-card" aria-label="Live swarm simulation map">
            <div className="map-header">
              <div className="map-name">SECTOR 14 <span>10,000 CELLS</span></div>
              <div className="map-legend">
                <span className="legend-chip"><i className="legend-swatch teal" /> Agents</span>
                <span className="legend-chip"><i className="legend-swatch orange" /> Targets</span>
                <span className="legend-chip"><i className="legend-swatch red" /> Offline</span>
              </div>
            </div>
            <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${activeAgents} active autonomous agents searching for targets`}>
              <defs>
                <linearGradient id="terrain" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#0a1d24" />
                  <stop offset="1" stopColor="#081217" />
                </linearGradient>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" className="grid-line" fill="none" />
                </pattern>
                <filter id="softGlow"><feGaussianBlur stdDeviation="1.3" /></filter>
              </defs>
              <rect width="100" height="100" fill="url(#terrain)" />
              <rect width="100" height="100" fill="url(#grid)" />
              {[22, 46, 70].map((y) => <path key={y} className="scan-line" d={`M0 ${y} C 28 ${y - 8}, 56 ${y + 8}, 100 ${y - 3}`} fill="none" />)}
              {[18, 49, 78].map((x) => <path key={x} className="scan-line" d={`M${x} 0 C ${x + 8} 24, ${x - 8} 59, ${x + 3} 100`} fill="none" />)}
              {visibleAgents.map((agent) => (
                <g key={agent.id} opacity={agent.failed ? .94 : 1}>
                  {!agent.failed && <line className="trail" x1={agent.trailX} y1={agent.trailY} x2={agent.x} y2={agent.y} />}
                  {agent.selected && !agent.failed && <circle className="agent-pulse" cx={agent.x} cy={agent.y} r="4.3" filter="url(#softGlow)" />}
                  <circle className={agent.failed ? "agent-failed" : "agent-dot"} cx={agent.x} cy={agent.y} r={agent.failed ? "1.45" : "1.18"} />
                  {agent.failed && <path d={`M${agent.x - 1.2} ${agent.y - 1.2} L${agent.x + 1.2} ${agent.y + 1.2} M${agent.x + 1.2} ${agent.y - 1.2} L${agent.x - 1.2} ${agent.y + 1.2}`} stroke="#fff2f2" strokeWidth=".4" />}
                </g>
              ))}
              {targets.map((target, index) => {
                const found = index < discovered;
                return (
                  <g key={target.label} opacity={found ? 1 : .35}>
                    <circle className={found ? "target-ring" : "target-hidden"} cx={target.x} cy={target.y} r={found ? "4.4" : "2.3"} />
                    {found && <circle className="target-ring" cx={target.x} cy={target.y} r="7" opacity=".33" />}
                    <circle className={found ? "target-core" : "target-hidden"} cx={target.x} cy={target.y} r="1.3" />
                    {found && <text x={target.x + 3} y={target.y - 3} fill="#feb370" fontSize="2.2" fontFamily="DM Mono">{target.label}</text>}
                  </g>
                );
              })}
              <text x="3" y="96" fill="#66817a" fontSize="1.8" fontFamily="DM Mono">NORTHING 4.02</text>
              <text x="85" y="8" fill="#66817a" fontSize="1.8" fontFamily="DM Mono">E-14 / 064</text>
            </svg>
            <div className="map-footer"><span>LOCAL SENSORS / 24 m RANGE</span><span>VISUALIZATION TICK 340 ms</span></div>
          </section>

          <div className="control-deck">
            <button className="run-button" type="button" onClick={() => setRunning((value) => !value)}>
              {running ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />} {running ? "Pause simulation" : "Run simulation"}
            </button>
            <button className="secondary-button" type="button" onClick={resetSimulation}><RotateCcw size={14} /> Reset</button>
            <button className="secondary-button" type="button" onClick={triggerFailure}><ShieldAlert size={14} /> Inject failure</button>
            <span className="time-readout">MISSION TIME&nbsp;&nbsp;<b>{formattedTime}</b></span>
          </div>

          <section className="metric-ribbon" aria-label="Mission metrics">
            <div className="metric"><div className="metric-label">Coverage</div><div className="metric-value">{coverage}<span className="unit">%</span><span className="metric-note">+4.1</span></div></div>
            <div className="metric"><div className="metric-label">Targets</div><div className="metric-value">{discovered}<span className="unit">/ 3</span></div></div>
            <div className="metric"><div className="metric-label">Active agents</div><div className="metric-value">{activeAgents}<span className="unit">/ {TOTAL_AGENTS}</span><span className="metric-note warn">{TOTAL_AGENTS - activeAgents ? "reallocating" : "stable"}</span></div></div>
            <div className="metric"><div className="metric-label">Mean energy</div><div className="metric-value">{energy}<span className="unit">%</span></div></div>
          </section>

          <section className="strategy-area" aria-labelledby="strategy-heading">
            <div className="strategy-topline"><h2 id="strategy-heading" className="section-title">Experiment comparison</h2><p className="section-subtitle">SAME ENVIRONMENT · SAME FAILURE PROFILE</p></div>
            <div className="strategy-grid">
              <button type="button" className={`strategy-card ${strategy === "Frontier Sweep" ? "selected" : ""}`} onClick={() => setStrategy("Frontier Sweep")}>
                <div className="strategy-card__head"><span className="strategy-letter">STRATEGY A</span><Grid3X3 size={15} color="#7a9b93" /></div>
                <div className="strategy-name">Frontier Sweep</div>
                <p className="strategy-description">Sector-first coverage with neighbor avoidance and fixed local partitions.</p>
                <div className="comparison-line"><span>COVERAGE</span><b>91%</b></div><div className="comparison-line"><span>ENERGY RETAINED</span><b>72%</b></div>
              </button>
              <button type="button" className={`strategy-card ${strategy === "Adaptive Relay" ? "selected" : ""}`} onClick={() => setStrategy("Adaptive Relay")}>
                <div className="strategy-card__head"><span className="strategy-letter">STRATEGY B</span><Radar size={15} color="#4be4c1" /></div>
                <div className="strategy-name">Adaptive Relay</div>
                <p className="strategy-description">Shared coverage-gap detection with dynamic search-region reassignment.</p>
                <div className="comparison-line"><span>COVERAGE</span><b>96%</b></div><div className="comparison-line"><span>ENERGY RETAINED</span><b>61%</b></div>
              </button>
            </div>
          </section>
        </main>

        <aside className="telemetry-panel" aria-label="Simulation telemetry">
          <div className="telemetry-heading"><h2 className="telemetry-title">Mission telemetry</h2><span className="telemetry-live">LIVE <Activity size={11} style={{ display: "inline", verticalAlign: "-2px" }} /></span></div>
          <section className="telemetry-card">
            <div className="telemetry-card__title">Objective progress</div>
            <div className="progress-bar"><span style={{ width: `${coverage}%` }} /></div>
            <div className="progress-copy"><span>Area coverage</span><b>{coverage}%</b></div>
            <div className="progress-bar target"><span style={{ width: `${(discovered / 3) * 100}%` }} /></div>
            <div className="progress-copy"><span>Target discovery</span><b>{discovered} / 3</b></div>
          </section>
          <section className="telemetry-card">
            <div className="telemetry-card__title">Environment</div>
            <div className="parameter-list" style={{ marginTop: 13 }}>
              <div className="parameter-row"><label htmlFor="agents">Swarm size</label><output>{agentCount}</output><input id="agents" className="slider" type="range" min="100" max="1000" step="100" value={agentCount} onChange={(event) => setAgentCount(Number(event.target.value))} /></div>
              <div className="parameter-row"><label htmlFor="failure">Failure profile</label><output>{failureRate}%</output><input id="failure" className="slider" type="range" min="0" max="30" step="5" value={failureRate} onChange={(event) => setFailureRate(Number(event.target.value))} /></div>
              <div className="parameter-row"><label>Communication</label><output>LOCAL</output></div>
              <div className="parameter-row"><label>Sensor radius</label><output>24 m</output></div>
            </div>
          </section>
          <section className="telemetry-card">
            <div className="telemetry-card__title">Decision log</div>
            <div className="event-list" style={{ marginTop: 13 }}>
              {events.map((event, index) => <div className="event-row" key={`${event.time}-${index}`}><i className={`event-dot ${event.kind === "warning" ? "warning" : event.kind === "error" ? "error" : ""}`} /><div><time>{event.time}</time>{event.text}</div></div>)}
            </div>
          </section>
          <button className="secondary-button failure-button" type="button" onClick={triggerFailure}><AlertTriangle size={14} /> Test recovery logic</button>
          <div className="telemetry-card" style={{ marginTop: 12 }}>
            <div className="telemetry-card__title"><Gauge size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /> System health</div>
            <div className="progress-copy" style={{ marginTop: 10 }}><span>Communication mesh</span><b style={{ color: "#4be4c1" }}>NOMINAL</b></div>
            <div className="progress-copy" style={{ marginTop: 7 }}><span>Objective strategy</span><b>{strategy === "Adaptive Relay" ? "ADAPTIVE" : "FRONTIER"}</b></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
