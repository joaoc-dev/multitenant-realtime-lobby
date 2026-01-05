using Presentation.MatchmakingWorker;
using Presentation.MatchmakingWorker.Configuration;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level}] {Message:lj}{NewLine}{Exception}"
    )
    .Enrich.WithProperty("ServiceName", "MatchmakingWorker")
    .Enrich.WithEnvironmentName()
    .Enrich.WithMachineName()
    .CreateLogger();

try
{
    Log.Information("Starting Matchmaking Worker");

    var builder = Host.CreateApplicationBuilder(args);

    // Replace default logger with Serilog
    builder.Services.AddSerilog();

    builder.Services.ConfigureDependencies();

    // Register the worker
    builder.Services.AddHostedService<Worker>();

    var host = builder.Build();
    host.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Matchmaking Worker failed to start");
}
finally
{
    Log.CloseAndFlush();
}
