# NextGenBytes.ERP — Backend Coding Guidelines

> **Read this entire file before writing a single line of code.**
> Every new module, entity, service, and controller must follow this
> structure exactly. No new patterns. No new folders. No exceptions
> without updating this document first.

---

## 1. Solution Structure

```
NextGenBytes.ERP/
├── src/
│   ├── NextGenBytes.ERP.Api/
│   │   ├── Authorization/
│   │   ├── Controllers/
│   │   │   └── V1/
│   │   │       ├── AuthController.cs
│   │   │       ├── DefinitionsController.cs      ← FROZEN, do not modify
│   │   │       ├── PermissionsController.cs
│   │   │       ├── RolesController.cs
│   │   │       └── UsersController.cs
│   │   ├── Middleware/
│   │   ├── .env
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Program.cs
│   │
│   ├── NextGenBytes.ERP.Application/
│   │   ├── Authentication/
│   │   ├── Common/
│   │   │   └── Interfaces/
│   │   ├── Definitions/                          ← lookup/master tables
│   │   │   ├── DTOs/
│   │   │   └── Interfaces/
│   │   │       └── IDefinitionsService.cs
│   │   ├── RoleManagement/
│   │   └── DependencyInjection.cs
│   │
│   ├── NextGenBytes.ERP.Domain/
│   │   ├── Authentication/
│   │   ├── Common/
│   │   └── Definitions/                          ← entity classes
│   │       ├── Brand.cs
│   │       ├── MainCategory.cs
│   │       ├── ProductGroup.cs
│   │       ├── SubCategory.cs
│   │       ├── Transporter.cs
│   │       └── Warehouse.cs
│   │
│   └── NextGenBytes.ERP.Infrastructure/
│       ├── Authentication/
│       │   └── Services/
│       │       ├── AuthService.cs
│       │       ├── PermissionService.cs
│       │       └── TokenService.cs
│       ├── Common/
│       ├── Definitions/
│       │   └── Services/
│       │       └── DefinitionsService.cs
│       ├── Identity/
│       ├── Persistence/
│       ├── RoleManagement/
│       └── DependencyInjection.cs
│
├── tests/
├── docs/
├── .gitignore
└── AGENT.md
```

---

## 2. Where Each New Module Goes

Mirror the `Definitions` module structure for every new module.
Example for `Products`:

```
Domain/Products/
└── Product.cs

Application/Products/
├── DTOs/
│   ├── ProductCreateRequest.cs
│   ├── ProductUpdateRequest.cs
│   └── ProductResponse.cs
└── Interfaces/
    └── IProductService.cs

Infrastructure/Products/
└── Services/
    └── ProductService.cs

Api/Controllers/V1/
└── ProductsController.cs

Infrastructure/Persistence/Configurations/
└── ProductConfiguration.cs
```

One module folder per layer. Always mirror what `Definitions` does.

---

## 3. Architecture Pattern — Non-Negotiable

```
✅ Service + Interface pattern
✅ Direct DbContext injection into services (Infrastructure layer)
✅ Manual DTO mapping via extension methods
✅ One interface per module
✅ One service class per module

❌ No MediatR
❌ No CQRS / Commands / Queries / Handlers
❌ No Repository pattern / Unit of Work
❌ No AutoMapper
❌ No generic base services or base controllers
❌ No business logic in controllers
❌ No DbContext in controllers
```

---

## 4. Layer Responsibilities

| Layer | Responsibility | What it contains |
|---|---|---|
| **Domain** | Entity definitions only | Plain entity classes, no logic |
| **Application** | Contracts and DTOs | Interfaces, DTOs, mapping extensions |
| **Infrastructure** | Implementation | Service classes with DbContext access |
| **Api** | HTTP surface | Controllers only — call service, return response |

---

## 5. Naming Conventions

| Thing | Pattern | Example |
|---|---|---|
| Entity class | Singular PascalCase | `ProductType` |
| Domain folder | Plural | `Domain/Products/` |
| Application folder | Plural | `Application/Products/` |
| Infrastructure folder | Plural | `Infrastructure/Products/` |
| Interface | `I` + Singular + `Service` | `IProductTypeService` |
| Service class | Singular + `Service` | `ProductTypeService` |
| Controller | Plural + `Controller` | `ProductTypesController` |
| Create DTO | Singular + `CreateRequest` | `ProductTypeCreateRequest` |
| Update DTO | Singular + `UpdateRequest` | `ProductTypeUpdateRequest` |
| Response DTO | Singular + `Response` | `ProductTypeResponse` |
| EF Config | Singular + `Configuration` | `ProductTypeConfiguration` |

