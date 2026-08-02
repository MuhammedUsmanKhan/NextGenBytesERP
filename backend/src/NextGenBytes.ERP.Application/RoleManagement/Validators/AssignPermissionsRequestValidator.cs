using FluentValidation;
using NextGenBytes.ERP.Application.RoleManagement.DTOs;

namespace NextGenBytes.ERP.Application.RoleManagement.Validators;

public sealed class AssignPermissionsRequestValidator : AbstractValidator<AssignPermissionsRequest>
{
    public AssignPermissionsRequestValidator()
    {
        RuleFor(x => x.PermissionIds)
            .NotEmpty()
            .Must(ids => ids.Count == ids.Distinct().Count())
            .WithMessage("Duplicate permission IDs are not allowed.");
    }
}
