import type { TrpcContext } from "./_core/context";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ createExperimentRun: vi.fn(), listExperimentRuns: vi.fn() }));
vi.mock("./db", () => db);

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "swarm-user",
      name: "Swarm Researcher",
      email: "researcher@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

describe("experiments router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves completed run data under the authenticated user", async () => {
    db.createExperimentRun.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext());
    const input = { name: "Recovery validation", behavior: "adaptiveRelay" as const, strategy: "adaptiveRelay" as const, agentCount: 500, failureRate: 10, coverage: 96, targetsFound: 3, energyRemaining: 61, durationSeconds: 144 };
    await expect(caller.experiments.save(input)).resolves.toEqual({ success: true });
    expect(db.createExperimentRun).toHaveBeenCalledWith({ ...input, userId: 42 });
  });

  it("returns the user's persisted runs for both history and all-record export", async () => {
    const runs = [{ id: 5, name: "Recovery validation", coverage: 96 }];
    db.listExperimentRuns.mockResolvedValue(runs);
    const caller = appRouter.createCaller(createContext());
    await expect(caller.experiments.list()).resolves.toEqual(runs);
    await expect(caller.experiments.exportAll()).resolves.toEqual(runs);
    expect(db.listExperimentRuns).toHaveBeenCalledTimes(2);
    expect(db.listExperimentRuns).toHaveBeenCalledWith(42);
  });
});
