using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;

namespace Spacebar.AdminAPI.Controllers;

[ApiController]
[Route("/users")]
public class UserController(ILogger<UserController> logger, SpacebarDbContext db) : ControllerBase {
    private readonly ILogger<UserController> _logger = logger;

    [HttpGet(Name = "/")]
    public IAsyncEnumerable<User> Get() {
        return db.Users.AsAsyncEnumerable();
    }
}