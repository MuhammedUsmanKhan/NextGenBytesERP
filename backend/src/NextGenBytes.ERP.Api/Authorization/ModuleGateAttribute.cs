using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using NextGenBytes.ERP.Application.Common.Options;

namespace NextGenBytes.ERP.Api.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class ModuleGateAttribute : Attribute, IAsyncActionFilter
{
    private readonly string _moduleName;

    public ModuleGateAttribute(string moduleName)
    {
        _moduleName = moduleName;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var moduleOptions = context.HttpContext.RequestServices
            .GetRequiredService<IOptionsSnapshot<ModuleOptions>>().Value;

        if (!moduleOptions.IsEnabled(_moduleName))
        {
            context.Result = new NotFoundObjectResult(new
            {
                success = false,
                message = $"Module '{_moduleName}' is disabled in this deployment.",
                traceId = context.HttpContext.TraceIdentifier
            });
            return;
        }

        await next();
    }
}

