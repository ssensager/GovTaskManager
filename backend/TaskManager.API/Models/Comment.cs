namespace TaskManager.API.Models;

public class Comment
{
    public int CommentId { get; set; }
    public int TaskId { get; set; }
    public int AuthorId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public TaskItem Task { get; set; } = null!;
    public User Author { get; set; } = null!;
}
