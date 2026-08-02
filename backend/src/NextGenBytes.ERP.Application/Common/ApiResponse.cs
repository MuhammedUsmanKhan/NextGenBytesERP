using System.Text.Json.Serialization;

namespace NextGenBytes.ERP.Application.Common;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public List<string>? Errors { get; init; }
    public string TraceId { get; init; } = string.Empty;

    public static ApiResponse<T> Ok(T data, string? message = null, string? traceId = null) => new()
    {
        Success = true,
        Data = data,
        Message = message,
        TraceId = traceId ?? string.Empty
    };

    public static ApiResponse<T> Fail(string message, List<string>? errors = null, string? traceId = null) => new()
    {
        Success = false,
        Message = message,
        Errors = errors,
        TraceId = traceId ?? string.Empty
    };
}

public sealed class PagedResponse<T>
{
    public List<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Math.Max(PageSize, 1));
}
