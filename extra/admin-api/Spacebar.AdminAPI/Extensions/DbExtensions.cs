using Microsoft.EntityFrameworkCore;
using Spacebar.Db.Models;

namespace Spacebar.AdminAPI.Extensions;

public static class DbExtensions {
    public static string? GetString(this DbSet<Config> config, string key) => config.Find(key)?.Value;
}