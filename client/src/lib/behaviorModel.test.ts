import { describe, expect, it } from "vitest";
import { getBehaviorMetrics } from "./behaviorModel";

describe("swarm behavior model", () => {
  it("keeps flocking cohesive but caps its search coverage below adaptive relay", () => {
    expect(getBehaviorMetrics("flocking", 220).coverage).toBeLessThan(getBehaviorMetrics("adaptiveRelay", 220).coverage);
  });

  it("changes target discovery timing by behavior policy", () => {
    expect(getBehaviorMetrics("exploration", 155).discovered).toBe(2);
    expect(getBehaviorMetrics("flocking", 155).discovered).toBe(1);
  });
});
