# Business Rules

This document is the **source of truth for domain/business logic**. It must be kept up
to date as the ERP grows. The agent must never invent business rules that aren't
documented here — if a rule is unclear or missing, ask instead of assuming.

> This file currently contains a starter structure. Fill in each module's real rules as
> they're defined for this project (e.g. Supply Chain Management specifics).

## How to Add a Rule

Each rule should include:
- **Rule ID** (for traceability, e.g. `INV-001`)
- **Statement** — plain-language description
- **Enforced where** — which layer/class enforces it (should usually be Domain)
- **Failure behavior** — what happens when violated (exception type, error code)

---

## Module: Inventory

| ID | Rule | Enforced Where | On Violation |
|---|---|---|---|
| INV-001 | Stock quantity can never go negative. | `InventoryItem.Deduct()` (Domain) | Throws `InsufficientStockException` → 422 |
| INV-002 | An item below its reorder point should trigger a reorder suggestion. | `InventoryReorderDomainService` | Domain event `LowStockDetected` |
| INV-003 | SKU must be unique per warehouse. | Validator + unique DB constraint | 409 Conflict |

## Module: Procurement

| ID | Rule | Enforced Where | On Violation |
|---|---|---|---|
| PROC-001 | A Purchase Order cannot be approved by the same user who created it. | `PurchaseOrderApprovalService` | Throws `SelfApprovalNotAllowedException` → 403 |
| PROC-002 | PO total must match sum of line items exactly (no rounding drift beyond 2 decimals). | `PurchaseOrder` entity invariant | Throws `InvalidOrderTotalException` → 422 |

## Module: Suppliers

| ID | Rule | Enforced Where | On Violation |
|---|---|---|---|
| SUP-001 | A supplier cannot be deactivated while they have open Purchase Orders. | `SupplierDeactivationService` | 422 with explanatory message |

## Module: Warehouse

_(Add rules as this module is built.)_

## Module: Finance / Invoicing

_(Add rules as this module is built.)_

---

## General ERP-Wide Rules

- All monetary values are stored as `decimal`, never `float`/`double`.
- All monetary values are stored with an explicit currency — no implicit
  single-currency assumption once multi-currency is in scope.
- All dates affecting business logic (order dates, due dates) are stored in UTC and
  converted to local time only at the presentation layer.
- Audit trail (who did what, when) is required for any state-changing action on core
  entities (Orders, Inventory adjustments, Approvals).

## Process for Updating This File

1. When a new business rule is introduced (by a stakeholder, ticket, or spec), add it
   here **before** implementation, with an ID.
2. Reference the Rule ID in code comments and commit messages where it's enforced.
3. If a rule changes, update this file in the same PR that changes the code.
