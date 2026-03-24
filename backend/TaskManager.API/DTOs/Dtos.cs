namespace TaskManager.API.DTOs;

// ===== AUTH =====
public record LoginRequest(string Login, string Password);

public record LoginResponse(
    string Token,
    int UserId,
    string FullName,
    string Login,
    string Role,
    string? Position,
    string? DepartmentName
);

// ===== USERS =====
public record UserDto(
    int UserId,
    string FullName,
    string? Position,
    string Email,
    string? Phone,
    string Login,
    string Status,
    DateTime CreatedAt,
    RoleDto Role,
    DepartmentBriefDto? Department
);

public record UserBriefDto(int UserId, string FullName, string Login, string? Position);

public record CreateUserRequest(
    string FullName,
    string? Position,
    string Email,
    string? Phone,
    string Login,
    string Password,
    int RoleId,
    int? DepartmentId
);

public record UpdateUserRequest(
    string? FullName,
    string? Position,
    string? Email,
    string? Phone,
    string? Status,
    int? RoleId,
    int? DepartmentId
);

// ===== ROLES =====
public record RoleDto(int RoleId, string RoleName, string? Description);

// ===== DEPARTMENTS =====
public record DepartmentDto(int DepartmentId, string DepartmentName, int? ParentDepartmentId, string? ParentDepartmentName);
public record DepartmentBriefDto(int DepartmentId, string DepartmentName);

// ===== STATUSES =====
public record StatusDto(int StatusId, string StatusName);

// ===== TASKS =====
public record TaskDto(
    int TaskId,
    string Title,
    string Description,
    string Priority,
    DateTime CreatedAt,
    DateTime DueDate,
    DateTime? CompletedAt,
    bool IsOverdue,
    StatusDto Status,
    UserBriefDto Creator,
    UserBriefDto? Executor,
    int CommentsCount
);

public record TaskDetailDto(
    int TaskId,
    string Title,
    string Description,
    string Priority,
    DateTime CreatedAt,
    DateTime DueDate,
    DateTime? CompletedAt,
    bool IsOverdue,
    StatusDto Status,
    UserBriefDto Creator,
    UserBriefDto? Executor,
    List<CommentDto> Comments,
    List<TaskHistoryDto> History
);

public record CreateTaskRequest(
    string Title,
    string Description,
    string Priority,
    DateTime DueDate,
    int? ExecutorId
);

public record UpdateTaskRequest(
    string? Title,
    string? Description,
    string? Priority,
    DateTime? DueDate,
    int? ExecutorId,
    int? StatusId,
    string? HistoryComment
);

// ===== COMMENTS =====
public record CommentDto(
    int CommentId,
    string Text,
    DateTime CreatedAt,
    UserBriefDto Author
);

public record CreateCommentRequest(string Text);

// ===== TASK HISTORY =====
public record TaskHistoryDto(
    int HistoryId,
    string? OldStatus,
    string? NewStatus,
    DateTime ChangedAt,
    string? Comment,
    UserBriefDto ChangedBy
);

// ===== EVENTS =====
public record EventDto(
    int EventId,
    string Title,
    DateTime StartDatetime,
    DateTime EndDatetime,
    string EventType,
    UserBriefDto User
);

public record CreateEventRequest(
    string Title,
    DateTime StartDatetime,
    DateTime EndDatetime,
    string EventType
);

// ===== REPORTS =====
public record ReportStatsDto(
    int TotalTasks,
    int NewTasks,
    int InProgressTasks,
    int OnReviewTasks,
    int CompletedTasks,
    int CancelledTasks,
    int OverdueTasks,
    int TotalUsers,
    int ActiveUsers
);

public record TasksByStatusDto(string Status, int Count, string Color);
public record TasksByPriorityDto(string Priority, int Count, string Color);
public record ExecutorPerformanceDto(string FullName, int Total, int Completed, int Overdue, double CompletionRate);

public record ReportDataDto(
    ReportStatsDto Stats,
    List<TasksByStatusDto> ByStatus,
    List<TasksByPriorityDto> ByPriority,
    List<ExecutorPerformanceDto> ByExecutor
);

public record SaveReportRequest(string ReportType, DateTime PeriodStart, DateTime PeriodEnd);

// ===== AUDIT LOG =====
public record AuditLogDto(
    int LogId,
    string ActionType,
    string ObjectType,
    int? ObjectId,
    DateTime Timestamp,
    string? IpAddress,
    string? Details,
    UserBriefDto? User
);

// ===== PAGINATION =====
public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
