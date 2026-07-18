# API Conventions

These are the conventions the frontend assumes the API follows, and that any
new backend endpoint must follow, based on current REST API design standards.
Consistency here is what lets the frontend use one generic API client instead
of one-off handling per endpoint.

## 1. Resource naming

- URLs use **nouns, not verbs** — the HTTP method carries the action.
  - Good: `GET /orders`, `POST /orders`, `DELETE /orders/42`
  - Bad: `GET /getOrders`, `POST /createOrder`
- Collections are **plural**: `/orders`, `/suppliers`, `/shipments`.
- Lowercase, hyphen-separated for multi-word resources: `/order-items`, not
  `/orderItems` or `/order_items`.
- Nest **at most one level deep**: `/suppliers/42/orders` is fine;
  `/suppliers/42/orders/7/items` is not — give `order-items` its own top-level
  resource instead and filter by query param if needed.
- Filtering/sorting/search/pagination are **query params**, never path
  segments: `GET /orders?status=pending&sort=-createdAt&page=2`.

## 2. HTTP methods & status codes

| Method | Use | Success code |
|---|---|---|
| GET | Read (collection or item) | 200 |
| POST | Create | 201 Created |
| PUT | Replace a resource entirely | 200 |
| PATCH | Partial update | 200 |
| DELETE | Remove | 200 or 204 |

- `422 Unprocessable Entity` for validation failures, `409 Conflict` for
  state conflicts, `404` for missing resources, `401`/`403` for auth issues,
  `429` for rate limiting, `5xx` for server errors. Don't overload `400` for
  everything.
- State transitions that don't map to plain CRUD (e.g. "cancel an order") use
  a noun sub-resource, not a verb in the URL:
  `POST /orders/42/cancellation` rather than `POST /orders/42/cancel`.

## 3. Versioning

- URL path versioning: `/api/v1/orders`. Simple, explicit, easy to debug —
  the default choice unless the backend docs specify otherwise.
- A version is a contract: no breaking changes within a version. Breaking
  changes ship as a new version (`/api/v2/...`), with the old version kept
  alive for a published deprecation window and a `Deprecation`/`Sunset`
  header on legacy responses.

## 4. Request / response shape

Successful responses wrap the payload in a `data` envelope, with optional
pagination metadata:

```json
{
  "data": { "id": "ord_123", "status": "pending" },
  "meta": { "page": 1, "perPage": 20, "total": 134, "totalPages": 7 }
}
```

Errors always share **one shape**, regardless of status code, so the client
can handle them generically:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      { "field": "quantity", "message": "Must be greater than 0." }
    ],
    "requestId": "req_abc123"
  }
}
```

Frontend rule: **all** error handling goes through one shared parser/handler
in the API client (`shared/lib/api-client`) that reads `error.code` — don't
write bespoke `try/catch`/string-matching per feature.

- Timestamps: ISO 8601 UTC (`2026-07-12T10:30:00Z`).
- IDs: prefer opaque string IDs (`ord_123`) or the type already used in the
  existing backend models — don't invent a second ID format for new features.

## 5. Pagination, filtering, sorting

- Never return an unbounded list. Every collection endpoint paginates.
- Offset pagination (`?page=2&limit=20`) is fine for admin/back-office lists;
  use cursor pagination (`?cursor=...&limit=20`) for large or fast-changing
  collections.
- Sorting: `?sort=-createdAt` (leading `-` = descending), comma-separated for
  multiple fields: `?sort=-createdAt,name`.
- Filtering: one query param per filterable field
  (`?status=active&supplierId=42`); ranges as `?createdAfter=...&createdBefore=...`.

## 6. Auth

- `Authorization: Bearer <token>` header. Never pass tokens as query params
  (they leak into logs and browser history).
- Frontend: attach the token in one place (API client interceptor), not
  per-call.

## 7. Frontend consumption rules (DRY)

- One typed API client wraps every HTTP call (base URL, auth header, error
  parsing, retries). Feature code never calls `fetch`/`axios` directly.
- Each feature exposes typed hooks (`useOrders`, `useCreateOrder`) built on
  top of the shared client — these are the only way components touch the API.
- Request/response types are defined once (ideally generated from the
  backend's OpenAPI spec) and imported, never re-declared per feature.
- If the backend publishes an OpenAPI/Swagger spec, prefer generating the
  TypeScript client/types from it over hand-writing them, to avoid drift.

## 8. Related docs

- `architecture.md` — where API hooks/clients live in the folder structure.
- `business-rules.md` — domain rules that determine what an endpoint should
  accept/reject (validation beyond basic shape).
- `coding-standards.md` — naming/formatting for the generated client code.
