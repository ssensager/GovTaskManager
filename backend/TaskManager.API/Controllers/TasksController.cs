using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.API.DTOs;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _tasks;
    public TasksController(ITaskService tasks) => _tasks = tasks;

    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)!.Value;
    private string? Ip => HttpContext.Connection.RemoteIpAddress?.ToString();

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] int? executorId,
        [FromQuery] string? search)
    {
        var tasks = await _tasks.GetAllAsync(CurrentUserId, CurrentRole, status, priority, executorId, search);
        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var t = await _tasks.GetByIdAsync(id);
        return t == null ? NotFound() : Ok(t);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest req)
    {
        var task = await _tasks.CreateAsync(req, CurrentUserId, Ip);
        return CreatedAtAction(nameof(GetById), new { id = task.TaskId }, task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskRequest req)
    {
        var t = await _tasks.UpdateAsync(id, req, CurrentUserId, CurrentRole, Ip);
        return t == null ? NotFound() : Ok(t);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _tasks.DeleteAsync(id, CurrentUserId, Ip);
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentRequest req)
    {
        var c = await _tasks.AddCommentAsync(id, CurrentUserId, req, Ip);
        return c == null ? NotFound() : Ok(c);
    }

    [HttpGet("statuses")]
    public async Task<IActionResult> GetStatuses() => Ok(await _tasks.GetStatusesAsync());
}
