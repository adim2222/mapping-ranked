using Microsoft.EntityFrameworkCore;

namespace api_server;

public class User
{
    public int Id { get; set; }
    public long OsuId { get; set; }
    public string Username { get; set; } = string.Empty;
}

public class AuthState
{
    public int Id { get; set; }
    public string State { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<AuthState> AuthStates => Set<AuthState>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OsuId).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<AuthState>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.State).IsUnique();
            entity.Property(e => e.State).IsRequired().HasMaxLength(64);
        });
    }
}
