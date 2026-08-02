using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using FluentValidation;

namespace NextGenBytes.ERP.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Resource not found");
            await WriteErrorResponse(context, HttpStatusCode.NotFound, ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Authorization failure");
            await WriteErrorResponse(context, HttpStatusCode.Unauthorized, ex.Message);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failure");
            var errors = ex.Errors.Select(e => $"{e.PropertyName}: {e.ErrorMessage}").ToList();
            await WriteErrorResponse(context, HttpStatusCode.UnprocessableEntity, "Validation failed.", errors);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UNIQUE") == true ||
                                             ex.InnerException?.Message.Contains("unique") == true ||
                                             ex.InnerException?.Message.Contains("IX_") == true)
        {
            _logger.LogWarning(ex, "Unique constraint violation");
            await WriteErrorResponse(context, HttpStatusCode.Conflict, "A record with the same unique value already exists.");
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("sequence") || ex.Message.Contains("Sequence"))
        {
            _logger.LogWarning(ex, "Sequence error");
            await WriteErrorResponse(context, HttpStatusCode.Conflict, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteErrorResponse(context, HttpStatusCode.InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteErrorResponse(HttpContext context, HttpStatusCode statusCode, string message, List<string>? errors = null)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            data = (object?)null,
            message,
            errors,
            traceId = context.TraceIdentifier
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
