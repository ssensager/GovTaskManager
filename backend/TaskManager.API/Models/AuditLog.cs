namespace TaskManager.API.Models;

public class AuditLog
{
    public int LogId { get; set; }
    public int? UserId { get; set; }
    public string ActionType { get; set; } = string.Empty; // LOGIN | LOGOUT | CREATE | UPDATE | DELETE | VIEW
    public string ObjectType { get; set; } = string.Empty; // User | Task | Comment | Role | Department
    public int? ObjectId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
    public string? Details { get; set; }

    public User? User { get; set; }
}
