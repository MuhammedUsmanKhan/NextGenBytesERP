# Architecture

This project follows **Clean Architecture** (also called Onion Architecture), adapted
for ASP.NET Core. The goal: business logic never depends on frameworks, databases, or
the web layer. Dependencies always point **inward**.

## Solution Structure

```
SupplyChainManagement.sln
│
├── src/
│   ├── SupplyChainManagement.Domain/          # Enterprise business rules
│   ├── SupplyChainManagement.Application/     # Application/use-case logic
│   ├── SupplyChainManagement.Infrastructure/  # EF Core, external services
│   └── SupplyChainManagement.Api/             # Controllers, middleware, DI wiring
│
└── tests/
    ├── SupplyChainManagement.UnitTests/
    └── SupplyChainManagement.IntegrationTests/
```

## Dependency Rule

```
Api  →  Application  →  Domain
 ↑
Infrastructure  →  Application  →  Domain
```

- **Domain** depends on nothing. No EF Core, no ASP.NET Core, no third-party packages
  beyond maybe base primitives.
- **Application** depends only on Domain. Defines interfaces (`IOrderRepository`,
  `IEmailService`) that Infrastructure implements.
- **Infrastructure** depends on Application (to implement its interfaces) and Domain.
  Contains EF Core `DbContext`, repository implementations, external API clients.
- **Api** depends on Application and Infrastructure (only at composition-root/DI
  registration level). Controllers only talk to Application.

**Rule: Infrastructure and Api must never be referenced by Domain or Application.**

## Layer Responsibilities

### Domain Layer
- Entities (rich domain models, not anemic data bags — put invariants here)
- Value Objects
- Domain Events
- Domain Exceptions
- Enums / constants that represent business concepts
- No persistence concerns, no DTOs, no framework references

### Application Layer
- Use cases / application services (e.g. `CreatePurchaseOrderService`)
- DTOs (Request/Response models used at the boundary)
- Interfaces for infrastructure concerns (`IUnitOfWork`, `IOrderRepository`, `ICurrentUserService`)
- Validators (FluentValidation)
- Mapping profiles (Domain ↔ DTO)
- Optional: CQRS via MediatR (Commands/Queries + Handlers) for larger modules

### Infrastructure Layer
- `AppDbContext` (EF Core) and entity configurations (`IEntityTypeConfiguration<T>`)
- Repository implementations
- Migrations
- External integrations (email, file storage, payment gateways, message queues)
- Caching implementation (Redis, in-memory)

### Api Layer
- Controllers (thin — map HTTP to Application calls, nothing more)
- Middleware (exception handling, logging, correlation IDs)
- DI registration (`Program.cs`, `ServiceCollectionExtensions`)
- Auth configuration
- Swagger/OpenAPI configuration

## Module Organization (Feature-based, inside each layer)

Rather than grouping by technical type only, group by business feature/module inside
each layer, e.g.:

```
Application/
  Modules/
    Inventory/
      Commands/
      Queries/
      Dtos/
      Validators/
    Procurement/
    Warehouse/
    Suppliers/
```

This keeps a module's logic together and mirrors how ERP business domains are
naturally organized (Inventory, Procurement, Sales, Warehouse, Finance, etc.), making
it easy to reuse and avoid duplicating logic across modules.

## Cross-Cutting Concerns

- **Logging**: Serilog, injected via `ILogger<T>`, structured (no string concatenation).
- **Exception Handling**: Global exception middleware in Api layer maps Domain/Application
  exceptions to proper HTTP status codes — no `try/catch` scattered in controllers.
- **Transactions**: Unit of Work pattern in Application layer, implemented in Infrastructure.
- **Multi-tenancy (if applicable)**: `ICurrentUserService`/`ITenantContext` resolved per request,
  applied via EF Core global query filters — never trust tenant ID from the request body.

## When Adding a New Module

Follow `docs/module-template.md` exactly. Do not invent a new folder structure per module.