---

## 6. Entity Rules (Domain Layer)

Every entity must include these fields:

```csharp
// Domain/Products/Product.cs
namespace NextGenBytes.ERP.Domain.Products;

public class Product
{
    public Guid Id { get; set; }

    // --- business fields here ---

    public string Status { get; set; } = "Active"; // "Active" | "Inactive"

    // --- soft delete ---
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // --- audit ---
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
```

Rules:
- No methods or logic inside entities — plain data holders only
- Soft delete only — never hard delete
- Navigation properties are allowed on entity but never returned in responses
- Status defaults to `"Active"`. Values: `"Active"` or `"Inactive"` only

---

## 7. DTO Rules (Application Layer)

```csharp
// Application/Products/DTOs/ProductResponse.cs
namespace NextGenBytes.ERP.Application.Products.DTOs;

public class ProductResponse
{
    public Guid Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// Mapping extension — in the same file
public static class ProductMappings
{
    public static ProductResponse ToResponse(this Product entity) => new()
    {
        Id = entity.Id,
        ProductCode = entity.ProductCode,
        Name = entity.Name,
        Status = entity.Status,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };
}
```

Rules:
- No AutoMapper — always manual extension methods
- Request DTOs use data annotations: `[Required]`, `[MaxLength(n)]`
- Response DTOs never expose `IsDeleted`, `DeletedAt`, raw FKs without names,
  or navigation objects

---

## 8. Interface Rules (Application Layer)

```csharp
// Application/Products/Interfaces/IProductService.cs
namespace NextGenBytes.ERP.Application.Products.Interfaces;

public interface IProductService
{
    Task<ApiResponse<PagedResponse<ProductResponse>>> GetAllAsync(
        int page, int pageSize, string? search, string? status);

    Task<ApiResponse<ProductResponse>> GetByIdAsync(Guid id);
    Task<ApiResponse<ProductResponse>> CreateAsync(ProductCreateRequest request, string createdBy);
    Task<ApiResponse<ProductResponse>> UpdateAsync(Guid id, ProductUpdateRequest request, string updatedBy);
    Task<ApiResponse<bool>> UpdateStatusAsync(Guid id, string status, string updatedBy);
    Task<ApiResponse<bool>> DeleteAsync(Guid id, string deletedBy);
}
```

Rules:
- One interface per module
- All methods `async Task<T>`
- All return `ApiResponse<T>`
- Pass `createdBy` / `updatedBy` as string — extracted from JWT in controller,
  not inside the service

---

## 9. Service Rules (Infrastructure Layer)

```csharp
// Infrastructure/Products/Services/ProductService.cs
namespace NextGenBytes.ERP.Infrastructure.Products.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }
}
```

Rules:
- Inject `AppDbContext` directly — no repository in between
- All DB calls use `async` / `await`
- All business logic lives here — not in controllers, not in entities
- Use EF Core `IQueryable` internally — never expose it outside the method
- Wrap multi-step operations in a DB transaction:
  `await using var tx = await _context.Database.BeginTransactionAsync();`
- Return `ApiResponse<T>` for all outcomes — never throw to controller for
  business errors

---

## 10. Controller Rules (Api Layer)

```csharp
// Api/Controllers/V1/ProductsController.cs
namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, search, status);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductCreateRequest request)
    {
        var currentUser = User.Identity?.Name ?? "system";
        var result = await _service.CreateAsync(request, currentUser);
        return Ok(result);
    }
}
```

Rules:
- Zero business logic in controllers
- Zero DbContext in controllers
- Extract `currentUser` from `User.Identity?.Name` and pass to service
- Route: `api/v1/[controller]`
- Return `IActionResult` wrapping `ApiResponse<T>`
- `[FromQuery]` for filters, `[FromBody]` for create/update

---

## 11. Standard Endpoints Per Resource

```
GET    /api/v1/{resource}               paginated list
GET    /api/v1/{resource}/{id}          single record
POST   /api/v1/{resource}              create
PUT    /api/v1/{resource}/{id}          full update
PATCH  /api/v1/{resource}/{id}/status   status toggle only
DELETE /api/v1/{resource}/{id}          soft delete
```

Special modules (Inventory Transactions, AuditLogs) have fewer endpoints
documented in the module-specific section below.

---

## 12. ApiResponse Wrapper

Always use the existing `ApiResponse<T>`. Never return raw objects or naked lists.

