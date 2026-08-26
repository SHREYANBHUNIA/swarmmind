import { z } from "zod";

export const swarmBehaviors = ["flocking", "formation", "exploration", "adaptiveRelay"] as const;
export const swarmStrategies = ["frontierSweep", "adaptiveRelay"] as const;

export type SwarmBehavior = (typeof swarmBehaviors)[number];
export type SwarmStrategy = (typeof swarmStrategies)[number];

export const experimentRunInput = z.object({
  name: z.string().trim().min(1).max(120),
  behavior: z.enum(swarmBehaviors),
  strategy: z.enum(swarmStrategies),
  agentCount: z.number().int().min(100).max(1000),
  failureRate: z.number().int().min(0).max(30),
  coverage: z.number().int().min(0).max(100),
  targetsFound: z.number().int().min(0).max(3),
  energyRemaining: z.number().int().min(0).max(100),
  durationSeconds: z.number().int().min(0),
});

export type ExperimentRunInput = z.infer<typeof experimentRunInput>;
