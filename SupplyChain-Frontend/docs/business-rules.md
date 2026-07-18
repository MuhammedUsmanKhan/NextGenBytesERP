# Business Rules

> **This file is a starting scaffold, not a finished spec.** Unlike
> architecture/API/coding/database conventions, business rules aren't
> something that can be pulled from "industry standards" — they're specific
> to *this* organization's supply chain (approval thresholds, statuses,
> who's allowed to do what). Below is the standard shape such a document
> takes in supply chain / order-management systems, with common domain
> concepts pre-listed as placeholders. Replace the bracketed items with your
> actual rules; delete sections that don't apply.

## 1. Purpose

This document is the single source of truth for domain/business logic —
rules the code must enforce regardless of which feature or layer implements
it. Frontend and backend both implement these rules identically; if they
diverge, this document is used to resolve which one is correct.

## 2. Core entities & statuses

Define the valid lifecycle for each entity once here — the frontend and
backend both reference this list rather than each maintaining their own.

### Order
- Statuses: `[draft → submitted → approved → fulfilled → closed]` /
  `[cancelled]` — confirm actual states and allowed transitions.
- Who can transition an order between which statuses: `[roles/permissions]`.
- What happens on cancellation (stock release, notifications, etc.):
  `[rule]`.

### Inventory / Stock
- Reorder point / safety stock rule: `[e.g. reorder when quantity < threshold]`.
- Reservation rule (does an order reserve stock immediately or on approval?):
  `[rule]`.
- Negative stock allowed? `[yes/no + conditions]`.

### Supplier
- Approval/vetting requirements before a supplier can receive orders:
  `[rule]`.
- Rules for deactivating/blacklisting a supplier: `[rule]`.

### Shipment
- Valid statuses and transitions: `[rule]`.
- SLA / delay handling: `[rule]`.

## 3. Validation rules

List domain-level validation that goes beyond basic type/format checks
(those live in `api-conventions.md`'s request validation, not here):

- `[e.g. Order quantity must not exceed available + on-order stock unless
  backorder is explicitly enabled.]`
- `[e.g. A purchase order above $X requires a second approver.]`

## 4. Roles & permissions

| Role | Can do | Cannot do |
|---|---|---|
| `[e.g. Buyer]` | `[create/submit orders]` | `[approve own orders]` |
| `[e.g. Approver]` | `[approve/reject orders]` | `[edit order lines]` |
| `[e.g. Warehouse]` | `[update shipment/fulfillment status]` | `[edit pricing]` |

## 5. Calculations

Any formula used in more than one place is defined once here and implemented
in exactly one shared function (per the DRY rules in `coding-standards.md`) —
never recalculated inline per component/endpoint.

- `[e.g. Order total = sum(line.quantity * line.unitPrice) - discounts + tax]`
- `[e.g. Days of stock remaining = current stock / average daily usage]`

## 6. Notifications / side effects

- `[e.g. Supplier is notified by email when an order is approved.]`
- `[e.g. Low-stock alert triggers when quantity crosses the reorder point.]`

## 7. How to use this doc as an agent

- Before implementing anything touching order status, stock, approvals, or
  pricing, check this file first.
- If a rule needed for the task isn't documented here yet, don't guess —
  ask, then add the answer back into this file so it's captured for next
  time.
- If a rule here conflicts with what the existing code actually does, flag
  the discrepancy rather than silently picking one as correct.

## 8. Related docs

- `database.md` — how these entities/statuses are persisted.
- `api-conventions.md` — how these rules surface as API validation/errors.
- `coding-standards.md` — where shared rule/calculation logic should live in
  the frontend codebase.
