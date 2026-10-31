using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NextGenBytes.ERP.Application.Common.Options;

namespace NextGenBytes.ERP.Api.Controllers.V1;

[ApiController]
[Route("api/v1/system")]
[AllowAnonymous]
public sealed class SystemController : ControllerBase
{
    private readonly ModuleOptions _options;

    public SystemController(IOptions<ModuleOptions> options)
    {
        _options = options.Value;
    }

    [HttpGet("modules")]
    [EndpointSummary("Returns active module flags for the deployment instance")]
    public IActionResult GetActiveModules()
    {
        return Ok(new
        {
            success = true,
            data = _options,
            message = (string?)null,
            traceId = HttpContext.TraceIdentifier
        });
    }
}

