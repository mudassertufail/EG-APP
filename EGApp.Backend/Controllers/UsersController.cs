using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EGApp.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using EGApp.Backend.DTOs;
using EGApp.Backend.Util;

namespace EGApp.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(AppDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            _logger.LogInformation("Admin attempting to retrieve all users.");
            return await _context.Users.Select(u => new User
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role,

            }).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            _logger.LogInformation($"Admin attempting to retrieve user with Id: {id}.");
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning($"User with Id: {id} not found.");
                return NotFound();
            }

            return new User
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,

            };
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromBody] RegisterRequest request)
        {
            _logger.LogInformation($"Admin attempting to create a new user: {request.Username}.");
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid user creation request by Admin for username: {Username}", request.Username);
                return BadRequest(ModelState);
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                _logger.LogWarning("User creation failed: Username '{Username}' already exists.", request.Username);
                return Conflict("Username already exists.");
            }
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                _logger.LogWarning("User creation failed: Email '{Email}' already exists.", request.Email);
                return Conflict("Email already exists.");
            }

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Role.User.ToString()
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"New user created by Admin successfully: {newUser.Username} (Id: {newUser.Id}).");

            return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new User { Id = newUser.Id, Username = newUser.Username, Email = newUser.Email, Role = newUser.Role });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, [FromBody] User user)
        {
            _logger.LogInformation($"Admin attempting to update user with Id: {id}.");
            if (id != user.Id)
            {
                _logger.LogError($"Mismatched IDs for user update: route Id {id}, user Id {user.Id}.");
                return BadRequest("ID mismatch.");
            }

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                _logger.LogWarning($"User with Id: {id} not found for update.");
                return NotFound();
            }

            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.Role = user.Role;

            _context.Entry(existingUser).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"User with Id: {id} updated by Admin successfully.");
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!UserExists(id))
                {
                    _logger.LogWarning($"User with Id: {id} not found during update concurrency check.");
                    return NotFound();
                }
                else
                {
                    _logger.LogError(ex, $" Error while updating user with Id: {id}.");
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, $"Database error updating user with Id: {id}. Possible duplicate username/email.");
                return Conflict("Error");
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            _logger.LogInformation($"Admin attempting to delete user with Id: {id}.");
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning($"User with Id: {id} not found for deletion.");
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"User with Id: {id} deleted by Admin successfully.");

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}
