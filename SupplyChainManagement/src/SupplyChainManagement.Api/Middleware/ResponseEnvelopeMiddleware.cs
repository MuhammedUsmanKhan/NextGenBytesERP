using System.Net;
using System.Text.Json;

namespace SupplyChainManagement.Api.Middleware;

public sealed class ResponseEnvelopeMiddleware
{
    private readonly RequestDelegate _next;

    public ResponseEnvelopeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var originalBodyStream = context.Response.Body;

        await using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);

            if (context.Response.ContentType?.Contains("application/json") == true &&
                context.Response.StatusCode >= 200 &&
                context.Response.StatusCode < 300 &&
                !context.Response.HasStarted)
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                var bodyText = await new StreamReader(responseBody).ReadToEndAsync();

                if (!string.IsNullOrEmpty(bodyText) && !IsAlreadyEnveloped(bodyText))
                {
                    var envelope = new
                    {
                        success = true,
                        data = JsonSerializer.Deserialize<object>(bodyText, new JsonSerializerOptions
                        {
                            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                        }),
                        message = (string?)null,
                        traceId = context.TraceIdentifier
                    };

                    context.Response.Body = originalBodyStream;
                    context.Response.ContentType = "application/json";
                    var json = JsonSerializer.Serialize(envelope, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    await context.Response.WriteAsync(json);
                    return;
                }
            }

            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }

    private static bool IsAlreadyEnveloped(string bodyText)
    {
        try
        {
            using var doc = JsonDocument.Parse(bodyText);
            return doc.RootElement.TryGetProperty("success", out _);
        }
        catch
        {
            return false;
        }
    }
}
