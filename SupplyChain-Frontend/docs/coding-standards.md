# Coding Standards

Applies to all frontend (React/TypeScript) code. Backend (.NET/C#) follows
standard .NET conventions (PascalCase for public members/types, `Async`
suffix for async methods, camelCase locals) unless the existing codebase
already establishes otherwise — match what's there before introducing a new
pattern.

## 1. Language & components

- TypeScript everywhere. No new `.js`/`.jsx` files. Avoid `any` — if the
  shape is genuinely unknown, use `unknown` and narrow it.
- Functional components + hooks only. No class components, no new lifecycle
  methods.
- One component per file; file name matches the exported component
  (`OrderTable.tsx` exports `OrderTable`).
- Components should be extracted for a real reason — reuse, independent
  testability, or a file that's genuinely hard to navigate — not because
  "components should be small" in the abstract. Wrapping every five lines of
  JSX in its own component creates prop-drilling chains that are harder to
  follow than one slightly longer file.

## 2. Naming conventions

| What | Convention | Example |
|---|---|---|
| Component | PascalCase | `OrderTable`, `SupplierForm` |
| Hook | camelCase, `use` prefix | `useOrders`, `useDebounce` |
| Variables / functions | camelCase | `getTotalPrice` |
| Types / interfaces | PascalCase | `Order`, `SupplierDto` |
| Constants (true constants) | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Files (components) | PascalCase | `OrderTable.tsx` |
| Files (utils/hooks) | camelCase | `formatCurrency.ts`, `useOrders.ts` |
| Folders | kebab-case or camelCase, consistent within the repo | `order-items/` |
| Boolean vars/props | `is`/`has`/`can` prefix | `isLoading`, `hasError`, `canEdit` |

Pick one folder-naming style and apply it everywhere — mixing conventions
within the same repo is worse than picking either one consistently.

## 3. Formatting & linting

- ESLint + Prettier are the source of truth for formatting — don't
  hand-format against personal preference. Run the linter before committing;
  fix warnings, don't suppress them without a documented reason.
- Prefer explicit return types on exported functions/hooks; internal
  functions can rely on inference where it's unambiguous.
- Imports ordered: external packages → internal absolute imports (`shared/*`,
  `features/*`) → relative imports. Enforced via lint rule where possible.

## 4. DRY rules (non-negotiable)

- **No duplicated JSX.** A UI pattern repeated a third time gets extracted
  into a shared component before that third usage is written.
- **No duplicated business logic.** Calculations/validation defined in
  `business-rules.md` live in exactly one function, imported everywhere.
- **No duplicated types.** Domain types are declared once (ideally generated
  from the API spec, see `api-conventions.md`) and imported, never
  redeclared per feature with a slightly different shape.
- **No duplicated constants/enums.** Status values, roles, thresholds live in
  one shared file per domain concept — not as string literals scattered
  through components.
- Before writing a new util/hook/component, search the codebase for an
  existing one that already does this or something close, and extend/reuse
  it rather than creating a near-duplicate.

## 5. Hooks & state

- Custom hooks encapsulate reusable stateful logic and data fetching —
  components stay focused on rendering.
- Don't put data in global state if only one component/subtree uses it —
  default to local `useState`/`useReducer` and lift only when actually
  shared.
- Server data (API responses) is managed by the server-state layer described
  in `architecture.md` — don't copy it into a separate global store.
- Memoize (`useMemo`/`useCallback`/`React.memo`) when there's a measured
  re-render cost, not preemptively on every value.

## 6. Error & loading states

- Every data-fetching hook exposes a consistent `{ data, isLoading, error }`
  (or equivalent) shape — components handle these three states the same way
  everywhere, not with bespoke conditionals per feature.
- User-facing error messages come from the shared error handler
  (see `api-conventions.md` §4), not inline `catch` blocks per call site.

## 7. Testing

- New shared utils, hooks, and business-logic functions require unit tests.
- New components get at least one render/interaction test.
- Test files colocate with the code they test (`OrderTable.test.tsx` next to
  `OrderTable.tsx`).
- Shared test fixtures/utilities live in one `test-utils` module — don't
  duplicate mock setup per test file.

## 8. Commits & PRs

- Small, focused commits/PRs scoped to one feature or fix.
- If a change introduces a new pattern (new shared abstraction, new state
  approach), call it out explicitly in the PR description so it can be
  reviewed as a convention change, not just a diff.

## 9. Related docs

- `architecture.md` — where things live.
- `api-conventions.md` — API client/hook conventions.
- `business-rules.md` — the domain logic these standards protect from
  duplication.
