---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/styles.css","index.html"]
---

# Event application queue

Mode: Operate. Scope: src/App.tsx, src/styles.css, index.html.
Organizer finds returned applications and preparation remaining; approver finds
applications awaiting a decision. Both inspect the canonical application.
One durable lifecycle: pending, returned/resubmit, approved, preparation, ready.

Direction: Очередь действий, seed d056bc38, delegated model-pick. Code-led build,
critique reference .impeccable/mocks/decision/model-pick.png, no approved comp.
First viewport: product+roles, registry title, filters, title search, task rows
with full state/comment/remaining/readiness and one role-aware opening action.
Signature interaction: the same row opens the current required action; a return
never starts preparation. Filters derive readiness from the same task array.
Motion grammar: immediate navigation/focus, only progress state transition,
reduced-motion fallback. No staged entry animation.

Constraints: preserve localstorage key/schema, corrupt-data recovery, role guards,
four authorized temporary tasks and mandatory return comment; no fake entities,
commercial claims, extra editable fields, dates, or fabricated history.
Empty and no-result differ; every removed write control recovers keyboard focus.
Responsive row reflow retains full contents and semantic table roles.

Human UAT and external HTTPS deployment await final engineering checks/plan.
