using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EGApp.Backend.Util;

namespace EGApp.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(ILogger<DashboardController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetDashboard()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            _logger.LogInformation("Dashboard accessed by user: {Username} with role: {Role}", username, role);

            if (role == Role.Admin.ToString())
            {
                return Ok(new { Message = $"Welcome, {username}! This is the Admin Dashboard. You have full administrative privileges." });
            }
            else if (role == Role.User.ToString())
            {
                return Ok(new { Message = $"Welcome, {username}! This is the User Dashboard. You have standard user access." });
            }
            else
            {
                _logger.LogWarning("Dashboard accessed by user {Username} with unrecognized role: {Role}", username, role);
                return Forbid("Access denied for your role.");
            }
        }
    }
}