---

## 13. Pagination

```csharp
// Query params with defaults
int page = 1
int pageSize = 20
string? search = null       // searches Name, Code
string? status = null       // "Active" | "Inactive" | null = all

// PagedResponse<T> shape
Items: List<T>
TotalCount: int
Page: int
PageSize: int
TotalPages: int
```

---

## 14. EF Core Configuration

Place all configs in `Infrastructure/Persistence/Configurations/`.

```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ProductCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(e => e.ProductCode).IsUnique();

        // Required on every entity
        builder.HasQueryFilter(e => !e.IsDeleted);

        // All FKs — never Cascade
        builder.HasOne<ProductType>()
            .WithMany()
            .HasForeignKey(e => e.ProductTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

Register via `modelBuilder.ApplyConfigurationsFromAssembly(...)` in AppDbContext.

---

## 15. Dependency Injection

Register in the existing `Infrastructure/DependencyInjection.cs`.
Never add registrations to `Program.cs`.

```csharp
// Add to the existing method — do not create a new one
services.AddScoped<IProductTypeService, ProductTypeService>();
services.AddScoped<IUnitService, UnitService>();
services.AddScoped<IProductService, ProductService>();
services.AddScoped<IInventoryService, InventoryService>();
```

---

## 16. Controller Separation Rules

```
DefinitionsController    Brands, Warehouses, MainCategories,
                         SubCategories, ProductGroups, Transporters
                         ← FROZEN. Do not add anything here.

ProductTypesController   ProductTypes only            (new file)
UnitsController          Units only                   (new file)
ProductsController       Products only                (new file)
InventoryController      OpeningStock, Inventory,
                         Inventory Transactions        (new file)
