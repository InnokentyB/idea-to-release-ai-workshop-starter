# Project workflow: TDPD

Apply Test-Driven Product Development (TDPD), an original method by Innokenty
Bodrov, to all product work in this repository. User instructions and applicable
parent instructions take precedence.

Before product work, read `skills/build-products-with-tdpd/SKILL.md`,
`.tdpd/core/METHOD.md`, `CONTEXT.md`, `GATES.md`, `WORKFLOW.md`, and `ROLES.md`
under `.tdpd/core/`. Use `.tdpd/templates/` for artifacts and consult
`.tdpd/core/ORCHESTRATION.md` and `RECOVERY.md` when relevant.

Start from `.tdpd/project-context.md` and `.tdpd/state/run-state.json`.
Keep evidence and decisions current; framework installation is not evidence
that product gates passed.

## Delivery contract

- Select Shape, Plan, Deliver, or Audit from the actual request.
- Inventory sources, build source-linked context, review gaps/conflicts, and
  record authorized decisions before committing product specifications.
- Maintain traceability: source → finding/context → decision → problem → rule
  → scenario → executable test/manual check → implementation → human UAT.
- Approve the intended user surface and material architecture boundaries before
  implementation. Do not infer approval from sample workshop answers.
- Write user-boundary e2e tests before production behavior. Prove RED from
  missing behavior, implement to GREEN, and never weaken tests to pass.
- Reuse React, TypeScript, Vite, and Playwright. Review product, UX, QA,
  architecture, security, and operations proportionately. Do not run a formal
  council or spawn additional agents unless explicitly requested.
- Advance gates only with recorded evidence. GREEN requires relevant checks;
  Output/UAT requires the responsible human's explicit acceptance.

## Current product and workshop baseline

`workshop/` contains learning exercises and reference answers, not a completed
product decision. S1–S4 map to `tests/e2e/event-checklist.spec.ts`.
The original starter showed WORKSHOP READY. Current approved product initiative
is `docs/tdpd/event-applications/`: local browser prototype, multiple applications,
comment-required return, approval-gated tasks and computed readiness.
Read its decisions, architecture and latest evidence before changing behavior.
Do not switch checkpoint branches or implement the separate workshop example
as part of the application product. Its tests remain available separately.

Commands: `npm run dev`, `npm run build`, `npm run workshop:check`,
`npm run test:e2e` (application product), `npm run test:e2e:workshop` (separate
checkpoint example). TDPD commands use
`node methodology/tdpd/bin/tdpd.js <status|audit> --target .`.

## Framework source

`methodology/tdpd` is a Git submodule pinned to `workshop-v0.3.1`.
Initialize it with `git submodule update --init --recursive` after cloning.
Installed `.tdpd/core/`, `.tdpd/templates/`, and the project skill come from
that revision. Do not silently update the pin or overwrite local artifacts;
review upstream changes and their effect on gates before upgrading.
