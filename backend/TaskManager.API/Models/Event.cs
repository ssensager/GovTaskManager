namespace TaskManager.API.Models;

public class Event
{
    public int EventId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDatetime { get; set; }
    public DateTime EndDatetime { get; set; }
    public string EventType { get; set; } = "meeting"; // meeting | reminder | deadline | other

    public User User { get; set; } = null!;
}
