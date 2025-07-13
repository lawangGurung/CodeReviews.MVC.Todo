using Microsoft.EntityFrameworkCore;

namespace TodoApi;

public class ToDoDb : DbContext
{
    public ToDoDb(DbContextOptions<ToDoDb> options) 
    : base(options)
    {
        
    }
    public DbSet<ToDo> ToDos => Set<ToDo>();
}
