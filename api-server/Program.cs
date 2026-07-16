using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api_server;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpClient();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)),
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/auth/state", async (AppDbContext db) =>
{
    var state = Guid.NewGuid().ToString("N");
    db.AuthStates.Add(new AuthState
    {
        State = state,
        ExpiresAt = DateTime.UtcNow.AddMinutes(10),
    });
    await db.SaveChangesAsync();
    return Results.Ok(new { state });
});

app.MapPost("/authorize", async (AuthorizeRequest request, IHttpClientFactory httpClientFactory, IConfiguration configuration, AppDbContext db) =>
{
    if (string.IsNullOrEmpty(request.Code) || string.IsNullOrEmpty(request.State))
    {
        return Results.BadRequest("Authorization code and state are required.");
    }

    var storedState = await db.AuthStates.FirstOrDefaultAsync(s => s.State == request.State);
    if (storedState == null || storedState.ExpiresAt < DateTime.UtcNow)
    {
        return Results.BadRequest("Invalid or expired state parameter.");
    }

    db.AuthStates.Remove(storedState);
    await db.SaveChangesAsync();

    var clientId = configuration["Osu:ClientId"] ?? "";
    var clientSecret = configuration["Osu:ClientSecret"] ?? "";
    var redirectUri = configuration["Osu:RedirectUri"] ?? "http://localhost:3000/";

    var httpClient = httpClientFactory.CreateClient();

    var body = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["client_id"] = clientId,
        ["client_secret"] = clientSecret,
        ["code"] = request.Code,
        ["grant_type"] = "authorization_code",
        ["redirect_uri"] = redirectUri,
    });

    var tokenResponse = await httpClient.PostAsync("https://osu.ppy.sh/oauth/token", body);
    var tokenContent = await tokenResponse.Content.ReadAsStringAsync();

    if (!tokenResponse.IsSuccessStatusCode)
    {
        Console.WriteLine($"Token exchange failed: {tokenContent}");
        return Results.Problem("Failed to exchange authorization code for token.");
    }

    var osuToken = System.Text.Json.JsonSerializer.Deserialize<OsuTokenResponse>(tokenContent);
    if (osuToken?.access_token == null)
    {
        return Results.Problem("Invalid token response from osu!.");
    }

    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", osuToken.access_token);
    var userResponse = await httpClient.GetAsync("https://osu.ppy.sh/api/v2/me");
    var userContent = await userResponse.Content.ReadAsStringAsync();

    if (!userResponse.IsSuccessStatusCode)
    {
        Console.WriteLine($"Failed to fetch osu! user: {userContent}");
        return Results.Problem("Failed to fetch user information from osu!.");
    }

    var osuUser = System.Text.Json.JsonSerializer.Deserialize<OsuUserResponse>(userContent);
    if (osuUser == null)
    {
        return Results.Problem("Invalid user response from osu!.");
    }

    var user = await db.Users.FirstOrDefaultAsync(u => u.OsuId == osuUser.id);
    if (user == null)
    {
        user = new User { OsuId = osuUser.id, Username = osuUser.username ?? "unknown" };
        db.Users.Add(user);
    }
    else
    {
        user.Username = osuUser.username ?? user.Username;
    }
    await db.SaveChangesAsync();

    var jwtSecret = configuration["Jwt:SecretKey"]!;
    var jwtIssuer = configuration["Jwt:Issuer"]!;
    var jwtAudience = configuration["Jwt:Audience"]!;
    var expirationMinutes = int.Parse(configuration["Jwt:ExpirationMinutes"] ?? "1440");

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim("osuId", user.OsuId.ToString()),
        new Claim(ClaimTypes.Name, user.Username!),
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
        signingCredentials: credentials);

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { token = tokenString });
});

app.MapGet("/me", async (ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    var dbUser = await db.Users.FindAsync(userId);
    if (dbUser == null) return Results.NotFound();

    var rank = await db.Users.CountAsync(u => u.Elo > dbUser.Elo) + 1;

    return Results.Ok(new
    {
        dbUser.Id,
        dbUser.OsuId,
        dbUser.Username,
        dbUser.Elo,
        rank,
    });
}).RequireAuthorization();

app.MapGet("/leaderboard", async (AppDbContext db) =>
{
    var users = await db.Users
        .OrderByDescending(u => u.Elo)
        .Select((u, index) => new
        {
            rank = index + 1,
            u.Username,
            u.OsuId,
            u.Elo,
        })
        .ToListAsync();

    return Results.Ok(users);
});

app.MapPost("/getUser", async (AppDbContext db, UserLookupRequest request) =>
{
    var user = await db.Users.FindAsync(request.Id);
    if (user == null) return Results.NotFound(new { error = "User does not exist" });
    return Results.Ok(user);
});

app.Run();

public record AuthorizeRequest(string Code, string State);

public record UserLookupRequest(int Id);

public class OsuTokenResponse
{
    public string? access_token { get; set; }
    public string? refresh_token { get; set; }
    public int expires_in { get; set; }
    public string? token_type { get; set; }
    public string? scope { get; set; }
}

public class OsuUserResponse
{
    public long id { get; set; }
    public string? username { get; set; }
}
