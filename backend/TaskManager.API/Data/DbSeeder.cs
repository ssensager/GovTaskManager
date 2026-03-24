using TaskManager.API.Models;

namespace TaskManager.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (db.Roles.Any()) return;

        // --- Roles ---
        var roleAdmin = new Role { RoleName = "Administrator", Description = "Полный доступ к системе" };
        var roleManager = new Role { RoleName = "Manager", Description = "Создание задач и контроль исполнения" };
        var roleExecutor = new Role { RoleName = "Executor", Description = "Выполнение назначенных задач" };
        db.Roles.AddRange(roleAdmin, roleManager, roleExecutor);
        await db.SaveChangesAsync();

        // --- Departments ---
        var deptIT = new Department { DepartmentName = "Департамент информационных технологий" };
        var deptFinance = new Department { DepartmentName = "Финансово-экономический департамент" };
        var deptLegal = new Department { DepartmentName = "Юридический департамент" };
        db.Departments.AddRange(deptIT, deptFinance, deptLegal);
        await db.SaveChangesAsync();

        var deptITDev = new Department { DepartmentName = "Отдел разработки", ParentDepartmentId = deptIT.DepartmentId };
        var deptITInfra = new Department { DepartmentName = "Отдел инфраструктуры", ParentDepartmentId = deptIT.DepartmentId };
        db.Departments.AddRange(deptITDev, deptITInfra);
        await db.SaveChangesAsync();

        // --- Statuses ---
        var sNew = new Status { StatusName = "Новая" };
        var sInProgress = new Status { StatusName = "В работе" };
        var sOnReview = new Status { StatusName = "На проверке" };
        var sDone = new Status { StatusName = "Выполнена" };
        var sCancelled = new Status { StatusName = "Отменена" };
        db.Statuses.AddRange(sNew, sInProgress, sOnReview, sDone, sCancelled);
        await db.SaveChangesAsync();

        // --- Users ---
        var admin = new User
        {
            FullName = "Смирнов Алексей Дмитриевич",
            Position = "Системный администратор",
            Email = "admin@gov.ru",
            Phone = "+7 (495) 000-01-01",
            Login = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            RoleId = roleAdmin.RoleId,
            DepartmentId = deptIT.DepartmentId,
            Status = "active"
        };
        var manager1 = new User
        {
            FullName = "Иванов Сергей Петрович",
            Position = "Начальник отдела разработки",
            Email = "ivanov@gov.ru",
            Phone = "+7 (495) 000-01-02",
            Login = "ivanov",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
            RoleId = roleManager.RoleId,
            DepartmentId = deptITDev.DepartmentId,
            Status = "active"
        };
        var manager2 = new User
        {
            FullName = "Козлова Татьяна Игоревна",
            Position = "Руководитель проектов",
            Email = "kozlova@gov.ru",
            Phone = "+7 (495) 000-01-03",
            Login = "kozlova",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
            RoleId = roleManager.RoleId,
            DepartmentId = deptFinance.DepartmentId,
            Status = "active"
        };
        var exec1 = new User
        {
            FullName = "Петрова Мария Александровна",
            Position = "Программист",
            Email = "petrova@gov.ru",
            Phone = "+7 (495) 000-01-04",
            Login = "petrova",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Executor123!"),
            RoleId = roleExecutor.RoleId,
            DepartmentId = deptITDev.DepartmentId,
            Status = "active"
        };
        var exec2 = new User
        {
            FullName = "Сидоров Дмитрий Николаевич",
            Position = "Системный инженер",
            Email = "sidorov@gov.ru",
            Phone = "+7 (495) 000-01-05",
            Login = "sidorov",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Executor123!"),
            RoleId = roleExecutor.RoleId,
            DepartmentId = deptITInfra.DepartmentId,
            Status = "active"
        };
        var exec3 = new User
        {
            FullName = "Новикова Елена Сергеевна",
            Position = "Бухгалтер",
            Email = "novikova@gov.ru",
            Phone = "+7 (495) 000-01-06",
            Login = "novikova",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Executor123!"),
            RoleId = roleExecutor.RoleId,
            DepartmentId = deptFinance.DepartmentId,
            Status = "active"
        };
        db.Users.AddRange(admin, manager1, manager2, exec1, exec2, exec3);
        await db.SaveChangesAsync();

        // --- Tasks ---
        var t1 = new TaskItem
        {
            Title = "Обновление серверного программного обеспечения",
            Description = "Произвести обновление ОС и ПО на всех продуктивных серверах до актуальных версий. Составить акт выполненных работ.",
            CreatorId = manager1.UserId,
            ExecutorId = exec2.UserId,
            StatusId = sInProgress.StatusId,
            Priority = "high",
            DueDate = DateTime.UtcNow.AddDays(5)
        };
        var t2 = new TaskItem
        {
            Title = "Подготовка квартального финансового отчёта",
            Description = "Сформировать финансовый отчёт за 1-й квартал 2025 года. Согласовать с руководством и направить в министерство.",
            CreatorId = manager2.UserId,
            ExecutorId = exec3.UserId,
            StatusId = sNew.StatusId,
            Priority = "critical",
            DueDate = DateTime.UtcNow.AddDays(2)
        };
        var t3 = new TaskItem
        {
            Title = "Разработка модуля авторизации",
            Description = "Реализовать JWT-авторизацию с поддержкой ролей пользователей в корпоративной системе документооборота.",
            CreatorId = manager1.UserId,
            ExecutorId = exec1.UserId,
            StatusId = sOnReview.StatusId,
            Priority = "high",
            DueDate = DateTime.UtcNow.AddDays(10)
        };
        var t4 = new TaskItem
        {
            Title = "Настройка резервного копирования баз данных",
            Description = "Настроить автоматическое ежедневное резервное копирование всех продуктивных БД с хранением за 30 дней.",
            CreatorId = manager1.UserId,
            ExecutorId = exec2.UserId,
            StatusId = sDone.StatusId,
            Priority = "medium",
            DueDate = DateTime.UtcNow.AddDays(-3),
            CompletedAt = DateTime.UtcNow.AddDays(-4)
        };
        var t5 = new TaskItem
        {
            Title = "Аудит прав доступа пользователей",
            Description = "Провести проверку актуальности прав доступа сотрудников к информационным системам. Отозвать избыточные права.",
            CreatorId = admin.UserId,
            ExecutorId = exec1.UserId,
            StatusId = sNew.StatusId,
            Priority = "medium",
            DueDate = DateTime.UtcNow.AddDays(14)
        };
        var t6 = new TaskItem
        {
            Title = "Перенос почтового сервера",
            Description = "Миграция корпоративного почтового сервера на новую инфраструктуру без прерывания сервиса.",
            CreatorId = manager1.UserId,
            ExecutorId = exec2.UserId,
            StatusId = sInProgress.StatusId,
            Priority = "critical",
            DueDate = DateTime.UtcNow.AddDays(7)
        };
        var t7 = new TaskItem
        {
            Title = "Обновление антивирусного ПО",
            Description = "Обновить антивирусное программное обеспечение на всех рабочих станциях сотрудников.",
            CreatorId = admin.UserId,
            ExecutorId = null,
            StatusId = sNew.StatusId,
            Priority = "low",
            DueDate = DateTime.UtcNow.AddDays(30)
        };
        db.Tasks.AddRange(t1, t2, t3, t4, t5, t6, t7);
        await db.SaveChangesAsync();

        // --- Comments ---
        db.Comments.AddRange(
            new Comment { TaskId = t1.TaskId, AuthorId = exec2.UserId, Text = "Начал работу. Обновил тестовый сервер, проблем нет. Перехожу к продуктиву." },
            new Comment { TaskId = t1.TaskId, AuthorId = manager1.UserId, Text = "Хорошо. Не забудь сделать снимок состояния перед обновлением." },
            new Comment { TaskId = t3.TaskId, AuthorId = exec1.UserId, Text = "Модуль разработан. Прошу проверить код и провести тестирование." },
            new Comment { TaskId = t3.TaskId, AuthorId = manager1.UserId, Text = "Принято на проверку. Результаты завтра." },
            new Comment { TaskId = t2.TaskId, AuthorId = manager2.UserId, Text = "Срок критический! Необходимо завершить до конца рабочей недели." }
        );
        await db.SaveChangesAsync();

        // --- Task History ---
        db.TaskHistories.AddRange(
            new TaskHistory { TaskId = t1.TaskId, ChangedBy = manager1.UserId, OldStatusId = sNew.StatusId, NewStatusId = sInProgress.StatusId, Comment = "Назначен исполнитель" },
            new TaskHistory { TaskId = t3.TaskId, ChangedBy = exec1.UserId, OldStatusId = sNew.StatusId, NewStatusId = sInProgress.StatusId, Comment = "Приступил к работе" },
            new TaskHistory { TaskId = t3.TaskId, ChangedBy = exec1.UserId, OldStatusId = sInProgress.StatusId, NewStatusId = sOnReview.StatusId, Comment = "Задача выполнена, отправлена на проверку" },
            new TaskHistory { TaskId = t4.TaskId, ChangedBy = exec2.UserId, OldStatusId = sNew.StatusId, NewStatusId = sInProgress.StatusId, Comment = "Начало работ" },
            new TaskHistory { TaskId = t4.TaskId, ChangedBy = exec2.UserId, OldStatusId = sInProgress.StatusId, NewStatusId = sDone.StatusId, Comment = "Резервное копирование настроено и проверено" }
        );
        await db.SaveChangesAsync();

        // --- Events ---
        db.Events.AddRange(
            new Event { UserId = manager1.UserId, Title = "Совещание по серверной инфраструктуре", StartDatetime = DateTime.UtcNow.AddDays(1).Date.AddHours(10), EndDatetime = DateTime.UtcNow.AddDays(1).Date.AddHours(11), EventType = "meeting" },
            new Event { UserId = exec1.UserId, Title = "Сдача модуля авторизации", StartDatetime = DateTime.UtcNow.AddDays(2).Date.AddHours(9), EndDatetime = DateTime.UtcNow.AddDays(2).Date.AddHours(9).AddMinutes(30), EventType = "deadline" },
            new Event { UserId = manager2.UserId, Title = "Финансовый отчёт — дедлайн", StartDatetime = DateTime.UtcNow.AddDays(2).Date.AddHours(17), EndDatetime = DateTime.UtcNow.AddDays(2).Date.AddHours(18), EventType = "deadline" }
        );
        await db.SaveChangesAsync();

        // --- Audit Logs (initial) ---
        db.AuditLogs.AddRange(
            new AuditLog { UserId = admin.UserId, ActionType = "CREATE", ObjectType = "User", ObjectId = manager1.UserId, Details = $"Создан пользователь: {manager1.Login}", IpAddress = "127.0.0.1" },
            new AuditLog { UserId = admin.UserId, ActionType = "CREATE", ObjectType = "User", ObjectId = exec1.UserId, Details = $"Создан пользователь: {exec1.Login}", IpAddress = "127.0.0.1" },
            new AuditLog { UserId = manager1.UserId, ActionType = "CREATE", ObjectType = "Task", ObjectId = t1.TaskId, Details = $"Создана задача: {t1.Title}", IpAddress = "127.0.0.1" }
        );
        await db.SaveChangesAsync();
    }
}
