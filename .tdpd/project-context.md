# TDPD adoption baseline

Current product initiative: `docs/tdpd/event-applications/`. It records the
subsequently supplied user problem, rules, decisions, scenarios and verification.
The workshop reference is historical context, not this initiative's specification.

Recorded: 2026-10-10. Scope: connect the requested framework and make it the
durable project workflow. Product implementation is outside this setup task.

## Source map

| ID | Source / locator | Version and authority | Access |
|---|---|---|---|
| S001 | User instruction in this chat, 2026-10-10: connect InnokentyB/tdpd-product-framework and use the complete method | Owner instruction; authorizes methodology adoption | Read; private chat |
| S002 | `methodology/tdpd/README.md`, `WORKSHOP.md`, `core/`, `adapters/codex/skills/build-products-with-tdpd/SKILL.md` | Upstream framework, tag workshop-v0.3.1, commit 29b0106857167297a5716b3b1da66733f8786791; controls method and installation | Read; public repository, MIT |
| S003 | `README.md`, `workshop/problem.md`, `spec.md`, `scenarios.md`, `uat.md` under `workshop/` | Starter baseline aa9aae7685697f03e5a8584e8487b8ab2e87e229; exercises/reference answers, not human approval | Read; public repository |
| S004 | `package.json`, `src/App.tsx`, `playwright.config.ts`, `tests/e2e/event-checklist.spec.ts` | Same starter baseline; authoritative for current implementation and test definitions | Read; public repository |

Source access date: 2026-10-10. Versions above fix temporal validity; access date
does not establish publication date. Recheck affected sources when they change.

## System context pack

- F001 (Fact, S002): the complete workflow includes Context, Problem, Input,
  Red, Green, Output/UAT. Automated acceptance cannot replace human UAT.
- F002 (Fact, S003/S004): the starter uses React, TypeScript, Vite and Playwright;
  the current screen is WORKSHOP READY. README documents intentionally failing
  acceptance tests on main. No RED execution evidence was collected in this task.
- F003 (Fact, S003): the example is a local browser event checklist. The
  reference scope excludes accounts, shared work, server/database and payments.
- F004 (Fact, S003/S004): S1–S4 have executable Playwright definitions; UAT is
  an unfilled exercise. Definitions alone do not establish gate passage.
- F005 (Decision, S001): use TDPD for subsequent product work in this project.
- F006 (Unknown, NO SOURCE): a human-approved product scope and architecture
  for the next implementation slice have not been supplied.

## Review findings

- G001: workshop reference answers have not been adopted by the human as the
  next product contract. Resolve before Input can pass for implementation.
- G002: S4 requires at least two tasks with one completed, but its test creates
  only one completed task. Expand coverage before claiming full S4 acceptance.
- A001: the reference spec says future date; validation text/test rejects dates
  in the past without defining today's date. Resolve the date boundary before
  implementing or accepting the rule.
- G003: no RED run, GREEN evidence, or human UAT verdict exists in this adoption
  record. Do not imply product acceptance from installer audit success.

These findings do not block installation; G001/G002/A001 matter to the next
product delivery. Context for adoption is Ready; product context remains
Partially ready. The initialized product run stays at Context in progress.

## Decision log

- DL-001: adopt the complete framework (S001 → F005). Decision-maker: user,
  2026-10-10. Status: authorized. Affects AGENTS.md and future delivery gates.
- DL-002: pin the submodule and installed adapter to workshop-v0.3.1
  (S002 → F001). Decision-maker: Codex, 2026-10-10, within setup authorization.
  Criterion: reproducible installation recommended for this workshop starter.
  Alternative: moving main, rejected because it changes the baseline silently.
  Reversible through a reviewed pin update and installer artifact comparison.
- DL-003: initialize a manual run; preserve the existing product and tests
  (S001/S003/S004 → F002/G001). Decision-maker: Codex, 2026-10-10.
  Criterion: connect the method without inventing product approval or RED
  evidence. Future implementation needs its own specification and gate evidence.

## Traceability and status

S001 → F005 → DL-001 → AGENTS.md: methodology adoption.
S002 → F001 → DL-002 → submodule / installed framework / Codex skill.
S003/S004 → F002–F004/G001/G002/A001 → DL-003 → Context run state.

Existing product reference chain (unapproved, unverified):
`workshop/problem.md` → `workshop/spec.md` → S1–S4 in
`workshop/scenarios.md` → corresponding named tests in
`tests/e2e/event-checklist.spec.ts` → pending implementation → `workshop/uat.md`.
Stable RULE IDs, approved architecture, RED evidence, GREEN and UAT are pending.
No product gate is marked passed by methodology installation.
