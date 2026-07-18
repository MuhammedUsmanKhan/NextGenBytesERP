# AGENT.md — SupplyChainManagement

This file instructs any AI coding agent (opencode, Claude Code, Copilot Agent, etc.)
working in this repository. Read it fully before writing or modifying code.

## 1. Required reading before any task

Before generating, editing, or reviewing code, always consult the relevant files
in `docs/`. Do not guess at conventions that are already documented.

| Doc | Read it when... |
|---|---|
| `docs/architecture.md` | Adding a module, service, layer, or changing how components/folders relate to each other |
| `docs/api-conventions.md` | Creating or modifying any API call, endpoint, request/response shape, or client hook |
| `docs/business-rules.md` | Implementing logic that touches domain rules (pricing, inventory, orders, approvals, etc.) |
| `docs/coding-standards.md` | Any code change — naming, formatting, linting, file structure |

`docs/database.md` lives in the backend project, not here. This repo's agent
should treat the database as the backend's concern: consume it only through
the API contract in `api-conventions.md`, and never assume or hardcode a
table/column shape. If a task seems to require knowing the actual schema
(not just the API response shape), that's a signal to check with the backend
repo/docs rather than guessing.

**Rule:** if a task spans more than one concern (e.g. "add a new order status"),
read *all* the docs that apply before writing code, not just the most obvious one.
If two docs conflict, `coding-standards.md` and `architecture.md` win for
structure/style; `business-rules.md` wins for behavior/domain logic. Flag the
conflict to the user rather than silently picking one.

## 2. Project intent

This is a Supply Chain Management system. The agent's job is to keep the
codebase **consistent** (matches existing patterns), **DRY** (no duplicated
logic/markup/types), and **scalable** (new features slot in without rewriting
existing structure). Optimize for the next developer reading the diff, not for
the fastest way to make it work.

## 3. React front-end rules

### 3.1 Structure
- Feature-first folder layout: `src/features/<feature>/{components,hooks,api,types,utils}`.
  Only put things in a shared/common folder (`src/shared` or `src/components`)
  once a piece of code is used by **2+ features** — don't pre-abstract.
- One component per file. File name matches the component name (`OrderTable.tsx`
  exports `OrderTable`).
- Colocate a component's styles, tests, and stories next to the component, not
  in parallel top-level trees.

### 3.2 DRY principles (enforced, not optional)
- **No copy-pasted JSX blocks.** If a UI pattern (card, table row, form field
  group, empty state, error banner) appears twice, extract it into a shared
  component before writing the third usage.
- **No duplicated business logic in components.** Validation, calculations,
  and formatting rules from `business-rules.md` belong in `src/shared/lib` or
  a feature's `utils`, imported everywhere they're needed — never re-implemented
  inline.
- **No duplicated API call logic.** All HTTP calls go through a single typed
  API client (per `api-conventions.md`). Wrap each resource in a hook
  (`useOrders`, `useShipments`) rather than calling `fetch`/`axios` directly
  inside components.
- **Single source of truth for types.** Domain types (Order, Shipment, Supplier,
  etc.) are generated or defined once in `src/types` (or from the API schema)
  and imported — never redeclared per-feature.
- **Constants and enums** (statuses, roles, thresholds from `business-rules.md`)
  live in one shared constants file per domain concept, not sprinkled as string
  literals across components.
- Before adding a new util/hook/component, search the codebase for an existing
  one that does the same or similar thing and extend/reuse it instead of
  creating a near-duplicate.

### 3.3 Components & state
- Functional components + hooks only. No class components.
- Keep components small and single-purpose: presentational components receive
  props and render; container/feature components own data-fetching and state.
- Local UI state → `useState`/`useReducer`. Cross-feature/shared state → the
  project's chosen state manager (check `architecture.md` for which one is in
  use before introducing a new one).
- Derive state instead of duplicating it (e.g. don't store `filteredOrders` in
  state if it can be computed from `orders` + `filter` on render/`useMemo`).

### 3.4 API layer
- Follow `api-conventions.md` exactly for request shape, error handling format,
  auth headers, and pagination — do not invent a different pattern for a new
  endpoint.
- Centralize error handling (toast/logging) in the API client or a shared hook,
  not per call site.

### 3.5 Styling
- Use whatever styling system is already established in the repo (check
  `architecture.md` / existing components first). Don't mix a new styling
  approach into a codebase that already has one.
- Shared design tokens (spacing, colors, typography) come from one place; no
  hardcoded magic values duplicated across components.

### 3.6 Testing
- New shared utils, hooks, and business-logic functions require unit tests.
- New components get at least a render/interaction smoke test.
- Don't duplicate test setup/fixtures — put shared test utilities in a single
  `test-utils` module.

## 4. Workflow for the agent

1. Identify which doc(s) in `docs/` govern the task (§1).
2. Search the existing codebase for similar/reusable code before writing new code.
3. Implement following the structure and DRY rules above.
4. If the change introduces a new pattern (new folder, new state approach, new
   shared abstraction), note it explicitly in the PR/commit description and,
   if it changes a standing convention, flag that `docs/architecture.md` or
   `docs/coding-standards.md` should be updated to reflect it.
5. Never silently deviate from a documented convention — if a doc's guidance
   seems wrong or outdated for the task, say so and ask, rather than working
   around it quietly.

## 5. What not to do

- Don't create a new component/hook/util that duplicates existing functionality.
- Don't inline business rules that are already defined in `business-rules.md`.
- Don't bypass the shared API client to call an endpoint directly.
- Don't introduce a new state-management or styling library without checking
  `architecture.md` first.
- Don't leave TODOs for conventions you could have looked up in `docs/`.
