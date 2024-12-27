using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminAPI.Middleware;
using Spacebar.Db.Contexts;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(options => {
    options.MaxValidationDepth = null;
    options.MaxIAsyncEnumerableBufferLimit = 100;
}).AddJsonOptions(options => {
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.WriteIndented = true;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});

builder.Services.AddRequestTimeouts(x => {
    x.DefaultPolicy = new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMinutes(10),
        WriteTimeoutResponse = async context => {
            context.Response.StatusCode = 504;
            context.Response.ContentType = "application/json";
            await context.Response.StartAsync();
            await context.Response.WriteAsJsonAsync(new { error = "Unknown error" });
            await context.Response.CompleteAsync();
        }
    };
});
builder.Services.AddCors(options => {
    options.AddPolicy(
        "Open",
        policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("Open");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

app.UseMiddleware<AuthenticationMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();