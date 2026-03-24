using TaskManager.API.Data;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface IAuditService
{
    Task LogAsync(int? userId, string actionType, string objectType,
        int? objectId = null, string? details = null, string? ip = null);
}

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    public AuditService(AppDbContext db) => _db = db;

    public async Task LogAsync(int? userId, string actionType, string objectType,
        int? objectId = null, string? details = null, string? ip = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            ActionType = actionType,
            ObjectType = objectType,
            ObjectId = objectId,
            Details = details,
            IpAddress = ip
        });
        await _db.SaveChangesAsync();
    }
}
