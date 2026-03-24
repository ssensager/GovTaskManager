namespace TaskManager.API.Models;

public class TaskHistory
{
    public int HistoryId { get; set; }
    public int TaskId { get; set; }
    public int ChangedBy { get; set; }
    public int? OldStatusId { get; set; }
    public int? NewStatusId { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? Comment { get; set; }

    public TaskItem Task { get; set; } = null!;
    public User ChangedByUser { get; set; } = null!;
    public Status? OldStatus { get; set; }
    public Status? NewStatus { get; set; }
}
