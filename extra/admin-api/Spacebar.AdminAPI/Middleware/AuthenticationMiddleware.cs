using System.Buffers.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using ArcaneLibs.Extensions;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.IdentityModel.Tokens;
using Spacebar.AdminAPI.Extensions;
using Spacebar.Db.Contexts;

namespace Spacebar.AdminAPI.Middleware;

public class AuthenticationMiddleware(RequestDelegate next) {
    public async Task Invoke(HttpContext context) {
        if(Environment.GetEnvironmentVariable("SB_ADMIN_API_DISABLE_AUTH") == "true") {
            await next(context);
            return;
        }
        
        if (!context.Request.Headers.ContainsKey("Authorization")) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Authorization header is missing");
            return;
        }

        var token = context.Request.Headers["Authorization"].ToString().Split(' ').Last();

        var handler = new JwtSecurityTokenHandler();
        var secretFile = File.ReadAllText("../../../jwt.key.pub");
        var key = ECDsa.Create(ECCurve.NamedCurves.nistP256);
        key.ImportFromPem(secretFile);

        var res = await handler.ValidateTokenAsync(token, new TokenValidationParameters {
            IssuerSigningKey = new ECDsaSecurityKey(key),
            ValidAlgorithms = new[] { "ES512" },
            LogValidationExceptions = true,
            // These are required to be false for the token to be valid as they aren't provided by the token
            ValidateIssuer = false,
            ValidateLifetime = false,
            ValidateAudience = false,
        });

        if (!res.IsValid) {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Invalid token");
            return;
        }

        Console.WriteLine(res.ClaimsIdentity.Claims.Select(x => $"{x.Type} : {x.Value}").ToJson());

        await next(context);
    }
}