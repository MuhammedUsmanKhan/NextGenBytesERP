namespace NextGenBytes.ERP.Domain.Payroll;

public sealed class CompanyCalendarHoliday
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsRecurringYearly { get; set; }
    public DayOfWeek? RestDayOfWeek { get; set; }

    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

