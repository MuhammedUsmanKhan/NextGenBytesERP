using FluentValidation;
using SupplyChainManagement.Application.RoleManagement.DTOs;

namespace SupplyChainManagement.Application.RoleManagement.Validators;

public sealed class CreateRoleRequestValidator : AbstractValidator<CreateRoleRequest>
{
    public CreateRoleRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(256);

        RuleFor(x => x.Description)
            .MaximumLength(512);
    }
}
