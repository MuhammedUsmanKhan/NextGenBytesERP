using FluentValidation;
using SupplyChainManagement.Application.Authentication.DTOs;

namespace SupplyChainManagement.Application.Authentication.Validators;

public sealed class RefreshRequestValidator : AbstractValidator<RefreshRequest>
{
    public RefreshRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty();
    }
}
