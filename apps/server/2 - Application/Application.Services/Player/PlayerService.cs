namespace Application.Services.Player
{
    using Data.Redis;

    public class PlayerService : IPlayerService
    {
        private IRedisClient _redisClient;

        public PlayerService(IRedisClient redisClient)
        {
            _redisClient = redisClient;
        }

        public async Task<PlayerConnectionResult> ConnectAsync(PlayerConnectionRequest playerConnectionRequest)
        {
            // Add player to the "online players" list for this tenant
            await _redisClient.SetAddAsync($"tenant:{playerConnectionRequest.TenantId}:players:online", playerConnectionRequest.PlayerId);

            // Store their current state
            await _redisClient.StringSetAsync(
                $"tenant:{playerConnectionRequest.TenantId}:player:{playerConnectionRequest.PlayerId}:state",
                "Online"
            );

            return new PlayerConnectionResult
            {
                PlayerId = playerConnectionRequest.PlayerId,
                TenantId = playerConnectionRequest.TenantId,
                State = "Online"
            };
        }

        public async Task<PlayerDisconnectionResult> DisconnectAsync(PlayerDisconnectionRequest playerDisconnectionRequest)
        {
            await _redisClient.SetRemoveAsync(
                $"tenant:{playerDisconnectionRequest.TenantId}:players:online",
                playerDisconnectionRequest.PlayerId
            );

            await _redisClient.StringSetAsync(
                $"tenant:{playerDisconnectionRequest.TenantId}:player:{playerDisconnectionRequest.PlayerId}:state",
                "Offline"
            );

            return new PlayerDisconnectionResult
            {
                PlayerId = playerDisconnectionRequest.PlayerId,
                TenantId = playerDisconnectionRequest.TenantId,
                Message = "Player disconnected successfully."
            };
        }

        public async Task<IEnumerable<string>> GetOnlinePlayersAsync(string tenantId)
        {
            return await _redisClient.SetMembersAsync($"tenant:{tenantId}:players:online");
        }
    }
}
public class PlayerConnectionRequest
{
    public string PlayerId { get; init; }
    public string TenantId { get; init; }
}

public class PlayerDisconnectionRequest
{
    public string PlayerId { get; init; }
    public string TenantId { get; init; }
}

public class PlayerDisconnectionResult
{
    public string PlayerId { get; init; }
    public string TenantId { get; init; }
    public string Message { get; init; }
}


public record PlayerConnectionResult
{
    public string PlayerId { get; init; }
    public string TenantId { get; init; }
    public string State { get; init; }
}