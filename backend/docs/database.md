# Database Conventions (EF Core)

Our ORM is **Entity Framework Core** (Code-First). This document defines how it must be
used consistently across the project.

## DbContext

- One `AppDbContext` per bounded solution (avoid multiple contexts unless there's a
  strong reason, e.g. separate read/reporting context).
- `DbContext` lives in the **Infrastructure** layer only. Application layer never
  references it directly — only through repository/UnitOfWork interfaces.
- Register with scoped lifetime (default) via `AddDbContext<AppDbContext>()`.

## Entity Configuration

- Use `IEntityTypeConfiguration<T>` classes (one per entity) — never configure entities
  with giant fluent chains inside `OnModelCreating` directly.
- Location: `Infrastructure/Persistence/Configurations/{EntityName}Configuration.cs`
- Apply all configurations via:
  ```csharp
  modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
  ```

## Entities

- Entities live in the Domain layer and should be **rich**, not anemic:
  - Private setters, behavior methods (`order.MarkAsShipped()`) instead of external
    code mutating properties directly.
  - Invariants enforced in the entity itself (e.g. can't ship an order with zero items).
- Use `Guid` or `long` (identity) primary keys consistently per project decision —
  document the choice and stick to it project-wide. Don't mix strategies.
- Add `CreatedAtUtc`, `UpdatedAtUtc`, and `CreatedBy`/`UpdatedBy` audit fields via a
  shared base class or interface (`IAuditableEntity`), applied automatically via
  `SaveChangesAsync` override — never set manually in application code.
- Use soft deletes (`IsDeleted` + global query filter) for entities with audit/compliance
  requirements, rather than hard deletes, unless explicitly told otherwise.

## Repositories & Unit of Work

- Interfaces defined in Application layer (`IOrderRepository`, `IUnitOfWork`).
- Implementations in Infrastructure layer.
- Repository methods are specific and intention-revealing
  (`GetPendingOrdersForSupplierAsync(supplierId)`), **not** a generic
  `GetAll()`/`Find(predicate)` leaking IQueryable everywhere — this avoids business logic
  leaking into the wrong layer and keeps queries centralized and reviewable.
- All writes go through `IUnitOfWork.SaveChangesAsync()` — no calling `SaveChanges()`
  inside repository methods themselves (keeps multi-repository transactions atomic).

## Query Performance Rules

- Use `.AsNoTracking()` for all read-only queries.
- Avoid N+1 queries — use `.Include()`/`.ThenInclude()` deliberately, or projection
  (`.Select()`) into DTOs directly when you don't need the full entity graph.
- Always paginate list endpoints (`Skip`/`Take` or keyset pagination for large tables) —
  never return unbounded result sets.
- Add indexes for any column used in `Where`, `OrderBy`, or `Join` frequently — define
  these in the entity configuration, not as an afterthought.
- Avoid `.ToList()` before filtering — filter in the database, not in memory.

## Migrations

- One migration per logical change, named descriptively:
  ```bash
  dotnet ef migrations add AddReorderPointToInventoryItem
  ```
- Never edit a migration that has already been applied to a shared environment — add a
  new migration instead.
- Review the generated migration before committing — EF Core's auto-generated migration
  is a starting point, not gospel (check for unwanted column drops, incorrect cascade
  behavior, etc.).
- Seed reference/lookup data (e.g. status enums, roles) via `HasData()` in configuration
  classes or a dedicated seeding service — not manual SQL scripts.

## Transactions

- Use `IUnitOfWork` for single-aggregate consistency (default EF Core
  `SaveChangesAsync` already wraps this in a transaction).
- Use explicit `IDbContextTransaction` only when a use case spans multiple
  `SaveChangesAsync` calls that must be atomic together — keep such cases rare and
  well-documented.

## Concurrency

- Use a `RowVersion` (`byte[]`, `[Timestamp]`) column on entities prone to concurrent
  edits (e.g. Inventory stock levels) to prevent lost updates — handle
  `DbUpdateConcurrencyException` explicitly and return a meaningful conflict response.

## Connection Strings & Secrets

- Never hardcode connection strings. Use `appsettings.json` for structure only, and
  `appsettings.Development.json` / environment variables / user secrets / Key Vault for
  actual values.
- Local dev: `dotnet user-secrets` for connection strings — never commit real
  credentials.
