using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupplyChainManagement.Application.Common;
using SupplyChainManagement.Domain.Audit;
using SupplyChainManagement.Infrastructure.Persistence;

namespace SupplyChainManagement.Api.Controllers.V1;

[ApiController]
[Route("api/v1/audit-logs")]
[Authorize]
public sealed class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuditLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [EndpointSummary("List audit logs (paginated, read-only)")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? entity = null,
        [FromQuery] Guid? entityId = null,
        [FromQuery] string? userId = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null)
    {
        var query = _context.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(entity))
            query = query.Where(x => x.Entity == entity);

        if (entityId.HasValue)
            query = query.Where(x => x.EntityId == entityId.Value);

        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(x => x.UserId == userId);

        if (dateFrom.HasValue)
            query = query.Where(x => x.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(x => x.CreatedAt <= dateTo.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.Entity,
                x.EntityId,
                x.Action,
                x.OldValues,
                x.NewValues,
                x.IPAddress,
                x.CreatedAt
            })
            .ToListAsync();

        var result = ApiResponse<PagedResponse<object>>.Ok(
            new PagedResponse<object>
            {
                Items = items.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });

        return Ok(result);
    }
}
