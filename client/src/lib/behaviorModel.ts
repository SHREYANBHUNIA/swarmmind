import type { SwarmBehavior } from "@shared/experiments";

export const behaviorProfiles: Record<SwarmBehavior, { coverageCap: number; energyCost: number; targetTicks: number[] }> = {
  flocking: { coverageCap: 84, energyCost: .075, targetTicks: [120, 190, 270] },
  formation: { coverageCap: 89, energyCost: .09, targetTicks: [110, 170, 245] },
  exploration: { coverageCap: 93, energyCost: .105, targetTicks: [95, 150, 220] },
  adaptiveRelay: { coverageCap: 96, energyCost: .11, targetTicks: [90, 145, 185] },
};

export function getBehaviorMetrics(behavior: SwarmBehavior, tick: number) {
  const profile = behaviorProfiles[behavior];
  return {
    coverage: Math.min(profile.coverageCap, Math.round(43 + tick * (profile.coverageCap - 43) / 165)),
    discovered: profile.targetTicks.filter((threshold) => tick > threshold).length,
    energy: Math.max(48, Math.round(81 - tick * profile.energyCost)),
  };
}
