import type { ExperimentRun } from "../../../drizzle/schema";
import { describe, expect, it } from "vitest";
import { experimentRowsToCsv, experimentRowsToJson } from "./experimentExport";

const run: ExperimentRun = {
  id: 7,
  userId: 1,
  name: "Sector 14, recovery trial",
  behavior: "adaptiveRelay",
  strategy: "adaptiveRelay",
  agentCount: 500,
  failureRate: 10,
  coverage: 96,
  targetsFound: 3,
  energyRemaining: 61,
  durationSeconds: 128,
  createdAt: new Date("2026-08-26T12:00:00.000Z"),
};

describe("experiment export formats", () => {
  it("writes stable, correctly escaped CSV fields", () => {
    const csv = experimentRowsToCsv([run]);
    expect(csv.split("\n")[0]).toContain("coverage_pct");
    expect(csv).toContain('"Sector 14, recovery trial"');
    expect(csv).toContain("2026-08-26T12:00:00.000Z");
  });

  it("preserves run properties in the JSON export", () => {
    const exported = JSON.parse(experimentRowsToJson([run]));
    expect(exported[0]).toMatchObject({ id: 7, behavior: "adaptiveRelay", coverage: 96 });
  });
});
