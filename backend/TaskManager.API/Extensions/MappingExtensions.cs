using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Extensions;

public static class MappingExtensions
{
    public static RoleDto ToDto(this Role r) =>
        new(r.RoleId, r.RoleName, r.Description);

    public static DepartmentBriefDto ToBriefDto(this Department d) =>
        new(d.DepartmentId, d.DepartmentName);

    public static DepartmentDto ToDto(this Department d) =>
        new(d.DepartmentId, d.DepartmentName, d.ParentDepartmentId, d.ParentDepartment?.DepartmentName);

    public static UserBriefDto ToBriefDto(this User u) =>
        new(u.UserId, u.FullName, u.Login, u.Position);

    public static UserDto ToDto(this User u) =>
        new(u.UserId, u.FullName, u.Position, u.Email, u.Phone, u.Login,
            u.Status, u.CreatedAt, u.Role.ToDto(), u.Department?.ToBriefDto());

    public static StatusDto ToDto(this Status s) => new(s.StatusId, s.StatusName);

    public static CommentDto ToDto(this Comment c) =>
        new(c.CommentId, c.Text, c.CreatedAt, c.Author.ToBriefDto());

    public static TaskHistoryDto ToDto(this TaskHistory h) =>
        new(h.HistoryId, h.OldStatus?.StatusName, h.NewStatus?.StatusName,
            h.ChangedAt, h.Comment, h.ChangedByUser.ToBriefDto());

    public static TaskDto ToDto(this TaskItem t) => new(
        t.TaskId, t.Title, t.Description, t.Priority,
        t.CreatedAt, t.DueDate, t.CompletedAt,
        t.DueDate < DateTime.UtcNow && t.Status.StatusName != "Выполнена" && t.Status.StatusName != "Отменена",
        t.Status.ToDto(),
        t.Creator.ToBriefDto(),
        t.Executor?.ToBriefDto(),
        t.Comments.Count
    );

    public static TaskDetailDto ToDetailDto(this TaskItem t) => new(
        t.TaskId, t.Title, t.Description, t.Priority,
        t.CreatedAt, t.DueDate, t.CompletedAt,
        t.DueDate < DateTime.UtcNow && t.Status.StatusName != "Выполнена" && t.Status.StatusName != "Отменена",
        t.Status.ToDto(),
        t.Creator.ToBriefDto(),
        t.Executor?.ToBriefDto(),
        t.Comments.OrderBy(c => c.CreatedAt).Select(c => c.ToDto()).ToList(),
        t.History.OrderBy(h => h.ChangedAt).Select(h => h.ToDto()).ToList()
    );

    public static EventDto ToDto(this Event e) =>
        new(e.EventId, e.Title, e.StartDatetime, e.EndDatetime, e.EventType, e.User.ToBriefDto());

    public static AuditLogDto ToDto(this AuditLog a) =>
        new(a.LogId, a.ActionType, a.ObjectType, a.ObjectId,
            a.Timestamp, a.IpAddress, a.Details, a.User?.ToBriefDto());
}
