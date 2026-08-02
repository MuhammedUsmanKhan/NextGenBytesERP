# Architecture

This document defines the target architecture for the NextGenBytes.ERP
front end (React) and how it relates to the backend. It is written from
current (2026) industry-standard practice for scalable React applications and
should be treated as the source of truth for structural decisions.

## 1. High-level shape

- **Backend:** .NET API (see the project's `.csproj`), exposing a versioned
  REST API. Contract is documented in `api-conventions.md`.
- **Frontend:** React SPA, TypeScript, feature-based architecture.
- Communication is REST + JSON over HTTPS. No direct DB access from the client.

## 2. Feature-based folder structure

React projects that group files by *type* (`components/`, `hooks/`, `pages/`)
scale poorly past ~15–20 components — everything related to one feature ends
up scattered across the tree, and touching a feature means opening files in
five different folders. The current standard, used by production-grade React
codebases (e.g. bulletproof-react), is to group by **feature/domain** instead:

```
src/
├── app/                # App shell: routing, providers, layout
│   ├── routes/
│   └── providers/
├── features/            # Self-contained business domains
│   ├── orders/
│   │   ├── api/         # API calls + query hooks for this feature
│   │   ├── components/  # Components scoped to this feature
│   │   ├── hooks/        # Hooks scoped to this feature
│   │   ├── types/         # TypeScript types for this feature
│   │   ├── utils/          # Feature-local helpers
│   │   └── index.ts          # Public exports of the feature
│   ├── inventory/
│   ├── suppliers/
│   └── shipments/
├── shared/               # Generic, reusable, feature-agnostic code
│   ├── components/        # Button, Modal, Input, Table, etc.
│   ├── hooks/               # useDebounce, usePagination, etc.
│   ├── utils/                 # formatDate, currency, etc.
│   └── lib/                    # API client, config, constants
├── types/                       # Cross-feature domain types (if not API-generated)
└── main.tsx
```

Rules:
- Only include the sub-folders a feature actually needs — don't scaffold
  empty `stores/`/`utils/` folders "just in case."
- A component only moves into `shared/components` once it's used by **2 or
  more features**. Don't pre-abstract before that.
- **Unidirectional imports:** `shared` → `features` → `app`. Shared code never
  imports from a feature. Features never import from another feature's
  internals — only from that feature's public `index.ts`, or better, compose
  them at the `app`/page level. This keeps features deletable and independent.

## 3. Separation of concerns

- **Presentational components** — receive props, render UI, no data fetching,
  no business logic. Easy to test, easy to reuse.
- **Container / feature components** — own data fetching (via hooks) and
  compose presentational components.
- **Business logic** (calculations, validation, rules from `business-rules.md`)
  lives in plain functions in `utils/` or `lib/`, never inline in JSX or
  duplicated across components.
- **API access** goes through one typed API client (`shared/lib/api-client`)
  and feature-scoped hooks (e.g. `useOrders`, `useShipments`) — components
  never call `fetch`/`axios` directly.

## 4. State management

Don't reach for global state by default. Rule of thumb:

| Kind of state | Where it lives |
|---|---|
| Used by one component only | `useState` / `useReducer`, local |
| Used by a small component subtree | Lifted to the nearest common parent, passed as props, or a scoped context |
| Server data (API responses, cache, loading/error) | A server-state library (e.g. TanStack Query) — **never** duplicated into global client state |
| Genuinely global client state (auth session, theme, active locale) | A lightweight global store (e.g. Zustand/Redux Toolkit — confirm which one this repo already uses before introducing a new one) |

Server state and client state are different problems and should not be mixed
in the same store — this avoids duplicated, stale copies of API data.

## 5. Routing

- Route definitions live in `app/routes`.
- Pages compose features; they don't contain business logic themselves.
- Lazy-load routes and heavy feature bundles with `React.lazy` + `Suspense` to
  keep initial bundle size scalable as features are added.

## 6. Scalability guidelines

- A feature should be deletable by deleting its folder. If deleting a feature
  breaks another feature, the boundary is wrong.
- New domain concepts (e.g. a new "Returns" module) get their own feature
  folder from day one — don't bolt them onto an existing unrelated feature.
- When a feature genuinely grows large (multiple sub-domains), it's fine to
  nest further (`features/orders/{returns,fulfillment}`) rather than forcing
  everything into one flat folder.
- Enforce the import boundaries above with lint rules
  (`eslint-plugin-import`'s `no-restricted-paths` or equivalent) once the team
  is more than a couple of people, so violations fail CI instead of relying on
  review discipline.

## 7. Related docs

- `coding-standards.md` — naming, formatting, component/hook conventions.
- `api-conventions.md` — how features talk to the backend.
- `database.md` — how backend data is modeled (for context when shaping
  frontend types/DTOs).
- `business-rules.md` — domain rules that must be reflected consistently
  across features.
