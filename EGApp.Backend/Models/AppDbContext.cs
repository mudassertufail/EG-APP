using Microsoft.EntityFrameworkCore;

namespace EGApp.Backend.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>().HasData(
               new User
               {
                   Id = 1,
                   Username = "admin1",
                   Email = "admin1@eg.com",
                   PasswordHash = "$2a$12$pufZS5NzLHgZSGF8idwubOlBYTFAJPyPVpjskT4DDVi7nHBUEK9JS",
                   Role = "Admin",
                   CreatedAt = new DateTime(2025, 06, 12, 10, 0, 0, DateTimeKind.Utc)
               },
               new User
               {
                   Id = 2,
                   Username = "admin2",
                   Email = "admin2@eg.com",
                   PasswordHash = "$2a$12$pufZS5NzLHgZSGF8idwubOlBYTFAJPyPVpjskT4DDVi7nHBUEK9JS",
                   Role = "Admin",
                   CreatedAt = new DateTime(2025, 6, 12, 10, 1, 0, DateTimeKind.Utc)
               },
               new User
               {
                   Id = 3,
                   Username = "user1",
                   Email = "user1@eg.com",
                   PasswordHash = "$2a$12$pufZS5NzLHgZSGF8idwubOlBYTFAJPyPVpjskT4DDVi7nHBUEK9JS",
                   Role = "User",
                   CreatedAt = new DateTime(2025, 6, 12, 10, 2, 0, DateTimeKind.Utc)
               },
               new User
               {
                   Id = 4,
                   Username = "user2",
                   Email = "user2@eg.com",
                   PasswordHash = "$2a$12$pufZS5NzLHgZSGF8idwubOlBYTFAJPyPVpjskT4DDVi7nHBUEK9JS",
                   Role = "User",
                   CreatedAt = new DateTime(2025, 6, 12, 10, 3, 0, DateTimeKind.Utc)
               }
           );


        }
    }
}
