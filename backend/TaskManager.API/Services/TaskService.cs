using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Extensions;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface ITaskService
{
    Task<List<TaskDto>> GetAllAsync(int userId, string role, string? status, string? priority, int? executorId, string? search);
    Task<TaskDetailDto?> GetByIdAsync(int id);
    Task<TaskDto> CreateAsync(CreateTaskRequest req, int creatorId, string? ip);
    Task<TaskDetailDto?> UpdateAsync(int id, UpdateTaskRequest req, int userId, string role, string? ip);
    Task<bool> DeleteAsync(int id, int userId, string? ip);
    Task<CommentDto?> AddCommentAsync(int taskId, int userId, CreateCommentRequest req, string? ip);
    Task<List<StatusDto>> GetStatusesAsync();
}

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public TaskService(AppDbContext db, IAuditService audit) { _db = db; _audit = audit; }

    private IQueryable<TaskItem> WithIncludes() =>
        _db.Tasks
            .Include(t => t.Status)
            .Include(t => t.Creator).ThenInclude(u => u.Role)
            .Include(t => t.Executor).ThenInclude(u => u!.Role)
            .Include(t => t.Comments).ThenInclude(c => c.Author).ThenInclude(u => u.Role);

    public async Task<List<TaskDto>> GetAllAsync(int userId, string role, string? status, string? priority, int? executorId, string? search)
    {
        var q = WithIncludes().AsQueryable();

        if (role == "Executor")
            q = q.Where(t => t.ExecutorId == userId || t.CreatorId == userId);

        if (!string.IsNullOrEmpty(status))
            q = q.Where(t => t.Status.StatusName == status);

        if (!string.IsNullOrEmpty(priority))
            q = q.Where(t => t.Priority == priority);

        if (executorId.HasValue)
            q = q.Where(t => t.ExecutorId == executorId);

        if (!string.IsNullOrEmpty(search))
            q = q.Where(t => t.Title.ToLower().Contains(search.ToLower()) ||
                              t.Description.ToLower().Contains(search.ToLower()));

        return await q.OrderByDescending(t => t.CreatedAt).Select(t => t.ToDto()).ToListAsync();
    }

    public async Task<TaskDetailDto?> GetByIdAsync(int id)
    {
        var t = await WithIncludes()
            .Include(t => t.History).ThenInclude(h => h.ChangedByUser).ThenInclude(u => u.Role)
            .Include(t => t.History).ThenInclude(h => h.OldStatus)
            .Include(t => t.History).ThenInclude(h => h.NewStatus)
            .FirstOrDefaultAsync(t => t.TaskId == id);
        return t?.ToDetailDto();
    }

    public async Task<TaskDto> CreateAsync(CreateTaskRequest req, int creatorId, string? ip)
    {
        var defaultStatus = await _db.Statuses.FirstAsync(s => s.StatusName == "Новая");
        var task = new TaskItem
        {
            Title = req.Title,
            Description = req.Description,
            Priority = req.Priority,
            DueDate = req.DueDate,
            CreatorId = creatorId,
            ExecutorId = req.ExecutorId,
            StatusId = defaultStatus.StatusId
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        _db.TaskHistories.Add(new TaskHistory
        {
            TaskId = task.TaskId,
            ChangedBy = creatorId,
            NewStatusId = defaultStatus.StatusId,
            Comment = "Задача создана"
        });
        await _db.SaveChangesAsync();
        await _audit.LogAsync(creatorId, "CREATE", "Task", task.TaskId, $"Создана задача: {task.Title}", ip);

        return (await WithIncludes().FirstAsync(t => t.TaskId == task.TaskId)).ToDto();
    }

    public async Task<TaskDetailDto?> UpdateAsync(int id, UpdateTaskRequest req, int userId, string role, string? ip)
    {
        var task = await _db.Tasks.Include(t => t.Status).FirstOrDefaultAsync(t => t.TaskId == id);
        if (task == null) return null;

        var oldStatusId = task.StatusId;
        var changed = false;

        if (req.Title != null) { task.Title = req.Title; changed = true; }
        if (req.Description != null) { task.Description = req.Description; changed = true; }
        if (req.Priority != null && (role != "Executor")) { task.Priority = req.Priority; changed = true; }
        if (req.DueDate.HasValue && role != "Executor") { task.DueDate = req.DueDate.Value; changed = true; }

        // Manager/Admin can reassign executor
        if (req.ExecutorId.HasValue && role != "Executor")
        {
            task.ExecutorId = req.ExecutorId == 0 ? null : req.ExecutorId;
            changed = true;
        }

        if (req.StatusId.HasValue)
        {
            var newStatus = await _db.Statuses.FindAsync(req.StatusId.Value);
            if (newStatus != null && task.StatusId != req.StatusId.Value)
            {
                task.StatusId = req.StatusId.Value;
                if (newStatus.StatusName == "Выполнена") task.CompletedAt = DateTime.UtcNow;
                else if (task.CompletedAt.HasValue) task.CompletedAt = null;

                _db.TaskHistories.Add(new TaskHistory
                {
                    TaskId = task.TaskId,
                    ChangedBy = userId,
                    OldStatusId = oldStatusId,
                    NewStatusId = req.StatusId.Value,
                    Comment = req.HistoryComment
                });
                changed = true;
            }
        }

        if (changed)
        {
            await _db.SaveChangesAsync();
            await _audit.LogAsync(userId, "UPDATE", "Task", id, $"Обновлена задача: {task.Title}", ip);
        }

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id, int userId, string? ip)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return false;
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, "DELETE", "Task", id, $"Удалена задача: {task.Title}", ip);
        return true;
    }

    public async Task<CommentDto?> AddCommentAsync(int taskId, int userId, CreateCommentRequest req, string? ip)
    {
        var task = await _db.Tasks.FindAsync(taskId);
        if (task == null) return null;

        var comment = new Comment
        {
            TaskId = taskId,
            AuthorId = userId,
            Text = req.Text
        };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(userId, "CREATE", "Comment", comment.CommentId, $"Комментарий к задаче #{taskId}", ip);

        var full = await _db.Comments.Include(c => c.Author).ThenInclude(u => u.Role)
            .FirstAsync(c => c.CommentId == comment.CommentId);
        return full.ToDto();
    }

    public async Task<List<StatusDto>> GetStatusesAsync() =>
        await _db.Statuses.Select(s => s.ToDto()).ToListAsync();
}
