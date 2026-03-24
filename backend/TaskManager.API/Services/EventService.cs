using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Extensions;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface IEventService
{
    Task<List<EventDto>> GetMyEventsAsync(int userId);
    Task<EventDto> CreateAsync(CreateEventRequest req, int userId, string? ip);
    Task<bool> DeleteAsync(int id, int userId, string? ip);
}

public class EventService : IEventService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public EventService(AppDbContext db, IAuditService audit) { _db = db; _audit = audit; }

    public async Task<List<EventDto>> GetMyEventsAsync(int userId) =>
        await _db.Events
            .Include(e => e.User).ThenInclude(u => u.Role)
            .Where(e => e.UserId == userId)
            .OrderBy(e => e.StartDatetime)
            .Select(e => e.ToDto())
            .ToListAsync();

    public async Task<EventDto> CreateAsync(CreateEventRequest req, int userId, string? ip)
    {
        var ev = new Event
        {
            UserId = userId,
            Title = req.Title,
            StartDatetime = req.StartDatetime,
            EndDatetime = req.EndDatetime,
            EventType = req.EventType
        };
        _db.Events.Add(ev);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, "CREATE", "Event", ev.EventId, $"Событие: {ev.Title}", ip);

        var full = await _db.Events.Include(e => e.User).ThenInclude(u => u.Role)
            .FirstAsync(e => e.EventId == ev.EventId);
        return full.ToDto();
    }

    public async Task<bool> DeleteAsync(int id, int userId, string? ip)
    {
        var ev = await _db.Events.FirstOrDefaultAsync(e => e.EventId == id && e.UserId == userId);
        if (ev == null) return false;
        _db.Events.Remove(ev);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, "DELETE", "Event", id, $"Удалено событие: {ev.Title}", ip);
        return true;
    }
}
