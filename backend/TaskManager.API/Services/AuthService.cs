using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, string? ip);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IAuditService _audit;

    public AuthService(AppDbContext db, IConfiguration config, IAuditService audit)
    {
        _db = db;
        _config = config;
        _audit = audit;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, string? ip)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Login == request.Login && u.Status == "active");

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            await _audit.LogAsync(null, "LOGIN_FAILED", "User", null,
                $"Неудачная попытка входа: {request.Login}", ip);
            return null;
        }

        await _audit.LogAsync(user.UserId, "LOGIN", "User", user.UserId,
            $"Успешный вход: {user.Login}", ip);

        var token = GenerateToken(user);
        return new LoginResponse(
            token, user.UserId, user.FullName, user.Login,
            user.Role.RoleName, user.Position, user.Department?.DepartmentName
        );
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.Role, user.Role.RoleName),
            new Claim("FullName", user.FullName),
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(10),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
