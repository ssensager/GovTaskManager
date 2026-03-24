using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Extensions;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface IReportService
{
    Task<ReportDataDto> GetReportDataAsync(DateTime? from, DateTime? to, int userId, string role);
    Task<List<AuditLogDto>> GetAuditLogsAsync(int page, int pageSize, string? actionType);
    Task SaveReportAsync(SaveReportRequest req, int userId, string? ip);
}

public class ReportService : IReportService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public ReportService(AppDbContext db, IAuditService audit) { _db = db; _audit = audit; }

    public async Task<ReportDataDto> GetReportDataAsync(DateTime? from, DateTime? to, int userId, string role)
    {
        var now = DateTime.UtcNow;
        var q = _db.Tasks.Include(t => t.Status).Include(t => t.Executor).AsQueryable();

        if (role == "Executor")
            q = q.Where(t => t.ExecutorId == userId || t.CreatorId == userId);

        if (from.HasValue) q = q.Where(t => t.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(t => t.CreatedAt <= to.Value);

        var tasks = await q.ToListAsync();

        var stats = new ReportStatsDto(
            tasks.Count,
            tasks.Count(t => t.Status.StatusName == "Новая"),
            tasks.Count(t => t.Status.StatusName == "В работе"),
            tasks.Count(t => t.Status.StatusName == "На проверке"),
            tasks.Count(t => t.Status.StatusName == "Выполнена"),
            tasks.Count(t => t.Status.StatusName == "Отменена"),
            tasks.Count(t => t.DueDate < now && t.Status.StatusName != "Выполнена" && t.Status.StatusName != "Отменена"),
            await _db.Users.CountAsync(),
            await _db.Users.CountAsync(u => u.Status == "active")
        );

        var byStatus = new List<TasksByStatusDto>
        {
            new("Новая",       tasks.Count(t => t.Status.StatusName == "Новая"),       "#6b7280"),
            new("В работе",    tasks.Count(t => t.Status.StatusName == "В работе"),    "#3b82f6"),
            new("На проверке", tasks.Count(t => t.Status.StatusName == "На проверке"), "#f59e0b"),
            new("Выполнена",   tasks.Count(t => t.Status.StatusName == "Выполнена"),   "#10b981"),
            new("Отменена",    tasks.Count(t => t.Status.StatusName == "Отменена"),    "#ef4444"),
        };

        var byPriority = new List<TasksByPriorityDto>
        {
            new("low",      tasks.Count(t => t.Priority == "low"),      "#9ca3af"),
            new("medium",   tasks.Count(t => t.Priority == "medium"),   "#60a5fa"),
            new("high",     tasks.Count(t => t.Priority == "high"),     "#f97316"),
            new("critical", tasks.Count(t => t.Priority == "critical"), "#dc2626"),
        };

        var byExecutor = tasks
            .Where(t => t.Executor != null)
            .GroupBy(t => new { t.ExecutorId, t.Executor!.FullName })
            .Select(g => new ExecutorPerformanceDto(
                g.Key.FullName,
                g.Count(),
                g.Count(t => t.Status.StatusName == "Выполнена"),
                g.Count(t => t.DueDate < now && t.Status.StatusName != "Выполнена" && t.Status.StatusName != "Отменена"),
                g.Count() > 0 ? Math.Round((double)g.Count(t => t.Status.StatusName == "Выполнена") / g.Count() * 100, 1) : 0
            )).ToList();

        return new ReportDataDto(stats, byStatus, byPriority, byExecutor);
    }

    public async Task<List<AuditLogDto>> GetAuditLogsAsync(int page, int pageSize, string? actionType)
    {
        var q = _db.AuditLogs
            .Include(a => a.User).ThenInclude(u => u!.Role)
            .AsQueryable();

        if (!string.IsNullOrEmpty(actionType))
            q = q.Where(a => a.ActionType == actionType);

        return await q
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => a.ToDto())
            .ToListAsync();
    }

    public async Task SaveReportAsync(SaveReportRequest req, int userId, string? ip)
    {
        _db.Reports.Add(new Report
        {
            ReportType = req.ReportType,
            PeriodStart = req.PeriodStart,
            PeriodEnd = req.PeriodEnd,
            GeneratedBy = userId
        });
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, "CREATE", "Report", null, $"Сформирован отчёт: {req.ReportType}", ip);
    }
}
