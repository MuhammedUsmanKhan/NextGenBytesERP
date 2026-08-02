using FluentValidation;
using NextGenBytes.ERP.Application.Authentication.DTOs;

namespace NextGenBytes.ERP.Application.Authentication.Validators;

public sealed class RefreshRequestValidator : AbstractValidator<RefreshRequest>
{
    public RefreshRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty();
    }
}
