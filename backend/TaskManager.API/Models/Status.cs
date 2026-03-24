namespace TaskManager.API.Models;

public class Status
{
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;

    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
}
