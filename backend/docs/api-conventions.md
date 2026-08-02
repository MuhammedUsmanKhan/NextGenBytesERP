# API Conventions

## Routing

- Use attribute routing: `[Route("api/v{version:apiVersion}/[controller]")]`
- Resource-based, plural nouns: `/api/v1/purchase-orders`, not `/api/v1/getPurchaseOrders`
- Nesting only one level deep where it represents true ownership:
  `/api/v1/suppliers/{supplierId}/purchase-orders`
- Use kebab-case in URLs, camelCase in JSON bodies.

## HTTP Verbs & Status Codes

| Verb | Use | Success Code |
|---|---|---|
| GET | Read (single or list) | 200 |
| POST | Create | 201 (with `Location` header) |
| PUT | Full update/replace | 200 or 204 |
| PATCH | Partial update | 200 or 204 |
| DELETE | Remove (or soft-delete) | 204 |

Error codes:
- `400` – validation error / malformed request
- `401` – not authenticated
- `403` – authenticated but not authorized
- `404` – resource not found
- `409` – conflict (e.g. concurrency, duplicate)
- `422` – business rule violation (semantically valid request, rejected by domain rules)
- `500` – unhandled server error (never expose stack traces to the client)

## Versioning

- Use URL-segment versioning (`/api/v1/...`) via `Asp.Versioning.Mvc`.
- Never make a breaking change to an existing version. Introduce `v2` instead.
- Deprecated versions must be documented and given a sunset date.

## Standard Response Envelope

All API responses follow a consistent shape so the frontend can handle them uniformly:

**Success:**
```json
{
  "success": true,
  "data": { },
  "message": null,
  "traceId": "0HN..."
}
```

**Paginated list:**
```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 134,
    "totalPages": 7
  },
  "traceId": "0HN..."
}
```

**Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "sku", "message": "SKU is required." }
  ],
  "message": "Validation failed.",
  "traceId": "0HN..."
}
```

This envelope is applied via a global result filter / exception middleware in the Api
layer — controllers do **not** manually build this shape per action.

## DTOs

- Every endpoint uses explicit Request/Response DTOs — never bind directly to EF Core
  entities.
- Naming: `CreatePurchaseOrderRequest`, `PurchaseOrderResponse`,
  `UpdateInventoryItemRequest`.
- Validation via FluentValidation validators, auto-invoked through a pipeline behavior
  or action filter — not manually called `if (!ModelState.IsValid)` scattered per action.

## Controllers

- Thin. A controller action should:
  1. Receive the request DTO
  2. Call one Application-layer service/handler
  3. Map the result to a response DTO (or let the handler return the DTO directly)
  4. Return the appropriate `IActionResult`
- No `try/catch` in controllers for expected business exceptions — let global exception
  middleware translate Domain/Application exceptions into the correct HTTP status +
  envelope.

## Authentication & Authorization

- JWT Bearer authentication.
- Use policy-based authorization (`[Authorize(Policy = "InventoryManager")]`), not
  scattered role-string checks (`[Authorize(Roles = "Admin,Manager")]`) once the app
  grows past a handful of roles.
- Ownership/tenant checks happen in the Application layer (not just role checks) —
  a user with the right role must still only touch data they're allowed to.

## Swagger / OpenAPI

- Every endpoint must have:
  - Summary and description (`[EndpointSummary]`/XML doc comments)
  - Documented response types (`[ProducesResponseType]`) for success and error cases
  - Example request/response where the shape isn't obvious
- Group by module/tag so the generated docs mirror the business domains
  (Inventory, Procurement, Suppliers, etc.), not by controller class name alone.

## Idempotency

- For POST endpoints that trigger external side effects (e.g. payment, sending a PO to
  a supplier), support an `Idempotency-Key` header to prevent duplicate processing on
  retry.
