using Application.Services.Player;

namespace Presentation.MatchmakingWorker
{
    // NOTE: Why IServiceScopeFactory instead of directly injecting IPlayerService?
    // 
    // ============================================================================
    // WEBAPI (PlayerController) - Framework creates controller PER REQUEST
    // ============================================================================
    // When a request comes in (e.g., GET /api/players/epic-games-123/online):
    //   1. ASP.NET Core framework creates a NEW PlayerController instance
    //   2. Framework injects scoped services (IPlayerService, IRedisClient) into constructor
    //   3. Controller handles the request
    //   4. Controller is disposed when request completes
    //   5. Next request = NEW controller instance = NEW scoped services
    //
    // This works because: Controllers are SCOPED (one per HTTP request)
    // Example: public PlayerController(IPlayerService playerService) { ... }
    //
    // ============================================================================
    // WORKER (BackgroundService) - Host creates worker ONCE at startup
    // ============================================================================
    // When the application starts:
    //   1. Host calls builder.Services.AddHostedService<Worker>()
    //   2. Host creates ONE Worker instance (SINGLETON) when app starts
    //   3. Host calls ExecuteAsync() - this runs FOREVER until app shuts down
    //   4. Same Worker instance keeps running (doesn't get recreated)
    //
    // Problem: Worker is SINGLETON (lives for entire app lifetime)
    //          IPlayerService is SCOPED (should be created/disposed per operation)
    //          Cannot inject scoped service into singleton (lifetime mismatch!)
    //
    // Solution: Inject IServiceScopeFactory (singleton) and create scopes when needed
    //           Each scope = fresh instance of scoped services, properly disposed
    public class Worker(ILogger<Worker> logger, IServiceScopeFactory serviceScopeFactory) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

                await LogPlayersByTenantIdAsync("epic-games-123");

                await Task.Delay(1000, stoppingToken);
            }
        }

        private async Task LogPlayersByTenantIdAsync(string tenantId)
        {
            // Create a scope to resolve scoped services (IPlayerService, IRedisClient, etc.)
            // The scope is disposed automatically when this method exits (using var)
            using var scope = serviceScopeFactory.CreateScope();
            var playerService = scope.ServiceProvider.GetRequiredService<IPlayerService>();

            var playersByTenantId = await playerService.GetOnlinePlayersAsync(tenantId);
            var playerList = playersByTenantId.ToList();

            logger.LogInformation(
                "Polling Redis - Tenant: {TenantId}, Players in lobby: {PlayerCount}",
                tenantId,
                playerList.Count()
            );

        }
    }
}
