using FluentValidation;
using SupplyChainManagement.Application.RoleManagement.DTOs;

namespace SupplyChainManagement.Application.RoleManagement.Validators;

public sealed class AssignRolesRequestValidator : AbstractValidator<AssignRolesRequest>
{
    public AssignRolesRequestValidator()
    {
        RuleFor(x => x.RoleIds)
            .NotEmpty()
            .Must(ids => ids.Count == ids.Distinct().Count())
            .WithMessage("Duplicate role IDs are not allowed.");
    }
}
