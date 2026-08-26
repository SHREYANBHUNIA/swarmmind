/**
 * Field Console: decentralized agent movement remains primary, with authenticated experiment capture secondary.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { getBehaviorMetrics } from "@/lib/behaviorModel";
import { downloadExperimentExport, experimentRowsToCsv, experimentRowsToJson } from "@/lib/experimentExport";
import { scenarioFromSearch, scenarios, type ScenarioId } from "@/lib/scenarioModel";
import { trpc } from "@/lib/trpc";
import type { SwarmBehavior } from "@shared/experiments";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Download,
  Gauge,
  Grid3X3,
  LogIn,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Route,
  Save,
  Settings2,
  ShieldAlert,
  UsersRound,
  Waypoints,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Strategy = "Frontier Sweep" | "Adaptive Relay";
type EventItem = { kind: "success" | "warning" | "error"; time: string; text: string };
type Agent = { id: string; baseX: number; baseY: number; phase: number; failed: boolean };

const TOTAL_AGENTS = 48;
const behaviorOptions: Array<{ id: SwarmBehavior; label: string; copy: string; icon: typeof UsersRound }> = [
  { id: "flocking", label: "Flocking", copy: "Cohesive local alignment and separation.", icon: UsersRound },
  { id: "formation", label: "Formation", copy: "Maintains a structured search lattice.", icon: Grid3X3 },
  { id: "exploration", label: "Exploration", copy: "Disperses into unvisited space.", icon: Waypoints },
  { id: "adaptiveRelay", label: "Adaptive relay", copy: "Rebalances coverage after local failures.", icon: Radar },
];

const makeAgents = (): Agent[] => Array.from({ length: TOTAL_AGENTS }, (_, index) => ({
  id: `R-${String(index + 1).padStart(2, "0")}`,
  baseX: 12 + (index % 8) * 11 + (Math.floor(index / 8) % 2) * 2.2,
  baseY: 13 + Math.floor(index / 8) * 14 + (index % 3) * 1.3,
  phase: index * .54,
  failed: false,
}));

function LogoMark() {
  return <svg className="brand-logo" viewBox="0 0 40 40" role="img" aria-label="SwarmMind relay mark"><path d="M9 26.7 19.7 20 26.6 10.4" fill="none" stroke="#4BE4C1" strokeWidth="2.2" strokeLinecap="round" /><circle cx="9" cy="26.7" r="4.2" fill="#4BE4C1" /><circle cx="27.4" cy="10.2" r="4.2" fill="#4BE4C1" opacity=".74" /><path d="m18 16.2 9.3 3.8-7 7.2Z" fill="#d5fff4" /></svg>;
}

function formatTime(tick: number) {
  const seconds = Math.floor(tick / 3);
  return `00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function downloadSavedRuns(format: "csv" | "json", runs: Parameters<typeof experimentRowsToCsv>[0]) {
  const datePart = new Date().toISOString().slice(0, 10);
  if (format === "csv") downloadExperimentExport(experimentRowsToCsv(runs), `swarmmind-runs-${datePart}.csv`, "text/csv;charset=utf-8");
  else downloadExperimentExport(experimentRowsToJson(runs), `swarmmind-runs-${datePart}.json`, "application/json");
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const api = trpc.useUtils();
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(134);
  const [scenarioId, setScenarioId] = useState<ScenarioId>(() => scenarioFromSearch(window.location.search));
  const [agentCount, setAgentCount] = useState(500);
  const [failureRate, setFailureRate] = useState(10);
  const [agents, setAgents] = useState<Agent[]>(makeAgents);
  const [strategy, setStrategy] = useState<Strategy>("Adaptive Relay");
  const [behavior, setBehavior] = useState<SwarmBehavior>("adaptiveRelay");
  const [runName, setRunName] = useState("Sector 14 recovery trial");
  const [saveNotice, setSaveNotice] = useState("");
  const [events, setEvents] = useState<EventItem[]>([
    { kind: "success", time: "00:00:39", text: "T-01 detected by R-12; local relay confirmed." },
    { kind: "warning", time: "00:00:32", text: "Northwest sector entering shared coverage." },
    { kind: "success", time: "00:00:18", text: "Distributed search partitions initialized." },
  ]);
  const runsQuery = trpc.experiments.list.useQuery(undefined, { enabled: isAuthenticated, staleTime: 15_000 });
  const saveRun = trpc.experiments.save.useMutation({
    onSuccess: async () => {
      setSaveNotice("Run saved to your experiment history.");
      await api.experiments.list.invalidate();
    },
    onError: () => setSaveNotice("The run could not be saved. Please try again."),
  });
  const exportRuns = trpc.experiments.exportAll.useMutation();

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setTick((value) => value + 1), 340);
    return () => window.clearInterval(interval);
  }, [running]);

  const scenario = scenarios[scenarioId];
  const baselineMetrics = getBehaviorMetrics(behavior, tick);
  const renderedAgentCount = Math.max(12, Math.min(TOTAL_AGENTS, Math.round(agentCount / 1000 * TOTAL_AGENTS)));
  const modeledFailureCount = Math.round(agentCount * failureRate / 100);
  const manualFailureCount = agents.filter((agent) => agent.failed).length;
  const activeAgents = Math.max(0, agentCount - modeledFailureCount - manualFailureCount);
  const coverage = Math.max(0, Math.min(100, baselineMetrics.coverage + scenario.coverageBias - Math.round(failureRate * .15)));
  const discovered = baselineMetrics.discovered;
  const energy = Math.max(35, baselineMetrics.energy - Math.round(failureRate * .1) - (scenarioId === "collection" ? 3 : 0));
  const formattedTime = formatTime(tick);
  const durationSeconds = Math.floor(tick / 3);

  const visibleAgents = useMemo(() => agents.map((agent, index) => {
    const phase = agent.phase + tick * .065;
    if (behavior === "flocking") {
      const ring = 15 + (index % 5) * 4.7;
      const orbit = phase * .42 + index * .35;
      return { ...agent, x: 50 + Math.cos(orbit) * ring, y: 50 + Math.sin(orbit) * ring * .72, trailX: 50 + Math.cos(orbit - .8) * ring, trailY: 50 + Math.sin(orbit - .8) * ring * .72, selected: index === 11 || index === 26 };
    }
    if (behavior === "formation") {
      const column = index % 8;
      const row = Math.floor(index / 8);
      const x = 12 + column * 11 + Math.sin(phase) * .8;
      const y = 16 + row * 13.5 + Math.cos(phase * .7) * .8;
      return { ...agent, x, y, trailX: x - 3.4, trailY: y + Math.sin(phase - 1.4) * .4, selected: index === 11 || index === 26 };
    }
    const disperse = behavior === "exploration" ? 6.5 : 4.3;
    return { ...agent, x: Math.max(6, Math.min(94, agent.baseX + Math.sin(phase) * disperse + Math.cos(phase * .4) * 1.8)), y: Math.max(8, Math.min(91, agent.baseY + Math.cos(phase * .8) * (disperse - .6) + Math.sin(phase * .25) * 2.1)), trailX: Math.max(6, Math.min(94, agent.baseX + Math.sin(phase - 1.5) * disperse)), trailY: Math.max(8, Math.min(91, agent.baseY + Math.cos((phase - 1.5) * .8) * (disperse - .6))), selected: index === 11 || index === 26 };
  }), [agents, behavior, tick]);
  const mapAgents = visibleAgents.slice(0, renderedAgentCount).map((agent, index) => ({ ...agent, failed: agent.failed || index < Math.round(renderedAgentCount * failureRate / 100) }));

  const triggerFailure = () => {
    const candidate = agents.find((agent) => !agent.failed);
    if (!candidate) return;
    setAgents((current) => current.map((agent) => agent.id === candidate.id ? { ...agent, failed: true } : agent));
    setEvents((current) => {
      const newEvents: EventItem[] = [{ kind: "error", time: formattedTime, text: `${candidate.id} unavailable. Adjacent agents inherited the coverage gap.` }, { kind: "success", time: formattedTime, text: "Local decision mesh reassigned neighboring search cells." }];
      return [...newEvents, ...current].slice(0, 4);
    });
  };
  const resetSimulation = () => { setTick(0); setRunning(false); setAgents(makeAgents()); const resetEvent: EventItem = { kind: "success", time: "00:00:00", text: "Mission reset. Set the parameters, then start the simulation." }; setEvents([resetEvent]); };
  const finishAndSaveRun = () => {
    if (!isAuthenticated) { startLogin(); return; }
    setSaveNotice("");
    setRunning(false);
    setEvents((current) => { const completionEvent: EventItem = { kind: "success", time: formattedTime, text: "Mission completion captured. Metrics queued for durable storage." }; return [completionEvent, ...current].slice(0, 4); });
    saveRun.mutate({ name: runName.trim() || `${behaviorOptions.find((option) => option.id === behavior)?.label} · ${formattedTime}`, behavior, strategy: strategy === "Adaptive Relay" ? "adaptiveRelay" : "frontierSweep", agentCount, failureRate, coverage, targetsFound: discovered, energyRemaining: energy, durationSeconds });
  };
  const exportAllRuns = (format: "csv" | "json") => {
    exportRuns.mutate(undefined, { onSuccess: (runs) => downloadSavedRuns(format, runs) });
  };
  const scrollTo = (target: string) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const storedRuns = runsQuery.data ?? [];
  const changeScenario = (nextScenario: ScenarioId) => {
    const next = scenarios[nextScenario];
    setScenarioId(nextScenario);
    window.history.replaceState(null, "", nextScenario === "search" ? "/" : `/?environment=${nextScenario}`);
    setTick(0);
    setRunning(false);
    setAgents(makeAgents());
    setEvents([{ kind: "success", time: "00:00:00", text: `${next.label} environment loaded: ${next.terrain.toLowerCase()}, ${next.cells.toLowerCase()}, ${next.communication.toLowerCase()} relay.` }]);
  };

  return <div className="console-shell">
    <div className="top-strip"><span className="top-strip__status"><i className="live-dot" /> Simulation kernel connected</span><span>Scenario: Disaster response / sector 14 · persistence armed</span></div>
    <div className="console-grid">
      <aside className="left-rail" aria-label="Application navigation">
        <div className="brand-lockup"><LogoMark /><div><div className="brand-name">SwarmMind</div><div className="brand-subtitle">Collective intelligence</div></div></div>
        <nav className="nav-list">
          {[{ label: "Mission", icon: Gauge, target: "mission", active: true }, { label: "Experiments", icon: BarChart3, target: "experiments", active: false }, { label: "Behaviors", icon: Route, target: "behaviors", active: false }, { label: "Agent registry", icon: Bot, target: "mission", active: false }, { label: "System", icon: Settings2, target: "history", active: false }].map(({ label, icon: Icon, target, active }) => <button key={label} className={`nav-item ${active ? "active" : ""}`} type="button" onClick={() => scrollTo(target)}><Icon size={15} strokeWidth={1.7} /><span className="nav-label">{label}</span>{active && <span className="nav-tag">LIVE</span>}</button>)}
        </nav>
        <div className="rail-divider" /><div className="control-block"><div className="section-kicker">Active environment</div><select className="mission-select" aria-label="Select active environment" value={scenarioId} onChange={(event) => changeScenario(event.target.value as ScenarioId)}><option value="search">Search &amp; locate</option><option value="coverage">Area coverage</option><option value="collection">Resource collection</option></select><div className="scenario-detail">{scenario.terrain} · {scenario.cells}</div></div>
        <div className="rail-bottom"><div className="section-kicker">Communication</div><strong>{scenario.communication} RELAY</strong></div>
      </aside>

      <main className="mission-main" id="mission">
        <header className="mission-header"><div><div className="eyebrow">Mission / {scenario.objective}</div><h1 className="mission-title">No controller.<br />One coordinated search.</h1><p className="mission-summary">{scenario.summary}</p></div><div className="header-coordinates">OPERATIONAL AREA<br /><b>34.0522° N / 118.2437° W</b><br />GRID RESOLUTION <b>{scenario.cells.replace(" CELLS", "")}</b></div></header>
        <section className={`map-card scenario-${scenarioId}`} aria-label="Live swarm simulation map"><div className="map-header"><div className="map-name">{scenario.mapName} <span>{scenario.cells}</span></div><div className="map-legend"><span className="legend-chip"><i className="legend-swatch teal" /> Agents</span><span className="legend-chip"><i className="legend-swatch orange" /> {scenario.targetMetric}</span><span className="legend-chip"><i className="legend-swatch red" /> Offline</span></div></div>
          <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${activeAgents} active autonomous agents using ${behavior} behavior`}><defs><linearGradient id="terrain" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0a1d24" /><stop offset="1" stopColor="#081217" /></linearGradient><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" className="grid-line" fill="none" /></pattern><filter id="softGlow"><feGaussianBlur stdDeviation="1.3" /></filter></defs><rect width="100" height="100" fill="url(#terrain)" /><rect width="100" height="100" fill="url(#grid)" />{scenario.obstacles.map((obstacle, index) => <rect className="terrain-obstacle" key={index} {...obstacle} rx="1" />)}{[22, 46, 70].map((y) => <path key={y} className="scan-line" d={`M0 ${y} C 28 ${y - 8}, 56 ${y + 8}, 100 ${y - 3}`} fill="none" />)}{[18, 49, 78].map((x) => <path key={x} className="scan-line" d={`M${x} 0 C ${x + 8} 24, ${x - 8} 59, ${x + 3} 100`} fill="none" />)}{mapAgents.map((agent) => <g key={agent.id} opacity={agent.failed ? .94 : 1}>{!agent.failed && <line className="trail" x1={agent.trailX} y1={agent.trailY} x2={agent.x} y2={agent.y} />}{agent.selected && !agent.failed && <circle className="agent-pulse" cx={agent.x} cy={agent.y} r="4.3" filter="url(#softGlow)" />}<circle className={agent.failed ? "agent-failed" : "agent-dot"} cx={agent.x} cy={agent.y} r={agent.failed ? "1.45" : "1.18"} />{agent.failed && <path d={`M${agent.x - 1.2} ${agent.y - 1.2} L${agent.x + 1.2} ${agent.y + 1.2} M${agent.x + 1.2} ${agent.y - 1.2} L${agent.x - 1.2} ${agent.y + 1.2}`} stroke="#fff2f2" strokeWidth=".4" />}</g>)}{scenario.targets.map((target, index) => { const found = index < discovered; return <g key={target.label} opacity={found ? 1 : .35}><circle className={found ? "target-ring" : "target-hidden"} cx={target.x} cy={target.y} r={found ? "4.4" : "2.3"} />{found && <circle className="target-ring" cx={target.x} cy={target.y} r="7" opacity=".33" />}<circle className={found ? "target-core" : "target-hidden"} cx={target.x} cy={target.y} r="1.3" />{found && <text x={target.x + 3} y={target.y - 3} fill="#feb370" fontSize="2.2" fontFamily="DM Mono">{target.label}</text>}</g>})}<text x="3" y="96" fill="#66817a" fontSize="1.8" fontFamily="DM Mono">{scenario.terrain}</text><text x="85" y="8" fill="#66817a" fontSize="1.8" fontFamily="DM Mono">{scenario.communication} / {scenario.sensorRadius}m</text></svg>
          <div className="map-footer"><span>{scenario.communication} SENSORS / {scenario.sensorRadius} m RANGE</span><span>{behaviorOptions.find((option) => option.id === behavior)?.label.toUpperCase()} BEHAVIOR</span></div>
        </section>
        <div className="control-deck"><button className="run-button" type="button" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}{running ? "Pause simulation" : "Run simulation"}</button><button className="secondary-button" type="button" onClick={resetSimulation}><RotateCcw size={14} /> Reset</button><button className="secondary-button" type="button" onClick={triggerFailure}><ShieldAlert size={14} /> Inject failure</button><span className="time-readout">MISSION TIME&nbsp;&nbsp;<b>{formattedTime}</b></span></div>
        <section className="metric-ribbon" aria-label="Mission metrics"><div className="metric"><div className="metric-label">Coverage</div><div className="metric-value">{coverage}<span className="unit">%</span><span className="metric-note">{behavior === "adaptiveRelay" ? "+4.1" : "tracking"}</span></div></div><div className="metric"><div className="metric-label">{scenario.targetMetric}</div><div className="metric-value">{discovered}<span className="unit">/ {scenario.targets.length}</span></div></div><div className="metric"><div className="metric-label">Active agents</div><div className="metric-value">{activeAgents}<span className="unit">/ {agentCount}</span><span className="metric-note warn">{modeledFailureCount + manualFailureCount ? "reallocating" : "stable"}</span></div></div><div className="metric"><div className="metric-label">Mean energy</div><div className="metric-value">{energy}<span className="unit">%</span></div></div></section>

        <section className="behavior-area" id="behaviors" aria-labelledby="behavior-heading"><div className="strategy-topline"><h2 id="behavior-heading" className="section-title">Behavior selector</h2><p className="section-subtitle">MOTION POLICY APPLIES IMMEDIATELY</p></div><div className="behavior-grid">{behaviorOptions.map((option) => { const Icon = option.icon; return <button type="button" key={option.id} className={`behavior-card ${behavior === option.id ? "selected" : ""}`} onClick={() => { setBehavior(option.id); setEvents((current) => { const policyEvent: EventItem = { kind: "success", time: formattedTime, text: `${option.label} policy deployed to the local decision mesh.` }; return [policyEvent, ...current].slice(0, 4); }); }}><Icon size={16} /><span>{option.label}</span><small>{option.copy}</small></button>; })}</div></section>

        <section className="strategy-area" id="experiments" aria-labelledby="strategy-heading"><div className="strategy-topline"><h2 id="strategy-heading" className="section-title">Experiment comparison</h2><p className="section-subtitle">SAME ENVIRONMENT · SAME FAILURE PROFILE</p></div><div className="strategy-grid"><button type="button" className={`strategy-card ${strategy === "Frontier Sweep" ? "selected" : ""}`} onClick={() => setStrategy("Frontier Sweep")}><div className="strategy-card__head"><span className="strategy-letter">STRATEGY A</span><Grid3X3 size={15} color="#7a9b93" /></div><div className="strategy-name">Frontier Sweep</div><p className="strategy-description">Sector-first coverage with neighbor avoidance and fixed local partitions.</p><div className="comparison-line"><span>COVERAGE</span><b>91%</b></div><div className="comparison-line"><span>ENERGY RETAINED</span><b>72%</b></div></button><button type="button" className={`strategy-card ${strategy === "Adaptive Relay" ? "selected" : ""}`} onClick={() => setStrategy("Adaptive Relay")}><div className="strategy-card__head"><span className="strategy-letter">STRATEGY B</span><Radar size={15} color="#4be4c1" /></div><div className="strategy-name">Adaptive Relay</div><p className="strategy-description">Shared coverage-gap detection with dynamic search-region reassignment.</p><div className="comparison-line"><span>COVERAGE</span><b>96%</b></div><div className="comparison-line"><span>ENERGY RETAINED</span><b>61%</b></div></button></div></section>
      </main>

      <aside className="telemetry-panel" aria-label="Simulation telemetry"><div className="telemetry-heading"><h2 className="telemetry-title">Mission telemetry</h2><span className="telemetry-live">LIVE <Activity size={11} style={{ display: "inline", verticalAlign: "-2px" }} /></span></div><section className="telemetry-card"><div className="telemetry-card__title">Objective progress</div><div className="progress-bar"><span style={{ width: `${coverage}%` }} /></div><div className="progress-copy"><span>Area coverage</span><b>{coverage}%</b></div><div className="progress-bar target"><span style={{ width: `${(discovered / scenario.targets.length) * 100}%` }} /></div><div className="progress-copy"><span>{scenario.targetMetric}</span><b>{discovered} / {scenario.targets.length}</b></div></section><section className="telemetry-card"><div className="telemetry-card__title">Environment</div><div className="parameter-list" style={{ marginTop: 13 }}><div className="parameter-row"><label htmlFor="agents">Swarm size</label><output>{agentCount}</output><input id="agents" className="slider" type="range" min="100" max="1000" step="100" value={agentCount} onChange={(event) => setAgentCount(Number(event.target.value))} /></div><div className="parameter-row"><label htmlFor="failure">Failure profile</label><output>{failureRate}%</output><input id="failure" className="slider" type="range" min="0" max="30" step="5" value={failureRate} onChange={(event) => setFailureRate(Number(event.target.value))} /></div><div className="parameter-row"><label>Terrain</label><output>{scenario.terrain}</output></div><div className="parameter-row"><label>Communication</label><output>{scenario.communication}</output></div><div className="parameter-row"><label>Sensor radius</label><output>{scenario.sensorRadius} m</output></div></div></section><section className="telemetry-card"><div className="telemetry-card__title">Decision log</div><div className="event-list" style={{ marginTop: 13 }}>{events.map((event, index) => <div className="event-row" key={`${event.time}-${index}`}><i className={`event-dot ${event.kind === "warning" ? "warning" : event.kind === "error" ? "error" : ""}`} /><div><time>{event.time}</time>{event.text}</div></div>)}</div></section><button className="secondary-button failure-button" type="button" onClick={triggerFailure}><AlertTriangle size={14} /> Test recovery logic</button><div className="telemetry-card" style={{ marginTop: 12 }}><div className="telemetry-card__title"><Gauge size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /> System health</div><div className="progress-copy" style={{ marginTop: 10 }}><span>Communication mesh</span><b style={{ color: "#4be4c1" }}>{scenario.communication}</b></div><div className="progress-copy" style={{ marginTop: 7 }}><span>Objective behavior</span><b>{behaviorOptions.find((option) => option.id === behavior)?.label.toUpperCase()}</b></div></div>
        <section className="telemetry-card persistence-card" id="history"><div className="telemetry-card__title"><Save size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /> Experiment persistence</div>{!loading && !isAuthenticated ? <><p className="persistence-copy">Sign in to capture completed runs, view their history, and export measured results.</p><button type="button" className="run-button sign-in-button" onClick={startLogin}><LogIn size={14} /> Sign in to save</button></> : <><label className="run-name-label" htmlFor="run-name">Completion label</label><input id="run-name" className="run-name-input" value={runName} maxLength={120} onChange={(event) => setRunName(event.target.value)} /><button type="button" className="run-button save-run-button" onClick={finishAndSaveRun} disabled={saveRun.isPending}><Save size={14} /> {saveRun.isPending ? "Saving completion" : "Finish & save run"}</button>{saveNotice && <p className="save-notice">{saveNotice}</p>}</>}</section>
        {isAuthenticated && <section className="telemetry-card history-card"><div className="history-head"><div className="telemetry-card__title">Saved runs · {storedRuns.length}</div><div className="export-controls"><button type="button" aria-label="Export all saved runs as CSV" disabled={!storedRuns.length || exportRuns.isPending} onClick={() => exportAllRuns("csv")}><Download size={12} /> CSV</button><button type="button" aria-label="Export all saved runs as JSON" disabled={!storedRuns.length || exportRuns.isPending} onClick={() => exportAllRuns("json")}><Download size={12} /> JSON</button></div></div>{runsQuery.isLoading ? <p className="history-empty">Loading history…</p> : storedRuns.length ? <div className="history-list">{storedRuns.map((run) => <div className="history-row" key={run.id}><div><b>{run.name}</b><span>{run.behavior.replace(/([A-Z])/g, " $1")} · {new Date(run.createdAt).toLocaleDateString()}</span></div><strong>{run.coverage}%</strong></div>)}</div> : <p className="history-empty">No saved runs yet. Finish this mission to begin a durable record.</p>}</section>}
      </aside>
    </div>
  </div>;
}
