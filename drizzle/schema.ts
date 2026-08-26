import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing the OAuth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Completed decentralized-swarm simulations owned by the authenticated user.
 * Values are kept scalar to simplify fast history queries and CSV/JSON export.
 */
export const experimentRuns = mysqlTable("experiment_runs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  behavior: mysqlEnum("behavior", ["flocking", "formation", "exploration", "adaptiveRelay"]).notNull(),
  strategy: mysqlEnum("strategy", ["frontierSweep", "adaptiveRelay"]).notNull(),
  agentCount: int("agentCount").notNull(),
  failureRate: int("failureRate").notNull(),
  coverage: int("coverage").notNull(),
  targetsFound: int("targetsFound").notNull(),
  energyRemaining: int("energyRemaining").notNull(),
  durationSeconds: int("durationSeconds").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ExperimentRun = typeof experimentRuns.$inferSelect;
export type InsertExperimentRun = typeof experimentRuns.$inferInsert;
