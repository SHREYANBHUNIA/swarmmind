# SwarmMind

**CSE - 148 - SHREYAN BHUNIA**  
**shreyan.bhunia.k@gmail.com**

SwarmMind is an interactive mission-console application for exploring decentralized multi-agent coordination. It visualizes autonomous agents operating without a central controller and lets users compare swarm behaviors, inject failures, switch environments, monitor mission telemetry, and persist completed experiments for later analysis.

> **Project status:** The core simulation console, environment switching, authenticated experiment persistence, CSV/JSON export, responsive layouts, and automated tests are implemented.

## Features

| Area | Capabilities |
|---|---|
| Live simulation | Animated autonomous agents, target discovery, coverage progress, energy estimates, mission timer, and local decision-log events |
| Swarm behaviors | Flocking, formation, exploration, and adaptive-relay policies with visibly different movement and metric profiles |
| Environments | Search & locate, area coverage, and resource collection scenarios with distinct terrain, obstacles, targets, grid sizes, relay modes, sensor ranges, and objectives |
| Resilience testing | Manual failure injection and recovery events showing local reassignment behavior |
| Experiment workflow | Finish and save a run with a custom label and measured mission metrics |
| Persistence | Authenticated, user-scoped experiment history backed by the project database |
| Export | Download all saved runs as CSV or JSON from the mission console |
| Responsive UI | Field Console layout designed for desktop and mobile viewports |

## Technology Stack

SwarmMind uses a React frontend and a typed full-stack API rather than a static-only site. The deployed project template provides the Express server, tRPC procedures, OAuth session handling, Drizzle ORM, and MySQL/TiDB-compatible database connection.

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| UI and interaction | Lucide React, Radix UI primitives, Framer Motion, Wouter |
| API | Express 4, tRPC 11, SuperJSON |
| Persistence | Drizzle ORM with MySQL/TiDB-compatible `DATABASE_URL` |
| Authentication | Manus OAuth session integration |
| Validation | Zod and Vitest |
| Build | Vite for the client and esbuild for the server bundle |

## Repository Structure

```text
client/
  src/
    components/       Reusable interface and dashboard components
    lib/               Behavior, scenario, export, and tRPC utilities
    pages/Home.tsx    Main SwarmMind mission console
    App.tsx           Application routes and providers
    index.css         Field Console theme and responsive styles

drizzle/
  schema.ts           Users and experiment_runs database models
  migrations/         Generated database migration files

server/
  db.ts               Database connection and experiment queries
  routers.ts          Authenticated experiment and export procedures
  _core/              Server, OAuth, tRPC, storage, and runtime plumbing

shared/
  experiments.ts      Shared behavior enums and experiment input validation

todo.md               Feature and delivery checklist
```

## Local Development

### Prerequisites

Install Node.js 20 or newer, pnpm, and a MySQL/TiDB-compatible database. Authentication-related environment values are supplied by the managed project environment or by your deployment provider.

### Installation

```bash
git clone https://github.com/SHREYANBHUNIA/swarmmind.git
cd swarmmind
pnpm install
```

Create a local environment configuration using your deployment or project provider. Do not commit secrets to the repository.

```bash
DATABASE_URL="mysql://user:password@host:3306/database"
JWT_SECRET="replace-with-a-long-random-secret"
VITE_APP_ID="your-oauth-app-id"
OAUTH_SERVER_URL="your-oauth-server-url"
VITE_OAUTH_PORTAL_URL="your-oauth-portal-url"
```

Start the development server:

```bash
pnpm dev
```

The development server runs the Vite frontend through the application server. Use the URL printed by the development command to open the mission console.

## Database Setup

The database schema is defined in `drizzle/schema.ts`. The project currently defines two primary tables:

| Table | Purpose |
|---|---|
| `users` | Authenticated user identity and OAuth profile data |
| `experiment_runs` | User-owned completed runs, behavior selections, strategies, and scalar mission metrics |

After configuring `DATABASE_URL`, generate and apply the schema migration using the project’s database workflow:

```bash
pnpm db:push
```

The `experiment_runs` model stores the run name, behavior, strategy, agent count, failure rate, coverage, discovered targets, remaining energy, duration, owning user, and creation timestamp. The API restricts history and export results to the authenticated user who owns the records.

## Using the Application

Open the mission console and choose an environment from **Active environment**. The selector changes the scenario’s map label, terrain obstacles, target locations, objective copy, communication mode, sensor radius, grid size, and related telemetry.

Choose a behavior from the **Behavior selector**. Flocking creates cohesive orbital movement, formation maintains a structured lattice, exploration disperses agents more widely, and adaptive relay emphasizes coverage recovery after failures.

Use **Pause simulation**, **Run simulation**, **Reset**, and **Inject failure** to control a mission. The **Test recovery logic** action creates a visible failure and recovery event in the decision log. To persist a mission, sign in, enter a completion label, and choose **Finish & save run**. Saved runs appear in the history panel and can be downloaded as CSV or JSON.

Scenario states can also be opened directly through the URL:

```text
/?environment=search
/?environment=coverage
/?environment=collection
```

## API Procedures

The typed tRPC contract is defined in `server/routers.ts`:

| Procedure | Access | Purpose |
|---|---|---|
| `experiments.list` | Authenticated | Return the current user’s saved experiment runs |
| `experiments.save` | Authenticated | Persist a completed run after validating its metrics and behavior values |
| `experiments.exportAll` | Authenticated | Return all of the current user’s runs for client-side CSV or JSON export |
| `auth.me` | Public | Read the current authenticated user, when available |
| `auth.logout` | Public | Clear the authenticated session cookie |

The client uses the typed hooks from `client/src/lib/trpc.ts`; direct ad hoc REST or Axios calls are not required.

## Quality Checks

Run the type checker, unit tests, and production build before creating a deployment artifact:

```bash
pnpm check
pnpm test
pnpm build
```

The test suite covers authentication logout behavior, authenticated experiment procedures, behavior metrics, CSV/JSON export formatting, and URL-linked environment selection.

## Deployment

SwarmMind is a full-stack application. It requires a Node-compatible runtime for the Express/tRPC server, a reachable MySQL/TiDB-compatible database, and the OAuth environment variables listed above. **GitHub Pages is not sufficient** because it only serves static frontend assets and cannot run the authenticated API or database layer.

For a GitHub-connected deployment provider, configure the repository’s `main` branch as the deployment source and add the production environment variables through the provider’s secret manager. The build command is:

```bash
pnpm build
```

The production start command is:

```bash
pnpm start
```

Run the database migration before or during the first production release, then confirm that OAuth callback URLs point to the deployed application origin. Keep `DATABASE_URL`, `JWT_SECRET`, and OAuth credentials private.

## Design Direction

The interface follows a **Field Console** visual language: a deep operational canvas, Relay Teal status signals, compact monospace telemetry, a sonar-grid map, and an asymmetric mission-control layout. The design intentionally keeps decentralized agent movement central while placing metrics and persistence controls in supporting rails.

## Author

**CSE - 148 - SHREYAN BHUNIA**  
Email: [shreyan.bhunia.k@gmail.com](mailto:shreyan.bhunia.k@gmail.com)

## License

This project is distributed under the MIT License as specified in `package.json`.
