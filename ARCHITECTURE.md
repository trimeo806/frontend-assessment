# SkyBook — Architecture & Documentation

Documentation has been organized into the [`docs/`](./docs/) directory.

## Documents

| Document | What it covers |
|----------|----------------|
| [docs/architecture.md](./docs/architecture.md) | System architecture, library selection rationale, rendering strategy, state management, route guard pattern — includes Mermaid diagrams |
| [docs/competitive-research.md](./docs/competitive-research.md) | 7 OTAs studied and scored, Skyscanner as primary reference, patterns adopted and deliberately avoided |
| [docs/ai-tools.md](./docs/ai-tools.md) | Claude Code + tri_ai_kit usage, agent responsibilities, concrete examples of where AI helped most |
| [docs/workflow.md](./docs/workflow.md) | 10-phase development workflow with diagram — brainstorm → research → plan → architecture gate → implement → review → test → deploy |

**Setup instructions** → [README.md](./README.md)

---

## Process & Context

| Document | What it covers |
| --- | --- |
| [docs/workflow.md](./docs/workflow.md) | The 10-phase process that produced these architectural decisions — Phase 6 is where the architecture was locked |
| [docs/ai-tools.md](./docs/ai-tools.md) | How Claude Code and tri_ai_kit agents contributed to specific decisions (Server Actions, `useHydrated()`, sessionStorage) |
| [plans/260315-1200-flight-booking-app/frontend/implementation-plans/](./plans/260315-1200-flight-booking-app/frontend/implementation-plans/) | 12 plan files — the working documents produced during planning, before implementation began |
| [plans/260320-gap-resolution/plan.md](./plans/260320-gap-resolution/plan.md) | Post-build gap audit and resolution tracking |
