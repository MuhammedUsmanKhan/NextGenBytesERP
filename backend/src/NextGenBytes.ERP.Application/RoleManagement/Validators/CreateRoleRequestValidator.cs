using FluentValidation;
using NextGenBytes.ERP.Application.RoleManagement.DTOs;

namespace NextGenBytes.ERP.Application.RoleManagement.Validators;

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
