using Microsoft.EntityFrameworkCore;
using NextGenBytes.ERP.Application.Common.Interfaces;
using NextGenBytes.ERP.Domain.Definitions;
using NextGenBytes.ERP.Infrastructure.Persistence;

namespace NextGenBytes.ERP.Infrastructure.Services;

public sealed class SequenceService : ISequenceService
{
    private readonly AppDbContext _context;

    public SequenceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<long> GetNextSequenceAsync(string entityName, string scope, CancellationToken cancellationToken = default)
    {
        await _context.Database.ExecuteSqlRawAsync(
            "SELECT 1 FROM Sequences WITH (UPDLOCK, ROWLOCK) WHERE EntityName = {0} AND Scope = {1}",
            [entityName, scope],
            cancellationToken);

        var sequence = await _context.Sequences
            .FirstOrDefaultAsync(x => x.EntityName == entityName && x.Scope == scope, cancellationToken);

        if (sequence is null)
        {
            sequence = new Sequence
            {
                Id = Guid.NewGuid(),
                EntityName = entityName,
                Scope = scope,
                LastNumber = 0
            };
            _context.Sequences.Add(sequence);
        }

        var newNumber = sequence.LastNumber + 1;
        sequence.LastNumber = newNumber;
        sequence.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return newNumber;
    }

    public async Task<long> PeekNextSequenceAsync(string entityName, string scope, CancellationToken cancellationToken = default)
    {
        var sequence = await _context.Sequences
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.EntityName == entityName && x.Scope == scope, cancellationToken);

        return sequence is null ? 1 : sequence.LastNumber + 1;
    }
}
