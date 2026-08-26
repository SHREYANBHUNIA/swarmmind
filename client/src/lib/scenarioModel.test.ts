import { describe, expect, it } from "vitest";
import { scenarioFromSearch, scenarios } from "./scenarioModel";

describe("environment scenario selection", () => {
  it("resolves every supported selector URL and defaults unknown values to search", () => {
    expect(scenarioFromSearch("")).toBe("search");
    expect(scenarioFromSearch("?environment=coverage")).toBe("coverage");
    expect(scenarioFromSearch("?environment=collection")).toBe("collection");
    expect(scenarioFromSearch("?environment=invalid")).toBe("search");
  });

  it("provides distinct terrain, relay, and target data for every environment", () => {
    expect(scenarios.search.terrain).toBe("URBAN RUBBLE");
    expect(scenarios.coverage.communication).toBe("MESH");
    expect(scenarios.collection.targetMetric).toBe("Resources");
    expect(scenarios.coverage.sensorRadius).toBeGreaterThan(scenarios.collection.sensorRadius);
  });
});
