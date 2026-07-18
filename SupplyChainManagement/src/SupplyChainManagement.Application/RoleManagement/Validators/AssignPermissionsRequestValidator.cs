using FluentValidation;
using SupplyChainManagement.Application.RoleManagement.DTOs;

namespace SupplyChainManagement.Application.RoleManagement.Validators;

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
