using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.API.DTOs;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;
    public UsersController(IUserService users) => _users = users;

    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)!.Value;
    private string? Ip => HttpContext.Connection.RemoteIpAddress?.ToString();

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _users.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var u = await _users.GetByIdAsync(id);
        return u == null ? NotFound() : Ok(u);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        var u = await _users.CreateAsync(req, CurrentUserId, Ip);
        if (u == null) return Conflict(new { message = "Пользователь с таким логином или email уже существует" });
        return CreatedAtAction(nameof(GetById), new { id = u.UserId }, u);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest req)
    {
        var u = await _users.UpdateAsync(id, req, CurrentUserId, Ip);
        return u == null ? NotFound() : Ok(u);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _users.DeleteAsync(id, CurrentUserId, Ip);
        return ok ? NoContent() : NotFound();
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles() => Ok(await _users.GetRolesAsync());

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments() => Ok(await _users.GetDepartmentsAsync());
}
