using System.Text;
using api_server;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();

app.MapGet("/authorize", async (string? code, IHttpClientFactory httpClientFactory, IConfiguration configuration) =>
{
    if (string.IsNullOrEmpty(code))
    {
        return Results.BadRequest("Authorization code is missing.");
    }

    var clientId = configuration["Osu:ClientId"] ?? "";
    var clientSecret = configuration["Osu:ClientSecret"] ?? "";
    var redirectUri = configuration["Osu:RedirectUri"] ?? "http://localhost:3000/";

    var httpClient = httpClientFactory.CreateClient();

    var body = new FormUrlEncodedContent(new Dictionary<string, string>
    {
        ["client_id"] = clientId,
        ["client_secret"] = clientSecret,
        ["code"] = code,
        ["grant_type"] = "authorization_code",
        ["redirect_uri"] = redirectUri,
    });

    var response = await httpClient.PostAsync("https://osu.ppy.sh/oauth/token", body);
    var content = await response.Content.ReadAsStringAsync();

    if (!response.IsSuccessStatusCode)
    {
        Console.WriteLine($"Token exchange failed: {content}");
        return Results.Problem("Failed to exchange authorization code for token.");
    }

    Console.WriteLine($"Token response: {content}");

    return Results.Ok(new { success = true });
});

app.Run();
