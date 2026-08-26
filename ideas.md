# SwarmMind Design Directions

## Three possible directions

### 1. Field Console
**Very Brief Intro:** A calibrated disaster-response control surface that balances the urgency of a live mission with the clarity of scientific instrumentation. It feels operational rather than decorative.

**Probability:** 0.07

### 2. Cartographer’s Lab
**Very Brief Intro:** A warm, editorial research workspace inspired by field maps, technical notebooks, and annotated terrain studies. It makes experimentation feel deliberate and human.

**Probability:** 0.04

### 3. Signal Grid
**Very Brief Intro:** A luminous, low-light network observatory with node-to-node signals, gentle radar echoes, and highly legible telemetry. It brings the swarm’s invisible local coordination into view.

**Probability:** 0.08

---

# Chosen Direction — Field Console

## Design Movement

**Mission-control industrial design** with traces of scientific field instrumentation and modern wayfinding systems. The application should read as a dependable operational interface for simulation practitioners rather than a conventional SaaS dashboard.

## Core Principles

1. **Mission state is visual, not merely textual.** The evolving map and temporal activity establish priority before secondary metrics.
2. **Local autonomy, global comprehension.** Individual robot behavior is rendered as small, visible actions while aggregate telemetry provides the systems-level view.
3. **Measured urgency.** Strong hierarchy, real contrast, status colors, and compact controls establish a sense of an active operation without resorting to visual noise.
4. **Data earns its space.** Surfaces, dividers, and labels are deliberately sparse; every numeric value has a functional role.

## Color Philosophy

The base is a deep ink-blue control-room field that lets the grid, robot trails, and target events become optically prominent. **Signal teal** is the ownable healthy-operation color, while safety orange is reserved for discovered targets and warm red for failed agents. Subtle sandstone and mist text values reference field notebooks and preserve readability without relying on pure white everywhere.

## Layout Paradigm

The screen is a **mission rail**, not a centered dashboard. A narrow permanent left rail anchors identity and session controls; a dominant, wide mission canvas occupies the center; an adaptive telemetry column attaches to the right. On small screens the sidebar becomes a compact control strip and the telemetry moves below the canvas.

## Signature Elements

1. **Sonar-grid mission canvas:** A low-contrast squared terrain with scan-line texture, target halos, local-communication rings, and persistent trail traces.
2. **Telemetry ribbons:** Fine horizontal numeric strips with small status dots, used for progress, environment conditions, and experiment comparison.
3. **Coordinate labels and corner brackets:** Small operational labels, map coordinates, and corner marks reinforce the field-console character without competing with the simulation.

## Interaction Philosophy

Controls should behave like calibrated instruments: playback responds immediately, sliders expose current values continuously, and status pills change only when the simulation state warrants it. Agent failures trigger a contained warning state and obvious redistributive movement on the canvas rather than an intrusive modal. Strategy selection presents a direct in-context comparison, not a navigation detour.

## Animation

Agent motion is continuous but restrained, driven by a short simulation tick. Trails fade progressively, scan rings pulse at low opacity, and target discovery emits a single expanding halo. Panels use transform-and-opacity entrances below 240ms with `cubic-bezier(0.23, 1, 0.32, 1)`. Hover feedback is crisp and limited; the interface honors reduced-motion preferences by freezing visual pulses and transitions.

## Typography System

**Space Grotesk** is used for navigation, labels, and dense telemetry because it stays sharp at small sizes. **DM Mono** is used for statistics, coordinate labels, and technical values, creating a clear distinction between interface prose and live data. Headlines use Space Grotesk at 600–700 weight with tight tracking; labels are uppercase at 10–11px with deliberate spacing.

## Brand Essence

**SwarmMind is the working console for people who need decentralized agents to turn local decisions into measurable collective outcomes.**

Personality: **precise, resilient, observant**.

## Brand Voice

The voice is operational, concise, and evidence-oriented. Headlines name the active condition; CTAs describe the exact action, never a generic invitation.

> “No controller. One coordinated search.”

> “Inject a failure and watch coverage recover.”

## Wordmark & Logo

The logo is a bold, text-free **three-node triangular relay mark**: one central directional node with two offset satellites, implying local communication that resolves into a collective vector. The wordmark pairs the custom mark with a wide, tracked Space Grotesk treatment; the mark must stand on its own as the favicon.

## Signature Brand Color

**Relay Teal — #4BE4C1**. This bright but non-neon teal is reserved for active agents, healthy operational state, and the brand mark.
