namespace NextGenBytes.ERP.Application.Common.Interfaces;

public interface ISequenceService
{
    Task<long> GetNextSequenceAsync(string entityName, string scope, CancellationToken cancellationToken = default);

    Task<long> PeekNextSequenceAsync(string entityName, string scope, CancellationToken cancellationToken = default);
}
