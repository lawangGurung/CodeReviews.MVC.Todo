using TodoApi;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// dependencies are added into the IServiceCollection for dependency injection
builder.Services.AddDbContext<ToDoDb>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnection"));
});


builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "ToDoApi";
    config.Title = "ToDoApi V1";
    config.Version = "V1";
});

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

// Here the app is build
var app = builder.Build();

app.UseCors("AllowAll");

if(app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    
    app.UseSwaggerUi( config =>
    {
        config.DocumentTitle = "ToDoApi";
        config.Path = "";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
        
    });
}
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/", () => "To-Do List !!");

var todoItems = app.MapGroup("/ToDoItems");

todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);


app.Run();

static async Task<IResult> GetAllTodos(ToDoDb db)
{
    return TypedResults.Ok(await db.ToDos.ToListAsync());
}

static async Task<IResult> GetCompleteTodos(ToDoDb db)
{
    return TypedResults.Ok(await db.ToDos.Where(t => t.IsComplete).ToListAsync());
}

static async Task<IResult> GetTodo(int id, ToDoDb db)
{
    return await db.ToDos.FindAsync(id)
        is ToDo todo ?
            TypedResults.Ok(todo) : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(ToDo inputTodo, ToDoDb db)
{
    db.ToDos.Add(inputTodo);
    await db.SaveChangesAsync();

    return TypedResults.Created($"/ToDoItems/{inputTodo.Id}", inputTodo);
}

static async Task<IResult> UpdateTodo(int id, ToDo inputTodo, ToDoDb db)
{
    var todo = await db.ToDos.FindAsync(id);
    if(todo == null)
    {
        return TypedResults.NotFound();
    }

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();
    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, ToDoDb db)
{
    if(await db.ToDos.FindAsync(id) is ToDo todo)
    {
        db.ToDos.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }
    return TypedResults.NotFound();
}