AuditLogsController      AuditLogs, read-only only    (new file)
```

---

---

# Module-Specific Rules

---

## MODULE: ProductTypes

Lives under the `Definitions` folder (it is a definition/master table):

```
Domain/Definitions/ProductType.cs
Application/Definitions/DTOs/ProductTypeRequests.cs
Application/Definitions/DTOs/ProductTypeResponse.cs
Application/Definitions/Interfaces/IProductTypeService.cs
Infrastructure/Definitions/Services/ProductTypeService.cs
Api/Controllers/V1/ProductTypesController.cs
Infrastructure/Persistence/Configurations/ProductTypeConfiguration.cs
```

Extra field: `CodePrefix (int)` — numeric base for code generation (e.g. `1000000`).

On Create: after saving ProductType, automatically insert one `Sequence`
row with `EntityName = "Product"`, `Scope = request.Code`, `LastNumber = 0` in the same transaction.

`CodePrefix` is immutable after creation. Reject or silently ignore updates to it.

---

## MODULE: Sequences (Generic)

**No controller. No public API. Internal only.**

```csharp
// Domain/Definitions/Sequence.cs
public class Sequence
{
    public Guid Id { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public long LastNumber { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

Used by all entities that need auto-generated business codes (Product, Vendor, Customer, etc.).

**Interface:** `Application/Common/Interfaces/ISequenceService.cs`
```csharp
public interface ISequenceService
{
    Task<long> GetNextSequenceAsync(string entityName, string scope, CancellationToken ct = default);
    Task<long> PeekNextSequenceAsync(string entityName, string scope, CancellationToken ct = default);
}
```

- `GetNextSequenceAsync` — atomically increments and returns the new number (UPDLOCK + caller's transaction).
- `PeekNextSequenceAsync` — read-only preview, does not increment.
- Returns raw `long` — formatting is the caller's responsibility.

**Implementation:** `Infrastructure/Services/SequenceService.cs`

Concurrency: Uses `SELECT ... WITH (UPDLOCK, ROWLOCK)` on the `(EntityName, Scope)` unique index.

Table: `Sequences` with composite unique index on `(EntityName, Scope)`.

Excluded from audit logging (same as the old ProductTypeSequences).

No interface. No controller. Never exposed via any endpoint.

---

## MODULE: Units

```
Domain/Definitions/Unit.cs
Application/Definitions/DTOs/UnitRequests.cs
Application/Definitions/DTOs/UnitResponse.cs
Application/Definitions/Interfaces/IUnitService.cs
Infrastructure/Definitions/Services/UnitService.cs
Api/Controllers/V1/UnitsController.cs
Infrastructure/Persistence/Configurations/UnitConfiguration.cs
```

Standard CRUD. No special business rules.

---

## MODULE: Products

```
Domain/Products/Product.cs
Application/Products/DTOs/ProductRequests.cs
Application/Products/DTOs/ProductResponse.cs
Application/Products/Interfaces/IProductService.cs
Infrastructure/Products/Services/ProductService.cs
Api/Controllers/V1/ProductsController.cs
Infrastructure/Persistence/Configurations/ProductConfiguration.cs
```

### ProductCode Generation — CRITICAL

`ProductCode` is system-generated always. Never accept it from the client.
Strip it from the request DTO. If sent, ignore it silently.
`ProductCode` is immutable after creation — reject updates that include it.

Algorithm inside `ProductService.CreateAsync`:

```
1. Begin DB transaction
2. Read ProductType (get Code + CodePrefix)
3. Get next sequence number via ISequenceService:
     nextNumber = await _sequenceService.GetNextSequenceAsync("Product", productType.Code);
4. ProductCode = (CodePrefix + nextNumber).ToString()
   e.g. 1000000 + 16 = "1000016"
5. Insert Product with this ProductCode
6. Commit
On error → rollback, sequence unchanged
```

Product entity fields:
```
Id (GUID)
ProductCode (string, max 20, unique, system-generated)
Name (required, max 200)
ProductTypeId (FK → ProductTypes)
CategoryId (FK → MainCategories)
SubCategoryId (FK → SubCategories, nullable)
BrandId (FK → Brands, nullable)
ProductGroupId (FK → ProductGroups, nullable)
UnitId (FK → Units)
Weight (decimal, nullable)
ThicknessGSM (decimal, nullable)
ColorScheme (string, nullable, max 100)
Status
+ standard audit fields
```

---

## MODULE: Inventory

```
Domain/Inventory/OpeningStock.cs
Domain/Inventory/Inventory.cs
Domain/Inventory/InventoryTransaction.cs
Application/Inventory/DTOs/  (one file per entity)
Application/Inventory/Interfaces/IInventoryService.cs
Infrastructure/Inventory/Services/InventoryService.cs
Api/Controllers/V1/InventoryController.cs
Infrastructure/Persistence/Configurations/ (one config per entity)
```

### OpeningStock

`POST /api/v1/inventory/opening-stock` runs inside one transaction:

```
1. Insert OpeningStock record
2. Insert InventoryTransaction
     TransactionType = "OpeningStock"
     Quantity = positive value
3. Upsert Inventory row:
     No row exists  → INSERT
     Row exists     → UPDATE:
       NewAvgCost = ((ExistingQty × ExistingAvgCost) + (NewQty × NewCost))
                    / (ExistingQty + NewQty)
       QuantityOnHand += NewQty
4. Commit
```

### Inventory

```
Id
ProductId (FK)
WarehouseId (FK)
QuantityOnHand (decimal)
ReservedQuantity (decimal, default 0)
AvailableQuantity (COMPUTED: .HasComputedColumnSql("[QuantityOnHand] - [ReservedQuantity]"))
AverageCost (decimal)
MinStock (decimal, nullable)
MaxStock (decimal, nullable)
ReorderLevel (decimal, nullable)
UpdatedAt
```

EF config must include:
```csharp
builder.HasIndex(e => new { e.ProductId, e.WarehouseId }).IsUnique();
```

Endpoints:
```
GET /api/v1/inventory                            query: warehouseId?, productId?, belowReorder?
GET /api/v1/inventory/{productId}/{warehouseId}
```

### InventoryTransactions — APPEND-ONLY LEDGER

```
❌ No UpdateAsync in interface
❌ No DeleteAsync in interface
❌ No PUT, DELETE, PATCH endpoints
✅ Created only by other services internally
✅ Never modified after creation
```

Fields:
```
Id
ProductId (FK)
WarehouseId (FK)
TransactionType: OpeningStock | Purchase | Sale | Adjustment |
                 TransferOut | TransferIn |
                 ProductionConsumption | FinishedGoodsReceipt
ReferenceType (string, nullable)
ReferenceId (GUID, nullable)
Quantity (decimal — positive = IN, negative = OUT)
UnitCost (decimal)
TransactionDate (DateTime)
Remarks (string, nullable)
CreatedBy (string)
CreatedAt (DateTime)
```

Endpoints:
```
GET /api/v1/inventory/transactions      query: productId?, warehouseId?, type?, dateFrom?, dateTo?
GET /api/v1/inventory/transactions/{id}
```

---

## MODULE: AuditLogs

No service interface. No service class.
Auto-populated by overriding `SaveChangesAsync` in `AppDbContext`:

```csharp
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    var entries = CaptureAuditEntries(); // read ChangeTracker BEFORE base call
    var result = await base.SaveChangesAsync(ct);
    await WriteAuditLogsAsync(entries);
    return result;
}
```

- Serialize `OldValues` / `NewValues` with `System.Text.Json`
- Skip `AuditLog` and `Sequence` entities (no self-logging)
- Only capture entities from the `Domain` layer

Fields:
```
Id (GUID)
UserId (string)
Entity (string, e.g. "Product")
EntityId (GUID)
Action: Created | Updated | Deleted
OldValues (string, JSON)
NewValues (string, JSON)
IPAddress (string)
CreatedAt (DateTime)
```

Read-only endpoints only:
```
GET /api/v1/audit-logs      query: entity?, entityId?, userId?, dateFrom?, dateTo?

❌ No POST, PUT, PATCH, DELETE
```

---

---

# Seed Data

Use fixed GUIDs in migrations. Never use `Guid.NewGuid()`.

## ProductTypes

| GUID | Code | Name | CodePrefix |
|---|---|---|---|
| `a1b2c3d4-0001-0000-0000-000000000001` | RAW  | Raw Material     | 1000000 |
| `a1b2c3d4-0001-0000-0000-000000000002` | FIN  | Finished Goods   | 2000000 |
| `a1b2c3d4-0001-0000-0000-000000000003` | SEMI | Semi Finished    | 3000000 |
| `a1b2c3d4-0001-0000-0000-000000000004` | PACK | Packing Material | 4000000 |

## Sequences

| GUID | EntityName | Scope | LastNumber |
|---|---|---|---|
| `d4e5f6a7-0004-0000-0000-000000000001` | Product | RAW | 0 |
| `d4e5f6a7-0004-0000-0000-000000000002` | Product | FIN | 0 |
| `d4e5f6a7-0004-0000-0000-000000000003` | Product | SEMI | 0 |
| `d4e5f6a7-0004-0000-0000-000000000004` | Product | PACK | 0 |
| `d4e5f6a7-0004-0000-0000-000000000005` | Vendor | DEFAULT | 0 |

## Units

| GUID | Code | Name | ShortName | DecimalPlaces |
|---|---|---|---|---|
| `c3d4e5f6-0003-0000-0000-000000000001` | PCS | Piece    | PCS | 0 |
| `c3d4e5f6-0003-0000-0000-000000000002` | KG  | Kilogram | KG  | 3 |
| `c3d4e5f6-0003-0000-0000-000000000003` | LTR | Litre    | LTR | 3 |
| `c3d4e5f6-0003-0000-0000-000000000004` | MTR | Metre    | MTR | 2 |
| `c3d4e5f6-0003-0000-0000-000000000005` | BOX | Box      | BOX | 0 |
| `c3d4e5f6-0003-0000-0000-000000000006` | GM  | Gram     | GM  | 3 |
| `c3d4e5f6-0003-0000-0000-000000000007` | TON | Ton      | TON | 3 |

---

---

# Pre-Generation Checklist

Run through this before writing any new module.

**Structure**
- [ ] Module folder created in all four layers
- [ ] Folder names mirror the existing Definitions module
- [ ] No new top-level folders invented without updating this file

**Entity**
- [ ] All audit fields present (Id, IsDeleted, DeletedAt, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy)
- [ ] Status defaults to "Active"
- [ ] No methods or logic inside entity class

**EF Configuration**
- [ ] `HasQueryFilter(e => !e.IsDeleted)` present
- [ ] All FK relationships use `DeleteBehavior.Restrict`
- [ ] Unique indexes on Code / ProductCode
- [ ] Max lengths on all string properties
- [ ] File placed in `Infrastructure/Persistence/Configurations/`

**Service**
- [ ] Registered in `Infrastructure/DependencyInjection.cs`
- [ ] No DbContext in controller
- [ ] No business logic in controller
- [ ] Multi-step operations use a DB transaction

**API**
- [ ] Every endpoint returns `ApiResponse<T>`
- [ ] Route is `api/v1/[controller]`
- [ ] `[Authorize]` attribute present

**Ledger / Read-only entities**
- [ ] No Update method in interface
- [ ] No Delete method in interface
- [ ] No PUT / DELETE / PATCH endpoints

**General**
- [ ] No AutoMapper introduced
- [ ] No MediatR introduced
- [ ] No Repository pattern introduced
- [ ] No hard deletes anywhere
- [ ] Seed data uses fixed GUIDs
