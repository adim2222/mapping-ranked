var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/products", () =>
{
    var products = new[]
    {
        new { Id = 1, Name = "Mechanical Keyboard", Price = 120.00 },
        new { Id = 2, Name = "Wireless Mouse", Price = 80.00 }
    };

    // Returns a 200 OK status code with the array serialized as JSON
    return Results.Ok(products);
});

app.Run();