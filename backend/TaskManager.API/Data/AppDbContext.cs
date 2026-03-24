using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<TaskHistory> TaskHistories => Set<TaskHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Roles
        modelBuilder.Entity<Role>().ToTable("roles");
        modelBuilder.Entity<Role>().HasKey(r => r.RoleId);
        modelBuilder.Entity<Role>().Property(r => r.RoleId).HasColumnName("role_id");
        modelBuilder.Entity<Role>().Property(r => r.RoleName).HasColumnName("role_name").IsRequired();
        modelBuilder.Entity<Role>().Property(r => r.Description).HasColumnName("description");

        // Departments
        modelBuilder.Entity<Department>().ToTable("departments");
        modelBuilder.Entity<Department>().HasKey(d => d.DepartmentId);
        modelBuilder.Entity<Department>().Property(d => d.DepartmentId).HasColumnName("department_id");
        modelBuilder.Entity<Department>().Property(d => d.DepartmentName).HasColumnName("department_name").IsRequired();
        modelBuilder.Entity<Department>().Property(d => d.ParentDepartmentId).HasColumnName("parent_department_id");
        modelBuilder.Entity<Department>()
            .HasOne(d => d.ParentDepartment)
            .WithMany(d => d.ChildDepartments)
            .HasForeignKey(d => d.ParentDepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Users
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<User>().HasKey(u => u.UserId);
        modelBuilder.Entity<User>().Property(u => u.UserId).HasColumnName("user_id");
        modelBuilder.Entity<User>().Property(u => u.FullName).HasColumnName("full_name").IsRequired();
        modelBuilder.Entity<User>().Property(u => u.Position).HasColumnName("position");
        modelBuilder.Entity<User>().Property(u => u.Email).HasColumnName("email").IsRequired();
        modelBuilder.Entity<User>().Property(u => u.Phone).HasColumnName("phone");
        modelBuilder.Entity<User>().Property(u => u.Login).HasColumnName("login").IsRequired();
        modelBuilder.Entity<User>().Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
        modelBuilder.Entity<User>().Property(u => u.RoleId).HasColumnName("role_id");
        modelBuilder.Entity<User>().Property(u => u.DepartmentId).HasColumnName("department_id");
        modelBuilder.Entity<User>().Property(u => u.Status).HasColumnName("status").HasDefaultValue("active");
        modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<User>().HasIndex(u => u.Login).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<User>()
            .HasOne(u => u.Department)
            .WithMany(d => d.Users)
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        // Statuses
        modelBuilder.Entity<Status>().ToTable("statuses");
        modelBuilder.Entity<Status>().HasKey(s => s.StatusId);
        modelBuilder.Entity<Status>().Property(s => s.StatusId).HasColumnName("status_id");
        modelBuilder.Entity<Status>().Property(s => s.StatusName).HasColumnName("status_name").IsRequired();

        // Tasks
        modelBuilder.Entity<TaskItem>().ToTable("tasks");
        modelBuilder.Entity<TaskItem>().HasKey(t => t.TaskId);
        modelBuilder.Entity<TaskItem>().Property(t => t.TaskId).HasColumnName("task_id");
        modelBuilder.Entity<TaskItem>().Property(t => t.Title).HasColumnName("title").IsRequired();
        modelBuilder.Entity<TaskItem>().Property(t => t.Description).HasColumnName("description");
        modelBuilder.Entity<TaskItem>().Property(t => t.CreatorId).HasColumnName("creator_id");
        modelBuilder.Entity<TaskItem>().Property(t => t.ExecutorId).HasColumnName("executor_id");
        modelBuilder.Entity<TaskItem>().Property(t => t.StatusId).HasColumnName("status_id");
        modelBuilder.Entity<TaskItem>().Property(t => t.Priority).HasColumnName("priority").HasDefaultValue("medium");
        modelBuilder.Entity<TaskItem>().Property(t => t.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<TaskItem>().Property(t => t.DueDate).HasColumnName("due_date");
        modelBuilder.Entity<TaskItem>().Property(t => t.CompletedAt).HasColumnName("completed_at");
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Creator)
            .WithMany(u => u.CreatedTasks)
            .HasForeignKey(t => t.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Executor)
            .WithMany(u => u.AssignedTasks)
            .HasForeignKey(t => t.ExecutorId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Status)
            .WithMany(s => s.Tasks)
            .HasForeignKey(t => t.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Comments
        modelBuilder.Entity<Comment>().ToTable("comments");
        modelBuilder.Entity<Comment>().HasKey(c => c.CommentId);
        modelBuilder.Entity<Comment>().Property(c => c.CommentId).HasColumnName("comment_id");
        modelBuilder.Entity<Comment>().Property(c => c.TaskId).HasColumnName("task_id");
        modelBuilder.Entity<Comment>().Property(c => c.AuthorId).HasColumnName("author_id");
        modelBuilder.Entity<Comment>().Property(c => c.Text).HasColumnName("text").IsRequired();
        modelBuilder.Entity<Comment>().Property(c => c.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Task)
            .WithMany(t => t.Comments)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Events
        modelBuilder.Entity<Event>().ToTable("events");
        modelBuilder.Entity<Event>().HasKey(e => e.EventId);
        modelBuilder.Entity<Event>().Property(e => e.EventId).HasColumnName("event_id");
        modelBuilder.Entity<Event>().Property(e => e.UserId).HasColumnName("user_id");
        modelBuilder.Entity<Event>().Property(e => e.Title).HasColumnName("title").IsRequired();
        modelBuilder.Entity<Event>().Property(e => e.StartDatetime).HasColumnName("start_datetime");
        modelBuilder.Entity<Event>().Property(e => e.EndDatetime).HasColumnName("end_datetime");
        modelBuilder.Entity<Event>().Property(e => e.EventType).HasColumnName("event_type").HasDefaultValue("meeting");
        modelBuilder.Entity<Event>()
            .HasOne(e => e.User)
            .WithMany(u => u.Events)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Reports
        modelBuilder.Entity<Report>().ToTable("reports");
        modelBuilder.Entity<Report>().HasKey(r => r.ReportId);
        modelBuilder.Entity<Report>().Property(r => r.ReportId).HasColumnName("report_id");
        modelBuilder.Entity<Report>().Property(r => r.ReportType).HasColumnName("report_type").IsRequired();
        modelBuilder.Entity<Report>().Property(r => r.PeriodStart).HasColumnName("period_start");
        modelBuilder.Entity<Report>().Property(r => r.PeriodEnd).HasColumnName("period_end");
        modelBuilder.Entity<Report>().Property(r => r.GeneratedAt).HasColumnName("generated_at");
        modelBuilder.Entity<Report>().Property(r => r.GeneratedBy).HasColumnName("generated_by");
        modelBuilder.Entity<Report>()
            .HasOne(r => r.Generator)
            .WithMany()
            .HasForeignKey(r => r.GeneratedBy)
            .OnDelete(DeleteBehavior.Restrict);

        // AuditLogs
        modelBuilder.Entity<AuditLog>().ToTable("audit_log");
        modelBuilder.Entity<AuditLog>().HasKey(a => a.LogId);
        modelBuilder.Entity<AuditLog>().Property(a => a.LogId).HasColumnName("log_id");
        modelBuilder.Entity<AuditLog>().Property(a => a.UserId).HasColumnName("user_id");
        modelBuilder.Entity<AuditLog>().Property(a => a.ActionType).HasColumnName("action_type").IsRequired();
        modelBuilder.Entity<AuditLog>().Property(a => a.ObjectType).HasColumnName("object_type").IsRequired();
        modelBuilder.Entity<AuditLog>().Property(a => a.ObjectId).HasColumnName("object_id");
        modelBuilder.Entity<AuditLog>().Property(a => a.Timestamp).HasColumnName("timestamp");
        modelBuilder.Entity<AuditLog>().Property(a => a.IpAddress).HasColumnName("ip_address");
        modelBuilder.Entity<AuditLog>().Property(a => a.Details).HasColumnName("details");
        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        // TaskHistory
        modelBuilder.Entity<TaskHistory>().ToTable("task_history");
        modelBuilder.Entity<TaskHistory>().HasKey(h => h.HistoryId);
        modelBuilder.Entity<TaskHistory>().Property(h => h.HistoryId).HasColumnName("history_id");
        modelBuilder.Entity<TaskHistory>().Property(h => h.TaskId).HasColumnName("task_id");
        modelBuilder.Entity<TaskHistory>().Property(h => h.ChangedBy).HasColumnName("changed_by");
        modelBuilder.Entity<TaskHistory>().Property(h => h.OldStatusId).HasColumnName("old_status");
        modelBuilder.Entity<TaskHistory>().Property(h => h.NewStatusId).HasColumnName("new_status");
        modelBuilder.Entity<TaskHistory>().Property(h => h.ChangedAt).HasColumnName("changed_at");
        modelBuilder.Entity<TaskHistory>().Property(h => h.Comment).HasColumnName("comment");
        modelBuilder.Entity<TaskHistory>()
            .HasOne(h => h.Task)
            .WithMany(t => t.History)
            .HasForeignKey(h => h.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<TaskHistory>()
            .HasOne(h => h.ChangedByUser)
            .WithMany(u => u.TaskHistories)
            .HasForeignKey(h => h.ChangedBy)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<TaskHistory>()
            .HasOne(h => h.OldStatus)
            .WithMany()
            .HasForeignKey(h => h.OldStatusId)
            .OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<TaskHistory>()
            .HasOne(h => h.NewStatus)
            .WithMany()
            .HasForeignKey(h => h.NewStatusId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
