using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Extensions;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto?> CreateAsync(CreateUserRequest req, int actorId, string? ip);
    Task<UserDto?> UpdateAsync(int id, UpdateUserRequest req, int actorId, string? ip);
    Task<bool> DeleteAsync(int id, int actorId, string? ip);
    Task<List<RoleDto>> GetRolesAsync();
    Task<List<DepartmentDto>> GetDepartmentsAsync();
}

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly IAuditService _audit;

    public UserService(AppDbContext db, IAuditService audit) { _db = db; _audit = audit; }

    private IQueryable<User> WithIncludes() =>
        _db.Users.Include(u => u.Role).Include(u => u.Department);

    public async Task<List<UserDto>> GetAllAsync() =>
        await WithIncludes().OrderBy(u => u.FullName).Select(u => u.ToDto()).ToListAsync();

    public async Task<UserDto?> GetByIdAsync(int id) =>
        (await WithIncludes().FirstOrDefaultAsync(u => u.UserId == id))?.ToDto();

    public async Task<UserDto?> CreateAsync(CreateUserRequest req, int actorId, string? ip)
    {
        if (await _db.Users.AnyAsync(u => u.Login == req.Login || u.Email == req.Email))
            return null;

        var user = new User
        {
            FullName = req.FullName,
            Position = req.Position,
            Email = req.Email,
            Phone = req.Phone,
            Login = req.Login,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            RoleId = req.RoleId,
            DepartmentId = req.DepartmentId,
            Status = "active"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(actorId, "CREATE", "User", user.UserId, $"Создан пользователь: {user.Login}", ip);
        return await GetByIdAsync(user.UserId);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserRequest req, int actorId, string? ip)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return null;

        if (req.FullName != null) user.FullName = req.FullName;
        if (req.Position != null) user.Position = req.Position;
        if (req.Email != null) user.Email = req.Email;
        if (req.Phone != null) user.Phone = req.Phone;
        if (req.Status != null) user.Status = req.Status;
        if (req.RoleId.HasValue) user.RoleId = req.RoleId.Value;
        if (req.DepartmentId.HasValue) user.DepartmentId = req.DepartmentId;

        await _db.SaveChangesAsync();
        await _audit.LogAsync(actorId, "UPDATE", "User", id, $"Изменён пользователь: {user.Login}", ip);
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id, int actorId, string? ip)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return false;
        user.Status = "inactive";
        await _db.SaveChangesAsync();
        await _audit.LogAsync(actorId, "DELETE", "User", id, $"Деактивирован: {user.Login}", ip);
        return true;
    }

    public async Task<List<RoleDto>> GetRolesAsync() =>
        await _db.Roles.Select(r => r.ToDto()).ToListAsync();

    public async Task<List<DepartmentDto>> GetDepartmentsAsync() =>
        await _db.Departments
            .Include(d => d.ParentDepartment)
            .Select(d => d.ToDto())
            .ToListAsync();
}
