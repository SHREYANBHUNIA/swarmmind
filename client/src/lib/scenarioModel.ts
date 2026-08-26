export type ScenarioId = "search" | "coverage" | "collection";
export type Scenario = { label: string; mapName: string; cells: string; terrain: string; communication: string; sensorRadius: number; objective: string; summary: string; targetMetric: string; coverageBias: number; targets: Array<{ x: number; y: number; label: string }>; obstacles: Array<{ x: number; y: number; w: number; h: number }> };

export const scenarios: Record<ScenarioId, Scenario> = {
  search: { label: "Search & locate", mapName: "SECTOR 14", cells: "10,000 CELLS", terrain: "URBAN RUBBLE", communication: "LOCAL", sensorRadius: 24, objective: "Search & locate", summary: "Local sensing, local decisions, and a shared objective across a 10,000-cell disaster zone.", targetMetric: "Targets", coverageBias: 0, targets: [{ x: 26, y: 65, label: "T-01" }, { x: 69, y: 30, label: "T-02" }, { x: 81, y: 76, label: "T-03" }], obstacles: [{ x: 42, y: 22, w: 10, h: 7 }, { x: 70, y: 56, w: 8, h: 12 }] },
  coverage: { label: "Area coverage", mapName: "QUARANTINE GRID", cells: "16,000 CELLS", terrain: "OPEN FLOODPLAIN", communication: "MESH", sensorRadius: 32, objective: "Area coverage", summary: "Disperse across a broad floodplain, maintain a mesh relay, and leave no survey cell unobserved.", targetMetric: "Coverage beacons", coverageBias: 5, targets: [{ x: 18, y: 23, label: "B-01" }, { x: 52, y: 54, label: "B-02" }, { x: 84, y: 35, label: "B-03" }], obstacles: [{ x: 20, y: 70, w: 25, h: 4 }, { x: 55, y: 18, w: 3, h: 31 }] },
  collection: { label: "Resource collection", mapName: "DEPOT CORRIDOR", cells: "7,500 CELLS", terrain: "COLLAPSED WAREHOUSE", communication: "RELAY", sensorRadius: 18, objective: "Resource collection", summary: "Recover distributed supplies through a constrained warehouse corridor while preserving local links.", targetMetric: "Resources", coverageBias: -4, targets: [{ x: 23, y: 38, label: "R-01" }, { x: 57, y: 71, label: "R-02" }, { x: 82, y: 24, label: "R-03" }], obstacles: [{ x: 14, y: 14, w: 18, h: 13 }, { x: 39, y: 38, w: 16, h: 9 }, { x: 67, y: 58, w: 19, h: 12 }] },
};

export function scenarioFromSearch(search: string): ScenarioId {
  const value = new URLSearchParams(search).get("environment");
  return value === "coverage" || value === "collection" ? value : "search";
}
