using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.API.DTOs;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Вход в систему</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var result = await _auth.LoginAsync(request, ip);
        if (result == null)
            return Unauthorized(new { message = "Неверный логин или пароль" });
        return Ok(result);
    }

    /// <summary>Текущий пользователь</summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            UserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value),
            Login = User.FindFirst(ClaimTypes.Name)!.Value,
            Role = User.FindFirst(ClaimTypes.Role)!.Value,
            FullName = User.FindFirst("FullName")!.Value,
        });
    }
}
