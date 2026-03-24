namespace TaskManager.API.Models;

public class Report
{
    public int ReportId { get; set; }
    public string ReportType { get; set; } = string.Empty; // tasks | users | performance
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public int GeneratedBy { get; set; }

    public User Generator { get; set; } = null!;
}
