using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManager.API.DTOs;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reports;
    public ReportsController(IReportService reports) => _reports = reports;

    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)!.Value;
    private string? Ip => HttpContext.Connection.RemoteIpAddress?.ToString();

    [HttpGet]
    public async Task<IActionResult> GetReportData(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var data = await _reports.GetReportDataAsync(from, to, CurrentUserId, CurrentRole);
        return Ok(data);
    }

    [HttpPost("save")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> SaveReport([FromBody] SaveReportRequest req)
    {
        await _reports.SaveReportAsync(req, CurrentUserId, Ip);
        return Ok(new { message = "Отчёт сохранён" });
    }

    [HttpGet("audit")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? actionType = null)
    {
        var logs = await _reports.GetAuditLogsAsync(page, pageSize, actionType);
        return Ok(logs);
    }
}
