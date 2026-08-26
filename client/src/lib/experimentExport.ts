import type { ExperimentRun } from "../../../drizzle/schema";

const headers = ["id", "name", "behavior", "strategy", "agents", "failures_pct", "coverage_pct", "targets_found", "energy_remaining_pct", "duration_seconds", "recorded_at"] as const;

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function experimentRowsToCsv(runs: ExperimentRun[]) {
  const rows = runs.map((run) => [
    run.id,
    run.name,
    run.behavior,
    run.strategy,
    run.agentCount,
    run.failureRate,
    run.coverage,
    run.targetsFound,
    run.energyRemaining,
    run.durationSeconds,
    new Date(run.createdAt).toISOString(),
  ].map(csvCell).join(","));
  return [headers.join(","), ...rows].join("\n");
}

export function experimentRowsToJson(runs: ExperimentRun[]) {
  return JSON.stringify(runs, null, 2);
}

export function downloadExperimentExport(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
