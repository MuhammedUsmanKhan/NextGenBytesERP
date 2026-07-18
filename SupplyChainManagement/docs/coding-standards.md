# Coding Standards

## C# Language Conventions

- Use **file-scoped namespaces**: `namespace SupplyChainManagement.Application.Modules.Inventory;`
- Enable and respect `Nullable` reference types (`<Nullable>enable</Nullable>`). Never
  suppress with `!` unless truly justified with a comment.
- Use `record` types for immutable DTOs and Value Objects.
- Use `sealed` on classes not designed for inheritance (most classes, by default).
- Prefer `IReadOnlyList<T>` / `IReadOnlyCollection<T>` over `List<T>` in public APIs
  and return types.
- Use `async`/`await` all the way through — never block on async code with `.Result`
  or `.Wait()`.
- Always pass and honor `CancellationToken` in async methods that touch I/O.
- Use primary constructors for simple DI-injected services (C# 12+) where it improves
  readability, but don't force it where a full constructor with validation is clearer.
- Naming:
  - `PascalCase` for classes, methods, properties, public fields
  - `camelCase` for local variables and parameters
  - `_camelCase` for private fields
  - Interfaces prefixed with `I` (`IOrderRepository`)
  - Async methods suffixed with `Async` (`GetOrderByIdAsync`)

## SOLID Principles — Enforced

- **S — Single Responsibility**: A service does one thing. If a class name has "And" or
  "Manager" doing five unrelated things, split it.
- **O — Open/Closed**: Prefer adding new strategy/handler classes over modifying large
  `switch` statements repeatedly. Use polymorphism or the Strategy pattern for
  business-rule variants (e.g. different discount calculation rules per customer type).
- **L — Liskov Substitution**: Derived classes must be substitutable for their base
  types without surprising behavior. Don't override a method to throw
  `NotImplementedException`.
- **I — Interface Segregation**: Prefer several small interfaces
  (`IOrderReader`, `IOrderWriter`) over one large `IOrderRepository` with 20 methods,
  when consumers only need a subset.
- **D — Dependency Inversion**: Application layer depends on abstractions
  (`IInventoryRepository`), never on EF Core or concrete Infrastructure classes directly.

## DRY — Don't Repeat Yourself

- Before writing a new service/method, **search the codebase for an existing one that
  does the same or similar thing.** Reuse or extend it instead of duplicating.
- Shared business rules (e.g. "how do we calculate reorder point?") must live in **one**
  place — a domain service or domain method — and be called from everywhere it's needed,
  never re-implemented per module.
- Shared validation logic (e.g. SKU format, tax ID format) goes into shared
  `FluentValidation` custom validators, reused across DTOs.
- Common query patterns (pagination, filtering, sorting) go into a shared base
  repository/specification helper — not copy-pasted into every repository.
- Common API response shaping goes into a single response wrapper/filter — not
  reimplemented per controller.

## What NOT to Do

- ❌ Business logic inside Controllers
- ❌ Business logic inside EF Core entity configuration classes
- ❌ Direct `DbContext` usage inside Controllers
- ❌ Returning EF Core entities directly from an API endpoint
- ❌ Catching generic `Exception` and swallowing it silently
- ❌ Hardcoded connection strings, magic numbers, or magic strings (use `IOptions<T>`,
  constants, or enums)
- ❌ God classes / God services that touch five unrelated modules
- ❌ `static` mutable state used as a shortcut for DI

## Formatting & Tooling

- Code must pass `dotnet format` before being considered complete.
- Follow `.editorconfig` rules (to be committed at solution root).
- Enable nullable warnings as errors in CI for the Domain and Application projects at minimum.
- Use analyzers: `Microsoft.CodeAnalysis.NetAnalyzers`, `StyleCop.Analyzers` (or
  equivalent) to catch violations automatically rather than relying on manual review.

## Comments & Documentation

- XML doc comments (`///`) on public interfaces and non-obvious methods, especially in
  the Application and Domain layers.
- Comments explain **why**, not **what** — the code should already say what it does.
- No commented-out dead code committed.
