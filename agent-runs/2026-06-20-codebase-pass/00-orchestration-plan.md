# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/openpacman
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/openpacman/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: Git remote read, dry-run push, `npm run lint`, `npm run build`, source search, TypeScript/Next build diagnostics, `git diff --check`
- Human-decision blockers: broad product behavior changes, risky major dependency migrations, browser-only gameplay changes that cannot be locally verified
- Resume policy: Resume from `run-state.md`, `task-queue.md`, and Git state; push any validated local phase commit before new edits

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Skill/run scaffolding validates; repo docs match current files; lint passes | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop | `npm run lint` and `npm run build` pass or failures are classified | Baseline report pushed |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Targeted done-check, lint, and build when relevant | Highest-priority executable issues are fixed, deferred, or blocked |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Dependency changes are small and verified; removals have search/build proof | Safe cleanup is pushed or deferred |
| Review | Judge Loop | No P0/P1 findings, introduced regressions, or unowned changes | Review report pushed |
| Stabilization Loop | Stabilization Loop, Judge Loop | Completion criteria pass or real blocker is recorded | Stabilization report pushed |
| Integrator | Final Completion Gate | Remote read/dry-run push pass; dev is clean and synced | Final report pushed |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | AGENTS.md, SPEC.md, agent-runs/2026-06-20-codebase-pass/00-orchestration-plan.md, agent-runs/2026-06-20-codebase-pass/run-state.md, agent-runs/2026-06-20-codebase-pass/task-queue.md, agent-runs/2026-06-20-codebase-pass/01-preflight-and-repo-docs.md | Startup planning, repo guidance, current-state spec, and resume state |
| T-002 | agent-runs/2026-06-20-codebase-pass/02-baseline-validation.md, agent-runs/2026-06-20-codebase-pass/run-state.md, agent-runs/2026-06-20-codebase-pass/task-queue.md | Baseline validation |
| T-003 | agent-runs/2026-06-20-codebase-pass/03-findings-backlog.md, agent-runs/2026-06-20-codebase-pass/task-queue.md | Findings backlog and architecture scorecard |
| T-004+ | Source files listed by finding-specific queue rows | Only after evidence-backed findings exist |
