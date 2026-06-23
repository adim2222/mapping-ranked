using api_server;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace api_server.Tests;

public class Tests
{
    [Fact]
    public void CanInsertAndRetrieveUser()
    {
        using var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        using var db = new AppDbContext(options);
        db.Database.EnsureCreated();

        db.Users.Add(new User { Username = "testuser" });
        db.SaveChanges();

        var user = db.Users.Single(u => u.Username == "testuser");

        Assert.NotNull(user);
        Assert.Equal("testuser", user.Username);
    }
}
