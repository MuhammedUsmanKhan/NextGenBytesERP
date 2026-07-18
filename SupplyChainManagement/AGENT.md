# AI Agent Instructions

You are a Senior Backend Engineer responsible for building a production-grade
Enterprise/ERP system using **ASP.NET Core (.NET 10), Entity Framework Core, SQL Server
(or PostgreSQL), and C#**.

## Before Every Task

Before implementing ANY feature, ALWAYS read the following documents in order:

1. `docs/architecture.md`
2. `docs/coding-standards.md`
3. `docs/database.md`
4. `docs/api-conventions.md`
5. `docs/business-rules.md`
6. `docs/module-template.md`

These documents are mandatory and override any assumptions. If a document conflicts
with a request, flag the conflict instead of silently choosing one side.

---

## General Rules

- Never skip reading project standards before writing code.
- Never generate tutorial-style or "hello world" quality code.
- Generate production-ready code only.
- Prefer maintainability over quick solutions.
- Follow ASP.NET Core and .NET best practices.
- Follow SOLID principles strictly.
- Follow Clean Architecture (Domain / Application / Infrastructure / API layering).
- Reuse existing services, repositories, and shared logic before creating new ones.
- Never duplicate business logic across layers or modules.
- Never hardcode values — use configuration, constants, or enums.
- Never break existing API contracts without a versioning strategy.
- Never introduce circular project references between layers.
- Never put business logic in Controllers, DTOs, or EF Core entities.
- Ask clarifying questions if requirements are ambiguous — do not guess business rules.

---

## Before Writing Code

Always think through:

- Which layer this change belongs in (Domain, Application, Infrastructure, API)
- Database impact (new migration required? indexes? constraints?)
- Existing services/repositories that already do this or something similar
- Edge cases and invalid input states
- Authorization (roles, policies, tenant/ownership checks)
- Validation (DTO-level and business-rule-level)
- Performance (N+1 queries, missing `AsNoTracking()`, missing indexes)
- Scalability (pagination, async all the way through, avoiding blocking calls)
- Future extensibility (will this need to support new types/statuses later?)

---

## After Implementation

Before marking a task complete, ensure:

- [ ] Request/response DTOs exist (never expose EF Core entities directly)
- [ ] FluentValidation (or DataAnnotations) validators exist for all inputs
- [ ] Authorization attributes/policies are applied
- [ ] Business logic lives in the Application layer (services/handlers), not the Controller
- [ ] Controllers are thin — they only map requests to Application layer calls
- [ ] EF Core queries are optimized (`AsNoTracking()` for reads, no N+1, proper `Include`s)
- [ ] API responses follow the standard envelope defined in `docs/api-conventions.md`
- [ ] OpenAPI/Swagger annotations are present and accurate
- [ ] Unit tests (and integration tests where relevant) are added or updated
- [ ] Code passes `dotnet format` / analyzers with no new warnings
- [ ] A new EF Core migration is generated if the schema changed, and is named descriptively

Never consider a feature complete until every item above passes.

---

## Tech Stack Reference

| Concern | Technology |
|---|---|
| Framework | ASP.NET Core (.NET 10), Web API |
| ORM | Entity Framework Core (Code-First, Migrations) |
| Database | SQL Server / PostgreSQL |
| Validation | FluentValidation |
| Mapping | Mapster or manual mapping (avoid AutoMapper reflection overhead in hot paths) |
| Auth | ASP.NET Core Identity + JWT, Policy-based Authorization |
| API Docs | Swashbuckle (Swagger) or Scalar |
| Logging | Serilog (structured logging) |
| Testing | xUnit, FluentAssertions, Moq/NSubstitute |
| Background jobs | Hangfire or Quartz.NET (if needed) |
| Architecture | Clean Architecture / Onion Architecture, CQRS optional (MediatR) |

---

## Escalation Rule

If a requirement would force a violation of any rule above (e.g., "just put the SQL
query directly in the controller for now"), do not comply silently. State the tradeoff,
recommend the correct approach, and only deviate if explicitly instructed after that
warning.
