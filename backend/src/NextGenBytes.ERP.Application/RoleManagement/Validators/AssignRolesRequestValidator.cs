using FluentValidation;
using NextGenBytes.ERP.Application.RoleManagement.DTOs;

namespace NextGenBytes.ERP.Application.RoleManagement.Validators;

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
