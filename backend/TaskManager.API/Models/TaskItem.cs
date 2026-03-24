namespace TaskManager.API.Models;

public class TaskItem
{
    public int TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CreatorId { get; set; }
    public int? ExecutorId { get; set; }
    public int StatusId { get; set; }
    public string Priority { get; set; } = "medium"; // low | medium | high | critical
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }

    public User Creator { get; set; } = null!;
    public User? Executor { get; set; }
    public Status Status { get; set; } = null!;

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<TaskHistory> History { get; set; } = new List<TaskHistory>();
}
